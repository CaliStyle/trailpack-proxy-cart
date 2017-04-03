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
        },
        classMethods: {
          associate: (models) => {
            models.Account.belongsTo(models.Customer, {
              through: {
                model: models.CustomerAccount,
                unique: false
              },
              foreignKey: 'account_id',
              constraints: false
            })
          }
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
