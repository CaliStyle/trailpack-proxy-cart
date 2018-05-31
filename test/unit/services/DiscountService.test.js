'use strict'
/* global describe, it */
const assert = require('assert')
const moment = require('moment')

describe('DiscountService', () => {
  let Discount, DiscountService
  it('should exist', () => {
    assert(global.app.api.services['DiscountService'])
    assert(global.app.services['DiscountService'])
    Discount = global.app.orm['Discount']
    DiscountService = global.app.services['DiscountService']
  })
  it('should start discounts', (done) => {
    const start = moment().startOf('hour')
    const end = start.clone().add(1, 'months')

    // If a credit card that expires this month is added today, then it will expire next month

    const discountsToCreate = []
    let i = 0
    while (i < 21) {
      discountsToCreate.push({
        handle: `discount-start-${i}`,
        name: `discount start ${i}`,
        code: `discount_start_code_${i}`,
        starts_at: start,
        ends_at: end,
        status: 'disabled'
      })
      i++
    }

    Discount.bulkCreate(discountsToCreate)
      .then(discounts => {
        return DiscountService.startThisHour()
          .then(expires => {
            assert.equal(expires.discounts, 21)
            assert.equal(expires.errors.length, 0)
            return DiscountService.startThisHour()
          })
      })
      .then(expires => {
        assert.equal(expires.discounts, 0)
        assert.equal(expires.errors.length, 0)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should expire discounts', (done) => {
    const start = moment().subtract(1, 'months').startOf('hour')
    const end = start.clone().add(1, 'months')
    const discountsToCreate = []
    let i = 0
    while (i < 21) {
      discountsToCreate.push({
        handle: `discount-stop-${i}`,
        name: `discount stop ${i}`,
        code: `discount_stop_code_${i}`,
        starts_at: start,
        ends_at: end,
        // Make half of the discounts still enabled, and the other half depleted
        status: i % 2 === 0 ? 'enabled' : 'depleted'
      })
      i++
    }

    Discount.bulkCreate(discountsToCreate)
      .then(discounts => {
        // console.log('WORKING ON DISCOUNTS', discounts)
        return DiscountService.expireThisHour()
          .then(expires => {
            assert.equal(expires.discounts, 21)
            assert.equal(expires.errors.length, 0)
            return DiscountService.expireThisHour()
          })
      })
      .then(expires => {
        assert.equal(expires.discounts, 0)
        assert.equal(expires.errors.length, 0)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
