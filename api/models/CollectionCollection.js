'use strict'

const Model = require('trails/model')

/**
 * @module CollectionCollection
 * @description Collection many to many
 */
module.exports = class CollectionCollection extends Model {

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
        collection_id: {
          type: Sequelize.INTEGER,
          unique: 'collectioncollection_collection'
        },
        subscollection_id: {
          type: Sequelize.INTEGER,
          unique: 'collectioncollection_collection',
          references: null
        }
      }
    }
    return schema
  }
}
