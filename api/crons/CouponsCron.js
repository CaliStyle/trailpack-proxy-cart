'use strict'

const Cron = require('trailpack-proxy-engine').Cron

module.exports = class ExpireCouponsCron extends Cron {
  /**
   * Expire Coupons
   */
  expire() {
    // Every Hour Check for coupons that expire
    const rule = new this.schedule.RecurrenceRule()
    rule.minute = 0
    // Schedule the recurring job
    this.schedule.scheduleJob(rule, function(){
      this.app.services.CouponService.expireThisHour()
    })
  }
}
