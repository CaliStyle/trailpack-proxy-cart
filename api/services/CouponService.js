'use strict'

const Service = require('trails/service')
const moment = require('moment')

/**
 * @module CouponService
 * @description Coupon Service
 */
module.exports = class CouponService extends Service {
  // TODO
  resolve(coupon){
    return Promise.resolve(coupon)
  }
  // TODO
  create(coupon){
    return Promise.resolve(coupon)
  }
  // TODO
  update(coupon){
    return Promise.resolve(coupon)
  }
  // TODO
  destroy(coupon){
    return Promise.resolve(coupon)
  }
  // TODO
  expire(coupon, options){
    if (!options) {
      options = {}
    }
    return Promise.resolve(coupon)
  }
  // TODO
  redeem(coupon, options){
    if (!options) {
      options = {}
    }
    return Promise.resolve(coupon)
  }
  // TODO
  validate(coupon, options){
    if (!options) {
      options = {}
    }
    return Promise.resolve(coupon)
  }

  calculate(obj, collections, resolver){
    return resolver.resolve(obj)
      .then(obj => {
        obj.coupon_lines = []
        return obj
      })
  }

  /**
   *
   * @returns {Promise.<TResult>|*}
   */
  expireThisHour() {
    const start = moment().startOf('hour')
    const end = start.clone().endOf('hour')
    const Coupon = this.app.orm['Coupon']
    let couponsTotal = 0

    return Coupon.batch({
      where: {
        expires_on: {
          $gte: start.format('YYYY-MM-DD HH:mm:ss'),
          $lte: end.format('YYYY-MM-DD HH:mm:ss')
        },
        active: true
      }
    }, coupons => {
      return Promise.all(coupons.map(coupon => {
        return this.expire(coupon)
      }))
        .then(results => {
          // Calculate Totals
          couponsTotal = couponsTotal + results.length
        })
    })
      .then(coupons => {
        const results = {
          coupons: couponsTotal
        }
        this.app.services.ProxyEngineService.publish('coupon_cron.complete', results)
        return results
      })
  }
}

