/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const Errors = require('proxy-engine-errors')
const _ = require('lodash')
/**
 * @module AccountService
 * @description 3rd Party Account Service
 */
module.exports = class AccountService extends Service {
  resolve(account, options) {
    const Account =  this.app.orm['Account']
    if (account instanceof Account.Instance){
      return Promise.resolve(account)
    }
    else if (account && _.isObject(account) && account.id) {
      return Account.findById(account.id, options)
        .then(resAccount => {
          if (!resAccount) {
            throw new Errors.FoundError(Error(`Account ${account.id} not found`))
          }
          return resAccount
        })
    }
    else if (account && _.isObject(account) && account.gateway && account.customer_id) {
      return Account.findOne({
        where: {
          gateway: account.gateway,
          customer_id: account.customer_id
        }
      }, options)
        .then(resAccount => {
          if (!resAccount) {
            throw new Errors.FoundError(Error(`Account with customer id ${account.customer_id} not found`))
          }
          return resAccount
        })
    }
    else {
      // TODO create proper error
      const err = new Error(`Unable to resolve Account ${account}`)
      return Promise.reject(err)
    }
  }
  resolveSource(source, options) {
    const Source =  this.app.orm['Source']
    if (source instanceof Source.Instance){
      return Promise.resolve(source)
    }
    else {
      // TODO create proper error
      const err = new Error(`Unable to resolve Source ${source}`)
      return Promise.reject(err)
    }
  }

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

  updateAll(customer) {
    //
  }

  /**
   *
   * @param account
   * @param updates
   * @returns {*|Promise.<TResult>}
   */
  update(account, updates) {
    let resAccount
    return this.resolve(account)
      .then(account => {
        resAccount = account
        let update = {
          foreign_id: resAccount.foreign_id,
          foreign_key: resAccount.foreign_key
        }
        // Merge the updates
        update = _.merge(update, updates)
        return this.app.services.PaymentGenericService.updateCustomer(update)
          .then(updatedAccount => {
            resAccount  = _.extend(resAccount, updatedAccount)
            return resAccount.save()
          })
      })
  }

  /**
   *
   * @param account
   * @param token
   * @returns {Promise.<TResult>}
   */
  addSource(account, token) {
    const Source = this.app.orm['Source']
    let resAccount
    return this.resolve(account)
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
        console.log('cart checkout serviceCustomerSource', serviceCustomerSource)
        serviceCustomerSource.account_id = resAccount.id
        serviceCustomerSource.customer_id = resAccount.customer_id
        return Source.create(serviceCustomerSource)
      })
  }

  /**
   *
   * @param account
   * @param source
   * @returns {Promise.<TResult>}
   */
  findCustomerSource(account, source) {
    // const Source = this.app.orm['Source']
    let resAccount, resSource
    return this.resolve(account)
      .then(account => {
        resAccount = account
        return this.resolveSource(source)
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
        resSource.update(serviceCustomerSource)
      })
  }

  /**
   *
   * @param account
   * @param source
   * @param updates
   * @returns {Promise.<TResult>}
   */
  updateSource(account, source, updates) {
    // const Source = this.app.orm['Source']
    let resAccount, resSource
    return this.resolve(account)
      .then(account => {
        resAccount = account
        return this.resolveSource(source)
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
        resSource.update(serviceCustomerSource)
      })
  }
}

