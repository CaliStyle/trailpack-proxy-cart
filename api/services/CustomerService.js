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
    else if (customer && _.isObject(customer) && customer.email) {
      return Customer.findOne({
        where: {
          email: customer.email
        }
      }, options)
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
  create(customer, options) {
    const Customer = this.app.orm.Customer
    const Tag = this.app.orm.Tag
    const Cart = this.app.orm.Cart
    const Metadata = this.app.orm.Metadata
    const Address = this.app.orm.Address
    const Account = this.app.orm.Account
    const User = this.app.orm.User

    if (!options) {
      options = {}
    }
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
      ],
      transaction: options.transaction || null
    })
      .then(createdCustomer => {
        resCustomer = createdCustomer
        if (customer.tags && customer.tags.length > 0) {
          customer.tags = _.sortedUniq(customer.tags.filter(n => n))
          return Tag.transformTags(customer.tags, {transaction: options.transaction || null})
        }
        return
      })
      .then(tags => {
        // Add Tags
        if (tags && tags.length > 0) {
          return resCustomer.setTags(tags.map(tag => tag.id), {transaction: options.transaction || null})
        }
        return
      })
      .then(tags => {
        if (customer.default_cart) {
          // Resolve the Cart
          // console.log('DEFAULT CART', customer.default_cart)
          return this.app.services.CartService.resolve(customer.default_cart, {transaction: options.transaction || null})
        }
        return
      })
      .then(cart => {
        if (cart) {
          // Set this cart as the default cart
          return resCustomer.setDefault_cart(cart.id, {transaction: options.transaction || null})
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
                  // Track Event
                  const event = {
                    object_id: account.customer_id,
                    object: 'customer',
                    type: 'customer.account.created',
                    message: 'Customer account created',
                    data: account
                  }
                  this.app.services.ProxyEngineService.publish(event.type, event, {save: true})

                  return [account]
                })
            })
        }
      })
      .then(accounts => {
        if (accounts && accounts.length > 0) {
          return resCustomer.setAccounts(accounts.map(account => account.id), {transaction: options.transaction || null})
        }
        return
      })
      .then(accounts => {
        if (customer.users && customer.users.length > 0) {
          return Promise.all(customer.users.map(user => {
            // Setup some defaults
            user.current_customer_id = resCustomer.id

            // If customer exists, then update
            if (user instanceof User.Instance){
              return user.save({transaction: options.transaction || null})
            }

            // Create a new password
            user.passports = {
              protocol: 'local'
            }
            return User.create(user, {
              include: [
                {
                  model: this.app.orm['Passport'],
                  as: 'passports'
                }
              ],
              transaction: options.transaction || null
            })
          }))
        }
        return
      })
      .then(users => {
        if (users && users.length > 0) {
          return resCustomer.setUsers(users.map(user => user.id), {transaction: options.transaction || null})
        }
        return
      })
      .then(users => {
        // return resCustomer.reload()
        return Customer.findByIdDefault(resCustomer.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param customer
   * @returns {Promise}
   */
  update(customer, options) {
    const Customer = this.app.orm.Customer
    const Tag = this.app.orm.Tag

    if (!customer.id) {
      const err = new Errors.FoundError(Error('Customer is missing id'))
      return Promise.reject(err)
    }
    if (!options) {
      options = {}
    }

    let resCustomer = {}
    return Customer.findByIdDefault(customer.id, options)
      .then(foundCustomer => {
        resCustomer = foundCustomer
        // console.log('resCustomer',resCustomer)
        // Update Metadata

        const update = _.omit(customer, ['tags', 'metadata', 'shipping_address','billing_address','default_address'])
        return resCustomer.update(update)
      })
      .then(updatedCustomer => {
        if (customer.tags && customer.tags.length > 0) {
          customer.tags = _.sortedUniq(customer.tags.filter(n => n))
          return Tag.transformTags(customer.tags, {transaction: options.transaction || null})
        }
        return
      })
      .then(tags => {
        if (tags && tags.length > 0) {
          return resCustomer.setTags(tags.map(tag => tag.id), {transaction: options.transaction || null})
        }
        return
      })
      .then(tags => {
        // Save Changes to metadata
        if (customer.metadata) {
          resCustomer.metadata.data = customer.metadata || {}
          return resCustomer.metadata.save({transaction: options.transaction || null})
        }
        return
      })
      .then(metadata => {
        if (customer.shipping_address) {
          if (customer.shipping_address.id) {
            return resCustomer.setShipping_address(customer.shipping_address.id, {transaction: options.transaction || null})
          }
          else {
            resCustomer.shipping_address = _.extend(resCustomer.shipping_address, customer.shipping_address)
            return resCustomer.shipping_address.save({transaction: options.transaction || null})
          }
        }
        return
      })
      .then(shippingAddress => {
        if (customer.billing_address) {
          if (customer.billing_address.id) {
            return resCustomer.setBilling_address(customer.billing_address.id, {transaction: options.transaction || null})
          }
          else {
            resCustomer.billing_address = _.extend(resCustomer.billing_address, customer.billing_address)
            return resCustomer.billing_address.save({transaction: options.transaction || null})
          }
        }
        return
      })
      .then(billingAddress => {
        if (customer.default_address) {
          if (customer.default_address.id) {
            return resCustomer.setDefault_address(customer.default_address.id, {transaction: options.transaction || null})
          }
          else {
            resCustomer.default_address = _.extend(resCustomer.default_address, customer.default_address)
            return resCustomer.default_address.save({transaction: options.transaction || null})
          }
        }
        return
      })
      .then(defaultAddress => {
        // return resCustomer.reload()
        return Customer.findByIdDefault(resCustomer.id, {transaction: options.transaction || null})
      })
  }

  accountBalance(customer, options) {
    const Customer = this.app.orm.Customer

    if (!customer.id) {
      const err = new Errors.FoundError(Error('Customer is missing id'))
      return Promise.reject(err)
    }
    if (!options) {
      options = {}
    }

    let resCustomer = {}
    return Customer.findById(customer.id)
      .then(foundCustomer => {
        if (!foundCustomer) {
          throw new Errors.FoundError(Error('Customer was not found'))
        }
        resCustomer = foundCustomer
        resCustomer.account_balance = customer.account_balance
        return resCustomer.save({transaction: options.transaction || null})
      })
      .then(customer => {

        const event = {
          object_id: customer.id,
          object: 'customer',
          type: 'customer.account_balance.updated',
          message: `Customer account balance was updated to ${ customer.account_balance }`,
          data: customer
        }
        this.app.services.ProxyEngineService.publish(event.type, event, {save: true})

        return Customer.findByIdDefault(resCustomer.id, {transaction: options.transaction || null})
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

  /**
   *
   * @param customer
   * @param cart
   */
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

  /**
   *
   * @param customer
   * @param tag
   * @returns {Promise.<TResult>}
   */
  addTag(customer, tag){
    let resCustomer, resTag
    return this.resolve(customer)
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error('Customer not found'))
        }
        resCustomer = customer
        return this.app.services.TagService.resolve(tag)
      })
      .then(tag => {
        if (!tag) {
          throw new Errors.FoundError(Error('Customer not found'))
        }
        resTag = tag
        return resCustomer.hasTag(resTag.id)
      })
      .then(hasTag => {
        if (!hasTag) {
          return resCustomer.addTag(resTag.id)
        }
        return resCustomer
      })
      .then(tag => {
        return this.app.orm['Customer'].findByIdDefault(resCustomer.id)
      })
  }

  /**
   *
   * @param customer
   * @param tag
   * @returns {Promise.<TResult>}
   */
  removeTag(customer, tag){
    let resCustomer, resTag
    return this.resolve(customer)
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error('Customer not found'))
        }
        resCustomer = customer
        return this.app.services.TagService.resolve(tag)
      })
      .then(tag => {
        if (!tag) {
          throw new Errors.FoundError(Error('Customer not found'))
        }
        resTag = tag
        return resCustomer.hasTag(resTag.id)
      })
      .then(hasTag => {
        if (hasTag) {
          return resCustomer.removeTag(resTag.id)
        }
        return resCustomer
      })
      .then(tag => {
        return this.app.orm['Customer'].findByIdDefault(resCustomer.id)
      })
  }

  /**
   *
   * @param customer
   * @param collection
   * @returns {Promise.<TResult>}
   */
  addCollection(customer, collection){
    let resCustomer, resCollection
    return this.resolve(customer)
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error('Customer not found'))
        }
        resCustomer = customer
        return this.app.services.CollectionService.resolve(collection)
      })
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Customer not found'))
        }
        resCollection = collection
        return resCustomer.hasCollection(resCollection.id)
      })
      .then(hasCollection => {
        if (!hasCollection) {
          return resCustomer.addCollection(resCollection.id)
        }
        return resCustomer
      })
      .then(collection => {
        return this.app.orm['Customer'].findByIdDefault(resCustomer.id)
      })
  }

  /**
   *
   * @param customer
   * @param collection
   * @returns {Promise.<TResult>}
   */
  removeCollection(customer, collection){
    let resCustomer, resCollection
    return this.resolve(customer)
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error('Customer not found'))
        }
        resCustomer = customer
        return this.app.services.CollectionService.resolve(collection)
      })
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Customer not found'))
        }
        resCollection = collection
        return resCustomer.hasCollection(resCollection.id)
      })
      .then(hasCollection => {
        if (hasCollection) {
          return resCustomer.removeCollection(resCollection.id)
        }
        return resCustomer
      })
      .then(collection => {
        return this.app.orm['Customer'].findByIdDefault(resCustomer.id)
      })
  }

  /**
   *
   * @param customer
   * @param address
   * @returns {Promise.<TResult>}
   */
  addAddress(customer, address, type) {
    // console.log('THIS ADDRESS',address)
    let resCustomer, resAddress
    return this.resolve(customer)
      .then(customer => {
        resCustomer = customer
        return this.app.orm['Address'].create(address)
      })
      .then(address => {
        resAddress = address
        if (type == 'shipping' || !resCustomer.shipping_address_id) {
          return resCustomer.setShipping_address(resAddress.id)
        }
      })
      .then(shippingAddress => {
        if (type == 'billing' || !resCustomer.billing_address_id) {
          return resCustomer.setBilling_address(resAddress.id)
        }
        return
      })
      .then(billingAddress => {
        if (type == 'default' || !resCustomer.default_address_id) {
          return resCustomer.setDefault_address(resAddress.id)
        }
        return
      })
      .then(defaultAddress => {
        if (!type) {
          return resCustomer.addAddress(resAddress.id, {address: 'address'})
        }
      })
      .then(address => {
        return resCustomer.save()
      })
      .then(customer => {
        return resAddress
      })
  }

  /**
   *
   * @param customer
   * @param address
   * @returns {Promise.<TResult>}
   */
  updateAddress(customer, address, type) {
    let resCustomer, resAddress
    return this.resolve(customer)
      .then(customer => {
        resCustomer = customer
        return this.app.orm['Address'].findById(address.id)
      })
      .then(foundAddress => {
        resAddress = _.extend(foundAddress, address)
        return resAddress.save()
      })
      .then(address => {
        if (type == 'shipping') {
          return resCustomer.setShipping_address(address.id)
        }
        else if (type == 'billing') {
          return resCustomer.setBilling_address(address.id)
        }
        else if (type == 'default') {
          return resCustomer.setDefault_address(address.id)
        }
        else {
          return resCustomer
        }
      })
      .then(customer => {
        return resAddress
      })
  }

  /**
   *
   * @param customer
   * @param address
   * @returns {*}
   */
  removeAddress(customer, address) {
    let resCustomer, resAddress
    return this.resolve(customer)
      .then(customer => {
        resCustomer = customer
        return this.app.orm['Address'].findById(address.id)
      })
      .then(foundAddress => {
        resAddress = foundAddress
        return resCustomer.removeAddress(resAddress.id)
      })
      .then(destroyedAddress => {
        return resAddress
      })
  }

  setAddresses(customer) {
    let resCustomer
    return this.resolve(customer)
      .then(customer => {
        resCustomer = customer
        if (resCustomer.shipping_address_id) {
          return resCustomer.hasAddress(resCustomer.shipping_address_id, {address: 'shipping'})
        }
        return false
      })
      .then(hasShipping => {
        if (!hasShipping && resCustomer.shipping_address_id) {
          return resCustomer.addAddress(resCustomer.shipping_address_id, {address: 'shipping'})
        }
        return
      })
      .then(() => {
        if (resCustomer.billing_address_id) {
          return resCustomer.hasAddress(resCustomer.billing_address_id, {address: 'billing'})
        }
        return false
      })
      .then(hasBilling => {
        if (!hasBilling && resCustomer.billing_address_id) {
          return resCustomer.addAddress(resCustomer.billing_address_id, {address: 'billing'})
        }
        return
      })
      .then(() => {
        if (resCustomer.default_address_id) {
          return resCustomer.hasAddress(resCustomer.default_address_id, {address: 'default'})
        }
        return false
      })
      .then(hasDefault => {
        if (!hasDefault && resCustomer.default_address_id) {
          return resCustomer.addAddress(resCustomer.default_address_id, {address: 'default'})
        }
        return
      })
      .then(() => {
        return resCustomer
      })
  }
  /**
   *
   * @param customer
   * @returns {Promise.<TResult>}
   */
  afterCreate(customer) {
    return this.setAddresses(customer)
      .then(customerAddresses => {
        this.app.services.ProxyEngineService.publish('customer.created', customer)
        return customer
      })
  }

  /**
   *
   * @param customer
   * @returns {Promise.<TResult>}
   */
  afterUpdate(customer) {
    this.app.services.ProxyEngineService.publish('customer.updated', customer)
    let updateAccounts = false
    let updateAddresses = false
    const accountUpdates = {}

    if (customer.changed('email')) {
      updateAccounts = true
      accountUpdates.email = customer.email
    }
    if (customer.changed('shipping_address_id') || customer.changed('billing_address_id') || customer.changed('default_address_id')) {
      updateAddresses = true
    }

    return Promise.resolve()
      .then(() => {
        if (updateAddresses) {
          return this.setAddresses(customer)
        }
        return
      })
      .then(() => {
        if (updateAccounts) {
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
        return
      })
      .then(() => {
        return customer
      })
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
  removeCustomerSource(customer, source) {
    return this.app.services.AccountService.resolveSource(source)
      .then(source => {
        return this.app.services.AccountService.removeSource(source)
      })
  }

  calculate(cart) {
    if (!cart.customer_id) {
      return cart
    }
    let deduction = 0
    // let overrides = cart.pricing_overrides

    return this.resolve(cart.customer_id)
      .then(customer => {
        const pricingOverrides = []
        cart.pricing_overrides.forEach(override => {
          pricingOverrides.push(override)
        })

        const accountBalanceIndex = _.findIndex(pricingOverrides, {name: 'Account Balance'})
        if (customer.account_balance > 0) {
          // Apply Customer Account balance
          deduction = Math.min(cart.total_due, (cart.total_due - (cart.total_due - customer.account_balance)))
          if (deduction > 0) {

            // If account balance has not been applied
            if (accountBalanceIndex == -1) {
              pricingOverrides.push({
                name: 'Account Balance',
                price: deduction
              })
            }
            else {
              pricingOverrides[accountBalanceIndex].price = deduction
            }
          }
        }
        else {
          if (accountBalanceIndex > -1) {
            pricingOverrides.splice(accountBalanceIndex, 1)
          }
        }

        cart.pricing_overrides = pricingOverrides

        return cart
      })
  }
}

