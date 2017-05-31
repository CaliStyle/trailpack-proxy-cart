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

