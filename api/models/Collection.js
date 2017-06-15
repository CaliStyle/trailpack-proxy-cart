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
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Collection.default(app))
              // console.log('THIS COLLECTION',options)
              return this.findById(id, options)
            },
            findByHandleDefault: function(handle, options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Collection.default(app), {
                where: {
                  handle: handle
                }
              })
              return this.findOne(options)
            },
            findOneDefault: function(options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Collection.default(app))
              return this.findOne(options)
            },
            findAllDefault: function(options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Collection.default(app))
              return this.findAll(options)
            },
            findAndCountDefault: function(options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Collection.default(app))
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
                      // TODO create proper error
                      throw new Errors.FoundError(Error(`Collection ${collection.id} not found`))
                    }
                    return foundCollection
                  })
              }
              else if (collection && _.isObject(collection) && (collection.handle || collection.title)) {
                return Collection.findOne(_.defaultsDeep({
                  where: {
                    $or: {
                      handle: collection.handle,
                      title: collection.title
                    }
                  }
                }, options))
                  .then(resCollection => {
                    if (resCollection) {
                      return resCollection
                    }
                    return Collection.create(collection, {transaction: options.transaction})
                  })
              }
              else if (collection && _.isString(collection)) {
                return Collection.findOne(_.defaultsDeep({
                  where: {
                    $or: {
                      handle: collection,
                      title: collection,
                      id: collection
                    }
                  }
                }, options))
                  .then(resCollection => {
                    if (resCollection) {
                      return resCollection
                    }
                    return this.create({title: collection}, {transaction: options.transaction || null})
                  })
              }
              else {
                // TODO make Proper Error
                const err = new Error(`Not able to resolve collection ${collection}`)
                return Promise.reject(err)
              }
            },
            transformCollections: (collections, options) => {
              const Collection = app.orm['Collection']
              const Sequelize = Collection.sequelize
              options = options || {}
              collections = collections || []

              // Transform if necessary to objects
              collections = collections.map(collection => {
                if (collection && _.isString(collection)) {
                  collection = {
                    handle: app.services.ProxyCartService.slug(collection),
                    title: collection
                  }
                  return collection
                }
                else if (collection) {
                  return _.omit(collection, ['created_at','updated_at'])
                }
              })
              // console.log('THESE COLLECTIONS', collections)
              return Sequelize.Promise.mapSeries(collections, collection => {
                const newCollection = collection
                return Collection.findOne({
                  where: {
                    handle: collection.handle
                  },
                  attributes: ['id', 'title', 'handle'],
                  transaction: options.transaction || null
                })
                  .then(foundCollection => {
                    if (foundCollection) {
                      // console.log('COLLECTION', collection.get({ plain: true }))
                      return foundCollection
                    }
                    else {
                      // console.log('CREATING COLLECTION',collections[index])
                      return Collection.create(newCollection, {
                        include: [{
                          model: app.orm['Image'],
                          as: 'images'
                        }],
                        transaction: options.transaction || null
                      })
                    }
                  })
              })
            },
            reverseTransformCollections: (collections) => {
              collections = _.map(collections, collection => {
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
        handle: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          set: function(val) {
            this.setDataValue('handle', app.services.ProxyCartService.slug(val))
          }
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        // The purpose of the collection
        primary_purpose: {
          type: Sequelize.ENUM,
          values: _.values(COLLECTION_PURPOSE),
          defaultValue: COLLECTION_PURPOSE.GROUP
        },

        // Multi Site Support
        // TODO possibly switch to store_id for multi tenant support?
        host: {
          type: Sequelize.STRING,
          defaultValue: 'localhost'
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
        tax_rate: {
          type: Sequelize.FLOAT,
          defaultValue: 0.0
        },
        tax_percentage: {
          type: Sequelize.FLOAT,
          defaultValue: 0.0
        },
        tax_type: {
          type: Sequelize.ENUM,
          values: _.values(COLLECTION_TAX_TYPE),
          defaultValue: COLLECTION_TAX_TYPE.PERCENTAGE
        },
        tax_name: {
          type: Sequelize.STRING
        },

        // TODO Shipping Override for products in this collection
        shipping_rate: {
          type: Sequelize.FLOAT,
          defaultValue: 0.0
        },
        shipping_percentage: {
          type: Sequelize.FLOAT,
          defaultValue: 0.0
        },
        shipping_type: {
          type: Sequelize.ENUM,
          values: _.values(COLLECTION_SHIPPING_TYPE),
          defaultValue: COLLECTION_SHIPPING_TYPE.PERCENTAGE
        },
        shipping_name: {
          type: Sequelize.STRING
        },

        discount_scope: {
          type: Sequelize.ENUM,
          values: _.values(COLLECTION_DISCOUNT_SCOPE),
          defaultValue: COLLECTION_DISCOUNT_SCOPE.INDIVIDUAL
        },
        discount_type: {
          type: Sequelize.ENUM,
          values: _.values(COLLECTION_DISCOUNT_TYPE),
          defaultValue: COLLECTION_DISCOUNT_TYPE.PERCENTAGE
        },
        discount_rate: {
          type: Sequelize.FLOAT,
          defaultValue: 0.0
        },
        // A percentage to apply
        discount_percentage: {
          type: Sequelize.FLOAT,
          defaultValue: 0.0
        },
        // List of product types allowed to discount
        discount_product_include: helpers.ARRAY('Collection', app, Sequelize, Sequelize.STRING, 'discount_product_include', {
          defaultValue: []
        }),
        // List of product types to forcefully excluded from discount
        discount_product_exclude: helpers.ARRAY('Collection', app, Sequelize, Sequelize.STRING, 'discount_product_exclude', {
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
