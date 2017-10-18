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
   * @param options
   * @returns {Promise}
   */
  create(customer, options) {
    options = options || {}
    const Account = this.app.orm['Account']
    const Address = this.app.orm['Address']
    const Cart = this.app.orm['Cart']
    const Customer = this.app.orm['Customer']
    const Metadata = this.app.orm['Metadata']
    const Tag = this.app.orm['Tag']
    const User = this.app.orm['User']

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
    const create =  Customer.build({
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      note: customer.note,
      accepts_marketing: customer.accepts_marketing,
      state: customer.state,
      tax_exempt: customer.tax_exempt,
      verified_email: customer.verified_email,
      metadata: Metadata.transform(customer.metadata || {}),
      account_balance: customer.account_balance
    },{
      include: [
        {
          model: Address,
          as: 'shipping_address'
        },
        {
          model: Address,
          as: 'billing_address'
        },
        {
          model: Address,
          as: 'default_address'
        },
        {
          model: Cart,
          as: 'default_cart'
        },
        {
          model: Tag,
          as: 'tags'
        },
        {
          model: Metadata,
          as: 'metadata'
        },
        // {
        //   model: User,
        //   as: 'users'
        // }
      ],
      transaction: options.transaction || null
    })

    return create.save({transaction: options.transaction || null})
      .then(createdCustomer => {
        if (!createdCustomer) {
          throw new Error('Customer could not be created')
        }
        resCustomer = createdCustomer

        // Shipping Address
        if (customer.shipping_address && !_.isEmpty(customer.shipping_address)) {
          return resCustomer.updateShippingAddress(
            customer.shipping_address,
            {transaction: options.transaction || null}
          )
        }
        return
      })
      .then(() => {
        // Billing Address
        if (customer.billing_address && !_.isEmpty(customer.billing_address)) {
          return resCustomer.updateBillingAddress(
            customer.billing_address,
            {transaction: options.transaction || null}
          )
        }
        return
      })
      .then(() => {
        // Default Address
        if (customer.default_address && !_.isEmpty(customer.default_address)) {
          return resCustomer.updateDefaultAddress(
            customer.default_address,
            {transaction: options.transaction || null}
          )
        }
        return
      })
      .then(() => {
        // Tags
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
          return Cart.resolve(customer.default_cart, {transaction: options.transaction || null})
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
            return this.app.services.AccountService.findAndCreate(
              account,
              {transaction: options.transaction || null}
            )
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
              }, {transaction: options.transaction || null})
                .then(account => {
                  // Track Event
                  const event = {
                    object_id: account.customer_id,
                    object: 'customer',
                    objects: [{
                      customer: account.customer_id
                    },{
                      account: account.id
                    }],
                    type: 'customer.account.created',
                    message: `Customer account ${account.foreign_id} created on ${ account.gateway }`,
                    data: _.omit(account, ['events'])
                  }
                  this.app.services.ProxyEngineService.publish(event.type, event, {
                    save: true,
                    transaction: options.transaction || null
                  })

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
          return Customer.sequelize.Promise.mapSeries(customer.users, user => {
            // Setup some defaults
            user.current_customer_id = resCustomer.id

            // If user exists, then update
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
          })
        }
        return []
      })
      .then(users => {
        // console.log('Customer Create Users', users)
        if (users && users.length > 0) {
          return resCustomer.setUsers(users.map(user => user.id), {transaction: options.transaction || null})
        }
        return []
      })
      .then(users => {
        const event = {
          object_id: resCustomer.id,
          object: 'customer',
          objects: [{
            customer: resCustomer.id
          }],
          type: 'customer.created',
          message: `Customer ${ resCustomer.email || 'ID ' + resCustomer.id} created`,
          data: _.omit(resCustomer, ['events'])
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {
          save: true,
          transaction: options.transaction || null
        })
      })
      .then(event => {
        // return resCustomer.reload()
        return Customer.findByIdDefault(resCustomer.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param customer
   * @param options
   * @returns {Promise}
   */
  update(customer, options) {
    options = options || {}
    const Customer = this.app.orm.Customer
    const Tag = this.app.orm.Tag

    if (!customer.id) {
      const err = new Errors.FoundError(Error('Customer is missing id'))
      return Promise.reject(err)
    }

    let resCustomer
    return Customer.findByIdDefault(customer.id, options)
      .then(foundCustomer => {
        if (!foundCustomer) {
          throw new Errors.FoundError(Error('Customer not found'))
        }
        resCustomer = foundCustomer
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
      .then(() => {
        // Save Changes to metadata
        if (customer.metadata) {
          resCustomer.metadata.data = customer.metadata || {}
          return resCustomer.metadata.save({transaction: options.transaction || null})
        }
        return
      })
      .then(() => {
        if (customer.shipping_address) {
          return resCustomer.updateShippingAddress(
            customer.shipping_address,
            {transaction: options.transaction || null}
          )
        }
        return
      })
      .then(() => {
        if (customer.billing_address) {
          return resCustomer.updateBillingAddress(
            customer.billing_address,
            {transaction: options.transaction || null}
          )
        }
        return
      })
      .then(() => {
        if (customer.default_address) {
          return resCustomer.updateDefaultAddress(
            customer.default_address,
            {transaction: options.transaction || null}
          )
        }
        return
      })
      .then(defaultAddress => {
        // return resCustomer.reload()
        const event = {
          object_id: resCustomer.id,
          object: 'customer',
          objects: [{
            customer: resCustomer.id
          }],
          type: 'customer.updated',
          message: `Customer ${ resCustomer.email || 'ID ' + resCustomer.id } updated`,
          data: _.omit(resCustomer, ['events'])
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {
          save: true,
          transaction: options.transaction || null
        })
      })
      .then(event => {
        return Customer.findByIdDefault(resCustomer.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param customer
   * @param options
   * @returns {*}
   */
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
      .then(() => {
        const event = {
          object_id: resCustomer.id,
          object: 'customer',
          objects: [{
            customer: resCustomer.id
          }],
          type: 'customer.account_balance.updated',
          message: `Customer ${ resCustomer.email || 'ID ' + resCustomer.id } account balance was updated to ${ resCustomer.account_balance }`,
          data: resCustomer
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {
          save: true,
          transaction: options.transaction || null
        })
      })
      .then(event => {
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
    // const FootprintService = this.app.services.FootprintService
    const Customer = this.app.orm.Customer
    const customerId = _.isObject(customer) ? customer.id : customer
    const cartId = _.isObject(cart) ? cart.id : cart

    if (!customerId || !cartId) {
      // TODO Create Proper Error
      const err = new Error(`Can not Associate ${customerId} with ${cartId} because it is invalid`)
      return Promise.reject(err)
    }
    let resCustomer
    return Customer.findById(customerId)
      .then(foundCustomer => {
        if (!foundCustomer) {
          throw new Errors.FoundError(Error('Customer not found'))
        }
        resCustomer = foundCustomer
        return resCustomer.hasCart(cartId)
      })
      .then(hasCart => {
        if (!hasCart) {
          return resCustomer.addCart(cartId)
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
   * @param cart
   * @returns {Promise.<TResult>}
   */
  removeCart(customer, cart){
    //
    const Customer = this.app.orm.Customer
    const customerId = _.isObject(customer) ? customer.id : customer
    const cartId = _.isObject(cart) ? cart.id : cart
    let resCustomer
    return Customer.findById(customerId)
      .then(foundCustomer => {
        if (!foundCustomer) {
          throw new Errors.FoundError(Error('Customer not found'))
        }
        resCustomer = foundCustomer
        return resCustomer.hasCart(cartId)
      })
      .then(hasCart => {
        if (hasCart) {
          return resCustomer.removeCart(cartId)
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
   * @param cart
   */
  setDefaultCartForCustomer(customer, cart){
    const Customer = this.app.orm.Customer
    const customerId = _.isObject(customer) ? customer.id : customer
    const cartId = _.isObject(cart) ? cart.id : cart

    if (!customerId || !cartId) {
      // TODO Create Proper Error
      const err = new Error(`Can not Associate ${customerId} with ${cartId} because it is invalid`)
      return Promise.reject(err)
    }
    return Customer.findById(customerId)
      .then(customer => {
        return customer.setDefault_cart(cartId)
      })
      .then(updatedCustomer => {
        return updatedCustomer
      })
  }

  /**
   *
   * @param customer
   * @param tag
   * @returns {Promise.<TResult>}
   */
  addTag(customer, tag){
    const Customer = this.app.orm['Customer']
    const Tag = this.app.orm['Tag']
    let resCustomer, resTag
    return Customer.resolve(customer)
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error('Customer not found'))
        }
        resCustomer = customer
        return Tag.resolve(tag)
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
        return Customer.findByIdDefault(resCustomer.id)
      })
  }

  /**
   *
   * @param customer
   * @param tag
   * @returns {Promise.<TResult>}
   */
  removeTag(customer, tag){
    const Customer = this.app.orm['Customer']
    const Tag = this.app.orm['Tag']
    let resCustomer, resTag
    return Customer.resolve(customer)
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error('Customer not found'))
        }
        resCustomer = customer
        return Tag.resolve(tag)
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
        return Customer.findByIdDefault(resCustomer.id)
      })
  }

  /**
   *
   * @param customer
   * @param collection
   * @returns {Promise.<TResult>}
   */
  addCollection(customer, collection){
    const Customer = this.app.orm['Customer']
    const Collection = this.app.orm['Collection']
    let resCustomer, resCollection
    return Customer.resolve(customer)
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error('Customer not found'))
        }
        resCustomer = customer
        return Collection.resolve(collection)
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
        return Customer.findByIdDefault(resCustomer.id)
      })
  }

  /**
   *
   * @param customer
   * @param collection
   * @returns {Promise.<TResult>}
   */
  removeCollection(customer, collection){
    const Customer = this.app.orm['Customer']
    const Collection = this.app.orm['Collection']
    let resCustomer, resCollection
    return Customer.resolve(customer)
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error('Customer not found'))
        }
        resCustomer = customer
        return Collection.resolve(collection)
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
        return Customer.findByIdDefault(resCustomer.id)
      })
  }

  /**
   *
   * @param customer
   * @param address
   * @param type
   * @param options
   * @returns {Promise.<TResult>}
   */
  addAddress(customer, address, type, options) {
    options = options || {}
    const Customer = this.app.orm['Customer']
    const Address = this.app.orm['Address']

    let resCustomer
    return Customer.resolve(customer, {transaction: options.transaction || null})
      .then(customer => {
        if (!customer) {
          throw new Error('Unable to resolve Customer')
        }
        resCustomer = customer

        if (type === 'shipping'){// || !resCustomer.shipping_address_id) {
          return resCustomer.updateShippingAddress(address, {transaction: options.transaction || null})
            .then(update => {
              return update.shipping_address
            })
        }
        return address
      })
      .then(shippingAddress => {
        if (type === 'billing'){// || !resCustomer.billing_address_id) {
          return resCustomer.updateBillingAddress(shippingAddress, {transaction: options.transaction || null})
            .then(update => {
              return update.billing_address
            })
        }
        return shippingAddress
      })
      .then(billingAddress => {
        if (type === 'default'){// || !resCustomer.default_address_id) {
          return resCustomer.updateDefaultAddress(billingAddress, {transaction: options.transaction || null})
            .then(update => {
              return update.default_address
            })
        }
        return billingAddress
      })
      .then(defaultAddress => {
        if (!type) {
          if (defaultAddress.id || defaultAddress.token) {
            return Address.resolve(defaultAddress, {transaction: options.transaction || null})
              .then(foundAddress => {
                return resCustomer.addAddress(foundAddress.id, {transaction: options.transaction || null})
                  .then(() => {
                    return foundAddress
                  })
              })
          }
          else {
            return resCustomer.createAddress(defaultAddress, {transaction: options.transaction || null})
          }
        }
        return defaultAddress
      })
      .then(resAddress => {
        return resAddress
      })
  }

  /**
   *
   * @param customer
   * @param user
   * @param options
   * @returns {Promise.<TResult>}
   */
  addUser(customer, user, options) {
    options = options || {}

    let resCustomer, resUser
    return this.app.orm['Customer'].resolve(customer, {transaction: options.transaction || null})
      .then(_customer => {
        if (!_customer) {
          throw new Error('Customer Could Not Be Resolved')
        }
        resCustomer = _customer
        return this.app.orm['User'].resolve(user, {transaction: options.transaction || null})
      })
      .then(_user => {
        if (!_user) {
          throw new Error('User Could Not Be Resolved')
        }
        resUser = _user
        return resCustomer.hasUser(resUser.id, {transaction: options.transaction || null})
      })
      .then(hasUser => {
        if (hasUser) {
          return
        }
        return resCustomer.addUser(resUser.id, {transaction: options.transaction || null})
      })
      .then(() => {
        return resUser
      })
  }


  inviteUser(customer, user, options) {
    options = options || {}
  }

  inviteUserAccepted(customer, user, options) {

  }

  /**
   *
   * @param customer
   * @param user
   * @param options
   * @returns {Promise.<TResult>}
   */
  removeUser(customer, user, options) {
    options = options || {}

    let resCustomer, resUser
    return this.app.orm['Customer'].resolve(customer, {transaction: options.transaction || null})
      .then(_customer => {
        if (!_customer) {
          throw new Error('Customer Could Not Be Resolved')
        }
        resCustomer = _customer
        return this.app.orm['User'].resolve(user, {transaction: options.transaction || null})
      })
      .then(_user => {
        if (!_user) {
          throw new Error('User Could Not Be Resolved')
        }
        resUser = _user
        return resCustomer.hasUser(resUser.id, {transaction: options.transaction || null})
      })
      .then(hasUser => {
        if (hasUser) {
          return
        }
        return resCustomer.removeUser(resUser.id, {transaction: options.transaction || null})
      })
      .then(() => {
        return resUser
      })
  }

  /**
   *
   * @param customer
   * @param address
   * @param type
   * @param options
   * @returns {Promise.<TResult>}
   */
  updateAddress(customer, address, type, options) {
    options = options || {}
    const Customer = this.app.orm['Customer']
    const Address = this.app.orm['Address']

    // address = Address.cleanAddress(address)

    let resCustomer
    return Customer.resolve(customer, {transaction: options.transaction || null})
      .then(customer => {
        if (!customer){
          throw new Error('Unable to resolve Customer')
        }
        resCustomer = customer

        return Address.resolve(address, {transaction: options.transaction || null})
      })
      .then(foundAddress => {
        if (!foundAddress) {
          throw new Error('Address could not resolve')
        }
        return foundAddress.merge(address).save({transaction: options.transaction || null})
      })
      .then(updatedAddress => {
        if (type === 'shipping'){// || !resCustomer.shipping_address_id) {
          return resCustomer.updateShippingAddress(updatedAddress, {transaction: options.transaction || null})
            .then(update => {
              return update.shipping_address
            })
        }
        return updatedAddress
      })
      .then(shippingAddress => {
        if (type === 'billing'){// || !resCustomer.billing_address_id) {
          return resCustomer.updateBillingAddress(shippingAddress, {transaction: options.transaction || null})
            .then(update => {
              return update.billing_address
            })
        }
        return shippingAddress
      })
      .then(billingAddress => {
        if (type === 'default'){// || !resCustomer.default_address_id) {
          return resCustomer.updateDefaultAddress(billingAddress, {transaction: options.transaction || null})
            .then(update => {
              return update.default_address
            })
        }
        return billingAddress
      })
      .then(defaultAddress => {
        if (!type) {
          if (defaultAddress.id || defaultAddress.token) {
            return Address.resolve(defaultAddress, {transaction: options.transaction || null})
              .then(foundAddress => {
                return resCustomer.addAddress(foundAddress.id, {transaction: options.transaction || null})
                  .then(() => {
                    return foundAddress
                  })
              })
          }
          else {
            return resCustomer.createAddress(defaultAddress, {transaction: options.transaction || null})
          }
        }
        return defaultAddress
      })
      .then(resAddress => {
        return resAddress
      })
  }

  /**
   *
   * @param customer
   * @param address
   * @param options
   * @returns {*}
   */
  removeAddress(customer, address, options) {
    options = options || {}
    const Customer = this.app.orm['Customer']
    const Address = this.app.orm['Address']
    let resCustomer, resAddress
    return Customer.resolve(customer, {transaction: options.transaction || null})
      .then(foundCustomer => {
        if (!foundCustomer) {
          throw new Error('Customer could not resolve')
        }
        resCustomer = foundCustomer
        return Address.resolve(address, {transaction: options.transaction || null})
      })
      .then(foundAddress => {
        if (!foundAddress) {
          throw new Error('Address could not resolve')
        }
        resAddress = foundAddress
        return resCustomer.removeAddress(resAddress.id, {transaction: options.transaction || null})
      })
      .then(destroyedAddress => {
        return resAddress
      })
  }

  /**
   *
   * @param customer
   * @param options
   * @returns {Promise.<TResult>}
   */
  setAddresses(customer, options) {
    options = options || {}
    const Customer = this.app.orm['Customer']
    let resCustomer
    return Customer.resolve(customer, {transaction: options.transaction || null})
      .then(customer => {
        resCustomer = customer
        if (resCustomer.shipping_address_id && resCustomer.changed('shipping_address_id')) {
          return resCustomer.hasAddress(resCustomer.shipping_address_id, {
            // through: {
            address: 'shipping',
            // },
            transaction: options.transaction || null
          })
        }
        return false
      })
      .then(hasShipping => {
        if (!hasShipping && resCustomer.shipping_address_id && resCustomer.changed('shipping_address_id')) {
          return resCustomer.addAddress(resCustomer.shipping_address_id, {
            // through: {
            address: 'shipping',
            // },
            transaction: options.transaction || null
          })
        }
        return
      })
      .then(() => {
        if (resCustomer.billing_address_id && resCustomer.changed('billing_address_id')) {
          return resCustomer.hasAddress(resCustomer.billing_address_id, {
            // through: {
            address: 'billing',
            // },
            transaction: options.transaction || null
          })
        }
        return false
      })
      .then(hasBilling => {
        if (!hasBilling && resCustomer.billing_address_id && resCustomer.changed('billing_address_id')) {
          return resCustomer.addAddress(resCustomer.billing_address_id, {
            // through: {
            address: 'billing',
            // },
            transaction: options.transaction || null
          })
        }
        return
      })
      .then(() => {
        if (resCustomer.default_address_id && resCustomer.changed('default_address_id')) {
          return resCustomer.hasAddress(resCustomer.default_address_id, {
            // through: {
            address: 'default',
            // },
            transaction: options.transaction || null
          })
        }
        return false
      })
      .then(hasDefault => {
        if (!hasDefault && resCustomer.default_address_id && resCustomer.changed('default_address_id')) {
          return resCustomer.addAddress(resCustomer.default_address_id, {
            // through: {
            address: 'default',
            // },
            transaction: options.transaction || null
          })
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
   * @param options
   * @returns {Promise.<TResult>}
   */
  afterCreate(customer, options) {
    options = options || {}
    return this.setAddresses(customer, options)
      .then(customerAddresses => {
        this.app.services.ProxyEngineService.publish('customer.created', customer)
        return customer
      })
  }

  /**
   *
   * @param customer
   * @param options
   * @returns {Promise.<TResult>}
   */
  afterUpdate(customer, options) {
    options = options || {}
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
          return this.setAddresses(customer, options)
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
        return this.app.services.AccountService.addSource(account, source.gateway_token)
      })
  }

  /**
   *
   * @param customer
   * @param source
   * @returns {Promise.<TResult>}
   */
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

  /**
   *
   * @param customer
   * @param account
   * @returns {Promise.<TResult>}
   */
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

  /**
   *
   * @param customer
   * @param source
   * @returns {*|Promise.<TResult>}
   */
  removeCustomerSource(customer, source) {
    const Source = this.app.orm['Source']
    return Source.resolve(source)
      .then(source => {
        return this.app.services.AccountService.removeSource(source)
      })
  }
}

