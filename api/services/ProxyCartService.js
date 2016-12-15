/* eslint no-console: [0] */
'use strict'

const Service = require('trails/service')
const csvParser = require('babyparse')
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
  uploadImage(image) {

  }
}

