'use strict'
const joi = require('joi')
// const Schemas = require('./schemas')

module.exports = [
  // Cart
  {
    method: ['POST'],
    path: '/cart/checkout',
    handler: 'CartController.checkout',
    config: {}
  },
  {
    method: ['POST'],
    path: '/cart/addItems',
    handler: 'CartController.addItems',
    config: {}
  },
  {
    method: ['POST'],
    path: '/cart/removeItems',
    handler: 'CartController.removeItems',
    config: {}
  },
  {
    method: ['POST'],
    path: '/cart/clear',
    handler: 'CartController.clear',
    config: {}
  },
  {
    method: ['POST'],
    path: '/cart/clear',
    handler: 'CartController.clearCart',
    config: {}
  },
  // Products
  {
    method: ['GET'],
    path: '/product/:id',
    handler: 'ProductController.findOne',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/product/addProducts',
    handler: 'ProductController.addProducts',
    config: {}
  },
  {
    method: ['POST','PUT'],
    path: '/product/updateProducts',
    handler: 'ProductController.updateProducts',
    config: {}
  },
  {
    method: ['DELETE','POST'],
    path: '/product/removeProducts',
    handler: 'ProductController.removeProducts',
    config: {}
  }
]
