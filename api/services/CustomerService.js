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
    const Customer =  this.app.orm.Customer
    if (customer instanceof Customer.Instance){
      return Promise.resolve(customer)
    }
    else if (customer && _.isObject(customer) && customer.id) {
      return Customer.findById(customer.id, options)
        .then(resCustomer => {
          if (!resCustomer) {
            return this.create(customer, options)
          }
          return resCustomer
        })
    }
    else if (customer && (_.isString(customer) || _.isNumber(customer))) {
      return Customer.findById(customer, options)
    }
    else {
      return this.create(customer, options)
    }
  }

  /**
   *
   * @param customer
   * @returns {Promise}
   */
  create(customer) {
    const Customer = this.app.orm.Customer
    const Tag = this.app.orm.Tag
    const Cart = this.app.orm.Cart
    const Metadata = this.app.orm.Metadata
    const Address = this.app.orm.Address
    const Account = this.app.orm.Account
    const User = this.app.orm.User

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
      email: customer.email,
      note: customer.note,
      accepts_marketing: customer.accepts_marketing,
      state: customer.state,
      tax_exempt: customer.tax_exempt,
      verified_email: customer.verified_email,
      metadata: Metadata.transform(customer.metadata || {})
    }
    if (customer.shipping_address) {
      create.shipping_address = customer.shipping_address
    }
    if (customer.billing_address) {
      create.billing_address = customer.billing_address
    }
    if (customer.default_address) {
      create.default_address = customer.default_address
    }

    return Customer.create(create, {
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
        // {
        //   model: Account,
        //   as: 'accounts'
        // }
      ]
    })
      .then(createdCustomer => {
        resCustomer = createdCustomer
        if (customer.tags && customer.tags.length > 0) {
          customer.tags = _.sortedUniq(customer.tags.filter(n => n))
          return Tag.transformTags(customer.tags)
        }
        return
      })
      .then(tags => {
        // Add Tags
        if (tags && tags.length > 0) {
          return resCustomer.setTags(tags)
        }
        return
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
        if (customer.accounts && customer.accounts.length > 0) {
          return Promise.all(customer.accounts.map(account => {
            account.customer_id = resCustomer.id
            account.email = resCustomer.email
            return this.app.services.AccountService.findAndCreate(account)
          }))
        }
        else {
          return this.app.services.PaymentGenericService.createCustomer(resCustomer)
            .then(serviceCustomer => {
              //const Account = this.app.orm['Account']
              // const CustomerAccount = this.app.orm['CustomerAccount']
              return Account.create({
                customer_id: resCustomer.id,
                email: resCustomer.email,
                is_default: true,
                gateway: serviceCustomer.gateway,
                foreign_id: serviceCustomer.foreign_id,
                foreign_key: serviceCustomer.foreign_key,
                data: serviceCustomer.data
              })
                .then(account => {
                  return [account]
                })
            })
        }
      })
      .then(accounts => {
        if (accounts && accounts.length > 0) {
          return resCustomer.setAccounts(accounts.map(account => account.id))
        }
        return
      })
      .then(accounts => {
        if (customer.users && customer.users.length > 0) {
          return Promise.all(customer.users.map(user => {
            // Setup some defaults
            user.current_customer_id = resCustomer.id
            user.passports = {
              protocol: 'local'
            }
            return User.create(user, {
              include: [
                {
                  model: this.app.orm['Passport'],
                  as: 'passports'
                }
              ]
            })
          }))
        }
        return
      })
      .then(users => {
        if (users && users.length > 0) {
          return resCustomer.setUsers(users.map(user => user.id))
        }
        return
      })
      .then(users => {
        // return resCustomer.reload()
        return Customer.findByIdDefault(resCustomer.id)
      })
  }

  /**
   *
   * @param customer
   * @returns {Promise}
   */
  update(customer) {
    return new Promise((resolve, reject) => {
      if (!customer.id) {
        const err = new Errors.FoundError(Error('Customer is missing id'))
        return reject(err)
      }
      const Customer = this.app.orm.Customer
      const Tag = this.app.orm.Tag
      let resCustomer = {}
      Customer.findByIdDefault(customer.id)
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
          if (customer.tags && customer.tags.length > 0) {
            customer.tags = _.sortedUniq(customer.tags.filter(n => n))
            return Tag.transformTags(customer.tags)
          }
          return
        })
        .then(tags => {
          if (tags && tags.length > 0) {
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
          // return resCustomer.reload()
          return Customer.findByIdDefault(resCustomer.id)
        })
        .then(customer => {
          return resolve(customer)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }

  /**
   *
   * @param customer
   * @param cart
   * @returns {Promise}
   */
  addCart(customer, cart) {
    return new Promise((resolve, reject) => {
      // const FootprintService = this.app.services.FootprintService
      const Customer = this.app.orm.Customer
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
      const Customer = this.app.orm.Customer
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
    return this.resolve(customer)
  }
  // TODO removeAddress
  removeAddress(customer, address){
    return this.resolve(customer)
  }
  // TODO addTag
  addTag(customer, tag){
    // const Customer = this.app.orm['Customer']
    // const Tag = this.app.orm['Tag']

    let resCustomer
    return this.resolve(customer)
      .then(customer => {
        resCustomer = customer
        // return this.
        return resCustomer
      })
  }
  // TODO removeTag
  removeTag(customer, tag){
    // const Customer = this.app.orm['Customer']
    // const Tag = this.app.orm['Tag']

    let resCustomer
    return this.resolve(customer)
      .then(customer => {
        resCustomer = customer
        // return this.
        return resCustomer
      })
  }
  // TODO addCollection
  addCollection(customer, collection){
    // const Customer = this.app.orm['Customer']
    // const Collection = this.app.orm['Collection']

    let resCustomer
    return this.resolve(customer)
      .then(customer => {
        resCustomer = customer
        // return this.
        return resCustomer
      })
  }
  // TODO removeCollection
  removeCollection(customer, collection){
    // const Customer = this.app.orm['Customer']
    // const Collection = this.app.orm['Collection']

    let resCustomer
    return this.resolve(customer)
      .then(customer => {
        resCustomer = customer
        // return this.
        return resCustomer
      })
  }

  /**
   *
   * @param customer
   * @returns {Promise.<TResult>}
   */
  afterCreate(customer) {
    this.app.services.ProxyEngineService.publish('customer.created', customer)
    return Promise.resolve(customer)
  }

  /**
   *
   * @param customer
   * @returns {Promise.<TResult>}
   */
  afterUpdate(customer) {
    this.app.services.ProxyEngineService.publish('customer.updated', customer)
    let updateAccounts = false
    const accountUpdates = {}

    if (customer.changed('email')) {
      updateAccounts = true
      accountUpdates.email = customer.email
    }
    // If no account updates just return
    if (!updateAccounts) {
      return Promise.resolve(customer)
    }
    // If there are account updates, update all 3rd party accounts
    else {
      return this.app.orm['Account'].findAll({
        where: {
          customer_id: customer.id
        }
      })
         .then(accounts => {
           return Promise.all(accounts.map(account => {
             return this.app.services.AccountService.update(account, accountUpdates)
           }))
         })
         .then(updatedAccounts => {
           return customer
         })
    }
  }

  /**
   *
   * @param customer
   * @param source
   * @returns {*|Promise.<TResult>}
   */
  createCustomerSource(customer, source) {
    const Account = this.app.orm['Account']
    return Account.findOne({
      where: {
        customer_id: customer.id,
        gateway: source.gateway
      }
    })
      .then(account => {
        if (!account) {
          throw new Error('Account not found')
        }
        // source.account_id = account.id
        return this.app.services.AccountService.addSource(account, source.token)
      })
  }
  findCustomerSource(customer, source){
    const Account = this.app.orm['Account']
    return Account.findOne({
      where: {
        customer_id: customer.id,
        gateway: source.gateway
      }
    })
      .then(account => {
        source.account_id = account.id
        return this.app.services.AccountService.findSource(account, source)
      })
  }

  syncCustomerSources(customer, account){
    const Account = this.app.orm['Account']
    return Account.findOne({
      where: {
        customer_id: customer.id,
        gateway: account.gateway
      }
    })
      .then(account => {
        return this.app.services.AccountService.syncSources(account)
      })
  }
  /**
   *
   * @param customer
   * @param source
   * @param updates
   * @returns {*|Promise.<TResult>}
   */
  updateCustomerSource(customer, source, updates) {
    const Account = this.app.orm['Account']
    return Account.findOne({
      where: {
        customer_id: customer.id,
        gateway: source.gateway
      }
    })
      .then(account => {
        source.account_id = account.id
        return this.app.services.AccountService.updateSource(account, source, updates)
      })
  }
}

