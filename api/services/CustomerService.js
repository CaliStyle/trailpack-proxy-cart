/* eslint no-console: [0] */
/* eslint camelcase: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
/**
 * @module CustomerService
 * @description Customer Service
 */
module.exports = class CustomerService extends Service {
  /**
   *
   * @param customer
   * @returns {Customer} // An instance of the Customer
   */
  resolve(customer, options){
    const Customer =  this.app.services.ProxyEngineService.getModel('Customer')
    if (customer instanceof Customer.Instance){
      return Promise.resolve(customer)
    }
    else if (customer && _.isObject(customer) && customer.id) {
      return Customer.findById(customer.id, options)
    }
    else if (customer && (_.isString(customer) || _.isNumber(customer))) {
      return Customer.findById(customer, options)
    }
    else {
      return this.create(customer, options)
    }
  }
  create(customer) {
    return new Promise((resolve, reject) => {
      const Customer = this.app.services.ProxyEngineService.getModel('Customer')
      const Tag = this.app.services.ProxyEngineService.getModel('Tag')
      const Cart = this.app.services.ProxyEngineService.getModel('Cart')
      const Metadata = this.app.services.ProxyEngineService.getModel('Metadata')
      const Address = this.app.services.ProxyEngineService.getModel('Address')

      if (customer.cart) {
        customer.default_cart = customer.cart
        delete customer.cart
      }

      // Resolve all Address if any are provided
      if (!customer.default_address && customer.shipping_address) {
        customer.default_address = customer.shipping_address
      }
      if (!customer.shipping_address && customer.default_address) {
        customer.shipping_address = customer.default_address
      }
      if (!customer.billing_address && customer.default_address) {
        customer.billing_address = customer.default_address
      }

      let resCustomer = {}
      const create = {
        first_name: customer.first_name,
        last_name: customer.last_name,
        note: customer.note,
        accepts_marketing: customer.accepts_marketing,
        state: customer.state,
        tax_exempt: customer.tax_exempt,
        verified_email: customer.verified_email,
        metadata: Metadata.transform(customer.metadata || {}),
        shipping_address: customer.shipping_address,
        billing_address: customer.billing_address,
        default_address: customer.default_address
      }
      Customer.create(create, {
        include: [
          {
            model: Cart,
            as: 'default_cart'
          },
          // {
          //   model: Cart,
          //   as: 'carts'
          // },
          {
            model: Address,
            as: 'default_address'
          },
          {
            model: Address,
            as: 'shipping_address'
          },
          {
            model: Address,
            as: 'billing_address'
          },
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
          return Tag.transformTags(customer.tags)
        })
        .then(tags => {
          // Add Tags
          return resCustomer.setTags(tags)
        })
        .then(tags => {
          if (customer.default_cart) {
            // Resolve the Cart
            // console.log('DEFAULT CART', customer.default_cart)
            return this.app.services.CartService.resolve(customer.default_cart)
          }
          return
        })
        .then(cart => {
          if (cart) {
            // Set this cart as the default cart
            return resCustomer.setDefault_cart(cart)
          }
        })
        .then(cart => {
          return resCustomer.reload()
        })
        .then(customer => {
          return resolve(customer)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }
  update(customer) {
    return new Promise((resolve, reject) => {
      if (!customer.id) {
        const err = new Errors.FoundError(Error('Customer is missing id'))
        return reject(err)
      }
      const Customer = this.app.services.ProxyEngineService.getModel('Customer')
      const Tag = this.app.services.ProxyEngineService.getModel('Tag')
      let resCustomer = {}
      Customer.findIdDefault(customer.id)
        .then(foundCustomer => {
          resCustomer = foundCustomer
          // console.log('resCustomer',resCustomer)
          // Update Metadata
          if (customer.metadata) {
            resCustomer.metadata.data = customer.metadata || {}
          }
          // Update Shipping Address
          if (customer.shipping_address){
            customer.shipping_address = _.extend(resCustomer.shipping_address.dataValues, customer.shipping_address)
          }
          // Update Billing Address
          if (customer.billing_address){
            customer.billing_address = _.extend(resCustomer.billing_address.dataValues, customer.billing_address)
          }
          // Update Default Address
          if (customer.default_address){
            customer.default_address = _.extend(resCustomer.default_address.dataValues, customer.default_address)
          }

          const update = _.omit(customer,['tags','metadata'])
          return resCustomer.update(update)
        })
        .then(updatedCustomer => {
          if (customer.tags) {
            return Tag.transformTags(customer.tags)
          }
          return
        })
        .then(tags => {
          if (tags) {
            return resCustomer.setTags(tags)
          }
          return
        })
        .then(tags => {
          // Save Changes to metadata
          return resCustomer.metadata.save()
        })
        .then(metadata => {
          return Promise.all([
            resCustomer.shipping_address.save(),
            resCustomer.billing_address.save(),
            resCustomer.default_address.save()
          ])
        })
        .then(addresses => {
          return resCustomer.reload()
        })
        .then(customer => {
          return resolve(customer)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }
  addCart(customer, cart) {
    return new Promise((resolve, reject) => {
      // const FootprintService = this.app.services.FootprintService
      const Customer = this.app.services.ProxyEngineService.getModel('Customer')
      const customerId = _.isObject(customer) ? customer.id : customer
      const cartId = _.isObject(cart) ? cart.id : cart

      if (!customerId || !cartId) {
        // TODO Create Proper Error
        const err = new Error(`Can not Associate ${customerId} with ${cartId} because it is invalid`)
        return reject(err)
      }
      Customer.findById(customerId)
        .then(customer => {
          return customer.addCart(cartId)
        })
        .then(updatedCustomer => {
          return resolve(updatedCustomer)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }
  // TODO removeCart
  removeCart(customer, cart){

  }
  // TODO setDefaultCartForCustomer
  setDefaultCartForCustomer(customer, cart){
    return new Promise((resolve, reject) => {
      // const FootprintService = this.app.services.FootprintService
      const Customer = this.app.services.ProxyEngineService.getModel('Customer')
      const customerId = _.isObject(customer) ? customer.id : customer
      const cartId = _.isObject(cart) ? cart.id : cart

      if (!customerId || !cartId) {
        // TODO Create Proper Error
        const err = new Error(`Can not Associate ${customerId} with ${cartId} because it is invalid`)
        return reject(err)
      }
      Customer.findById(customerId)
        .then(customer => {
          return customer.setDefault_cart(cartId)
        })
        .then(updatedCustomer => {
          return resolve(updatedCustomer)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }
  // TODO addAddress
  addAddress(customer, address){

  }
  // TODO removeAddress
  removeAddress(customer, address){

  }
  // TODO addTag
  addTag(customer, tag){

  }
  // TODO removeTag
  removeTag(customer, tag){

  }
  // TODO addCollection
  addCollection(customer, tag){

  }
  // TODO removeCollection
  removeCollection(customer, tag){

  }
}

