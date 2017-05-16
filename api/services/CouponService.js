'use strict'

const Service = require('trails/service')

/**
 * @module CouponService
 * @description Coupon Service
 */
module.exports = class CouponService extends Service {
  resolve(data){}
  create(data){
    return Promise.resolve(data)
  }
  update(data){
    return Promise.resolve(data)
  }
  expire(data){}
  redeem(data){}
  validate(data){}
  calculate(obj, collections, resolver){
    return resolver.resolve(obj)
      .then(obj => {
        obj.coupon_lines = []
        return obj
      })
  }
}

