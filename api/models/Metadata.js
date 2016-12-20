/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')

/**
 * @module Metadata
 * @description Metadata Model
 */
module.exports = class Metadata extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          classMethods: {
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {

            }
          }
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    let schema = {}
    if (app.config.database.orm === 'sequelize') {
      schema = {
        data: helpers.JSONB('metadata', app, Sequelize, 'data', {
          defaultValue: {}
        }),
        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyCart.live_mode
        }
      }
    }
    return schema
  }
}
