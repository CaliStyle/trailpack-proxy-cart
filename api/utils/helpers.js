/* eslint new-cap: [0] */
/* eslint no-console: [0, { allow: ["log","warn", "error"] }] */

'use strict'

const _ = require('lodash')

module.exports = {
  /**
   * JSON - Sequalize.JSON only works with postgres, this helper mocks it if postgres is not availible.
   * @param {String} cls
   * @param {Object} app
   * @param {Object} Sequelize
   * @param {String} field
   * @param {Object} options
   * @returns {*}
   */
  JSON: (cls, app, Sequelize, field, options) => {
    const database = app.config.database

    let sJSON

    if (!options) {
      options = {}
    }

    if (database.models[cls]) {
      if (database.stores[database.models[cls].store].dialect == 'postgres') {
        sJSON = () => {
          return _.defaults(options, {
            type: Sequelize.JSON
          })
        }
      }
    }
    else if (database.stores[database.models.defaultStore].dialect == 'postgres') {
      sJSON = () => {
        return _.defaults(options, {
          type: Sequelize.JSON
        })
      }
    }
    else {
      sJSON = (field) =>{
        if (_.isObject(options.defaultValue)) {
          options.defaultValue = JSON.stringify(options.defaultValue)
        }
        return _.defaults(options, {
          type: Sequelize.STRING,
          get: function() {
            return JSON.parse(this.getDataValue(field))
          },
          set: function(val) {
            return this.setDataValue(field, JSON.stringify(val))
          }
        })
      }
    }

    return sJSON(field)
  },

  /**
   * JSONB - Sequalize.JSOB only works in Postgres, this helper mocks it if JSONB is unavailable.
   * @param {String} cls
   * @param {Object} app
   * @param {Object} Sequelize
   * @param {String} field
   * @param {Object} options
   * @returns {*}
   */
  JSONB: (cls, app, Sequelize, field, options) => {
    const database = app.config.database

    let sJSONB

    if (!options) {
      options = {}
    }

    if (database.models[cls]) {
      if (database.stores[database.models[cls].store].dialect == 'postgres') {
        sJSONB = () => {
          return _.defaults(options, {
            type: Sequelize.JSONB
          })
        }
      }
    }
    else if (database.stores[database.models.defaultStore].dialect == 'postgres') {
      sJSONB = () => {
        return _.defaults(options, {
          type: Sequelize.JSONB
        })
      }
    }
    else {
      sJSONB = (field) =>{
        if (_.isObject(options.defaultValue)) {
          options.defaultValue = JSON.stringify(options.defaultValue)
        }
        return _.defaults(options, {
          type: Sequelize.STRING,
          get: function() {
            return JSON.parse(this.getDataValue(field))
          },
          set: function(val) {
            return this.setDataValue(field, JSON.stringify(val))
          }
        })
      }
    }
    return sJSONB(field)
  },

  /**
   * ARRAY - Sequelize.ARRAY only works on postgres, this helper mocks it if postgres is unavailable.
   * @param {String} cls
   * @param {Object} app
   * @param {Object} Sequelize
   * @param {Object} type
   * @param {String} field
   * @param {Object} options
   * @returns {*}
   */
  ARRAY: (cls, app, Sequelize, type, field, options) => {
    const database = app.config.database

    let sARRAY

    if (!options) {
      options = {}
    }
    if (database.models[cls]) {
      if (database.stores[database.models[cls].store].dialect == 'postgres') {
        sARRAY = (type) => {
          return _.defaults(options, {
            type: Sequelize.ARRAY(type)
          })
        }
      }
    }
    else if (database.stores[database.models.defaultStore].dialect == 'postgres') {
      sARRAY = (type) => {
        return _.defaults(options, {
          type: Sequelize.ARRAY(type)
        })
      }
    }
    else {
      sARRAY = (type, field) => {
        if (_.isObject(options.defaultValue)) {
          options.defaultValue = JSON.stringify(options.defaultValue)
        }
        return _.defaults(options, {
          type: Sequelize.STRING,
          get: function() {
            return JSON.parse(this.getDataValue(field))
          },
          set: function(val) {
            return this.setDataValue(field, JSON.stringify(val))
          }
        })
      }
    }
    return sARRAY(type, field)
  }
}
