'use strict'
/* global describe, it */

const assert = require('assert')
const supertest = require('supertest')

describe('CustomerPolicy', () => {
  let request, agent, customerID

  before(done => {
    request = supertest('http://localhost:3000')
    agent = supertest.agent(global.app.packs.express.server)

    agent
      .post('/customer')
      .send({
        first_name: 'test',
        last_name: 'mctester',
        company: 'test company'
      })
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)
        customerID = res.body.id
        // assert.equal(res.body.line_items.length, 1)
        // console.log('THIS POLICY CUSTOMER', res.body)
        done(err)
      })
  })

  it('should exist', () => {
    assert(global.app.api.policies['CustomerPolicy'])
    assert(global.app.policies['CustomerPolicy'])
  })

  it('should get customer in session', done => {
    agent
      .get('/customer/session')
      .expect(200)
      .end((err, res) => {
        // console.log('THIS POLICY CUSTOMER', res.body)
        assert.ok(res.body.id)
        assert.equal(res.body.id, customerID)
        // assert.equal(res.body.line_items.length, 1)
        done(err)
      })
  })

})
