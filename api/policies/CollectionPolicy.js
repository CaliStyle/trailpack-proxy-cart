'use strict'

const Policy = require('trails/policy')
const multer = require('multer')

/**
 * @module CollectionPolicy
 * @description Collection Policy
 */
module.exports = class CollectionPolicy extends Policy {
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

