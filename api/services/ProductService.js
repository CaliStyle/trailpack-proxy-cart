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
   *
   * @param product
   * @param options
   * @returns {*}
   */
  resolve(product, options) {
    const Product =  this.app.orm.Product

    if (!options) {
      options = {}
    }

    if (product instanceof Product.Instance){
      return Promise.resolve(product)
    }
    else if (product && _.isObject(product) && product.id) {
      return Product.findById(product.id, options)
        .then(resProduct => {
          if (!resProduct) {
            throw new Errors.FoundError(Error(`Product ${product.id} not found`))
          }
          return resProduct
        })
    }
    else if (product && _.isObject(product) && product.handle) {
      return Product.findOne({
        where: { handle: product.handle }
      }, options)
        .then(resProduct => {
          if (!resProduct) {
            throw new Errors.FoundError(Error(`Product ${product.handle} not found`))
          }
          return resProduct
        })
    }
    else if (product && (_.isString(product) || _.isNumber(product))) {
      return Product.findById(product, options)
        .then(resProduct => {
          if (!resProduct) {
            throw new Errors.FoundError(Error(`Product ${product} not found`))
          }
          return resProduct
        })
    }
    else {
      // TODO create proper error
      const err = new Error(`Unable to resolve Product ${product}`)
      return Promise.reject(err)
    }
  }

  /**
   *
   * @param variant
   * @param options
   * @returns {*}
   */
  resolveVariant(variant, options) {
    const Variant =  this.app.orm.ProductVariant

    if (!options) {
      options = {}
    }

    if (variant instanceof Variant.Instance){
      return Promise.resolve(variant)
    }
    else if (variant && _.isObject(variant) && variant.id) {
      return Variant.findById(variant.id, options)
        .then(resVariant => {
          if (!resVariant) {
            throw new Errors.FoundError(Error(`Variant ${variant.id} not found`))
          }
          return resVariant
        })
    }
    else if (variant && _.isObject(variant) && variant.sku) {
      return Variant.findOne({
        where: { sku: variant.sku }
      }, options)
        .then(resVariant => {
          if (!resVariant) {
            throw new Errors.FoundError(Error(`Variant ${variant.sku} not found`))
          }
          return resVariant
        })
    }
    else if (variant && (_.isString(variant) || _.isNumber(variant))) {
      return Variant.findById(variant, options)
        .then(resVariant => {
          if (!resVariant) {
            throw new Errors.FoundError(Error(`Variant ${variant} not found`))
          }
          return resVariant
        })
    }
    else {
      // TODO create proper error
      const err = new Error(`Unable to resolve Variant ${variant}`)
      return Promise.reject(err)
    }
  }
  /**
   *
   * @param item
   * @param options
   * @returns {*}
   */
  resolveItem(item, options){
    const Product = this.app.orm.Product
    const ProductVariant = this.app.orm.ProductVariant
    const Image = this.app.orm.ProductImage

    if (!options) {
      options = {}
    }

    if (item.id || item.variant_id || item.product_variant_id) {
      const id = item.id || item.variant_id || item.product_variant_id
      return ProductVariant.findById(id, {
        transaction: options.transaction || null,
        include: [
          {
            model: Product,
            include: [
              {
                model: Image,
                as: 'images',
                attributes: ['src','full','thumbnail','small','medium','large','alt','position']
              }
            ]
          },
          {
            model: Image,
            as: 'images',
            attributes: ['src','full','thumbnail','small','medium','large','alt','position']
          }
        ]
      })
    }
    else if (item.product_id) {
      return ProductVariant.find({
        where: {
          product_id: item.product_id,
          position: 1
        },
        transaction: options.transaction || null,
        include: [
          {
            model: Product,
            include: [
              {
                model: Image,
                as: 'images',
                attributes: ['src','full','thumbnail','small','medium','large','alt','position']
              }
            ]
          },
          {
            model: Image,
            as: 'images',
            attributes: ['src','full','thumbnail','small','medium','large','alt','position']
          }
        ]
      })
    }
    else {
      const err = new Errors.FoundError(Error(`${item} not found`))
      return Promise.reject(err)
    }
  }
  /**
   * Add Multiple Products
   * @param products
   * @returns {Promise.<*>}
   */
  addProducts(products) {
    if (!Array.isArray(products)) {
      products = [products]
    }
    const Sequelize = this.app.orm.Product.sequelize
    // const addedProducts = []
    // Setup Transaction
    return Sequelize.transaction(t => {
      return Sequelize.Promise.mapSeries(products, product => {
        return this.addProduct(product, {
          transaction: t
        })
      })
    })
  }

  /**
   * Add a Product
   * @param product
   * @returns {Promise}
   */
  addProduct(product, options) {
    const Product = this.app.orm.Product

    if (!options) {
      options = {}
    }

    return Product.findOne({
      where: {
        host: product.host ? product.host : 'localhost',
        handle: product.handle
      },
      attributes: ['id'],
      transaction: options.transaction || null
    })
      .then(resProduct => {
        if (!resProduct) {
          // Create a new Product
          return this.createProduct(product, options)
        }
        else {
          // Set ID in case it's missing in this transaction
          product.id = resProduct.id
          // Update the existing product
          return this.updateProduct(product, options)
        }
      })
  }

  /**
   * Create A Product with default Variant
   * @param product
   * @returns {Promise}
   */
  // TODO Create Images and Variant Images in one command
  createProduct(product, options){
    const Product = this.app.orm.Product
    const Tag = this.app.orm.Tag
    const Variant = this.app.orm.ProductVariant
    const Image = this.app.orm.ProductImage
    const Metadata = this.app.orm.Metadata
    const Collection = this.app.orm.Collection
    const Vendor = this.app.orm.Vendor
    const Shop = this.app.orm.Shop

    if (!options) {
      options = {}
    }

    // The Default Product
    const create = {
      host: product.host,
      handle: product.handle,
      title: product.title,
      body: product.body,
      type: product.type,
      price: product.price,
      published: product.published,
      published_scope: product.published_scope,
      weight: product.weight,
      weight_unit: product.weight_unit,
      metadata: Metadata.transform(product.metadata || {}),
      options: []
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
    // Set a default variant based of off product
    let variants = [{
      sku: product.sku,
      title: product.title,
      price: product.price,
      weight: product.weight,
      weight_unit: product.weight_unit,
      published: product.published,
      requires_shipping: product.requires_shipping,
      option: product.option || {}
      // requires_subscription: product.requires_subscription,
      // tax_code: product.tax_code
    }]
    // Set the published status
    if (product.published) {
      variants[0].published_at = create.published_at
    }
    // This is not a true variant because it is missing a sku (which is required), let's remove it.
    if (!variants[0].sku) {
      variants.splice(0,1)
    }
    // Add variants to the default
    if (product.variants) {
      variants = variants.concat(product.variants)
    }
    // For every variant, map missing defaults and images
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
      if (variant.images && variant.images.length > 0) {
        _.map(variant.images, image => {
          image.variant = index
        })
        images = images.concat(variant.images)
        delete variant.images
      }
      if (variant.option) {
        const keys = Object.keys(variant.option)
        create.options = _.union(create.options, keys)
      }
    })

    // Assign the variants to the create model
    create.variants = variants

    // Map image positions
    _.map(images, (image, index) => {
      image.position = index + 1
    })

    // Set the resulting Product
    let resProduct = {}
    return Product.create(create, {
      transaction: options.transaction || null,
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
          model: Vendor,
          as: 'vendors'
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
        if (product.tags && product.tags.length > 0) {
          product.tags = _.sortedUniq(product.tags.filter(n => n))
          // console.log('THIS PRODUCT TAGS NOW', product.tags)
          return Tag.transformTags(product.tags, {transaction: options.transaction || null})
        }
        return
      })
      .then(tags => {
        if (tags && tags.length > 0) {
          // Add Tags
          return resProduct.setTags(_.map(tags, tag  => tag.id), {transaction: options.transaction || null})
        }
        return
      })
      .then(productTags => {
        if (product.shops && product.shops.length > 0) {
          product.shops = _.sortedUniq(product.shops.filter(n => n))
          // console.log('THIS PRODUCT SHOPS NOW', product.shops)
          return Shop.transformShops(product.shops, {transaction: options.transaction || null})
        }
        return
      })
      .then(shops => {
        if (shops && shops.length > 0) {
          return resProduct.setShops(shops, {transaction: options.transaction || null})
        }
        return
      })
      .then(shops => {
        // console.log('THESE COLLECTIONS', product.collections)
        if (product.collections && product.collections.length > 0) {
          // Resolve the collections
          product.collections = _.sortedUniq(product.collections.filter(n => n))
          // console.log('THIS PRODUCT COLLECTIONS NOW', product.collections)
          return Collection.transformCollections(product.collections, {transaction: options.transaction || null})
        }
        return
      })
      .then(collections => {
        // console.log('THESE COLLECTIONS RESOLVED', collections)
        if (collections && collections.length > 0) {
          return resProduct.setCollections(_.map(collections, c => c.id), {transaction: options.transaction || null})
        }
        return
      })
      .then(productCollections => {
        if (product.vendors && product.vendors.length > 0) {
          return Vendor.transformVendors(product.vendors, {transaction: options.transaction || null})
        }
        return
      })
      .then(vendors => {
        if (vendors && vendors.length > 0) {
          // console.log('THIS VENDOR', vendor)
          return resProduct.setVendors(_.map(vendors, v => v.id), {transaction: options.transaction || null})
        }
        return
      })
      .then(vendors => {
        return Promise.all(images.map(image => {
          // image.product_id = resProduct.id
          if (typeof image.variant !== 'undefined') {
            image.product_variant_id = resProduct.variants[image.variant].id
            delete image.variant
          }
          return resProduct.createImage(image, {transaction: options.transaction || null})
        }))
      })
      .then(createdImages => {
        // Reload
        // console.log(resProduct)
        // return resProduct
        return Product.findByIdDefault(resProduct.id, {transaction: options.transaction || null})
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
    return this.app.orm.Product.sequelize.transaction(t => {
      return Promise.all(products.map(product => {
        return this.updateProduct(product, {
          transaction: t
        })
      }))
    })
  }

  /**
   *
   * @param product
   * @returns {Promise}
   */
  // TODO Create/Update Images and Variant Images in one command
  updateProduct(product, options) {
    const Product = this.app.orm.Product
    const Variant = this.app.orm.ProductVariant
    const Image = this.app.orm.ProductImage
    const Tag = this.app.orm.Tag
    const Collection = this.app.orm.Collection
    const Vendor = this.app.orm.Vendor
    // const Shop = this.app.orm.Shop
    // const Metadata = this.app.orm.Metadata
    if (!options) {
      options = {}
    }
    // let newTags = []
    // return Product.sequelize.transaction(t => {
    let resProduct = {}
    // Create an empty product options array
    const productOptions = []
    if (!product.id) {
      throw new Errors.FoundError(Error('Product is missing id'))
    }
    return Product.findByIdDefault(product.id, {
      transaction: options.transaction || null
    })
      .then(foundProduct => {
        resProduct = foundProduct

        const update = {
          host: product.host || resProduct.host,
          handle: product.handle || resProduct.handle,
          body: product.body || resProduct.body,
          type: product.type || resProduct.type,
          published_scope: product.published_scope || resProduct.published_scope,
          weight: product.weight || resProduct.weight,
          weight_unit: product.weight_unit || resProduct.weight_unit,
          requires_shipping: product.requires_shipping || resProduct.requires_shipping,
          tax_code: product.tax_code || resProduct.tax_code,
          options: productOptions
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
        resProduct.variants = _.sortBy(_.concat(resProduct.variants, product.variants), 'position')
        // Set the Positions
        _.each(resProduct.variants, (variant, index) => {
          variant.position = index + 1
        })

        _.each(resProduct.variants, variant => {
          if (variant.option) {
            const keys = Object.keys(variant.option)
            resProduct.options = _.union(resProduct.options, keys)
          }
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
        return resProduct.updateAttributes(update, {transaction: options.transaction || null})
      })
      .then(updateProduct => {
        // Transform any new Tags
        if (product.tags && product.tags.length > 0) {
          product.tags = _.sortedUniq(product.tags.filter(n => n))
          // console.log('THIS PRODUCT TAGS NOW', product.tags)
          return Tag.transformTags(product.tags, {transaction: options.transaction || null})
        }
        return
      })
      .then(tags => {
        // Set Tags
        if (tags && tags.length > 0) {
          return resProduct.setTags(_.map(tags, t  => t.id), {transaction: options.transaction || null})
        }
        return
      })
      .then(productTags => {
        if (product.collections && product.collections.length > 0) {
          // Resolve the collections
          product.collections = _.sortedUniq(product.collections.filter(n => n))
          return Collection.transformCollections(product.collections, {transaction: options.transaction || null})
        }
        return
      })
      .then(collections => {
        // console.log('THESE COLLECTIONS', collections)
        if (collections && collections.length > 0) {
          return resProduct.setCollections(_.map(collections, c => c.id), {transaction: options.transaction || null})
        }
        return
      })
      .then(collections => {
        // save the metadata
        return resProduct.metadata.save({ transaction: options.transaction || null })
      })
      .then(metadata => {
        if (product.vendors && product.vendors.length > 0) {
          return Vendor.transformVendors(product.vendors, {transaction: options.transaction || null})
        }
        return
      })
      .then(vendors => {
        if (vendors && vendors.length > 0) {
          return resProduct.setVendors(_.map(vendors, v => v.id), { transaction: options.transaction || null })
        }
        return
      })
      .then(vendors => {
        return Promise.all(resProduct.variants.map(variant => {
          // gather options
          if (variant.option) {
            if (!_.some(productOptions, option => variant.option.name)) {
              productOptions.push(variant.option.name)
            }
          }

          if (variant.id) {
            return variant.save({ transaction: options.transaction || null })
          }
          else {
            return resProduct.createVariant(variant, {
              transaction: options.transaction || null
            })
          }
        }))
      })
      .then(variants => {
        // console.log('THESE VARIANTS', variants)
        // return Product.findByIdDefault(resProduct.id)
        return Promise.all(resProduct.images.map(image => {
          if (typeof image.variant !== 'undefined') {
            image.product_variant_id = resProduct.variants[image.variant].id
            delete image.variant
          }
          if (image.id) {
            return image.save({ transaction: options.transaction || null })
          }
          else {
            return resProduct.createImage(image, {
              transaction: options.transaction || null
            })
          }
        }))
      })
      .then(images => {
        return Product.findByIdDefault(resProduct.id, {
          transaction: options.transaction || null
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
  removeProduct(product, options) {
    if (!options) {
      options = {}
    }
    if (!product.id) {
      const err = new Errors.FoundError(Error('Product is missing id'))
      return Promise.reject(err)
    }
    const Product = this.app.orm.Product
    return Product.destroy({
      where: {
        id: product.id
      },
      transaction: options.transaction || null
    })
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
   * @param product
   * @param variant
   * @param options
   */
  // TODO
  createVariant(product, variant, options) {
    let resProduct, resVariant
    return this.resolve(product)
      .then(product => {
        resProduct = product
        return resProduct.createVariant(variant)
        // return this.resolveVariant(variant, options)
      })
      .then(variant => {
        resVariant = variant
        return resVariant
      })
  }
  createVariants(product, variants, options) {
    return Promise.all(variants.map(variant => {
      return this.createVariant(product, variant, options)
    }))
  }

  /**
   *
   * @param product
   * @param variant
   * @param options
   */
  updateVariant(product, variant, options) {
    // let resProduct,
    let resVariant
    return this.resolve(product)
      .then(product => {
        // resProduct = product
        return this.resolveVariant(variant, options)
      })
      .then(variant => {
        resVariant = variant
        return resVariant
      })
  }
  updateVariants(product, variants, options) {
    return Promise.all(variants.map(variant => {
      return this.updateVariant(product, variant, options)
    }))
  }
  /**
   *
   * @param id
   */
  removeVariant(id, options){
    const Variant = this.app.orm.ProductVariant
    if (!options) {
      options = {}
    }
    let destroy
    let updates
    return Variant.findById(id, {
      transaction: options.transaction || null
    })
      .then(foundVariant => {
        destroy = foundVariant
        return Variant.findAll({
          where: {
            product_id: destroy.product_id
          },
          transaction: options.transaction || null
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
          return variant.save({
            transaction: options.transaction || null
          })
        }))
      })
      .then(updatedVariants => {
        return Variant.destroy({
          where: {
            id: id
          },
          transaction: options.transaction || null
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
  removeImage(id, options){
    const Image = this.app.orm.ProductImage
    let destroy
    let updates

    if (!options) {
      options = {}
    }

    return Image.findById(id,{
      transaction: options.transaction || null
    })
      .then(foundImage => {
        destroy = foundImage
        return Image.findAll({
          where: {
            product_id: destroy.product_id
          },
          transaction: options.transaction || null
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
          return image.save({
            transaction: options.transaction || null
          })
          // return FootprintService.update('ProductImage',image.id, { position: image.position })
        }))
      })
      .then(updatedImages => {
        return Image.destroy({
          where: {
            id: id
          },
          transaction: options.transaction || null
        })
      })
  }

  /**
   *
   * @param product
   * @param tag
   * @returns {Promise.<TResult>}
   */
  addTag(product, tag){
    let resProduct, resTag
    return this.resolve(product)
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = product
        return this.app.services.TagService.resolve(tag)
      })
      .then(tag => {
        if (!tag) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resTag = tag
        return resProduct.hasTag(resTag.id)
      })
      .then(hasTag => {
        if (!hasTag) {
          return resProduct.addTag(resTag.id)
        }
        return resProduct
      })
      .then(tag => {
        return this.app.orm['Product'].findByIdDefault(resProduct.id)
      })
  }

  /**
   *
   * @param product
   * @param tag
   * @returns {Promise.<TResult>}
   */
  removeTag(product, tag){
    let resProduct, resTag
    return this.resolve(product)
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = product
        return this.app.services.TagService.resolve(tag)
      })
      .then(tag => {
        if (!tag) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resTag = tag
        return resProduct.hasTag(resTag.id)
      })
      .then(hasTag => {
        if (hasTag) {
          return resProduct.removeTag(resTag.id)
        }
        return resProduct
      })
      .then(tag => {
        return this.app.orm['Product'].findByIdDefault(resProduct.id)
      })
  }

  /**
   *
   * @param product
   * @param association
   * @returns {Promise.<TResult>}
   */
  addAssociation(product, association){
    let resProduct, resAssociation
    return this.resolve(product)
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = product
        return this.resolve(association)
      })
      .then(association => {
        if (!association) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resAssociation = association
        return resProduct.hasAssociation(resAssociation.id)
      })
      .then(hasAssociation => {
        if (!hasAssociation) {
          return resProduct.addAssociation(resAssociation.id)
        }
        return resProduct
      })
      .then(association => {
        return this.app.orm['Product'].findByIdDefault(resProduct.id)
      })
  }

  /**
   *
   * @param product
   * @param association
   * @returns {Promise.<TResult>}
   */
  removeAssociation(product, association){
    let resProduct, resAssociation
    return this.resolve(product)
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = product
        return this.resolve(association)
      })
      .then(association => {
        if (!association) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resAssociation = association
        return resProduct.hasAssociation(resAssociation.id)
      })
      .then(hasAssociation => {
        if (hasAssociation) {
          return resProduct.removeAssociation(resAssociation.id)
        }
        return resProduct
      })
      .then(association => {
        return this.app.orm['Product'].findByIdDefault(resProduct.id)
      })
  }

  /**
   *
   * @param product
   * @param collection
   * @returns {Promise.<TResult>}
   */
  addCollection(product, collection){
    let resProduct, resCollection
    return this.resolve(product)
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = product
        return this.app.services.CollectionService.resolve(collection)
      })
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resCollection = collection
        return resProduct.hasCollection(resCollection.id)
      })
      .then(hasCollection => {
        if (!hasCollection) {
          return resProduct.addCollection(resCollection.id)
        }
        return resProduct
      })
      .then(collection => {
        return this.app.orm['Product'].findByIdDefault(resProduct.id)
      })
  }

  /**
   *
   * @param product
   * @param collection
   * @returns {Promise.<TResult>}
   */
  removeCollection(product, collection){
    let resProduct, resCollection
    return this.resolve(product)
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = product
        return this.app.services.CollectionService.resolve(collection)
      })
      .then(collection => {
        if (!collection) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resCollection = collection
        return resProduct.hasCollection(resCollection.id)
      })
      .then(hasCollection => {
        if (hasCollection) {
          return resProduct.removeCollection(resCollection.id)
        }
        return resProduct
      })
      .then(collection => {
        return this.app.orm['Product'].findByIdDefault(resProduct.id)
      })
  }

  /**
   *
   * @param product
   * @param shop
   * @returns {Promise.<TResult>}
   */
  addShop(product, shop){
    let resProduct, resShop
    return this.resolve(product)
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = product
        return this.app.services.ShopService.resolve(shop)
      })
      .then(shop => {
        if (!shop) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resShop = shop
        return resProduct.hasShop(resShop.id)
      })
      .then(hasShop => {
        if (!hasShop) {
          return resProduct.addShop(resShop.id)
        }
        return resProduct
      })
      .then(shop => {
        return this.app.orm['Product'].findByIdDefault(resProduct.id)
      })
  }

  /**
   *
   * @param product
   * @param shop
   * @returns {Promise.<TResult>}
   */
  removeShop(product, shop){
    let resProduct, resShop
    return this.resolve(product)
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = product
        return this.app.services.ShopService.resolve(shop)
      })
      .then(shop => {
        if (!shop) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resShop = shop
        return resProduct.hasShop(resShop.id)
      })
      .then(hasShop => {
        if (hasShop) {
          return resProduct.removeShop(resShop.id)
        }
        return resProduct
      })
      .then(shop => {
        return this.app.orm['Product'].findByIdDefault(resProduct.id)
      })
  }

  /**
   *
   * @param product
   * @param vendor
   * @returns {Promise.<TResult>}
   */
  addVendor(product, vendor){
    let resProduct, resVendor
    return this.resolve(product)
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = product
        return this.app.services.VendorService.resolve(vendor)
      })
      .then(vendor => {
        if (!vendor) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resVendor = vendor
        return resProduct.hasVendor(resVendor.id)
      })
      .then(hasVendor => {
        if (!hasVendor) {
          return resProduct.addVendor(resVendor.id)
        }
        return resProduct
      })
      .then(vendor => {
        return this.app.orm['Product'].findByIdDefault(resProduct.id)
      })
  }

  /**
   *
   * @param product
   * @param vendor
   * @returns {Promise.<TResult>}
   */
  removeVendor(product, vendor){
    let resProduct, resVendor
    return this.resolve(product)
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = product
        return this.app.services.VendorService.resolve(vendor)
      })
      .then(vendor => {
        if (!vendor) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resVendor = vendor
        return resProduct.hasVendor(resVendor.id)
      })
      .then(hasVendor => {
        if (hasVendor) {
          return resProduct.removeVendor(resVendor.id)
        }
        return resProduct
      })
      .then(vendor => {
        return this.app.orm['Product'].findByIdDefault(resProduct.id)
      })
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
    if (variant.price  && !variant.compare_at_price) {
      variant.compare_at_price = variant.price
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
    if (product.requires_subscription && !variant.requires_subscription) {
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
    // If the inventory_policy set on parent
    if (product.inventory_policy && !variant.inventory_policy) {
      variant.inventory_policy = product.inventory_policy
    }
    // If the max_quantity set on parent
    if (product.max_quantity && !variant.max_quantity) {
      variant.max_quantity = product.max_quantity
    }
    // Inherit the product type
    if (product.type && !variant.type) {
      variant.type = product.type
    }
    // If the max_quantity set on parent
    if (product.tax_code && !variant.tax_code) {
      variant.tax_code = product.tax_code
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

