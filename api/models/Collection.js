/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const Errors = require('proxy-engine-errors')
const helpers = require('proxy-engine-helpers')
const _ = require('lodash')
const queryDefaults = require('../utils/queryDefaults')
const COLLECTION_SORT_ORDER = require('../utils/enums').COLLECTION_SORT_ORDER
const COLLECTION_PURPOSE = require('../utils/enums').COLLECTION_PURPOSE
const COLLECTION_DISCOUNT_SCOPE = require('../utils/enums').COLLECTION_DISCOUNT_SCOPE
const COLLECTION_DISCOUNT_TYPE = require('../utils/enums').COLLECTION_DISCOUNT_TYPE
const COLLECTION_TAX_TYPE = require('../utils/enums').COLLECTION_TAX_TYPE
const COLLECTION_SHIPPING_TYPE = require('../utils/enums').COLLECTION_SHIPPING_TYPE
/**
 * @module ProductCollection
 * @description Product Collection Model
 */
module.exports = class Collection extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          scopes: {
            live: {
              where: {
                live_mode: true
              }
            }
          },
          hooks: {
            beforeValidate(values, options, fn) {
              if (!values.handle && values.title) {
                values.handle = values.title
              }
              fn()
            },
            beforeCreate(values, options, fn) {
              if (values.body) {
                app.services.RenderGenericService.render(values.body)
                  .then(doc => {
                    values.html = doc.document
                    return fn()
                  })
              }
              else {
                return fn()
              }
            },
            beforeUpdate(values, options, fn) {
              if (values.body) {
                app.services.RenderGenericService.render(values.body)
                  .then(doc => {
                    values.html = doc.document
                    return fn()
                  })
              }
              else {
                return fn()
              }
            }
          },
          classMethods: {
            COLLECTION_SORT_ORDER: COLLECTION_SORT_ORDER,
            COLLECTION_PURPOSE: COLLECTION_PURPOSE,
            COLLECTION_DISCOUNT_SCOPE: COLLECTION_DISCOUNT_SCOPE,
            COLLECTION_DISCOUNT_TYPE: COLLECTION_DISCOUNT_TYPE,
            COLLECTION_TAX_TYPE: COLLECTION_TAX_TYPE,
            /**
             *
             * @param models
             */
            associate: (models) => {
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
              models.Collection.belongsToMany(models.Discount, {
                as: 'discount_codes',
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
                foreignKey: 'model_id',
                otherKey: 'collection_id',
                constraints: false
              })
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
              if (collection instanceof Collection.Instance){
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
                return Collection.findOne(_.defaultsDeep({
                  where: {
                    handle: collection.handle
                  }
                }, options))
                  .then(resCollection => {
                    if (resCollection) {
                      return resCollection
                    }
                    collection.title = collection.title || collection.handle
                    return app.services.CollectionService.create(collection, {transaction: options.transaction})
                  })
              }
              else if (collection && _.isObject(collection) && collection.title) {
                return Collection.findOne(_.defaultsDeep({
                  where: {
                    handle: app.services.ProxyCartService.handle(collection.title)
                  }
                }, options))
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
                return Collection.findOne(_.defaultsDeep({
                  where: {
                    handle: app.services.ProxyCartService.handle(collection)
                  }
                }, options))
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
                    }
                  })
              })
            },
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
          }
          // instanceMethods: {
          //   getProductIds: function () {
          //     return models.Product.findAll({
          //
          //     })
          //   }
          // }
          // instanceMethods: {
          //   toJSON: function () {
          //     const resp = this.get({ plain: true })
          //     return resp
          //   }
          // }
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    let schema = {}
    if (app.config.database.orm === 'sequelize') {
      schema = {
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
        // The body of a collection (in markdown or html)
        body: {
          type: Sequelize.TEXT
        },
        // The html of a collection (DO NOT EDIT DIRECTLY)
        html: {
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
        // The scope of the discount price modifier for the collection (individual, global)
        discount_scope: {
          type: Sequelize.ENUM,
          values: _.values(COLLECTION_DISCOUNT_SCOPE),
          defaultValue: COLLECTION_DISCOUNT_SCOPE.INDIVIDUAL
        },
        // The type of the discount modifier (rate, percentage)
        discount_type: {
          type: Sequelize.ENUM,
          values: _.values(COLLECTION_DISCOUNT_TYPE),
          defaultValue: COLLECTION_DISCOUNT_TYPE.PERCENTAGE
        },
        // The discount rate if the discount_type is rate
        discount_rate: {
          type: Sequelize.FLOAT,
          defaultValue: 0.0
        },
        // A percentage to apply if the discount_type is percentage
        discount_percentage: {
          type: Sequelize.FLOAT,
          defaultValue: 0.0
        },
        // TODO allow product includes
        // List of product types allowed to discount
        discount_product_include: helpers.JSONB('Collection', app, Sequelize, 'discount_product_include', {
          defaultValue: []
        }),
        // List of product_type [<string>] to forcefully excluded from discount modifiers
        discount_product_exclude: helpers.JSONB('Collection', app, Sequelize, 'discount_product_exclude', {
          defaultValue: []
        }),
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
    return schema
  }
}
