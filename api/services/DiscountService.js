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
  resolve(discount){}

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
    // TODO Guarentee that only connected collections are populated
    return this.app.services.CartService.resolve(cart)
      .then(cart => {

        // Set back to default
        const discountedLines = []
        cart.discounted_lines = []
        cart.line_items = cart.line_items.map(item => {
          item.discounted_lines = []
          item.total_discounts = 0
          item.calculated_price = item.price
          return item
        })
        // console.log('THESE COLLECTIONS',collections)
        // Loop through collection and apply discounts
        collections.forEach(collection => {
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
            // Add the discounted Line
            discountedLines.push(discountedLine)

          }
          // console.log('THIS DISCOUNTED',cart.discounted_lines)
          // else if (collection.discount_scope == COLLECTION_DISCOUNT_SCOPE.INDIVIDUAL) {
          //   if (collection.discount_type == COLLECTION_DISCOUNT_TYPE.FIXED) {
          //
          //   }
          //   else if(collection.discount_type == COLLECTION_DISCOUNT_TYPE.PERCENTAGE) {
          //
          //   }
          // }
        })
        cart.discounted_lines = discountedLines
        // console.log(cart)
        return cart
      })
  }
}

