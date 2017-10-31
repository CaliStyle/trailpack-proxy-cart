'use strict'

const Cron = require('trailpack-proxy-engine').Cron

module.exports = class AccountsCron extends Cron {
  /**
   * Notify of expiring sources
   */
  expired() {
    // Every Month at 5 minutes past midnight on the first day of the month Check for sources that expired
    const rule = new this.scheduler.RecurrenceRule()
    rule.minute = 5
    rule.hour = 0
    rule.dayOfMonth = 1
    // Schedule the recurring job
    this.scheduler.scheduleJob('AccountsCron.expired', rule, () => {
      this.app.services.AccountService.sourcesExpiredThisMonth()
        .catch(err => {
          this.app.log.error(err)
        })
    })
  }
  /**
   * Notify of expiring sources
   */
  willExpire() {
    // Every Month at 5 minutes past noon on the first day of the month Check for sources that will expire
    const rule = new this.scheduler.RecurrenceRule()
    rule.minute = 10
    rule.hour = 12
    rule.dayOfMonth = 1
    // Schedule the recurring job
    this.scheduler.scheduleJob('AccountsCron.willExpire', rule, () => {
      this.app.services.AccountService.sourcesWillExpireNextMonth()
        .catch(err => {
          this.app.log.error(err)
        })
    })
  }
}
