'use strict'

const Model = require('trails/model')

/**
 * @module Quote
 * @description Quote Model
 */
module.exports = class Quote extends Model {

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
