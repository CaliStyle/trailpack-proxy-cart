/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const csvParser = require('babyparse')
const _ = require('lodash')
const Errors = require('../../lib/errors')
/**
 * @module ProxyCartService
 * @description ProxyCart Service
 */
module.exports = class ProxyCartService extends Service {
  /**
   * Internal method to retreive model object
   * @param modelName name of the model to retreive
   * @returns {*} sequelize model object
   * @private
   */
  _getModel(modelName) {
    return this.app.orm[modelName] || this.app.packs.sequelize.orm[modelName]
  }
  count(modelName, criteria, options) {
    const Model = this._getModel(modelName)
    const modelOptions = _.defaultsDeep({}, options, _.get(this.app.config, 'footprints.models.options'))
    if (!Model) {
      return Promise.reject(new Errors.ModelError('E_NOT_FOUND', `${modelName} can't be found`))
    }
    return Model.count(criteria, modelOptions)
  }
  /**
   *
   * @param file
   * @returns {Promise}
   */
  csv(file) {
    return new Promise((resolve, reject)=>{
      const options = {
        header: true,
        dynamicTyping: true,
        step: (results, parser) => {
          console.log('Row data:', results.data)
          console.log('Row errors:', results.errors)
          this.csvRow(results.data)
        },
        complete: (results, file) => {
          console.log('Parsing complete:', results, file)
          resolve()
        },
        error: (err, file) => {
          reject(err)
        }
      }
      // Parse the CSV/TSV
      csvParser(file, options)
    })
  }
  // TODO
  csvRow(row) {
    console.log(row)
    return
  }
  // TODO
  downloadImage(url) {

  }
  // TODO
  buildImages(imageUrl) {
    return new Promise((resolve, reject) =>{
      let full = imageUrl
      let thumbnail = imageUrl
      let small = imageUrl
      let medium = imageUrl
      let large = imageUrl

      return resolve({
        full: full,
        thumbnail: thumbnail,
        small: small,
        medium: medium,
        large: large
      })
    })
  }
  // TODO
  uploadImage(image) {

  }
  ouncesToGrams(ounces) {
    return ounces * 28.3495231
  }
  poundsToGrams(pounds) {
    return pounds * 16 * 28.3495231
  }
  kilogramsToGrams(kilogram) {
    return kilogram / 1000
  }
  resolveConversion(weight, weightUnit){
    switch (weightUnit) {
    case 'kg':
      return this.kilogramsToGrams(weight)
    case 'oz':
      return this.ouncesToGrams(weight)
    case 'lb':
      return this.poundsToGrams(weight)
    default:
      return weight
    }
  }
}

