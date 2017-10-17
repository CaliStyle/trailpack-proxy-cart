'use strict'

const Cron = require('trailpack-proxy-engine').Cron

module.exports = class TransactionsCron extends Cron {
  /**
   * Cancel Failed Transactions
   */
  cancelFailed() {
    // Every Hour at 5 past Check for orders to retry
    const rule = new this.scheduler.RecurrenceRule()
    rule.minute = 10
    // Schedule the recurring job
    this.scheduler.scheduleJob('TransactionsCron.cancelFailed', rule, () => {
      this.app.services.TransactionService.cancelThisHour()
        .catch(err => {
          this.app.log.error(err)
        })
    })
  }

  /**
   * Retry Failed Transactions
   */
  retryFailed() {
    // Every Hour at 5 past Check for orders to retry
    const rule = new this.scheduler.RecurrenceRule()
    rule.minute = 5
    // Schedule the recurring job
    this.scheduler.scheduleJob('TransactionsCron.retryFailed',rule, () => {
      this.app.services.TransactionService.retryThisHour()
        .catch(err => {
          this.app.log.error(err)
        })
    })
  }
}
