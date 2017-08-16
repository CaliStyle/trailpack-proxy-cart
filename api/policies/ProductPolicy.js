'use strict'

const Policy = require('trails/policy')
const multer = require('multer')
/**
 * @module ProductPolicy
 * @description Product Policy
 */
module.exports = class ProductPolicy extends Policy {
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  image(req, res, next) {
    const upload = multer({dest: 'test/uploads/'})
    upload.single('file')(req, res, err => {
      if (err) {
        this.log.info(err)
      }
      next()
    })
  }

  /**
   *
   * @param req
   * @param res
   * @param next
   */
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

