/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')

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
    if (!Array.isArray(products)) {
      products = [products]
    }
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
    const Product = this.app.orm.Product
    return Product.find({
      where: {
        host: product.host ? product.host : 'localhost',
        handle: product.handle
      }
    })
      .then(resProduct => {
        if (!resProduct) {
          return this.createProduct(product)
        }
        else {
          // Set ID in case it's missing in this transaction
          product.id = resProduct.id
          return this.updateProduct(product)
        }
      })
  }

  /**
   * Create A Product with default Variant
   * @param product
   * @returns {Promise}
   */
  // TODO Create Images and Variant Images in one command
  createProduct(product){
    const Product = this.app.orm.Product
    const Tag = this.app.orm.Tag
    const Variant = this.app.orm.ProductVariant
    const Image = this.app.orm.ProductImage
    const Metadata = this.app.orm.Metadata
    const Collection = this.app.orm.Collection

    // The Default Product
    const create = {
      host: product.host,
      handle: product.handle,
      title: product.title,
      body: product.body,
      vendor: product.vendor,
      type: product.type,
      price: product.price,
      published: product.published,
      published_scope: product.published_scope,
      weight: product.weight,
      weight_unit: product.weight_unit,
      metadata: Metadata.transform(product.metadata || {})
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
    else {
      create.seo_description = product.body
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

    // Setup Transaction
    return Product.sequelize.transaction(t => {
      // Set the resulting Product
      let resProduct = {}
      return Product.create(create, {
        include: [
          {
            model: Tag,
            as: 'tags'
          },
          {
            model: Image,
            as: 'images'
          },
          {
            model: Variant,
            as: 'variants'
            // include: [
            //   {
            //     model: Image,
            //     as: 'images'
            //   }
            // ]
          },
          {
            model: Metadata,
            as: 'metadata'
          },
          {
            model: Collection,
            as: 'collections'
          }
        ]
      })
        .then(createdProduct => {
          resProduct = createdProduct
          // console.log('createdProduct',createdProduct)
          if (product.tags) {
            return Tag.transformTags(product.tags)
          }
          return
        })
        .then(tags => {
          if (tags) {
            // Add Tags
            return resProduct.setTags(tags)
          }
          return
        })
        .then(tags => {
          if (product.shops) {
            return Promise.all(product.shops.map(shop => {
              return this.app.services.ShopService.resolve(shop)
            }))
          }
          return
        })
        .then(shops => {
          if (shops) {
            return resProduct.setShops(shops)
          }
          return
        })
        .then(shops => {
          if (product.collections) {
            // Resolve the collections
            return Promise.all(product.collections.map(collection => {
              return this.app.services.CollectionService.resolve(collection)
            }))
          }
          return
        })
        .then(collections => {
          // console.log('THESE COLLECTIONS', collections)
          if (collections) {
            return resProduct.setCollections(collections)
          }
          return
        })
        .then(collections => {
          return Promise.all(images.map(image => {
            // image.product_id = resProduct.id
            if (typeof image.variant !== 'undefined') {
              image.product_variant_id = resProduct.variants[image.variant].id
              delete image.variant
            }
            return resProduct.createImage(image)
          }))
        })
        .then(createdImages => {
          // Reload
          return Product.findIdDefault(resProduct.id)
        })
    })
  }
  /**
   *
   * @param products
   * @returns {Promise.<*>}
   */
  updateProducts(products) {
    if (!Array.isArray(products)) {
      products = [products]
    }
    return Promise.all(products.map(product => {
      return this.updateProduct(product)
    }))
  }

  /**
   *
   * @param product
   * @returns {Promise}
   */
  // TODO Create/Update Images and Variant Images in one command
  // TODO resolve collection if posted
  updateProduct(product) {
    const Product = this.app.orm.Product
    const Variant = this.app.orm.ProductVariant
    const Image = this.app.orm.ProductImage
    const Tag = this.app.orm.Tag
    // const Collection = this.app.orm.Collection
    // const Metadata = this.app.orm.Metadata

    // let newTags = []
    return Product.sequelize.transaction(t => {
      let resProduct = {}
      if (!product.id) {
        throw new Errors.FoundError(Error('Product is missing id'))
      }
      return Product.findIdDefault(product.id)
        .then(foundProduct => {
          resProduct = foundProduct

          const update = {
            host: product.host || resProduct.host,
            handle: product.handle || resProduct.handle,
            body: product.body || resProduct.body,
            vendor: product.vendor || resProduct.vendor,
            type: product.type || resProduct.type,
            published_scope: product.published_scope || resProduct.published_scope,
            weight: product.weight || resProduct.weight,
            weight_unit: product.weight_unit || resProduct.weight_unit
          }
          if (product.published) {
            resProduct.published = resProduct.variants[0].published = product.published
            resProduct.published_at = resProduct.variants[0].published_at = new Date()
          }
          if (product.published === false) {
            update.published = resProduct.variants[0].published = product.published
            update.unpublished_at = resProduct.variants[0].unpublished_at = new Date()
          }
          // If the SKU is changing, set the default sku
          if (product.sku) {
            resProduct.variants[0].sku = product.sku
          }
          // if The title is changing, set the default title
          if (product.title) {
            update.title = resProduct.variants[0].title = product.title
          }
          // if the price is changing
          if (product.price) {
            update.price = resProduct.variants[0].price = product.price
          }
          // if the compare_at_price is changing
          if (product.compare_at_price) {
            resProduct.variants[0].compare_at_price = product.compare_at_price
          }
          if (product.metadata) {
            resProduct.metadata.data = product.metadata || {}
          }

          // Update seo_title if provided, else update it if a new product title
          if (product.seo_title) {
            resProduct.seo_title = product.seo_title
          }
          else if (product.title) {
            resProduct.seo_title = product.title
          }
          // Update seo_description if provided, else update it if a new product body
          if (product.seo_description) {
            resProduct.seo_description = product.seo_description
          }
          else if (product.body) {
            resProduct.seo_description = product.body
          }

          // Update Existing Variant
          _.each(resProduct.variants, variant => {
            return _.extend(variant, _.find(product.variants, { id: variant.id }))
          })
          // Create a List of new Variants
          product.variants = _.filter(product.variants, (variant, index ) => {
            if (typeof variant.id === 'undefined') {
              variant = this.variantDefaults(variant, resProduct.get({plain: true}))
              // variant.product_id = resProduct.id
              if (variant.images ) {
                // Update the master image if new/updated attributes are defined
                _.map(resProduct.images, image => {
                  return _.merge(image, _.find(variant.images, { id: image.id }))
                })
                // Remove all the images that are already created
                variant.images = _.filter(variant.images, image => {
                  if (typeof id === 'undefined') {
                    // image.variant = index
                    image.product_id = resProduct.id
                    return Image.build(image)
                  }
                })
                // Add these variant images to the new array.
                resProduct.images = _.concat(resProduct.images, variant.images)
                // delete variant.images
              }
              return Variant.build(variant)
            }
          })
          // Join all the variants
          resProduct.variants = _.sortBy(_.concat(resProduct.variants, product.variants),'position')
          // Set the Positions
          _.each(resProduct.variants, (variant, index) => {
            variant.position = index + 1
          })

          // Update existing Images
          _.each(resProduct.images, image => {
            return _.extend(image, _.find(product.images, { id: image.id }))
          })
          // Create a List of new Images
          product.images = _.filter(product.images, image => {
            if (typeof image.id === 'undefined') {
              return Image.build(image)
            }
          })
          // Join all the images
          resProduct.images = _.sortBy(_.concat(resProduct.images, product.images),'position')
          // Set the Positions
          _.each(resProduct.images, (image, index) => {
            image.position = index + 1
          })

          // console.log('THESE VARIANTS', resProduct.variants)
          return resProduct.updateAttributes(update)
        })
        .then(updateProduct => {
          // Transform any new Tags
          if (product.tags) {
            return Tag.transformTags(product.tags)
          }
          return
        })
        .then(tags => {
          // console.log('THESE TAGS', tags)
          // Set Tags
          if (tags) {
            return resProduct.setTags(tags)
          }
          return
        })
        .then(tags => {
          if (product.collections) {
            // Resolve the collections
            // console.log('THESE COLLECTIONS', product.collections)
            return Promise.all(product.collections.map(collection => {
              return this.app.services.CollectionService.resolve(collection)
            }))
          }
          return
        })
        .then(collections => {
          // console.log('THESE COLLECTIONS', collections)
          if (collections) {
            return resProduct.setCollections(collections)
          }
          return
        })
        .then(collections => {
          // save the metadata
          return resProduct.metadata.save()
        })
        .then(metadata => {
          return Promise.all(resProduct.variants.map(variant => {
            if (variant.id) {
              return variant.save()
            }
            else {
              return resProduct.createVariant(variant)
            }
          }))
        })
        .then(variants => {
          // console.log('THESE VARIANTS', variants)
          // return Product.findIdDefault(resProduct.id)
          return Promise.all(resProduct.images.map(image => {
            if (typeof image.variant !== 'undefined') {
              image.product_variant_id = resProduct.variants[image.variant].id
              delete image.variant
            }
            if (image.id) {
              return image.save()
            }
            else {
              return resProduct.createImage(image)
            }
          }))
        })
        .then(images => {
          return Product.findIdDefault(resProduct.id)
        })
    })
  }
  /**
   *
   * @param products
   * @returns {Promise.<*>}
   */
  removeProducts(products) {
    if (!Array.isArray(products)) {
      products = [products]
    }
    return Promise.all(products.map(product => {
      return this.removeProduct(product)
    }))
  }

  /**
   *
   * @param product
   */
  removeProduct(product) {
    if (!product.id) {
      const err = new Errors.FoundError(Error('Product is missing id'))
      return Promise.reject(err)
    }
    const Product = this.app.orm.Product
    return Product.destroy({where: {id: product.id}})
  }

  /**
   *
   * @param variants
   */
  removeVariants(variants){
    if (!Array.isArray(variants)) {
      variants = [variants]
    }
    return Promise.all(variants.map(variant => {
      const id = typeof variant.id !== 'undefined' ? variant.id : variant
      return this.removeVariant(id)
    }))
  }

  /**
   *
   * @param id
   */
  removeVariant(id){
    const Variant = this.app.orm.ProductVariant
    let destroy
    let updates
    return Variant.findById(id)
      .then(foundVariant => {
        destroy = foundVariant
        return Variant.findAll({
          where: {
            product_id: destroy.product_id
          }
        })
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
          return variant.save()
        }))
      })
      .then(updatedVariants => {
        return Variant.destroy({
          where: {
            id: id
          }
        })
      })
  }

  /**
   *
   * @param images
   */
  removeImages(images){
    if (!Array.isArray(images)) {
      images = [images]
    }
    return Promise.all(images.map(image => {
      const id = typeof image.id !== 'undefined' ? image.id : image
      return this.removeImage(id)
    }))
  }

  /**
   *
   * @param id
   */
  removeImage(id){
    const Image = this.app.orm.ProductImage
    let destroy
    let updates
    return Image.findById(id)
      .then(foundImage => {
        destroy = foundImage
        return Image.findAll({
          where: {
            product_id: destroy.product_id
          }
        })
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
          return image.save()
          // return FootprintService.update('ProductImage',image.id, { position: image.position })
        }))
      })
      .then(updatedImages => {
        return Image.destroy({
          where: {
            id: id
          }
        })
      })
  }
  // TODO addTag
  addTag(product, tag){

  }
  // TODO removeTag
  removeTag(product, tag){

  }

  // TODO addToCollection
  addToCollection(product, collection){

  }
  // TODO removeFromCollection
  removeFromCollection(product, collection){

  }

  // TODO addToShop
  addToShop(product, shop){

  }
  // TODO removeFromShop
  removeFromShop(product, shop){

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

