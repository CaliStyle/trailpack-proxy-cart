'use strict'

const Model = require('trails/model')

/**
 * @module ProductCollection
 * @description Product Collection Model
 */
module.exports = class ProductCollection extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          classMethods: {
            associate: (models) => {
              models.ProductCollection.hasMany(models.Product, {
                as: 'products',
                onDelete: 'CASCADE'
              })
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
        name: {
          type: Sequelize.STRING
        },
        // Multi Site Support
        host: {
          type: Sequelize.STRING,
          defaultValue: 'localhost'
        }
      }
    }
    return schema
  }
}
