'use strict'

const Model = require('trails/model')

/**
 * @module CustomerUser
 * @description Customer User Many to Many
 */
module.exports = class CustomerUser extends Model {

  static config (app, Sequelize) {
    const config = {
      options: {
        underscored: true
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    let schema = {}
    if (app.config.database.orm === 'sequelize') {
      schema = {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        role: {
          type: Sequelize.STRING,
          defaultsValue: 'admin'
        },
        user_id: {
          type: Sequelize.INTEGER,
          unique: 'customeruser_user'
        },
        customer_id: {
          type: Sequelize.INTEGER,
          unique: 'customeruser_user',
          references: null
        }
      }
    }
    return schema
  }
}
