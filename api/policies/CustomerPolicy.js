'use strict'

const Policy = require('trails/policy')
const multer = require('multer')

/**
 * @module CustomerPolicy
 * @description Customer Policy
 */
module.exports = class CustomerPolicy extends Policy {
  csv(req, res, next) {
    const upload = multer({dest: 'test/uploads/'})
    upload.single('csv')(req, res, err => {
      if (err) {
        this.log.info(err)
      }
      next()
    })
  }
}

