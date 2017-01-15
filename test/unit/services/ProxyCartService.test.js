'use strict'
/* global describe, it */
const assert = require('assert')

describe('ProxyCartService', () => {
  let ProxyCartService
  it('should exist', () => {
    assert(global.app.api.services['ProxyCartService'])
    ProxyCartService = global.app.services.ProxyCartService
  })
  it('should resolve weight conversions', done => {
    const grams = ProxyCartService.resolveConversion(1,'g')
    const kilograms = ProxyCartService.resolveConversion(1,'kg')
    const ounces = ProxyCartService.resolveConversion(1,'oz')
    const pounds = ProxyCartService.resolveConversion(1,'lb')

    assert.equal(grams, 1)
    assert.equal(kilograms, 0.001)
    assert.equal(ounces, 28.3495231)
    assert.equal(pounds, 453.5923696)

    done()
  })
  it('should normalize address', done => {
    const address = {
      'address_1': '1600 Pennsylvania Ave NW',
      'address_2': '',
      'company': 'Shipping Department',
      'city': 'Washington',
      'phone': '',
      'province_code': 'DC',
      'country': 'United States',
      'country_code': 'US',
      'country_name': 'United States of America',
      'postal_code': '20500'
    }
    const normalizedAddress = ProxyCartService.normalizeAddress(address)
    // console.log('THIS ADDRESS',normalizedAddress)
    assert.equal(normalizedAddress.country, 'United States')
    assert.equal(normalizedAddress.country_code, 'US')
    assert.equal(normalizedAddress.province_code, 'DC')
    assert.equal(normalizedAddress.province, 'District of Columbia')

    done()
  })
  it.skip('should validate address', done => {
    const address = {
      'first_name': 'Scott',
      'last_name': 'Wyatt',
      'address_1': '1600 Pennsylvania Ave NW',
      'address_2': '',
      'company': 'Shipping Department',
      'city': 'Washington',
      'phone': '',
      'province': 'District of Columbia',
      'province_code': 'DC',
      'country': 'United States',
      'country_code': 'US',
      'country_name': 'United States of America',
      'postal_code': '20500'
    }

    const validatedAddress = ProxyCartService.validateAddress(address)
    console.log('THIS ADDRESS',validatedAddress)
    assert.equal(validatedAddress.first_name, address.first_name)

    done()
  })
  it.skip('should build images', done => {
    done()
  })
  it.skip('should upload images', done => {
    done()
  })
  it.skip('should download image', done => {
    done()
  })
})
