'use strict'

const Policy = require('trails/policy')
const multer = require('multer')

/**
 * @module SubscriptionPolicy
 * @description Subscription Policy
 */
module.exports = class SubscriptionPolicy extends Policy {
  csv(req, res, next) {
    const upload = multer({dest: 'test/uploads/'})
    upload.single('file')(req, res, err => {
      if (err) {
        this.log.info(err)
      }
      next()
    })
  }
}

