/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const Errors = require('proxy-engine-errors')
const _ = require('lodash')
const moment = require('moment')
const TRANSACTION_STATUS = require('../../lib').Enums.TRANSACTION_STATUS

/**
 * @module AccountService
 * @description 3rd Party Account Service
 */
module.exports = class AccountService extends Service {

  /**
   *
   * @param customer
   * @param paymentDetails
   * @param options
   * @returns {Promise.<T>}
   */
  resolvePaymentDetailsToSources(customer, paymentDetails, options) {
    options = options || {}
    const Source = this.app.orm['Source']
    return Source.sequelize.Promise.mapSeries(paymentDetails, detail => {
      if (detail.gateway_token) {
        const account = {
          customer_id: customer.id,
          gateway: detail.gateway
        }
        return this.addSource(
          account,
          detail.gateway_token,
          { transaction: options.transaction || null }
        )
         .then(source => {
           // Convert to plain object
           source = source instanceof this.app.orm['Source'] ? source.get({plain: true }) : source
           delete detail.gateway_token
           detail.source = source
           return detail
         })
         .catch(err => {
           return detail
         })
      }
      else if (_.isNumber(detail.source)) {
        return this.app.orm['Source'].findById(detail.source)
          .then(source => {
            // Convert to plain object
            source = source instanceof this.app.orm['Source'] ? source.get({plain: true }) : source
            delete detail.gateway_token
            detail.source = source
            return detail
          })
          .catch(err => {
            return detail
          })
      }
      else {
        return detail
      }
    })
  }

  /**
   *
   * @param customer
   * @param options
   * @returns {*}
   */
  getDefaultSource(customer, options) {
    options = options || {}
    if (!customer) {
      const err = new Errors.FoundError(Error('Customer Not Provided'))
      return Promise.reject(err)
    }
    const Customer = this.app.orm['Customer']
    let resCustomer
    return Customer.resolve(customer, {transaction: options.transaction || null, create: false })
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error('Customer Not Found'))
        }
        resCustomer = customer

        return resCustomer.getDefaultSource({transaction: options.transaction || null})
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
   * @returns {Promise.<T>}
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
            return resAccount.save({transaction: options.transaction || null})
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
        return this.app.services.ProxyEngineService.publish(event.type, event, {
          save: true,
          transaction: options.transaction || null
        })
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
            return Source.sequelize.Promise.mapSeries(accountWithSources.sources, (source, index) => {
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
                  return this.app.services.ProxyEngineService.publish(event.type, event, {
                    save: true,
                    transaction: options.transaction || null
                  })
                })
                .then(event => {
                  return resSource
                })
            })
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
            return this.app.services.ProxyEngineService.publish(event.type, event, {
              save: true,
              transaction: options.transaction || null
            })
          })
          .then(event => {
            return resAccount
          })
      })
  }

  /**
   *
   * @param account
   * @param gatewayToken
   * @param options
   * @returns {Promise.<TResult>}
   */
  addSource(account, gatewayToken, options) {
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
          gateway_token: gatewayToken
        })
      })
      .then(serviceCustomerSource => {
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
        return this.app.services.ProxyEngineService.publish(event.type, event, {
          save: true,
          transaction: options.transaction || null
        })
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
        return resSource.save({transaction: options.transaction || null})
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
   * @param options
   * @returns {Promise.<T>}
   */
  updateSource(account, source, updates, options) {
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
        let update = {
          account_foreign_id: resAccount.foreign_id,
          foreign_id: resSource.foreign_id
        }
        update = _.merge(update, updates)
        return this.app.services.PaymentGenericService.updateCustomerSource(update)
      })
      .then(serviceCustomerSource => {
        resSource = _.extend(resSource, serviceCustomerSource)
        return resSource.save({transaction: options.transaction || null})
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
        return this.app.services.ProxyEngineService.publish(event.type, event, {
          save: true,
          transaction: options.transaction || null
        })
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
        return resSource.destroy({transaction: options.transaction || null})
        // return this.app.orm['Source'].destroy({
        //   where: {
        //     id: resSource.id
        //   },
        //   transaction: options.transaction || null
        // })
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
              return altSource.save({transaction: options.transaction || null})
            }
            else {
              return
            }
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
        return this.app.services.ProxyEngineService.publish(event.type, event, {
          save: true,
          transaction: options.transaction || null
        })
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

    return Account.resolve(account, {transaction: options.transaction || null})
      .then(account => {
        resAccount = account
        return this.app.services.PaymentGenericService.findCustomerSources(account)
      })
      .then(serviceCustomerSources => {
        return Source.sequelize.Promise.mapSeries(serviceCustomerSources, (source, index) => {
          source.gateway = resAccount.gateway
          source.account_id = resAccount.id
          source.customer_id = resAccount.customer_id
          source.is_default = index == 0 ? true : false

          return Source.findOrCreate({
            defaults: source,
            where: {
              customer_id: source.customer_id,
              account_id: source.account_id,
              foreign_id: source.foreign_id
            },
            transaction: options.transaction || null
          })
        })
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
          where: {
            status: [TRANSACTION_STATUS.FAILURE, TRANSACTION_STATUS.ERROR]
          },
          transaction: options.transaction || null
        })
      })
      .then(transactions => {
        return Source.sequelize.Promise.mapSeries(transactions, transaction => {
          transaction.payment_details.source = resSource
          return this.app.services.TransactionService.retry(transaction, {transaction: options.transaction || null})
        })
      })
  }
  /**
   * Sends Source Will Expire Email
   * @param source
   * @param options
   * @returns {Promise.<TResult>}
   */
  sourceExpired(source, options) {
    options = options || {}

    const Source = this.app.orm['Source']
    let resSource
    return Source.resolve(source, {transaction: options.transaction || null})
      .then(_source => {
        if (!_source) {
          throw new Error('Source did not resolve')
        }
        if (!(_source instanceof Source)) {
          throw new Error('Source did not resolve instance of Source')
        }
        resSource = _source
        return resSource.sendExpiredEmail({transaction: options.transaction || null})
      })
      .then(notification => {
        return resSource
      })
  }

  /**
   * Sends Source Will Expire Email
   * @param source
   * @param options
   * @returns {Promise.<TResult>}
   */
  sourceWillExpire(source, options) {
    options = options || {}

    const Source = this.app.orm['Source']
    let resSource
    return Source.resolve(source, {transaction: options.transaction || null})
      .then(_source => {
        if (!_source) {
          throw new Error('Source did not resolve')
        }
        if (!(_source instanceof Source)) {
          throw new Error('Source did not resolve instance of Source')
        }
        resSource = _source
        return resSource.sendWillExpireEmail({transaction: options.transaction || null})
      })
      .then(notification => {
        return resSource
      })
  }

  afterSourceCreate(source, options) {
    options = options || {}
    return this.app.orm['CustomerSource'].create({
      source_id: source.id,
      source: source.gateway,
      account_id: source.account_id,
      customer_id: source.customer_id
    }, {
      transaction: options.transaction || null
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
      },
      transaction: options.transaction || null
    })
      .then(customerSource => {
        return source
      })
  }

  /**
   * Sources that are now expired
   * @param options
   */
  sourcesExpiredThisMonth(options) {
    options = options || {}

    const start = moment()
      .subtract(1, 'months')
    const startMonth = start.clone().format('MM')
    const startYear = start.clone().format('YYYY')

    const Source = this.app.orm['Source']
    const errors = []
    // let errorsTotal = 0
    let sourcesTotal = 0

    this.app.log.debug('AccountService.sourcesExpiredThisMonth', startMonth, startYear)

    return Source.batch({
      where: {
        $or: [{
          payment_details: {
            type: 'credit_card',
            credit_card_exp_month: startMonth,
            credit_card_exp_year: startYear
          }
        }, {
          payment_details: {
            type: 'debit_card',
            credit_card_exp_month: startMonth,
            credit_card_exp_year: startYear
          }
        }]
      },
      regressive: false,
      transaction: options.transaction || null
    }, (sources) => {

      const Sequelize = Source.sequelize
      return Sequelize.Promise.mapSeries(sources, source => {
        return this.sourceExpired(source, {transaction: options.transaction || null})
      })
        .then(results => {
          // Calculate Totals
          sourcesTotal = sourcesTotal + results.length
          return
        })
        .catch(err => {
          // errorsTotal++
          this.app.log.error(err)
          errors.push(err)
          return
        })
    })
      .then(sources => {
        const results = {
          sources: sourcesTotal,
          errors: errors
        }
        this.app.log.info(results)
        this.app.services.ProxyEngineService.publish('account.sourcesExpiredThisMonth.complete', results)
        return results
      })
      .catch(err => {
        this.app.log.error(err)
        return
      })
  }

  /**
   * Sources that will expire this month
   * @param options
   */
  sourcesWillExpireNextMonth(options) {
    options = options || {}

    const start = moment()

    const startMonth = start.clone().format('MM')
    const startYear = start.clone().format('YYYY')

    const Source = this.app.orm['Source']
    const errors = []
    // let errorsTotal = 0
    let sourcesTotal = 0

    this.app.log.debug('account.sourcesWillExpireNextMonth', startMonth, startYear)

    return Source.batch({
      where: {
        $or: [{
          payment_details: {
            type: 'credit_card',
            credit_card_exp_month: startMonth,
            credit_card_exp_year: startYear
          }
        }, {
          payment_details: {
            type: 'debit_card',
            credit_card_exp_month: startMonth,
            credit_card_exp_year: startYear
          }
        }]
      },
      regressive: false,
      transaction: options.transaction || null
    }, (sources) => {

      const Sequelize = Source.sequelize
      return Sequelize.Promise.mapSeries(sources, source => {
        return this.sourceWillExpire(source, {transaction: options.transaction || null})
      })
        .then(results => {
          // Calculate Totals
          sourcesTotal = sourcesTotal + results.length
          return
        })
        .catch(err => {
          // errorsTotal++
          this.app.log.error(err)
          errors.push(err)
          return
        })
    })
      .then(sources => {
        const results = {
          sources: sourcesTotal,
          errors: errors
        }
        this.app.log.info(results)
        this.app.services.ProxyEngineService.publish('account.sourcesWillExpireNextMonth.complete', results)
        return results
      })
      .catch(err => {
        this.app.log.error(err)
        return
      })
  }
}

