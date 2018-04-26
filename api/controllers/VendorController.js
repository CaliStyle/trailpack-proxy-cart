'use strict'

const Controller = require('trails/controller')
const _ = require('lodash')

/**
 * @module VendorController
 * @description Generated Trails.js Controller.
 */
module.exports = class VendorController extends Controller {
  /**
   * upload CSV
   * @param req
   * @param res
   */
  uploadCSV(req, res) {
    const VendorCsvService = this.app.services.VendorCsvService
    const csv = req.file

    if (!csv) {
      const err = new Error('File failed to upload')
      return res.serverError(err)
    }

    VendorCsvService.vendorCsv(csv.path)
      .then(result => {
        return res.json({
          file: req.file,
          result: result
        })
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
  findAll(req, res){
    const orm = this.app.orm
    const Vendor = orm['Vendor']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)

    Vendor.findAndCount({
      where: where,
      order: sort,
      offset: offset,
      limit: limit,
      req: req
    })
      .then(vendors => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, vendors.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, vendors.rows)
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
  search(req, res) {
    const orm = this.app.orm
    const Vendor = orm['Vendor']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['name', 'ASC']]
    const term = req.query.term
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)
    const defaults = _.defaults(where, {
      $or: [
        {
          name: {
            $iLike: `%${term}%`
          }
        }
      ]
    })
    // console.log('VendorController.search', term)
    Vendor.findAndCount({
      where: defaults,
      order: sort,
      offset: offset,
      req: req,
      limit: limit
    })
      .then(vendors => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, vendors.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, vendors.rows)
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
  products(req, res) {
    const Product = this.app.orm['Product']
    const vendorId = req.params.id
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    if (!vendorId) {
      const err = new Error('A vendor id is required')
      return res.send(401, err)
    }

    // const Vendor = this.app.orm['Vendor']
    const VendorProduct = this.app.orm['VendorProduct']

    let count = 0

    VendorProduct.findAndCount({
      where: {
        vendor_id: vendorId
      },
      attributes: ['product_id'],
      limit: limit,
      offset: offset
    })
      .then(arr => {
        count = arr.count
        const productIds = arr.rows.map(model => model.product_id)
        return Product.findAllDefault({
          where: {
            id: productIds
          },
          req: req
        })
      })
      .then(products => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, products)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })

    // Product.findAndCount({
    //   include: [
    //     {
    //       model: this.app.orm['Vendor'],
    //       as: 'vendors',
    //       required: true,
    //       where: {
    //         id: vendorId
    //       }
    //     }
    //   ],
    //   order: sort,
    //   offset: offset,
    //   limit: limit
    // })
    //   .then(products => {
    //     console.log('BROKE PRODUCTS', products)
    //     // Paginate
    //     this.app.services.ProxyEngineService.paginate(res, products.count, limit, offset, sort)
    //     return this.app.services.ProxyPermissionsService.sanitizeResult(req, products.rows)
    //   })
    //   .then(result => {
    //     return res.json(result)
    //   })
    //   .catch(err => {
    //     return res.serverError(err)
    //   })
  }

  /**
   *
   * @param req
   * @param res
   */
  processUpload(req, res) {
    const VendorCsvService = this.app.services.VendorCsvService
    VendorCsvService.processVendorUpload(req.params.id)
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
  // TODO
  exportVendors(req, res) {
    //
  }
}

