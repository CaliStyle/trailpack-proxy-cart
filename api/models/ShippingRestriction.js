'use strict'

const Model = require('trails/model')

/**
 * @module ShippingRestriction
 * @description ShippingRestriction Model
 */
module.exports = class ShippingRestriction extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true
      }
    }
  }

  static schema (app, Sequelize) {
    return {}
  }
}
