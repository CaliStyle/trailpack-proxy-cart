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
  gateways(req, res) {
    const gateways = Object.keys(this.app.config.proxyGenerics)
      .map(key => {
        return this.app.config.proxyGenerics[key]
      }).filter(generic => generic.type === 'payment_processor')

    const opts = gateways.map(gate => {
      return {
        name: gate.name || 'Default',
        public: gate.options && gate.options.public ? gate.options.public : null
      }
    })

    res.json(opts)
  }
}
