/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const csvParser = require('babyparse')
const _ = require('lodash')
const shortid = require('shortid')
const fs = require('fs')
const ORDER_UPLOAD = require('../utils/enums').ORDER_UPLOAD

/**
 * @module OrderCsvService
 * @description Order CSV Service
 */
module.exports = class OrderCsvService extends Service {
  /**
   *
   * @param file
   * @returns {Promise}
   */
  orderCsv(file) {
    // TODO validate csv
    console.time('csv')
    const uploadID = shortid.generate()
    const ProxyEngineService = this.app.services.ProxyEngineService
    const errors = []
    let errorsCount = 0

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
          return this.csvOrderRow(results.data[0], uploadID)
            .then(row => {
              parser.resume()
            })
            .catch(err => {
              this.app.log.error(err)
              errorsCount++
              errors.push(err.message)
              parser.resume()
            })
        },
        complete: (results, file) => {
          console.timeEnd('csv')
          // console.log('Parsing complete:', results, file)
          results.upload_id = uploadID
          ProxyEngineService.count('OrderUpload', { where: { upload_id: uploadID }})
            .then(count => {
              results.orders = count
              results.errors_count = errorsCount
              results.errors = errors
              // Publish the event
              ProxyEngineService.publish('order_upload.complete', results)
              return resolve(results)
            })
            .catch(err => {
              errorsCount++
              errors.push(err.message)
              results.errors_count = errorsCount
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
  csvOrderRow(row, uploadID) {
    // console.log(row)
    const OrderUpload = this.app.orm.OrderUpload
    const values = _.values(ORDER_UPLOAD)
    const keys = _.keys(ORDER_UPLOAD)
    const upload = {
      upload_id: uploadID,
      options: {}
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

    const newOrder = OrderUpload.build(upload)

    return newOrder.save()
  }

  /**
   *
   * @param uploadId
   * @returns {Promise}
   */
  processOrderUpload(uploadId) {
    return new Promise((resolve, reject) => {
      const OrderUpload = this.app.orm.OrderUpload
      let ordersTotal = 0
      OrderUpload.batch({
        where: {
          upload_id: uploadId
        }
      }, orders => {
        const Sequelize = this.app.orm.Product.sequelize
        return Sequelize.Promise.mapSeries(orders, order => {
          const create = {
            customer: {
              email: order.customer
            },
            email: order.customer,
            status: order.status,
            shipping_address: {},
            billing_address: {}
          }
          _.each(order.get({plain: true}), (value, key) => {
            if (key.indexOf('shipping_') > -1) {
              const newKey = key.replace('shipping_', '')
              if (value && value != '') {
                create.shipping_address[newKey] = value
              }
            }
            if (key.indexOf('billing_') > -1) {
              const newKey = key.replace('billing_', '')
              if (value && value != '') {
                create.billing_address[newKey] = value
              }
            }
          })
          if (_.isEmpty(create.shipping_address)) {
            delete create.shipping_address
          }
          if (_.isEmpty(create.billing_address)) {
            delete create.billing_address
          }
          // console.log('UPLOAD ORDER', create)
          return this.transformFromRow(create)
        })
          .then(results => {
            // Calculate Totals
            ordersTotal = ordersTotal + results.length
            return results
          })
      })
        .then(results => {
          return OrderUpload.destroy({where: {upload_id: uploadId }})
        })
        .then(destroyed => {
          const results = {
            upload_id: uploadId,
            orders: ordersTotal
          }
          this.app.services.ProxyEngineService.publish('order_process.complete', results)
          return resolve(results)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }

  transformFromRow(obj, options) {
    options = options || {}
    const resOrder = this.app.orm['Order'].build()
    const Customer = this.app.orm['Customer']
    const Product = this.app.orm['Product']
    let resCustomer, resProducts

    return Customer.resolve(obj.customer, {transaction: options.transaction || null})
      .then(customer => {
        resCustomer = customer
        return Product.findAll({
          where: {
            handle: obj.products.map(product => product.handle)
          },
          transaction: options.transaction || null
        })
      })
      .then(products => {
        resProducts = products
        return Product.sequelize.Promise.mapSeries(resProducts, item => {
          return this.app.services.ProductService.resolveItem(item, {transaction: options.transaction || null})
        })
      })
      .then(resolvedItems => {
        return Product.sequelize.Promise.mapSeries(resolvedItems, (item) => {
          // item = _.omit(item.get({plain: true}), [
          //   'requires_order',
          //   'order_unit',
          //   'order_interval'
          // ])
          return resOrder.addLine(item, 1, [], {transaction: options.transaction || null})
        })
      })
      .then(resolvedItems => {
        resOrder.customer_id = resCustomer.id
        return resOrder.save({transaction: options.transaction || null})
      })
      .then(order => {

        const event = {
          object_id: order.customer_id,
          object: 'customer',
          type: 'customer.order.created',
          message: 'Imported Order Created',
          data: order
        }
        this.app.services.ProxyEngineService.publish(event.type, event, {
          save: true,
          transaction: options.transaction || null
        })
        return order
      })
  }
}

