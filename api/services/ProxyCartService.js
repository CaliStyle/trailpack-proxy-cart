/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const csvParser = require('babyparse')
const _ = require('lodash')
// const Errors = require('proxy-engine-errors')
const joi = require('joi')
const fs = require('fs')
const shortid = require('shortid')
const sharp = require('sharp')

const PRODUCT_UPLOAD = require('../utils/enums').PRODUCT_UPLOAD
const PRODUCT_META_UPLOAD = require('../utils/enums').PRODUCT_META_UPLOAD
const CUSTOMER_UPLOAD = require('../utils/enums').CUSTOMER_UPLOAD
const lib = require('../../lib')

/**
 * @module ProxyCartService
 * @description ProxyCart Service
 */
module.exports = class ProxyCartService extends Service {
  /**
   *
   * @param file
   * @returns {Promise}
   */
  productCsv(file) {
    // TODO validate csv
    console.time('csv')
    const uploadID = shortid.generate()
    const ProxyEngineService = this.app.services.ProxyEngineService

    return new Promise((resolve, reject)=>{
      const options = {
        header: true,
        dynamicTyping: true,
        step: (results, parser) => {
          // console.log(parser)
          // console.log('Row data:', results.data)
          // TODO handle errors
          // console.log('Row errors:', results.errors)
          parser.pause()
          this.csvProductRow(results.data[0], uploadID)
            .then(row => {
              parser.resume()
            })
            .catch(err => {
              console.log(err)
              parser.resume()
            })
        },
        complete: (results, file) => {
          console.timeEnd('csv')
          // console.log('Parsing complete:', results, file)
          results.upload_id = uploadID
          ProxyEngineService.count('ProductUpload', { where: { upload_id: uploadID }})
            .then(count => {
              results.products = count
              resolve(results)
            })
            // TODO handle this more gracefully
            .catch(err => {
              reject(err)
            })
        },
        error: (err, file) => {
          reject(err)
        }
      }
      const fileString = fs.readFileSync(file, 'utf8')
      // Parse the CSV/TSV
      csvParser.parse(fileString, options)
    })
  }

  /**
   *
   * @param row
   * @param uploadID
   */
  csvProductRow(row, uploadID) {
    // console.log(row)
    const ProductUpload = this.app.services.ProxyEngineService.getModel('ProductUpload')
    const values = _.values(PRODUCT_UPLOAD)
    const keys = _.keys(PRODUCT_UPLOAD)
    const upload = {
      upload_id: uploadID,
      options: {}
    }

    _.each(row, (data, key) => {
      if (data !== '') {
        const i = values.indexOf(key.replace(/^\s+|\s+$/g, ''))
        const k = keys[i]
        if (i > -1 && k) {
          if (k == 'tags') {
            upload[k] = data.split(',').map(tag => { return tag.trim()})
          }
          else if (k == 'images') {
            upload[k] = data.split(',').map(image => { return image.trim()})
          }
          else if (k == 'images_alt') {
            upload[k] = data.split('|').map(alt => { return alt.trim()})
          }
          else if (k == 'variant_images') {
            upload[k] = data.split(',').map(image => { return image.trim()})
          }
          else if (k == 'variant_images_alt') {
            upload[k] = data.split('|').map(alt => { return alt.trim()})
          }
          else if (k == 'collections') {
            upload[k] = data.split(',').map(collection => { return collection.trim()})
          }
          else {
            upload[k] = data
          }
        }
        else {
          const optionsReg = new RegExp('^((Option \/).([0-9]).(Name|Value))', 'g')
          const match = optionsReg.exec(key)
          // console.log(match)
          if (typeof match[3] !== 'undefined' && match[4] !== 'undefined') {
            const part = match[4].toLowerCase()
            const index = Number(match[3]) - 1
            // console.log(index, part)
            if (typeof upload.options[index] === 'undefined') {
              upload.options[index] = {name: '', value: ''}
            }
            upload.options[index][part] = data.trim()
          }
        }
      }
    })
    // Handle Options
    upload.options = _.map(upload.options, option => {
      const rectObj = {}
      rectObj[option.name] = option.value
      return rectObj
    })
    upload.images = _.map(upload.images, (image, index) => {
      return {
        src: image,
        alt: upload.images_alt[index]
      }
    })
    delete upload.images_alt
    upload.varinat_images = _.map(upload.variant_images, (image, index) => {
      return {
        src: image,
        alt: upload.varinat_images_alt[index]
      }
    })
    delete upload.variant_images_alt

    upload.collections = _.map(upload.collections, (collection, index) => {
      return {
        title: collection
      }
    })

    const newProduct = ProductUpload.build(upload)
    return newProduct.save()
  }

  /**
   *
   * @param uploadId
   * @returns {Promise}
   */
  processProductUpload(uploadId) {
    return new Promise((resolve, reject) => {
      const ProductUpload = this.app.services.ProxyEngineService.getModel('ProductUpload')
      let productsTotal = 0
      let variantsTotal = 0
      ProductUpload.findAll({
        where: {
          upload_id: uploadId
        },
        attributes: ['handle'],
        group: ['handle']
      })
        .then(products => {
          return Promise.all(products.map(product => {
            return this.processProductGroup(product.handle)
          }))
        })
        .then(results => {
          // Calculate the totals created
          _.each(results, result => {
            // console.log(result)
            productsTotal = productsTotal + result.products
            variantsTotal = variantsTotal + result.variants
          })
          return ProductUpload.destroy({where: {upload_id: uploadId }})
        })
        .then(destroyed => {

          resolve({products: productsTotal, variants: variantsTotal })
        })
        .catch(err => {
          return reject(err)
        })
    })
  }
  // TODO
  processProductGroup(handle) {
    return new Promise((resolve, reject) => {
      this.app.log.debug('ProxyCartService.processProductGroup', handle)
      const ProductUpload = this.app.services.ProxyEngineService.getModel('ProductUpload')
      ProductUpload.findAll({where: {handle: handle}})
        .then(products => {
          // Remove Upload Junk
          products = _.map(products, product => {
            return _.omit(product.get({plain: true}), ['id', 'upload_id', 'created_at','updated_at'])
          })
          // Construct Root Product
          const defaultProduct = products.shift()
          // Add Product Variants
          defaultProduct.variants = _.map(products, product => {
            product.images = product.variant_images
            return _.omit(product, ['variant_images'])
          })
          // console.log(defaultProduct)
          // Add the product with it's variants
          return this.app.services.ProductService.addProduct(defaultProduct)
        })
        .then(product => {
          return resolve({products: 1, variants: product.variants.length})
        })
    })
  }

  /**
   *
   * @param file
   * @returns {Promise}
   */
  customerCsv(file) {
    // TODO validate csv
    console.time('csv')
    const uploadID = shortid.generate()
    const ProxyEngineService = this.app.services.ProxyEngineService

    return new Promise((resolve, reject)=>{
      const options = {
        header: true,
        dynamicTyping: true,
        step: (results, parser) => {
          // console.log(parser)
          // console.log('Row data:', results.data)
          // TODO handle errors
          // console.log('Row errors:', results.errors)
          parser.pause()
          this.csvCustomerRow(results.data[0], uploadID)
            .then(row => {
              parser.resume()
            })
            .catch(err => {
              console.log(err)
              parser.resume()
            })
        },
        complete: (results, file) => {
          console.timeEnd('csv')
          // console.log('Parsing complete:', results, file)
          results.upload_id = uploadID
          ProxyEngineService.count('CustomerUpload', { where: { upload_id: uploadID }})
            .then(count => {
              results.customers = count
              resolve(results)
            })
            // TODO handle this more gracefully
            .catch(err => {
              reject(err)
            })
        },
        error: (err, file) => {
          reject(err)
        }
      }
      const fileString = fs.readFileSync(file, 'utf8')
      // Parse the CSV/TSV
      csvParser.parse(fileString, options)
    })
  }

  /**
   *
   * @param row
   * @param uploadID
   */
  csvCustomerRow(row, uploadID) {
    // console.log(row)
    const CustomerUpload = this.app.services.ProxyEngineService.getModel('CustomerUpload')
    const values = _.values(CUSTOMER_UPLOAD)
    const keys = _.keys(CUSTOMER_UPLOAD)
    const upload = {
      upload_id: uploadID,
      options: {}
    }

    _.each(row, (data, key) => {
      if (data !== '') {
        const i = values.indexOf(key.replace(/^\s+|\s+$/g, ''))
        const k = keys[i]
        if (i > -1 && k) {
          if (k == 'tags') {
            upload[k] = data.split(',').map(tag => { return tag.trim()})
          }
          else if (k == 'collections') {
            upload[k] = data.split(',').map(collection => { return collection.trim()})
          }
          else {
            upload[k] = data
          }
        }
      }
    })

    upload.collections = _.map(upload.collections, (collection, index) => {
      return {
        title: collection
      }
    })

    const newCustomer = CustomerUpload.build(upload)
    return newCustomer.save()
  }

  /**
   *
   * @param uploadId
   * @returns {Promise}
   */
  processCustomerUpload(uploadId) {
    return new Promise((resolve, reject) => {
      const CustomerUpload = this.app.services.ProxyEngineService.getModel('CustomerUpload')
      let customersTotal = 0
      CustomerUpload.findAll({
        where: {
          upload_id: uploadId
        }
      })
        .then(customers => {
          return Promise.all(customers.map(customer => {
            // TODO change addresses to objects
            const create = {
              first_name: customer.first_name,
              last_name: customer.last_name,
              phone: customer.phone,
              shipping_address: {},
              billing_address: {},
              collections: customer.collections,
              tags: customer.tags
            }
            _.each(customer.get({plain: true}), (value, key) => {
              if (key.indexOf('shipping_') > -1) {
                const newKey = key.replace('shipping_', '')
                create.shipping_address[newKey] = value
              }
              if (key.indexOf('billing_') > -1) {
                const newKey = key.replace('billing_', '')
                create.billing_address[newKey] = value
              }
            })
            if (create.shipping_address.length == 0) {
              delete create.shipping_address
            }
            if (create.billing_address.length == 0) {
              delete create.billing_address
            }
            // console.log('UPLOAD ADDRESS', create.shipping_address, create.billing_address)
            return this.app.services.CustomerService.create(create)
          }))
        })
        .then(results => {
          customersTotal = results.length
          return CustomerUpload.destroy({where: {upload_id: uploadId }})
        })
        .then(destroyed => {
          return resolve({customers: customersTotal})
        })
        .catch(err => {
          return reject(err)
        })
    })
  }

  /**
   *
   * @param file
   * @returns {Promise}
   */
  productMetaCsv(file) {
    // TODO validate csv
    console.time('csv')
    const uploadID = shortid.generate()
    const ProxyEngineService = this.app.services.ProxyEngineService

    return new Promise((resolve, reject)=>{
      const options = {
        header: true,
        dynamicTyping: true,
        step: (results, parser) => {
          // console.log(parser)
          // console.log('Row data:', results.data)
          // TODO handle errors
          // console.log('Row errors:', results.errors)
          parser.pause()
          this.csvProductMetaRow(results.data[0], uploadID)
            .then(row => {
              parser.resume()
            })
            .catch(err => {
              console.log(err)
              parser.resume()
            })
        },
        complete: (results, file) => {
          console.timeEnd('csv')
          // console.log('Parsing complete:', results, file)
          results.upload_id = uploadID
          ProxyEngineService.count('ProductMetaUpload', { where: { upload_id: uploadID }})
            .then(count => {
              results.products = count
              resolve(results)
            })
            // TODO handle this more gracefully
            .catch(err => {
              reject(err)
            })
        },
        error: (err, file) => {
          reject(err)
        }
      }
      const fileString = fs.readFileSync(file, 'utf8')
      // Parse the CSV/TSV
      csvParser.parse(fileString, options)
    })
  }

  /**
   *
   * @param row
   * @param uploadID
   */
  csvProductMetaRow(row, uploadID) {
    // console.log(row)
    const ProductMetaUpload = this.app.services.ProxyEngineService.getModel('ProductMetaUpload')
    const values = _.values(PRODUCT_META_UPLOAD)
    const keys = _.keys(PRODUCT_META_UPLOAD)
    const upload = {
      upload_id: uploadID,
      data: {}
    }

    _.each(row, (data, key) => {
      if (data !== '') {
        const i = values.indexOf(key.replace(/^\s+|\s+$/g, ''))
        const k = keys[i]
        if (i > -1 && k) {
          upload[k] = data
        }
        else {
          upload.data[key] = data
        }
      }
    })

    const newMeta = ProductMetaUpload.build(upload)
    return newMeta.save()
  }

  /**
   *
   * @param uploadId
   * @returns {Promise}
   */
  processProductMetaUpload(uploadId) {
    return new Promise((resolve, reject) => {
      const ProductMetaUpload = this.app.services.ProxyEngineService.getModel('ProductMetaUpload')
      const Metadata = this.app.services.ProxyEngineService.getModel('Metadata')
      const Product = this.app.services.ProxyEngineService.getModel('Product')
      let productsTotal = 0
      ProductMetaUpload.findAll({
        where: {
          upload_id: uploadId
        }
      })
        .then(metadatums => {
          return Promise.all(metadatums.map(metadata => {
            // TODO change addresses to objects
            return Product.find(
              {
                where: {
                  handle: metadata.handle
                },
                attributes: ['id'],
                include: [
                  {
                    model: Metadata,
                    as: 'metadata',
                    attributes: ['data', 'id']
                  }
                ]
              })
              .then(product => {
                if (!product) {
                  return
                }
                product.metadata.data = metadata.data
                return product.metadata.save()
              })
          }))
        })
        .then(results => {
          productsTotal = results.length
          return ProductMetaUpload.destroy({
            where: {upload_id: uploadId }
          })
        })
        .then(destroyed => {
          return resolve({products: productsTotal})
        })
        .catch(err => {
          return reject(err)
        })
    })
  }

  // TODO
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
    joi.validate(address, lib.Schemas.address.address, (err, value) => {
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

