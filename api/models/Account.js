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
      // The foreign key attribute on the 3rd party provider
      foreign_key: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // The foreign id on the 3rd party provider
      foreign_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // If this is the default payment source for an account
      is_default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      // The data from the 3rd party response
      data: helpers.JSONB('account', app, Sequelize, 'data', {
        defaultValue: {}
      }),
    }
  }
}
