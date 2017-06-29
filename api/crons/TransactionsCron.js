'use strict'

const Cron = require('trailpack-proxy-engine').Cron

module.exports = class TransactionsCron extends Cron {
  /**
   * Retry Failed Transactions
   */
  retryFailed() {
    // Every Hour at 5 past Check for orders to retry
    const rule = new this.schedule.RecurrenceRule()
    rule.minute = 5
    // Schedule the recurring job
    this.schedule.scheduleJob('TransactionsCron.retryFailed',rule, () => {
      this.app.services.TransactionService.retryThisHour()
        .catch(err => {
          this.app.log.error(err)
        })
    })
  }

  /**
   * Cancel Failed Transactions
   */
  cancelFailed() {
    // Every Hour at 5 past Check for orders to retry
    const rule = new this.schedule.RecurrenceRule()
    rule.minute = 10
    // Schedule the recurring job
    this.schedule.scheduleJob('TransactionsCron.cancelFailed', rule, () => {
      this.app.services.TransactionService.cancelThisHour()
        .catch(err => {
          this.app.log.error(err)
        })
    })
  }
}
