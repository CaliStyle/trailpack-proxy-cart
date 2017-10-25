'use strict'
/* global describe, it */
const assert = require('assert')

describe('Vendor Model', () => {
  let Vendor
  it('should exist', () => {
    assert(global.app.api.models['Vendor'])
    Vendor = global.app.services.ProxyEngineService.getModel('Vendor')
  })
  it('should resolve a vendor instance', (done) => {
    Vendor.resolve(Vendor.build({}))
      .then(vendor => {
        assert.ok(vendor instanceof Vendor)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
