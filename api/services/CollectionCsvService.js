/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const csvParser = require('papaparse')
const _ = require('lodash')
const shortid = require('shortid')
const fs = require('fs')
const COLLECTION_UPLOAD = require('../../lib').Enums.COLLECTION_UPLOAD

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
    console.time('csv')
    const uploadID = shortid.generate()
    const ProxyEngineService = this.app.services.ProxyEngineService
    const errors = []
    let errorsCount = 0, lineNumber = 1

    return new Promise((resolve, reject)=>{
      const options = {
        header: true,
        dynamicTyping: true,
        encoding: 'utf-8',
        step: (results, parser) => {
          parser.pause()
          lineNumber ++
          return this.csvCollectionRow(results.data[0], uploadID)
            .then(row => {
              parser.resume()
            })
            .catch(err => {
              this.app.log.error('ROW ERROR', err)
              errorsCount++
              errors.push(`Line ${lineNumber}: ${err.message}`)
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
              results.errors_count = errorsCount
              // Publish the event
              ProxyEngineService.publish('collection_upload.complete', results)
              return resolve(results)
            })
            .catch(err => {
              errorsCount++
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
          options: {},
          images: [],
          collections: [],
          tags: []
        }

        _.each(row, (data, key) => {
          if (typeof(data) === 'undefined' || data === '') {
            row[key] = null
          }
        })

        row = _.omitBy(row, _.isNil)

        if (_.isEmpty(row)) {
          return Promise.resolve({})
        }

        _.each(row, (data, key) => {
          if (typeof(data) !== 'undefined' && data !== null && data !== '') {
            const i = values.indexOf(key.replace(/^\s+|\s+$/g, ''))
            const k = keys[i]
            if (i > -1 && k) {
              if (k === 'handle') {
                upload[k] = this.app.services.ProxyCartService.splitHandle(data.toString())
              }
              else if (k === 'title') {
                upload[k] = this.app.services.ProxyCartService.title(data)
              }
              else if (k === 'description') {
                upload[k] = this.app.services.ProxyCartService.description(data)
              }
              else if (k === 'seo_title') {
                upload[k] = this.app.services.ProxyCartService.title(data)
              }
              else if (k === 'seo_description') {
                upload[k] = this.app.services.ProxyCartService.description(data)
              }
              else if (k === 'discount_product_include') {
                upload[k] = data.toString().split(',').map(discount => {
                  return discount.trim()
                })
              }
              else if (k === 'discount_product_exclude') {
                upload[k] = data.toString().split(',').map(discount => {
                  return discount.trim()
                })
              }
              else if (k === 'collections') {
                upload[k] = data.toString().split(',').map(collection => {
                  return collection.trim()
                })
              }
              else if (k === 'images') {
                upload[k] = data.toString().split(',').map(images => {
                  return images.trim()
                })
              }
              else if (k === 'images_alt') {
                upload[k] = data.toString().split('|').map(images => {
                  return images.trim()
                })
              }
              else if (k === 'tags') {
                upload[k] = _.uniq(data.toString().split(',').map(tag => {
                  return tag.toLowerCase().trim()
                }))
              }
              else {
                upload[k] = data
              }
            }
          }
        })

        // Map images
        upload.images = upload.images.map((image, index) => {
          return {
            src: image,
            alt: upload.images_alt ? upload.images_alt[index] || null : ''
          }
        })
        upload.images = upload.images.filter(image => image)

        // Map Collections
        upload.collections = upload.collections.map(collection => {
          return {
            handle: this.app.services.ProxyCartService.splitHandle(collection),
            title: collection
          }
        })
        // Filer out undefined
        upload.collections = upload.collections.filter(collection => collection)
        // Get only Unique handles
        upload.collections = _.uniqBy(upload.collections, 'handle')

        // Map tags
        upload.tags = upload.tags.map(tag => {
          if (tag !== '') {
            return {
              name: this.app.services.ProxyCartService.name(tag)
            }
          }
        })
        // Filter out undefined tags
        upload.tags = upload.tags.filter(tag => tag)
        // Get only Unique names
        upload.tags = _.uniqBy(upload.tags, 'name')

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

      return this.app.orm.Collection.sequelize.Promise.mapSeries(collections, collection => {

        let create = {
          handle: collection.handle,
          title: collection.title,
          description: collection.description,
          seo_title: collection.seo_title,
          seo_description: collection.seo_description,
          excerpt: collection.excerpt,
          body: collection.body,
          primary_purpose: collection.primary_purpose,
          position: collection.position,
          sort_order: collection.sort_order,
          published: collection.published,
          tax_rate: collection.tax_rate,
          tax_percentage: collection.tax_percentage,
          tax_type: collection.tax_type,
          tax_name: collection.tax_name,
          shipping_rate: collection.shipping_rate,
          shipping_percentage: collection.shipping_percentage,
          shipping_type: collection.shipping_type,
          shipping_name: collection.shipping_name,
          discount_scope: collection.discount_scope,
          discount_status: collection.discount_status,
          discount_type: collection.discount_type,
          discount_rate: collection.discount_rate,
          discount_percentage: collection.discount_percentage,
          discount_product_include: collection.discount_product_include,
          discount_product_exclude: collection.discount_product_exclude,
          collections: collection.collections,
          images: collection.images,
          tags: collection.tags
        }

        create = _.omitBy(create, _.isNil)

        return this.app.services.CollectionService.add(create, {transaction: options.transaction || null})
          .then((createdCollection) => {
            if (!createdCollection) {
              throw new Error(`${collection.handle} was not created`)
            }
            collectionsTotal++
            return
          })
          .catch(err => {
            this.app.log.error(err)
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
          errors_count: errorsCount,
          errors: errors
        }
        this.app.services.ProxyEngineService.publish('collection_process.complete', results)
        return results
      })
  }
}

