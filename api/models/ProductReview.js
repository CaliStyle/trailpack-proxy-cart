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
        score: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        review: {
          type: Sequelize.TEXT
        },

        live_mode: {
          type: Sequelize.BOOLEAN,
          defaultValue: app.config.proxyCart.live_mode
        }
      }
    }
    return schema
  }
}
