'use strict'

const Cron = require('trailpack-proxy-engine').Cron

module.exports = class AccountsCron extends Cron {
  /**
   * Notify of expiring sources
   */
  expired() {
    // Every Month at 5 minutes past midnight on the first day of the month Check for sources that expired
    const rule = '0 5 0 1 * *'
    // const rule = new this.scheduler.RecurrenceRule()
    // rule.month = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    // rule.dayOfWeek = 1
    // rule.hour = 0
    // rule.minute = 10


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
    const rule = '0 5 0 1 * *'
    // const rule = new this.scheduler.RecurrenceRule()
    // rule.month = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    // rule.dayOfWeek = 1
    // rule.minute = 10
    // rule.hour = 0
    // Schedule the recurring job
    this.scheduler.scheduleJob('AccountsCron.willExpire', rule, () => {
      this.app.services.AccountService.sourcesWillExpireNextMonth()
        .catch(err => {
          this.app.log.error(err)
        })
    })
  }
}
