'use strict'
const joi = require('joi')
// const Schemas = require('./schemas')

module.exports = [
  // Customer
  {
    method: ['GET'],
    path: '/customer/:id',
    handler: 'CustomerController.findOne',
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
    path: '/customer',
    handler: 'CustomerController.create',
    config: {}
  },
  {
    method: ['POST'],
    path: '/customer/:id',
    handler: 'CustomerController.update',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/customer/uploadCSV',
    handler: 'CustomerController.uploadCSV',
    config: {}
  },
  {
    method: ['POST'],
    path: '/customer/processUpload/:id',
    handler: 'CustomerController.processUpload',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      }
    }
  },
  // Cart
  {
    method: ['GET'],
    path: '/cart/count',
    handler: 'CartController.count',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/cart',
    handler: 'CartController.create',
    config: {}
  },
  {
    method: ['POST'],
    path: '/cart/:id/checkout',
    handler: 'CartController.checkout',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/cart/:id/addItems',
    handler: 'CartController.addItems',
    config: {}
  },
  {
    method: ['POST'],
    path: '/cart/:id/removeItems',
    handler: 'CartController.removeItems',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/cart/:id/clear',
    handler: 'CartController.clear',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      }
    }
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
    method: ['GET'],
    path: '/product/count',
    handler: 'ProductController.count',
    config: {
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
  },
  {
    method: ['DELETE','POST'],
    path: '/product/removeVariant/:id',
    handler: 'ProductController.removeVariant',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      }
    }
  },
  {
    method: ['DELETE','POST'],
    path: '/product/removeVariants',
    handler: 'ProductController.removeVariants',
    config: {}
  },
  {
    method: ['DELETE','POST'],
    path: '/product/removeImage/:id',
    handler: 'ProductController.removeImage',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      }
    }
  },
  {
    method: ['DELETE','POST'],
    path: '/product/removeImages',
    handler: 'ProductController.removeImages',
    config: {}
  },
  {
    method: ['POST'],
    path: '/product/uploadCSV',
    handler: 'ProductController.uploadCSV',
    config: {}
  },
  {
    method: ['POST'],
    path: '/product/processUpload/:id',
    handler: 'ProductController.processUpload',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      }
    }
  }
]
