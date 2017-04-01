'use strict'

const Model = require('trails/model')
const _ = require('lodash')
const COLLECTION_SORT_ORDER = require('../utils/enums').COLLECTION_SORT_ORDER
const COLLECTION_PURPOSE = require('../utils/enums').COLLECTION_PURPOSE
const COLLECTION_DISCOUNT_SCOPE = require('../utils/enums').COLLECTION_DISCOUNT_SCOPE
const COLLECTION_DISCOUNT_TYPE = require('../utils/enums').COLLECTION_DISCOUNT_TYPE
const COLLECTION_TAX_TYPE = require('../utils/enums').COLLECTION_TAX_TYPE
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
                as: 'customer',
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
              options = _.merge(options, {})

              return this.findById(criteria, options)
            },
            findByHandle: function(handle, options) {
              options = _.merge(options, {
                where: {
                  handle: handle
                }
              })
              return this.findOne(options)
            },
            findOneDefault: function(options) {
              options = _.merge(options, {})

              return this.findOne(options)
            },
            findAllDefault: function(options) {
              options = _.merge(options, {})

              return this.findAll(options)
            },
            findAndCountDefault: function(options) {
              options = _.merge(options, {})

              return this.findAndCount(options)
            }
          }
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
          type: Sequelize.BOOLEAN
        },
        // When the Collection was published
        published_at: {
          type: Sequelize.DATE
        },
        // The scope Collection is published
        published_scope: {
          type: Sequelize.STRING
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

        // TODO Tax Percentage Override for products in this collection
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
        discount_percentage: {
          type: Sequelize.FLOAT,
          defaultValue: 0.0
        },
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
