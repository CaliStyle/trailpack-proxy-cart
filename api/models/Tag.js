'use strict'

const Model = require('trails/model')

/**
 * @module Tag
 * @description Tag Model
 */
module.exports = class Tag extends Model {

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
              models.Tag.belongsToMany(models.Product, {
                through: {
                  model: models.ItemTag,
                  unique: false
                },
                foreignKey: 'owner_id'
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
          type: Sequelize.STRING,
          unique: true,
          notNull: true
        },
        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyCart.live_mode
        }
      }
    }
    return schema
  }
}
