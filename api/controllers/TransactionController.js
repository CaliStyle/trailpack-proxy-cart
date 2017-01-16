'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')
// const Errors = require('proxy-engine-errors')

/**
 * @module TransactionController
 * @description Transaction Controller.
 */
module.exports = class TransactionController extends Controller {
  authorize(req, res) {
    lib.Validator.validateTransaction.authorize(req.body)
      .then(values => {
        return res.json()
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  capture(req, res) {
    lib.Validator.validateTransaction.capture(req.body)
      .then(values => {
        return res.json()
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  sale(req, res) {
    lib.Validator.validateTransaction.sale(req.body)
      .then(values => {
        return res.json()
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  void(req, res) {
    lib.Validator.validateTransaction.void(req.body)
      .then(values => {
        return res.json()
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  refund(req, res) {
    lib.Validator.validateTransaction.refund(req.body)
      .then(values => {
        return res.json()
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

