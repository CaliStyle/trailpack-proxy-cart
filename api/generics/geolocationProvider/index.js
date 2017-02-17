'use strict'
// const _ = require('lodash')
module.exports = class DefaultGeolocationProvider {
  constructor(options) {
    this.options = options
  }
  addressToString(address) {
    let street = ''
    let city = ''
    let postalCode = ''
    let province = ''
    let country = ''

    if (address.address_1) {
      street = address.address_1
    }

    if (address.address_2) {
      street = `${street} ${address.address_2}`
    }

    if (address.address_3) {
      street = `${street} ${address.address_3}`
    }

    if (address.company) {
      street = `${street} ${address.company}`
    }

    if (street !== '') {
      street = `${street}, `
    }

    if (address.city) {
      city = address.city
    }

    if (city !== '') {
      city = `${city} `
    }

    if (address.postal_code) {
      postalCode = address.postal_code
    }

    if (postalCode !== '') {
      postalCode = `${postalCode} `
    }

    if (address.province_code || address.province) {
      if (address.province_code) {
        province = `${address.province_code}`
      }
      else {
        province = `${address.province}`
      }
    }

    if (address.country_code || address.country) {
      if (address.country_code) {
        country = `${address.country_code}`
      }
      else {
        country = `${address.country}`
      }
    }

    if (province !== '' && country !== '') {
      province = `${province}, `
      country = `${country}`
    }
    return `${street}${city}${province}${postalCode}${country}`
  }

  /**
   *
   * @param address
   * @returns {Promise.<{latitude: number, longitude: number, formatted_address: string}>}
   */
  locate(address) {
    return Promise.resolve({
      formatted_address: this.addressToString(address),
      latitude: 0.000000,
      longitude: 0.000000
    })
  }
}
