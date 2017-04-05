/* eslint no-console: [0] */

'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const COLLECTION_DISCOUNT_TYPE = require('../utils/enums').COLLECTION_DISCOUNT_TYPE
const COLLECTION_DISCOUNT_SCOPE = require('../utils/enums').COLLECTION_DISCOUNT_SCOPE
/**
 * @module DiscountService
 * @description Discount Service
 */
module.exports = class DiscountService extends Service {
  /**
   *
   * @param cart Instance
   * @returns {Promise.<TResult>}
   */
  calculate(obj, collections, resolver){
    return resolver.resolve(obj)
      .then(obj => {
        const discountedLines = []

        // console.log('THESE COLLECTIONS',collections)
        // Loop through collection and apply discounts, stop if there are no line items
        collections.forEach(collection => {
          // console.log('PRODUCT COLLECTIONS', collection.products)
          if (obj.line_items.length == 0) {
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
          if (!collection.discount_rate > 0 && !collection.percentage > 0) {
            return
          }
          if (collection.discount_scope == COLLECTION_DISCOUNT_SCOPE.GLOBAL) {
            // console.log('FIXED', collection.discount_type, COLLECTION_DISCOUNT_TYPE.FIXED)
            if (collection.discount_type == COLLECTION_DISCOUNT_TYPE.FIXED) {
              discountedLine.rate = collection.discount_rate
              discountedLine.type = COLLECTION_DISCOUNT_TYPE.FIXED
            }
            else if (collection.discount_type == COLLECTION_DISCOUNT_TYPE.PERCENTAGE) {
              discountedLine.percentage = collection.discount_percentage
              discountedLine.type = COLLECTION_DISCOUNT_TYPE.PERCENTAGE
            }
            let publish = false
            obj.line_items = _.clone(obj.line_items.map((item, index) => {
              // const product = collection.products.filter(product => product.id == item.product_id)[0]
              // Search Exclusion
              if (collection.discount_product_exclude.indexOf(item.type) > -1) {
                return item
              }
              const lineDiscountedLine = _.omit(_.clone(discountedLine),'lines')

              if (discountedLine.type == COLLECTION_DISCOUNT_TYPE.FIXED) {
                lineDiscountedLine.price =  discountedLine.rate
              }
              else if (discountedLine.type == COLLECTION_DISCOUNT_TYPE.PERCENTAGE){
                lineDiscountedLine.price = (item.price * discountedLine.percentage)
              }

              publish = true

              item.discounted_lines.push(lineDiscountedLine)
              item.calculated_price = Math.max(0, item.calculated_price - lineDiscountedLine.price)
              item.total_discounts = item.total_discounts + (lineDiscountedLine.price)
              discountedLine.price = discountedLine.price + lineDiscountedLine.price
              discountedLine.lines.push(index)
              return item
            }))

            if (publish) {
              // Add the discounted Line
              discountedLines.push(discountedLine)
            }
          }
          else if (collection.discount_scope == COLLECTION_DISCOUNT_SCOPE.INDIVIDUAL) {
            if (collection.discount_type == COLLECTION_DISCOUNT_TYPE.FIXED) {
              discountedLine.rate = collection.discount_rate
              discountedLine.type = COLLECTION_DISCOUNT_TYPE.FIXED
            }
            else if (collection.discount_type == COLLECTION_DISCOUNT_TYPE.PERCENTAGE) {
              discountedLine.percentage = collection.discount_percentage
              discountedLine.type = COLLECTION_DISCOUNT_TYPE.PERCENTAGE
            }
            const lineDiscountedLine = _.omit(_.clone(discountedLine),'lines')
            let publish = false
            obj.line_items = _.clone(obj.line_items.map((item, index) => {
              const product = collection.products.filter(product => product.id == item.product_id)[0]
              if (!product) {
                return item
              }
              if (collection.discount_product_exclude.indexOf(item.type) > -1) {
                return item
              }
              if (discountedLine.type == COLLECTION_DISCOUNT_TYPE.FIXED) {
                lineDiscountedLine.price =  discountedLine.rate
              }
              else if (discountedLine.type == COLLECTION_DISCOUNT_TYPE.PERCENTAGE){
                lineDiscountedLine.price = (item.price * discountedLine.percentage)
              }

              publish = true

              item.discounted_lines.push(lineDiscountedLine)
              item.calculated_price = Math.max(0, item.calculated_price - lineDiscountedLine.price)
              item.total_discounts = item.total_discounts + (lineDiscountedLine.price)
              discountedLine.price = discountedLine.price + lineDiscountedLine.price
              discountedLine.lines.push(index)
              return item
            }))

            if (publish) {
              // Add the discounted Line
              discountedLines.push(discountedLine)
            }
          }

        })
        obj.discounted_lines = discountedLines
        // console.log('DISCOUNTED OBJ',obj)
        return obj
      })
  }

  calculateProduct(product, collections){
    // Set to original price in case it's already set
    product.calculated_price = product.price

    collections.forEach(collection => {
      if (collection.discount_scope == COLLECTION_DISCOUNT_SCOPE.GLOBAL) {
        // console.log('FIXED', collection.discount_type, COLLECTION_DISCOUNT_TYPE.FIXED)
        if (collection.discount_type == COLLECTION_DISCOUNT_TYPE.FIXED) {
          product.calculated_price = product.calculated_price - collection.rate
        }
        else if (collection.discount_type == COLLECTION_DISCOUNT_TYPE.PERCENTAGE) {
          product.calculated_price = product.calculated_price - (product.price * collection.percentage)
        }
      }
      // else if (collection.discount_scope == COLLECTION_DISCOUNT_SCOPE.INDIVIDUAL) {
      //   if (collection.discount_type == COLLECTION_DISCOUNT_TYPE.FIXED) {
      //
      //   }
      //   else if(collection.discount_type == COLLECTION_DISCOUNT_TYPE.PERCENTAGE) {
      //
      //   }
      // }
    })
    return product
  }
}

