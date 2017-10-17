'use strict'

const Cron = require('trailpack-proxy-engine').Cron

module.exports = class ExpireCouponsCron extends Cron {
  /**
   * Expire Coupons
   */
  expire() {
    // Every Hour Check for coupons that expire
    const rule = new this.scheduler.RecurrenceRule()
    rule.minute = 0
    // Schedule the recurring job
    this.scheduler.scheduleJob('CouponsCron.expire', rule, () => {
      this.app.services.CouponService.expireThisHour()
    })
  }
}
