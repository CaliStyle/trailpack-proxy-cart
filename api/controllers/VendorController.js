'use strict'

const Controller = require('trails/controller')

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
    const where = this.app.services.ProxyCartService.jsonCritera(req.query.where)

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

