/* eslint new-cap: [0] */

'use strict'

const Model = require('trails/model')
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
                  }
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
                  }
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
                  model: models.CollectionCollection,
                  unique: false
                },
                foreignKey: 'subcollection_id',
                constraints: false
              })
              // models.Collection.belongsToMany(models.ProductVariant, {
              //   through: {
              //     model: models.ItemCollection,
              //     unique: false
              //   },
              //   foreignKey: 'collection_id'
              // })
              // models.ProductCollection.hasMany(models.ProductCollection, {
              //   as: 'collections'
              // })
              // models.ProductCollection.hasMany(models.Product, {
              //   as: 'products'
              // })
              // models.ProductCollection.hasMany(models.ProductImage, {
              //   as: 'images'
              // })
            },
            findByIdDefault: function(criteria, options) {
              if (!options) {
                options = {}
              }

              options = _.merge(options, queryDefaults.Collection.default(app))

              return this.findById(criteria, options)
            },
            findByHandle: function(handle, options) {
              if (!options) {
                options = {}
              }

              options = _.merge(options, {
                where: {
                  handle: handle
                }
              })
              options = _.merge(options, queryDefaults.Collection.default(app))
              return this.findOne(options)
            },
            findOneDefault: function(options) {
              if (!options) {
                options = {}
              }

              options = _.merge(options, queryDefaults.Collection.default(app))

              return this.findOne(options)
            },
            findAllDefault: function(options) {
              if (!options) {
                options = {}
              }
              options = _.merge(options, {})

              return this.findAll(options)
            },
            findAndCountDefault: function(options) {
              if (!options) {
                options = {}
              }
              options = _.merge(options, {})
              return this.findAndCount(options)
            },
            transformCollections: (collections, options) => {
              const Collection = app.orm['Collection']
              const Sequelize = Collection.sequelize
              if (!options) {
                options = {}
              }
              if (!collections) {
                collections = []
              }

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
