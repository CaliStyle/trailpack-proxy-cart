'use strict'

const Model = require('trails/model')
const Errors = require('proxy-engine-errors')
const _ = require('lodash')
const shortId = require('shortid')

/**
 * @module Address
 * @description Address Model
 */
module.exports = class Address extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          scopes: {
            live: {
              where: {
                live_mode: true
              }
            }
          },
          hooks: {
            beforeValidate: (values, options, fn) => {
              try {
                values = app.services.ProxyCartService.normalizeAddress(values)
                return fn(null, values)
              }
              catch (err) {
                return fn(err, values)
              }
            },
            beforeCreate: (values, options, fn) => {

              if (!values.token) {
                values.token = `address_${shortId.generate()}`
              }

              app.services.GeolocationGenericService.locate(values)
                .then(latLng => {
                  values = _.defaults(values, latLng)
                  return fn(null, values)
                })
                .catch(err => {
                  // Don't break over Geolocation failure
                  app.log.logger.error(err)
                  return fn(null, values)
                })
            },
            beforeUpdate: (values, options, fn) => {
              app.services.GeolocationGenericService.locate(values)
                .then(latLng => {
                  values = _.defaults(values, latLng)
                  return fn(null, values)
                })
                .catch(err => {
                  // Don't break over Geolocation failure
                  app.log.logger.error(err)
                  return fn(null, values)
                })
            }
          },
          classMethods: {
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.Address.belongsToMany(models.Customer, {
                foreignKey: 'address_id',
                // otherKey: 'model_id',
                through: {
                  model: models.ItemAddress,
                  scope: {
                    model: 'customer'
                  },
                  // constraints: false
                },
                constraints: false
              })
              models.Address.belongsToMany(models.Shop, {
                foreignKey: 'address_id',
                // otherKey: 'model_id',
                through: {
                  model: models.ItemAddress,
                  scope: {
                    model: 'shop'
                  },
                  // constraints: false
                },
                constraints: false
              })
              models.Address.belongsToMany(models.Cart, {
                foreignKey: 'address_id',
                // otherKey: 'model_id',
                through: {
                  model: models.ItemAddress,
                  scope: {
                    model: 'cart'
                  },
                  // constraints: false
                },
                constraints: false
              })
              models.Address.belongsToMany(models.Vendor, {
                foreignKey: 'address_id',
                // otherKey: 'model_id',
                through: {
                  model: models.ItemAddress,
                  scope: {
                    model: 'vendor'
                  },
                  // constraints: false
                },
                constraints: false
              })
            },
            resolve: function (address, options) {
              options = options || {}
              const Address = this
              if (address instanceof Address.Instance) {
                return Promise.resolve(address)
              }
              else if (address && _.isObject(address) && address.id) {
                return Address.findById(address.id, options)
                  .then(resAddress => {
                    if (!resAddress) {
                      throw new Errors.FoundError(Error(`Address ${address.id} not found`))
                    }
                    return resAddress
                  })
              }
              else if (address && _.isObject(address) && address.token) {
                return Address.findOne(_.defaultsDeep({
                  where: {
                    token: address.token
                  }
                }, options))
                  .then(resAddress => {
                    if (!resAddress) {
                      throw new Errors.FoundError(Error(`Address token ${address.token} not found`))
                    }
                    return resAddress
                  })
              }
              else if (address && _.isNumber(address)) {
                return Address.findById(address, options)
                  .then(resAddress => {
                    if (!resAddress) {
                      throw new Errors.FoundError(Error(`Address ${address.token} not found`))
                    }
                    return resAddress
                  })
              }
              else if (address && _.isString(address)) {
                return Address.findOne(_.defaultsDeep({
                  where: {
                    token: address
                  }
                }, options))
                  .then(resAddress => {
                    if (!resAddress) {
                      throw new Errors.FoundError(Error(`Address ${address} not found`))
                    }
                    return resAddress
                  })
              }
              else {
                // TODO create proper error
                const err = new Error(`Unable to resolve Address ${address}`)
                return Promise.reject(err)
              }
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
        // Unique identifier for a particular source.
        token: {
          type: Sequelize.STRING,
          unique: true
        },
        // Line 1
        address_1: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // Line 2
        address_2: {
          type: Sequelize.STRING
        },
        // Line 3
        address_3: {
          type: Sequelize.STRING
        },
        // Company
        company: {
          type: Sequelize.STRING
        },
        // City
        city: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // Name Prefix eg. Dr.
        prefix: {
          type: Sequelize.STRING
        },
        // First Name
        first_name: {
          type: Sequelize.STRING
        },
        // Last Name
        last_name: {
          type: Sequelize.STRING
        },
        // Name Suffix eg. Jr.
        suffix: {
          type: Sequelize.STRING
        },
        // Phone
        phone: {
          type: Sequelize.STRING
        },
        // Province/State
        province: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // Province/State abbr
        province_code: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // Country
        country: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // Country Code iso-alpha-2
        country_code: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // Country Name
        country_name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // Postal/Zip Code
        postal_code: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // Geographic coordinate specifying the north/south location of a shop.
        latitude: {
          type: Sequelize.FLOAT,
          allowNull: false,
          defaultValue: 0.000000,
          validate: {
            min: -90,
            max: 90
          }
        },
        // Geographic coordinate specifying the east/west location of a shop.
        longitude: {
          type: Sequelize.FLOAT,
          allowNull: false,
          defaultValue: 0.000000,
          validate: {
            min: -180,
            max: 180
          }
        },
        // The address as a String
        formatted_address: {
          type: Sequelize.STRING
        },
        // Live Mode
        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyEngine.live_mode
        }
      }
    }
    return schema
  }
}
