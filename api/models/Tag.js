/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const _ = require('lodash')
/**
 * @module Tag
 * @description Tag Model
 */
module.exports = class Tag extends Model {

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
              models.Tag.belongsToMany(models.Product, {
                through: {
                  model: models.ItemTag,
                  unique: false,
                  scope: {
                    model: 'product'
                  }
                },
                foreignKey: 'tag_id',
                constraints: false
              })
              models.Tag.belongsToMany(models.Customer, {
                through: {
                  model: models.ItemTag,
                  unique: false,
                  scope: {
                    model: 'customer'
                  }
                },
                foreignKey: 'tag_id',
                constraints: false
              })
              models.Tag.belongsToMany(models.Collection, {
                through: {
                  model: models.ItemTag,
                  unique: false,
                  scope: {
                    model: 'collection'
                  }
                },
                foreignKey: 'tag_id',
                constraints: false
              })
            },
            /**
             *
             * @param tags
             * @param options
             * @returns {Promise.<*>}
             */
            transformTags: (tags, options) => {
              const Tag = app.orm['Tag']
              const Sequelize = Tag.sequelize
              if (!options) {
                options = {}
              }
              if (!tags) {
                tags = []
              }

              tags = tags.map(tag => {
                if (tag && _.isString(tag)) {
                  tag = { name: tag }
                  return tag
                }
                else if (tag) {
                  return _.omit(tag, ['created_at','updated_at'])
                }
              })
              // console.log('THESE TAGS', tags)
              return Sequelize.Promise.mapSeries(tags, tag => {
                const newTag = tag
                return Tag.findOne({
                  where: {
                    name: tag.name
                  },
                  attributes: ['id', 'name'],
                  transaction: options.transaction || null
                })
                  .then(tag => {
                    if (tag) {
                      return tag
                    }
                    else {
                      return Tag.create(newTag, {
                        transaction: options.transaction || null
                      })
                    }
                  })
              })
            },
            reverseTransformTags: (tags) => {
              tags = _.map(tags, tag => {
                if (tag && _.isString(tag)) {
                  return tag
                }
                else if (tag && tag.name) {
                  return tag.name
                }
              })
              return tags
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
        // The Tag Name
        name: {
          type: Sequelize.STRING,
          unique: true,
          notNull: true,
          set: function(val) {
            this.setDataValue('name', val.toLowerCase())
          }
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
