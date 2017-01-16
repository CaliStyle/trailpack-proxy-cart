'use strict'

const Model = require('trails/model')

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
          underscored: true
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {

  }
}
