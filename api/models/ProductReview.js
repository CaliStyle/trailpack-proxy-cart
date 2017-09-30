'use strict'

const Model = require('trails/model')

/**
 * @module ProductReview
 * @description Product Review Model
 */
module.exports = class ProductReview extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
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
              models.ProductReview.belongsTo(models.User, {
                // as: 'product_id'
              })
              models.ProductReview.hasOne(models.Metadata, {
                as: 'metadata',
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
          }
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    let schema = {}
    if (app.config.database.orm === 'sequelize') {
      schema = {
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
    return schema
  }
}
