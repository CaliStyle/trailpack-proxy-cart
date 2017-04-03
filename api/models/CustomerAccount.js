/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
// const helpers = require('proxy-engine-helpers')

/**
 * @module CustomerAccount
 * @description Customer Account
 */
module.exports = class CustomerAccount extends Model {

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
    let schema = {}
    if (app.config.database.orm === 'sequelize') {
      schema = {
        account_id: {
          type: Sequelize.INTEGER,
          unique: 'customeraccount_account'
        },
        customer_id: {
          type: Sequelize.INTEGER,
          unique: 'customeraccount_account',
          references: null
        }
      }
    }
    return schema
  }
}
