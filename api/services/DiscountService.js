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
  calculate(cart, collections){
    // const Collection = this.app.orm['Collection']
    // const ItemCollection = this.app.orm['ItemCollection']
    // const Product = this.app.orm['Product']
    // const productIds = []
    // const customerIds = []
    // console.log('DISCOUNTING COLLECTIONS',collections)
    return this.app.services.CartService.resolve(cart)
      .then(cart => {
        const discountedLines = []

        // console.log('THESE COLLECTIONS',collections)
        // Loop through collection and apply discounts, stop if there are no line items
        collections.forEach(collection => {
          // console.log('PRODUCT COLLECTIONS', collection.products)
          if (cart.line_items.length == 0) {
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

            cart.line_items = _.clone(cart.line_items.map((item, index) => {

              const lineDiscountedLine = _.omit(_.clone(discountedLine),'lines')

              if (discountedLine.type == COLLECTION_DISCOUNT_TYPE.FIXED) {
                lineDiscountedLine.price =  discountedLine.rate
              }
              else if (discountedLine.type == COLLECTION_DISCOUNT_TYPE.PERCENTAGE){
                lineDiscountedLine.price = (item.price * discountedLine.percentage)
              }
              // console.log(lineDiscountedLine)

              item.discounted_lines.push(lineDiscountedLine)
              item.calculated_price = Math.max(0, item.calculated_price - lineDiscountedLine.price)
              item.total_discounts = item.total_discounts + (lineDiscountedLine.price)
              discountedLine.price = discountedLine.price + lineDiscountedLine.price
              discountedLine.lines.push(index)
              return item
            }))
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

            cart.line_items = _.clone(cart.line_items.map((item, index) => {

              if (collection.products.filter(product => product.id == item.product_id).length == 0) {
                return item
              }

              if (discountedLine.type == COLLECTION_DISCOUNT_TYPE.FIXED) {
                lineDiscountedLine.price =  discountedLine.rate
              }
              else if (discountedLine.type == COLLECTION_DISCOUNT_TYPE.PERCENTAGE){
                lineDiscountedLine.price = (item.price * discountedLine.percentage)
              }

              item.discounted_lines.push(lineDiscountedLine)
              item.calculated_price = Math.max(0, item.calculated_price - lineDiscountedLine.price)
              item.total_discounts = item.total_discounts + (lineDiscountedLine.price)
              discountedLine.price = discountedLine.price + lineDiscountedLine.price
              discountedLine.lines.push(index)
              return item
            }))
          }

          // Add the discounted Line
          discountedLines.push(discountedLine)

        })
        cart.discounted_lines = discountedLines
        // console.log('DISCOUNTED CART',cart)
        return cart
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

