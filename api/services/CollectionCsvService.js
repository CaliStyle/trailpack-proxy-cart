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
              console.log(err)
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
              // Publish the event
              ProxyEngineService.publish('collection_upload.complete', results)
              return resolve(results)
            })
            // TODO handle this more gracefully
            .catch(err => {
              return reject(err)
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
          if (k == 'discount_product_include') {
            upload[k] = data.split(',').map(discount => {
              return discount.trim()
            })
          }
          else if (k == 'discount_product_exclude') {
            upload[k] = data.split(',').map(discount => {
              return discount.trim()
            })
          }
          else {
            upload[k] = data
          }
        }
      }
    })

    const newCollection = CollectionUpload.build(upload)
    return newCollection.save()
  }

  /**
   *
   * @param uploadId
   * @returns {Promise}
   */
  processCollectionUpload(uploadId) {
    return new Promise((resolve, reject) => {
      const CollectionUpload = this.app.orm.CollectionUpload
      let collectionsTotal = 0
      CollectionUpload.batch({
        where: {
          upload_id: uploadId
        }
      }, collections => {
        return Promise.all(collections.map(collection => {
          const create = {
            title: collection.title,
            handle: collection.handle,
            body: collection.body,
            primary_purpose: collection.primary_purpose,
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
            discount_product_exclude: collection.discount_product_exclude
          }
          return this.app.services.CollectionService.resolve(create)
        }))
          .then(results => {
            // Calculate Totals
            collectionsTotal = collectionsTotal + results.length
          })
      })
        .then(results => {
          return CollectionUpload.destroy({where: {upload_id: uploadId }})
        })
        .then(destroyed => {
          const results = {
            upload_id: uploadId,
            collections: collectionsTotal
          }
          this.app.services.ProxyEngineService.publish('collection_process.complete', results)
          return resolve(results)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }
}

