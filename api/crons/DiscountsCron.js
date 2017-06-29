'use strict'

const Cron = require('trailpack-proxy-engine').Cron

module.exports = class ExpireDiscountsCron extends Cron {
  start() {
    // Every Hour Check for discount that start
    const rule = new this.schedule.RecurrenceRule()
    rule.minute = 0
    // Schedule the recurring job
    this.schedule.scheduleJob('DiscountsCron.start', rule, () => {
      this.app.services.DiscountService.startThisHour()
    })
  }
  expire() {
    // Every Hour Check for discount expires
    const rule = new this.schedule.RecurrenceRule()
    rule.minute = 0
    // Schedule the recurring job
    this.schedule.scheduleJob('DiscountsCron.start', rule, () => {
      this.app.services.DiscountService.expireThisHour()
    })
  }
}
