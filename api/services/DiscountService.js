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
        // Set the default
        const discountedLines = []

        // console.log('THESE COLLECTIONS',collections)
        // Loop through collection and apply discounts, stop if there are no line items
        collections.forEach(collection => {
          // console.log('PRODUCT COLLECTIONS', collection.products)
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

            // Check if Individual Scope
            const inProducts = collection.products.some(product => product.id == item.product_id)
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

