/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')

/**
 * @module Source
 * @description Payment Source Model
 */
module.exports = class Source extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          classMethods: {
            associate: (models) => {
              models.Source.belongsTo(models.Account, {
                as: 'account',
                through: {
                  model: models.CustomerSource,
                  unique: false,
                  foreignKey: 'account_id',
                  constraints: false
                }
              })
              models.Source.belongsTo(models.Customer, {
                as: 'account',
                through: {
                  model: models.CustomerSource,
                  unique: false,
                  foreignKey: 'customer_id',
                  constraints: false
                }
              })
            }
          }
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    const schema = {
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

      // An object containing information about the credit card used for this transaction. Normally It has the following properties:
      // type: The type of Source: credit_card, debit_card, prepaid_card, apple_pay, bitcoin
      // gateway: the Gateway used
      // avs_result_code: The Response code from AVS the address verification system. The code is a single letter; see this chart for the codes and their definitions.
      // credit_card_iin: The issuer identification number (IIN), formerly known as bank identification number (BIN) ] of the customer's credit card. This is made up of the first few digits of the credit card number.
      // credit_card_company: The name of the company who issued the customer's credit card.
      // credit_card_number: The customer's credit card number, with most of the leading digits redacted with Xs.
      // cvv_result_code: The Response code from the credit card company indicating whether the customer entered the card security code, a.k.a. card verification value, correctly. The code is a single letter or empty string; see this chart http://www.emsecommerce.net/avs_cvv2_response_codes.htm for the codes and their definitions.
      // token: The card token from the Gateway
      payment_details: helpers.ARRAY('source', app, Sequelize, Sequelize.JSON, 'payment_details', {
        defaultValue: []
      })

    }
    return schema
  }
}
