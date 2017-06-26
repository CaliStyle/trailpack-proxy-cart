'use strict'

const Cron = require('trailpack-proxy-engine').Cron

module.exports = class OrdersCron extends Cron {
  /**
   * Retry Failed Orders
   */
  retryFailed() {
    // Every Hour at 15 past Check for subscriptions to retry
    const rule = new this.schedule.RecurrenceRule()
    rule.minute = 15
    // Schedule the recurring job
    this.schedule.scheduleJob(rule, () => {
      this.app.services.OrderService.retryThisHour()
        .catch(err => {
          this.app.log.error(err)
        })
    })
  }

  /**
   * Cancel Failed Orders after Grace Period
   */
  cancelFailed() {
    // Every Hour at 30 past Check for subscriptions to cancel
    const rule = new this.schedule.RecurrenceRule()
    rule.minute = 30
    // Schedule the recurring job
    this.schedule.scheduleJob(rule, () => {
      this.app.services.OrderService.cancelThisHour()
        .catch(err => {
          this.app.log.error(err)
        })
    })
  }
}
