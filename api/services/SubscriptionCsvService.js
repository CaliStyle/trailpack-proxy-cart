/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const csvParser = require('babyparse')
const _ = require('lodash')
const shortid = require('shortid')
const fs = require('fs')
const SUBSCRIPTION_UPLOAD = require('../utils/enums').SUBSCRIPTION_UPLOAD

/**
 * @module SubscriptionCsvService
 * @description Subscription Csv Service
 */
module.exports = class SubscriptionCsvService extends Service {
  /**
   *
   * @param file
   * @returns {Promise}
   */
  subscriptionCsv(file) {
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
          return this.csvSubscriptionRow(results.data[0], uploadID)
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
          ProxyEngineService.count('SubscriptionUpload', { where: { upload_id: uploadID }})
            .then(count => {
              results.subscriptions = count
              // Publish the event
              ProxyEngineService.publish('subscription_upload.complete', results)
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
  csvSubscriptionRow(row, uploadID) {
    // console.log(row)
    const SubscriptionUpload = this.app.orm.SubscriptionUpload
    const values = _.values(SUBSCRIPTION_UPLOAD)
    const keys = _.keys(SUBSCRIPTION_UPLOAD)
    const upload = {
      upload_id: uploadID,
      options: {}
    }

    _.each(row, (data, key) => {
      if (data !== '') {
        const i = values.indexOf(key.replace(/^\s+|\s+$/g, ''))
        const k = keys[i]
        if (i > -1 && k) {
          if (k == 'products') {
            upload[k] = data.split(',').map(product => { return product.trim()})
          }
          else {
            upload[k] = data
          }
        }
      }
    })

    upload.products = _.map(upload.products, (handle, index) => {
      return {
        handle: handle
      }
    })

    const newSubscription = SubscriptionUpload.build(upload)
    return newSubscription.save()
  }

  /**
   *
   * @param uploadId
   * @returns {Promise}
   */
  processSubscriptionUpload(uploadId) {
    return new Promise((resolve, reject) => {
      const SubscriptionUpload = this.app.orm.SubscriptionUpload
      let subscriptionsTotal = 0
      SubscriptionUpload.batch({
        where: {
          upload_id: uploadId
        }
      }, subscriptions => {
        return Promise.all(subscriptions.map(subscription => {

          const create = {
            customer: subscription.customer,
            products: subscription.products,
            interval: subscription.interval,
            unit: subscription.unit,
            active: subscription.active
          }
          // console.log('UPLOAD ADDRESS', create.shipping_address, create.billing_address)
          return this.app.services.SubscriptionService.create(create)
        }))
          .then(results => {
            // Calculate Totals
            subscriptionsTotal = subscriptionsTotal + results.length
          })
      })
        .then(results => {
          return SubscriptionUpload.destroy({where: {upload_id: uploadId }})
        })
        .then(destroyed => {
          const results = {
            upload_id: uploadId,
            subscriptions: subscriptionsTotal
          }
          this.app.services.ProxyEngineService.publish('subscription_process.complete', results)
          return resolve(results)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }
}

