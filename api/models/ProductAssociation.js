'use strict'

const Model = require('trails/model')

/**
 * @module ProductAssociation
 * @description Product Association
 */
module.exports = class ProductAssociation extends Model {

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
    let schema = {}
    if (app.config.database.orm === 'sequelize') {
      schema = {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        product_id: {
          type: Sequelize.INTEGER,
          unique: 'productassociation_association'
        },
        associated_product_id: {
          type: Sequelize.STRING,
          unique: 'productassociation_association',
          references: null
        },
        variant_id: {
          type: Sequelize.INTEGER,
          unique: 'productassociation_association',
          references: null
        }
      }
    }
    return schema
  }
}
