/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
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
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              models.Vendor.belongsTo(models.Address, {
                as: 'address',
                through: {
                  model: models.ItemAddress,
                  foreignKey: 'model_id',
                  unique: true,
                  scope: {
                    address: 'address',
                    model: 'vendor'
                  },
                  constraints: false
                }
              })
              models.Vendor.belongsToMany(models.Product, {
                as: 'products',
                through: {
                  model: models.VendorProduct,
                  foreignKey: 'vendor_id'
                },
                constraints: false
              })
            },
            transformVendor: (resVendor) => {
              const Vendor = app.orm['Vendor']

              if (resVendor && _.isString(resVendor)) {
                resVendor = { name: resVendor }
              }
              else if (resVendor && _.isObject(resVendor)) {
                resVendor = _.omit(resVendor, ['created_at','updated_at'])
              }
              else {
                return Promise.resolve(null)
              }
              return Vendor.sequelize.transaction(t => {
                return Vendor.findOne({
                  where: resVendor,
                  attributes: ['id', 'name']
                })
                  .then(vendor => {
                    // console.log('THIS VENDOR', vendor)
                    if (vendor) {
                      return vendor
                    }
                    else {
                      return Vendor.create(resVendor)
                    }
                  })
              })
            },
            transform: function (vendor) {
              if (typeof vendor.name !== 'undefined') {
                return vendor
              }
              return { name: vendor }
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
          this.setDataValue('handle', app.services.ProxyCartService.slug(val))
        }
      },
      // The name of the vendor
      name: {
        type: Sequelize.STRING,
        notNull: true
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
