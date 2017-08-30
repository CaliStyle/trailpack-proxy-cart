/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const Errors = require('proxy-engine-errors')
const _ = require('lodash')
/**
 * @module Vendor
 * @description Vendor Model
 */
module.exports = class Vendor extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          // defaultScope: {
          //   where: {
          //     live_mode: app.config.proxyEngine.live_mode
          //   }
          // },
          scopes: {
            live: {
              where: {
                live_mode: true
              }
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
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.Vendor.belongsTo(models.Address, {
                as: 'billing_address'
              })
              models.Vendor.belongsTo(models.Address, {
                as: 'shipping_address'
              })
              models.Vendor.belongsToMany(models.Address, {
                as: 'addresses',
                // otherKey: 'address_id',
                foreignKey: 'model_id',
                through: {
                  model: models.ItemAddress,
                  scope: {
                    model: 'vendor'
                  }
                },
                constraints: false
              })
              models.Vendor.belongsToMany(models.Product, {
                as: 'products',
                through: {
                  model: models.VendorProduct
                },
                foreignKey: 'vendor_id'
                //constraints: false
              })
            },
            resolve: function(vendor, options){
              const Vendor =  this
              // const Sequelize = Vendor.sequelize

              if (vendor instanceof Vendor.Instance){
                return Promise.resolve(vendor)
              }
              else if (vendor && _.isObject(vendor) && vendor.id) {
                return Vendor.findById(vendor.id, options)
                  .then(foundVendor => {
                    if (!foundVendor) {
                      throw new Errors.FoundError(Error(`Vendor ${vendor.id} not found`))
                    }
                    return foundVendor
                  })
              }
              else if (vendor && _.isObject(vendor) && vendor.handle) {
                return Vendor.findOne(_.defaultsDeep({
                  where: {
                    handle: vendor.handle
                  }
                }, options))
                  .then(resVendor => {
                    if (resVendor) {
                      return resVendor
                    }
                    return Vendor.create(vendor, { transaction: options.transaction || null})
                  })
              }
              else if (vendor && _.isObject(vendor) && vendor.name) {
                return Vendor.findOne(_.defaultsDeep({
                  where: {
                    name: vendor.name
                  }
                }, options))
                  .then(resVendor => {
                    if (resVendor) {
                      return resVendor
                    }
                    return Vendor.create(vendor, { transaction: options.transaction || null})
                  })
              }
              else if (vendor && _.isNumber(vendor)) {
                return Vendor.findById(vendor, options)
                  .then(resVendor => {
                    if (!resVendor) {
                      throw new Errors.FoundError(Error(`Vendor ${vendor} not found`))
                    }
                    else {
                      return resVendor
                    }
                  })
              }
              else if (vendor && _.isString(vendor)) {
                return Vendor.findOne(_.defaultsDeep({
                  where: {
                    $or: {
                      handle: vendor,
                      name: vendor
                    }
                  }
                }, options))
                  .then(resVendor => {
                    if (!resVendor) {
                      throw new Errors.FoundError(Error(`Vendor ${vendor} not found`))
                    }
                    else {
                      return resVendor
                    }
                  })
              }
              else {
                // TODO make Proper Error
                const err = new Error(`Not able to resolve vendor ${vendor}`)
                return Promise.reject(err)
              }
            },
            transformVendors: (vendors, options) => {
              options = options || {}
              vendors = vendors || []
              const Vendor = app.orm['Vendor']
              const Sequelize = Vendor.sequelize

              vendors = vendors.map(vendor => {
                if (vendor && _.isNumber(vendor)) {
                  vendor = {
                    id: vendor
                  }
                  return vendor
                }
                else if (vendor && _.isString(vendor)) {
                  vendor = {
                    handle: app.services.ProxyCartService.handle(vendor),
                    name: vendor
                  }
                  return vendor
                }
                else if (vendor && _.isObject(vendor)) {
                  vendor.handle = vendor.handle || app.services.ProxyCartService.handle(vendor.name)
                  return vendor
                }
              })

              vendors = vendors.filter(vendor => vendor)

              return Sequelize.Promise.mapSeries(vendors, vendor => {
                return Vendor.findOne({
                  where: _.pick(vendor,['id','handle']),
                  attributes: ['id', 'handle', 'name'],
                  transaction: options.transaction || null
                })
                  .then(foundVendor => {
                    if (foundVendor) {
                      return _.extend(foundVendor, vendor)
                    }
                    else {
                      return Vendor.create(vendor, {
                        transaction: options.transaction || null
                      })
                    }
                  })
              })
            },
            transform: function (vendor) {
              if (vendor && _.isObject(vendor)) {
                vendor.handle = vendor.handle || app.services.ProxyCartService.handle(vendor.name)
                return vendor
              }
              else if (vendor && _.isString(vendor)) {
                return {
                  handle: app.services.ProxyCartService.handle(vendor),
                  name: vendor
                }
              }
              else {
                return null
              }
            },
            reverseTransform: function (vendor) {
              if (typeof vendor.name !== 'undefined') {
                return vendor.name
              }
              return vendor
            }
          }
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    const schema = {
      // The vendor handle
      handle: {
        type: Sequelize.STRING,
        notNull: true,
        unique: true,
        set: function(val) {
          this.setDataValue('handle', app.services.ProxyCartService.handle(val))
        }
      },
      // The name of the vendor
      name: {
        type: Sequelize.STRING,
        notNull: true,
        set: function(val) {
          this.setDataValue('name', app.services.ProxyCartService.title(val))
        }
      },

      // Live Mode
      live_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: app.config.proxyEngine.live_mode
      }
    }
    return schema
  }
}
