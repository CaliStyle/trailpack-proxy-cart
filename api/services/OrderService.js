/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
const PAYMENT_PROCESSING_METHOD = require('../utils/enums').PAYMENT_PROCESSING_METHOD
const FULFILLMENT_STATUS = require('../utils/enums').FULFILLMENT_STATUS
const ORDER_STATUS = require('../utils/enums').ORDER_STATUS
const ORDER_FULFILLMENT = require('../utils/enums').ORDER_FULFILLMENT
// const ORDER_FULFILLMENT_KIND = require('../utils/enums').ORDER_FULFILLMENT_KIND
const TRANSACTION_STATUS = require('../utils/enums').TRANSACTION_STATUS
const TRANSACTION_KIND = require('../utils/enums').TRANSACTION_KIND
const ORDER_FINANCIAL = require('../utils/enums').ORDER_FINANCIAL
const ORDER_CANCEL = require('../utils/enums').ORDER_CANCEL
/**
 * @module OrderService
 * @description Order Service
 */
module.exports = class OrderService extends Service {

  /**
   *
   * @param obj
   * @returns {Promise}
   */
  // TODO handle inventory policy and coupon policy
  // TODO Select Vendor
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
    let totalPrice = obj.total_price
    let totalOverrides = 0
    let deduction = 0
    let resOrder = {}
    let resCustomer = {}
    let resBillingAddress = {}
    let resShippingAddress = {}

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
          // If not pricing_overrides, make blank array
          if (!obj.pricing_overrides) {
            obj.pricing_overrides = []
          }
          // Map the gateway names being used
          const paymentGatewayNames = obj.payment_details.map(detail => { return detail.gateway })
          // console.log('OrderService.create', resShippingAddress, resBillingAddress)

          // console.log('Broke', totalDue, totalPrice)
          const accountBalanceIndex = _.findIndex(obj.pricing_overrides, {name: 'Account Balance'})
          // Account balance has been applied, check to update it.
          if (accountBalanceIndex > -1) {
            const prevPrice = obj.pricing_overrides[accountBalanceIndex].price
            // If account balance is present, revert it so it can be added back in with current.
            totalDue = totalDue + prevPrice
            totalPrice = totalPrice + prevPrice
          }
          // Add the account balance to the overrides
          if (resCustomer.account_balance > 0) {
            // Apply Customer Account balance
            deduction = Math.min(totalDue, (totalDue - (totalDue - resCustomer.account_balance)))
            if (deduction > 0) {
              // If account balance has not been applied
              if (accountBalanceIndex == -1) {
                obj.pricing_overrides.push({
                  name: 'Account Balance',
                  price: deduction
                })
                totalDue = Math.max(0, totalDue - deduction)
                totalPrice = Math.max(0, totalPrice - deduction)
              }
              // Otherwise update the account balance
              else {
                // const prevPrice = obj.pricing_overrides[accountBalanceIndex].price
                obj.pricing_overrides[accountBalanceIndex].price = deduction
                totalDue = Math.max(0, totalDue - deduction)
                totalPrice = Math.max(0, totalPrice - deduction)
              }
              // Recalculate Overrides
              _.each(obj.pricing_overrides, override => {
                totalOverrides = totalOverrides + override.price
              })
              obj.total_overrides = totalOverrides
            }
          }
          else {
            if (accountBalanceIndex > -1) {
              const prevPrice = obj.pricing_overrides[accountBalanceIndex].price
              obj.pricing_overrides = obj.pricing_overrides.splice(accountBalanceIndex, 1)
              totalDue = Math.max(0, totalDue + prevPrice)
              totalPrice = Math.max(0, totalPrice + prevPrice)
            }
          }

          const order = Order.build({
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
            total_coupons: obj.total_coupons,
            total_line_items_price: obj.total_line_items_price,
            total_price: totalPrice,
            total_due: totalDue,
            total_tax: obj.total_tax,
            total_shipping: obj.total_shipping,
            total_weight: obj.total_weight,
            total_items: obj.total_items,
            shop_id: obj.shop_id || null,
            user_id: obj.user_id || null,
            has_shipping: obj.has_shipping,
            has_subscription: obj.has_subscription,
            fulfillment_kind: obj.fulfillment_kind || this.app.config.proxyCart.order_fulfillment_kind,

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
            shipping_address: resShippingAddress,

            // Overrides
            pricing_override_id: obj.pricing_override_id || null,
            pricing_overrides: obj.pricing_overrides || [],
            total_overrides: obj.total_overrides || 0
          }, {
            include: [
              {
                model: OrderItem,
                as: 'order_items'
              }
            ]
          })

          return order.save()
        })
        .then(order => {
          if (!order) {
            throw new Error('Unexpected Error while creating order')
          }
          resOrder = order
          if (resCustomer.id) {
            // Update the customer with the order
            return Customer.resolve(resCustomer)
              .then(customer => {
                // Get the total deducted
                // console.log('BROKE', deduction)
                if (deduction > 0) {
                  customer.setAccountBalance(Math.max(0, customer.account_balance - deduction))
                  const event = {
                    object_id: customer.id,
                    object: 'customer',
                    objects: [{
                      customer: customer.id
                    }],
                    type: 'customer.account_balance.deducted',
                    message: `Customer account balance was deducted by ${ deduction }`,
                    data: customer
                  }
                  this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
                }

                return customer.setTotalSpent(totalPrice).setLastOrder(resOrder).save()
              })
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
              objects: [{
                customer: customer.id
              },{
                order: resOrder.id
              }],
              type: 'customer.order.created',
              message: `Customer Order ${ resOrder.name } was created`,
              data: resOrder
            }
            this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
            return customer.addOrder(resOrder.id)
          }
          return customer
        })
        .then(customer => {
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
              // Set the source if it is given
              source_id: detail.source ? detail.source.id : null,
              // Set the order currency
              currency: resOrder.currency,
              // Set the amount for this transaction and handle if it is a split transaction
              amount: detail.amount || resOrder.total_due,
              // Copy the entire payment details to this transaction
              payment_details: obj.payment_details[index],
              // Specify the gateway to use
              gateway: detail.gateway,
              // Set the device (that input the credit card) or null
              device_id: obj.device_id || null,
              // Set the Description
              description: `Order ${resOrder.name} original transaction ${orderPayment}`
            }
            // Return the Payment Service
            return PaymentService[orderPayment](transaction)
          }))
        })
        .then(transactions => {
          return Order.findByIdDefault(resOrder.id)
        })
    })
  }

  /**
   *
   * @param order
   * @param options
   * @returns {Promise.<T>}
   */
  update(order, options) {
    const Order = this.app.orm.Order

    return Order.resolve(order)
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
   * Pay an item
   * @param order
   * @param paymentDetails
   * @param options
   * @returns {*|Promise.<T>}
   */
  // TODO handle payment of remaining balance if provided
  pay(order, paymentDetails, options) {
    options = options || {}
    const Order = this.app.orm['Order']
    let resOrder
    return Order.resolve(order, options)
      .then(order => {
        if (!order) {
          throw new Errors.FoundError(Error('Order not found'))
        }

        if (order.financial_status !== (ORDER_FINANCIAL.AUTHORIZED || ORDER_FINANCIAL.PARTIALLY_PAID)) {
          throw new Error(`Order status is ${order.financial_status} not '${ORDER_FINANCIAL.AUTHORIZED} or ${ORDER_FINANCIAL.PARTIALLY_PAID}'`)
        }

        return order
      })
      .then(order => {
        resOrder = order
        if (!order.transactions || order.transactions.length == 0) {
          return order.getTransactions()
        }
        else {
          return order.transactions
        }
      })
      .then(transactions => {
        if (!transactions) {
          transactions = []
        }
        const authorized = transactions.filter(transaction => transaction.kind == TRANSACTION_KIND.AUTHORIZE)
        return Promise.all(authorized.map(transaction => {
          return this.app.services.TransactionService.capture(transaction)
        }))
      })
      .then(capturedTransactions => {
        // console.log('Captured Transactions', capturedTransactions)
        return this.app.orm['Order'].findByIdDefault(resOrder.id)
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
   *
   * @param orderItem
   * @param options
   * @returns {Promise.<TResult>}
   */
  refundOrderItem(orderItem, options) {
    const OrderItem = this.app.orm['OrderItem']
    const Order = this.app.orm['Order']
    let resOrderItem, resOrder
    return OrderItem.resolve(orderItem)
      .then(orderItem => {
        if (!orderItem) {
          throw new Errors.FoundError(Error('OrderItem not found'))
        }
        resOrderItem = orderItem
        return resOrderItem
      })
      .then(() => {
        return resOrderItem.getOrder()
      })
      .then(order => {
        if (!order) {
          throw new Errors.FoundError(Error('Order not found'))
        }
        const allowedStatuses = [ORDER_FINANCIAL.PAID, ORDER_FINANCIAL.PARTIALLY_PAID, ORDER_FINANCIAL.PARTIALLY_REFUNDED]
        if (allowedStatuses.indexOf(order.financial_status) == -1) {
          throw new Error(
            `Order status is ${order.financial_status} not 
            '${ORDER_FINANCIAL.PAID}, ${ORDER_FINANCIAL.PARTIALLY_PAID}' or '${ORDER_FINANCIAL.PARTIALLY_REFUNDED}'`
          )
        }

        resOrder = order

        if (!resOrder.transactions || resOrder.transactions.length == 0) {
          return resOrder.getTransactions()
        }
        else {
          return resOrder.transactions
        }
      })
      .then(transactions => {
        transactions = transactions || []
        resOrder.set('transactions', transactions)

        const canRefund = transactions.filter(transaction => {
          return [TRANSACTION_KIND.SALE, TRANSACTION_KIND.CAPTURE].indexOf(transaction.kind) > -1
        })
        // TODO, refund multiple transactions is necessary
        const toRefund = canRefund.find(transaction => transaction.amount >= resOrderItem.calculated_price)
        if (!toRefund) {
          // TODO CREATE PROPER ERROR
          throw new Error('No transaction available to refund this item\'s calculated price')
        }
        return this.app.services.TransactionService.partiallyRefund(toRefund, resOrderItem.calculated_price)
      })
      .then(transaction => {
        if (transaction.kind == TRANSACTION_KIND.REFUND && transaction.status == TRANSACTION_STATUS.SUCCESS) {
          return this.app.orm['Refund'].create({
            order_id: resOrder.id,
            transaction_id: transaction.id,
            amount: transaction.amount,
            restock: options.restock || null
          })
        }
        else {
          throw new Error('Was unable to refund this transaction')
        }
      })
      .then(refund => {
        return resOrderItem.setRefund(refund.id)
      })
      .then(newRefund => {
        return resOrder.getRefunds()
      })
      .then(refunds => {
        // console.log('THIS REFUNDS', refunds)
        let totalRefunds = 0
        refunds.forEach(refund => {
          totalRefunds = totalRefunds + refund.amount
        })
        resOrder.total_refunds = totalRefunds
        return resOrder.saveFinancialStatus()
      })
      .then(order => {
        return Order.findByIdDefault(resOrder.id)
      })
  }
  /**
   * Refund an Order or Partially Refund an Order
   * @param order
   * @param refunds
   * @param options
   * @returns {*|Promise.<TResult>}
   */
  // TODO restock
  refund(order, refunds, options) {
    refunds = refunds || []

    const Order = this.app.orm['Order']
    let resOrder
    return Order.resolve(order, options)
      .then(order => {
        if (!order) {
          throw new Errors.FoundError(Error('Order not found'))
        }
        const allowedStatuses = [ORDER_FINANCIAL.PAID, ORDER_FINANCIAL.PARTIALLY_PAID, ORDER_FINANCIAL.PARTIALLY_REFUNDED]
        if (allowedStatuses.indexOf(order.financial_status) == -1) {
          throw new Error(
            `Order status is ${order.financial_status} not 
            '${ORDER_FINANCIAL.PAID}, ${ORDER_FINANCIAL.PARTIALLY_PAID}' or '${ORDER_FINANCIAL.PARTIALLY_REFUNDED}'`
          )
        }
        return order
      })
      .then(order => {
        resOrder = order
        if (!resOrder.transactions || resOrder.transactions.length == 0) {
          return resOrder.getTransactions()
        }
        else {
          return resOrder.transactions
        }
      })
      .then(transactions => {
        transactions = transactions || []
        resOrder.set('transactions', transactions)

        if (!resOrder.refunds) {
          return resOrder.getRefunds()
        }
        else {
          return resOrder.refunds
        }
      })
      .then(foundRefunds => {
        foundRefunds = foundRefunds || []
        resOrder.set('refunds', foundRefunds)

        // Partially Refund because refunds was sent to method
        if (refunds.length > 0) {
          return Promise.all(refunds.map(refund => {
            const refundTransaction = resOrder.transactions.find(transaction => transaction.id == refund.transaction)
            if ([TRANSACTION_KIND.SALE, TRANSACTION_KIND.CAPTURE].indexOf(refundTransaction.kind) > -1) {
              // If this is a full Transaction refund
              if (refund.amount == refundTransaction.amount) {
                return this.app.services.TransactionService.refund(refundTransaction)
              }
              // If this is a partial refund
              else {
                return this.app.services.TransactionService.partiallyRefund(refundTransaction, refund.amount)
              }
            }
          }))
        }
        // Completely Refund the order
        else {
          const canRefund = resOrder.transactions.filter(transaction => {
            return [TRANSACTION_KIND.SALE, TRANSACTION_KIND.CAPTURE].indexOf(transaction.kind) > -1

          })
          return Promise.all(canRefund.map(transaction => {
            return this.app.services.TransactionService.refund(transaction)
          }))
        }
      })
      .then(refundedTransactions => {
        return Promise.all(refundedTransactions.map(transaction => {
          if (transaction.kind == TRANSACTION_KIND.REFUND && transaction.status == TRANSACTION_STATUS.SUCCESS) {
            return resOrder.createRefund({
              order_id: resOrder.id,
              transaction_id: transaction.id,
              amount: transaction.amount
            })
          }
        }))
      })
      .then(newRefunds => {
        return resOrder.reload()
      })
      .then(() => {
        let totalRefunds = 0
        resOrder.refunds.forEach(refund => {
          totalRefunds = totalRefunds + refund.amount
        })
        resOrder.total_refunds = totalRefunds
        return resOrder.saveFinancialStatus()
      })
      .then(order => {
        return Order.findByIdDefault(resOrder.id)
      })
  }

  /**
   *
   * @param order
   * @param captures
   * @param options
   * @returns {Promise.<TResult>}
   */
  capture(order, captures, options) {
    captures = captures || []
    const Order = this.app.orm['Order']
    let resOrder
    return Order.resolve(order, options)
      .then(order => {
        if (!order) {
          throw new Errors.FoundError(Error('Order not found'))
        }
        return order
      })
      .then(order => {
        resOrder = order
        if (!resOrder.transactions || resOrder.transactions.length == 0) {
          return resOrder.getTransactions()
        }
        else {
          return resOrder.transactions
        }
      })
      .then(transactions => {
        transactions = transactions || []
        resOrder.set('transactions', transactions)

        // Partially Capture
        if (captures.length > 0) {
          return Promise.all(captures.map(capture => {
            const captureTransaction = transactions.find(transaction => transaction.id == capture.transaction)
            if (captureTransaction.kind == TRANSACTION_KIND.AUTHORIZE) {
              return this.app.services.TransactionService.capture(captureTransaction)
            }
          }))
        }
        // Completely Capture the order
        else {
          const canCapture = transactions.filter(transaction => {
            if (transaction.kind == TRANSACTION_KIND.AUTHORIZE) {
              return transaction
            }
          })
          return Promise.all(canCapture.map(transaction => {
            return this.app.services.TransactionService.capture(transaction)
          }))
        }
      })
      .then(captures => {
        return resOrder.saveFinancialStatus()
      })
      .then(order => {
        return Order.findByIdDefault(resOrder.id)
      })

  }

  /**
   *
   * @param order
   * @param voids
   * @returns {Promise.<TResult>}
   */
  void(order, voids, options) {
    voids = voids || []
    const Order = this.app.orm['Order']
    let resOrder
    return Order.resolve(order, options)
      .then(order => {
        if (!order) {
          throw new Errors.FoundError(Error('Order not found'))
        }
        return order
      })
      .then(order => {
        resOrder = order
        if (!resOrder.transactions || resOrder.transactions.length == 0) {
          return resOrder.getTransactions()
        }
        else {
          return resOrder.transactions
        }
      })
      .then(transactions => {
        transactions = transactions || []
        resOrder.set('transactions', transactions)
        // Partially Void
        if (voids.length > 0) {
          return Promise.all(voids.map(tVoid => {
            const voidTransaction = transactions.find(transaction => transaction.id == tVoid.transaction)
            if (voidTransaction.kind == TRANSACTION_KIND.AUTHORIZE) {
              return this.app.services.TransactionService.void(voidTransaction)
            }
          }))
        }
        // Completely Void the order
        else {
          const canVoid = transactions.filter(transaction => {
            if (transaction.kind == TRANSACTION_KIND.AUTHORIZE) {
              return transaction
            }
          })
          return Promise.all(canVoid.map(transaction => {
            return this.app.services.TransactionService.void(transaction)
          }))
        }
      })
      .then(voids => {
        return resOrder.saveFinancialStatus()
      })
      .then(order => {
        return Order.findByIdDefault(resOrder.id)
      })
  }

  /**
   * Cancel an Order
   * @param order
   * @returns {Promise.<TResult>}
   */
  cancel(order, options) {
    options = options || {}
    const Order = this.app.orm['Order']
    const reason = order.cancel_reason || ORDER_CANCEL.OTHER
    let resOrder, canRefund = [], canVoid = [], canCancel = [], canCancelFulfillment = []
    return Order.resolve(order, options)
      .then(order => {
        resOrder = order
        if ([ORDER_FULFILLMENT.NONE, ORDER_FULFILLMENT.PENDING].indexOf(resOrder.fulfillment_status) < 0) {
          throw new Error(`Order can not be cancelled because it's fulfillment status is ${resOrder.fulfillment_status} not '${ORDER_FULFILLMENT.NONE}' or '${ORDER_FULFILLMENT.PENDING}'`)
        }

        if (!resOrder.transactions || resOrder.transactions.length == 0) {
          return resOrder.getTransactions()
        }
        else {
          return resOrder.transactions
        }
      })
      .then(transactions => {
        transactions = transactions || []
        resOrder.set('transactions', transactions)

        // Transactions that can be refunded
        canRefund = transactions.filter(transaction =>
          [TRANSACTION_KIND.SALE, TRANSACTION_KIND.CAPTURE].indexOf(transaction.kind) > -1)
        // Transactions that can be voided
        canVoid = transactions.filter(transaction => transaction.kind == TRANSACTION_KIND.AUTHORIZE)
        // Transactions that can be cancelled
        canCancel = transactions.filter(transaction => transaction.kind == TRANSACTION_KIND.PENDING)

        // Start Refunds
        return Promise.all(canRefund.map(transaction => {
          return this.app.services.TransactionService.refund(transaction, {transaction: options.transaction || null})
        }))
      })
      .then(() => {
        // Start Voids
        return Promise.all(canVoid.map(transaction => {
          return this.app.services.TransactionService.void(transaction, {transaction: options.transaction || null})
        }))
      })
      .then(() => {
        // Start Cancels
        return Promise.all(canCancel.map(transaction => {
          return this.app.services.TransactionService.cancel(transaction, {transaction: options.transaction || null})
        }))
      })
      .then(() => {
        if (!resOrder.fulfillments || resOrder.fulfillments.length == 0) {
          return resOrder.getFulfillments({transaction: options.transaction || null})
        }
        else {
          return resOrder.fulfillments
        }
      })
      .then(fulfillments => {
        fulfillments = fulfillments || []
        resOrder.set('fulfillments', fulfillments)
        // Start Cancel fulfillments
        canCancelFulfillment = fulfillments.filter(fulfillment =>
          [FULFILLMENT_STATUS.PENDING, FULFILLMENT_STATUS.SENT].indexOf(fulfillment.status) > -1)
        return Promise.all(canCancelFulfillment.map(fulfillment => {
          return this.app.services.FulfillmentService.cancel(fulfillment, {transaction: options.transaction || null})
        }))
      })
      .then(()=> {
        return resOrder.cancel({cancel_reason: reason}).save()
      })
  }

  // TODO make sure total payment criteria is met.
  resolveSubscribe(transactions, hasSubscription) {
    let immediate = false
    if (!hasSubscription) {
      return immediate
    }
    const successes = transactions.filter(transaction =>
    transaction.status == TRANSACTION_STATUS.SUCCESS)
    const sales = transactions.filter(transaction =>
    [TRANSACTION_KIND.SALE, TRANSACTION_KIND.CAPTURE].indexOf(transaction.kind) > -1)
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
   * @param order
   * @param tag
   * @returns {Promise.<TResult>}
   */
  addTag(order, tag){
    const Order = this.app.orm['Order']
    let resOrder, resTag
    return Order.resolve(order)
      .then(order => {
        if (!order) {
          throw new Errors.FoundError(Error('Order not found'))
        }
        resOrder = order
        return this.app.services.TagService.resolve(tag)
      })
      .then(tag => {
        if (!tag) {
          throw new Errors.FoundError(Error('Tag not found'))
        }
        resTag = tag
        return resOrder.hasTag(resTag.id)
      })
      .then(hasTag => {
        if (!hasTag) {
          return resOrder.addTag(resTag.id)
        }
        return resOrder
      })
      .then(tag => {
        return Order.findByIdDefault(resOrder.id)
      })
  }

  /**
   *
   * @param order
   * @param tag
   * @returns {Promise.<TResult>}
   */
  removeTag(order, tag){
    let resOrder, resTag
    const Order = this.app.orm['Order']
    return Order.resolve(order)
      .then(order => {
        if (!order) {
          throw new Errors.FoundError(Error('Order not found'))
        }
        resOrder = order
        return this.app.services.TagService.resolve(tag)
      })
      .then(tag => {
        if (!tag) {
          throw new Errors.FoundError(Error('Tag not found'))
        }
        resTag = tag
        return resOrder.hasTag(resTag.id)
      })
      .then(hasTag => {
        if (hasTag) {
          return resOrder.removeTag(resTag.id)
        }
        return resOrder
      })
      .then(tag => {
        return Order.findByIdDefault(resOrder.id)
      })
  }

  /**
   *
   * @param order
   * @param item
   * @param options
   * @returns {Promise.<TResult>}
   */
  addItem(order, item, options) {
    options = options || {}
    if (!item) {
      throw new Errors.FoundError(Error('Item is not defined'))
    }
    let resOrder, resItem
    const Order = this.app.orm['Order']
    return Order.resolve(order, options)
      .then(order => {
        if (!order) {
          throw new Errors.FoundError(Error('Order not found'))
        }
        if (order.status !== ORDER_STATUS.OPEN) {
          throw new Error(`Order is already ${order.status}`)
        }
        // bind the dao
        resOrder = order
        // Populate order items if not already populated
        if (!resOrder.order_items) {
          return resOrder.getOrder_items()
        }
        else {
          return resOrder.order_items
        }
      }).
      then(foundOrderItems => {
        // Overrides with fresh order items if they were not provided
        resOrder.set('order_items', foundOrderItems)
        // Resolve the item of the new order item
        return this.app.services.ProductService.resolveItem(item, { transaction: options.transaction || null })
      })
      .then(foundItem => {
        if (!foundItem) {
          throw new Error('Could not resolve product and variant')
        }
        // Build the item
        resItem = resOrder.buildOrderItem(foundItem, item.quantity, item.properties)
        // Add the item
        return resOrder.addItem(resItem)
      })
      .then(createdItem => {
        return resOrder.recalculate()
      })
      .then(() => {
        // Track Event
        const event = {
          object_id: resOrder.id,
          object: 'order',
          objects: [{
            order: resOrder.id
          }, {
            customer: resOrder.customer_id
          }, {
            product: resItem.product_id
          }, {
            productvariant: resItem.variant_id
          }],
          type: 'order.item.created',
          message: `Item added to Order ${resOrder.name}`,
          data: resItem
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return Order.findByIdDefault(resOrder.id)
      })
  }

  /**
   *
   * @param order
   * @param item
   * @param options
   * @returns {Promise.<TResult>}
   */
  updateItem(order, item, options) {
    options = options || {}
    if (!item) {
      throw new Errors.FoundError(Error('Item is not defined'))
    }
    let resOrder, resItem
    const Order = this.app.orm['Order']
    return Order.resolve(order, options)
      .then(order => {
        if (!order) {
          throw new Errors.FoundError(Error('Order not found'))
        }
        if (order.status !== ORDER_STATUS.OPEN) {
          throw new Error(`Order is already ${order.status}`)
        }
        // bind the dao
        resOrder = order
        // Populate order items if not already populated
        if (!resOrder.order_items) {
          return resOrder.getOrder_items()
        }
        else {
          return resOrder.order_items
        }
      }).
      then(foundOrderItems => {
        // Overrides with fresh order items if they were not provided
        resOrder.set('order_items', foundOrderItems)
        // Resolve the item
        return this.app.services.ProductService.resolveItem(item, { transaction: options.transaction || null})
      })
      .then(foundItem => {
        if (!foundItem) {
          throw new Error('Could not resolve product and variant')
        }
        // Build the item
        resItem = resOrder.buildOrderItem(foundItem, item.quantity, item.properties)
        // Update the item
        return resOrder.updateItem(resItem)
      })
      .then((updatedItem) => {
       // recalculate
        return resOrder.recalculate()
      })
      .then(() => {
        // Track Event
        const event = {
          object_id: resOrder.id,
          object: 'order',
          objects: [{
            order: resOrder.id
          }, {
            customer: resOrder.customer_id
          }, {
            product: resItem.product_id
          }, {
            productvariant: resItem.variant_id
          }],
          type: 'order.item.updated',
          message: `Item updated in Order ${resOrder.name}`,
          data: resItem
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return Order.findByIdDefault(resOrder.id)
      })
  }

  /**
   *
   * @param order
   * @param item
   * @param options
   * @returns {Promise.<TResult>}
   */
  removeItem(order, item, options) {
    options = options || {}
    if (!item) {
      throw new Errors.FoundError(Error('Item is not defined'))
    }
    let resOrder, resItem
    const Order = this.app.orm['Order']
    return Order.resolve(order, options)
      .then(order => {
        if (!order) {
          throw new Errors.FoundError(Error('Order not found'))
        }
        if (order.status !== ORDER_STATUS.OPEN) {
          throw new Error(`Order is already ${order.status}`)
        }
        // bind the dao
        resOrder = order
        // populate the order items
        if (!resOrder.order_items) {
          return resOrder.getOrder_items()
        }
        else {
          return resOrder.order_items
        }
      }).
      then(foundOrderItems => {
        // Overrides with fresh order items if they were not provided
        resOrder.set('order_items', foundOrderItems)
        // Resolve the item
        return this.app.services.ProductService.resolveItem(item, { transaction: options.transaction || null})
      })
      .then(foundItem => {
        if (!foundItem) {
          throw new Error('Could not resolve product and variant')
        }
        // Build the item
        resItem = resOrder.buildOrderItem(foundItem, item.quantity, item.properties)
        // Remove the item
        return resOrder.removeItem(resItem)
      })
      .then(() => {
        // recalculate
        return resOrder.recalculate()
      })
      .then(() => {
        // Track Event
        const event = {
          object_id: resOrder.id,
          object: 'order',
          objects: [{
            order: resOrder.id
          }, {
            customer: resOrder.customer_id
          }, {
            product: resItem.product_id
          }, {
            productvariant: resItem.variant_id
          }],
          type: 'order.item.removed',
          message: `Item removed from Order ${resOrder.name}`,
          data: resItem
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return Order.findByIdDefault(resOrder.id)
      })
  }

  /**
   *
   * @param order
   * @param shipping
   * @param options
   * @returns {Promise.<TResult>|*}
   */
  addShipping(order, shipping, options) {
    options = options || {}
    if (!shipping) {
      throw new Errors.FoundError(Error('Shipping is not defined'))
    }
    let resOrder
    const Order = this.app.orm['Order']
    return Order.resolve(order, options)
      .then(order => {
        if (!order) {
          throw new Errors.FoundError(Error('Order not found'))
        }
        if (order.status !== ORDER_STATUS.OPEN) {
          throw new Error(`Order is already ${order.status}`)
        }
        resOrder = order
        return resOrder.recalculate()
      })
  }

  /**
   *
   * @param order
   * @param shipping
   * @param options
   * @returns {Promise.<TResult>|*}
   */
  removeShipping(order, shipping, options) {
    options = options || {}
    if (!shipping) {
      throw new Errors.FoundError(Error('Shipping is not defined'))
    }
    let resOrder
    const Order = this.app.orm['Order']
    return Order.resolve(order, options)
      .then(order => {
        if (!order) {
          throw new Errors.FoundError(Error('Order not found'))
        }
        if (order.status !== ORDER_STATUS.OPEN) {
          throw new Error(`Order is already ${order.status}`)
        }
        resOrder = order
        return resOrder.recalculate()
      })
  }

  retryThisHour() {
    //

  }
  cancelThisHour() {
    //

  }

  /**
   *
   * @param item
   * @param options
   * @returns {Promise.<T>}
   */
  itemBeforeCreate(item, options){
    return item.recalculate()
      .then(() => {
        return item
      })
    // return Promise.resolve(item)
  }

  /**
   *
   * @param item
   * @param options
   * @returns {Promise.<T>}
   */
  itemBeforeUpdate(item, options){
    return item.recalculate()
      .then(() => {
        return item
      })
//    return Promise.resolve(item)
  }
  /**
   *
   * @param item
   * @param options
   * @returns {Promise.<T>}
   */
  itemAfterCreate(item, options){
    return Promise.resolve(item)
  }

  /**
   *
   * @param item
   * @param options
   * @returns {Promise.<T>}
   */
  itemAfterUpdate(item, options){
    return Promise.resolve(item)
  }

  /**
   *
   * @param order
   * @param options
   * @returns {Promise.<T>}
   */
  afterCreate(order, options) {
    order.number = `${order.shop_id}-${order.id + 1000}`
    if (!order.name && order.number) {
      order.name = `#${order.number}`
    }
    this.app.services.ProxyEngineService.publish('order.created', order)
    return Promise.resolve(order)
  }

  afterUpdate(order, options) {
    this.app.services.ProxyEngineService.publish('order.updated', order)
    return Promise.resolve(order)
  }
}

