/* eslint no-console: [0] */
'use strict'

const Controller = require('trails/controller')
// const Errors = require('proxy-engine-errors')
// const lib = require('../../lib')

/**
 * @module CartController
 * @description Cart Controller.
 */
// TODO lock down certain requests by Owner(s)
module.exports = class GatewayController extends Controller {
  /**
   *
   * @param req
   * @param res
   */
  gateway(req, res) {
    res.json({})
  }
}
