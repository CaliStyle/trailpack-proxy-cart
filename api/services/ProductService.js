/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const removeMd = require('remove-markdown')
const striptags = require('striptags')
const Errors = require('proxy-engine-errors')

/**
 * @module ProductService
 * @description Product Service
 */
module.exports = class ProductService extends Service {
  findOne(id) {

  }
  find(ids) {

  }
  /**
   * Add Multiple Products
   * @param products
   * @returns {Promise.<*>}
   */
  addProducts(products) {
    return Promise.all(products.map(product => {
      return this.addProduct(product)
    }))
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
        .then(foundProducts => {
          // console.log('ProductService.addProduct', foundProducts)
          if (foundProducts.length === 0){
            // Create Product
            return this.createProduct(product)
          }
          else {
            // Set this id just in case it's missing
            product.id = foundProducts[0].id
            // Check if this request has new variants and add them
            return this.updateProduct(product)
          }
        })
        .then(resProduct => {
          // console.log('ProductService.addProduct', product)
          return resolve(resProduct)
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
      const FootprintService = this.app.services.FootprintService
      const Product = this.app.services.ProxyEngineService.getModel('Product')
      const Tag = this.app.services.ProxyEngineService.getModel('Tag')
      const Variant = this.app.services.ProxyEngineService.getModel('ProductVariant')
      // const Metadata = this.app.services.ProxyEngineService.getModel('Metadata')
      // The Default Product
      const create = {
        host: product.host,
        handle: product.handle,
        title: product.title,
        body: product.body,
        vendor: product.vendor,
        type: product.type,
        price: product.price,
        // TODO FIX metadata
        // metadata: product.metadata,
        published: product.published,
        published_scope: product.published_scope,
        weight: product.weight,
        weight_unit: product.weight_unit
      }

      if (product.published) {
        create.published_at = new Date()
      }
      if (product.published_scope) {
        create.published_scope = product.published_scope
      }
      if (product.seo_title) {
        create.seo_title = product.seo_title
      }
      else {
        create.seo_title = product.title
      }
      if (product.seo_description) {
        create.seo_description = product.seo_description
      }
      if (!product.seo_description && product.body) {
        create.seo_description = removeMd(striptags(product.body))
      }

      // TODO handle Collection
      if (product.collection) {
        console.log('ProductService.addProduct Collection Not Supported Yet')
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
        sku: product.sku,
        title: product.title,
        price: product.price,
        weight: product.weight,
        weight_unit: product.weight_unit,
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
        variant = this.variantDefaults(variant, product)
        // Map Variant Positions putting default at 1
        //if (!variant.position) {
        variant.position = index + 1
        //}
        // If this variant is not explicitly not published set to status of parent
        if (product.published && variant.published !== false) {
          variant.published = true
        }
        // If this variant is published then set published_at to same as parent
        if (variant.published) {
          variant.published_at = create.published_at
        }
        // Handle Variant Images
        if (variant.images) {
          _.map(variant.images, image => {
            image.variant = index
          })
          images = images.concat(variant.images)
          delete variant.images
        }
      })
      // Assign the variants to the create model
      create.variants = variants

      _.map(images, (image, index) => {
        image.position = index + 1
      })

      // Set the resulting Product
      let resProduct = {}
      this.transformTags(product.tags)
        .then(tags => {
          // console.log('TAGS', tags)
          create.tags = tags
          // Create the Product
          return Product.create(create, {
            include: [
              {model: Tag, as: 'tags'},
              {model: Variant, as: 'variants'}
            ]
          })
        })
        .then(createdProduct => {
          // console.log(createdProduct)
          // Set the resulting product
          resProduct = createdProduct.get({ plain: true })
          // Unwrap the tags
          resProduct.tags = this.unwrapTags(resProduct.tags)

          // console.log('createdProduct',resProduct)

          return Promise.all(images.map(image => {
            image.product_id = resProduct.id
            if (typeof image.variant !== 'undefined') {
              image.product_variant_id = resProduct.variants[image.variant].id
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
    return Promise.all(products.map(product => {
      return this.updateProduct(product)
    }))
  }
  updateProduct(product) {
    return new Promise((resolve, reject) => {
      if (!product.id) {
        const err = new Errors.FoundError(Error('Product is missing id'))
        return reject(err)
      }

      const FootprintService = this.app.services.FootprintService
      // const Product = this.app.services.ProxyEngineService.getModel('Product')
      let resProduct
      let variants = []
      let images = []
      let tags = []
      // TODO Fix Metadata Fix Options
      FootprintService.find('Product', product.id, {populate: 'images,variants,tags'})
        .then(oldProduct => {
          // Init tags
          tags = _.map(oldProduct.tags, tag => {
            return tag.get({ plain: true })
          })
          product.tags = _.filter(product.tags, tag => {
            if (typeof tags.name === 'undefined') {
              return { name: tag }
            }
          })
          delete product.tags
          delete oldProduct.tags

          // Init images and map image updates if there are any
          images = _.map(oldProduct.images, image => {
            return image.get({ plain: true })
          })
          _.map(images, image => {
            return _.merge(image, _.find(product.images, { id: image.id }))
          })
          product.images = _.filter(product.images, image => {
            if (typeof image.id === 'undefined') {
              return image
            }
          })
          images = _.sortBy(_.concat(images, product.images), 'position')
          delete product.images
          delete oldProduct.images

          // Init variants and map variant updates if there are any
          variants = _.map(oldProduct.variants, variant => {
            return variant.get({ plain: true })
          })
          variants = _.map(variants, variant => {
            return _.merge(variant, _.find(product.variants, { id: variant.id }))
          })
          product.variants = _.filter(product.variants, variant => {
            if (typeof variant.id === 'undefined') {
              return variant
            }
          })
          variants = _.sortBy(_.concat(variants, product.variants),'position')
          delete product.variants
          delete oldProduct.variants

          // Extend the new values into a new object
          resProduct = _.extend(oldProduct.get({ plain: true }), product)
          // Set Publishing Status and default variant publish status
          if (product.published) {
            resProduct.published = variants[0].published = product.published
            resProduct.published_at = variants[0].published_at = new Date()
          }
          if (product.published === false) {
            resProduct.published = resProduct.variants[0].published = product.published
            resProduct.unpublished_at = resProduct.variants[0].unpublished_at = new Date()
          }
          // If the SKU is changing, set the default sku
          if (product.sku) {
            variants[0].sku = product.sku
          }
          // if The title is changing, set the default title
          if (product.title) {
            resProduct.title = variants[0].title = product.title
          }
          // if the price is changing
          if (product.price) {
            resProduct.price = variants[0].price = product.price
          }
          // if the compare_at_price is changing
          if (product.compare_at_price) {
            variants[0].compare_at_price = product.compare_at_price
          }
          // Map the variants and set defaults from product if not set
          _.map(variants, (variant, index) => {
            variant = this.variantDefaults(variant, resProduct)
            variant.position = index + 1
            // If this variant contains images
            if (variant.images) {
              // Let the image know the index of the variant it's attached to
              _.map(variant.images, image => {
                image.variant = index
              })
              // Update the master image if new/updated attributes are defined
              _.map(images, image => {
                return _.merge(image, _.find(variant.images, { id: image.id }))
              })
              // Remove all the images that are already created
              variant.images = _.filter(variant.images, image => {
                if (typeof id === 'undefined') {
                  return image
                }
              })
              // Add these variant iamges to the new array.
              images = _.concat(images, variant.images)
              delete variant.images
            }
          })

          // Map the images new positions
          _.map(images, (image, index) => {
            image.position = index + 1
          })
          //

          // // let collection
          // // TODO handle Collection
          // if (product.collection) {
          //   console.log('ProductService.updateProduct Collection Not Supported Yet')
          // }

          resProduct.variants = variants
          resProduct.images = images
          const update = _.omit(resProduct, ['id','created_at','updated_at', 'variants', 'images', 'metadata'])
          return FootprintService.update('Product', product.id, update)
          // return Product.update(product.id, update)
        })
        .then(updatedProduct => {
          return Promise.all(resProduct.variants.map(variant => {
            if (typeof variant.id !== 'undefined') {
              const update = _.omit(variant, ['id', 'created_at', 'updated_at'])
              // console.log('Updated Image', update)
              return FootprintService.update('ProductVariant', variant.id, update)
            }
            else {
              return FootprintService.createAssociation('Product', product.id, 'variants', variant)
            }
          }))
        })
        .then(editedVariants => {
          // console.log('ProductService.updateProduct Updated or Created Variants:', editedVariants.length)
          // If any new variants, replace them on resProduct
          _.each(editedVariants, (variant, index) => {
            if (_.isObject(variant)) {
              resProduct.variants[index] = variant.get({ plain: true })
            }
          })
          // console.log('ProductService.updateProduct',resProduct.images)
          return Promise.all(resProduct.images.map(image => {
            if (typeof image.variant !== 'undefined') {
              image.product_variant_id = resProduct.variants[image.variant].id
              delete image.variant
            }
            if (image.id) {
              const update = _.omit(image, ['id', 'created_at','updated_at'])
              return FootprintService.update('ProductImage', image.id, update)
            }
            else {
              image.product_id = product.id
              return FootprintService.create('ProductImage', image)
            }
          }))
        })
        .then(editedImages => {
          // console.log('ProductService.updateProduct', editedImages.length)
          // If any of the images are new, replace the image in resProduct.
          _.each(editedImages, (image, index) => {
            if (_.isObject(image)) {
              resProduct.images[index] = image.get({ plain: true })
            }
          })
          // console.log('RETURNING',resProduct)
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
  removeProducts(products) {
    return Promise.all(products.map(product => {
      return this.removeProduct(product)
    }))
  }
  removeProduct(product) {
    return new Promise((resolve, reject) => {
      if (!product.id) {
        const err = new Errors.FoundError(Error('Product is missing id'))
        return reject(err)
      }

      const FootprintService = this.app.services.FootprintService
      FootprintService.destroy('Product', product.id)
        .then(destroyedProduct => {
          return resolve(destroyedProduct)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }
  removeVariant(id){
    return new Promise((resolve, reject) => {
      const FootprintService = this.app.services.FootprintService
      let destroy
      let updates
      FootprintService.find('ProductVariant',id)
        .then(foundVariant => {
          destroy = foundVariant
          return FootprintService.find('ProductVariant', {product_id: destroy.product_id})
        })
        .then(foundVariants => {
          updates = _.sortBy(_.filter(foundVariants, variant => {
            if (variant.id !== id){
              return variant
            }
          }), 'position')
          _.map(updates, (variant, index) => {
            variant.position = index + 1
          })
          return Promise.all(updates.map(variant => {
            return FootprintService.update('ProductVariant',variant.id, { position: variant.position })
          }))
        })
        .then(updatedVariants => {
          return FootprintService.destroy('ProductVariant', id)
        })
        .then(destroyedVariant => {
          return resolve(destroyedVariant)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }
  removeImage(id){
    return new Promise((resolve, reject) => {
      const FootprintService = this.app.services.FootprintService
      let destroy
      let updates
      FootprintService.find('ProductImage',id)
        .then(foundImage => {
          destroy = foundImage
          return FootprintService.find('ProductImage', { product_id: destroy.product_id })
        })
        .then(foundImages => {
          updates = _.sortBy(_.filter(foundImages, image => {
            if (image.id !== id){
              return image
            }
          }), 'position')
          _.map(updates, (image, index) => {
            image.position = index + 1
          })
          return Promise.all(updates.map(image => {
            return FootprintService.update('ProductImage',image.id, { position: image.position })
          }))
        })
        .then(updatedImages => {
          return FootprintService.destroy('ProductImage', id)
        })
        .then(destroyedImage => {
          return resolve(destroyedImage)
        })
        .catch(err => {
          return reject(err)
        })
    })
  }
  transformTags(tags) {
    const Tag = this.app.services.ProxyEngineService.getModel('Tag')
    tags = _.map(tags, tag => {
      if (_.isString(tag)) {
        tag = { name: tag }
      }
      return tag
    })
    return Promise.all(tags.map((tag, index) => {
      return Tag.find({where: tag, attributes: ['id','name']})
        .then(tag => {
          if (tag) {
            return tag //.get({ plain: true })
          }
          else {
            return tags[index]
          }
        })
    }))
  }
  unwrapTags(tags) {
    tags = _.map(tags, tag => {
      return tag.name
    })
    return tags
  }
  /**
   *
   * @param variant
   * @param product
   * @returns {*}
   */
  variantDefaults(variant, product){
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
    return variant
  }
}

