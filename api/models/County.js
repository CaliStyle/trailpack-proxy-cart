'use strict'

const Model = require('trails/model')

/**
 * @module County
 * @description County Model
 */
module.exports = class County extends Model {

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
              models.County.belongsTo(models.Province, {
                // as: 'country_id'
              })
              models.County.belongsTo(models.Country, {
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
