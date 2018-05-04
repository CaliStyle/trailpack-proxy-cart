'use strict'

const Model = require('trails/model')

/**
 * @module CustomerAddress
 * @description Customer Address Model
 */
module.exports = class ItemAddress extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true,
        indexes: [
          {
            fields: ['address_id', 'model', 'model_id', 'address']
          }
        ],
        classMethods: {
          /**
           * Associate the Model
           * @param models
           */
          associate: (models) => {
            models.ItemAddress.belongsTo(models.Address, {
              foreignKey: 'address_id'
            })
          }
        }
      }
    }
  }

  static schema (app, Sequelize) {
    return {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      address_id: {
        type: Sequelize.INTEGER,
        // unique: 'itemaddress_address'
      },
      model: {
        type: Sequelize.STRING,
        // unique: 'itemaddress_address'
      },
      model_id: {
        type: Sequelize.INTEGER,
        // unique: 'itemaddress_address',
        references: null
      },
      address: {
        type: Sequelize.STRING,
        defaultValue: 'address',
        // unique: 'itemaddress_address'
      }
    }
  }
}
