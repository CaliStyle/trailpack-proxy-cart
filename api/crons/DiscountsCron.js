'use strict'

const Cron = require('trailpack-proxy-engine').Cron

module.exports = class DiscountsCron extends Cron {
  start() {
    // Every Hour Check for discount that start
    const rule = new this.scheduler.RecurrenceRule()
    rule.minute = 0
    // Schedule the recurring job
    this.scheduler.scheduleJob('DiscountsCron.start', rule, () => {
      this.app.services.DiscountService.startThisHour()
    })
  }
  expire() {
    // Every Hour Check for discount expires
    const rule = new this.scheduler.RecurrenceRule()
    rule.minute = 0
    // Schedule the recurring job
    this.scheduler.scheduleJob('DiscountsCron.expire', rule, () => {
      this.app.services.DiscountService.expireThisHour()
    })
  }
}
