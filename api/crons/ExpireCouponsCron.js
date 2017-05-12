'use strict'

const Cron = require('trailpack-proxy-engine').Cron

module.exports = class ExpireCouponsCron extends Cron {

  /**
   *
   */
  constructor(app, message) {
    super(app, message)
  }
}
