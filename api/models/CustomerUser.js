'use strict'

const Model = require('trails/model')

/**
 * @module CustomerUser
 * @description Customer User Many to Many
 */
module.exports = class CustomerUser extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true,
        classMethods: {
          /**
           * Associate the Model
           * @param models
           */
          associate: (models) => {
            models.CustomerUser.belongsTo(models.Customer, {
              foreignKey: 'customer_id'
            })
            models.CustomerUser.belongsTo(models.User, {
              foreignKey: 'user_id'
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
      role: {
        type: Sequelize.STRING,
        defaultValue: 'admin'
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
}
