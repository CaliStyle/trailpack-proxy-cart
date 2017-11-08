/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
const PRODUCT_DEFAULTS = require('../../lib').Enums.PRODUCT_DEFAULTS
const VARIANT_DEFAULTS = require('../../lib').Enums.VARIANT_DEFAULTS
const fs = require('fs')

/**
 * @module ProductService
 * @description Product Service
 */
module.exports = class ProductService extends Service {
  /**
   *
   * @param item
   * @param options
   * @returns {*}
   */
  resolveItem(item, options){
    options = options || {}
    const Product = this.app.orm.Product
    const ProductVariant = this.app.orm.ProductVariant
    const Image = this.app.orm.ProductImage

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
   * @param options
   * @returns {Promise.<*>}
   */
  addProducts(products, options) {
    options = options || {}
    if (!Array.isArray(products)) {
      products = [products]
    }
    const Sequelize = this.app.orm['Product'].sequelize
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
   * @param options
   * @returns {Promise}
   */
  addProduct(product, options) {
    options = options || {}
    const Product = this.app.orm.Product

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
   * @param options
   * @returns {Promise}
   */
  // TODO Create Images and Variant Images in one command
  createProduct(product, options){
    options = options || {}
    const Product = this.app.orm.Product
    const Tag = this.app.orm.Tag
    const Variant = this.app.orm.ProductVariant
    // const Image = this.app.orm.ProductImage
    const Metadata = this.app.orm.Metadata
    const Collection = this.app.orm.Collection
    const Vendor = this.app.orm.Vendor
    const Shop = this.app.orm.Shop

    if (!product) {
      const err = new Error('A product is required')
      return Promise.reject(err)
    }

    product = this.productDefaults(product)
    // The Default Product
    const create = {
      host: product.host,
      handle: product.handle,
      title: product.title,
      seo_title: product.seo_title,
      seo_description: product.seo_description,
      body: product.body,
      type: product.type,
      price: product.price,
      compare_at_price: product.compare_at_price,
      calculated_price: product.calculated_price,
      tax_code: product.tax_code,
      published: product.published,
      published_scope: product.published_scope,
      weight: product.weight,
      weight_unit: product.weight_unit,
      average_shipping: product.average_shipping,
      pricing_properties: product.pricing_properties,
      exclude_payment_types: product.exclude_payment_types,
      metadata: Metadata.transform(product.metadata || {}),
      google: product.google,
      amazon: product.amazon,
      options: product.options
    }
    // create = Product.build(create)

    if (product.published === true) {
      create.published_at = new Date()
    }
    if (product.published === false) {
      create.unpublished_at = new Date()
    }
    if (product.published_scope) {
      create.published_scope = product.published_scope
    }
    if (product.seo_title) {
      create.seo_title = product.seo_title
    }
    if (!product.seo_title && product.title) {
      create.seo_title = product.title
    }
    if (product.seo_description) {
      create.seo_description = this.app.services.ProxyCartService.description(product.seo_description)
    }
    if (!product.seo_description && product.body) {
      create.seo_description = this.app.services.ProxyCartService.description(product.body)
    }
    // Images
    let images = []
    // If this request came with product images
    if (product.images.length > 0) {
      product.images = product.images.map(image => {
        image.variant = 0
        return image
      })
      images = images.concat(product.images)
      delete product.images
    }

    // Variants
    // Set a default variant based of off product
    let variants = [{
      title: product.title,
      sku: product.sku,
      vendors: product.vendors,
      google: product.google,
      amazon: product.amazon
    }]
    // Set the published status
    if (product.published === true) {
      variants[0].published_at = create.published_at
    }
    if (product.published === false) {
      variants[0].unpublished_at = create.unpublished_at
    }
    // If this is not a true variant because it is missing a sku (which is required), let's remove it.
    if (!variants[0].sku) {
      variants.splice(0,1)
    }
    // Add variants to the default
    if (product.variants.length > 0) {
      variants = variants.concat(product.variants)
    }
    // For every variant, map missing defaults and images
    variants = variants.map((variant, index) => {
      // Set defaults from product to variant
      variant = this.variantDefaults(variant, product)
      // Map Variant Positions putting default at 1
      variant.position = index + 1
      // If this variant is not explicitly not published set to status of parent
      if (product.published && variant.published !== false) {
        variant.published = true
      }
      // If this variant is published then set published_at to same as parent
      if (variant.published) {
        variant.published_at = create.published_at
      }
      // Handle Variant Images
      if (variant.images.length > 0) {
        variant.images = variant.images.map(image => {
          image.variant = index
          return image
        })
        images = images.concat(variant.images)
        delete variant.images
      }
      if (variant.option) {
        const keys = Object.keys(variant.option)
        create.options = _.union(create.options, keys)
      }
      return variant
    })
    // Filter out undefined
    variants = variants.filter(variant => variant)

    // Assign the variants to the create model
    create.total_variants = variants.length
    create.variants = variants

    // Map image positions
    images = images.map((image, index) => {
      image.position = index + 1
      return image
    })

    // Set the resulting Product
    let resProduct
    return Product.create(create, {
      include: [
        {
          model: Variant,
          as: 'variants',
          include: [
            {
              model: Metadata,
              as: 'metadata'
            }
          ]
        },
        {
          model: Metadata,
          as: 'metadata',
        }
      ],
      transaction: options.transaction || null
    })
      .then(createdProduct => {
        if (!createdProduct) {
          throw new Error('Product was not created')
        }
        resProduct = createdProduct
        // console.log('createdProduct',createdProduct)
        if (product.tags && product.tags.length > 0) {
          product.tags = _.sortedUniq(product.tags.filter(n => n))
          return Tag.transformTags(product.tags, {transaction: options.transaction || null})
        }
        return
      })
      .then(tags => {
        if (tags && tags.length > 0) {
          // Add Tags
          return resProduct.setTags(tags.map(tag => tag.id), {transaction: options.transaction || null})
        }
        return
      })
      .then(productTags => {
        if (product.shops && product.shops.length > 0) {
          product.shops = _.sortedUniq(product.shops.filter(n => n))
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
        if (product.collections && product.collections.length > 0) {
          // Resolve the collections
          product.collections = _.sortedUniq(product.collections.filter(n => n))
          return Collection.transformCollections(product.collections, {transaction: options.transaction || null})
        }
        return
      })
      .then(collections => {
        if (collections && collections.length > 0) {
          return resProduct.setCollections(collections.map(c => c.id), {transaction: options.transaction || null})
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
          // TODO add vendor_price, policies
          return resProduct.setVendors(vendors.map(v => v.id), {
            through: { vendor_price: resProduct.price },
            transaction: options.transaction || null
          })
        }
        return
      })
      .then(vendors => {
        return Product.sequelize.Promise.mapSeries(images, image => {
          // If variant index, set the variant image
          if (typeof image.variant !== 'undefined') {
            if (resProduct.variants && resProduct.variants[image.variant] && resProduct.variants[image.variant].id) {
              image.product_variant_id = resProduct.variants[image.variant].id
            }
            delete image.variant
          }
          return resProduct.createImage(image, {transaction: options.transaction || null})
        })
      })
      .then(createdImages => {
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
    const Product = this.app.orm.Product
    return Product.sequelize.transaction(t => {
      return Product.sequelize.Promise.mapSeries(products, product => {
        return this.updateProduct(product, {
          transaction: t
        })
      })
    })
  }

  /**
   *
   * @param product
   * @param options
   * @returns {Promise}
   */
  // TODO Create/Update Images and Variant Images in one command
  updateProduct(product, options) {
    options = options || {}
    const Product = this.app.orm['Product']
    const Variant = this.app.orm['ProductVariant']
    const Image = this.app.orm['ProductImage']
    const Tag = this.app.orm['Tag']
    const Collection = this.app.orm['Collection']
    const Vendor = this.app.orm['Vendor']
    // const Metadata = this.app.orm['Metadata']

    const productOptions = []
    if (!product.id) {
      throw new Errors.FoundError(Error('Product is missing id'))
    }

    let resProduct = {}
    return Product.findByIdDefault(product.id, {
      transaction: options.transaction || null
    })
      .then(_product => {
        if (!_product){
          throw new Error('Product not found')
        }
        resProduct = _product

        const update = {
          host: product.host || resProduct.host,
          handle: product.handle || resProduct.handle,
          seo_title: product.seo_title || resProduct.seo_title,
          seo_description: product.seo_description || resProduct.seo_description,
          body: product.body || resProduct.body,
          type: product.type || resProduct.type,
          published_scope: product.published_scope || resProduct.published_scope,
          average_shipping: product.average_shipping,
          pricing_properties: product.pricing_properties,
          exclude_payment_types: product.exclude_payment_types,
          weight: product.weight || resProduct.weight,
          weight_unit: product.weight_unit || resProduct.weight_unit,
          requires_shipping: product.requires_shipping || resProduct.requires_shipping,
          tax_code: product.tax_code || resProduct.tax_code,
          options: productOptions
        }

        // force array of variants
        product.variants = product.variants || []
        // force array of variants
        product.images = product.images || []
        // force array of variants
        product.tags = product.tags || []
        // force array of variants
        product.collections = product.collections || []
        // force array of variants
        product.associations = product.associations || []

        // If product is getting published
        if (product.published === true && resProduct.published === false) {
          resProduct.published = resProduct.variants[0].published = product.published
          resProduct.published_at = resProduct.variants[0].published_at = new Date()
        }
        // If product is getting unpublished
        if (product.published === false && resProduct.published === true) {
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
        // Update seo_title if provided, else update it if a new product title
        if (product.seo_title) {
          resProduct.seo_title = product.seo_title //.substring(0,255)
        }
        // Update product_seo title
        if (product.title && !product.seo_title) {
          resProduct.seo_title = product.title //.substring(0,255)
        }
        // Update seo_description if provided, else update it if a new product body
        if (product.seo_description) {
          resProduct.seo_description = this.app.services.ProxyCartService.description(product.seo_description)
        }
        // Update seo_description
        if (!product.seo_description && product.body) {
          resProduct.seo_description = this.app.services.ProxyCartService.description(product.body)
        }

        // Update Existing Variant
        resProduct.variants = resProduct.variants.map(variant => {
          // Find the existing variant
          const variantToUpdate = _.find(product.variants, { id: variant.id })
          // Add new Images
          if (variantToUpdate && variantToUpdate.images) {
            let newImages = variantToUpdate.images.filter(image => !image.id)
            // let oldImages = variantToUpdate.images.filter(image => image.id)
            newImages = newImages.map(image => {
              image.product_id = resProduct.id
              image.product_variant_id = variant.id
              return Image.build(image)
            })
            resProduct.images = _.concat(resProduct.images, newImages)
          }
          return _.extend(variant, variantToUpdate)
        })

        // Create a List of new Variants
        product.variants = product.variants.filter(variant => !variant.id)
        // Build the new Variants
        product.variants = product.variants.map((variant) => {
          // Set the product id of the variant
          variant.product_id = resProduct.id
          // Set the defaults
          variant = this.variantDefaults(variant, resProduct.get({plain: true}))

          if (variant.images.length > 0) {
            // Update the master image if new/updated attributes are defined
            resProduct.images = resProduct.images.map(image => {
              return _.extend(image, _.find(variant.images, { id: image.id }))
            })

            // Create a list of new variant images
            variant.images = variant.images.filter(image => !image.id)
            // build the new images
            variant.images = variant.images.map( image => {
              // image.variant = index
              image.product_id = resProduct.id
              return Image.build(image)
            })

            // Add these variant images to the new array.
            resProduct.images = _.concat(resProduct.images, variant.images)
            // delete variant.images
          }
          return Variant.build(variant)
        })

        // Join all the variants and sort by current positions
        resProduct.variants = _.sortBy(_.concat(resProduct.variants, product.variants), 'position')

        // Set the new Positions
        resProduct.variants = resProduct.variants.map((variant, index) => {
          variant.position = index + 1
          return variant
        })
        // Calculate new total of variants
        resProduct.total_variants = resProduct.variants.length

        // Set the new product options
        resProduct.variants.forEach(variant => {
          if (variant.option) {
            const keys = Object.keys(variant.option)
            resProduct.options = _.union(resProduct.options, keys)
          }
        })

        // Update existing Images
        resProduct.images = resProduct.images.map(image => {
          return _.extend(image, _.find(product.images, { id: image.id }))
        })

        // Create a List of new Images
        product.images = product.images.filter(image => !image.id)
        product.images = product.images.map(image => {
          image.product_id = resProduct.id
          return Image.build(image)
        })

        // Join all the images
        resProduct.images = _.sortBy(_.concat(resProduct.images, product.images), 'position')
        // Set the Positions
        resProduct.images = resProduct.images.map((image, index) => {
          image.position = index + 1
          return image
        })

        // Update changed attributes
        return resProduct.updateAttributes(update, {transaction: options.transaction || null})
      })
      .then(updateProduct => {
        // Transform any new Tags
        if (product.tags && product.tags.length > 0) {
          product.tags = _.sortedUniq(product.tags.filter(n => n))
          return Tag.transformTags(product.tags, {transaction: options.transaction || null})
        }
        return
      })
      .then(tags => {
        // Set Tags
        if (tags && tags.length > 0) {
          return resProduct.setTags(tags.map(t => t.id), {transaction: options.transaction || null})
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
        // Set the collections
        if (collections && collections.length > 0) {
          return resProduct.setCollections(collections.map(c => c.id), {transaction: options.transaction || null})
        }
        return
      })
      .then(collections => {
        // Resolve the metadata in case this is missing it
        return resProduct.resolveMetadata({transaction: options.transaction || null})
      })
      .then(() => {
        // if product metadata.
        if (product.metadata && _.isObject(product.metadata)) {
          resProduct.metadata.data = product.metadata || {}
          // save the metadata
          return resProduct.metadata.save({ transaction: options.transaction || null })
        }
        return
      })
      .then(metadata => {
        if (product.vendors && product.vendors.length > 0) {
          return Vendor.transformVendors(product.vendors, {transaction: options.transaction || null})
        }
        return
      })
      .then(vendors => {
        if (vendors && vendors.length > 0) {
          return resProduct.setVendors(vendors.map(v => v.id), { transaction: options.transaction || null })
        }
        return
      })
      .then(vendors => {
        return Product.sequelize.Promise.mapSeries(resProduct.variants, variant => {
          if (variant instanceof Variant) {
            return variant.save({
              transaction: options.transaction || null
            })
          }
          else {
            return resProduct.createVariant(variant, {
              transaction: options.transaction || null
            })
          }
        })
      })
      .then(variants => {
        return Product.sequelize.Promise.mapSeries(resProduct.images, image => {
          if (typeof image.variant !== 'undefined') {
            image.product_variant_id = resProduct.variants[image.variant].id
            delete image.variant
          }
          if (image instanceof Image) {
            return image.save({ transaction: options.transaction || null })
          }
          else {
            return resProduct.createImage(image, {
              transaction: options.transaction || null
            })
          }
        })
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
    const Product = this.app.orm['Product']
    return Product.sequelize.Promise.mapSeries(products, product => {
      return this.removeProduct(product)
    })
  }

  /**
   *
   * @param product
   * @param options
   */
  removeProduct(product, options) {
    options = options || {}
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
    const Product = this.app.orm['Product']
    return Product.sequelize.Promise.mapSeries(variants, variant => {
      return this.removeVariant(variant)
    })
  }

  /**
   *
   * @param product
   * @param variant
   * @param options
   */
  // TODO upload images
  createVariant(product, variant, options) {
    options = options || {}
    const Product = this.app.orm['Product']
    const Variant = this.app.orm['ProductVariant']
    let resProduct, resVariant, productOptions = []
    return Product.resolve(product, {transaction: options.transaction || null})
      .then(_product => {
        if (!_product) {
          throw new Errors.FoundError(Error('Could not find Product'))
        }
        resProduct = _product

        variant.product_id = resProduct.id
        variant = this.variantDefaults(variant, resProduct)

        return resProduct.createVariant(variant, {transaction: options.transaction || null})
        // return this.resolveVariant(variant, options)
      })
      .then(variant => {
        resVariant = variant

        return Variant.findAll({
          where: {
            product_id: resProduct.id
          },
          transaction: options.transaction || null
        })
      })
      .then(variants => {
        const updates = _.sortBy(variants, 'position')
        _.map(updates, (variant, index) => {
          variant.position = index + 1
        })
        _.map(updates, variant => {
          const keys = Object.keys(variant.option)
          productOptions = _.union(productOptions, keys)
        })
        return Product.sequelize.Promise.mapSeries(updates, variant => {
          return variant.save({
            transaction: options.transaction || null
          })
        })
      })
      .then(updatedVariants => {
        resProduct.options = product.options
        resProduct.total_variants = updatedVariants.length
        return resProduct.save({transaction: options.transaction || null})
      })
      .then(updatedProduct => {
        return Variant.findByIdDefault(resVariant.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param product
   * @param variants
   * @param options
   * @returns {Promise.<*>}
   */
  createVariants(product, variants, options) {
    const Product = this.app.orm['Product']
    return Product.sequelize.Promise.mapSeries(variants, variant => {
      return this.createVariant(product, variant, options)
    })
  }

  /**
   *
   * @param product
   * @param variant
   * @param options
   */
  // TODO upload images
  updateVariant(product, variant, options) {
    options = options || {}
    const Product = this.app.orm['Product']
    const Variant = this.app.orm['ProductVariant']
    let  resProduct, resVariant, productOptions = []
    return Product.resolve(product, {transaction: options.transaction || null})
      .then(_product => {
        if (!_product) {
          throw new Error('Product did not resolve')
        }
        resProduct = _product
        return Variant.resolve(variant, options)
      })
      .then(foundVariant => {
        resVariant = foundVariant
        resVariant = _.extend(resVariant, _.omit(variant, ['id','sku']))
        resVariant = this.variantDefaults(resVariant, resProduct)
        return resVariant.save({transaction: options.transaction || null})
      })
      .then(variant => {
        return Variant.findAll({
          where: {
            product_id: resProduct.id
          },
          transaction: options.transaction || null
        })
      })
      .then(variants => {
        const updates = _.sortBy(variants, 'position')
        _.map(updates, (variant, index) => {
          variant.position = index + 1
        })
        _.map(updates, variant => {
          const keys = Object.keys(variant.option)
          productOptions = _.union(productOptions, keys)
        })
        return Product.sequelize.Promise.mapSeries(updates, variant => {
          return variant.save({transaction: options.transaction || null})
        })
      })
      .then(updatedVariants => {
        resProduct.options = product.options
        return resProduct.save({transaction: options.transaction || null})
      })
      .then(updatedProduct => {
        return Variant.findByIdDefault(resVariant.id, {transaction: options.transaction || null})
      })

  }
  updateVariants(product, variants, options) {
    const Product = this.app.orm['Product']
    return Product.sequelize.Promise.mapSeries(variants, variant => {
      return this.updateVariant(product, variant, options)
    })
  }
  /**
   *
   * @param id
   */
  removeVariant(id, options){
    options = options || {}
    const Product = this.app.orm['Product']
    const Variant = this.app.orm.ProductVariant
    let resVariant, resProduct
    let updates
    let productOptions = []
    return Variant.resolve(id, {transaction: options.transaction || null})
      .then(foundVariant => {
        resVariant = foundVariant
        return Product.resolve(resVariant.product_id, {transaction: options.transaction || null})
      })
      .then(product => {
        resProduct = product
        return Variant.findAll({
          where: {
            product_id: resVariant.product_id
          },
          transaction: options.transaction || null
        })
      })
      .then(foundVariants => {
        updates = _.sortBy(_.filter(foundVariants, variant => {
          if (variant.id !== resVariant.id){
            return variant
          }
        }), 'position')
        _.map(updates, (variant, index) => {
          variant.position = index + 1
        })
        _.map(updates, variant => {
          const keys = Object.keys(variant.option)
          productOptions = _.union(productOptions, keys)
        })
        return Variant.sequelize.Promise.mapSeries(updates, variant => {
          return variant.save({transaction: options.transaction || null})
        })
      })
      .then(updatedVariants => {
        resProduct.options = productOptions
        resProduct.total_variants = updatedVariants.length
        return resProduct.save({transaction: options.transaction || null})
      })
      .then(updatedProduct => {
        return resVariant.destroy({transaction: options.transaction || null})
      })
      .then(destroyed => {
        return resVariant
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
    const Product = this.app.orm['Product']
    return Product.sequelize.Promise.mapSeries(images, image => {
      const id = typeof image.id !== 'undefined' ? image.id : image
      return this.removeImage(id)
    })
  }

  /**
   *
   * @param id
   * @param options
   */
  removeImage(id, options){
    options = options || {}
    const Image = this.app.orm['ProductImage']
    const Product = this.app.orm['Product']

    let resDestroy
    return Image.findById(id,{
      transaction: options.transaction || null
    })
      .then(foundImage => {
        if (!foundImage) {
          // TODO proper error
          throw new Error('Image not found')
        }
        resDestroy = foundImage

        return Image.findAll({
          where: {
            product_id: resDestroy.product_id
          },
          order: [['position','ASC']],
          transaction: options.transaction || null
        })
      })
      .then(foundImages => {
        foundImages = foundImages.filter(image => image.id !== id)
        foundImages = foundImages.map((image, index) => {
          image.position = index + 1
          return image
        })
        return Image.sequelize.Promise.mapSeries(foundImages, image => {
          return image.save({
            transaction: options.transaction || null
          })
        })
      })
      .then(updatedImages => {
        return resDestroy.destroy({
          transaction: options.transaction || null
        })
      })
      .then(() => {
        return Product.findByIdDefault(resDestroy.product_id ,{transaction: options.transaction || null})
      })
  }

  /**
   * @param product
   * @param variant
   * @param image
   * @param options
   */
  // TODO
  addImage(product, variant, image, options){
    options = options || {}
    const Image = this.app.orm['ProductImage']
    const Product = this.app.orm['Product']
    const Variant = this.app.orm['Variant']
    let resProduct, resImage, resVariant
    return Product.resolve(product, {transaction: options.transaction || null})
      .then(foundProduct => {
        if (!foundProduct) {
          throw new Error('Product could not be resolved')
        }
        resProduct = foundProduct
        if (variant) {
          return Variant.resolve(variant, {transaction: options.transaction || null})
        }
        else {
          return null
        }
      })
      .then(foundVariant => {
        resVariant = foundVariant ? foundVariant.id : null

        return resProduct.createImage({
          product_variant_id: resVariant,
          src: image,
          position: options.position || null,
          alt: options.alt || null
        }, {
          transaction: options.transaction
        })
      })
      .then(createdImage => {
        if (!createdImage) {
          throw new Error('Image Could not be created')
        }
        resImage = createdImage
        return Image.findAll({
          where: {
            product_id: resProduct.id
          },
          order: [['position','ASC']],
          transaction: options.transaction || null
        })
      })
      .then(foundImages => {
        foundImages = foundImages.map((image, index) => {
          image.position = index + 1
          return image
        })
        return Image.sequelize.Promise.mapSeries(foundImages, image => {
          return image.save({
            transaction: options.transaction || null
          })
        })
      })
      .then(updatedImages => {
        return resImage.reload()
      })
  }

  createImage(product, variant, filePath, options) {
    options = options || {}
    const image = fs.readFileSync(filePath)
    const Image = this.app.orm['ProductImage']
    const Product = this.app.orm['Product']
    const Variant = this.app.orm['ProductVariant']
    let resProduct, resImage, resVariant
    return Product.resolve(product, {transaction: options.transaction || null})
      .then(_product => {
        if (!_product) {
          throw new Error('Product could not be resolved')
        }
        resProduct = _product
        if (variant) {
          return Variant.resolve(variant, {transaction: options.transaction || null})
        }
        else {
          return null
        }
      })
      .then(_variant => {
        resVariant = _variant ? _variant.id : null
        return this.app.services.ProxyCartService.uploadImage(image, filePath)
      })
      .then(uploadedImage => {
        return resProduct.createImage({
          product_variant_id: resVariant,
          src: uploadedImage.url,
          position: options.position || null,
          alt: options.alt || null
        }, {
          transaction: options.transaction
        })
      })
      .then(createdImage => {
        if (!createdImage) {
          throw new Error('Image Could not be created')
        }
        resImage = createdImage
        return Image.findAll({
          where: {
            product_id: resProduct.id
          },
          order: [['position','ASC']],
          transaction: options.transaction || null
        })
      })
      .then(foundImages => {
        foundImages = foundImages.map((image, index) => {
          image.position = index + 1
          return image
        })
        return Image.sequelize.Promise.mapSeries(foundImages, image => {
          return image.save({
            transaction: options.transaction || null
          })
        })
      })
      .then(updatedImages => {
        return resImage.reload()
      })
  }
  /**
   *
   * @param product
   * @param tag
   * @param options
   * @returns {Promise.<T>}
   */
  addTag(product, tag, options){
    options = options || {}
    const Product = this.app.orm['Product']
    const Tag = this.app.orm['Tag']
    let resProduct, resTag
    return Product.resolve(product, {transaction: options.transaction || null})
      .then(_product => {
        if (!_product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = _product
        return Tag.resolve(tag, {transaction: options.transaction || null})
      })
      .then(_tag => {
        if (!_tag) {
          throw new Errors.FoundError(Error('Tag not found'))
        }
        resTag = _tag
        return resProduct.hasTag(resTag.id, {transaction: options.transaction || null})
      })
      .then(hasTag => {
        if (!hasTag) {
          return resProduct.addTag(resTag.id, {transaction: options.transaction || null})
        }
        return resProduct
      })
      .then(tag => {
        return Product.findByIdDefault(resProduct.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param product
   * @param tag
   * @param options
   * @returns {Promise.<T>}
   */
  removeTag(product, tag, options){
    options = options || {}
    const Product = this.app.orm['Product']
    const Tag = this.app.orm['Tag']
    let resProduct, resTag
    return Product.resolve(product, {transaction: options.transaction || null})
      .then(_product => {
        if (!_product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = _product
        return Tag.resolve(tag, {transaction: options.transaction || null})
      })
      .then(_tag => {
        if (!_tag) {
          throw new Errors.FoundError(Error('Tag not found'))
        }
        resTag = _tag
        return resProduct.hasTag(resTag.id, {transaction: options.transaction || null})
      })
      .then(hasTag => {
        if (hasTag) {
          return resProduct.removeTag(resTag.id, {transaction: options.transaction || null})
        }
        return false
      })
      .then(newTag => {
        return Product.findByIdDefault(resProduct.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param product
   * @param association
   * @param options
   * @returns {Promise.<T>}
   */
  addAssociation(product, association, options){
    options = options || {}
    const Product = this.app.orm['Product']
    let resProduct, resAssociation
    return Product.resolve(product, {transaction: options.transaction || null})
      .then(_product => {
        if (!_product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = _product
        return Product.resolve(association, {transaction: options.transaction || null})
      })
      .then(_association => {
        if (!_association) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resAssociation = _association
        return resProduct.hasAssociation(resAssociation.id, {transaction: options.transaction || null})
      })
      .then(hasAssociation => {
        if (!hasAssociation) {
          return resProduct.addAssociation(resAssociation.id, {transaction: options.transaction || null})
        }
        return false
      })
      .then(newAssociation => {
        return Product.findByIdDefault(resProduct.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param product
   * @param association
   * @param options
   * @returns {Promise.<T>}
   */
  removeAssociation(product, association, options){
    options = options || {}
    const Product = this.app.orm['Product']
    let resProduct, resAssociation
    return Product.resolve(product, {transaction: options.transaction || null})
      .then(_product => {
        if (!_product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = _product
        return Product.resolve(association, {transaction: options.transaction || null})
      })
      .then(_association => {
        if (!_association) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resAssociation = _association
        return resProduct.hasAssociation(resAssociation.id, {transaction: options.transaction || null})
      })
      .then(hasAssociation => {
        if (hasAssociation) {
          return resProduct.removeAssociation(resAssociation.id, {transaction: options.transaction || null})
        }
        return false
      })
      .then(removedAssociation => {
        return Product.findByIdDefault(resProduct.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param product
   * @param collection
   * @param options
   * @returns {Promise.<TResult>}
   */
  addCollection(product, collection, options){
    options = options || {}
    const Product = this.app.orm['Product']
    const Collection = this.app.orm['Collection']
    let resProduct, resCollection
    return Product.resolve(product, {transaction: options.transaction || null})
      .then(_product => {
        if (!_product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = _product
        return Collection.resolve(collection, {transaction: options.transaction || null})
      })
      .then(_collection => {
        if (!_collection) {
          throw new Errors.FoundError(Error('Collection not found'))
        }
        resCollection = _collection
        return resProduct.hasCollection(resCollection.id, {transaction: options.transaction || null})
      })
      .then(hasCollection => {
        if (!hasCollection) {
          return resProduct.addCollection(resCollection.id, {transaction: options.transaction || null})
        }
        return resProduct
      })
      .then(collection => {
        return Product.findByIdDefault(resProduct.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param product
   * @param collection
   * @param options
   * @returns {Promise.<T>}
   */
  removeCollection(product, collection, options){
    options = options || {}
    const Product = this.app.orm['Product']
    const Collection = this.app.orm['Collection']
    let resProduct, resCollection
    return Product.resolve(product, {transaction: options.transaction || null})
      .then(_product => {
        if (!_product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = _product
        return Collection.resolve(collection, {transaction: options.transaction || null})
      })
      .then(_collection => {
        if (!_collection) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resCollection = _collection
        return resProduct.hasCollection(resCollection.id, {transaction: options.transaction || null})
      })
      .then(hasCollection => {
        if (hasCollection) {
          return resProduct.removeCollection(resCollection.id, {transaction: options.transaction || null})
        }
        return resProduct
      })
      .then(collection => {
        return Product.findByIdDefault(resProduct.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param product
   * @param shop
   * @param options
   * @returns {Promise.<TResult>}
   */
  addShop(product, shop, options){
    options = options || {}
    const Product = this.app.orm['Product']
    let resProduct, resShop
    return Product.resolve(product, {transaction: options.transaction || null})
      .then(_product => {
        if (!_product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = _product
        return this.app.orm['Shop'].resolve(shop, {transaction: options.transaction || null})
      })
      .then(_shop => {
        if (!_shop) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resShop = _shop
        return resProduct.hasShop(resShop.id, {transaction: options.transaction || null})
      })
      .then(hasShop => {
        if (!hasShop) {
          return resProduct.addShop(resShop.id, {transaction: options.transaction || null})
        }
        return resProduct
      })
      .then(shop => {
        return Product.findByIdDefault(resProduct.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param product
   * @param shop
   * @param options
   * @returns {Promise.<TResult>}
   */
  removeShop(product, shop, options){
    options = options || {}
    const Product = this.app.orm['Product']
    let resProduct, resShop
    return Product.resolve(product, {transaction: options.transaction || null})
      .then(_product => {
        if (!_product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = _product
        return this.app.orm['Shop'].resolve(shop, {transaction: options.transaction || null})
      })
      .then(_shop => {
        if (!_shop) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resShop = _shop
        return resProduct.hasShop(resShop.id, {transaction: options.transaction || null})
      })
      .then(hasShop => {
        if (hasShop) {
          return resProduct.removeShop(resShop.id, {transaction: options.transaction || null})
        }
        return resProduct
      })
      .then(shop => {
        return Product.findByIdDefault(resProduct.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param product
   * @param vendor
   * @param options
   * @returns {Promise.<T>}
   */
  addVendor(product, vendor, options){
    options = options || {}
    const Product = this.app.orm['Product']
    const Vendor = this.app.orm['Vendor']
    let resProduct, resVendor
    return Product.resolve(product, {transaction: options.transaction || null})
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = product
        return Vendor.resolve(vendor, {transaction: options.transaction || null})
      })
      .then(vendor => {
        if (!vendor) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resVendor = vendor
        return resProduct.hasVendor(resVendor.id, {transaction: options.transaction || null})
      })
      .then(hasVendor => {
        if (!hasVendor) {
          return resProduct.addVendor(resVendor.id, {transaction: options.transaction || null})
        }
        return resProduct
      })
      .then(vendor => {
        return Product.findByIdDefault(resProduct.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param product
   * @param vendor
   * @param options
   * @returns {Promise.<TResult>}
   */
  removeVendor(product, vendor, options){
    options = options || {}
    const Product = this.app.orm['Product']
    const Vendor = this.app.orm['Vendor']
    let resProduct, resVendor
    return Product.resolve(product, {transaction: options.transaction || null})
      .then(product => {
        if (!product) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resProduct = product
        return Vendor.resolve(vendor, {transaction: options.transaction || null})
      })
      .then(vendor => {
        if (!vendor) {
          throw new Errors.FoundError(Error('Product not found'))
        }
        resVendor = vendor
        return resProduct.hasVendor(resVendor.id, {transaction: options.transaction || null})
      })
      .then(hasVendor => {
        if (hasVendor) {
          return resProduct.removeVendor(resVendor.id, {transaction: options.transaction || null})
        }
        return resProduct
      })
      .then(vendor => {
        return Product.findByIdDefault(resProduct.id, {transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param product
   * @returns {*}
   */
  productDefaults(product) {

    // Establish an array of variants
    product.variants = product.variants || []
    product.images = product.images || []
    product.collections = product.collections || []
    product.associations = product.associations || []
    product.tags = product.tags || []
    product.options = []
    product.google = product.google || {}
    product.amazon = product.amazon || {}

    // Actual Product Defaults
    if (_.isNil(product.host)) {
      product.host = PRODUCT_DEFAULTS.HOST
    }
    // If not options, set default options
    if (_.isNil(product.options)) {
      product.options = PRODUCT_DEFAULTS.OPTIONS
    }
    // If no tax code set a default tax coe
    if (_.isNil(product.tax_code)) {
      product.tax_code = PRODUCT_DEFAULTS.TAX_CODE
    }
    // If no currency set default currency
    if (_.isNil(product.currency)) {
      product.currency = PRODUCT_DEFAULTS.CURRENCY
    }
    if (_.isNil(product.published_scope)) {
      product.published_scope = PRODUCT_DEFAULTS.PUBLISHED_SCOPE
    }
    // If not established publish status, default status
    if (_.isNil(product.published)) {
      product.published = PRODUCT_DEFAULTS.PUBLISHED
    }
    // If not a weight, default weight
    if (_.isNil(product.weight)) {
      product.weight = PRODUCT_DEFAULTS.WEIGHT
    }
    // If not a weight unit, default weight unit
    if (_.isNil(product.weight_unit)) {
      product.weight_unit = PRODUCT_DEFAULTS.WEIGHT_UNIT
    }

    // Variant Defaults for addProduct/updateProduct
    if (_.isNil(product.max_quantity)) {
      product.max_quantity = VARIANT_DEFAULTS.MAX_QUANTITY
    }
    if (_.isNil(product.fulfillment_service)) {
      product.fulfillment_service = VARIANT_DEFAULTS.FULFILLMENT_SERVICE
    }
    if (_.isNil(product.subscription_interval)) {
      product.subscription_interval = VARIANT_DEFAULTS.SUBSCRIPTION_INTERVAL
    }
    if (_.isNil(product.subscription_unit)) {
      product.subscription_unit = VARIANT_DEFAULTS.SUBSCRIPTION_UNIT
    }
    if (_.isNil(product.requires_subscription)) {
      product.requires_subscription = VARIANT_DEFAULTS.REQUIRES_SUBSCRIPTION
    }
    if (_.isNil(product.requires_shipping)) {
      product.requires_shipping = VARIANT_DEFAULTS.REQUIRES_SHIPPING
    }
    if (_.isNil(product.requires_taxes)) {
      product.requires_taxes = VARIANT_DEFAULTS.REQUIRES_TAX
    }
    if (_.isNil(product.inventory_policy)) {
      product.inventory_policy = VARIANT_DEFAULTS.INVENTORY_POLICY
    }
    if (_.isNil(product.inventory_quantity)) {
      product.inventory_quantity = VARIANT_DEFAULTS.INVENTORY_QUANTITY
    }
    if (_.isNil(product.inventory_management)) {
      product.inventory_management = VARIANT_DEFAULTS.INVENTORY_MANAGEMENT
    }
    if (_.isNil(product.inventory_lead_time)) {
      product.inventory_lead_time = VARIANT_DEFAULTS.INVENTORY_LEAD_TIME
    }
    return product
  }
  /**
   *
   * @param variant
   * @param product
   * @returns {*}
   */
  variantDefaults(variant, product){
    // Defaults for these keys
    variant.images = variant.images || []
    variant.collections = variant.collections || []
    variant.associations = variant.associations || []

    // If the title set on parent
    if (_.isString(product.title) && _.isNil(variant.title)) {
      variant.title = product.title
    }
    // If the price is set on parent
    if (product.price  && !variant.price) {
      variant.price = product.price
    }
    // If the option is set on parent
    if (_.isObject(product.option)  && _.isNil(variant.option)) {
      variant.option = product.option
    }
    // If the barcode is set on parent
    if (_.isString(product.barcode)  && _.isNil(variant.barcode)) {
      variant.barcode = product.barcode
    }
    // If the compare at price is set on parent
    if (_.isNumber(product.compare_at_price)  && _.isNil(variant.compare_at_price)) {
      variant.compare_at_price = product.compare_at_price
    }
    if (_.isNumber(variant.price) && _.isNil(variant.compare_at_price)) {
      variant.compare_at_price = variant.price
    }
    // If the currency set on parent
    if (_.isString(product.currency) && _.isNil(variant.currency)) {
      variant.currency = product.currency
    }
    // If the fulfillment_service is set on parent
    if (_.isString(product.fulfillment_service)  && _.isNil(variant.fulfillment_service)) {
      variant.fulfillment_service = product.fulfillment_service
    }
    // If the requires_shipping is set on parent
    if (_.isBoolean(product.requires_shipping)  && _.isNil(variant.requires_shipping)) {
      variant.requires_shipping = product.requires_shipping
    }
    // If the requires_shipping is set on parent
    if (_.isBoolean(product.requires_taxes)  && _.isNil(variant.requires_taxes)) {
      variant.requires_taxes = product.requires_taxes
    }
    // If the requires_subscription set on parent
    if (_.isBoolean(product.requires_subscription) && _.isNil(variant.requires_subscription)) {
      variant.requires_subscription = product.requires_subscription
    }
    // If the subscription_interval set on parent
    if (_.isNumber(product.subscription_interval) && _.isNil(variant.subscription_interval)) {
      variant.subscription_interval = product.subscription_interval
    }
    // If the subscription_unit set on parent
    if (_.isString(product.subscription_unit) && _.isNil(variant.subscription_unit)) {
      variant.subscription_unit = product.subscription_unit
    }
    // If the inventory_tracker set on parent
    if (_.isString(product.inventory_tracker) && _.isNil(variant.inventory_tracker)) {
      variant.inventory_tracker = product.inventory_tracker
    }
    // If the inventory_management set on parent
    if (_.isBoolean(product.inventory_management) && _.isNil(variant.inventory_management)) {
      variant.inventory_management = product.inventory_management
    }
    // If the inventory_quantity set on parent
    if (_.isNumber(product.inventory_quantity) && _.isNil(variant.inventory_quantity)) {
      variant.inventory_quantity = product.inventory_quantity
    }
    // If the inventory_policy set on parent
    if (_.isString(product.inventory_policy) && _.isNil(variant.inventory_policy)) {
      variant.inventory_policy = product.inventory_policy
    }
    // If the max_quantity set on parent
    if (_.isNumber(product.max_quantity) && _.isNil(variant.max_quantity)) {
      variant.max_quantity = product.max_quantity
    }
    // Inherit the product type
    if (_.isString(product.type) && _.isNil(variant.type)) {
      variant.type = product.type
    }
    // If the max_quantity set on parent
    if (_.isString(product.tax_code) && _.isNil(variant.tax_code)) {
      variant.tax_code = product.tax_code
    }
    // If the weight set on parent
    if (_.isNumber(product.weight) && _.isNil(variant.weight)) {
      variant.weight = product.weight
    }
    // If the weight_unit set on parent
    if (_.isString(product.weight_unit) && _.isNil(variant.weight_unit)) {
      variant.weight_unit = product.weight_unit
    }
    return variant
  }

  beforeCreate(product, options) {
    if (product.body) {
      return this.app.services.RenderGenericService.render(product.body)
        .then(doc => {
          product.html = doc.document
          return product
        })
    }
    else {
      return Promise.resolve(product)
    }
  }

  beforeUpdate(product, options) {
    if (product.body) {
      return this.app.services.RenderGenericService.render(product.body)
        .then(doc => {
          product.html = doc.document
          return product
        })
    }
    else {
      return Promise.resolve(product)
    }
  }

  beforeVariantCreate(variant, options) {
    return Promise.resolve(variant)
  }

  beforeVariantUpdate(variant, options) {
    return Promise.resolve(variant)
  }
}

