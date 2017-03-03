'use strict'
const joi = require('joi')
// const Schemas = require('./schemas')

module.exports = [
  // Customer
  {
    method: ['POST'],
    path: '/customer',
    handler: 'CustomerController.create',
    config: {
      app: {
        proxyPermissions: {
          public: true
        }
      }
    }
  },
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
        },
        proxyPermissions: {
          admin: true,
          owner: true
        }
      }
    }
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
      },
      app: {
        proxyPermissions: {
          admin: true,
          owner: true
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/count',
    handler: 'CustomerController.count',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/customer/uploadCSV',
    handler: 'CustomerController.uploadCSV',
    config: {
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
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
      },
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/customer/export',
    handler: 'CustomerController.exportCustomers',
    config: {
      app: {
        proxyPermissions: {
          admin: true
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
      },
      proxyPermissions: {
        admin: true
      }
    }
  },
  {
    method: ['POST'],
    path: '/cart',
    handler: 'CartController.create',
    config: {
      app: {
        proxyPermissions: {
          public: true
        }
      }
    }
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
      },
      app: {
        proxyPermissions: {
          owner: true,
          public: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/cart/:id/addItems',
    handler: 'CartController.addItems',
    config: {
      app: {
        proxyPermissions: {
          owner: true,
          public: true
        }
      }
    }
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
      },
      app: {
        proxyPermissions: {
          owner: true,
          public: true
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
      },
      app: {
        proxyPermissions: {
          owner: true,
          public: true
        }
      }
    }
  },
  // Collections
  {
    method: ['GET'],
    path: '/collection',
    handler: 'CollectionController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          order: joi.string()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          public: true
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/collection/:id',
    handler: 'CollectionController.findOne',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          public: true
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/collection/count',
    handler: 'CollectionController.count',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          public: true
        }
      }
    }
  },
  // Products
  {
    method: ['GET'],
    path: '/product',
    handler: 'ProductController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          order: joi.string()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          public: true
        }
      }
    }
  },
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
        },
        proxyPermissions: {
          public: true
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/product/tag/:tag',
    handler: 'ProductController.findByTag',
    config: {
      validate: {
        params: {
          tag: joi.string().required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          order: joi.string()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          public: true
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/product/collection/:handle',
    handler: 'ProductController.findByCollection',
    config: {
      validate: {
        params: {
          handle: joi.string().required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          order: joi.string()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          public: true
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
        },
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/product/add',
    handler: 'ProductController.addProduct',
    config: {
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/product/addProducts',
    handler: 'ProductController.addProducts',
    config: {
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/product/:id/update',
    handler: 'ProductController.updateProduct',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/product/updateProducts',
    handler: 'ProductController.updateProducts',
    config: {
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['DELETE','POST'],
    path: '/product/:id/remove',
    handler: 'ProductController.removeProduct',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['DELETE','POST'],
    path: '/product/removeProducts',
    handler: 'ProductController.removeProducts',
    config: {
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['DELETE','POST'],
    path: '/product/variant/:id/remove',
    handler: 'ProductController.removeVariant',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['DELETE','POST'],
    path: '/product/removeVariants',
    handler: 'ProductController.removeVariants',
    config: {
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['DELETE','POST'],
    path: '/product/image/:id/remove',
    handler: 'ProductController.removeImage',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['DELETE','POST'],
    path: '/product/removeImages',
    handler: 'ProductController.removeImages',
    config: {
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/product/uploadCSV',
    handler: 'ProductController.uploadCSV',
    config: {
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
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
      },
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/product/export',
    handler: 'ProductController.exportProducts',
    config: {
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/product/uploadMetaCSV',
    handler: 'ProductController.uploadMetaCSV',
    config: {
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/product/processMetaUpload/:id',
    handler: 'ProductController.processMetaUpload',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  // Orders
  {
    method: ['GET'],
    path: '/order',
    handler: 'OrderController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          order: joi.string()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          admin: true,
          owner: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/order',
    handler: 'OrderController.create',
    config: {
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/order/:id',
    handler: 'OrderController.findOne',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          admin: true,
          owner: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/order/:id',
    handler: 'OrderController.update',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          admin: true,
          owner: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/order/:id/cancel',
    handler: 'OrderController.cancel',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          admin: true,
          owner: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/order/:id/refund',
    handler: 'OrderController.refund',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/order/count',
    handler: 'OrderController.count',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/order/export',
    handler: 'OrderController.exportOrders',
    config: {
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  // Shop
  {
    method: ['GET'],
    path: '/shop/count',
    handler: 'ShopController.count',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/shop',
    handler: 'ShopController.create',
    config: {
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  // Subscription
  {
    method: ['GET'],
    path: '/subscription/count',
    handler: 'SubscriptionController.count',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  //  Transaction
  {
    method: ['POST'],
    path: '/transaction',
    handler: 'TransactionController.create',
    config: {
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/transaction/:id',
    handler: 'TransactionController.update',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/transaction/:id',
    handler: 'TransactionController.destroy',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/transaction/:id/authorize',
    handler: 'TransactionController.authorize',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/transaction/:id/capture',
    handler: 'TransactionController.capture',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/transaction/:id/sale',
    handler: 'TransactionController.sale',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/transaction/:id/void',
    handler: 'TransactionController.void',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/transaction/:id/refund',
    handler: 'TransactionController.refund',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  // Fulfillment
  {
    method: ['POST'],
    path: '/fulfillment',
    handler: 'FulfillmentController.create',
    config: {
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/fulfillment/:id',
    handler: 'FulfillmentController.update',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/fulfillment/:id',
    handler: 'FulfillmentController.destroy',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          admin: true
        }
      }
    }
  }
]
