/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const csvParser = require('babyparse')
const _ = require('lodash')
// const Errors = require('proxy-engine-errors')
const PRODUCT_UPLOAD = require('../utils/enums').PRODUCT_UPLOAD
const fs = require('fs')
const shortid = require('shortid')
/**
 * @module ProxyCartService
 * @description ProxyCart Service
 */
module.exports = class ProxyCartService extends Service {
  /**
   *
   * @param file
   * @returns {Promise}
   */
  csv(file) {
    // TODO validate csv
    console.time('csv')
    const uploadID = shortid.generate()
    const ProxyEngineService = this.app.services.ProxyEngineService

    return new Promise((resolve, reject)=>{
      const options = {
        header: true,
        dynamicTyping: true,
        step: (results, parser) => {
          // console.log(parser)
          // console.log('Row data:', results.data)
          // TODO handle errors
          // console.log('Row errors:', results.errors)
          parser.pause()
          this.csvRow(results.data[0], uploadID)
            .then(row => {
              // console.log(row)
              parser.resume()
            })
            .catch(err => {
              console.log(err)
              parser.resume()
            })
        },
        complete: (results, file) => {
          console.timeEnd('csv')
          // console.log('Parsing complete:', results, file)
          results.upload_id = uploadID
          ProxyEngineService.count('ProductUpload', { upload_id: uploadID })
            .then(count => {
              results.products = count
              resolve(results)
            })
            // TODO handle this more gracefully
            .catch(err => {
              reject(err)
            })
        },
        error: (err, file) => {
          reject(err)
        }
      }
      const fileString = fs.readFileSync(file, 'utf8')
      // Parse the CSV/TSV
      csvParser.parse(fileString, options)
    })
  }

  /**
   *
   * @param row
   * @param uploadID
   */
  csvRow(row, uploadID) {
    // console.log(row)
    const ProductUpload = this.app.services.ProxyEngineService.getModel('ProductUpload')
    const values = _.values(PRODUCT_UPLOAD)
    const keys = _.keys(PRODUCT_UPLOAD)
    const upload = {
      upload_id: uploadID,
      options: {}
    }

    _.each(row, (data, key) => {
      const i = values.indexOf(key.replace(/^\s+|\s+$/g,''))
      const k = keys[i]
      if (i > -1 && k) {
        upload[k] = data
      }
      else {
        const optionsReg = new RegExp('^((Option \/).([0-9]).(Name|Value))','g')
        const match = optionsReg.exec(key)
        // console.log(match)
        if (typeof match[3] !== 'undefined' && match[4] !== 'undefined') {
          const part = match[4].toLowerCase()
          const index = Number(match[3]) - 1
          // console.log(index, part)
          if (typeof upload.options[index] === 'undefined') {
            upload.options[index] = { name: '', value: '' }
          }
          upload.options[index][part] = data
        }
      }
    })

    // Handle Options
    upload.options = _.map(upload.options, option => {
      const rectObj = {}
      rectObj[option.name] = option.value
      return rectObj
    })
    // TODO handle Images (product, variant, alt texts)
    const newProduct = ProductUpload.build(upload)
    return newProduct.save()
  }
  // TODO
  processUpload(uploadId) {
    // console.log(uploadId)
    return new Promise((resolve, reject) => {
      return resolve({})
    })
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

