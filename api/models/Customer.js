/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
// const helpers = require('proxy-engine-helpers')
const _ = require('lodash')
const shortid = require('shortid')
const queryDefaults = require('../utils/queryDefaults')
const CUSTOMER_STATE = require('../utils/enums').CUSTOMER_STATE

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
              // If not token was already created, create it
              if (!values.token) {
                values.token = `customer_${shortid.generate()}`
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
              app.services.CustomerService.afterCreate(values, options)
                .then(values => {
                  fn(null, values)
                })
                .catch(err => {
                  fn(err)
                })
            },
            afterUpdate: (values, options, fn) => {
              app.services.CustomerService.afterUpdate(values, options)
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
              if (this.first_name && this.last_name) {
                return `${ this.first_name } ${ this.last_name }`
              }
              else if (this.company) {
                return `${ this.company }`
              }
              else {
                return null
              }
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

                  scope: {
                    item: 'cart'
                  }
                },
                foreignKey: 'item_id',
                constraints: false
              })
              // models.Customer.belongsToMany(models.User, {
              //   as: 'users',
              //   through: {
              //     model: models.CustomerUser,
              //     foreignKey: 'customer_id'
              //   }
              // })
              // models.Customer.belongsToMany(models.User, {
              //   as: 'users',
              //   through: {
              //     model: models.CustomerUser,
              //     unique: true
              //   },
              //   foreignKey: 'customer_id',
              //   constraints: false
              // })

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
              models.Customer.belongsToMany(models.Address, {
                as: 'addresses',
                // otherKey: 'address_id',
                foreignKey: 'model_id',
                through: {
                  model: models.ItemAddress,
                  scope: {
                    model: 'customer'
                  },
                  constraints: false
                },
                constraints: false
              })
              models.Customer.belongsTo(models.Address, {
                as: 'shipping_address',
                // through: {
                //   model: models.ItemAddress,
                //   targetKey: 'address_id',
                //   foreignKey: 'model_id',
                //   unique: true,
                //   scope: {
                //     address: 'shipping_address',
                //     model: 'customer'
                //   },
                //   constraints: false
                // }
              })
              models.Customer.belongsTo(models.Address, {
                as: 'billing_address',
                // through: {
                //   model: models.ItemAddress,
                //   targetKey: 'address_id',
                //   foreignKey: 'model_id',
                //   unique: true,
                //   scope: {
                //     address: 'billing_address',
                //     model: 'customer'
                //   },
                //   constraints: false
                // }
              })
              models.Customer.belongsTo(models.Address, {
                as: 'default_address',
                // through: {
                //   model: models.ItemAddress,
                //   targetKey: 'address_id',
                //   foreignKey: 'model_id',
                //   unique: true,
                //   scope: {
                //     address: 'default_address',
                //     model: 'customer'
                //   },
                //   constraints: false
                // }
              })
              models.Customer.belongsToMany(models.Order, {
                as: 'orders',
                through: {
                  model: models.CustomerOrder,
                  unique: true
                },
                foreignKey: 'customer_id'
                // constraints: false
              })
              // models.Customer.hasMany(models.Order, {
              //   foreignKey: 'customer_id'
              // })
              // models.Customer.hasMany(models.Order, {
              //   as: 'orders',
              //   foreignKey: 'customer_id'
              // })
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
                // through: {
                //   model: models.ItemMetadata,
                //   unique: false,
                //   scope: {
                //     model: 'customer'
                //   },
                //   foreignKey: 'model_id'
                //   // constraints: false
                // }
                // scope: {
                //   model: 'customer'
                // },
                // foreignKey: 'model_id',
                constraints: false
              })
              models.Customer.belongsToMany(models.Account, {
                as: 'accounts',
                through: {
                  model: models.CustomerAccount,
                  unique: false
                },
                foreignKey: 'customer_id'
                // constraints: false
              })
              models.Customer.belongsToMany(models.Source, {
                as: 'sources',
                through: {
                  model: models.CustomerSource,
                  unique: false
                },
                foreignKey: 'customer_id'
                // constraints: false
              })
              models.Customer.belongsToMany(models.User, {
                as: 'users',
                through: {
                  model: models.CustomerUser,
                  unique: true,
                },
                foreignKey: 'customer_id'
                // constraints: false
              })
              models.Customer.hasMany(models.Event, {
                as: 'events',
                foreignKey: 'object_id',
                scope: {
                  object: 'customer'
                },
                constraints: false
              })
              models.Customer.belongsToMany(models.Discount, {
                as: 'discount_codes',
                through: {
                  model: models.ItemDiscount,
                  unique: false,
                  scope: {
                    model: 'customer'
                  }
                },
                foreignKey: 'model_id',
                constraints: false
              })
              models.Customer.belongsToMany(models.Coupon, {
                as: 'coupons',
                through: {
                  model: models.ItemCoupon,
                  unique: false,
                  scope: {
                    model: 'customer'
                  }
                },
                foreignKey: 'model_id',
                constraints: false
              })
              models.Customer.belongsToMany(models.Event, {
                as: 'event_items',
                through: {
                  model: models.EventItem,
                  unique: false,
                  scope: {
                    object: 'customer'
                  }
                },
                foreignKey: 'object_id',
                constraints: false
              })
              // models.Customer.hasOne(models.Order, {
              //   targetKey: 'last_order_id',
              //   foreignKey: 'id'
              // })
              // models.Customer.hasMany(models.Order, {
              //   as: 'orders',
              //   foreignKey: 'customer_id'
              // })
            },
            /**
             *
             * @param id
             * @param options
             * @returns {*|Promise.<Instance>}
             */
            findByIdDefault: function(id, options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Customer.default(app))
              return this.findById(id, options)
            },
            /**
             *
             * @param token
             * @param options
             * @returns {*|Promise.<Instance>}
             */
            findByTokenDefault: function(token, options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Customer.default(app), {
                where: {
                  token: token
                }
              })
              return this.findOne(options)
            },
            /**
             *
             * @param options
             * @returns {Promise.<Object>}
             */
            findAndCountDefault: function(options) {
              options = options || {}
              options = _.defaultsDeep(options, {distinct: true})
              return this.findAndCount(options)
            },
            resolve: function(customer, options){
              options = options || {}
              const Customer =  this
              if (customer instanceof Customer.Instance){
                return Promise.resolve(customer)
              }
              else if (customer && _.isObject(customer) && customer.id) {
                return Customer.findById(customer.id, options)
                  .then(resCustomer => {
                    if (!resCustomer) {
                      return app.services.CustomerService.create(customer, options)
                    }
                    return resCustomer
                  })
              }
              else if (customer && _.isObject(customer) && customer.email) {
                return Customer.findOne(_.defaultsDeep({
                  where: {
                    email: customer.email
                  }
                }, options))
                  .then(resCustomer => {
                    if (!resCustomer) {
                      return app.services.CustomerService.create(customer, {transaction: options.transaction || null})
                    }
                    return resCustomer
                  })
              }
              else if (customer && (_.isString(customer) || _.isNumber(customer))) {
                return Customer.findById(customer, options)
              }
              else {
                return app.services.CustomerService.create(customer, options)
              }
            }
          },
          instanceMethods: {
            /**
             *
             * @param order
             */
            setLastOrder: function(order){
              this.last_order_name = order.name
              this.last_order_id = order.id
              return this
            },
            /**
             *
             * @param orderTotalDue
             */
            setTotalSpent: function(orderTotalDue) {
              this.total_spent = this.total_spent + orderTotalDue
              return this
            },
            /**
             *
             * @param newBalance
             */
            // TODO Discussion: should this be pulled with each query or set after order?
            setAccountBalance: function(newBalance){
              this.account_balance = newBalance
              return this
            },
            /**
             *
             * @param preNotification
             * @param options
             * @returns {Promise.<T>}
             */
            notifyUsers: function(preNotification, options) {
              options = options || {}
              return this.resolveUsers({
                attributes: ['id','email'],
                transaction: options.transaction || null
              })
                .then(() => {
                  if (this.users || this.users.length > 0) {
                    return app.services.NotificationService.create(preNotification, this.users, {transaction: options.transaction || null})
                  }
                  else {
                    return
                  }
                })
            },
            /**
             *
             * @param options
             * @returns {Promise.<T>}
             */
            resolveUsers(options) {
              options = options || {}
              if (this.users) {
                return Promise.resolve(this)
              }
              else {
                return this.getUsers({transaction: options.transaction || null})
                  .then(users => {
                    users = users || []
                    this.users = users
                    this.setDataValue('users', users)
                    this.set('users', users)
                    return this
                  })
              }
            },
            getDefaultSource: function (options) {
              options = options || {}
              const Source = app.orm['Source']
              return Source.findOne({
                where: {
                  customer_id: this.id,
                  is_default: true
                },
                transaction: options.transaction || null
              })
              .then(source => {
                // If there is no default, find one for the customer
                if (!source) {
                  return Source.findOne({
                    where: {
                      customer_id: this.id
                    },
                    transaction: options.transaction || null
                  })
                }
                else {
                  return source
                }
              })
              .then(source => {
                return source
              })
            },
            resolvePaymentDetailsToSources: function(options) {
              options = options || {}
            },
            /**
             *
             */
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
        // Unique identifier for a particular customer.
        token: {
          type: Sequelize.STRING,
          unique: true
        },
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
          },
          set: function(val) {
            return this.setDataValue('email', val ? val.toLowerCase() : null)
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
