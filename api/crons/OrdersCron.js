'use strict'

const Cron = require('trailpack-proxy-engine').Cron

module.exports = class OrdersCron extends Cron {
  /**
   * Retry Failed Orders
   */
  retryFailed() {
    // Every Hour at 5 past Check for orders to retry
    const rule = new this.schedule.RecurrenceRule()
    rule.minute = 5
    // Schedule the recurring job
    this.schedule.scheduleJob('OrdersCron.retryFailed',rule, () => {
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
    // Every Hour at 30 past Check for orders to cancel
    const rule = new this.schedule.RecurrenceRule()
    rule.minute = 10
    // Schedule the recurring job
    this.schedule.scheduleJob('OrdersCron.cancelFailed', rule, () => {
      this.app.services.OrderService.cancelThisHour()
        .catch(err => {
          this.app.log.error(err)
        })
    })
  }
}
