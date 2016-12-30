/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
// const Errors = require('proxy-engine-errors')
/**
 * @module CustomerService
 * @description Customer Service
 */
module.exports = class CustomerService extends Service {
  create(customer) {
    return new Promise((resolve, reject) => {
      const Customer = this.app.services.ProxyEngineService.getModel('Customer')
      const Tag = this.app.services.ProxyEngineService.getModel('Tag')
      const Cart = this.app.services.ProxyEngineService.getModel('Cart')
      const Metadata = this.app.services.ProxyEngineService.getModel('Metadata')
      // const Address = this.app.services.ProxyEngineService.getModel('CustomerAddress')

      if (customer.cart) {
        customer.default_cart = customer.cart.id ? customer.cart.id : customer.cart
        // delete customer.cart
      }

      if (customer.metadata) {
        customer.metadata = Metadata.transform(customer.metadata || {})
      }

      let resCustomer = {}
      const create = _.omit(customer, 'tags')
      Customer.create(create, {
        include: [
          {
            model: Cart,
            as: 'default_cart'
          },
          {
            model: Cart,
            as: 'carts'
          },
          // {
          //   model: Address,
          //   as: 'default_address'
          // },
          // {
          //   model: Address,
          //   as: 'shipping_address'
          // },
          // {
          //   model: Address,
          //   as: 'billing_address'
          // },
          // {
          //   model: Address,
          //   as: 'addresses'
          // },
          {
            model: Tag,
            as: 'tags'
          },
          {
            model: Metadata,
            as: 'metadata'
          }
        ]
      })
        .then(createdCustomer => {
          resCustomer = createdCustomer
          // console.log(resCustomer.$options)
        //   return resCustomer.setDefault_cart(defaultCart)
        // })
        // .then(cart => {
          return Tag.transformTags(customer.tags)
        })
        .then(tags => {
          // Add Tags
          return resCustomer.addTags(tags)
        })
        .then(tags => {
          return resolve(resCustomer)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }
  addCartToCustomer(customer, cart) {
    return new Promise((resolve, reject) => {
      const FootprintService = this.app.services.FootprintService
      const customerId = _.isObject(customer) ? customer.id : customer
      const cartId = _.isObject(cart) ? cart.id : cart

      if (!customerId || !cartId) {
        // TODO Create Proper Error
        const err = new Error(`Can not Associate ${customerId} with ${cartId} because it is invalid`)
        return reject(err)
      }
      FootprintService.find('Customer', customerId)
        .then(customer => {
          return customer.addCart(cartId)
        })
        .then(updatedCustomer => {
          return updatedCustomer
        })
        .catch(err => {
          return reject(err)
        })
    })
  }
}

