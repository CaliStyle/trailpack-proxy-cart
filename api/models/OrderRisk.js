'use strict'

const Model = require('trails/model')

/**
 * @module OrderRisk
 * @description Order Risk
 */
module.exports = class OrderRisk extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true
      }
    }
  }

  static schema (app, Sequelize) {
    return {
      order_id: {
        type: Sequelize.INTEGER
      },
      reason: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      live_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: app.config.proxyEngine.live_mode
      }
    }
  }
}
