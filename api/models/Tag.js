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
                  unique: false
                },
                foreignKey: 'tag_id',
                constraints: false
              })
              models.Tag.belongsToMany(models.Customer, {
                through: {
                  model: models.ItemTag,
                  unique: false
                },
                foreignKey: 'tag_id',
                constraints: false
              })
            },
            transformTags: (tags) => {
              const Tag = app.orm['Tag']
              tags = _.map(tags, tag => {
                if (_.isString(tag)) {
                  tag = { name: tag }
                }
                return _.omit(tag, ['created_at','updated_at'])
              })
              // console.log('TAGS', tags)
              return Tag.sequelize.transaction(t => {
                return Promise.all(tags.map((tag, index) => {
                  return Tag.findOne({
                    where: tag,
                    attributes: ['id', 'name']
                  })
                    .then(tag => {

                      if (tag) {
                        // console.log('TAG', tag.get({ plain: true }))
                        return tag
                      }
                      // console.log('TAG',tags[index])
                      return Tag.create(tags[index])
                    })
                }))
              })
            },
            reverseTransformTags: (tags) => {
              tags = _.map(tags, tag => {
                if (_.isString(tag)) {
                  return tag
                }
                return tag.name
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
          defaultValue: app.config.proxyCart.live_mode
        }
      }
    }
    return schema
  }
}
