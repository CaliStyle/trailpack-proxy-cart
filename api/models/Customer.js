/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
// const helpers = require('proxy-engine-helpers')
const CUSTOMER_STATE = require('../utils/enums').CUSTOMER_STATE
const _ = require('lodash')
/**
 * @module Customer
 * @description Customer Model
 */
module.exports = class Customer extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          getterMethods: {
            full_name: function()  {
              return `${this.first_name} ${this.last_name}`
            }
          },
          classMethods: {
            CUSTOMER_STATE: CUSTOMER_STATE,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              // models.Customer.belongsToMany(models.Cart, {
              //   as: 'carts',
              //   through: {
              //     model: models.CustomerCart,
              //     foreignKey: 'customer_id',
              //     unique: true,
              //     constraints: false
              //   }
              // })
              models.Customer.hasOne(models.Cart, {
                as: 'default_cart',
                through: {
                  model: models.CustomerCart,
                  foreignKey: 'customer_id',
                  unique: true,
                  scope: {
                    cart: 'default_cart'
                  },
                  constraints: false
                }
              })
              models.Customer.belongsTo(models.Address, {
                as: 'shipping_address',
                through: {
                  model: models.CustomerAddress,
                  foreignKey: 'customer_id',
                  unique: true,
                  scope: {
                    address: 'shipping_address'
                  },
                  constraints: false
                }
              })
              models.Customer.belongsTo(models.Address, {
                as: 'billing_address',
                through: {
                  model: models.CustomerAddress,
                  foreignKey: 'customer_id',
                  unique: true,
                  scope: {
                    address: 'billing_address'
                  },
                  constraints: false
                }
              })
              models.Customer.belongsTo(models.Address, {
                as: 'default_address',
                through: {
                  model: models.CustomerAddress,
                  foreignKey: 'customer_id',
                  unique: true,
                  scope: {
                    address: 'default_address'
                  },
                  constraints: false
                }
              })
              models.Customer.hasMany(models.Order, {
                as: 'orders'
              })
              // models.Customer.hasOne(models.Order, {
              //   as: 'last_order_id'
              // })

              models.Customer.belongsToMany(models.Tag, {
                as: 'tags',
                through: {
                  model: models.ItemTag,
                  unique: false,
                  scope: {
                    model: 'customer'
                  }
                },
                foreignKey: 'model_id',
                constraints: false
              })
              models.Customer.hasOne(models.Metadata, {
                as: 'metadata',
                through: {
                  model: models.ItemMetadata,
                  unique: false,
                  scope: {
                    model: 'customer'
                  },
                  foreignKey: 'model_id',
                  constraints: false
                }
              })
            },
            findIdDefault: function(id, options) {
              options = _.merge(options, {
                // include: [{ all: true }]
                include: [
                  // {association: 'shipping_address'},
                  // {association: 'billing_address'},
                  // app.orm['CustomerAddress'],
                  {
                    model: app.orm['Address'],
                    as: 'default_address'
                  },
                  {
                    model: app.orm['Address'],
                    as: 'shipping_address'
                  },
                  {
                    model: app.orm['Address'],
                    as: 'billing_address'
                  },
                  // {
                  //   model: app.orm['CustomerAddress'],
                  //   as: 'addresses'
                  // },
                  {
                    model: app.orm['Tag'],
                    as: 'tags',
                    attributes: ['name', 'id']
                  },
                  {
                    model: app.orm['Metadata'],
                    as: 'metadata',
                    attributes: ['data', 'id']
                  },
                  {
                    model: app.orm['Cart'],
                    as: 'default_cart'
                  }
                  // ,
                  // {
                  //   model: app.orm['Cart'],
                  //   as: 'carts'
                  // }
                ]
              })
              return this.findById(id, options)
            }
          },
          instanceMethods: {
            toJSON: function() {
              const resp = this.get({ plain: true })
              // Transform Tags to array on toJSON
              if (resp.tags) {
                resp.tags = resp.tags.map(tag => {
                  if (_.isString(tag)) {
                    return tag
                  }
                  return tag.name
                })
              }
              else {
                resp.tags = []
              }
              // Transform Metadata to plain on toJSON
              if (resp.metadata) {
                if (typeof resp.metadata.data !== 'undefined') {
                  resp.metadata = resp.metadata.data
                }
              }
              else {
                resp.metadata = {}
              }
              return resp
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
        //
        accepts_marketing: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        //
        first_name: {
          type: Sequelize.STRING
        },
        //
        last_name: {
          type: Sequelize.STRING
        },
        //
        note: {
          type: Sequelize.STRING
        },
        //
        last_order_name: {
          type: Sequelize.STRING
        },
        //
        orders_count: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The standing state of the customer: enabled, disabled, invited, declined
        state: {
          type: Sequelize.ENUM,
          values: _.values(CUSTOMER_STATE),
          defaultValue: CUSTOMER_STATE.ENABLED
        },
        // If customer is tax exempt
        tax_exempt: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // The total amount the customer has spent
        total_spent: {
          type: Sequelize.INTEGER
        },
        // If the customer's email address is verified
        verified_email: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },

        // IP addresses
        create_ip: {
          type: Sequelize.STRING
        },
        update_ip: {
          type: Sequelize.STRING
        },

        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyCart.live_mode
        }
      }
    }
    return schema
  }
}
