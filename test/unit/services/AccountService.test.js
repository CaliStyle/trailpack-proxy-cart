'use strict'
/* global describe, it */
const assert = require('assert')

describe('AccountService', () => {
  let AccountService
  let Account
  it('should exist', () => {
    assert(global.app.api.services['AccountService'])
    AccountService = global.app.services['AccountService']
    Account = global.app.services.ProxyEngineService.getModel('Account')
  })
  it('should resolve a account instance', (done) => {
    Account.resolve(Account.build({}))
      .then(account => {
        assert.ok(account instanceof Account.Instance)
        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
