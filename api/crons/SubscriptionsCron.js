'use strict'

const Cron = require('trailpack-proxy-engine').Cron

module.exports = class SubscriptionsCron extends Cron {
  /**
   * Renews Subscriptions
   */
  renew() {
    // Every Hour Check for subscription renewals
    const rule = new this.schedule.RecurrenceRule()
    rule.minute = 0
    // Schedule the recurring job
    this.schedule.scheduleJob(rule, () => {
      this.app.services.SubscriptionService.renewThisHour()
        .catch(err => {
          this.app.log.error(err)
        })
    })
  }
}
