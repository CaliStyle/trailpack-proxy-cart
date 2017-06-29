/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const Errors = require('proxy-engine-errors')
const _ = require('lodash')
const TRANSACTION_STATUS = require('../utils/enums').TRANSACTION_STATUS

/**
 * @module AccountService
 * @description 3rd Party Account Service
 */
module.exports = class AccountService extends Service {

  /**
   *
   * @param customer
   * @param paymentDetails
   * @returns {Promise.<*>}
   */
  resolvePaymentDetailsToSources(customer, paymentDetails) {
    return Promise.all(paymentDetails.map(detail => {
      if (detail.token) {
        return this.addSource({
          customer_id: customer.id,
          gateway: detail.gateway
        }, detail.token)
         .then(source => {
           delete detail.token
           detail.source = source.get({ plain: true })
           return detail
         })
         .catch(err => {
           return detail
         })
      }
      else {
        return detail
      }
    }))
  }

  /**
   *
   * @param customer
   * @returns {*}
   */
  getDefaultSource(customer, options) {
    options = options || {}
    if (!customer) {
      const err = new Errors.FoundError(Error('Customer Not Provided'))
      return Promise.reject(err)
    }
    const Source = this.app.orm['Source']
    const Customer = this.app.orm['Customer']
    let resCustomer
    return Customer.resolve(customer, {transaction: options.transaction || null })
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error('Customer Not Found'))
        }
        resCustomer = customer

        return Source.findOne({
          where: {
            customer_id: resCustomer.id,
            is_default: true
          },
          transaction: options.transaction || null
        })
      })
      .then(source => {
        // If there is no default, find one for the customer
        if (!source) {
          return Source.findOne({
            where: {
              customer_id: resCustomer.id
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
  }
  // TODO
  updateAll(customer) {
    //
  }

  /**
   *
   * @param account
   * @param updates
   * @param options
   * @returns {*|Promise.<TResult>}
   */
  update(account, updates, options) {
    options = options || {}
    const Account = this.app.orm['Account']
    let resAccount
    return Account.resolve(account, options)
      .then(account => {
        resAccount = account
        let update = {
          foreign_id: resAccount.foreign_id,
          foreign_key: resAccount.foreign_key,
          email: resAccount.email
        }
        // Merge the updates
        update = _.merge(update, updates)
        return this.app.services.PaymentGenericService.updateCustomer(update)
          .then(updatedAccount => {
            resAccount  = _.extend(resAccount, updatedAccount)
            return resAccount.save()
          })
      })
      .then(() => {
        const event = {
          object_id: resAccount.customer_id,
          object: 'customer',
          objects: [{
            customer: resAccount.customer_id
          }, {
            account: resAccount.id
          }],
          type: 'customer.account.updated',
          message: `Customer account ${resAccount.foreign_id} was updated on ${resAccount.gateway}`,
          data: resAccount
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resAccount
      })
  }

  /**
   *
   * @param account
   * @param options
   * @returns {Promise.<TResult>}
   */
  findAndCreate(account, options) {
    options = options || {}
    const Account = this.app.orm['Account']
    const Source = this.app.orm['Source']
    let resAccount, resSource

    return this.app.services.PaymentGenericService.findCustomer(account)
      .then(serviceCustomer => {
        // Set the default
        const create = {
          customer_id: account.customer_id,
          email: account.email,
          is_default: true,
          gateway: serviceCustomer.gateway,
          foreign_id: serviceCustomer.foreign_id,
          foreign_key: serviceCustomer.foreign_key,
          data: serviceCustomer.data
        }
        return Account.create(create, options)
          .then(account => {
            resAccount = account
            return this.app.services.PaymentGenericService.getCustomerSources(resAccount)
          })
          .then(accountWithSources => {
            return Promise.all(accountWithSources.sources.map((source, index) => {
              source.customer_id = resAccount.customer_id
              source.is_default = index == 0 ? true : false

              return Source.create(source, {transaction: options.transaction || null})
                .then(source => {
                  if (!source) {
                    throw new Error('Source was not created')
                  }
                  resSource = source
                  // Track Event
                  const event = {
                    object_id: resSource.customer_id,
                    object: 'customer',
                    objects: [{
                      customer: resAccount.customer_id
                    }, {
                      account: resAccount.id
                    }, {
                      source: resSource.id
                    }],
                    type: 'customer.source.created',
                    message: `Customer source ${resSource.foreign_id} was created on ${ resSource.gateway }`,
                    data: resSource
                  }
                  return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
                })
                .then(event => {
                  return resSource
                })
            }))
          })
          .then(sources => {
            const event = {
              object_id: resAccount.customer_id,
              object: 'customer',
              objects: [{
                customer: resAccount.customer_id
              }, {
                account: resAccount.id
              }],
              type: 'customer.account.created',
              message: `Customer account ${account.foreign_id} was created on ${account.gateway}`,
              data: resAccount
            }
            return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
          })
          .then(event => {
            return resAccount
          })
      })
  }

  /**
   *
   * @param account
   * @param token
   * @param options
   * @returns {Promise.<TResult>}
   */
  addSource(account, token, options) {
    options = options || {}
    const Account = this.app.orm['Account']
    const Source = this.app.orm['Source']

    let resAccount, resSource
    return Account.resolve(account, {transaction: options.transaction || null})
      .then(account => {
        if (!account) {
          throw new Error('Account did not resolve')
        }
        resAccount = account
        return this.app.services.PaymentGenericService.createCustomerSource({
          account_foreign_id: resAccount.foreign_id,
          token: token
        })
      })
      .then(serviceCustomerSource => {
        // console.log('cart checkout serviceCustomerSource', serviceCustomerSource)
        serviceCustomerSource.gateway = resAccount.gateway
        serviceCustomerSource.account_id = resAccount.id
        serviceCustomerSource.customer_id = resAccount.customer_id
        serviceCustomerSource.is_default = true
        return Source.create(serviceCustomerSource, {transaction: options.transaction || null})
      })
      .then(source => {
        if (!source) {
          throw new Error('Source was not created')
        }
        resSource = source
        return Source.update({
          is_default: false
        }, {
          where: {
            account_id: resSource.account_id,
            id: {
              $ne: resSource.id
            }
          },
          hooks: false,
          individualHooks: false,
          returning: false,
          transaction: options.transaction || null
        })
      })
      .then(() => {
        const event = {
          object_id: resSource.customer_id,
          object: 'customer',
          objects: [{
            customer: resAccount.customer_id
          }, {
            account: resAccount.id
          }, {
            source: resSource.id
          }],
          type: 'customer.source.created',
          message: `Customer source ${resSource.foreign_id} was created on ${ resSource.gateway }`,
          data: resSource
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resSource
      })
  }

  /**
   *
   * @param account
   * @param source
   * @returns {Promise.<TResult>}
   */
  findSource(account, source, options) {
    options = options || {}
    const Account = this.app.orm['Account']
    const Source = this.app.orm['Source']
    let resAccount, resSource
    return Account.resolve(account, {transaction: options.transaction || null})
      .then(account => {
        resAccount = account
        return Source.resolve(source, {transaction: options.transaction || null})
      })
      .then(source => {
        resSource = source
        const find = {
          account_foreign_id: resAccount.foreign_id,
          foreign_id: resSource.foreign_id
        }
        return this.app.services.PaymentGenericService.findCustomerSource(find)
      })
      .then(serviceCustomerSource => {
        resSource = _.extend(resSource, serviceCustomerSource)
        resSource.is_default = true
        return resSource.save()
      })
      .then(() => {
        return Source.update({
          is_default: false
        }, {
          where: {
            account_id: resSource.account_id,
            id: {
              $ne: resSource.id
            }
          },
          hooks: false,
          individualHooks: false,
          returning: false,
          transaction: options.transaction || null
        })
      })
      .then(() => {
        return resSource
      })
  }

  /**
   *
   * @param account
   * @param source
   * @param updates
   * @returns {Promise.<TResult>}
   */
  updateSource(account, source, updates, options) {
    options = options || {}
    const Account = this.app.orm['Account']
    const Source = this.app.orm['Source']

    let resAccount, resSource
    return Account.resolve(account)
      .then(account => {
        resAccount = account
        return Source.resolve(source)
      })
      .then(source => {
        resSource = source
        let update = {
          account_foreign_id: resAccount.foreign_id,
          foreign_id: resSource.foreign_id
        }
        update = _.merge(update, updates)
        return this.app.services.PaymentGenericService.updateCustomerSource(update)
      })
      .then(serviceCustomerSource => {
        resSource = _.extend(resSource, serviceCustomerSource)
        return resSource.save()
      })
      .then(() => {
        return Source.update({
          is_default: false
        }, {
          where: {
            account_id: resSource.account_id,
            id: {
              $ne: resSource.id
            }
          },
          hooks: false,
          individualHooks: false,
          returning: false,
          transaction: options.transaction || null
        })
      })
      .then(() => {
        const event = {
          object_id: resAccount.customer_id,
          object: 'customer',
          objects: [{
            customer: resAccount.customer_id
          }, {
            account: resAccount.id
          }, {
            source: resSource.id
          }],
          type: 'customer.source.updated',
          message: `Customer source ${resSource.foreign_id} was updated on ${ resSource.gateway }`,
          data: resSource
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resSource
      })
  }

  /**
   *
   * @param source
   * @param options
   * @returns {Promise.<TResult>}
   */
  removeSource(source, options) {
    options = options || {}
    const Source = this.app.orm['Source']
    let resSource
    return Source.resolve(source, options)
      .then(source => {
        resSource = source
        return this.app.services.PaymentGenericService.removeCustomerSource(source)
      })
      .then(customerSource => {
        return this.app.orm['Source'].destroy({
          where: {
            id: resSource.id
          },
          transaction: options.transaction || null
        })
      })
      .then(() => {
        // Set a new default source
        return Source.findOne({
          where: {
            customer_id: resSource.customer_id,
            account_id: resSource.account_id
          }
        })
          .then(altSource => {
            if (altSource) {
              altSource.is_default = true
              return altSource.save()
            }
            return
          })
      })
      .then(() => {
        const event = {
          object_id: resSource.customer_id,
          object: 'customer',
          objects: [{
            customer: resSource.customer_id
          }, {
            account: resSource.account_id
          }, {
            source: resSource.id
          }],
          type: 'customer.source.removed',
          message: `Customer source ${source.foreign_id} was removed on ${ source.gateway }`,
          data: resSource
        }
        return this.app.services.ProxyEngineService.publish(event.type, event, {save: true})
      })
      .then(event => {
        return resSource
      })
  }

  /**
   *
   * @param account
   * @param options
   * @returns {Promise.<TResult>}
   */
  syncSources(account, options) {
    options = options || {}
    const Account = this.app.orm['Account']
    const Source = this.app.orm['Source']
    let resAccount

    return Account.resolve(account, options)
      .then(account => {
        resAccount = account
        return this.app.services.PaymentGenericService.findCustomerSources(account)
      })
      .then(serviceCustomerSources => {
        return Promise.all(serviceCustomerSources.map((source, index) => {
          source.gateway = resAccount.gateway
          source.account_id = resAccount.id
          source.customer_id = resAccount.customer_id
          source.is_default = index == 0 ? true : false

          return Source.findOrCreate({
            where: {
              customer_id: source.customer_id,
              account_id: source.account_id,
              foreign_id: source.foreign_id
            },
            defaults: source,
            transaction: options.transaction || null
          })
        }))
      })
  }

  /**
   *
   * @param source
   * @param options
   */
  sourceRetryTransactions(source, options) {
    options = options || {}
    const Source = this.app.orm['Source']
    // const Transaction = this.app.orm['Transaction']
    let resSource
    return Source.resolve(source, options)
      .then(source => {
        if (!source) {
          throw new Error('Source could not be resolved')
        }
        resSource = source
        return resSource.getTransactions({
          status: TRANSACTION_STATUS.FAILURE
        })
      })
      .then(transactions => {
        return Promise.all(transactions.map(transaction => {
          transaction.payment_detials.source = resSource
          return this.app.services.TransactionService.retry(transaction, {transaction: options.transaction || null})
        }))
      })
  }

  afterSourceCreate(source, options) {
    options = options || {}
    return this.app.orm['CustomerSource'].create({
      source_id: source.id,
      source: source.gateway,
      account_id: source.account_id,
      customer_id: source.customer_id
    })
      .then(customerSource => {
        return source
      })
  }
  afterSourceDestroy(source, options) {
    options = options || {}
    return this.app.orm['CustomerSource'].destroy({
      where: {
        source_id: source.id
      }
    })
      .then(customerSource => {
        return source
      })
  }
}

