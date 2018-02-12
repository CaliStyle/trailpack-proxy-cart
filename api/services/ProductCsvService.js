/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const csvParser = require('papaparse')
const _ = require('lodash')
const shortid = require('shortid')
const fs = require('fs')
const PRODUCT_UPLOAD = require('../../lib').Enums.PRODUCT_UPLOAD
const PRODUCT_META_UPLOAD = require('../../lib').Enums.PRODUCT_META_UPLOAD

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
    console.time('csv')
    const uploadID = shortid.generate()
    const ProxyEngineService = this.app.services.ProxyEngineService
    const errors = []
    let errorsCount = 0, lineNumber = 1

    return new Promise((resolve, reject)=>{
      const options = {
        header: true,
        dynamicTyping: true,
        step: (results, parser) => {
          parser.pause()
          lineNumber++
          return this.csvProductRow(results.data[0], uploadID)
            .then(row => {
              parser.resume()
            })
            .catch(err => {
              errorsCount++
              this.app.log.error('ROW ERROR', err)
              errors.push(`Line ${lineNumber}: ${err.message}`)
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
              results.errors_count = errorsCount
              results.errors = errors

              // Publish the event
              ProxyEngineService.publish('product_upload.complete', results)
              return resolve(results)
            })
            .catch(err => {
              errorsCount++
              errors.push(err.message)
              results.errors_count = errorsCount
              results.errors = errors
              return resolve(results)
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
    // Wrap this in a promise so we can gracefully handle an error
    return Promise.resolve()
      .then(() => {

        const ProductUpload = this.app.orm.ProductUpload
        const values = _.values(PRODUCT_UPLOAD)
        const keys = _.keys(PRODUCT_UPLOAD)
        const google = {}
        const amazon = {}
        const upload = {
          upload_id: uploadID,
          options: {},
          properties: {},
          images: [],
          variant_images: [],
          vendors: [],
          collections: [],
          associations: [],
          tags: []
        }

        // clear the row key if it's data is undefined
        _.each(row, (data, key) => {
          if (typeof(data) === 'undefined' || data === '') {
            row[key] = null
          }
        })

        // Omit parts of the row that are completely nil
        row = _.omitBy(row, _.isNil)

        // If the resulting row is empty, then skip
        if (_.isEmpty(row)) {
          return Promise.resolve({})
        }

        // For each row key normalize the data
        _.each(row, (data, key) => {
          if (typeof(data) !== 'undefined' && data !== null && data !== '') {
            const i = values.indexOf(key.replace(/^\s+|\s+$/g, ''))
            const k = keys[i]
            if (i > -1 && k) {
              if (k === 'handle') {
                upload[k] = this.app.services.ProxyCartService.handle(data)
              }
              else if (k === 'title') {
                upload[k] = this.app.services.ProxyCartService.title(data)
              }
              else if (k === 'seo_description') {
                upload[k] = this.app.services.ProxyCartService.description(data)
              }
              else if (k === 'tags') {
                upload[k] = _.uniq(data.toString().split(',').map(tag => {
                  return tag.toLowerCase().trim()
                }))
              }
              else if (k === 'images') {
                upload[k] = data.toString().split(',').map(image => {
                  return image.trim()
                })
              }
              else if (k === 'images_alt') {
                upload[k] = data.toString().split('|').map(alt => {
                  return alt.trim()
                })
              }
              else if (k === 'variant_images') {
                upload[k] = data.toString().split(',').map(image => {
                  return image.trim()
                })
              }
              else if (k === 'variant_images_alt') {
                upload[k] = data.toString().split('|').map(alt => {
                  return alt.trim()
                })
              }
              else if (k === 'collections') {
                upload[k] = _.uniq(data.toString().split(',').map(collection => {
                  return collection.trim()
                }))
              }
              else if (k === 'associations') {
                upload[k] = data.toString().split(',').map(association => {
                  return association.trim()
                })
              }
              else if (k === 'exclude_payment_types') {
                upload[k] = data.toString().split(',').map(type => {
                  return type.trim()
                })
              }
              else if (k === 'vendors') {
                upload[k] = data.toString().split(',').map(vendor => {
                  return vendor.trim()
                })
              }
              else if (k === 'shops') {
                upload[k] = data.toString().split(',').map(shop => {
                  return shop.trim()
                })
              }
              else if (k === 'shops_quantity') {
                upload[k] = data.toString().split(',').map(shopQty => {
                  return parseInt(shopQty.trim())
                })
              }
              else if (k === 'weight_unit') {
                upload[k] = data.toString().toLowerCase().trim()
              }
              else if (k === 'inventory_policy') {
                upload[k] = data.toString().toLowerCase().trim()
              }
              else if (k === 'g_product_category') {
                google['g_product_category'] = data.toString().trim()
              }
              else if (k === 'g_gender') {
                google['g_gender'] = data.toString().trim()
              }
              else if (k === 'g_age_group') {
                google['g_age_group'] = data.toString().trim()
              }
              else if (k === 'g_mpn') {
                google['g_mpn'] = data.toString().trim()
              }
              else if (k === 'g_adwords_grouping') {
                google['g_adwords_grouping'] = data.toString().trim()
              }
              else if (k === 'g_adwords_label') {
                google['g_adwords_label'] = data.toString().trim()
              }
              else if (k === 'g_condition') {
                google['g_condition'] = data.toString().trim()
              }
              else if (k === 'g_custom_product') {
                google['g_custom_product'] = data.toString().trim()
              }
              else if (k === 'g_custom_label_0') {
                google['g_custom_label_0'] = data.toString().trim()
              }
              else if (k === 'g_custom_label_1') {
                google['g_custom_label_1'] = data.toString().trim()
              }
              else if (k === 'g_custom_label_2') {
                google['g_custom_label_2'] = data.toString().trim()
              }
              else if (k === 'g_custom_label_3') {
                google['g_custom_label_3'] = data.toString().trim()
              }
              else if (k === 'g_custom_label_4') {
                google['g_custom_label_4'] = data.toString().trim()
              }
              else if (k === 'metadata') {
                // METADATA uploaded this way MUST be in JSON
                let formatted = data.toString().trim()
                if (this.app.services.ProxyCartService.isJson(formatted)) {
                  formatted = JSON.parse(formatted)
                  upload[k] = formatted
                }
                // else {
                //   upload[k] = formatted
                // }
              }
              else if (k === 'discounts') {
                // Discounts uploaded this way MUST be in JSON
                let formatted = data.toString().trim()
                if (this.app.services.ProxyCartService.isJson(formatted)) {
                  formatted = JSON.parse(formatted)
                  upload[k] = formatted
                }
                // else {
                //   upload[k] = formatted
                // }
              }
              else {
                upload[k] = data
              }
            }
            else {
              const optionsReg = new RegExp('^((Option \/).([0-9]).(Name|Value))', 'g')
              const propertyReg = new RegExp('^((Property Pricing \/).([0-9]).(Name|Group|Value|Image|Multi Select))', 'g')

              const matchOptions = optionsReg.exec(key)
              if (
                matchOptions
                && matchOptions[2] === 'Option /'
                && typeof matchOptions[3] !== 'undefined'
                && typeof matchOptions[4] !== 'undefined'
              ) {

                const part = matchOptions[4].toLowerCase()
                const index = Number(matchOptions[3]) - 1
                // console.log(index, part)
                if (typeof upload.options[index] === 'undefined') {
                  upload.options[index] = {
                    name: '',
                    value: ''
                  }
                }
                // TODO place this as the default product
                // if (data.trim().toLowerCase() !== 'default value') {
                upload.options[index][part] = typeof data === 'string' ? data.trim() : data
                // console.log('OPTION RESULT',upload.options[index][part])
                // }
              }

              const matchProperties = propertyReg.exec(key)
              if (
                matchProperties
                && matchProperties[2] === 'Property Pricing /'
                && typeof matchProperties[3] !== 'undefined'
                && typeof matchProperties[4] !== 'undefined'
              ) {

                const part = matchProperties[4].toLowerCase().replace(' ','_')
                const index = Number(matchProperties[3]) - 1
                // console.log(index, part)
                if (typeof upload.properties[index] === 'undefined') {
                  upload.properties[index] = {
                    name: '',
                    group: null,
                    value: '',
                    image: null
                  }
                }
                // TODO place this as the default product
                // if (data.trim().toLowerCase() !== 'default value') {
                upload.properties[index][part] = typeof data === 'string' ? data.trim() : data

                // console.log('PROPERTY RESULT',upload.properties[index][part])
                // }
              }
            }
          }
        })

        // Handle Options
        upload.option = {}
        _.map(upload.options, option => {
          upload.option[option.name] = option.value
        })
        // console.log('FINAL option', upload.option)
        delete upload.options

        // Handle Pricing Properties
        upload.property_pricing = {}
        _.map(upload.properties, property => {
          upload.property_pricing[property.name] = {}
          upload.property_pricing[property.name]['price'] = property.value

          if (property.group) {
            upload.property_pricing[property.name]['group'] = property.group
          }
          else {
            upload.property_pricing[property.name]['group'] = null
          }

          if (property.image) {
            upload.property_pricing[property.name]['image'] = property.image
          }
          else {
            upload.property_pricing[property.name]['image'] = null
          }

          if (property.multi_select !== 'undefined') {
            upload.property_pricing[property.name]['multi_select'] = property.multi_select
          }
          else {
            upload.property_pricing[property.name]['multi_select'] = true
          }
        })
        // console.log('FINAL property_pricing', upload.property_pricing)
        delete upload.properties

        // Map images
        upload.images = upload.images.map((image, index) => {
          return {
            src: image,
            alt: upload.images_alt &&  upload.images_alt[index]
              ? this.app.services.ProxyCartService.description(upload.images_alt[index]) : ''
          }
        })
        delete upload.images_alt
        upload.images = upload.images.filter(image => image)

        // Map variant images
        upload.variant_images = upload.variant_images.map((image, index) => {
          return {
            src: image,
            alt: upload.variant_images_alt && upload.variant_images_alt[index]
              ? this.app.services.ProxyCartService.description(upload.variant_images_alt[index]) : null
          }
        })
        delete upload.variant_images_alt
        upload.variant_images = upload.variant_images.filter(image => image)

        // Map vendors
        upload.vendors = upload.vendors.map(vendor => {
          return {
            handle: this.app.services.ProxyCartService.handle(vendor),
            name: this.app.services.ProxyCartService.title(vendor)
          }
        })
        // Filter out undefined
        upload.vendors = upload.vendors.filter(vendor => vendor)
        // Get only Unique handles
        upload.vendors = _.uniqBy(upload.vendors, 'handle')

        // Map collections
        upload.collections = upload.collections.map(collection => {
          if (collection !== '') {
            return {
              handle: this.app.services.ProxyCartService.handle(collection),
              title: collection
            }
          }
        })
        // Filter out undefined
        upload.collections = upload.collections.filter(collection => collection)
        // Get only Unique handles
        upload.collections = _.uniqBy(upload.collections, 'handle')

        // Map tags
        upload.tags = upload.tags.map(tag => {
          if (tag !== '') {
            return {
              name: this.app.services.ProxyCartService.name(tag)
            }
          }
        })
        // Filter out undefined tags
        upload.tags = upload.tags.filter(tag => tag)
        // Get only Unique names
        upload.tags = _.uniqBy(upload.tags, 'name')

        // Map associations
        upload.associations = upload.associations.map(association => {
          const product = association.split(/:(.+)/)

          // console.log('BROKE ASSOCIATION', product)

          const handle = this.app.services.ProxyCartService.handle(product[0])
          const sku = this.app.services.ProxyCartService.title(product[1])
          const res = {}
          if (handle && handle !== '') {
            res.handle = handle
            if (sku && sku !== '') {
              res.sku = sku
            }

            // console.log('BROKE ASSOCIATION', res)
            return res
          }
          return
        })
        // Filter out undefined
        upload.associations = upload.associations.filter(association => association)

        // Add google
        upload.google = google
        // Add amazon
        upload.amazon = amazon

        // Handle is required, if not here, then reject whole row
        return ProductUpload.build(upload).save()
      })
  }

  /**
   *
   * @param uploadId
   * @returns {Promise}
   */
  processProductUpload(uploadId) {
    const ProductUpload = this.app.orm['ProductUpload']
    let errors = [], productsTotal = 0, variantsTotal = 0, associationsTotal = 0, errorsCount = 0

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

      const Sequelize = this.app.orm['Product'].sequelize
      return Sequelize.Promise.mapSeries(products, product => {
        return this.processProductGroup(product.handle, uploadId, {})
          .then((results) => {
            // Calculate the totals created
            productsTotal = productsTotal + (results.products || 0)
            variantsTotal = variantsTotal + (results.variants || 0)
            associationsTotal = associationsTotal + (results.associations || 0)
            errorsCount = errorsCount + (results.errors_count || 0)
            errors = errors.concat(results.errors)
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
        return this.processProductAssociationUpload(uploadId, {})
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
        this.app.services.ProxyEngineService.publish('product_process.complete', results)
        return results
      })

  }

  /**
   *
   * @param handle
   * @param uploadId,
   * @param options
   * @returns {Promise}
   */
  processProductGroup(handle, uploadId, options) {
    options = options || {}
    this.app.log.debug('ProductCsvService.processProductGroup: processing', handle, uploadId)

    const Product = this.app.orm['Product']
    const ProductUpload = this.app.orm['ProductUpload']
    const AssociationUpload = this.app.orm['ProductAssociationUpload']
    const associations = []
    const errors = []
    let errorsCount = 0, productsCount = 0, variantsCount = 0, associationsCount = 0

    return Product.sequelize.transaction(t => {
      options.transaction = t

      return ProductUpload.findAll({
        where: {
          handle: handle,
          upload_id: uploadId
        },
        order: [['id','ASC']],
        // transaction: options.transaction || null
      })
        .then(products => {

          // Remove Upload Attributes
          products = products.map(product => {
            return _.omit(product.get({plain: true}), ['id', 'upload_id', 'created_at', 'updated_at'])
          })
          // Handle associations
          products = products.map(product => {
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
            return product
          })

          // Sort the products to find the default if they got out of order somewhere
          if (!products[0].title || products[0].title === '') {
            products = products.sort((a, b) => {
              if (a.title > b.title) {
                return 1
              }
              else if (a.title < b.title) {
                return 0
              }
              else {
                return -1
              }
            })
          }

          // Construct Root Product
          const defaultProduct = products.shift()

          if (!defaultProduct) {
            throw new Error(`${handle}: Default Product could not be established`)
          }
          if (!defaultProduct.handle) {
            throw new Error(`${handle}: Default Product could not be established, missing handle`)
          }
          if (!defaultProduct.title) {
            throw new Error(`${handle}: Default Product could not be established, missing title`)
          }

          // Add Product Variants
          defaultProduct.variants = products.map(variant => {
            if (!variant) {
              throw new Error(`${handle}: Missing`)
            }
            else if (!variant.handle) {
              throw new Error(`${handle}: Missing Handle`)
            }
            // Sku is required for a variant
            else if (!variant.sku) {
              throw new Error(`${handle}: Missing Variant SKU`)
            }
            else {
              // Set the Images on the Variant
              variant.images = variant.variant_images
              return _.omit(variant, ['variant_images'])
            }
          })
          // Remove Undefined
          defaultProduct.variants = defaultProduct.variants.filter(variant => variant)

          // Add the product with it's variants
          return this.app.services.ProductService.addProduct(defaultProduct, {transaction: options.transaction || null})
            .then(createdProduct => {
              if (!createdProduct) {
                throw new Error(`${handle} was not created`)
              }
              productsCount = 1
              if (createdProduct.variants) {
                variantsCount = createdProduct.variants.length
              }
              return
            })
            .catch(err => {
              this.app.log.error(err)
              errorsCount++
              errors.push(`${handle}: ${err.message}`)
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
        .catch(err => {
          errorsCount++
          errors.push(err.message)
          return {
            products: productsCount,
            variants: variantsCount,
            associations: associationsCount,
            errors_count: errorsCount,
            errors: errors
          }
        })
    })
  }

  /**
   *
   * @param file
   * @returns {Promise}
   */
  productMetaCsv(file) {
    console.time('csv')
    const uploadID = shortid.generate()
    const ProxyEngineService = this.app.services.ProxyEngineService
    const errors = []
    let errorsCount = 0, lineNumber = 1
    return new Promise((resolve, reject) => {
      const options = {
        header: true,
        dynamicTyping: true,
        step: (results, parser) => {
          parser.pause()
          lineNumber++
          return this.csvProductMetaRow(results.data[0], uploadID)
            .then(row => {
              parser.resume()
            })
            .catch(err => {
              errorsCount++
              errors.push(`Line ${lineNumber}: ${err.message}`)
              this.app.log.error('ROW ERROR', err)
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
              results.errors_count = errorsCount
              // Publish the event
              ProxyEngineService.publish('product_meta_upload.complete', results)
              return resolve(results)
            })
            .catch(err => {
              errorsCount++
              errors.push(err.message)
              results.errors = errors
              results.errors_count = errorsCount
              return resolve(results)
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
    // Wrap this in a promise so we can gracefully handle an error
    return Promise.resolve()
      .then(() => {
        const ProductMetaUpload = this.app.orm.ProductMetaUpload
        const values = _.values(PRODUCT_META_UPLOAD)
        const keys = _.keys(PRODUCT_META_UPLOAD)
        const upload = {
          upload_id: uploadID,
          data: {}
        }

        _.each(row, (data, key) => {
          if (typeof(data) === 'undefined' || data === '') {
            row[key] = null
          }
        })

        row = _.omitBy(row, _.isNil)

        if (_.isEmpty(row)) {
          return Promise.resolve({})
        }

        _.each(row, (data, key) => {
          if (typeof(data) !== 'undefined' && data !== null && data !== '') {
            const i = values.indexOf(key.replace(/^\s+|\s+$/g, ''))
            const k = keys[i]
            if (i > -1 && k) {
              if (k == 'handle') {
                // Can be a Product handle or a Product Handle with SKU
                upload[k] = this.app.services.ProxyCartService.splitHandle(data)
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

        return ProductMetaUpload.build(upload).save()
      })
  }

  /**
   *
   * @param uploadId
   * @returns {Promise}
   */
  processProductMetaUpload(uploadId, options) {
    options = options || {}
    const ProductMetaUpload = this.app.orm.ProductMetaUpload
    const Metadata = this.app.orm.Metadata
    const Product = this.app.orm.Product
    const ProductVariant = this.app.orm.ProductVariant
    const errors = []

    let productsTotal = 0, errorsCount = 0
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
          const product = metadata.handle.split(/:(.+)/)
          where = {
            'sku': this.app.services.ProxyCartService.sku(product[1]),
            '$Product.handle$': this.app.services.ProxyCartService.handle(product[0])
          }
          includes.push({
            model: Product,
            attributes: ['handle']
          })
        }
        else {
          const err = new Error(`Target ${metadata.handle} not a Product or a Variant`)
          errorsCount++
          errors.push(err.message)
          return
        }

        return Type.findOne(
          {
            where: where,
            attributes: ['id'],
            include: includes,
            transaction: options.transaction || null
          })
          .then(target => {
            if (!target) {
              const err = new Error(`Target ${Type.getTableName()} ${metadata.handle} not found`)
              errorsCount++
              errors.push(err.message)
              return
            }
            if (target.metadata) {
              target.metadata.data = metadata.data
              return target.metadata.save({transaction: options.transaction || null})
                .then(() => {
                  productsTotal++
                  return
                })
                .catch(err => {
                  errorsCount++
                  errors.push(`${metadata.handle}: ${err.message}`)
                  return
                })
            }
            else {
              return target.createMetadata({data: metadata.data}, {transaction: options.transaction || null})
                .then(() => {
                  productsTotal++
                  return
                })
                .catch(err => {
                  errorsCount++
                  errors.push(`${metadata.handle}: ${err.message}`)
                  return
                })
            }
          })
          .catch(err => {
            errorsCount++
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
            errorsCount++
            errors.push(err.message)
            return
          })
      })
      .then(destroyed => {
        const results = {
          upload_id: uploadId,
          products: productsTotal,
          errors_count: errorsCount,
          errors: errors
        }
        this.app.services.ProxyEngineService.publish('product_metadata_process.complete', results)
        return results
      })
  }

  /**
   *
   * @param uploadId
   * @param options
   * @returns {Promise}
   */
  processProductAssociationUpload(uploadId, options) {
    options = options || {}
    const AssociationUpload = this.app.orm['ProductAssociationUpload']
    const ProductService = this.app.services.ProductService
    const errors = []

    let associationsTotal = 0, errorsCount = 0
    return AssociationUpload.batch({
      where: {
        upload_id: uploadId
      },
      transaction: options.transaction | null
    }, associations => {

      return AssociationUpload.sequelize.Promise.mapSeries(associations, association => {
        return ProductService.addAssociation({
          handle: association.product_handle,
          sku: association.product_sku
        }, {
          handle: association.associated_product_handle,
          sku: association.associated_product_sku
        }, {
          transaction: options.transaction || null
        })
          .then(() => {
            associationsTotal++
            return
          })
          .catch(err => {
            errorsCount++
            errors.push(`${association.product_handle} -> ${association.associated_product_handle}: ${err.message}`)
            return
          })
      })
    })
      .then(results => {
        return AssociationUpload.destroy({
          where: {
            upload_id: uploadId
          },
          transaction: options.transaction || null
        })
          .catch(err => {
            errorsCount++
            errors.push(err)
            return
          })
      })
      .then(destroyed => {
        const results = {
          upload_id: uploadId,
          associations: associationsTotal,
          errors_count: errorsCount,
          errors: errors
        }
        this.app.services.ProxyEngineService.publish('product_associations_process.complete', results)
        return results
      })
  }
}

