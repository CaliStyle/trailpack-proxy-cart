'use strict'

const Service = require('trails/service')

/**
 * @module SubscriptionService
 * @description Subscription Service
 */
module.exports = class SubscriptionService extends Service {
  resolve(subscription, options){
    //
  }
  create() {
    //
  }
  update() {
    //
  }
  addItems() {
    //
  }
  addItem() {
    //
  }
  removeItems() {
    //
  }
  removeItem() {
    //
  }

  beforeCreate(subscription) {
    return Promise.resolve(subscription)
  }
  beforeUpdate(subscription) {
    return Promise.resolve(subscription)
  }
}

