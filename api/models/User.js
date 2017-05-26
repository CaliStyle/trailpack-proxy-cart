/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const ModelPassport = require('trailpack-proxy-passport/api/models/User')
const ModelPermissions = require('trailpack-proxy-permissions/api/models/User')
const _ = require('lodash')

module.exports = class User extends Model {
  static config(app, Sequelize) {
    return {
      options: {
        underscored: true,
        defaultScope: {
          where: {
            live_mode: app.config.proxyEngine.live_mode
          }
        },
        hooks: {
          afterCreate: [
            (values, options, fn) => {
              app.services.ProxyCartService.afterUserCreate(values, options)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            }
          ].concat(ModelPermissions.config(app, Sequelize).options.hooks.afterCreate)
        },
        getterMethods: {
          full_name: function()  {
            if (this.first_name && this.last_name) {
              return `${ this.first_name } ${ this.last_name }`
            }
            else {
              return null
            }
          }
        },
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
                unique: true
              },
              foreignKey: 'user_id'
              // constraints: false
            })
            models.User.hasMany(models.Order, {
              as: 'orders',
              foreignKey: 'user_id'
            })
            // models.User.belongsTo(models.Customer, {
            //   as: 'current_customer_id',
            //   // foreign_key: 'id'
            // })
            // models.User.belongsTo(models.Cart, {
            //   as: 'current_cart_id',
            //   // foreign_key: 'id'
            // })
            // models.User.belongsToMany(models.Cart, {
            //   as: 'carts',
            //   through: {
            //     model: models.CartUser,
            //     foreignKey: 'user_id',
            //     unique: true,
            //     constraints: false
            //   }
            // })
            models.User.hasOne(models.Metadata, {
              as: 'metadata',
              through: {
                model: models.ItemMetadata,
                unique: false,
                scope: {
                  model: 'user'
                },
                foreignKey: 'model_id',
                constraints: false
              }
            })
          },
          findByIdDefault: ModelPermissions.config(app, Sequelize).options.classMethods.findByIdDefault
        },
        instanceMethods: {
          toJSON: function() {
            const resp = this.get({ plain: true })
            // Transform Tags to array on toJSON
            if (resp.tags) {
              resp.tags = resp.tags.map(tag => {
                if (tag && _.isString(tag)) {
                  return tag
                }
                else if (tag && tag.name) {
                  return tag.name
                }
              })
            }
            // Transform Metadata to plain on toJSON
            if (resp.metadata) {
              if (typeof resp.metadata.data !== 'undefined') {
                resp.metadata = resp.metadata.data
              }
            }
            return resp
          }
        }
      }
    }
  }
  static schema(app, Sequelize) {
    // return ModelPassport.schema(app, Sequelize)
    const PassportTrailpackSchema = ModelPassport.schema(app, Sequelize)
    const PermissionsTrailpackSchema = ModelPermissions.schema(app, Sequelize)

    const schema = {
      accepts_marketing: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      current_customer_id: {
        type: Sequelize.INTEGER,
        // references: {
        //   model: 'Customer',
        //   key: 'id'
        // },
        allowNull: true
      },
      current_cart_id: {
        type: Sequelize.INTEGER,
        // references: {
        //   model: 'Cart',
        //   key: 'id'
        // },
        allowNull: true
      },
      // Live Mode
      live_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: app.config.proxyEngine.live_mode
      }
    }
    return _.defaults(PassportTrailpackSchema, PermissionsTrailpackSchema, schema)
  }
}
