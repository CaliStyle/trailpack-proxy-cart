'use strict'

const Service = require('trails/service')

/**
 * @module CouponService
 * @description Coupon Service
 */
module.exports = class CouponService extends Service {
  resolve(data){}
  create(data){}
  expire(data){}
  redeem(data){}
  validate(data){}
  calculate(cart){
    return this.app.services.CartService.resolve(cart)
      .then(cart => {
        return []
      })
  }
}

