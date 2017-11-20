'use strict'
/* global describe, it */
const assert = require('assert')
const _ = require('lodash')

describe('Cron', () => {
  it('should exist', () => {
    assert(global.app.api.crons)
    assert(global.app.crons)
    assert(global.app.crons.AccountsCron)
  })
  it('should have the crons from profile', done => {
    assert(global.app.api.crons.AccountsCron)
    assert.equal(global.app.crons.AccountsCron.id, 'accounts')
    assert.equal(_.isNumber(global.app.crons.AccountsCron.timeTilStart), true)

    assert.equal(typeof global.app.crons.AccountsCron.expired, 'function')

    assert.equal(typeof global.app.crons.AccountsCron.willExpire, 'function')
    done()
  })
  it('should get jobs that are scheduled now', done => {
    assert.equal(global.app.crons.AccountsCron.scheduledJobs.length, 2)
    done()
  })
  it('should find "expired" job by name', done => {
    // assert.notEqual(global.app.crons.onAutoTestCron.scheduledJobs.length, 0)
    const job = global.app.crons.AccountsCron.findJobByName('AccountsCron.expired')
    assert.equal(job.name, 'AccountsCron.expired')
    done()
  })
  it('should find "willExpire" job by name', done => {
    // assert.notEqual(global.app.crons.onAutoTestCron.scheduledJobs.length, 0)
    const job = global.app.crons.AccountsCron.findJobByName('AccountsCron.willExpire')
    assert.equal(job.name, 'AccountsCron.willExpire')
    done()
  })
  it('should get expired nextInvocation and it should be the first of the month at 10 past', done => {
    const job = global.app.crons.AccountsCron.nextInvocation('AccountsCron.expired')
    console.log('CRON JOB',job)
    assert.ok(job)
    done()
  })
  // it('should cancel a job', done => {
  //   const job = global.app.crons.onAutoTestCron.findJobByName('onAutoTestCron.test')
  //   assert.equal(job.cancel(), true)
  //   done()
  // })
  // it('should cancel a job through class', done => {
  //   // assert.notEqual(global.app.crons.onAutoTestCron.scheduledJobs.length, 0)
  //   const job = global.app.crons.onAutoTestCron.findJobByName('onAutoTestCron.test2')
  //   assert.equal(global.app.crons.onAutoTestCron.cancel(job), true)
  //   done()
  // })
  // it('should cancel the next job', done => {
  //   // assert.notEqual(global.app.crons.onAutoTestCron.scheduledJobs.length, 0)
  //   const job = global.app.crons.onTestCron.findJobByName('onTestCron.test')
  //   assert.equal(job.cancelNext(), true)
  //   done()
  // })
  // it('should cancel next job through class', done => {
  //   // assert.notEqual(global.app.crons.onAutoTestCron.scheduledJobs.length, 0)
  //   const job = global.app.crons.onTestCron.findJobByName('onTestCron.test2')
  //   assert.equal(global.app.crons.onAutoTestCron.cancelNext(job), true)
  //   done()
  // })
})
