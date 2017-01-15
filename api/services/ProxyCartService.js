/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
// const Errors = require('proxy-engine-errors')
const joi = require('joi')
const sharp = require('sharp')
const lib = require('../../lib')

/**
 * @module ProxyCartService
 * @description ProxyCart Service
 */
module.exports = class ProxyCartService extends Service {

  /**
   *
   * @param url
   * @returns {Promise}
   */
  downloadImage(url) {
    return new Promise((resolve, reject) => {
      const request = require('request').defaults({ encoding: null })
      request.get(url, function (err, res, body) {
        if (err) {
          return reject(err)
        }
        return resolve(body)
      })
    })
  }

  /**
   *
   * @param imageUrl
   * @returns {Promise}
   */
  buildImages(imageUrl) {
    return new Promise((resolve, reject) =>{
      const images = {
        full: imageUrl,
        thumbnail: imageUrl,
        small: imageUrl,
        medium: imageUrl,
        large: imageUrl
      }
      let buffer

      this.downloadImage(imageUrl)
        .then(resBuffer => {
          buffer = resBuffer
          return sharp(buffer)
            .resize(200)
            .toBuffer()
        })
        .then(thumbnailBuffer => {
          return this.uploadImage(thumbnailBuffer, images.thumbnail)
        })
        .then(thumbnail => {
          images.thumbnail = thumbnail.url
          return sharp(buffer)
            .resize(300)
            .toBuffer()
        })
        .then(smallBuffer => {
          return this.uploadImage(smallBuffer, images.small)
        })
        .then(small => {
          images.small = small.url
          return sharp(buffer)
            .resize(400)
            .toBuffer()
        })
        .then(mediumBuffer => {
          return this.uploadImage(mediumBuffer, images.medium)
        })
        .then(medium => {
          images.medium = medium.url
          return sharp(buffer)
            .resize(500)
            .toBuffer()
        })
        .then(largeBuffer => {
          return this.uploadImage(largeBuffer, images.large)
        })
        .then((large) => {
          images.large = large.url
          return resolve(images)
        })
        .catch((err) => {
          this.app.log.error(err)
          return resolve(images)
        })
    })
  }
  // TODO
  uploadImage(image, orgUrl) {
    return Promise.resolve({ url: orgUrl })
  }

  /**
   *
   * @param text
   * @returns {string}
   */
  slug(text) {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/&/g, '-and-')         // Replace & with 'and'
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')
  }

  /**
   *
   * @param ounces
   * @returns {number}
   */
  ouncesToGrams(ounces) {
    return ounces * 28.3495231
  }

  /**
   *
   * @param pounds
   * @returns {number}
   */
  poundsToGrams(pounds) {
    return pounds * 16 * 28.3495231
  }

  /**
   *
   * @param kilogram
   * @returns {number}
   */
  kilogramsToGrams(kilogram) {
    return kilogram / 1000
  }

  /**
   *
   * @param weight
   * @param weightUnit
   * @returns {*}
   */
  resolveConversion(weight, weightUnit){
    switch (weightUnit) {
    case 'kg':
      return this.kilogramsToGrams(weight)
    case 'oz':
      return this.ouncesToGrams(weight)
    case 'lb':
      return this.poundsToGrams(weight)
    default:
      return weight
    }
  }

  /**
   *
   * @param address
   * @returns {*}
   */
  validateAddress(address) {
    joi.validate(address, lib.Schemas.customer.address, (err, value) => {
      if (err) {
        throw new Error(err)
      }
      try {
        address = this.normalizeAddress(address)
      }
      catch (err) {
        throw new Error(err)
      }
      return address
    })
  }

  /**
   *
   * @param address
   * @returns {*}
   */
  normalizeAddress(address){
    const CountryService = this.app.services.CountryService
    const provinceNorm = address.province_code || address.province
    const countryNorm = address.country_code || address.country || address.country_name

    if (!provinceNorm && !countryNorm) {
      return address
    }

    const normalizedProvince  = CountryService.province(countryNorm, provinceNorm)

    if (!normalizedProvince) {
      throw new Error(`Unable to normalize ${provinceNorm}, ${countryNorm}`)
    }

    const ext = {
      country: normalizedProvince.country.name,
      country_name: normalizedProvince.country.name,
      country_code: normalizedProvince.country.ISO.alpha2,
      province: normalizedProvince.name,
      province_code: normalizedProvince.code
    }
    return _.merge(address, ext)
  }

  /**
   *
   * @param cart
   * @param shippingAddress
   * @returns {Promise}
   */
  resolveSendFromTo(cart, shippingAddress) {
    return new Promise((resolve, reject) => {
      const Cart = this.app.services.ProxyEngineService.getModel('Cart')
      const Customer = this.app.services.ProxyEngineService.getModel('Customer')
      const Shop = this.app.services.ProxyEngineService.getModel('Shop')
      const Address = this.app.services.ProxyEngineService.getModel('Address')

      if (!(cart instanceof Cart.Instance)) {
        const err = new Error('Cart must be an instance!')
        return reject(err)
      }
      Shop.findById(cart.shop_id)
        .then(shop => {
          if (!shop) {
            return resolve(null)
          }
          const from = {
            name: shop.name,
            address_1: shop.address_1,
            address_2: shop.address_2,
            address_3: shop.address_3,
            company: shop.company,
            city: shop.city,
            province: shop.province,
            province_code: shop.province_code,
            country: shop.country,
            country_name: shop.country_name,
            country_code: shop.country_code
          }
          // If this function was provided a
          if (this.app.services.ProxyCartService.validateAddress(shippingAddress)) {
            const res = {
              to: shippingAddress,
              from: from
            }
            return resolve(res)
          }
          else if (cart.customer_id) {
            Customer.findById(cart.customer_id, {
              attributes: ['id'],
              include: [
                {
                  model: Address,
                  as: 'default_address'
                },
                {
                  model: Address,
                  as: 'shipping_address'
                }
              ]
            })
              .then(customer => {
                const to = customer.shipping_address ? customer.shipping_address.get({plain: true}) : customer.default_address.get({plain: true})
                const res = {
                  to: to,
                  from: from
                }
                return resolve(res)
              })
              .catch(err => {
                return reject(err)
              })
          }
          else {
            return resolve(null)
          }
        })
        .catch(err => {
          return reject(err)
        })
    })
  }
}

