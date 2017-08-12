'use strict'

const Model = require('trails/model')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
const UNITS = require('../utils/enums').UNITS

/**
 * @module Shop
 * @description Shop Model
 */
module.exports = class Shop extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          defaultScope: {
            where: {
              live_mode: app.config.proxyEngine.live_mode
            }
          },
          hooks: {
            beforeValidate(values, options, fn) {
              if (!values.handle && values.name) {
                values.handle = values.name
              }
              fn()
            }
          },
          classMethods: {
            UNITS: UNITS,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.Shop.belongsTo(models.Address, {
                as: 'address'
              })
              models.Shop.belongsToMany(models.Address, {
                as: 'addresses',
                // otherKey: 'address_id',
                foreignKey: 'model_id',
                through: {
                  model: models.ItemAddress,
                  scope: {
                    model: 'shop'
                  },
                  constraints: false
                },
                constraints: false
              })
              models.Shop.hasMany(models.Cart, {
                as: 'carts',
                foreignKey: 'shop_id'
              })
              models.Shop.hasMany(models.Order, {
                as: 'orders',
                foreignKey: 'shop_id'
              })
              models.Shop.belongsToMany(models.Product, {
                as: 'products',
                through: {
                  model: models.ShopProduct,
                  foreignKey: 'shop_id'
                },
                //constraints: false
              })
            },
            // TODO
            resolve: function(shop, options) {
              if (!options) {
                options = {}
              }
              const Shop =  this
              if (shop instanceof Shop.Instance){
                return Promise.resolve(shop)
              }
              else if (shop && _.isObject(shop) && shop.id) {
                return Shop.findById(shop.id, options)
                  .then(resShop => {
                    if (!resShop) {
                      throw new Errors.FoundError(`Shop ${shop.id} not found`)
                    }
                    return resShop
                  })
              }
              else if (shop && _.isNumber(shop)) {
                return Shop.findById(shop, {
                  transaction: options.transaction || null
                })
                  .then(resShop => {
                    if (!resShop) {
                      throw new Errors.FoundError(`Shop ${shop} not found`)
                    }
                    return resShop
                  })
              }
              else if (shop && _.isString(shop)) {
                return Shop.findOne({
                  where: {
                    handle: shop
                  },
                  transaction: options.transaction || null
                })
                  .then(resShop => {
                    if (!resShop) {
                      throw new Errors.FoundError(`Shop ${shop} not found`)
                    }
                    return resShop
                  })
              }
              else {
                return Shop.findOne({
                  transaction: options.transaction || null
                })
                  .then(resShop => {
                    if (!resShop) {
                      throw new Errors.FoundError(Error(`Shop ${shop} not found and could not resolve the default`))
                    }
                    return resShop
                  })
                // const err = new Error('Unable to resolve Shop')
                // Promise.reject(err)
              }
            },
            transformShops: (shops, options) => {
              options = options || {}
              shops = shops || []
              const Shop = app.orm['Shop']
              const Sequelize = Shop.sequelize

              // Transform if necessary to objects
              shops = shops.map(shop => {
                if (shop && _.isNumber(shop)) {
                  return { id: shop }
                }
                else if (shop && _.isString(shop)) {
                  shop = { name: shop }
                  return shop
                }
                else if (shop && _.isObject(shop)) {
                  return shop
                }
              })
              // Filter out undefined
              shops = shops.filter(shop => shop)

              return Sequelize.Promise.mapSeries(shops, shop => {
                return Shop.findOne({
                  where: _.pick(shop, ['id','handle']),
                  attributes: ['id', 'name', 'handle'],
                  transaction: options.transaction || null
                })
                  .then(foundShop => {
                    if (foundShop) {
                      return _.extend(foundShop, shop)
                    }
                    else {
                      return Shop.create(shop, {
                        transaction: options.transaction || null
                      })
                    }
                  })
              })
            },
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
        // The name of the shop.
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // The Unique string for shop
        handle: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          set: function(val) {
            this.setDataValue('handle', app.services.ProxyCartService.slug(val))
          }
        },
        // The contact phone number for the shop.
        phone: {
          type: Sequelize.STRING
        },
        // The shop's primary language locale
        primary_locale: {
          type: Sequelize.STRING,
          defaultValue: 'en-us',
          allowNull: false
        },
        // The Address Id of the shop
        address_id: {
          type: Sequelize.INTEGER
        },
        // The three-letter code for the currency that the shop accepts.
        currency: {
          type: Sequelize.STRING,
          defaultValue: 'USD',
          allowNull: false
        },
        // TODO Host? used to be domain: host is more congruent with ProxyRouter
        host: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // The contact email address for the shop.
        email: {
          type: Sequelize.STRING,
          validate: {
            isEmail: true
          }
        },
        // A string representing the way currency is formatted when the currency isn't specified.
        money_format: {
          type: Sequelize.STRING,
          defaultValue: '$',
          allowNull: false
        },
        // A string representing the way currency is formatted when the currency is specified.
        money_with_currency_format: {
          type: Sequelize.STRING,
          defaultValue: '$ USD',
          allowNull: false
        },
        // Specifies whether or not taxes were charged for shipping. Valid values are: "true" or "false."
        tax_shipping: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // The setting for whether applicable taxes are included in product prices. Valid values are: "true" or "null."
        taxes_included: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // The setting for whether the shop is applying taxes on a per-county basis or not (US-only). Valid values are: "true" or "null."
        county_taxes: {
          type: Sequelize.BOOLEAN
        },
        // The name of the timezone the shop is in.
        timezone: {
          type: Sequelize.STRING,
          defaultValue: '(GMT-05:00) Eastern Time',
          allowNull: false
        },
        // The named timezone assigned by the IANA.
        iana_timezone: {
          type: Sequelize.STRING,
          defaultValue: 'America/New_York',
          allowNull: false
        },
        // A string representing the default unit of weight measurement for the shop.
        weight_unit: {
          type: Sequelize.ENUM,
          values: _.values(UNITS),
          defaultValue: UNITS.G
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
