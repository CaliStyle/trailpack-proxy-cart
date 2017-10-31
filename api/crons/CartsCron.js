'use strict'

const Cron = require('trailpack-proxy-engine').Cron

module.exports = class CartsCron extends Cron {
  /**
   * Archive Expired Carts
   */
  archive() {
    // Every Hour Check for carts that are open and inactive and have been for X amount of time and close the,
    const rule = new this.scheduler.RecurrenceRule()
    rule.minute = 0
    // Schedule the recurring job
    this.scheduler.scheduleJob('CartsCron.archive', rule, () => {
      //
    })
  }

  /**
   * Retarget open carts
   */
  retarget() {
    // Every Hour Check for carts that are open and inactive with items in them and a customer id and retarget them
    const rule = new this.scheduler.RecurrenceRule()
    rule.minute = 0
    // Schedule the recurring job
    this.scheduler.scheduleJob('CartsCron.retarget', rule, () => {
      this.app.services.CartService.retarget()
        .catch(err => {
          this.app.log.error(err)
        })
    })
  }
}
