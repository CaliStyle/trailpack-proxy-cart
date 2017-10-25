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
    return {
      options: {
        underscored: true
      }
    }
  }

  static schema (app, Sequelize) {
    return {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
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
}
