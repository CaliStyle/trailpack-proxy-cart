/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const Errors = require('proxy-engine-errors')
const helpers = require('proxy-engine-helpers')
const _ = require('lodash')
const queryDefaults = require('../utils/queryDefaults')
const COLLECTION_SORT_ORDER = require('../../lib').Enums.COLLECTION_SORT_ORDER
const COLLECTION_PURPOSE = require('../../lib').Enums.COLLECTION_PURPOSE
const COLLECTION_DISCOUNT_SCOPE = require('../../lib').Enums.COLLECTION_DISCOUNT_SCOPE
const COLLECTION_DISCOUNT_TYPE = require('../../lib').Enums.COLLECTION_DISCOUNT_TYPE
const COLLECTION_TAX_TYPE = require('../../lib').Enums.COLLECTION_TAX_TYPE
const COLLECTION_SHIPPING_TYPE = require('../../lib').Enums.COLLECTION_SHIPPING_TYPE
/**
 * @module ProductCollection
 * @description Product Collection Model
 */
module.exports = class Collection extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true,
        enums: {
          COLLECTION_SORT_ORDER: COLLECTION_SORT_ORDER,
          COLLECTION_PURPOSE: COLLECTION_PURPOSE,
          COLLECTION_DISCOUNT_SCOPE: COLLECTION_DISCOUNT_SCOPE,
          COLLECTION_DISCOUNT_TYPE: COLLECTION_DISCOUNT_TYPE,
          COLLECTION_TAX_TYPE: COLLECTION_TAX_TYPE,
        },
        scopes: {
          live: {
            where: {
              live_mode: true
            }
          }
        },
        hooks: {
          beforeValidate(values, options) {
            if (!values.handle && values.title) {
              values.handle = values.title
            }
          },
          beforeCreate(values, options) {
            if (values.body) {
              const bodyDoc = app.services.RenderGenericService.renderSync(values.body)
              values.body_html = bodyDoc.document
            }
            if (values.excerpt) {
              const excerptDoc = app.services.RenderGenericService.renderSync(values.excerpt)
              values.excerpt_html = excerptDoc.document
            }
          },
          beforeUpdate(values, options) {
            if (values.body) {
              const bodyDoc = app.services.RenderGenericService.renderSync(values.body)
              values.body_html = bodyDoc.document
            }
            if (values.excerpt) {
              const excerptDoc = app.services.RenderGenericService.renderSync(values.excerpt)
              values.excerpt_html = excerptDoc.document
            }
          }
        },
        classMethods: {
          /**
           *
           * @param models
           */
          associate: (models) => {
            // Product Assoc
            models.Collection.belongsToMany(models.Product, {
              as: 'products',
              through: {
                model: models.ItemCollection,
                unique: false,
                scope: {
                  model: 'product'
                },
                constraints: false
              },
              foreignKey: 'collection_id',
              otherKey: 'model_id',
              constraints: false
            })
            // Collection Assoc
            models.Collection.belongsToMany(models.Collection, {
              as: 'collections',
              through: {
                model: models.ItemCollection,
                unique: false,
                scope: {
                  model: 'collection'
                },
                constraints: false
              },
              // foreignKey: 'model_id',
              // otherKey: 'collection_id',
              foreignKey: 'collection_id',
              otherKey: 'model_id',
              constraints: false
            })
            // Customer Assoc
            models.Collection.belongsToMany(models.Customer, {
              as: 'customers',
              through: {
                model: models.ItemCollection,
                unique: false,
                scope: {
                  model: 'customer'
                },
                constraints: false
              },
              foreignKey: 'collection_id',
              otherKey: 'model_id',
              constraints: false
            })
            // Discount Assoc
            models.Collection.belongsToMany(models.Discount, {
              as: 'discounts',
              through: {
                model: models.ItemDiscount,
                unique: false,
                scope: {
                  model: 'collection'
                }
              },
              foreignKey: 'model_id',
              constraints: false
            })
            // Images Assoc
            models.Collection.belongsToMany(models.Image, {
              as: 'images',
              through: {
                model: models.ItemImage,
                unique: false,
                scope: {
                  model: 'collection'
                },
                constraints: false
              },
              foreignKey: 'model_id',
              constraints: false
            })
            // Metadata Assoc
            models.Collection.hasOne(models.Metadata, {
              as: 'metadata',
              foreignKey: 'collection_id'
            })
            models.Collection.belongsToMany(models.Tag, {
              as: 'tags',
              through: {
                model: models.ItemTag,
                unique: false,
                scope: {
                  model: 'collection'
                }
              },
              foreignKey: 'model_id',
              otherKey: 'tag_id',
              constraints: false
            })
          },
          findByIdDefault: function(id, options) {
            options = app.services.ProxyEngineService.mergeOptionDefaults(
              queryDefaults.Collection.default(app),
              options || {}
            )
            return this.findById(id, options)
          },
          findByHandleDefault: function(handle, options) {
            options = app.services.ProxyEngineService.mergeOptionDefaults(
              queryDefaults.Collection.default(app),
              {
                where: {
                  handle: handle
                }
              },
              options || {}
            )
            return this.findOne(options)
          },
          findOneDefault: function(options) {
            options = app.services.ProxyEngineService.mergeOptionDefaults(
              queryDefaults.Collection.default(app),
              options || {}
            )
            return this.findOne(options)
          },
          findAllDefault: function(options) {
            options = app.services.ProxyEngineService.mergeOptionDefaults(
              queryDefaults.Collection.default(app),
              options || {}
            )
            return this.findAll(options)
          },
          findAndCountDefault: function(options) {
            options = app.services.ProxyEngineService.mergeOptionDefaults(
              queryDefaults.Collection.findAndCountDefault(app),
              options || {}
            )
            return this.findAndCount(options)
          },
          /**
           *
           * @param collection
           * @param options
           * @returns {*}
           */
          resolve: function(collection, options){
            options = options || {}
            const Collection =  this
            if (collection instanceof Collection){
              return Promise.resolve(collection)
            }
            else if (collection && _.isObject(collection) && collection.id) {
              return Collection.findById(collection.id, options)
                .then(foundCollection => {
                  if (!foundCollection) {
                    throw new Errors.FoundError(Error(`Collection ${collection.id} not found`))
                  }
                  return foundCollection
                })
            }
            else if (collection && _.isObject(collection) && collection.handle) {
              return Collection.findOne(app.services.ProxyEngineService.mergeOptionDefaults(
                  options,
                {
                  where: {
                    handle: collection.handle
                  }
                }
                )
              )
                .then(resCollection => {
                  if (resCollection) {
                    return resCollection
                  }
                  collection.title = collection.title || collection.handle
                  return app.services.CollectionService.create(collection, {transaction: options.transaction})
                })
            }
            else if (collection && _.isObject(collection) && collection.title) {
              return Collection.findOne(options = app.services.ProxyEngineService.mergeOptionDefaults(
                  options,
                {
                  where: {
                    handle: app.services.ProxyCartService.handle(collection.title)
                  }
                }
                )
              )
                .then(resCollection => {
                  if (resCollection) {
                    return resCollection
                  }
                  collection.handle = collection.handle || app.ProxyCartService.handle(collection.title)
                  return app.services.CollectionService.create(collection, {transaction: options.transaction})
                })
            }
            else if (collection && _.isNumber(collection)) {
              return Collection.findById(collection, options)
                .then(foundCollection => {
                  if (!foundCollection) {
                    throw new Errors.FoundError(Error(`Collection ${collection.id} not found`))
                  }
                  return foundCollection
                })
            }
            else if (collection && _.isString(collection)) {
              return Collection.findOne(options = app.services.ProxyEngineService.mergeOptionDefaults(
                  options,
                {
                  where: {
                    handle: app.services.ProxyCartService.handle(collection)
                  }
                }
                )
              )
                .then(resCollection => {
                  if (resCollection) {
                    return resCollection
                  }
                  return app.services.CollectionService.create({
                    handle: app.services.ProxyCartService.handle(collection),
                    title: collection
                  }, {
                    transaction: options.transaction || null
                  })
                })
            }
            else {
              // TODO make Proper Error
              const err = new Error(`Not able to resolve collection ${collection}`)
              return Promise.reject(err)
            }
          },
          /**
           *
           * @param collections
           * @param options
           * @returns {Promise.<T>}
           */
          transformCollections: (collections, options) => {
            options = options || {}
            collections = collections || []

            const Collection = app.orm['Collection']
            const Sequelize = Collection.sequelize

            // Transform if necessary to objects
            collections = collections.map(collection => {
              if (collection && _.isNumber(collection)) {
                return { id: collection }
              }
              else if (collection && _.isString(collection)) {
                return {
                  handle: app.services.ProxyCartService.handle(collection),
                  title: collection
                }
              }
              else if (collection && _.isObject(collection) && (collection.title || collection.handle)) {
                collection.handle = app.services.ProxyCartService.handle(collection.handle) || app.services.ProxyCartService.handle(collection.title)
                return collection
              }
            })
            // Filter out undefined
            collections = collections.filter(collection => collection)

            return Sequelize.Promise.mapSeries(collections, collection => {
              return Collection.findOne({
                where: _.pick(collection, ['id','handle']),
                attributes: ['id', 'handle', 'title'],
                transaction: options.transaction || null
              })
                .then(foundCollection => {
                  if (foundCollection) {
                    return _.extend(foundCollection, collection)
                  }
                  else {
                    return app.services.CollectionService.create(collection, {
                      transaction: options.transaction || null
                    })
                      .then(createdCollection => {
                        return _.extend(createdCollection, collection)
                      })
                  }
                })
            })
          },
          /**
           *
           * @param collections
           */
          reverseTransformCollections: (collections) => {
            collections = collections || []
            collections.map(collection => {
              if (collection && _.isString(collection)) {
                return collection
              }
              else if (collection && collection.title) {
                return collection.title
              }
            })
            return collections
          }
        },
        instanceMethods: {
          /**
           * TODO, this should likely be done with a view
           * Format return data
           * Converts tags to array of strings
           * Returns only metadata data
           */
          toJSON: function() {
            // Make JSON
            const resp = this instanceof app.orm['Collection'] ? this.get({ plain: true }) : this
            // Set Defaults
            // resp.calculated_price = resp.price

            // Transform Tags to array on toJSON
            if (resp.tags) {
              // console.log(resp.tags)
              resp.tags = resp.tags.map(tag => {
                if (tag && _.isString(tag)) {
                  return tag
                }
                else if (tag && tag.name && tag.name !== '') {
                  return tag.name
                }
              })
            }
            // Transform Metadata to plain on toJSON
            if (resp.metadata) {
              if (typeof resp.metadata.data !== 'undefined') {
                resp.metadata = resp.metadata.data
              }
            }
            return resp
          },
          /**
           *
           * @param options
           * @returns {*}
           */
          resolveMetadata: function(options) {
            options = options || {}
            if (
              this.metadata
              && this.metadata instanceof app.orm['Metadata']
              && options.reload !== true
            ) {
              return Promise.resolve(this)
            }
            else {
              return this.getMetadata({transaction: options.transaction || null})
                .then(_metadata => {
                  _metadata = _metadata || {collection_id: this.id}
                  this.metadata = _metadata
                  this.setDataValue('metadata', _metadata)
                  this.set('metadata', _metadata)
                  return this
                })
            }
          },
          resolveDiscounts: function(options) {
            options = options || {}
            if (
              this.discounts
              && this.discount.every(d => d instanceof app.orm['Discount'])
              && options.reload !== true
            ) {
              return Promise.resolve(this)
            }
            else {
              return this.getDiscounts({transaction: options.transaction || null})
                .then(_discounts => {
                  _discounts = _discounts || []
                  this.discounts = _discounts
                  this.setDataValue('discounts', _discounts)
                  this.set('discounts', _discounts)
                  return this
                })
            }
          }
        }
      }
    }
  }

  static schema (app, Sequelize) {
    return {
      // The handle of the Collection
      handle: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        set: function(val) {
          this.setDataValue('handle', app.services.ProxyCartService.splitHandle(val) || null)
        }
      },
      // The title of the Collection
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        set: function(val) {
          this.setDataValue('title', app.services.ProxyCartService.title(val))
        }
        // unique: true
      },
      // SEO title
      seo_title: {
        type: Sequelize.STRING,
        set: function(val) {
          this.setDataValue('seo_title', app.services.ProxyCartService.title(val))
        }
      },
      // SEO description
      seo_description: {
        type: Sequelize.TEXT,
        set: function(val) {
          this.setDataValue('seo_description', app.services.ProxyCartService.description(val))
        }
      },
      // The purpose of the collection
      primary_purpose: {
        type: Sequelize.ENUM,
        values: _.values(COLLECTION_PURPOSE),
        defaultValue: COLLECTION_PURPOSE.GROUP
      },

      // The id of the Shop
      shop_id: {
        type: Sequelize.INTEGER
      },
      // A description in text
      description: {
        type: Sequelize.TEXT
      },
      // An excerpt of the body of a collection (in markdown or html)
      excerpt: {
        type: Sequelize.TEXT
      },
      // The excerpt html of a collection (DO NOT EDIT DIRECTLY)
      excerpt_html: {
        type: Sequelize.TEXT
      },
      // The body of a collection (in markdown or html)
      body: {
        type: Sequelize.TEXT
      },
      // The html of a collection (DO NOT EDIT DIRECTLY)
      body_html: {
        type: Sequelize.TEXT
      },
      // If the Collection is published
      published: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      // When the Collection was published
      published_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      // The scope Collection is published
      published_scope: {
        type: Sequelize.STRING,
        defaultValue: 'global'
      },
      // When the collection was unpublished
      unpublished_at: {
        type: Sequelize.DATE
      },
      // The position this collection is in reference to the other collections when displayed.
      position: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      // The way Items are displayed in this collection
      sort_order: {
        type: Sequelize.ENUM,
        values: _.values(COLLECTION_SORT_ORDER),
        defaultValue: COLLECTION_SORT_ORDER.ALPHA_DESC
      },

      // TODO Tax Override for products in this collection
      // The type of a tax modifier
      tax_type: {
        type: Sequelize.ENUM,
        values: _.values(COLLECTION_TAX_TYPE),
        defaultValue: COLLECTION_TAX_TYPE.PERCENTAGE
      },
      // The rate of added tax if tax_type is a rate
      tax_rate: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
      },
      // The percentage of added tax if tax_type is a percentage
      tax_percentage: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
      },
      // The name of the tax modifier
      tax_name: {
        type: Sequelize.STRING
      },

      // TODO Shipping Override for products in this collection
      // The type of the shipping modifier (rate, percentage)
      shipping_type: {
        type: Sequelize.ENUM,
        values: _.values(COLLECTION_SHIPPING_TYPE),
        defaultValue: COLLECTION_SHIPPING_TYPE.PERCENTAGE
      },
      // The shipping rate to be applied if shipping_type is rate
      shipping_rate: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
      },
      // The shipping percentage to be applied if shipping_type is percentage
      shipping_percentage: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
      },
      // The name of the shipping modifier
      shipping_name: {
        type: Sequelize.STRING
      },
      // // The scope of the discount price modifier for the collection (individual, global)
      // discount_scope: {
      //   type: Sequelize.ENUM,
      //   values: _.values(COLLECTION_DISCOUNT_SCOPE),
      //   defaultValue: COLLECTION_DISCOUNT_SCOPE.INDIVIDUAL
      // },
      // // The type of the discount modifier (rate, percentage)
      // discount_type: {
      //   type: Sequelize.ENUM,
      //   values: _.values(COLLECTION_DISCOUNT_TYPE),
      //   defaultValue: COLLECTION_DISCOUNT_TYPE.PERCENTAGE
      // },
      // // The discount rate if the discount_type is rate
      // discount_rate: {
      //   type: Sequelize.FLOAT,
      //   defaultValue: 0.0
      // },
      // // A percentage to apply if the discount_type is percentage
      // discount_percentage: {
      //   type: Sequelize.FLOAT,
      //   defaultValue: 0.0
      // },
      // // TODO allow product includes
      // // List of product types allowed to discount
      // discount_product_include: helpers.JSONB('Collection', app, Sequelize, 'discount_product_include', {
      //   defaultValue: []
      // }),
      // // List of product_type [<string>] to forcefully excluded from discount modifiers
      // discount_product_exclude: helpers.JSONB('Collection', app, Sequelize, 'discount_product_exclude', {
      //   defaultValue: []
      // }),
      // List of product_type [<string>] to forcefully excluded from shipping modifiers
      shipping_product_exclude: helpers.JSONB('Collection', app, Sequelize, 'shipping_product_exclude', {
        defaultValue: []
      }),
      // List of product_type [<string>] to forcefully excluded from tax modifiers
      tax_product_exclude: helpers.JSONB('Collection', app, Sequelize, 'tax_product_exclude', {
        defaultValue: []
      }),
      // Live Mode
      live_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: app.config.proxyEngine.live_mode
      }
    }
  }
}
