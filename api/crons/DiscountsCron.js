'use strict'

const Cron = require('trailpack-proxy-engine').Cron

module.exports = class DiscountsCron extends Cron {
  start() {
    // Every Hour Check for discounts that start
    const rule = new this.scheduler.RecurrenceRule()
    rule.minute = 0
    rule.hour = 24
    // Schedule the recurring job
    this.scheduler.scheduleJob('DiscountsCron.start', rule, () => {
      this.app.services.DiscountService.startThisHour()
        .catch(err => {
          this.app.log.error(err)
        })
    })
  }
  expire() {
    // Every Hour Check for discounts that should expire
    const rule = new this.scheduler.RecurrenceRule()
    rule.minute = 0
    rule.hour = 24
    // Schedule the recurring job
    this.scheduler.scheduleJob('DiscountsCron.expire', rule, () => {
      this.app.services.DiscountService.expireThisHour()
        .catch(err => {
          this.app.log.error(err)
        })
    })
  }
}
