/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const csvParser = require('babyparse')
const _ = require('lodash')
const shortid = require('shortid')
const fs = require('fs')
const PRODUCT_UPLOAD = require('../utils/enums').PRODUCT_UPLOAD
const PRODUCT_META_UPLOAD = require('../utils/enums').PRODUCT_META_UPLOAD

/**
 * @module ProductCsvService
 * @description Product CSV Service
 */
module.exports = class ProductCsvService extends Service {
  /**
   *
   * @param file
   * @returns {Promise}
   */
  productCsv(file) {
    // TODO validate csv and return rows with errors
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
          return this.csvProductRow(results.data[0], uploadID)
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
              // Publish the event
              ProxyEngineService.publish('product_upload.complete', results)
              return resolve(results)
            })
            // TODO handle this more gracefully
            .catch(err => {
              return reject(err)
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
    const ProductUpload = this.app.orm.ProductUpload
    const values = _.values(PRODUCT_UPLOAD)
    const keys = _.keys(PRODUCT_UPLOAD)
    const upload = {
      upload_id: uploadID,
      options: {}
    }

    if (_.isEmpty(row)) {
      return Promise.resolve({})
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
          else if (k == 'associations') {
            upload[k] = data.split(',').map(collection => { return collection.trim()})
          }
          else if (k == 'vendors') {
            upload[k] = data.split(',').map(vendor => { return vendor.trim()})
          }
          else if (k == 'shops') {
            upload[k] = data.split(',').map(shop => { return shop.trim()})
          }
          else if (k == 'shops_quantity') {
            upload[k] = data.split(',').map(shopQty => { return parseInt(shopQty.trim())})
          }
          else if (k == 'weight_unit') {
            upload[k] = data.toLowerCase()
          }
          else if (k == 'inventory_policy') {
            upload[k] = data.toLowerCase()
          }
          else {
            upload[k] = data
          }
        }
        else {
          const optionsReg = new RegExp('^((Option \/).([0-9]).(Name|Value))', 'g')
          const match = optionsReg.exec(key)
          // console.log(match)
          if (match && typeof match[3] !== 'undefined' && match[4] !== 'undefined') {
            const part = match[4].toLowerCase()
            const index = Number(match[3]) - 1
            // console.log(index, part)
            if (typeof upload.options[index] === 'undefined') {
              upload.options[index] = {
                name: '',
                value: ''
              }
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

    // Map images
    upload.images = _.map(upload.images, (image, index) => {
      return {
        src: image,
        alt: upload.images_alt ? upload.images_alt[index] : ''
      }
    })
    delete upload.images_alt

    // Map variant images
    upload.variant_images = _.map(upload.variant_images, (image, index) => {
      return {
        src: image,
        alt: upload.variant_images_alt ? upload.variant_images_alt[index] : ''
      }
    })
    delete upload.variant_images_alt

    // Map vendors
    upload.vendors = _.map(upload.vendors, (vendor, index) => {
      return {
        name: vendor
      }
    })

    // Map associations
    upload.associations = _.map(upload.associations, (association) => {
      const handle = association.split(/:(.+)/)[0]
      const sku = association.split(/:(.+)/)[1]
      const res = {}
      if (handle && handle != '') {
        res.handle = handle
        if (sku && sku != '') {
          res.sku = sku
        }
        return res
      }
      return
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
      const ProductUpload = this.app.orm.ProductUpload
      let productsTotal = 0
      let variantsTotal = 0
      ProductUpload.batch({
        where: {
          upload_id: uploadId
        },
        limit: 10,
        attributes: ['handle'],
        group: ['handle']
      }, (products) => {

        const Sequelize = this.app.orm.Product.sequelize
          // const addedProducts = []
          // Setup Transaction
        // return Sequelize.transaction(t => {
        return Sequelize.Promise.mapSeries(products, product => {
          return this.processProductGroup(product.handle, uploadId, {
            // transaction: t
          })
            .then((results) => {
              // Calculate the totals created
              productsTotal = productsTotal + results.products
              variantsTotal = variantsTotal + results.variants
              return results
            })
        })
        // })
      })
        .then(results => {
          return ProductUpload.destroy({where: {upload_id: uploadId }})
        })
        .then(destroyed => {
          const results = {
            upload_id: uploadId,
            products: productsTotal,
            variants: variantsTotal
          }
          this.app.services.ProxyEngineService.publish('product_process.complete', results)
          return resolve(results)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }

  /**
   *
   * @param handle
   * @returns {Promise}
   */
  processProductGroup(handle, uploadId, options) {
    if (!options) {
      options = {}
    }
    return new Promise((resolve, reject) => {
      this.app.log.debug('ProxyCartService.processProductGroup', handle)
      let errorsCount = 0
      const ProductUpload = this.app.orm.ProductUpload
      ProductUpload.findAll({
        where: {
          handle: handle,
          upload_id: uploadId
        },
        transaction: options.transaction || null
      })
        .then(products => {
          // Remove Upload Junk
          products = products.map(product => {
            return _.omit(product.get({plain: true}), ['id', 'upload_id', 'created_at', 'updated_at'])
          })
          // Construct Root Product
          const defaultProduct = products.shift()
          // Add Product Variants
          defaultProduct.variants = _.map(products, product => {
            // Sku is required for a variant
            if (!product.sku) {
              errorsCount++
            }
            else {
              product.images = product.variant_images
              return _.omit(product, ['variant_images'])
            }
          })
          // console.log(defaultProduct)
          // Add the product with it's variants
          return this.app.services.ProductService.addProduct(defaultProduct, options)
        })
        .then(product => {
          if (!product) {
            errorsCount++
            return resolve({products: 0, variants: 0, errors: errorsCount})
          }
          return resolve({products: 1, variants: product.variants.length, errors: errorsCount})
        })
    })
  }

  /**
   *
   * @param file
   * @returns {Promise}
   */
  productMetaCsv(file) {
    // TODO validate csv and return rows with errors
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
          return this.csvProductMetaRow(results.data[0], uploadID)
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
              // Publish the event
              ProxyEngineService.publish('product_meta_upload.complete', results)
              return resolve(results)
            })
            // TODO handle this more gracefully
            .catch(err => {
              return reject(err)
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
    const ProductMetaUpload = this.app.orm.ProductMetaUpload
    const values = _.values(PRODUCT_META_UPLOAD)
    const keys = _.keys(PRODUCT_META_UPLOAD)
    const upload = {
      upload_id: uploadID,
      data: {}
    }

    if (_.isEmpty(row)) {
      return Promise.resolve({})
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
      const ProductMetaUpload = this.app.orm.ProductMetaUpload
      const Metadata = this.app.orm.Metadata
      const Product = this.app.orm.Product
      const ProductVariant = this.app.orm.ProductVariant
      let productsTotal = 0
      ProductMetaUpload.batch({
        where: {
          upload_id: uploadId
        }
      }, metadatums => {
        return Promise.all(metadatums.map(metadata => {
          const Type = metadata.handle.indexOf(':') === -1 ? Product : ProductVariant
          let where = {}
          const includes = [
            {
              model: Metadata,
              as: 'metadata',
              attributes: ['data', 'id']
            }
          ]

          if (Type === Product) {
            where = {
              'handle': metadata.handle
            }
          }
          else {
            where = {
              'sku': metadata.handle.split(/:(.+)/)[1],
              '$Product.handle$': metadata.handle.split(/:(.+)/)[0]
            }
            includes.push({
              model: Product,
              attributes: ['handle']
            })
          }

          return Type.find(
            {
              where: where,
              attributes: ['id'],
              include: includes
            })
            .then(product => {
              if (!product) {
                return
              }
              product.metadata.data = metadata.data
              return product.metadata.save()
            })
        }))
          .then(results => {
            // Calculate Totals
            productsTotal = productsTotal + results.length
            return results
          })
      })
        .then(results => {
          return ProductMetaUpload.destroy({
            where: {upload_id: uploadId }
          })
        })
        .then(destroyed => {
          const results = {
            upload_id: uploadId,
            products: productsTotal
          }
          this.app.services.ProxyEngineService.publish('product_metadata_process.complete', results)
          return resolve(results)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }
}

