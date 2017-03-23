'use strict'

const Model = require('trails/model')
const ModelPassport = require('trailpack-passport/api/models/User')
const ModelPermissions = require('trailpack-proxy-permissions/api/models/User')

module.exports = class User extends Model {
  static config(app, Sequelize) {
    return {
      options: {
        classMethods: {
          associate: (models) => {
            // Apply passport specific stuff
            ModelPassport.config(app, Sequelize).options.classMethods.associate(models)
            // Apply permission specific stuff
            ModelPermissions.config(app, Sequelize).options.classMethods.associate(models)
            // Apply your specific stuff
            models.User.belongsToMany(models.Customer, {
              as: 'customers',
              through: {
                model: models.CustomerUser,
                foreignKey: 'user_id',
                unique: true,
                constraints: false
              }
            })
          }
        }
      }
    }
  }
  static schema(app, Sequelize) {
    // return ModelPassport.schema(app, Sequelize)
    return {
      username: {
        type: Sequelize.STRING,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
          isEmail: true
        }
      }
    }
  }
}
