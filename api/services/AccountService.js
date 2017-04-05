'use strict'

const Service = require('trails/service')
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
    // const Source = this.app.orm['Source']
    let resAccount
    return this.resolve(account)
      .then(account => {
        resAccount = account
        return this.app.services.PaymentGenericService.createCustomerSource({
          account_foreign_id: account.foreign_id,
          token: token
        })
      })
      .then(serviceCustomerSource => {
        return resAccount.addSource(serviceCustomerSource)
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

