/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')

/**
 * @module ProductService
 * @description Product Service
 */
module.exports = class ProductService extends Service {
  /**
   * Add Multiple Products
   * @param products
   * @returns {Promise.<*>}
   */
  addProducts(products) {
    return new Promise((resolve, reject) => {
      Promise.all(products.map(product => {
        return this.addProduct(product)
      }))
        .then(products => {
          // console.log('ProductService.addProducts', products)
          return resolve(products)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }

  /**
   * Add a Product
   * @param product
   * @returns {Promise}
   */
  addProduct(product) {
    return new Promise((resolve, reject) => {
      // Footprints Service
      const FootprintService = this.app.services.FootprintService
      // The Search Parameters
      const find = {
        host: product.host ? product.host : 'localhost',
        handle: product.handle
      }
      // Search for the Product
      FootprintService.find('Product', find)
        .then(products => {
          // console.log('ProductService.addProduct', products)
          if (products.length == 0){
            // Create Product
            return this.createProduct(product)
          }
          else {
            // TODO, check if this request has new variants and add them
            return products[0]
          }
        })
        .then(product => {
          // console.log('ProductService.addProduct', product)
          return resolve(product)
        })
        .catch(err =>{
          return reject(err)
        })
    })
  }

  /**
   * Create A Product with default Variant
   * @param product
   * @returns {Promise}
   */
  createProduct(product){
    return new Promise((resolve, reject) => {
      // console.log('ProductService.createProduct', product)
      const FootprintService = this.app.services.FootprintService
      // The Default Product
      const create = {
        host: product.host,
        handle: product.handle,
        title: product.title,
        body: product.body,
        vendor: product.vendor,
        type: product.type,
        tags: product.tags,
        price: product.price,
        metadata: product.metadata,
        published: product.published,
        published_scope: product.published_scope
      }
      if (product.published) {
        create.published_at = new Date()
      }
      if (product.published_scope) {
        create.published_scope = product.published_scope
      }
      // Images
      let images = []
      // If this request came with product images
      if (product.images) {
        _.map(product.images, image => {
          image.variant = 0
        })
        images = images.concat(product.images)
        delete product.images
      }

      // Variants
      let variants = [{
        title: product.title,
        price: product.price,
        weight: product.weight,
        weight_unit: product.weight_unit,
        position: 1,
        published: product.published
      }]
      if (product.published) {
        variants[0].published_at = create.published_at
      }
      // Add variants to the default
      if (product.variants) {
        variants = variants.concat(product.variants)
      }

      _.map(variants, (variant, index) => {
        // TODO a better way to do `position` please
        // If variant does not a have a position
        if (!variant.position) {
          // console.log('NO POSITION, ADD IT', variants[index - 1].position + 1)
          variant.position = variants[index - 1].position + 1
        }
        // If this variant is not explicitly not pulbished set to status of parent
        if (product.published && variant.published !== false) {
          variant.published = true
        }
        // If this variant is published then set published_at to same as parent
        if (variant.published) {
          variant.published_at = create.published_at
        }
        // If the price is set on parent
        if (product.price  && !variant.price) {
          variant.price = product.price
        }
        // If the compare at price is set on parent
        if (product.compare_at_price  && !variant.compare_at_price) {
          variant.compare_at_price = product.compare_at_price
        }
        // If the currency set on parent
        if (product.currency && !variant.currency) {
          variant.currency = product.currency
        }
        // If the fulfillment_service is set on parent
        if (product.fulfillment_service  && !variant.fulfillment_service) {
          variant.fulfillment_service = product.fulfillment_service
        }
        // If the requires_shipping is set on parent
        if (product.requires_shipping  && !variant.requires_shipping) {
          variant.requires_shipping = product.requires_shipping
        }
        // If the requires_shipping is set on parent
        if (product.requires_tax  && !variant.requires_tax) {
          variant.requires_tax = product.requires_tax
        }
        // If the requires_subscription set on parent
        if (product.requires_subscription && !variant.requires_shipping) {
          variant.requires_subscription = product.requires_subscription
        }
        // If the subscription_interval set on parent
        if (product.subscription_interval && !variant.subscription_interval) {
          variant.subscription_interval = product.subscription_interval
        }
        // If the subscription_unit set on parent
        if (product.subscription_unit && !variant.subscription_unit) {
          variant.subscription_unit = product.subscription_unit
        }
        // If the inventory_management set on parent
        if (product.inventory_management && !variant.inventory_management) {
          variant.inventory_management = product.inventory_management
        }
        // If the inventory_quantity set on parent
        if (product.inventory_quantity && !variant.inventory_quantity) {
          variant.inventory_quantity = product.inventory_quantity
        }
        // If the weight set on parent
        if (product.weight && !variant.weight) {
          variant.weight = product.weight
        }
        // If the weight_unit set on parent
        if (product.weight_unit && !variant.weight_unit) {
          variant.weight_unit = product.weight_unit
        }
        if (variant.images) {
          _.map(variant.images, image => {
            image.variant = index
          })
          images = images.concat(variant.images)
          delete variant.images
        }
      })

      _.map(images, (image, index) => {
        // TODO a better way to do `position` please
        // If Image does not have a position
        if (!image.position) {
          image.position = images[index - 1] ? images[index - 1].position + 1 : 1
        }
      })

      // Set the resulting Product
      let resProduct = {}
      // Create the Product
      FootprintService.create('Product', create)
        .then(createdProduct => {
          // Set the resulting product
          resProduct = createdProduct.dataValues
          // Create the Variants
          return Promise.all(variants.map(variant => {
            // Create the Association
            return FootprintService.createAssociation('Product', resProduct.id, 'variants', variant)
          }))
        })
        .then(createdVariants => {
          // Set the resulting product's variants
          resProduct.variants = createdVariants
          // Create Product Images
          return Promise.all(images.map(image => {
            image.product_id = resProduct.id
            if (image.variant !== 'undefined') {
              image.product_variant_id = createdVariants[image.variant].id
              delete image.variant
            }
            return FootprintService.create('ProductImage', image)
            //return FootprintService.createAssociation('Product', resProduct.id, 'images', image)
          }))
        })
        .then(createdImages => {
          // Set the resulting product's images
          resProduct.images = createdImages
          return resolve(resProduct)
        })
        .catch(err => {
          return reject(err)
        })
    })

  }
  /**
   *
   * @param products
   * @returns {Promise.<*>}
   */
  updateProducts(products) {
    return Promise.resolve(products)
  }

  /**
   *
   * @param products
   * @returns {Promise.<*>}
   */
  removeProducts(products) {
    return Promise.resolve(products)
  }
}

