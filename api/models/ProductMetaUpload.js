/* eslint new-cap: [0] */
'use strict'

const Model = require('trails/model')
const helpers = require('proxy-engine-helpers')

/**
 * @module ProductMetaUpload
 * @description Product Meta Upload
 */
module.exports = class ProductMetaUpload extends Model {

  static config (app, Sequelize) {
    const config = {

    }
    return config
  }

  static schema (app, Sequelize) {
    const schema = {
      upload_id: {
        type: Sequelize.STRING
      },
      handle: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Product',
          key: 'handle'
        }
      },
      data: helpers.JSON('productmetaupload', app, Sequelize, 'data', {
        defaultValue: {}
      })
    }
    return schema
  }
}
