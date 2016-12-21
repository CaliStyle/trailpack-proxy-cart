'use strict'

const Policy = require('trails/policy')
const multer = require('multer')
/**
 * @module ProductPolicy
 * @description Product Policy
 */
module.exports = class ProductPolicy extends Policy {
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

