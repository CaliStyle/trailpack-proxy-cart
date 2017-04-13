/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
// const helpers = require('proxy-engine-helpers')
const queryDefaults = require('../utils/queryDefaults')
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
          defaultScope: {
            where: {
              live_mode: app.config.proxyEngine.live_mode
            }
          },
          hooks: {
            beforeCreate: (values, options, fn) => {
              if (values.ip) {
                values.create_ip = values.ip
              }
              fn()
            },
            beforeUpdate: (values, options, fn) => {
              if (values.ip) {
                values.update_ip = values.ip
              }
              fn()
            },
            afterCreate: (values, options, fn) => {
              app.services.CustomerService.afterCreate(values)
                .then(values => {
                  fn(null, values)
                })
                .catch(err => {
                  fn(err)
                })
            },
            afterUpdate: (values, options, fn) => {
              app.services.CustomerService.afterUpdate(values)
                .then(values => {
                  fn(null, values)
                })
                .catch(err => {
                  fn(err)
                })
            }
          },
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
              models.Customer.belongsToMany(models.User, {
                as: 'owners',
                through: {
                  model: models.UserItem,
                  foreignKey: 'item_id',
                  scope: {
                    item: 'cart'
                  }
                }
              })

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
                  model: models.ItemAddress,
                  foreignKey: 'model_id',
                  unique: true,
                  scope: {
                    address: 'shipping_address',
                    model: 'customer'
                  },
                  constraints: false
                }
              })
              models.Customer.belongsTo(models.Address, {
                as: 'billing_address',
                through: {
                  model: models.ItemAddress,
                  foreignKey: 'model_id',
                  unique: true,
                  scope: {
                    address: 'billing_address',
                    model: 'customer'
                  },
                  constraints: false
                }
              })
              models.Customer.belongsTo(models.Address, {
                as: 'default_address',
                through: {
                  model: models.ItemAddress,
                  foreignKey: 'model_id',
                  unique: true,
                  scope: {
                    address: 'default_address',
                    model: 'customer'
                  },
                  constraints: false
                }
              })
              models.Customer.belongsToMany(models.Order, {
                as: 'orders',
                through: {
                  model: models.CustomerOrder
                }
              })
              // models.Customer.belongsTo(models.Order, {
              //   as: 'last_order_id',
              //   // foreignKey: 'id',
              //   constraints: false
              // })
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
              models.Customer.belongsToMany(models.Collection, {
                as: 'collections',
                through: {
                  model: models.ItemCollection,
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
              models.Customer.belongsToMany(models.Account, {
                as: 'accounts',
                through: {
                  model: models.CustomerAccount,
                  unique: false
                },
                foreignKey: 'customer_id',
                constraints: false
              })
              models.Customer.belongsToMany(models.User, {
                as: 'users',
                through: {
                  model: models.CustomerUser,
                  unique: true,
                },
                foreignKey: 'customer_id',
                constraints: false
              })
              // models.Customer.hasMany(models.User, {
              //   as: 'users',
              //   foreignKey: {
              //     allowNull: true
              //   }
              // })
              // models.Customer.belongsToMany(models.User, {
              //   as: 'users',
              //   through: {
              //     model: models.CustomerUser,
              //     foreignKey: 'customer_id',
              //     unique: true,
              //     constraints: false
              //   }
              // })
            },
            findByIdDefault: function(id, options) {
              if (!options) {
                options = {}
              }
              options = _.merge(options, queryDefaults.Customer.default(app))
              return this.findById(id, options)
            }
          },
          instanceMethods: {
            setLastOrder: function(order){
              this.last_order_name = order.name
              this.last_order_id = order.id
              return
            },
            // TODO Discussion: should this be pulled with each query or set after order?
            setAccountBalance: function(balance){
              this.account_balance = balance
              return
            },
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
        // Customer First Name if not a Company
        first_name: {
          type: Sequelize.STRING
        },
        // Customer Last Name if not a Company
        last_name: {
          type: Sequelize.STRING
        },
        // Customer Company if not a User
        company: {
          type: Sequelize.STRING
        },

        // Customers Email if there is one
        email: {
          type: Sequelize.STRING,
          validate: {
            isEmail: true
          }
        },
        //
        note: {
          type: Sequelize.STRING
        },
        // // The name of the Last order this Customer Placed
        last_order_id: {
          type: Sequelize.INTEGER,
          // references: {
          //   model: 'Order',
          //   key: 'id'
          // }
        },
        last_order_name: {
          type: Sequelize.STRING
        },
        // TODO make this part of the Default Query
        // orders_count: {
        //   type: Sequelize.INTEGER,
        //   defaultValue: 0
        // },
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
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The amount the customer has as a credit on their account
        account_balance: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },

        // If the customer's email address is verified
        verified_email: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },

        // IP addresses
        ip: {
          type: Sequelize.STRING
        },
        create_ip: {
          type: Sequelize.STRING
        },
        update_ip: {
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
