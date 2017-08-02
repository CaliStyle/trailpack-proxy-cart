/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const csvParser = require('babyparse')
const _ = require('lodash')
const shortid = require('shortid')
const fs = require('fs')
const COLLECTION_UPLOAD = require('../utils/enums').COLLECTION_UPLOAD

/**
 * @module CollectionCsvService
 * @description Collection Csv Service
 */
module.exports = class CollectionCsvService extends Service {
  /**
   *
   * @param file
   * @returns {Promise}
   */
  collectionCsv(file) {
    // TODO validate csv
    console.time('csv')
    const uploadID = shortid.generate()
    const ProxyEngineService = this.app.services.ProxyEngineService
    const errors = []
    return new Promise((resolve, reject)=>{
      const options = {
        header: true,
        dynamicTyping: true,
        step: (results, parser) => {
          // console.log(parser)
          // console.log('Row data:', results.data)
          // TODO handle errors
          // console.log('Row errors:', results.errors)
          parser.pause()
          return this.csvCollectionRow(results.data[0], uploadID)
            .then(row => {
              parser.resume()
            })
            .catch(err => {
              this.app.log.error('ROW ERROR', err)
              errors.push(err.message)
              parser.resume()
            })
        },
        complete: (results, file) => {
          console.timeEnd('csv')
          // console.log('Parsing complete:', results, file)
          results.upload_id = uploadID
          ProxyEngineService.count('CollectionUpload', { where: { upload_id: uploadID }})
            .then(count => {
              results.collections = count
              results.errors = errors
              // Publish the event
              ProxyEngineService.publish('collection_upload.complete', results)
              return resolve(results)
            })
            .catch(err => {
              errors.push(err.message)
              results.errors = errors
              return resolve(results)
            })
        },
        error: (err, file) => {
          return reject(err)
        }
      }
      const fileString = fs.readFileSync(file, 'utf8')
      // Parse the CSV/TSV
      csvParser.parse(fileString, options)
    })
  }

  /**
   *
   * @param row
   * @param uploadID
   */
  csvCollectionRow(row, uploadID) {
    return Promise.resolve()
      .then(() => {
        // console.log(row)
        const CollectionUpload = this.app.orm.CollectionUpload
        const values = _.values(COLLECTION_UPLOAD)
        const keys = _.keys(COLLECTION_UPLOAD)
        const upload = {
          upload_id: uploadID,
          options: {}
        }

        _.each(row, (data, key) => {
          if (data === '') {
            row[key] = null
          }
        })

        row = _.omitBy(row, _.isNil)

        if (_.isEmpty(row)) {
          return Promise.resolve({})
        }

        _.each(row, (data, key) => {
          if (data !== '') {
            const i = values.indexOf(key.replace(/^\s+|\s+$/g, ''))
            const k = keys[i]
            if (i > -1 && k) {
              if (k == 'handle') {
                upload[k] = this.app.services.ProxyCartService.safeHandle(data)
              }
              else if (k == 'title') {
                upload[k] = data.toString().trim()
              }
              else if (k == 'discount_product_include') {
                upload[k] = data.split(',').map(discount => {
                  return discount.trim()
                })
              }
              else if (k == 'discount_product_exclude') {
                upload[k] = data.split(',').map(discount => {
                  return discount.trim()
                })
              }
              else if (k == 'collections') {
                upload[k] = data.split(',').map(collection => {
                  return collection.trim()
                })
              }
              else if (k == 'images') {
                upload[k] = data.split(',').map(images => {
                  return images.trim()
                })
              }
              else if (k == 'images_alt') {
                upload[k] = data.split(',').map(images => {
                  return images.trim()
                })
              }
              else {
                upload[k] = data
              }
            }
          }
        })

        // Map images
        upload.images = _.map(upload.images, (image, index) => {
          return {
            src: image,
            alt: upload.images_alt ? upload.images_alt[index] : ''
          }
        })

        // If not collection handle, resolve without doing anything or throwing an error
        if (!upload.handle) {
          return Promise.resolve({})
        }
        else {
          const newCollection = CollectionUpload.build(upload)
          return newCollection.save()
        }
      })
  }

  /**
   *
   * @param uploadId
   * @param options
   * @returns {Promise}
   */
  processCollectionUpload(uploadId, options) {
    options = options || {}
    const CollectionUpload = this.app.orm.CollectionUpload
    let collectionsTotal = 0, errorsCount = 0
    const errors = []
    return CollectionUpload.batch({
      where: {
        upload_id: uploadId
      },
      transaction: options.transaction || null
    }, collections => {

      const Sequelize = this.app.orm.Collection.sequelize

      return Sequelize.Promise.mapSeries(collections, collection => {

        const create = {
          title: collection.title,
          handle: collection.handle,
          body: collection.body,
          primary_purpose: collection.primary_purpose,
          position: collection.position,
          sort_order: collection.sort_order,
          published: collection.published,
          tax_rate: collection.tax_rate,
          tax_percentage: collection.tax_percentage,
          tax_type: collection.tax_type,
          tax_name: collection.tax_name,
          discount_scope: collection.discount_scope,
          discount_type: collection.discount_type,
          discount_rate: collection.discount_rate,
          discount_percentage: collection.discount_percentage,
          discount_product_include: collection.discount_product_include,
          discount_product_exclude: collection.discount_product_exclude,
          collections: collection.collections,
          images: collection.images
        }
        return this.app.services.CollectionService.add(create, {transaction: options.transaction || null})
          .then(() => {
            collectionsTotal++
            return
          })
          .catch(err => {
            errorsCount++
            errors.push(`${collection.handle}: ${err.message}`)
            return err
          })
      })
    })
      .then(() => {
        return CollectionUpload.destroy({where: {upload_id: uploadId }})
          .catch(err => {
            errorsCount++
            errors.push(err.message)
            return err
          })
      })
      .then(destroyed => {
        const results = {
          upload_id: uploadId,
          collections: collectionsTotal,
          errors: errors,
          errors_count: errorsCount
        }
        this.app.services.ProxyEngineService.publish('collection_process.complete', results)
        return results
      })
  }
}

