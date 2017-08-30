/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')
const Errors = require('proxy-engine-errors')
const _ = require('lodash')
const shortId = require('shortid')
const queryDefaults = require('../utils/queryDefaults')
const ORDER_STATUS = require('../utils/enums').ORDER_STATUS
const ORDER_CANCEL = require('../utils/enums').ORDER_CANCEL
const ORDER_FINANCIAL = require('../utils/enums').ORDER_FINANCIAL
const PAYMENT_KIND = require('../utils/enums').PAYMENT_KIND
const TRANSACTION_STATUS = require('../utils/enums').TRANSACTION_STATUS
const TRANSACTION_KIND = require('../utils/enums').TRANSACTION_KIND
const ORDER_FULFILLMENT = require('../utils/enums').ORDER_FULFILLMENT
const ORDER_FULFILLMENT_KIND = require('../utils/enums').ORDER_FULFILLMENT_KIND
const FULFILLMENT_STATUS = require('../utils/enums').FULFILLMENT_STATUS
const PAYMENT_PROCESSING_METHOD = require('../utils/enums').PAYMENT_PROCESSING_METHOD


/**
 * @module Order
 * @description Order Model
 */
module.exports = class Order extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          autoSave: true,
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
            },
            open: {
              where: {
                status: ORDER_STATUS.OPEN
              }
            },
            closed: {
              where: {
                status: ORDER_STATUS.CLOSED
              }
            },
            cancelled: {
              where: {
                status: ORDER_STATUS.CANCELLED
              }
            }
          },
          hooks: {
            /**
             *
             * @param values
             * @param options
             * @param fn
             */
            beforeCreate: (values, options, fn) => {
              if (values.ip) {
                values.create_ip = values.ip
              }
              if (!values.token) {
                values.token = `order_${shortId.generate()}`
              }
              fn()
            },
            /**
             *
             * @param values
             * @param options
             * @param fn
             */
            afterCreate: (values, options, fn) => {
              app.services.OrderService.afterCreate(values, options)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            },
            /**
             *
             * @param values
             * @param options
             * @param fn
             */
            beforeUpdate: (values, options, fn) => {
              if (values.ip) {
                values.update_ip = values.ip
              }
              if (values.changed('status') && values.status == ORDER_STATUS.CLOSED) {
                values.close()
              }
              fn()
            },
            /**
             *
             * @param values
             * @param options
             * @param fn
             */
            afterUpdate: (values, options, fn) => {
              app.services.OrderService.afterUpdate(values, options)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            }
          },
          classMethods: {
            ORDER_STATUS: ORDER_STATUS,
            ORDER_CANCEL: ORDER_CANCEL,
            ORDER_FINANCIAL: ORDER_FINANCIAL,
            ORDER_FULFILLMENT: ORDER_FULFILLMENT,
            ORDER_FULFILLMENT_KIND: ORDER_FULFILLMENT_KIND,
            PAYMENT_KIND: PAYMENT_KIND,
            PAYMENT_PROCESSING_METHOD: PAYMENT_PROCESSING_METHOD,
            TRANSACTION_STATUS: TRANSACTION_STATUS,
            TRANSACTION_KIND: TRANSACTION_KIND,
            FULFILLMENT_STATUS: FULFILLMENT_STATUS,
            /**
             * Associate the Model
             * @param models
             */
            associate: (models) => {
              // The individual items of this order
              models.Order.hasMany(models.OrderItem, {
                as: 'order_items',
                foreignKey: 'order_id'
              })
              // The fulfillments for this order
              models.Order.hasMany(models.Fulfillment, {
                as: 'fulfillments',
                foreignKey: 'order_id'
              })
              // The transactions for this order
              models.Order.hasMany(models.Transaction, {
                as: 'transactions',
                foreignKey: 'order_id'
              })
              // The list of refunds applied to the order.
              models.Order.hasMany(models.Refund, {
                as: 'refunds',
                foreignKey: 'order_id'
              })
              // Applicable discount codes that can be applied to the order. If no codes exist the value will default to blank.
              models.Order.belongsToMany(models.Discount, {
                as: 'discount_codes',
                through: {
                  model: models.ItemDiscount,
                  unique: false,
                  scope: {
                    model: 'order'
                  }
                },
                foreignKey: 'model_id',
                constraints: false
              })
              // The tags added to this order
              models.Order.belongsToMany(models.Tag, {
                as: 'tags',
                through: {
                  model: models.ItemTag,
                  unique: false,
                  scope: {
                    model: 'order'
                  }
                },
                foreignKey: 'model_id',
                constraints: false
              })
              // The payment source used to pay this order
              models.Order.belongsToMany(models.Source, {
                as: 'sources',
                through: {
                  model: models.OrderSource,
                  unique: false
                },
                foreignKey: 'order_id',
                constraints: false
              })
              // The events tied to this order
              models.Order.hasMany(models.Event, {
                as: 'events',
                foreignKey: 'object_id',
                scope: {
                  object: 'order'
                },
                constraints: false
              })
              models.Order.hasOne(models.Cart, {
                foreignKey: 'order_id'
              })
              models.Order.belongsTo(models.Customer, {
                foreignKey: 'customer_id'
              })
              // models.Order.belongsTo(models.Customer, {
              //   targetKey:
              //   foreignKey: 'last_order_id'
              // })
              models.Order.belongsToMany(models.Event, {
                as: 'event_items',
                through: {
                  model: models.EventItem,
                  unique: false,
                  scope: {
                    object: 'order'
                  }
                },
                foreignKey: 'object_id',
                constraints: false
              })
            },
            findByIdDefault: function(id, options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Order.default(app))
              return this.findById(id, options)
            },
            findByTokenDefault: function(token, options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Order.default(app), {
                where: {
                  token: token
                }
              })
              return this.findOne(options)
            },
            findAndCountDefault: function(options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Order.default(app))
              return this.findAndCount(options)
            },
            /**
             *
             * @param order
             * @param options
             * @returns {*}
             */
            resolve: function(order, options){
              options = options || {}
              const Order =  this
              if (order instanceof Order.Instance){
                return Promise.resolve(order)
              }
              else if (order && _.isObject(order) && order.id) {
                return Order.findByIdDefault(order.id, options)
                  .then(resOrder => {
                    if (!resOrder) {
                      throw new Errors.FoundError(Error(`Order ${order.id} not found`))
                    }
                    return resOrder
                  })
              }
              else if (order && (_.isNumber(order))) {
                return Order.findByIdDefault(order, options)
                  .then(resOrder => {
                    if (!resOrder) {
                      throw new Errors.FoundError(Error(`Order ${order} not found`))
                    }
                    return resOrder
                  })
              }
              else if (order && (_.isString(order))) {
                return Order.findByTokenDefault(order, options)
                  .then(resOrder => {
                    if (!resOrder) {
                      throw new Errors.FoundError(Error(`Order ${order} not found`))
                    }
                    return resOrder
                  })
              }
              else {
                // TODO create proper error
                const err = new Error('Unable to resolve Order')
                return Promise.reject(err)
              }
            }
          },
          instanceMethods: {
            toJSON: function() {
              // Make JSON
              const resp = this.get({ plain: true })

              // Transform Tags to array on toJSON
              if (resp.tags) {
                // console.log(resp.tags)
                resp.tags = resp.tags.map(tag => {
                  if (tag && _.isString(tag)) {
                    return tag
                  }
                  else if (tag && tag.name && tag.name !== '') {
                    return tag.name
                  }
                })
              }
              return resp
            },
            /**
             *
             * @param data
             */
            cancel: function(data) {
              data = data || {}
              this.cancelled_at = new Date(Date.now())
              this.status = ORDER_STATUS.CANCELLED
              this.closed_at = this.cancelled_at
              this.cancel_reason = data.cancel_reason || ORDER_CANCEL.OTHER
              return this
            },
            /**
             *
             */
            close: function() {
              this.status = ORDER_STATUS.CLOSED
              this.closed_at = new Date(Date.now())
              return this
            },
            /**
             *
             * @param preNotification
             * @param options
             */
            notifyCustomer: function(preNotification, options) {
              options = options || {}
              return this.resolveCustomer({
                attributes: ['id','email','company','first_name','last_name','full_name'],
                transaction: options.transaction || null
              })
                .then(() => {
                  if (this.Customer && this.Customer instanceof app.orm['Customer'].Instance) {
                    return this.Customer.notifyUsers(preNotification, {transaction: options.transaction || null})
                  }
                  else {
                    return
                  }
                })
                .then(() => {
                  return this
                })
            },
            /**
             *
             * @param shipping
             * @param options
             * @returns {Promise.<T>}
             */
            addShipping: function(shipping, options) {
              shipping = shipping || []
              options = options || {}

              return this.resolveOrderItems({transaction: options.transaction || null})
                .then(() => {
                  const shippingLines = this.shipping_lines

                  if (_.isArray(shipping)) {
                    shipping.forEach(ship => {
                      const i = _.findIndex(shippingLines, (s) => {
                        return s.name === ship.name
                      })
                      // Make sure shipping price is a number
                      ship.price = parseInt(ship.price)
                      if (i > -1) {
                        shippingLines[i] = ship
                      }
                      else {
                        shippingLines.push(ship)
                      }
                    })
                  }
                  else if (_.isObject(shipping)){
                    const i = _.findIndex(shippingLines, (s) => {
                      return s.name === shipping.name
                    })
                    // Make sure shipping price is a number
                    shipping.price = parseInt(shipping.price)

                    if (i > -1) {
                      shippingLines[i] = shipping
                    }
                    else {
                      shippingLines.push(shipping)
                    }
                  }
                  this.shipping_lines = shippingLines
                  return this.save({transaction: options.transaction || null})
                })
                .then(() => {
                  return this.recalculate({transaction: options.transaction || null})
                })
            },
            /**
             *
             * @param shipping
             * @param options
             * @returns {Promise.<T>}
             */
            removeShipping: function(shipping, options){
              shipping = shipping || []
              options = options || {}

              return this.resolveOrderItems({transaction: options.transaction || null})
                .then(() => {
                  const shippingLines = this.shipping_lines

                  if (_.isArray(shipping)) {
                    shipping.forEach(ship => {
                      const i = _.findIndex(shippingLines, (s) => {
                        return s.name === ship.name
                      })
                      if (i > -1) {
                        shippingLines.splice(i, 1)
                      }
                    })
                  }
                  else if (_.isObject(shipping)) {
                    const i = _.findIndex(shippingLines, (s) => {
                      return s.name === shipping.name
                    })
                    if (i > -1) {
                      shippingLines.splice(i, 1)
                    }
                  }
                  this.shipping_lines = shippingLines
                  return this.save({transaction: options.transaction || null})
                })
                .then(() => {
                  return this.recalculate({transaction: options.transaction || null})
                })
            },
            /**
             *
             * @param taxes
             * @param options
             * @returns {Promise.<T>}
             */
            addTaxes: function(taxes, options) {
              taxes = taxes || []
              options = options || {}

              return this.resolveOrderItems({transaction: options.transaction || null})
                .then(() => {
                  const taxLines = this.tax_lines

                  if (_.isArray(taxes)) {
                    taxes.forEach(tax => {
                      const i = _.findIndex(taxLines, (s) => {
                        return s.name === tax.name
                      })
                      // Make sure taxes price is a number
                      tax.price = parseInt(tax.price)
                      if (i > -1) {
                        taxLines[i] = tax
                      }
                      else {
                        taxLines.push(tax)
                      }
                    })
                  }
                  else if (_.isObject(taxes)) {
                    const i = _.findIndex(taxLines, (s) => {
                      return s.name === taxes.name
                    })
                    // Make sure taxes price is a number
                    taxes.price = parseInt(taxes.price)

                    if (i > -1) {
                      taxLines[i] = taxes
                    }
                    else {
                      taxLines.push(taxes)
                    }
                  }
                  this.tax_lines = taxLines
                  return this.save({transaction: options.transaction || null})
                })
                .then(() => {
                  return this.recalculate({transaction: options.transaction || null})
                })
            },
            /**
             *
             * @param taxes
             * @param options
             * @returns {Promise.<T>}
             */
            removeTaxes: function(taxes, options){
              taxes = taxes || []
              options = options || {}

              return this.resolveOrderItems({transaction: options.transaction || null})
                .then(() => {
                  const taxLines = this.tax_lines

                  if (_.isArray(taxes)) {
                    taxes.forEach(tax => {
                      const i = _.findIndex(taxLines, (s) => {
                        return s.name === tax.name
                      })
                      if (i > -1) {
                        taxLines.splice(i, 1)
                      }
                    })
                  }
                  else if (_.isObject(taxes)) {
                    const i = _.findIndex(taxLines, (s) => {
                      return s.name === taxes.name
                    })
                    if (i > -1) {
                      taxLines.splice(i, 1)
                    }
                  }
                  this.tax_lines = taxLines
                  return this.save({transaction: options.transaction || null})
                })
                .then(() => {
                  return this.recalculate({transaction: options.transaction || null})
                })
            },
            /**
             *
             * @param options
             * @returns {Promise.<T>}
             */
            groupFulfillments: function(options) {
              options = options || {}
              return this.resolveOrderItems({ transaction: options.transaction || null })
                .then(() => {
                  return this.resolveFulfillments({ transaction: options.transaction || null })
                })
                .then(() => {

                  // Group by Service
                  let groups = _.groupBy(this.order_items, 'fulfillment_service')
                  // Map into array
                  groups = _.map(groups, (items, service) => {
                    return { service: service, items: items }
                  })
                  // Create the non sent fulfillments
                  return app.orm['Order'].sequelize.Promise.mapSeries(groups, (group) => {
                    const resFulfillment = this.fulfillments.find(fulfillment => fulfillment.service == group.service)
                    return resFulfillment.addOrder_items(group.items, {
                      hooks: false,
                      individualHooks: false,
                      returning: false,
                      transaction: options.transaction || null
                    })
                      .then(() => {
                        return resFulfillment.reload({ transaction: options.transaction || null })
                      })
                    // .then(() => {
                    //   return resFulfillment.saveFulfillmentStatus()
                    // })
                  })
                })
                .then((fulfillments) => {
                  fulfillments = fulfillments || []
                  this.fulfillments = fulfillments
                  this.setDataValue('fulfillments', fulfillments)
                  this.set('fulfillments', fulfillments)
                  return this
                })
            },
            /**
             *
             * @param paymentDetails
             * @param options
             * @returns {*|Promise.<T>}
             */
            groupTransactions: function(paymentDetails, options) {
              options = options || {}
              return app.orm['Order'].sequelize.Promise.mapSeries(paymentDetails, (detail, index) => {
                const transaction = app.orm['Transaction'].build({
                  // Set the customer id (in case we can save this source)
                  customer_id: this.customer_id,
                  // Set the order id
                  order_id: this.id,
                  // Set the source if it is given
                  source_id: detail.source ? detail.source.id : null,
                  // Set the order currency
                  currency: this.currency,
                  // Set the amount for this transaction and handle if it is a split transaction
                  amount: detail.amount || this.total_due,
                  // Copy the entire payment details to this transaction
                  payment_details: paymentDetails[index],
                  // Specify the gateway to use
                  gateway: detail.gateway,
                  // Set the specific type of transactions this is
                  kind: this.transaction_kind,
                  // Set the device (that input the credit card) or null
                  device_id: this.device_id || null,
                  // Set the Description
                  description: `Order ${this.name} original transaction ${this.transaction_kind}`
                })
                // Return the Payment Service
                if (this.payment_kind === PAYMENT_KIND.MANUAL) {
                  return app.services.PaymentService.manual(transaction, {
                    transaction: options.transaction || null
                  })
                }
                else {
                  return app.services.PaymentService[this.transaction_kind](transaction, {
                    transaction: options.transaction || null
                  })
                }
              })
                .then(transactions => {
                  transactions = transactions || []
                  this.transactions = transactions
                  this.setDataValue('transactions', transactions)
                  this.set('transactions', transactions)
                  return this
                })
            },
            groupSubscriptions: function(active, options) {
              options = options || {}

              return this.resolveOrderItems({transaction: options.transaction || null})
                .then(() => {

                  const orderItems = _.filter(this.order_items, 'requires_subscription')

                  const groups = []
                  const units = _.groupBy(orderItems, 'subscription_unit')

                  _.forEach(units, function(value, unit) {
                    const intervals = _.groupBy(units[unit], 'subscription_interval')
                    _.forEach(intervals, (items, interval) => {
                      groups.push({
                        unit: unit,
                        interval: interval,
                        items: items
                      })
                    })
                  })

                  return app.orm['Order'].sequelize.Promise.mapSeries(groups, group => {
                    return app.services.SubscriptionService.create(
                      this,
                      group.items,
                      group.unit,
                      group.interval,
                      active,
                      { transaction: options.transaction || null}
                    )
                  })
                })
                .then(subscriptions => {
                  subscriptions = subscriptions || []
                  this.subscriptions = subscriptions
                  this.set('subscriptions', subscriptions)
                  this.setDataValue('subscriptions', subscriptions)
                  return this
                })
            },
            /**
             *
             * @param fulfillments
             * @param options
             * @returns {Promise.<T>}
             */
            fulfill: function(fulfillments, options){
              fulfillments = fulfillments || []
              options = options || {}

              return this.resolveOrderItems({transaction: options.transaction || null})
                .then(() => {
                  return this.resolveFulfillments({transaction: options.transaction || null})
                })
                .then(() => {
                  if (_.isArray(fulfillments)) {
                    fulfillments = fulfillments.filter(fulfillment => {
                      const resFulfillment = this.fulfillments.find(f => f.id == fulfillment.fulfillment_id)
                      if (resFulfillment) {
                        return resFulfillment.fulfill({
                          status: fulfillment.status || resFulfillment.status,
                          status_url: fulfillment.status_url || resFulfillment.status_url,
                          tracking_company: fulfillment.tracking_company || resFulfillment.tracking_company,
                          tracking_number: fulfillment.tracking_number || resFulfillment.tracking_number,
                          receipt: fulfillment.receipt || resFulfillment.receipt
                        }, {transaction: options.transaction || null })
                      }
                    })
                    return this.sequelize.Promise.mapSeries(fulfillments, fulfillment => fulfillment)
                  }
                  else if (_.isObject(fulfillments)){
                    return this.sequelize.Promise.mapSeries(this.fulfillments, resFulfillment => {
                      return resFulfillment.fulfill({
                        status: fulfillments.status || resFulfillment.status,
                        status_url: fulfillments.status_url || resFulfillment.status_url,
                        tracking_company: fulfillments.tracking_company || resFulfillment.tracking_company,
                        tracking_number: fulfillments.tracking_number || resFulfillment.tracking_number,
                        receipt: fulfillments.receipt || resFulfillment.receipt
                      }, {transaction: options.transaction || null })
                    })
                  }
                  else {
                    return
                  }
                })
                .then(() => {
                  return this.saveFulfillmentStatus({transaction: options.transaction || null})
                })
            },
            /**
             *
             * @param options
             */
            resolveFinancialStatus: function(options){
              options = options || {}
              if (!this.id) {
                return Promise.resolve(this)
              }
              return this.resolveTransactions({transaction: options.transaction || null})
                .then(() => {
                  // Set the new financial status
                  this.setFinancialStatus()
                  return this
                })
            },
            /**
             *
             * @param options
             */
            resolveFulfillmentStatus: function (options) {
              options = options || {}
              if (!this.id) {
                return Promise.resolve(this)
              }
              return this.resolveFulfillments({transaction: options.transaction || null})
                .then(() => {
                  // Set the new fulfillment status
                  this.setFulfillmentStatus()
                  return this
                })
            },
            /**
             *
             * @returns {config}
             */
            setStatus: function () {
              if (
                this.financial_status === ORDER_FINANCIAL.PAID
                && this.fulfillment_status === ORDER_FULFILLMENT.FULFILLED
                && this.status === ORDER_STATUS.OPEN
              ) {
                this.close()
              }
              else if (
                this.financial_status === ORDER_FINANCIAL.CANCELLED
                && this.fulfillment_status === ORDER_FULFILLMENT.CANCELLED
                && this.status === ORDER_STATUS.OPEN
              ) {
                this.cancel()
              }
              return this
            },
            resolveStatus: function(options) {
              options = options || {}
              return this.resolveFinancialStatus({transaction: options.transaction || null})
                .then(() => {
                  return this.resolveFulfillmentStatus({transaction: options.transaction || null})
                })
                .then(() => {
                  return this.setStatus()
                })
            },
            /**
             *
             * @param options
             * @returns {*}
             */
            saveStatus: function (options) {
              options = options || {}
              if (!this.id) {
                return Promise.resolve(this)
              }
              return this.resolveStatus({transaction: options.transaction || null})
                .then(() => {
                  return this.save({
                    fields: [
                      'status',
                      'closed_at',
                      'cancelled_at',
                      'total_fulfilled_fulfillments',
                      'total_sent_fulfillments',
                      'total_cancelled_fulfillments',
                      'total_partial_fulillments',
                      'total_pending_fulfillments',
                      'fulfillment_status',
                      'financial_status',
                      'total_authorized',
                      'total_captured',
                      'total_refunds',
                      'total_voided',
                      'total_cancelled',
                      'total_pending',
                      'total_due'
                    ],
                    transaction: options.transaction || null
                  })
                })
            },
            /**
             *
             * @param options
             * @returns {*}
             */
            saveFinancialStatus: function(options) {
              options = options || {}
              let currentStatus, previousStatus
              // If not a persisted instance
              if (!this.id) {
                return Promise.resolve(this)
              }
              return this.resolveFinancialStatus({transaction: options.transaction || null})
                .then(() => {
                  if (this.changed('financial_status')) {
                    currentStatus = this.financial_status
                    previousStatus = this.previous('financial_status')
                  }
                  return this.save({
                    fields: [
                      'financial_status',
                      'total_authorized',
                      'total_captured',
                      'total_refunds',
                      'total_voided',
                      'total_cancelled',
                      'total_pending',
                      'total_due'
                    ],
                    transaction: options.transaction || null
                  })
                })
                .then(() => {
                  if (currentStatus && previousStatus) {
                    const event = {
                      object_id: this.id,
                      object: 'order',
                      objects: [{
                        customer: this.customer_id
                      },{
                        order: this.id
                      }],
                      type: `order.financial_status.${currentStatus}`,
                      message: `Order ${ this.name || 'ID ' + this.id } financial status changed from "${previousStatus}" to "${currentStatus}"`,
                      data: _.omit(this, ['events'])
                    }
                    return app.services.ProxyEngineService.publish(event.type, event, {
                      save: true,
                      transaction: options.transaction || null
                    })
                  }
                  else {
                    return
                  }
                })
                .then(() => {
                  if (currentStatus === ORDER_FINANCIAL.PAID && previousStatus !== ORDER_FINANCIAL.PAID) {
                    return this.attemptImmediate(options)
                  }
                  else {
                    return this
                  }
                })
                .then(() => {
                  return this
                })
            },
            saveFulfillmentStatus: function(options) {
              options = options || {}
              let currentStatus, previousStatus
              // If not a persisted instance return right away
              if (!this.id) {
                return Promise.resolve(this)
              }
              return this.resolveOrderItems({transaction: options.transaction || null})
                .then(() => {
                  return this.resolveFulfillments({transaction: options.transaction || null})
                })
                .then(() => {
                  this.setFulfillmentStatus()

                  if (this.changed('fulfillment_status')) {
                    currentStatus = this.fulfillment_status
                    previousStatus = this.previous('fulfillment_status')
                  }
                  return this.save({
                    fields: [
                      'total_fulfilled_fulfillments',
                      'total_sent_fulfillments',
                      'total_cancelled_fulfillments',
                      'total_partial_fulillments',
                      'total_pending_fulfillments',
                      'fulfillment_status'
                    ],
                    transaction: options.transaction || null
                  })
                })
                .then(() => {
                  if (currentStatus && previousStatus) {
                    const event = {
                      object_id: this.id,
                      object: 'order',
                      objects: [{
                        customer: this.customer_id
                      },{
                        order: this.id
                      }],
                      type: `order.fulfillment_status.${currentStatus}`,
                      message: `Order ${ this.name || 'ID ' + this.id } fulfillment status changed from "${previousStatus}" to "${currentStatus}"`,
                      data: _.omit(this, ['events'])
                    }
                    return app.services.ProxyEngineService.publish(event.type, event, {
                      save: true,
                      transaction: options.transaction || null
                    })
                  }
                  else {
                    return
                  }
                })
                .then(() => {
                  return this
                })
            },
            setFinancialStatus: function(){
              if (!this.transactions) {
                throw new Error('Order.setFinancialStatus requires transactions to be populated')
                // return Promise.reject(err)
              }

              const pending = this.transactions.filter(transaction => [
                TRANSACTION_STATUS.PENDING,
                TRANSACTION_STATUS.FAILURE,
                TRANSACTION_STATUS.ERROR
              ].indexOf(transaction.status ) > -1)

              const cancelled = this.transactions.filter(transaction => [
                TRANSACTION_STATUS.CANCELLED
              ].indexOf(transaction.status ) > -1)

              const successes = this.transactions.filter(transaction => [
                TRANSACTION_STATUS.SUCCESS
              ].indexOf(transaction.status ) > -1)

              let financialStatus = ORDER_FINANCIAL.PENDING

              let totalAuthorized = 0
              let totalVoided  = 0
              let totalSale = 0
              let totalRefund = 0
              let totalCancelled = 0
              let totalPending = 0

              // Calculate the totals of the successful transactions
              _.each(successes, transaction => {
                if (transaction.kind == TRANSACTION_KIND.AUTHORIZE) {
                  totalAuthorized = totalAuthorized + transaction.amount
                }
                else if (transaction.kind == TRANSACTION_KIND.VOID) {
                  totalVoided = totalVoided + transaction.amount
                }
                else if (transaction.kind == TRANSACTION_KIND.CAPTURE) {
                  totalSale = totalSale + transaction.amount
                }
                else if (transaction.kind == TRANSACTION_KIND.SALE) {
                  totalSale = totalSale + transaction.amount
                }
                else if (transaction.kind == TRANSACTION_KIND.REFUND) {
                  totalRefund = totalRefund + transaction.amount
                }
              })

              // Calculate the totals of pending transactions
              _.each(pending, transaction => {
                if (transaction.kind == TRANSACTION_KIND.AUTHORIZE) {
                  totalPending = totalPending + transaction.amount
                }
                else if (transaction.kind == TRANSACTION_KIND.CAPTURE) {
                  totalPending = totalPending + transaction.amount
                }
                else if (transaction.kind == TRANSACTION_KIND.SALE) {
                  totalPending = totalPending + transaction.amount
                }
                else if (transaction.kind == TRANSACTION_KIND.VOID) {
                  totalPending = totalPending - transaction.amount
                }
                else if (transaction.kind == TRANSACTION_KIND.REFUND) {
                  totalPending = totalPending - transaction.amount
                }
              })

              // Calculate the totals of cancelled pending transactions
              _.each(cancelled, transaction => {
                if (transaction.kind == TRANSACTION_KIND.AUTHORIZE) {
                  totalCancelled = totalCancelled + transaction.amount
                }
                else if (transaction.kind == TRANSACTION_KIND.CAPTURE) {
                  totalCancelled = totalCancelled + transaction.amount
                }
                else if (transaction.kind == TRANSACTION_KIND.SALE) {
                  totalCancelled = totalCancelled + transaction.amount
                }
                else if (transaction.kind == TRANSACTION_KIND.VOID) {
                  totalCancelled = totalCancelled - transaction.amount
                }
                else if (transaction.kind == TRANSACTION_KIND.REFUND) {
                  totalCancelled = totalCancelled - transaction.amount
                }
              })

              // If this item is completely free
              if (this.total_price == 0) {
                financialStatus = ORDER_FINANCIAL.PAID
              }
              // Total Authorized is the Price of the Order and there are no Capture/Sale transactions and 0 voided
              else if (totalAuthorized == this.total_price && totalSale == 0 && totalVoided == 0 && totalRefund == 0) {
                // console.log('SHOULD BE: authorized')
                financialStatus = ORDER_FINANCIAL.AUTHORIZED
              }
              // Total Authorized is the Price of the Order and there are no Capture/Sale transactions
              else if (totalAuthorized == totalVoided && totalVoided > 0) {
                // console.log('SHOULD BE: voided')
                financialStatus = ORDER_FINANCIAL.VOIDED
              }
              else if (this.total_price == totalVoided && totalVoided > 0) {
                // console.log('SHOULD BE: voided')
                financialStatus = ORDER_FINANCIAL.VOIDED
              }
              // Total Sale is the Price of the order and there are no refunds
              else if (totalSale == this.total_price && totalRefund == 0) {
                // console.log('SHOULD BE: paid')
                financialStatus = ORDER_FINANCIAL.PAID
              }
              // Total Sale is not yet the Price of the order and there are no refunds
              else if (totalSale < this.total_price && totalSale > 0 && totalRefund == 0) {
                // console.log('SHOULD BE: partially_paid')
                financialStatus = ORDER_FINANCIAL.PARTIALLY_PAID
              }
              // Total Sale is the Total Price and Total Refund is Total Price
              else if (this.total_price ==  totalRefund) {
                // console.log('SHOULD BE: refunded')
                financialStatus = ORDER_FINANCIAL.REFUNDED
              }
              // Total Sale is the Total Price but Total Refund is less than the Total Price
              else if (totalRefund < this.total_price && totalRefund > 0) {
                // console.log('SHOULD BE: partially_refunded')
                financialStatus = ORDER_FINANCIAL.PARTIALLY_REFUNDED
              }
              else if (this.total_price == totalCancelled) {
                financialStatus = ORDER_FINANCIAL.CANCELLED
              }

              app.log.debug(`ORDER ${this.id}: FINANCIAL Status: ${financialStatus}, Sales: ${totalSale}, Authorized: ${totalAuthorized}, Refunded: ${totalRefund}, Pending: ${totalPending}, Cancelled: ${totalCancelled}`)
              // pending: The finances are pending. (This is the default value.)
              // cancelled: The finances pending have been cancelled.
              // authorized: The finances have been authorized.
              // partially_paid: The finances have been partially paid.
              // paid: The finances have been paid.
              // partially_refunded: The finances have been partially refunded.
              // refunded: The finances have been refunded.
              // voided: The finances have been voided.
              this.financial_status = financialStatus
              this.total_authorized = totalAuthorized
              this.total_captured = totalSale
              this.total_refunds = totalRefund
              this.total_voided = totalVoided
              this.total_cancelled = totalCancelled
              this.total_pending = totalPending
              this.total_due = this.total_price - totalSale
              return this
            },
            /**
             *
             * @returns {config}
             */
            setFulfillmentStatus: function(){
              if (!this.fulfillments) {
                throw new Error('Order.setFulfillmentStatus requires fulfillments to be populated')
                // return Promise.reject(err)
              }
              if (!this.order_items) {
                throw new Error('Order.setFulfillmentStatus requires order_items to be populated')
                // return Promise.reject(err)
              }

              let fulfillmentStatus = ORDER_FULFILLMENT.PENDING
              let totalFulfillments = 0
              let totalPartialFulfillments = 0
              let totalSentFulfillments = 0
              let totalNonFulfillments = 0
              let totalPendingFulfillments = 0
              let totalCancelledFulfillments = 0

              this.fulfillments.forEach(fulfillment => {
                if (fulfillment.status == FULFILLMENT_STATUS.FULFILLED) {
                  totalFulfillments++
                }
                else if (fulfillment.status == FULFILLMENT_STATUS.PARTIAL) {
                  totalPartialFulfillments++
                }
                else if (fulfillment.status == FULFILLMENT_STATUS.SENT) {
                  totalSentFulfillments++
                }
                else if (fulfillment.status == FULFILLMENT_STATUS.NONE) {
                  totalNonFulfillments++
                }
                else if (fulfillment.status == FULFILLMENT_STATUS.PENDING) {
                  totalPendingFulfillments++
                }
                else if (fulfillment.status == FULFILLMENT_STATUS.CANCELLED) {
                  totalCancelledFulfillments++
                }
              })

              if (totalFulfillments == this.fulfillments.length && this.fulfillments.length > 0) {
                fulfillmentStatus = ORDER_FULFILLMENT.FULFILLED
              }
              else if (totalSentFulfillments == this.fulfillments.length && this.fulfillments.length > 0) {
                fulfillmentStatus = ORDER_FULFILLMENT.SENT
              }
              else if (totalPartialFulfillments > 0) {
                fulfillmentStatus = ORDER_FULFILLMENT.PARTIAL
              }
              else if (totalNonFulfillments >= this.fulfillments.length && this.fulfillments.length > 0) {
                fulfillmentStatus = ORDER_FULFILLMENT.NONE // back to default
              }
              else if (totalCancelledFulfillments == this.fulfillments.length && this.fulfillments.length > 0) {
                fulfillmentStatus = ORDER_FULFILLMENT.CANCELLED // back to default
              }
              else if (totalPendingFulfillments == this.fulfillments.length && this.fulfillments.length > 0) {
                fulfillmentStatus = ORDER_FULFILLMENT.PENDING // back to default
              }
              // IF done or cancelled
              if (fulfillmentStatus == ORDER_FULFILLMENT.FULFILLED || fulfillmentStatus == ORDER_FULFILLMENT.CANCELLED) {
                this.status = ORDER_STATUS.CLOSED
              }

              this.total_fulfilled_fulfillments = totalFulfillments
              this.total_partial_fulfillments = totalPartialFulfillments
              this.total_sent_fulfillments  = totalSentFulfillments
              this.total_cancelled_fulfillments  = totalCancelledFulfillments
              this.total_pending_fulfillments = totalPendingFulfillments
              this.fulfillment_status = fulfillmentStatus
              return this
            },

            /**
             *
             * @param options
             * @returns {Promise.<T>}
             */
            sendToFulfillment: function(options) {
              options = options || {}

              return this.resolveFulfillments({transaction: options.transaction || null})
                .then(() => {
                  return app.orm['Order'].sequelize.Promise.mapSeries(this.fulfillments, fulfillment => {
                    return app.services.FulfillmentService.sendFulfillment(this, fulfillment, {transaction: options.transaction || null})
                  })
                })
                .then(fulfillments => {
                  fulfillments = fulfillments || []
                  this.fulfillments = fulfillments
                  this.setDataValue('fulfillments', fulfillments)
                  this.set('fulfillments', fulfillments)

                  return this
                })
            },
            /**
             * Resolve if this should subscribe immediately
             * @returns {*}
             */
            resolveSubscribeImmediately: function(options) {
              options = options || {}
              if (!this.has_subscription) {
                return Promise.resolve(false)
              }
              return this.resolveFinancialStatus({ transaction: options.transaction || null })
                .then(() => {
                  return this.financial_status === ORDER_FINANCIAL.PAID
                })
            },
            /**
             * Resolve if this should send to fulfillment immediately
             * @returns {*}
             */
            resolveSendImmediately: function(options) {
              options = options || {}

              if (this.fulfillment_kind !== ORDER_FULFILLMENT_KIND.IMMEDIATE) {
                return Promise.resolve(false)
              }
              if ([ORDER_FULFILLMENT.PENDING, ORDER_FULFILLMENT.NONE].indexOf(this.fulfillment_status) === -1) {
                // console.log('NOT ME', this.fulfillment_status, ORDER_FULFILLMENT.PENDING, ORDER_FULFILLMENT.NONE)
                return Promise.resolve(false)
              }
              return this.resolveFinancialStatus({ transaction: options.transaction || null })
                .then(() => {
                  return this.financial_status === ORDER_FINANCIAL.PAID
                })
            },
            /**
             *
             * @param options
             * @returns {Promise.<T>}
             */
            attemptImmediate: function(options) {
              options = options || {}
              return this.resolveSendImmediately({ transaction: options.transaction || null })
                .then(immediate => {
                  if (immediate) {
                    return this.sendToFulfillment({ transaction: options.transaction || null })
                  }
                  else {
                    return this.fulfillments
                  }
                })
                .then(() => {
                  // Determine if this subscription should be created immediately
                  return this.resolveSubscribeImmediately({ transaction: options.transaction || null })
                })
                .then(immediate => {
                  // console.log('WILL SUBSCRIBE', immediate, this)
                  if (immediate) {
                    return this.groupSubscriptions(
                      immediate,
                      { transaction: options.transaction || null }
                    )
                  }
                  else {
                    return
                  }
                })
                .then((subscriptions) => {
                  return this
                })
            },
            /**
             * Builds obj for Order Item
             * @param item
             * @param qty
             * @param properties
             */
            // TODO resolve vendor, check fulfillable quantity, calculate price
            buildOrderItem: function(item, qty, properties) {
              qty = qty || 0
              item.Product = item.Product || {}
              const OrderItem = app.orm['OrderItem']

              return OrderItem.build({
                order_id: this.id,
                product_id: item.product_id,
                title: item.Product.title,
                product_handle: item.Product.handle,
                variant_id: item.id,
                variant_title: item.title,
                sku: item.sku,
                type: item.type,
                name: item.title == item.Product.title ? item.title : `${item.Product.title} - ${item.title}`,
                quantity: qty,
                properties: properties,
                option: item.option,
                barcode: item.barcode,
                price: item.price,
                calculated_price: item.price * qty,
                compare_at_price: item.compare_at_price * qty,
                price_per_unit: item.price,
                currency: item.currency,
                fulfillment_service: item.fulfillment_service,
                gift_card: item.gift_card,
                requires_shipping: item.requires_shipping,
                taxable: item.requires_tax,
                tax_code: item.tax_code,
                tax_lines: item.tax_lines || [],
                shipping_lines: item.shipping_lines || [],
                discounted_lines: item.discounted_lines || [],
                coupon_lines: item.coupon_lines || [],
                requires_subscription: item.requires_subscription,
                subscription_interval: item.subscription_interval,
                subscription_unit: item.subscription_unit,
                weight: item.weight * qty,
                weight_unit: item.weight_unit,
                images: item.images.length > 0 ? item.images : item.Product.images || [],
                fulfillable_quantity: item.fulfillable_quantity || qty,
                max_quantity: item.max_quantity,
                grams: app.services.ProxyCartService.resolveConversion(item.weight, item.weight_unit) * qty,
                total_discounts: 0,
                average_shipping: item.Product.average_shipping,
                exclude_payment_types: item.Product.exclude_payment_types,
                vendor_id: item.Product.vendors ? item.Product.vendors[0].id : null,
                live_mode: item.live_mode
              })
            },
            /**
             *
             * @param orderItem
             * @param options
             * @returns {*}
             */
            // TODO add new tax_lines shipping_lines coupon_lines discount_lines to parent order
            addItem: function(orderItem, options) {
              options = options || {}
              if (!this.order_items) {
                const err = new Error('Order.addItem requires order_items to be populated')
                return Promise.reject(err)
              }
              return Promise.resolve()
                .then(() => {
                  const prevOrderItem = this.order_items.find(item =>
                    item.product_id === orderItem.product_id && item.variant_id === orderItem.variant_id)

                  if (!prevOrderItem) {
                    return orderItem.reconcileFulfillment({ transaction: options.transaction || null })
                      .then(() =>{
                        return orderItem.save({ transaction: options.transaction || null })
                      })
                  }
                  else {
                    prevOrderItem.quantity = prevOrderItem.quantity + orderItem.quantity
                    prevOrderItem.fufillable_quantity = prevOrderItem.fufillable_quantity + orderItem.fulfillable_quantity
                    prevOrderItem.price = prevOrderItem.price + orderItem.price
                    prevOrderItem.calculated_price = prevOrderItem.calculated_price + orderItem.calculated_price
                    prevOrderItem.weight = prevOrderItem.weight + orderItem.weight
                    prevOrderItem.total_weight = prevOrderItem.total_weight + orderItem.total_weight

                    if (orderItem.properties) {
                      prevOrderItem.properties = orderItem.properties
                    }
                    return prevOrderItem.reconcileFulfillment({ transaction: options.transaction || null })
                      .then(() =>{
                        return prevOrderItem.save({transaction: options.transaction || null})
                      })
                  }
                })
                .then(() => {
                  return this.reload({transaction: options.transaction || null})
                })
            },
            /**
             *
             * @param orderItem
             * @param options
             * @returns {*}
             */
            // TODO add new tax_lines shipping_lines coupon_lines discount_lines to parent order
            updateItem: function(orderItem, options) {
              options = options || {}
              if (!this.order_items) {
                const err = new Error('Order.addItem requires order_items to be populated')
                return Promise.reject(err)
              }

              return Promise.resolve()
                .then(() => {
                  const prevOrderItem = this.order_items.find(item =>
                    item.product_id === orderItem.product_id && item.variant_id === orderItem.variant_id)

                  if (!prevOrderItem) {
                    return
                  }

                  prevOrderItem.quantity = prevOrderItem.quantity + orderItem.quantity
                  prevOrderItem.price = prevOrderItem.price + orderItem.price
                  prevOrderItem.calculated_price = prevOrderItem.calculated_price + orderItem.calculated_price
                  prevOrderItem.weight = prevOrderItem.weight + orderItem.weight
                  prevOrderItem.total_weight = prevOrderItem.total_weight + orderItem.total_weight

                  if (orderItem.properties) {
                    prevOrderItem.properties = orderItem.properties
                  }

                  return prevOrderItem.reconcileFulfillment({ transaction: options.transaction || null })
                    .then(() =>{
                      return prevOrderItem.save({transaction: options.transaction || null})
                    })
                })
                .then(() => {
                  return this.reload({transaction: options.transaction || null})
                })
            },
            /**
             *
             * @param orderItem
             * @param options
             * @returns {*}
             */
            // TODO remove tax_lines shipping_lines coupon_lines discount_lines to parent order
            removeItem: function(orderItem, options) {
              options = options || {}
              if (!this.order_items) {
                const err = new Error('Order.addItem requires order_items to be populated')
                return Promise.reject(err)
              }

              return Promise.resolve()
                .then(() => {
                  const prevOrderItem = this.order_items.find(item =>
                    item.product_id === orderItem.product_id && item.variant_id === orderItem.variant_id)

                  if (!prevOrderItem) {
                    return
                  }

                  prevOrderItem.quantity = prevOrderItem.quantity - orderItem.quantity
                  prevOrderItem.price = prevOrderItem.price - orderItem.price
                  prevOrderItem.calculated_price = prevOrderItem.calculated_price - orderItem.calculated_price
                  prevOrderItem.weight = prevOrderItem.weight - orderItem.weight
                  prevOrderItem.total_weight = prevOrderItem.total_weight - orderItem.total_weight

                  if (prevOrderItem.quantity <= 0) {
                    return prevOrderItem.reconcileFulfillment({ transaction: options.transaction || null })
                      .then(() =>{
                        return prevOrderItem.destroy({transaction: options.transaction || null})
                      })
                  }
                  else {
                    return prevOrderItem.reconcileFulfillment({ transaction: options.transaction || null })
                      .then(() =>{
                        return prevOrderItem.save({transaction: options.transaction || null})
                      })
                  }
                })
                .then(() => {
                  return this.reload({transaction: options.transaction || null})
                })
            },
            /**
             *
             * @param options
             * @returns {*}
             */
            reconcileTransactions: function(options) {
              options = options || {}
              // Get fresh financial status
              this.setFinancialStatus()
              // Test if the total due has changed
              if (this.changed('total_due')) {
                // partially cancel/void/refund
                if (this.total_due <= this.previous('total_due')) {
                  const amount = this.previous('total_due') - this.total_due
                  return app.services.TransactionService.reconcileUpdate(
                    this,
                    amount,
                    { transaction: options.transaction || null }
                  )
                }
                // authorize/capture/sale
                else {
                  const amount = this.total_due - this.previous('total_due')
                  // console.log('CREATE NEW TRANSACTION', amount)
                  return app.services.TransactionService.reconcileCreate(
                    this,
                    amount,
                    { transaction: options.transaction || null }
                  )
                }
              }
              else {
                return Promise.resolve(this)
              }
            },
            /**
             * Resolve Order's Customer if there is one
             * @param options
             */
            resolveCustomer: function(options) {
              options = options || {}
              if (this.Customer && this.Customer instanceof app.orm['Customer'].Instance) {
                return Promise.resolve(this)
              }
              // Some orders may not have a customer Id
              else if (!this.customer_id) {
                return Promise.resolve(this)
              }
              else {
                return this.getCustomer({transaction: options.transaction || null})
                  .then(customer => {
                    customer = customer || null
                    this.Customer = customer
                    this.setDataValue('Customer', customer)
                    this.set('Customer', customer)
                    return this
                  })
              }
            },
            resolveOrderItems: function(options) {
              options = options || {}
              if (this.order_items) {
                return Promise.resolve(this)
              }
              else {
                return this.getOrder_items({transaction: options.transaction || null})
                  .then(orderItems => {
                    orderItems = orderItems || []
                    this.order_items = orderItems
                    this.setDataValue('order_items', orderItems)
                    this.set('order_items', orderItems)
                    return this
                  })
              }
            },
            /**
             *
             * @param options
             */
            resolveRefunds: function(options) {
              options = options || {}
              if (this.refunds) {
                return Promise.resolve(this)
              }
              else {
                return this.getRefunds({transaction: options.transaction || null})
                  .then(refunds => {
                    refunds = refunds || []
                    this.refunds = refunds
                    this.setDataValue('refunds', refunds)
                    this.set('refunds', refunds)
                    return this
                  })
              }
            },
            /**
             *
             * @param options
             */
            resolveTransactions: function(options) {
              options = options || {}
              if (this.transactions) {
                return Promise.resolve(this)
              }
              else {
                return this.getTransactions({transaction: options.transaction || null})
                  .then(transactions => {
                    transactions = transactions || []
                    this.transactions = transactions
                    this.setDataValue('transactions', transactions)
                    this.set('transactions', transactions)
                    return this
                  })
              }
            },
            /**
             *
             * @param options
             * @returns {*}
             */
            resolveFulfillments: function(options) {
              options = options || {}
              if (this.fulfillments) {
                return this.sequelize.Promise.mapSeries(this.fulfillments, fulfillment => {
                  return fulfillment.resolveOrderItems({transaction: options.transaction || null})
                })
                  .then(fulfillments => {
                    fulfillments = fulfillments || []
                    this.fulfillments = fulfillments
                    this.setDataValue('fulfillments', fulfillments)
                    this.set('fulfillments', fulfillments)
                    return this
                  })
              }
              else {
                return this.getFulfillments({
                  include: [{
                    model: app.orm['OrderItem'],
                    as: 'order_items'
                  }],
                  transaction: options.transaction || null
                })
                  .then(fulfillments => {
                    fulfillments = fulfillments || []
                    this.fulfillments = fulfillments
                    this.setDataValue('fulfillments', fulfillments)
                    this.set('fulfillments', fulfillments)
                    return this
                  })
              }
            },
            /**
             *
             * @returns {Promise.<T>}
             */
            recalculate: function(options) {
              options = options || {}

              let totalLineItemsPrice = 0
              let totalShipping = 0
              let totalTax = 0
              let totalDiscounts = 0
              let totalCoupons = 0
              let totalOverrides = 0
              let totalItems = 0

              this.tax_lines.forEach(i => {
                totalTax = totalTax + i.price
              })
              this.shipping_lines.forEach(i => {
                totalShipping = totalShipping + i.price
              })
              this.pricing_overrides.forEach(i => {
                totalOverrides = totalOverrides + i.price
              })
              this.discounted_lines.forEach(i => {
                totalDiscounts = totalDiscounts + i.price
              })
              this.coupon_lines.forEach(i => {
                totalCoupons = totalCoupons + i.price
              })

              this.total_tax = totalTax
              this.total_shipping = totalShipping
              this.total_discounts = totalDiscounts
              this.total_coupons = totalCoupons
              this.total_overrides = totalOverrides

              return this.resolveOrderItems({ transaction: options.transaction || null })
                .then(() => {
                  this.order_items.forEach(item => {
                    totalLineItemsPrice = totalLineItemsPrice + item.price
                    totalItems = totalItems + item.quantity
                  })

                  // Set the Total Items
                  this.total_items = totalItems

                  // Set the Total Line Items Price
                  this.total_line_items_price = totalLineItemsPrice

                  this.subtotal_price = Math.max(0, this.total_line_items_price)
                  this.total_price = Math.max(0, this.total_line_items_price + this.total_tax + this.total_shipping - this.total_discounts - this.total_coupons - this.total_overrides)
                  // resolve current transactions
                  return this.resolveTransactions({ transaction: options.transaction || null })
                })
                .then(() => {
                  // reconcile the transactions
                  return this.reconcileTransactions({ transaction: options.transaction || null })
                })
                .then(() => {
                  // resolve the current fulfillments
                  return this.resolveFulfillments({ transaction: options.transaction || null })
                })
                .then(() => {
                  // Set the new Financial Status
                  this.setFinancialStatus()
                  // Set the new Fulfillment Status
                  this.setFulfillmentStatus()
                  // Set the new Overall Status
                  this.setStatus()
                  // Save the changes
                  return this.save({transaction: options.transaction || null})
                })
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
        // Unique identifier for a particular cart that is attached to a particular order.
        cart_token: {
          type: Sequelize.STRING,
          // references: {
          //   model: app.models['Cart'],
          //   key: 'token'
          // }
        },
        subscription_token: {
          type: Sequelize.STRING,
          // references: {
          //   model: app.models['Subscription'],
          //   key: 'token'
          // }
        },
        // Unique identifier for a particular order.
        token: {
          type: Sequelize.STRING,
          unique: true
        },
        customer_id: {
          type: Sequelize.INTEGER,
          allowNull: true
          // references: {
          //   model: app.models['Customer'],
          //   key: 'id'
          // }
        },
        shop_id: {
          type: Sequelize.INTEGER,
          // references: {
          //   model: app.models['Shop'],
          //   key: 'id'
          // }
        },
        // TODO Enable User or Owner
        // Only present on orders processed at point of sale. The unique numerical identifier for the user logged into the terminal at the time the order was processed at.
        user_id: {
          type: Sequelize.INTEGER,
          // references: {
          //   model: 'User',
          //   key: 'id'
          // }
        },
        // If this order contains an item that requires shipping
        has_shipping: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // If this order contains an item that requires a subscription
        has_subscription: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        total_items: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // Billing Address on Order
        billing_address: helpers.JSONB('Order', app, Sequelize, 'billing_address', {
          defaultValue: {}
        }),
        // Shipping Address on Order
        shipping_address: helpers.JSONB('Order', app, Sequelize, 'shipping_address', {
          defaultValue: {}
        }),
        // If Buyer Accepts marketing
        buyer_accepts_marketing: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        // The reason why the order was cancelled. If the order was not cancelled, this value is "null."
        cancel_reason: {
          type: Sequelize.ENUM,
          values: _.values(ORDER_CANCEL)
        },
        // The time the order was cancelled
        cancelled_at: {
          type: Sequelize.DATE
        },
        // The details from the browser that placed the order
        client_details: helpers.JSONB('Order', app, Sequelize, 'client_details', {
          defaultValue: {
            'host': null,
            'accept_language': null,
            'browser_height': null,
            'browser_ip': '0.0.0.0',
            'browser_width': null,
            'session_hash': null,
            'user_agent': null,
            'latitude': null,
            'longitude': null
          }
        }),
        status: {
          type: Sequelize.ENUM,
          values: _.values(ORDER_STATUS),
          defaultValue: ORDER_STATUS.OPEN
        },
        // The time the order was closed at.
        closed_at: {
          type: Sequelize.DATE
        },
        // The three letter code (ISO 4217) for the currency used for the payment.
        currency: {
          type: Sequelize.STRING,
          defaultValue: app.config.proxyCart.default_currency || 'USD'
        },
        // The customer's email address. Is required when a billing address is present.
        email: {
          type: Sequelize.STRING,
          validate: {
            isEmail: true
          }
        },
        // manual: Delay 3rd party processing
        // immediate: Immediately process 3rd party payment processing
        payment_kind: {
          type: Sequelize.ENUM,
          values: _.values(PAYMENT_KIND),
          defaultValue: app.config.proxyCart.orders.payment_kind || PAYMENT_KIND.IMMEDIATE
        },
        // pending: The finances are pending.
        // authorized: The finances have been authorized.
        // partially_paid: The finances have been partially paid.
        // paid: The finances have been paid. (This is the default value.)
        // partially_refunded: The finances have been partially refunded.
        // refunded: The finances have been refunded.
        // voided: The finances have been voided.
        financial_status: {
          type: Sequelize.ENUM,
          values: _.values(ORDER_FINANCIAL),
          defaultValue: ORDER_FINANCIAL.PENDING
        },
        // authorize:
        // sale:
        transaction_kind: {
          type: Sequelize.ENUM,
          values: _.values(TRANSACTION_KIND),
          defaultValue: app.config.proxyCart.orders.transaction_kind || TRANSACTION_KIND.AUTHORIZE
        },

        // fulfilled: the order has been completely fulfilled
        // none: the order has no fulfillments
        // partial: the order has some fulfillments
        fulfillment_status: {
          type: Sequelize.ENUM,
          values: _.values(ORDER_FULFILLMENT),
          defaultValue: ORDER_FULFILLMENT.PENDING
        },
        // immediate: immediately send to fulfillment providers
        // manual: wait until manually sent to fulfillment providers
        fulfillment_kind: {
          type: Sequelize.ENUM,
          values: _.values(ORDER_FULFILLMENT_KIND),
          defaultValue: app.config.proxyCart.orders.fulfillment_kind || ORDER_FULFILLMENT_KIND.MANUAL
        },
        // The site this sale originated from
        landing_site: {
          type: Sequelize.STRING
        },
        // Only present on orders processed at point of sale. The unique numeric identifier for the physical location at which the order was processed.
        location_id: {
          type: Sequelize.STRING
        },
        // The customer's order name as represented by a number.
        name: {
          type: Sequelize.STRING
        },
        //identifier unique to the shop. A number is a shop and order sequential and starts at 1.
        number: {
          type: Sequelize.STRING
        },
        // The text of an optional note that a shop owner can attach to the order.
        note: {
          type: Sequelize.STRING
        },
        // "note_attributes": ["name": "custom name","value": "custom value"]
        // Extra information that is added to the order. Each array entry must contain a hash with "name" and "value" keys as shown above.
        note_attributes: helpers.JSONB('Order', app, Sequelize, 'note_attributes', {
          defaultValue: {}
        }),
        // The list of all payment gateways used for the order.
        payment_gateway_names: helpers.JSONB('Order', app, Sequelize, 'payment_gateway_names', {
          defaultValue: []
        }),
        // The date and time when the order was imported, in ISO 8601 format. This value can be set to dates in the past when importing from other systems. If no value is provided, it will be auto-generated.
        processed_at: {
          type: Sequelize.DATE
        },
        // States the type of payment processing method. Valid values are: checkout, subscription, direct, manual, offsite or express.
        processing_method: {
          type: Sequelize.ENUM,
          values: _.values(PAYMENT_PROCESSING_METHOD)
        },
        // The website that the customer clicked on to come to the shop.
        referring_site: {
          type: Sequelize.STRING
        },
        // An array of shipping_line objects, each of which details the shipping methods used.
        shipping_lines: helpers.JSONB('Order', app, Sequelize, 'shipping_lines', {
          defaultValue: []
        }),
        // The line_items that have discounts
        discounted_lines: helpers.JSONB('Order', app, Sequelize, 'discounted_lines', {
          defaultValue: []
        }),
        // The line_items that have coupons
        coupon_lines: helpers.JSONB('Order', app, Sequelize, 'coupon_lines', {
          defaultValue: []
        }),
        // The pricing overrides
        pricing_overrides: helpers.JSONB('Order', app, Sequelize, 'pricing_overrides', {
          defaultValue: []
        }),
        // USER id of the admin who did the override
        pricing_override_id: {
          type: Sequelize.INTEGER
        },
        // The total amount of pricing overrides
        total_overrides: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // Where the order originated. May only be set during creation, and is not writable thereafter. Orders created through official Proxy Engine channels have protected values that cannot be assigned by other API clients during order creation. These protected values are: "web", "pos", "iphone", and "android" Orders created via the API may be assigned any other string of your choice. If source_name is unspecified, new orders are assigned the value "api".
        source_name: {
          type: Sequelize.STRING,
          defaultValue: 'api'
        },
        // Price of the order before shipping and taxes
        subtotal_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // An array of tax_line objects, each of which details the total taxes applicable to the order.
        tax_lines: helpers.JSONB('Order', app, Sequelize, 'tax_lines', {
          defaultValue: []
        }),
        // tax_lines: helpers.ARRAY('Order', app, Sequelize, Sequelize.JSONB, 'tax_lines', {
        //   defaultValue: []
        // }),
        // An array of refund_line objects, each of which details the total refunds applicable to the order.
        refunded_lines: helpers.JSONB('Order', app, Sequelize, 'refunded_lines', {
          defaultValue: []
        }),
        // refunded_lines: helpers.ARRAY('Order', app, Sequelize, Sequelize.JSONB, 'refunded_lines', {
        //   defaultValue: []
        // }),
        // States whether or not taxes are included in the order subtotal. Valid values are "true" or "false".
        taxes_included: {
          type: Sequelize.BOOLEAN
        },
        // The total amount of the discounts applied to the price of the order.
        total_discounts: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The total amount of coupons applied to the price of the order
        total_coupons: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The total amount of shipping applied to the price of the order
        total_shipping: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The total still due
        total_due: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The total amount of refunded transactions
        total_refunds: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The total amount of authorized transactions
        total_authorized: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The total amount of captured transactions
        total_captured: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The total amount of voided transactions
        total_voided: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The total amount of voided transactions
        total_cancelled: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The total amount awaiting success
        total_pending: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The sum of all the prices of all the items in the order.
        total_line_items_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The sum of all the prices of all the items in the order, taxes and discounts included (must be positive).
        total_price: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The sum of all the taxes applied to the order (must be positive).
        total_tax: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The sum of all the weights of the line items in the order, in grams.
        total_weight: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The total amount of Fulfillments fulfilled
        total_fulfilled_fulfillments: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The total amount of Fulfillments partially fulfilled
        total_partial_fulfillments: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The total amount of Fulfillments left to send to fulfillment
        total_sent_fulfillments: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        total_cancelled_fulfillments: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // The total amount of Fulfillments not yet fulfilled
        total_pending_fulfillments: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        // IP addresses
        ip: {
          type: Sequelize.STRING
        },
        // IP address that created the order
        create_ip: {
          type: Sequelize.STRING
        },
        // IP address that last updated the order
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
