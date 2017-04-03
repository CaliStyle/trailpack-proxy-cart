/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')

/**
 * @module Account
 * @description Account
 */
module.exports = class Account extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    return {
      gateway: {
        type: Sequelize.STRING
      },
      data: helpers.JSONB('account', app, Sequelize, 'data', {
        defaultValue: {}
      }),
    }
  }
}
