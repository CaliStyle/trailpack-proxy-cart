'use strict'

const Model = require('trails/model')

/**
 * @module City
 * @description City
 */
module.exports = class City extends Model {

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
              models.City.belongsTo(models.County, {
                // as: 'country_id'
              })
              models.City.belongsTo(models.Province, {
                // as: 'country_id'
              })
              models.City.belongsTo(models.Country, {
                // as: 'country_id'
              })
            }
          }
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    const schema = {
      name: {
        type: Sequelize.STRING
      }
    }
    return schema
  }
}
