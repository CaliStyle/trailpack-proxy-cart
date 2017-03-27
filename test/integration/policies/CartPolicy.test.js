'use strict'
/* global describe, it */

const assert = require('assert')
const supertest = require('supertest')

describe('CartPolicy', () => {
  let request, agent, cartID

  before(done => {
    request = supertest('http://localhost:3000')
    agent = supertest.agent(global.app.packs.express.server)

    agent
      .post('/cart/init')
      .send({
        line_items: []
      })
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.id)
        cartID = res.body.id
        // assert.equal(res.body.line_items.length, 1)
        // console.log('THIS POLICY CART', res.body)
        done(err)
      })
  })

  it('should exist', () => {
    assert(global.app.api.policies['CartPolicy'])
    assert(global.app.policies['CartPolicy'])
  })

  it('should get cart in session', done => {
    agent
      .get('/cart/session')
      .expect(200)
      .end((err, res) => {
        console.log('THIS POLICY CART', res.body)
        assert.ok(res.body.id)
        assert.equal(res.body.id, cartID)
        // assert.equal(res.body.line_items.length, 1)
        done(err)
      })
  })

})
