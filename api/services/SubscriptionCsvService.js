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

    // customer is required, if not here, then reject whole row without error
    if (!upload.customer) {
      return Promise.resolve({})
    }

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
      const errors = []
      let subscriptionsTotal = 0
      SubscriptionUpload.batch({
        where: {
          upload_id: uploadId
        }
      }, (subscriptions) => {

        const Sequelize = this.app.orm.Subscription.sequelize

        return Sequelize.Promise.mapSeries(subscriptions, subscription => {
          const create = {
            customer: {
              email: subscription.customer
            },
            email: subscription.customer,
            products: subscription.products,
            interval: subscription.interval,
            unit: subscription.unit,
            active: subscription.active,
            token: subscription.token
          }
          // console.log('UPLOAD SUBSCRIPTION', create)
          return this.transformFromRow(create)
            .catch(err => {
              errors.push(err)
              return
            })
        })
          .then(results => {
            // Calculate Totals
            subscriptionsTotal = subscriptionsTotal + results.length
            return results
          })
      })
        .then(results => {
          return SubscriptionUpload.destroy({where: {upload_id: uploadId }})
        })
        .then(destroyed => {
          const results = {
            upload_id: uploadId,
            subscriptions: subscriptionsTotal,
            errors: errors
          }
          this.app.services.ProxyEngineService.publish('subscription_process.complete', results)
          return resolve(results)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }

  /**
   *
   * @param obj
   * @returns {Promise.<TResult>}
   */
  transformFromRow(obj) {
    let resCustomer, resProducts
    const resSubscription = this.app.orm['Subscription'].build(obj)
    const Customer = this.app.orm['Customer']

    return Customer.resolve(obj.customer)
      .then(customer => {
        resCustomer = customer
        return this.app.orm['Product'].findAll({
          where: {
            handle: obj.products.map(product => product.handle)
          }
        })
      })
      .then(products => {
        resProducts = products
        return Promise.all(resProducts.map(item => {
          return this.app.services.ProductService.resolveItem(item)
        }))
      })
      .then(resolvedItems => {
        return Promise.all(resolvedItems.map((item) => {
          // item = _.omit(item.get({plain: true}), [
          //   'requires_subscription',
          //   'subscription_unit',
          //   'subscription_interval'
          // ])
          return resSubscription.addLine(item, 1, [])
        }))
      })
      .then(resolvedItems => {
        resSubscription.customer_id = resCustomer.id
        return resSubscription.save()
      })
      .then(subscription => {

        const event = {
          object_id: subscription.customer_id,
          object: 'customer',
          objects: [{
            customer: subscription.customer_id
          },{
            subscription: subscription.id
          }],
          type: 'customer.subscription.subscribed',
          message: `Customer subscribed to imported subscription ${subscription.token}`,
          data: subscription
        }
        this.app.services.ProxyEngineService.publish(event.type, event, {save: true})

        return subscription
      })
  }
}

