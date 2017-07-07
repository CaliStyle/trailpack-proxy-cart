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
    const errors = []

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
              this.app.log.error('ROW ERROR',err)
              errors.push(err.message)
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
              results.errors = errors
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
          return reject(err)
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

    _.each(row, (data, key) => {
      if (data === '') {
        row[key] = null
      }
    })

    row = _.omitBy(row, _.isNil)

    if (_.isEmpty(row)) {
      return Promise.resolve({})
    }

    _.each(row, (data, key) => {
      if (data !== '') {
        const i = values.indexOf(key.replace(/^\s+|\s+$/g, ''))
        const k = keys[i]
        if (i > -1 && k) {
          if (k == 'handle') {
            upload[k] = this.app.services.ProxyCartService.safeHandle(data)
          }
          else if (k == 'tags') {
            upload[k] = _.uniq(data.toLowerCase().split(',').map(tag => {
              return tag.trim()
            }))
          }
          else if (k == 'images') {
            upload[k] = data.split(',').map(image => {
              return image.trim()
            })
          }
          else if (k == 'images_alt') {
            upload[k] = data.split('|').map(alt => {
              return alt.trim()
            })
          }
          else if (k == 'variant_images') {
            upload[k] = data.split(',').map(image => {
              return image.trim()
            })
          }
          else if (k == 'variant_images_alt') {
            upload[k] = data.split('|').map(alt => {
              return alt.trim()
            })
          }
          else if (k == 'collections') {
            upload[k] = _.uniq(data.split(',').map(collection => {
              return collection.trim()
            }))
          }
          else if (k == 'associations') {
            upload[k] = data.split(',').map(collection => {
              return collection.trim()
            })
          }
          else if (k == 'vendors') {
            upload[k] = data.split(',').map(vendor => {
              return vendor.trim()
            })
          }
          else if (k == 'shops') {
            upload[k] = data.split(',').map(shop => {
              return shop.trim()
            })
          }
          else if (k == 'shops_quantity') {
            upload[k] = data.split(',').map(shopQty => {
              return parseInt(shopQty.trim())
            })
          }
          else if (k == 'weight_unit') {
            upload[k] = data.toLowerCase().trim()
          }
          else if (k == 'inventory_policy') {
            upload[k] = data.toLowerCase().trim()
          }
          else if (k == 'metadata') {
            // METADATA uploaded this way MUST be in JSON
            let formatted = data.trim()
            if (this.app.services.ProxyCartService.isJson(formatted)) {
              formatted = JSON.parse(formatted)
              upload[k] = formatted
            }
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
    upload.option = {}
    _.map(upload.options, option => {
      upload.option[option.name] = option.value
    })
    delete upload.options

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
      const handle = this.app.services.ProxyCartService.safeHandle(association.split(/:(.+)/)[0])
      const sku = this.app.services.ProxyCartService.safeHandle(association.split(/:(.+)/)[1])
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

    // Handle is required, if not here, then reject whole row without error
    if (!upload.handle) {
      return Promise.resolve({})
    }

    const newProduct = ProductUpload.build(upload)
    return newProduct.save()
  }

  /**
   *
   * @param uploadId
   * @returns {Promise}
   */
  processProductUpload(uploadId) {
    const ProductUpload = this.app.orm.ProductUpload
    const errors = []
    let productsTotal = 0, variantsTotal = 0, associationsTotal = 0, errorsCount = 0

    return ProductUpload.batch({
      where: {
        upload_id: uploadId
      },
      offset: 0,
      limit: 10,
      attributes: ['handle'],
      group: ['handle']
      // distinct: true
    }, (products) => {

      const Sequelize = this.app.orm.Product.sequelize

      return Sequelize.Promise.mapSeries(products, product => {
        return this.processProductGroup(product.handle, uploadId, {})
          .then((results) => {
            // Calculate the totals created
            productsTotal = productsTotal + (results.products || 0)
            variantsTotal = variantsTotal + (results.variants || 0)
            associationsTotal = associationsTotal + (results.associations || 0)
            errorsCount = errorsCount + (results.errors_count || 0)
            errors.concat(results.errors)
            return results
          })
          .catch(err => {
            errors.push(err.message)
            return
          })
      })
    })
      .then(results => {
        return ProductUpload.destroy({where: {upload_id: uploadId }})
          .catch(err => {
            errors.push(err.message)
            return err
          })
      })
      .then(destroyed => {
        return this.processProductAssociationUpload(uploadId)
          .then(results => {
            // Calculate the totals created
            associationsTotal = associationsTotal + (results.associations || 0)
            return results
          })
          .catch(err => {
            errors.push(err.message)
            return
          })
      })
      .then(() => {
        const results = {
          upload_id: uploadId,
          products: productsTotal,
          variants: variantsTotal,
          associations: associationsTotal,
          errors_count: errorsCount,
          errors: errors
        }
        // console.log('RESULTS', results)
        this.app.services.ProxyEngineService.publish('product_process.complete', results)
        return results
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
    this.app.log.debug('ProxyCartService.processProductGroup', handle)
    const ProductUpload = this.app.orm['ProductUpload']
    const AssociationUpload = this.app.orm['ProductAssociationUpload']
    const associations = []
    const errors = []
    let errorsCount = 0, productsCount = 0, variantsCount = 0, associationsCount = 0
    return ProductUpload.findAll({
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
        products.forEach(product => {
          if (product.associations) {
            product.associations.forEach(a => {
              const association = {
                upload_id: uploadId,
                product_handle: product.handle || null,
                product_sku: product.sku || null,
                associated_product_handle: a.handle || null,
                associated_product_sku: a.sku || null,
              }
              associations.push(association)
            })
          }
          delete product.associations
        })
        // Construct Root Product
        const defaultProduct = products.shift()
        // Add Product Variants
        defaultProduct.variants = products.filter( product => {
          if (!product) {
            errorsCount++
            // return
          }
          // Sku is required for a variant
          else if (!product.sku) {
            errorsCount++
            // return
          }
          else {
            product.images = product.variant_images
            return _.omit(product, ['variant_images'])
          }
        })

        // console.log('BROKE', defaultProduct)
        // Add the product with it's variants
        return this.app.services.ProductService.addProduct(defaultProduct, options)
          .then(createdProduct => {
            productsCount = 1
            if (createdProduct.variants) {
              variantsCount = createdProduct.variants.length
            }
            return
          })
          .catch(err => {
            errorsCount++
            errors.push(err.message)
            return
          })
      })
      .then(() => {
        return AssociationUpload.bulkCreate(associations)
          .then(uploadedAssociations => {
            associationsCount = uploadedAssociations ? uploadedAssociations.length : 0
            return
          })
          .catch(err => {
            errorsCount++
            errors.push(err.message)
            return
          })
      })
      .then(uploadedAssociations => {
        return {
          products: productsCount,
          variants: variantsCount,
          associations: associationsCount,
          errors_count: errorsCount,
          errors: errors
        }
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
    const errors = []
    return new Promise((resolve, reject) => {
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
              errors.push(err.message)
              this.app.log.error('ROW ERROR',err)
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
              results.errors = errors
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

    _.each(row, (data, key) => {
      if (data === '') {
        row[key] = null
      }
    })

    row = _.omitBy(row, _.isNil)

    if (_.isEmpty(row)) {
      return Promise.resolve({})
    }

    _.each(row, (data, key) => {
      if (data !== '') {
        const i = values.indexOf(key.replace(/^\s+|\s+$/g, ''))
        const k = keys[i]
        if (i > -1 && k) {
          if (k == 'handle') {
            upload[k] = this.app.services.ProxyCartService.safeHandle(data)
          }
          else {
            upload[k] = data
          }
        }
        else {
          let formatted = data
          if (this.app.services.ProxyCartService.isJson(formatted)) {
            formatted = JSON.parse(formatted)
          }
          upload.data[key] = formatted
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
    const ProductMetaUpload = this.app.orm.ProductMetaUpload
    const Metadata = this.app.orm.Metadata
    const Product = this.app.orm.Product
    const ProductVariant = this.app.orm.ProductVariant
    const errors = []

    let productsTotal = 0
    return ProductMetaUpload.batch({
      where: {
        upload_id: uploadId
      }
    }, metadatums => {

      const Sequelize = this.app.orm.Product.sequelize
      return Sequelize.Promise.mapSeries(metadatums, metadata => {

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
        else if (Type === ProductVariant){
          where = {
            'sku': metadata.handle.split(/:(.+)/)[1],
            '$Product.handle$': metadata.handle.split(/:(.+)/)[0]
          }
          includes.push({
            model: Product,
            attributes: ['handle']
          })
        }
        else {
          const err = new Error(`Target ${metadata.handle} not a Product or a Variant`)
          errors.push(err.message)
          return
        }

        return Type.findOne(
          {
            where: where,
            attributes: ['id'],
            include: includes
          })
          .then(target => {
            if (!target) {
              const err = new Error(`Target ${metadata.handle} not found`)
              errors.push(err.message)
              return
            }
            if (target.metadata) {
              target.metadata.data = metadata.data
              return target.metadata.save()
            }
            else {
              return target.createMetadata({data: metadata.data})
            }
          })
          .then(() => {
            productsTotal++
            return
          })
          .catch(err => {
            errors.push(err.message)
            return
          })
      })
    })
      .then(results => {
        return ProductMetaUpload.destroy({
          where: {upload_id: uploadId }
        })
          .catch(err => {
            errors.push(err.message)
            return err
          })
      })
      .then(destroyed => {
        const results = {
          upload_id: uploadId,
          products: productsTotal,
          errors: errors
        }
        this.app.services.ProxyEngineService.publish('product_metadata_process.complete', results)
        return results
      })
  }

  /**
   *
   * @param uploadId
   * @returns {Promise}
   */
  processProductAssociationUpload(uploadId) {
    return new Promise((resolve, reject) => {
      const AssociationUpload = this.app.orm['ProductAssociationUpload']
      const ProductService = this.app.services.ProductService
      const errors = []

      let associationsTotal = 0
      AssociationUpload.batch({
        where: {
          upload_id: uploadId
        }
      }, associations => {

        const Sequelize = AssociationUpload.sequelize
        return Sequelize.Promise.mapSeries(associations, association => {
          return ProductService.addAssociation({
            handle: association.product_handle,
            sku: association.product_sku
          }, {
            handle: association.associated_product_handle,
            sku: association.associated_product_sku
          })
            .then(() => {
              associationsTotal++
              return
            })
            .catch(err => {
              errors.push(err.message)
              return
            })
        })
      })
        .then(results => {
          return AssociationUpload.destroy({
            where: {upload_id: uploadId }
          })
        })
        .then(destroyed => {
          const results = {
            upload_id: uploadId,
            associations: associationsTotal,
            errors: errors
          }
          this.app.services.ProxyEngineService.publish('product_associations_process.complete', results)
          return resolve(results)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }
}

