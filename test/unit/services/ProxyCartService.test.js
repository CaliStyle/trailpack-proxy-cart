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
      'company': 'Normalize Address',
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
  it('should validate address', done => {
    const address = {
      'first_name': 'Scott',
      'last_name': 'Wyatt',
      'address_1': '1600 Pennsylvania Ave NW',
      'address_2': '',
      'company': 'Validate Address',
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
    // console.log('THIS ADDRESS',validatedAddress)
    assert.equal(validatedAddress.first_name, address.first_name)
    assert.equal(validatedAddress.last_name, address.last_name)
    assert.equal(validatedAddress.address_1, '1600 Pennsylvania Ave NW')
    assert.equal(validatedAddress.address_2, '')
    assert.equal(validatedAddress.company, 'Validate Address')
    assert.equal(validatedAddress.city, 'Washington')
    assert.equal(validatedAddress.phone, '')
    assert.equal(validatedAddress.province, 'District of Columbia')
    assert.equal(validatedAddress.province_code, 'DC')
    assert.equal(validatedAddress.country, 'United States')
    assert.equal(validatedAddress.country_code, 'US')

    done()
  })
  let builtImages
  it('should build and upload images', done => {
    ProxyCartService.buildImages('https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150')
      .then(images => {
        builtImages = images
        assert.ok(builtImages.full)
        assert.ok(builtImages.thumbnail)
        assert.ok(builtImages.small)
        assert.ok(builtImages.medium)
        assert.ok(builtImages.large)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
  // it('should upload images', done => {
  //   console.log(builtImages)
  //   done()
  // })
  // it('should download image', done => {
  //   done()
  // })
})
