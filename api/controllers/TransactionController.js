'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')
// const Errors = require('proxy-engine-errors')

/**
 * @module TransactionController
 * @description Transaction Controller.
 */
module.exports = class TransactionController extends Controller {
  /**
   * count the amount of transactions
   * @param req
   * @param res
   */
  count(req, res){
    const ProxyEngineService = this.app.services.ProxyEngineService
    ProxyEngineService.count('Transaction')
      .then(count => {
        const counts = {
          transactions: count
        }
        return res.json(counts)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  /**
   *
   * @param req
   * @param res
   */
  authorize(req, res) {
    const TransactionService = this.app.services.TransactionService
    lib.Validator.validateTransaction.authorize(req.body)
      .then(values => {
        req.body.id = req.params.id
        return TransactionService.authorize(req.body)
      })
      .then(transaction => {
        return res.json(transaction)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  capture(req, res) {
    const TransactionService = this.app.services.TransactionService
    lib.Validator.validateTransaction.capture(req.body)
      .then(values => {
        req.body.id = req.params.id
        return TransactionService.capture(req.body)
      })
      .then(transaction => {
        return res.json(transaction)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  sale(req, res) {
    const TransactionService = this.app.services.TransactionService
    lib.Validator.validateTransaction.sale(req.body)
      .then(values => {
        req.body.id = req.params.id
        return TransactionService.sale(req.body)
      })
      .then(transaction => {
        return res.json(transaction)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  void(req, res) {
    const TransactionService = this.app.services.TransactionService
    lib.Validator.validateTransaction.void(req.body)
      .then(values => {
        req.body.id = req.params.id
        return TransactionService.void(req.body)
      })
      .then(transaction => {
        return res.json(transaction)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  refund(req, res) {
    const TransactionService = this.app.services.TransactionService
    lib.Validator.validateTransaction.refund(req.body)
      .then(values => {
        req.body.id = req.params.id
        return TransactionService.refund(req.body)
      })
      .then(transaction => {
        return res.json(transaction)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  // TODO
  create(req, res) {
  }
  // TODO
  update(req, res) {
  }
  // TODO
  destroy(req, res) {
  }
}

