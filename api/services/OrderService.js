/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
const PAYMENT_PROCESSING_METHOD = require('../utils/enums').PAYMENT_PROCESSING_METHOD
const FULFILLMENT_STATUS = require('../utils/enums').FULFILLMENT_STATUS
const ORDER_FULFILLMENT = require('../utils/enums').ORDER_FULFILLMENT
const ORDER_FULFILLMENT_KIND = require('../utils/enums').ORDER_FULFILLMENT_KIND
const TRANSACTION_STATUS = require('../utils/enums').TRANSACTION_STATUS
const TRANSACTION_KIND = require('../utils/enums').TRANSACTION_KIND
const ORDER_FINANCIAL = require('../utils/enums').ORDER_FINANCIAL
/**
 * @module OrderService
 * @description Order Service
 */
module.exports = class OrderService extends Service {
  /**
   * resolves an Order from either an Instance, an ID, or an Object with ID
   * @param order
   * @param options
   * @returns {Promise}
   */
  resolve(order, options) {
    const Order =  this.app.orm['Order']
    if (order instanceof Order.Instance){
      return Promise.resolve(order)
    }
    else if (order && _.isObject(order) && order.id) {
      return Order.findById(order.id, options)
        .then(resOrder => {
          if (!resOrder) {
            throw new Errors.FoundError(Error(`Order ${order.id} not found`))
          }
          return resOrder
        })
    }
    else if (order && (_.isString(order) || _.isNumber(order))) {
      return Order.findById(order, options)
        .then(resOrder => {
          if (!resOrder) {
            throw new Errors.FoundError(Error(`Order ${order} not found`))
          }
          return resOrder
        })
    }
    else {
      const err = new Error('Unable to resolve Order')
      Promise.reject(err)
    }
  }

  resolveItem(item, options) {
    const OrderItem =  this.app.orm.OrderItem
    if (item instanceof OrderItem.Instance){
      return Promise.resolve(item)
    }
    else if (item && _.isObject(item) && item.id) {
      return OrderItem.findById(item.id, options)
        .then(resOrderItem => {
          if (!resOrderItem) {
            throw new Errors.FoundError(Error(`Order ${item.id} not found`))
          }
          return resOrderItem
        })
    }
    else if (item && (_.isString(item) || _.isNumber(item))) {
      return OrderItem.findById(item, options)
        .then(resOrderItem => {
          if (!resOrderItem) {
            throw new Errors.FoundError(Error(`Order ${item} not found`))
          }
          return resOrderItem
        })
    }
    else {
      const err = new Error('Unable to resolve Order Item')
      Promise.reject(err)
    }
  }

  /**
   *
   * @param obj
   * @returns {Promise}
   */
  // TODO handle inventory policy and coupon policy
  create(obj) {
    const Address = this.app.orm.Address
    const Customer = this.app.orm.Customer
    const Order = this.app.orm.Order
    const OrderItem = this.app.orm.OrderItem
    const PaymentService = this.app.services.PaymentService

    // Validate obj cart and customer
    if (!obj.cart_token && !obj.subscription_token) {
      const err = new Errors.FoundError(Error('Missing a Cart token or a Subscription token'))
      return Promise.reject(err)
    }
    if (!obj.payment_details) {
      const err = new Errors.FoundError(Error('Missing Payment Details'))
      return Promise.reject(err)
    }

    // Set the initial total amount due for this order
    let totalDue = obj.total_due
    let resOrder = {}
    let resCustomer = {}
    let resBillingAddress = {}
    let resShippingAddress = {}
    let resTransactions = []

    return Order.sequelize.transaction(t => {
      return Customer.findById(obj.customer_id, {
        include: [
          {
            model: Address,
            as: 'shipping_address'
          },
          {
            model: Address,
            as: 'billing_address'
          }
        ]
      })
        .then(customer => {
          // The customer exist, the order requires shipping, but no shipping information
          if (customer && !customer.shipping_address && !obj.shipping_address && obj.has_shipping) {
            throw new Errors.FoundError(Error(`Could not find customer shipping address for id '${obj.customer_id}'`))
          }
          // The customer exist, the order requires shipping, but no billing information
          if (customer && !customer.billing_address && !obj.billing_address && obj.has_shipping) {
            throw new Errors.FoundError(Error(`Could not find customer billing address for id '${obj.customer_id}'`))
          }
          // Set a blank customer object if there isn't one for this order
          if (!customer) {
            resCustomer = {
              id: null,
              email: null,
              account_balance: 0,
              billing_address: null,
              shipping_address: null
            }
          }
          // Return this resolved customer
          else {
            resCustomer = customer
          }
          // Resolve the Billing Address
          resBillingAddress = this.resolveToAddress(resCustomer.billing_address, obj.billing_address)
          // Resolve the Shipping Address
          resShippingAddress = this.resolveToAddress(resCustomer.shipping_address, obj.shipping_address)

          if (!resShippingAddress && obj.has_shipping) {
            throw new Error('Order does not have a valid shipping address')
          }

          // If not Billing Address, add Shipping Address
          if (!resBillingAddress) {
            resBillingAddress = resShippingAddress
          }

          // If not payment_details, make blank array
          if (!obj.payment_details){
            obj.payment_details = []
          }
          // Map the gateway names being used
          const paymentGatewayNames = obj.payment_details.map(detail => { return detail.gateway })
          // console.log('OrderService.create', resShippingAddress, resBillingAddress)

          // Apply Customer Account balance
          totalDue = Math.max(0, totalDue - resCustomer.account_balance)

          const order = {
            // Order Info
            processing_method: obj.processing_method || PAYMENT_PROCESSING_METHOD.DIRECT,
            processed_at: new Date(),

            // Cart/Subscription Info
            cart_token: obj.cart_token,
            subscription_token: obj.subscription_token,
            currency: obj.currency,
            order_items: obj.line_items,
            tax_lines: obj.tax_lines,
            shipping_lines: obj.shipping_lines,
            discounted_lines: obj.discounted_lines,
            coupon_lines: obj.coupon_lines,
            subtotal_price: obj.subtotal_price,
            taxes_included: obj.taxes_included,
            total_discounts: obj.total_discounts,
            total_line_items_price: obj.total_line_items_price,
            total_price: obj.total_due,
            total_due: totalDue,
            total_tax: obj.total_tax,
            total_shipping: obj.total_shipping,
            total_weight: obj.total_weight,
            total_items: obj.total_items,
            shop_id: obj.shop_id,
            has_shipping: obj.has_shipping,
            has_subscription: obj.has_subscription,

            // Gateway
            payment_gateway_names: paymentGatewayNames,

            // Client Info
            client_details: obj.client_details,
            ip: obj.ip,

            // Customer Info
            customer_id: resCustomer.id, // (May Be Null)
            buyer_accepts_marketing: resCustomer.accepts_marketing || obj.buyer_accepts_marketing,
            email: resCustomer.email || obj.email || null,
            billing_address: resBillingAddress,
            shipping_address: resShippingAddress
          }

          return Order.create(order, {
            include: [
              {
                model: OrderItem,
                as: 'order_items'
              }
            ]
          })
        })
        .then(order => {
          if (!order) {
            throw new Error('Unexpected Error while creating order')
          }
          resOrder = order

          if (resCustomer instanceof Customer.Instance) {
            resCustomer.setAccountBalance(Math.max(0, resCustomer.account_balance - totalDue))
            resCustomer.setTotalSpent(totalDue)
            resCustomer.setLastOrder(resOrder)
            return resCustomer.save()
          }
          else {
            return null
          }
        })
        .then(customer => {
          if (customer) {
            const event = {
              object_id: customer.id,
              object: 'customer',
              type: 'customer.order.created',
              data: resOrder
            }
            this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
          }
          // Set proxy cart default payment kind if not set by order.create
          let orderPayment = obj.payment_kind || this.app.config.proxyCart.order_payment_kind
          // Set transaction type to 'manual' if none is specified
          if (!orderPayment) {
            this.app.log.debug(`Order does not have a payment function, defaulting to ${TRANSACTION_KIND.MANUAL}`)
            orderPayment = TRANSACTION_KIND.MANUAL
          }

          return Promise.all(obj.payment_details.map((detail, index) => {
            const transaction = {
              // Set the customer id (in case we can save this source)
              customer_id: resCustomer.id,
              // Set the order id
              order_id: resOrder.id,
              // Set the order currency
              currency: resOrder.currency,
              // Set the amount for this transaction and handle if it is a split transaction
              amount: detail.amount || resOrder.total_due,
              // Copy the entire payment details to this transaction
              payment_details: obj.payment_details[index],
              // Specify the gateway to use
              gateway: detail.gateway,
              // Set the device (that input the credit card) or null
              device_id: obj.device_id || null
            }
            // Return the Payment Service
            return PaymentService[orderPayment](transaction)
          }))
        })
        .then(transactions => {
          resTransactions = transactions
          let orderFulfillment = obj.fulfillment_kind || this.app.config.proxyCart.order_fulfillment_kind
          if (!orderFulfillment) {
            this.app.log.debug(`Order does not have a fulfillment function, defaulting to ${ORDER_FULFILLMENT_KIND.MANUAL}`)
            orderFulfillment = ORDER_FULFILLMENT_KIND.MANUAL
          }

          // Determine if this can be fulfilled immediately
          if (this.resolveSendImmediately(resTransactions, orderFulfillment)) {
            return this.app.services.FulfillmentService.sendOrderToFulfillment(resOrder)
          }
          else {
            return []
          }
        })
        .then(fulfillments => {
          // Determine if this subscription should be created immediately
          const subscribe = this.resolveSubscribeImmediately(resTransactions, resOrder.has_subscription)
          if (resOrder.has_subscription) {
            return this.app.services.SubscriptionService.setupSubscriptions(resOrder, subscribe)
          }
          return []
        })
        .then(subscriptions => {
          //console.log('BROKE', subscriptions)
          return Order.findByIdDefault(resOrder.id)
        })
    })
  }

  /**
   *
   * @param order
   * @returns {Promise.<T>}
   */
  update(order) {
    const Order = this.app.orm.Order

    return this.resolve(order)
      .then(resOrder => {
        if (resOrder.fulfillment_status !== (FULFILLMENT_STATUS.NONE || FULFILLMENT_STATUS.SENT) || resOrder.cancelled_at) {
          throw new Error(`${order.name} can not be updated as it is already being fulfilled`)
        }
        if (order.billing_address) {
          resOrder.billing_address = _.extend(resOrder.billing_address, order.billing_address)
          resOrder.billing_address = this.app.services.ProxyCartService.validateAddress(resOrder.billing_address)
        }
        if (order.shipping_address) {
          resOrder.shipping_address = _.extend(resOrder.shipping_address, order.shipping_address)
          resOrder.shipping_address = this.app.services.ProxyCartService.validateAddress(resOrder.shipping_address)
        }
        if (order.buyer_accepts_marketing) {
          resOrder.buyer_accepts_marketing = order.buyer_accepts_marketing
        }

        return resOrder.save()
      })
      .then(resOrder => {
        return Order.findByIdDefault(resOrder.id)
      })
  }

  /**
   * Remove an Item from Order
   * @param data
   * @returns {Promise.<T>}
   */
  // TODO
  removeItem(data) {
    return Promise.resolve(data)
  }
  /**
   * Pay an item
   * @param order
   * @returns {*|Promise.<TResult>}
   */
  // TODO
  pay(order, gateway) {
    return this.resolve(order)
      .then(order => {
        if (order.financial_status !== (ORDER_FINANCIAL.AUTHORIZED || ORDER_FINANCIAL.PARTIALLY_PAID)) {
          throw new Error(`Order status is ${order.financial_status} not '${ORDER_FINANCIAL.AUTHORIZED} or ${ORDER_FINANCIAL.PARTIALLY_PAID}'`)
        }
        return order
      })
      .then(order => {
        if (!order.transactions || order.transactions.length == 0) {
          return order.getTransactions()
        }
        else {
          return order
        }
      })
      .then(order => {
        return order
      })
  }

  /**
   * Pay multiple orders
   * @param orders
   * @returns {Promise.<*>}
   */
  payOrders(orders) {
    return Promise.all(orders.map(order => {
      return this.pay(order)
    }))
  }
  /**
   * Refund an Order
   * @param order
   * @returns {*|Promise.<TResult>}
   */
  // TODO
  refund(order, refund) {
    return this.resolve(order)
      .then(order => {

        return order
      })
  }

  /**
   * Cancel and Order
   * @param order
   * @returns {Promise.<TResult>}
   */
  // TODO cancel fulfillments, refund transactions
  cancel(order) {
    const reason = order.cancel_reason
    let resOrder
    return this.resolve(order)
      .then(order => {
        resOrder = order
        if (resOrder.fulfillment_status !== ORDER_FULFILLMENT.NONE) {
          throw new Error(`Order can not be cancelled because it's fulfillment status is ${resOrder.fulfillment_status} not '${ORDER_FULFILLMENT.NONE}'`)
        }
        return resOrder
        // if (!resOrder.transactions) {
        //   return resOrder.getTransactions()
        // }
        // else {
        //   return resOrder
        // }
      })
      // .then(order => {
      //   if (!order.fulfillments) {
      //     return order.getFulfillments()
      //   }
      //   else {
      //     return order
      //   }
      // })
      .then(resOrder => {
        resOrder.cancelled_at = new Date()
        resOrder.closed_at = resOrder.cancelled_at
        resOrder.cancel_reason = reason
        return resOrder.save()
      })
  }

  /**
   *
   * @param transactions
   * @param orderFulfillmentKind
   * @returns {boolean}
   */
  resolveSendImmediately(transactions, orderFulfillmentKind) {
    let immediate = false
    if (orderFulfillmentKind !== ORDER_FULFILLMENT_KIND.IMMEDIATE) {
      return immediate
    }
    const successes = _.map(transactions, transaction => {
      return transaction.status == TRANSACTION_STATUS.SUCCESS
    })
    const sales = _.map(transactions, transaction => {
      return transaction.kind == TRANSACTION_KIND.SALE
    })
    if (successes.length == transactions.length && sales.length == transactions.length) {
      immediate = true
    }
    return immediate
  }

  resolveSubscribeImmediately(transactions, hasSubscription) {
    let immediate = false
    if (!hasSubscription) {
      return immediate
    }
    const successes = _.map(transactions, transaction => {
      return transaction.status == TRANSACTION_STATUS.SUCCESS
    })
    const sales = _.map(transactions, transaction => {
      return transaction.kind == TRANSACTION_KIND.SALE
    })
    if (successes.length == transactions.length && sales.length == transactions.length) {
      immediate = true
    }
    return immediate
  }

  /**
   *
   * @param customerAddress
   * @param address
   * @returns {*}
   */
  resolveToAddress(customerAddress, address) {
    const Address = this.app.orm.Address
    if (address && !_.isEmpty(address)) {
      address =  this.app.services.ProxyCartService.validateAddress(address)
      return address
    }
    else {
      if (customerAddress instanceof Address.Instance) {
        return customerAddress.get({plain: true})
      }
      else {
        return customerAddress
      }
    }
  }

  /**
   *
   * @param item
   * @returns {Promise.<T>}
   */
  itemBeforeCreate(item){
    return Promise.resolve(item)
  }

  /**
   *
   * @param item
   * @returns {Promise.<T>}
   */
  itemBeforeUpdate(item){
    return Promise.resolve(item)
  }
  /**
   *
   * @param item
   * @returns {Promise.<T>}
   */
  itemAfterCreate(item){
    return Promise.resolve(item)
  }

  /**
   *
   * @param item
   * @returns {Promise.<T>}
   */
  itemAfterUpdate(item){
    return Promise.resolve(item)
  }

  afterCreate(order, options) {
    order.number = `${order.shop_id}-${order.id + 1000}`
    if (!order.name && order.number) {
      order.name = `#${order.number}`
    }
    this.app.services.ProxyEngineService.publish('order.created', order)
    return Promise.resolve(order)
  }

  afterUpdate(order, options) {
    this.app.services.ProxyEngineService.publish('order.update', order)
    return Promise.resolve(order)
  }
}

