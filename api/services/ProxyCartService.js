/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
const joi = require('joi')
const sharp = require('sharp')
const lib = require('../../lib')
const geolib = require('geolib')
const currencyFormatter = require('currency-formatter')
const removeMd = require('remove-markdown')
const stripTags = require('striptags')

/**
 * @module ProxyCartService
 * @description ProxyCart Service
 */
module.exports = class ProxyCartService extends Service {
  constructor(app) {
    super(app)
    // Middleware exports
    this._key = 'proxyCart'
    this.initialize = require('../../lib/middleware/initialize')
    this.authenticate = require('../../lib/middleware/authenticate')
    this.cart = require('../../lib/middleware/cart')
    this.customer = require('../../lib/middleware/customer')
  }


  jsonCritera(str) {
    if (!str) {
      return {}
    }
    if (str instanceof Object) {
      return str
    }
    try {
      str = JSON.parse(str)
    }
    catch (err) {
      str = {}
    }
    return str
  }

  paginate(res, count, limit, offset, sort) {

    const pages = Math.ceil(count / limit) == 0 ? 1 : Math.ceil(count / limit)
    const page = offset == 0 ? 1 : Math.round(offset / limit)
    res.set('X-Pagination-Total', count)
    res.set('X-Pagination-Pages', pages)
    res.set('X-Pagination-Page', page)
    res.set('X-Pagination-Offset', offset)
    res.set('X-Pagination-Limit', limit)
    res.set('X-Pagination-Sort', sort)

    return res
  }
  /**
   *
   * @param url
   * @returns {Promise}
   */
  downloadImage(url) {
    return new Promise((resolve, reject) => {
      const request = require('request').defaults({ encoding: null })
      request.get(url, (err, res, body) => {
        if (err) {
          this.app.log.error(err)
          return reject(err)
        }
        return resolve(body)
      })
    })
  }

  /**
   *
   * @param imageUrl
   * @param options
   * @returns {Promise}
   */
  buildImages(imageUrl, options) {
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

  /**
   *
   * @param image
   * @param orgUrl
   * @returns {*}
   */
  uploadImage(image, orgUrl) {
    return this.app.services.DataStoreGenericService.upload(image)
      .catch(err => {
        return {
          url: orgUrl
        }
      })
  }

  /**
   *
   * @param text
   * @returns {string|null}
   */
  handle(text) {
    if (!text) {
      return null
    }
    return text.toString().trim()
      // .replace(/(\r\n|\n|\r)/g,'')    // Replace new lines
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/&/g, '-and-')         // Replace & with 'and'
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars but hyphens
      .replace(/\-\-+/g, '-')         // Remove double hyphens
      .toLowerCase()                  // Make lowercase
      .substring(0, 255)              // Allow only 255 characters
  }

  /**
   *
   * @param text
   * @returns {string|null}
   */
  splitHandle(text) {
    if (!text) {
      return null
    }
    return text.toString().trim()
      // .replace(/(\r\n|\n|\r)/g, '')   // Replace new lines
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/&/g, '-and-')         // Replace & with 'and'
      .replace(/[^\w:\-]+/g, '')      // Remove all non-word chars but colons and hyphens
      .replace(/\-\-+/g, '-')         // Remove double hyphens
      .toLowerCase()                  // Make Lowercase

  }

  /**
   *
   * @param text
   * @returns {string|null}
   */
  sku(text) {
    if (!text) {
      return null
    }
    text = text.toString().trim()
      .replace(/[^\w:\-]+/g, '')      // Remove all non-word chars but colons and hyphens
    return removeMd(stripTags(text)).toString()
  }

  /**
   *
   * @param text
   * @returns {string|null}
   */
  title(text) {
    if (!text) {
      return null
    }
    text = text.toString().trim()
    return removeMd(stripTags(text)).toString().substring(0, 255)
  }

  /**
   *
   * @param text
   * @returns {string|null}
   */
  name(text) {
    if (!text) {
      return null
    }
    text = text.toString().trim()
    return removeMd(stripTags(text)).toString().toLowerCase().substring(0, 255)
  }

  /**
   *
   * @param text
   * @returns {string|null}
   */
  description(text) {
    if (!text) {
      return null
    }
    text = text.toString().trim()
    return removeMd(stripTags(text)).toString()
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
   * @param str
   * @returns {boolean}
   */
  isJson(str) {
    try {
      JSON.parse(str)
    }
    catch (e) {
      return false
    }
    return true
  }

  /**
   *
   * @param num
   * @param currency
   * @returns {*}
   */
  formatCurrency(num, currency) {
    currency = currency || this.app.config.proxyCart.default_currency
    return currencyFormatter.format(num / 100, { code: currency.toUpperCase() })
  }
  /**
   *
   * @param address
   * @returns {*}
   */
  validateAddress(address) {
    try {
      joi.validate(address, lib.Schemas.address.address)
    }
    catch (err) {
      throw new Errors.ValidationError(err)
    }
    try {
      address = this.normalizeAddress(address)
    }
    catch (err) {
      throw new Error(err)
    }
    return address
  }

  /**
   *
   * @param address
   * @returns {*}
   */
  normalizeAddress(address){
    const ProxyCountryService = this.app.services.ProxyCountryService
    const countryNorm = address.country_code || address.country || address.country_name
    const provinceNorm = address.province_code || address.province

    if (!provinceNorm && !countryNorm) {
      return address
    }

    const normalizedProvince  = ProxyCountryService.province(countryNorm, provinceNorm)

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
    address = _.merge(address, ext)
    // console.log(address)
    return address
  }

  /**
   *
   * @param cart
   * @param shippingAddress
   * @param options
   * @returns {Promise}
   */
  // TODO
  resolveSendFromTo(obj, shippingAddress, options) {
    options = options || {}
    return new Promise((resolve, reject) => {
      const Cart = this.app.orm.Cart
      const Subscription = this.app.orm.Subscription
      const Customer = this.app.orm.Customer
      const Shop = this.app.orm.Shop
      const Address = this.app.orm.Address

      if (!(obj instanceof Cart.Instance) && !(obj instanceof Subscription.Instance)) {
        const err = new Error('Object must be an instance!')
        return reject(err)
      }
      Shop.findById(obj.shop_id, {transaction: options.transaction || null})
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
          // If provided a shipping address
          if (shippingAddress && this.app.services.ProxyCartService.validateAddress(shippingAddress)) {
            const res = {
              to: shippingAddress,
              from: from
            }
            return resolve(res)
          }
          else if (obj.customer_id) {
            Customer.findById(obj.customer_id, {
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
              ],
              transaction: options.transaction || null
            })
              .then(customer => {

                if ( customer.shipping_address instanceof Address.Instance) {
                  customer.shipping_address = customer.shipping_address.get({plain: true})
                }
                if ( customer.default_address instanceof Address.Instance) {
                  customer.default_address = customer.default_address.get({plain: true})
                }
                const to = customer.shipping_address ? customer.shipping_address : customer.default_address
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

  /**
   *
   * @param shops
   * @param address
   * @returns {Array|*}
   */
  nearestToAddress(shops, address) {
    shops = _.map(shops, shop => {
      shop.distance = geolib.getDistance(
        {
          latitude: shop.latitude,
          longitude: shop.longitude
        },
        {
          latitude: address.latitude,
          longitude: address.longitude
        }
      )
      return shop
    })
    shops = _.sortBy(shops, 'distance')

    return shops
  }

  /**
   *
   * @param user
   * @param options
   * @returns {Promise.<T>}
   */
  afterUserCreate(user, options) {
    options = options || {}
    const Customer = this.app.orm['Customer']
    const Cart = this.app.orm['Cart']
    // return Promise.resolve(user)
    return Customer.resolve({
      id: user.current_customer_id,
      email: user.email,
      accepts_marketing: user.accepts_marketing,
      users: [user]
    }, { transaction: options.transaction || null })
      .then(customer => {
        if (!customer) {
          return {
            id: null
          }
        }
        // Set the user's current customer id
        user.current_customer_id = customer.id
        // Update the customer email address if it doesn't already have one
        if (!customer.email && user.email) {
          customer.email = user.email
        }
        return customer.save({transaction: options.transaction || null})
      })
      .then(customer => {
        return Cart.resolve({
          id: user.current_cart_id,
          customer: customer.id
        }, { transaction: options.transaction || null })
      })
      .then(cart => {
        // Set the user's current cart id
        user.current_cart_id = cart.id

        return user.save({
          fields: [
            'current_cart_id',
            'current_customer_id'
          ],
          transaction: options.transaction || null
        })
      })
  }

  /**
   *
   * @param cart
   * @param next
   */
  serializeCart(cart, next) {
    // console.log('SERIALIZE CART')
    if (typeof next != 'function') {
      throw new Error('instance#serializeCart requires a callback function')
    }
    next(null, cart.id)
  }

  /**
   *
   * @param id
   * @param options
   * @param next
   */
  deserializeCart(id, options, next) {
    // console.log('DESERIALIZE CART')
    options = options || {}
    if (typeof next != 'function') {
      throw new Error('instance#deserializeCart requires a callback function')
    }
    this.app.orm['Cart'].findById(id, {transaction: options.transaction || null})
      .then(cart => {
        next(null, cart)
      })
      .catch(err => {
        next(err)
      })
  }

  /**
   *
   * @param customer
   * @param next
   */
  serializeCustomer(customer, next) {
    if (typeof next != 'function') {
      throw new Error('instance#serializeCustomer requires a callback function')
    }
    next(null, customer.id)
  }

  /**
   *
   * @param id
   * @param options
   * @param next
   */
  deserializeCustomer(id, options, next) {
    options = options || {}
    if (typeof next != 'function') {
      throw new Error('instance#deserializeCustomer requires a callback function')
    }
    this.app.orm['Customer'].findById(id, {transaction: options.transaction || null})
      .then(customer => {
        next(null, customer)
      })
      .catch(err => {
        next(err)
      })
  }
}

