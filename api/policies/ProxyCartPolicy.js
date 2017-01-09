'use strict'

const Policy = require('trails/policy')

/**
 * @module ProxyCartPolicy
 * @description Proxy Cart Policy
 */
module.exports = class ProxyCartPolicy extends Policy {
  clientDetails(req, res, next) {
    // Init Client Details
    // TODO add browser and session
    const clientDetails = {
      browser_ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      accept_language: req.headers['accept-language'],
      user_agent: req.headers['user-agent'],
      browser_height: '',
      browser_width: '',
      session_hash: '',
      latitude: '',
      longitude: '',
    }
    // Attach values to the request body
    req.body.ip = clientDetails.browser_ip
    req.body.client_details = clientDetails
    this.app.log.silly('ProxyCartPolicy.clientDetails', clientDetails)
    next()
  }
}

