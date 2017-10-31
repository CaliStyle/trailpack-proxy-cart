'use strict'
/* global describe, it */
const assert = require('assert')
const moment = require('moment')

describe('AccountService', () => {
  let AccountService
  let Account, Source

  it('should exist', () => {
    assert(global.app.api.services['AccountService'])
    assert(global.app.services['AccountService'])

    AccountService = global.app.services['AccountService']

    Account = global.app.orm['Account']
    Source = global.app.orm['Source']
  })
  it('should resolve a account instance', (done) => {
    Account.resolve(Account.build({}))
      .then(account => {
        assert.ok(account instanceof Account)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should notify of Source future Expiry', (done) => {
    const start = moment()
    const startMonth = start.clone().format('MM')
    const startYear = start.clone().format('YYYY')
    // If a credit card that expires this month is added today, then it will expire next month

    const sourcesToCreate = []
    let i = 0
    while (i < 21) {
      sourcesToCreate.push({
        customer_id: 1,
        token: `source_will_expiry_${i}`,
        account_id: 1,
        account_foreign_key: 'customer',
        account_foreign_id: `account_will_expiry_${i}`,
        foreign_key: 'customer',
        foreign_id: `source_will_expiry_${i}`,
        payment_details: {
          type: 'credit_card',
          credit_card_exp_month: startMonth,
          credit_card_exp_year: startYear
        }
      })
      i++
    }

    Source.bulkCreate(sourcesToCreate)
      .then(sources => {
        return AccountService.sourcesWillExpireNextMonth()
          .then(expires => {
            assert.equal(expires.sources, 21)
            assert.equal(expires.errors.length, 0)
            return AccountService.sourcesWillExpireNextMonth()
          })
      })
      .then(expires => {
        // Should still be 21 since this is not a regressive query
        // In reality we just ran this monthly query twice.
        assert.equal(expires.sources, 21)
        assert.equal(expires.errors.length, 0)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should notify of Source Expiry', (done) => {
    const start = moment().subtract(1, 'months')
    const startMonth = start.clone().format('MM')
    const startYear = start.clone().format('YYYY')

    const sourcesToCreate = []
    let i = 0
    while (i < 21) {
      sourcesToCreate.push({
        customer_id: 1,
        token: `source_expiry_${i}`,
        account_id: 1,
        account_foreign_key: 'customer',
        account_foreign_id: `account_expiry_${i}`,
        foreign_key: 'customer',
        foreign_id: `source_expiry_${i}`,
        payment_details: {
          type: 'credit_card',
          credit_card_exp_month: startMonth,
          credit_card_exp_year: startYear
        }
      })
      i++
    }

    Source.bulkCreate(sourcesToCreate)
      .then(sources => {
        return AccountService.sourcesExpiredThisMonth()
          .then(expires => {
            assert.equal(expires.sources, 21)
            assert.equal(expires.errors.length, 0)
            return AccountService.sourcesExpiredThisMonth()
          })
      })
      .then(expires => {
        // Should still be 21 since this is not a regressive query
        // In reality we just ran this monthly query twice.
        assert.equal(expires.sources, 21)
        assert.equal(expires.errors.length, 0)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
