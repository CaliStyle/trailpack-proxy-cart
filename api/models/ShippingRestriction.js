'use strict'

const Model = require('trails/model')

/**
 * @module ShippingRestriction
 * @description ShippingRestriction Model
 */
module.exports = class ShippingRestriction extends Model {

  static config (app, Sequelize) {
    const config = {
      options: {
        underscored: true
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    const schema = {}
    return schema
  }
}
