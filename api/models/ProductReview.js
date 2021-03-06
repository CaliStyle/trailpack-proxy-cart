'use strict'

const Model = require('trails/model')

/**
 * @module ProductReview
 * @description Product Review Model
 */
module.exports = class ProductReview extends Model {

  static config (app, Sequelize) {
    return {
      options: {
        underscored: true,
        classMethods: {
          /**
           * Associate the Model
           * @param models
           */
          associate: (models) => {
            models.ProductReview.belongsTo(models.Customer, {
              // as: 'customer_id'
            })
            models.ProductReview.belongsTo(models.Product, {
              // as: 'product_id'
            })
            models.ProductReview.belongsTo(models.ProductVariant, {
              foreignKey: 'variant_id'
              // as: 'product_id'
            })
            models.ProductReview.belongsTo(models.User, {
              // as: 'product_id'
            })
            models.ProductReview.hasOne(models.Metadata, {
              as: 'metadata',
              foreignKey: 'product_review_id'
              // through: {
              //   model: models.ItemMetadata,
              //   unique: false,
              //   scope: {
              //     model: 'review'
              //   },
              //   foreignKey: 'model_id',
              //   constraints: false
              // }
            })
          }
        },
        instanceMethods: {
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
                  _metadata = _metadata || {product_review_id: this.id}
                  this.metadata = _metadata
                  this.setDataValue('metadata', _metadata)
                  this.set('metadata', _metadata)
                  return this
                })
            }
          },
        }
      }
    }
  }

  static schema (app, Sequelize) {
    return {
      // The ID of the customer who Reviewed
      customer_id: {
        type: Sequelize.INTEGER
      },
      // The ID of the user who reviewed
      user_id: {
        type: Sequelize.INTEGER
      },
      // The ID of the product Reviewed
      product_id: {
        type: Sequelize.INTEGER
      },
      // The ID of the product Reviewed
      variant_id: {
        type: Sequelize.INTEGER
      },
      // The ID of the metadata Reviewed
      metadata_id: {
        type: Sequelize.INTEGER
      },
      // The Score of the Review
      score: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      // The Review
      review: {
        type: Sequelize.TEXT
      },

      live_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: app.config.proxyEngine.live_mode
      }
    }
  }
}
