'use strict'

const Service = require('trails/service')
const moment = require('moment')

/**
 * @module CouponService
 * @description Coupon Service
 */
module.exports = class CouponService extends Service {
  // TODO
  create(coupon, options){
    options = options || {}
    return Promise.resolve(coupon)
  }
  // TODO
  update(coupon, options){
    options = options || {}
    return Promise.resolve(coupon)
  }
  // TODO
  destroy(coupon, options){
    options = options || {}
    return Promise.resolve(coupon)
  }
  // TODO
  expire(coupon, options){
    options = options || {}
    return Promise.resolve(coupon)
  }
  // TODO
  redeem(coupon, options){
    options = options || {}
    return Promise.resolve(coupon)
  }
  // TODO
  validate(coupon, options){
    options = options || {}
    return Promise.resolve(coupon)
  }

  /**
   *
   * @param obj
   * @param collections
   * @param resolver
   * @param options
   * @returns {Promise.<T>}
   */
  // TODO
  calculate(obj, collections, resolver, options){
    options = options || {}
    return resolver.resolve(obj, {transaction: options.transaction || null})
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
      const Sequelize = Coupon.sequelize
      return Sequelize.Promise.mapSeries(coupons, coupon => {
        return this.expire(coupon)
      })
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

