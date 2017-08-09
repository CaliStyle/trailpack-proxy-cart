'use strict'

const Controller = require('trails/controller')
const Errors = require('proxy-engine-errors')
const lib = require('../../lib')

/**
 * @module TransactionController
 * @description Transaction Controller.
 */
module.exports = class TransactionController extends Controller {
  generalStats(req, res) {
    res.json({})
  }
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

  findAll(req, res) {
    const orm = this.app.orm
    const Transaction = orm['Transaction']
    const limit = Math.max(0, req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || 'created_at DESC'
    const where = this.app.services.ProxyCartService.jsonCritera(req.query.where)

    Transaction.findAndCount({
      order: sort,
      offset: offset,
      limit: limit,
      where: where
    })
      .then(transactions => {
        this.app.services.ProxyEngineService.paginate(res, transactions.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, transactions.rows)
      })
      .then(result => {
        return res.json(result)
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
  findById(req, res){
    const orm = this.app.orm
    const Transaction = orm['Transaction']
    let id = req.params.id
    if (!id && req.transaction) {
      id = req.transaction.id
    }
    Transaction.findById(id, {})
      .then(transaction => {
        if (!transaction) {
          throw new Errors.FoundError(Error(`Transaction id ${id} not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, transaction)
      })
      .then(result => {
        return res.json(result)
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
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, transaction)
      })
      .then(result => {
        return res.json(result)
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
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, transaction)
      })
      .then(result => {
        return res.json(result)
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
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, transaction)
      })
      .then(result => {
        return res.json(result)
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
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, transaction)
      })
      .then(result => {
        return res.json(result)
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
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, transaction)
      })
      .then(result => {
        return res.json(result)
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
  retry(req, res) {
    const TransactionService = this.app.services.TransactionService
    lib.Validator.validateTransaction.retry(req.body)
      .then(values => {
        req.body.id = req.params.id
        return TransactionService.retry(req.body)
      })
      .then(transaction => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, transaction)
      })
      .then(result => {
        return res.json(result)
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
  cancel(req, res) {
    const TransactionService = this.app.services.TransactionService
    lib.Validator.validateTransaction.cancel(req.body)
      .then(values => {
        req.body.id = req.params.id
        return TransactionService.cancel(req.body)
      })
      .then(transaction => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, transaction)
      })
      .then(result => {
        return res.json(result)
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

