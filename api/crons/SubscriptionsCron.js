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
    this.schedule.scheduleJob('SubscriptionsCron.renew',rule, () => {
      this.app.services.SubscriptionService.renewThisHour()
        .catch(err => {
          this.app.log.error(err)
        })
    })
  }
  retryFailed() {
    // Every Hour at 15 past Check for subscriptions to retry
    const rule = new this.schedule.RecurrenceRule()
    rule.minute = 15
    // Schedule the recurring job
    this.schedule.scheduleJob('SubscriptionsCron.retryFailed',rule, () => {
      this.app.services.SubscriptionService.retryThisHour()
        .catch(err => {
          this.app.log.error(err)
        })
    })
  }
  cancelFailed() {
    // Every Hour at 30 past Check for subscriptions to cancel
    const rule = new this.schedule.RecurrenceRule()
    rule.minute = 30
    // Schedule the recurring job
    this.schedule.scheduleJob('SubscriptionsCron.cancelFailed',rule, () => {
      this.app.services.SubscriptionService.cancelThisHour()
        .catch(err => {
          this.app.log.error(err)
        })
    })
  }
}
