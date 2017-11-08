'use strict'
/* global describe, it */
const assert = require('assert')
const moment = require('moment')

describe('Subscription Model', () => {
  let Subscription, Discount
  it('should exist', () => {
    assert(global.app.api.models['Subscription'])
    assert(global.app.orm['Subscription'])
    Subscription = global.app.orm['Subscription']
    Discount = global.app.orm['Discount']
    assert(Subscription)
  })
  it('should resolve a subscription instance', (done) => {
    Subscription.resolve(Subscription.build({}))
      .then(subscription => {
        assert.ok(subscription instanceof Subscription)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should renew a subscription instance', (done) => {
    const start = moment().startOf('hour').format('YYYY-MM-DD HH:mm:ss')
    const end = moment().startOf('hour').add(1,'months').format('YYYY-MM-DD HH:mm:ss')
    Subscription.build({
      customer_id: 1,
      renewed_at: start,
      renews_on: end,
      interval: 1,
      interval_unit: 'm'
    }).renew().save()
      .then(subscription => {
        // console.log('MODEL renew', subscription)
        assert.ok(subscription instanceof Subscription)
        assert.ok(subscription.renews_on)
        assert.equal(subscription.active, true)
        assert.equal(subscription.cancelled_at, null)
        assert.equal(subscription.cancel_reason, null)
        assert.equal(subscription.cancelled, false)
        assert.ok(subscription.renews_on)
        assert.equal(subscription.renew_retry_at, null)
        assert.equal(subscription.total_renewal_attempts, 0)
        done()
      })
      .catch(err => {
        done(err)
      })
  })

  it('should retry a subscription instance', (done) => {
    const start = moment().startOf('hour').format('YYYY-MM-DD HH:mm:ss')
    const end = moment().startOf('hour').add(1,'months').format('YYYY-MM-DD HH:mm:ss')
    Subscription.build({
      customer_id: 1,
      renewed_at: start,
      renews_on: end,
      interval: 1,
      interval_unit: 'm'
    }).retry().save()
      .then(subscription => {
        // console.log('MODEL renew', subscription)
        assert.ok(subscription instanceof Subscription)
        assert.equal(subscription.active, true)
        assert.equal(subscription.cancelled_at, null)
        assert.equal(subscription.cancel_reason, null)
        assert.equal(subscription.cancelled, false)
        assert.ok(subscription.renews_on)
        assert.ok(subscription.renew_retry_at)
        assert.equal(subscription.total_renewal_attempts, 1)
        done()
      })
      .catch(err => {
        done(err)
      })
  })

  it('should add normal discounted lines to subscription items', (done) => {
    let subscription = Subscription.build({
      line_items: [{
        product_id: 1,
        type: 'product',
        price: 1000
      }, {
        product_id: 2,
        type: 'product',
        price: 1000
      }]
    })
    const discount1 = Discount.build({
      id: 1,
      handle: 'test-1',
      name: 'test 1',
      description: 'test 1',
      code: 'test_123-1',
      discount_type: 'rate',
      discount_rate: 100,
      discount_scope: 'global',
      status: 'enabled'
    })
    const discount2 = Discount.build({
      id: 2,
      handle: 'test-2',
      name: 'test 2',
      description: 'test 2',
      code: 'test_123-2',
      discount_type: 'rate',
      discount_rate: 100,
      discount_scope: 'global',
      status: 'enabled'
    })
    subscription = subscription.setItemsDiscountedLines([discount1, discount2])
    assert.equal(subscription.total_discounts, 400)
    assert.equal(subscription.discounted_lines.length, 2)
    assert.equal(subscription.discounted_lines[0].price, 200)
    assert.equal(subscription.discounted_lines[1].price, 200)
    assert.equal(subscription.line_items.length, 2)
    assert.equal(subscription.line_items[0].price, 1000)
    assert.equal(subscription.line_items[0].calculated_price, 800)
    assert.equal(subscription.line_items[1].price, 1000)
    assert.equal(subscription.line_items[1].calculated_price, 800)
    done()
  })

  it('should add discounted lines only once to subscription items', (done) => {
    let subscription = Subscription.build({
      line_items: [{
        product_id: 1,
        type: 'product',
        price: 1000
      }, {
        product_id: 2,
        type: 'product',
        price: 1000
      }]
    })
    const discount1 = Discount.build({
      id: 1,
      handle: 'test-1',
      name: 'test 1',
      description: 'test 1',
      code: 'test_123-1',
      discount_type: 'rate',
      discount_rate: 100,
      discount_scope: 'global',
      applies_once: true,
      status: 'enabled'
    })
    subscription = subscription.setItemsDiscountedLines([discount1])
    // console.log('BUILT',subscription.toJSON().discounted_lines)
    // console.log('BUILT',subscription.toJSON().line_items)
    assert.equal(subscription.total_discounts, 100)
    assert.equal(subscription.discounted_lines.length, 1)
    assert.equal(subscription.line_items.length, 2)
    assert.equal(subscription.line_items[0].price, 1000)
    assert.equal(subscription.line_items[0].calculated_price, 1000)
    assert.equal(subscription.line_items[1].price, 1000)
    assert.equal(subscription.line_items[1].calculated_price, 900)
    done()
  })

  it('should activate subscription and change renewal date if it in the past', (done) => {
    const renewedAt = moment().startOf('hour').subtract(2, 'months')
    const renewedAtNew = renewedAt.clone().add(2, 'months')
    const renewedOn = moment().startOf('hour').subtract(1, 'months')
    const renewedOnNew = renewedOn.clone().add(2, 'months')
    const subscription = Subscription.build({
      customer_id: 1,
      renewed_at: renewedAt.format('YYYY-MM-DD HH:mm:ss'),
      renews_on: renewedOn.format('YYYY-MM-DD HH:mm:ss'),
      interval: 1,
      interval_unit: 'm'
    }).activate()

    // console.log('REACTIVATE SCHEDULE', subscription)

    assert.equal(moment(subscription.renewed_at).format('YYYY-MM-DD HH:mm:ss'), renewedAtNew.format('YYYY-MM-DD HH:mm:ss'))
    assert.equal(moment(subscription.renews_on).format('YYYY-MM-DD HH:mm:ss'), renewedOnNew.format('YYYY-MM-DD HH:mm:ss'))


    done()
  })
})
