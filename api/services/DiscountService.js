/* eslint no-console: [0] */

'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const moment = require('moment')
const COLLECTION_DISCOUNT_TYPE = require('../utils/enums').COLLECTION_DISCOUNT_TYPE
const COLLECTION_DISCOUNT_SCOPE = require('../utils/enums').COLLECTION_DISCOUNT_SCOPE
/**
 * @module DiscountService
 * @description Discount Service
 */
module.exports = class DiscountService extends Service {

  create(data, options){
    return Promise.resolve(data)
  }
  update(data, options){
    return Promise.resolve(data)
  }
  destroy(data, options){
    return Promise.resolve(data)
  }

  expire(discount, options) {
    return Promise.resolve(discount)
  }
  start(discount, options) {
    return Promise.resolve(discount)
  }

  /**
   *
   * @param cart Instance
   * @returns {Promise.<TResult>}
   */
  calculate(obj, collections, resolver){
    // Set the default
    const discountedLines = []

    return resolver.resolve(obj)
      .then(obj => {

        // console.log('cart checkout', collections.map(collection => { return collection.title + ' ' + collection.id + ' ' + collection.discount_scope + ' products: ' + collection.products.length }))
        // Loop through collection and apply discounts, stop if there are no line items
        collections.forEach(collection => {
          // If object line items is empty ignore
          if (obj.line_items.length == 0) {
            return
          }
          // If the collection doesn't have a discount ignore
          if (!collection.discount_rate > 0 && !collection.percentage > 0) {
            return
          }

          // Set the default
          const discountedLine = {
            id: collection.id,
            name: collection.title,
            scope: collection.discount_scope,
            price: 0,
            lines: []
          }
          if (collection.discount_type == COLLECTION_DISCOUNT_TYPE.FIXED) {
            discountedLine.rate = collection.discount_rate
            discountedLine.type = COLLECTION_DISCOUNT_TYPE.FIXED
          }
          else if (collection.discount_type == COLLECTION_DISCOUNT_TYPE.PERCENTAGE) {
            discountedLine.percentage = collection.discount_percentage
            discountedLine.type = COLLECTION_DISCOUNT_TYPE.PERCENTAGE
          }
          // console.log('cart checkout', obj.line_items)
          // Determine Scope
          // if (collection.discount_scope == COLLECTION_DISCOUNT_SCOPE.GLOBAL) {
            // console.log('FIXED', collection.discount_type, COLLECTION_DISCOUNT_TYPE.FIXED)
          let publish = false

          const lineItems = obj.line_items.map((item, index) => {
            // Search Exclusion
            if (collection.discount_product_exclude.indexOf(item.type) > -1) {
              return item
            }
            // console.log('cart checkout products', collection.products)
            // Check if Individual Scope
            const inProducts = collection.products.some(product => product.id == item.product_id)
            // console.log('cart checkout apply individual', inProducts)
            if (collection.discount_scope == COLLECTION_DISCOUNT_SCOPE.INDIVIDUAL && inProducts == false){
              return item
            }
            // const lineDiscountedLines = item.discounted_lines
            // Set the default Discounted Line
            const lineDiscountedLine = _.omit(_.clone(discountedLine),'lines')

            if (discountedLine.type == COLLECTION_DISCOUNT_TYPE.FIXED) {
              lineDiscountedLine.price =  discountedLine.rate
            }
            else if (discountedLine.type == COLLECTION_DISCOUNT_TYPE.PERCENTAGE){
              lineDiscountedLine.price = (item.price * discountedLine.percentage)
            }

            const calculatedPrice = Math.max(0, item.calculated_price - lineDiscountedLine.price)
            const totalDeducted = Math.min(item.price,(item.price - (item.price - lineDiscountedLine.price)))
            // console.log('cart checkout', item.price, totalDeducted, calculatedPrice, lineDiscountedLine.price)
            // Publish this to the parent discounted lines
            publish = true
            item.discounted_lines.push(lineDiscountedLine)
            item.calculated_price = calculatedPrice
            item.total_discounts = item.total_discounts + totalDeducted
            discountedLine.price = discountedLine.price + totalDeducted
            discountedLine.lines.push(index)
            return item
          })
          obj.line_items = lineItems

          if (publish) {
            // Add the discounted Line
            discountedLines.push(discountedLine)
          }
        })
        obj.discounted_lines = discountedLines
        // console.log('DISCOUNTED OBJ',obj)
        return obj
      })
  }

  calculateProduct(product, collections){
    if (!product || !collections || collections.length == 0) {
      return product
    }
    // Set the default
    const discountedLines = []
    let totalDiscounts = 0

    collections.forEach(collection => {
      // If the collection doesn't have a discount ignore
      if (!collection || (!collection.discount_rate > 0 && !collection.percentage > 0)) {
        return
      }

      // Set the default
      const discountedLine = {
        id: collection.id,
        name: collection.title,
        scope: collection.discount_scope,
        price: 0
      }
      if (collection.discount_type == COLLECTION_DISCOUNT_TYPE.FIXED) {
        discountedLine.rate = collection.discount_rate
        discountedLine.type = COLLECTION_DISCOUNT_TYPE.FIXED
      }
      else if (collection.discount_type == COLLECTION_DISCOUNT_TYPE.PERCENTAGE) {
        discountedLine.percentage = collection.discount_percentage
        discountedLine.type = COLLECTION_DISCOUNT_TYPE.PERCENTAGE
      }

      if (discountedLine.type == COLLECTION_DISCOUNT_TYPE.FIXED) {
        discountedLine.price =  discountedLine.rate
      }
      else if (discountedLine.type == COLLECTION_DISCOUNT_TYPE.PERCENTAGE){
        discountedLine.price = (product.price * discountedLine.percentage)
      }

      if (collection.discount_product_exclude && collection.discount_product_exclude.indexOf(product.type) > -1) {
        return product
      }
      // console.log('cart checkout products', collection.products)
      // Check if Individual Scope
      const inProducts = collection.products && collection.products.some(colProduct => colProduct.id == product.id)
      // console.log('cart checkout apply individual', inProducts)
      if (collection.discount_scope == COLLECTION_DISCOUNT_SCOPE.INDIVIDUAL && inProducts == false){
        return product
      }

      const calculatedPrice = Math.max(0, product.calculated_price - discountedLine.price)
      const totalDeducted = Math.min(product.price,(product.price - (product.price - discountedLine.price)))
      // console.log('cart checkout', item.price, totalDeducted, calculatedPrice, lineDiscountedLine.price)
      // Publish this to the parent discounted lines
      product.calculated_price = calculatedPrice
      totalDiscounts = totalDiscounts + totalDeducted
      discountedLine.price = discountedLine.price + totalDeducted

      discountedLines.push(discountedLine)

    })

    product.discounted_lines = discountedLines
    product.total_discounts = totalDiscounts

    return product
  }

  /**
   *
   * @returns {Promise.<TResult>|*}
   */
  expireThisHour() {
    const start = moment().startOf('hour')
    const end = start.clone().endOf('hour')
    const Discount = this.app.orm['Discount']
    let discountsTotal = 0

    return Discount.batch({
      where: {
        ends_at: {
          $gte: start.format('YYYY-MM-DD HH:mm:ss'),
          $lte: end.format('YYYY-MM-DD HH:mm:ss')
        },
        active: true
      }
    }, discounts => {
      return Promise.all(discounts.map(discount => {
        return this.expire(discount)
      }))
        .then(results => {
          // Calculate Totals
          discountsTotal = discountsTotal + results.length
        })
    })
      .then(discounts => {
        const results = {
          discounts: discountsTotal
        }
        this.app.services.ProxyEngineService.publish('discount_cron.complete', results)
        return results
      })
  }

  /**
   *
   * @returns {Promise.<TResult>|*}
   */
  startThisHour() {
    const start = moment().startOf('hour')
    const end = start.clone().endOf('hour')
    const Discount = this.app.orm['Discount']
    let discountsTotal = 0

    return Discount.batch({
      where: {
        starts_at: {
          $gte: start.format('YYYY-MM-DD HH:mm:ss'),
          $lte: end.format('YYYY-MM-DD HH:mm:ss')
        },
        active: true
      }
    }, discounts => {
      const Sequelize = Discount.sequelize
      return Sequelize.Promise.mapSeries(discounts, discount => {
        return this.start(discount)
      })
        .then(results => {
          // Calculate Totals
          discountsTotal = discountsTotal + results.length
        })
    })
      .then(discounts => {
        const results = {
          discounts: discountsTotal
        }
        this.app.services.ProxyEngineService.publish('discount_cron.complete', results)
        return results
      })
  }
}

