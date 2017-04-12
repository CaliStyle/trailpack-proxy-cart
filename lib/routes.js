'use strict'
const joi = require('joi')
// const Schemas = require('./schemas')

module.exports = [
  // Cart
  {
    method: ['GET'],
    path: '/cart',
    handler: 'CartController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.string(),
          where: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetCartRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/cart',
    handler: 'CartController.create',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiPostCartRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/cart/:id',
    handler: 'CartController.findById',
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
          resource: 'apiGetCartIdRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/cart/count',
    handler: 'CartController.count',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetCartCountRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET','POST'],
    path: '/cart/init',
    handler: 'CartController.init',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/cart/session',
    handler: 'CartController.session',
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
    path: '/cart/logout',
    handler: 'CartController.logout',
    config: {
      app: {
        proxyPermissions: {
          resource: 'apiPostCartLogoutRoute',
          roles: ['public']
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
          resource: 'apiGetCustomerCountRoute',
          roles: ['admin']
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
          resource: 'apiPostCustomerExportRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/cart/checkout',
    handler: 'CartController.checkout',
    config: {
      app: {
        proxyPermissions: {
          resource: 'apiPostCartCheckoutRoute',
          roles: ['public','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/cart/addItems',
    handler: 'CartController.addItems',
    config: {
      app: {
        proxyPermissions: {
          resource: 'apiPostCartAddItemsRoute',
          roles: ['public','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/cart/removeItems',
    handler: 'CartController.removeItems',
    config: {
      app: {
        proxyPermissions: {
          resource: 'apiPostCartRemoveItemsRoute',
          roles: ['public','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/cart/clear',
    handler: 'CartController.addItems',
    config: {
      app: {
        proxyPermissions: {
          resource: 'apiPostCartClearRoute',
          roles: ['public','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/cart/login',
    handler: 'CartController.login',
    config: {
      app: {
        proxyPermissions: {
          resource: 'apiPostCartLoginRoute',
          roles: ['public','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/cart/:id/login',
    handler: 'CartController.login',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource: 'apiPostCartIdLoginRoute',
          roles: ['public','registered']
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
          resource: 'apiPostCartCheckoutRoute',
          roles: ['public','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/cart/:id/switch',
    handler: 'CartController.switchCart',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource: 'apiPostCartIdSwitchRoute',
          roles: ['public','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/cart/:id/addItems',
    handler: 'CartController.addItems',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource: 'apiPostCartIdAddItemsRoute',
          roles: ['public','registered']
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
          resource: 'apiPostCartIdRemoveItemsRoute',
          roles: ['public','registered']
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
          resource: 'apiPostCartIdClearRoute',
          roles: ['public','registered']
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
          sort: joi.string(),
          where: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetCollectionRoute',
          roles: ['public']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/collection',
    handler: 'CollectionController.create',
    config: {
      app: {
        proxyPermissions: {
          resource: 'apiPostCollectionRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/collection/:id',
    handler: 'CollectionController.update',
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
          resource: 'apiPostCollectionIdRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/collection/:id',
    handler: 'CollectionController.findById',
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
          resource: 'apiGetCollectionIdRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/collection/handle/:handle',
    handler: 'CollectionController.findByHandle',
    config: {
      validate: {
        params: {
          handle: joi.string().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetCollectionHandleRoute',
          roles: ['public']
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
          resource: 'apiGetCollectionCountRoute',
          roles: ['public']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/collection/uploadCSV',
    handler: 'CollectionController.uploadCSV',
    config: {
      app: {
        proxyPermissions: {
          resource: 'apiPostCollectionUploadCsvRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/collection/processUpload/:id',
    handler: 'CollectionController.processUpload',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource: 'apiPostCollectionProcessUploadRoute',
          roles: ['admin']
        }
      }
    }
  },
  // Customer
  {
    method: ['GET'],
    path: '/customer',
    handler: 'CustomerController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.string(),
          where: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetCustomerRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/customer',
    handler: 'CustomerController.create',
    config: {
      app: {
        proxyPermissions: {
          resource: 'apiPostCustomerRoute',
          roles: ['public']
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
          resource: 'apiPostCustomerProcessUploadRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/:id',
    handler: 'CustomerController.findById',
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
          resource: 'apiGetCustomerIdRoute',
          roles: ['admin','registered']
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
          resource: 'apiPostCustomerIdRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/customer/:id/login',
    handler: 'CustomerController.login',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource: 'apiPostCustomerIdLoginRoute',
          roles: ['public']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/customer/:id/source',
    handler: 'CustomerController.addSource',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource: 'apiPostCustomerIdSourceRoute',
          roles: ['public']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/customer/:id/source/:source',
    handler: 'CustomerController.updateSource',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource: 'apiPostCustomerIdSourceIdRoute',
          roles: ['public']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/customer/:id/source/:source',
    handler: 'CustomerController.destroySource',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource: 'apiDeleteCustomerIdSourceSourceRoute',
          roles: ['public']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/:id/accounts',
    handler: 'CustomerController.accounts',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.string(),
          where: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetCustomerIdAccountsRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/:id/orders',
    handler: 'CustomerController.orders',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.string(),
          where: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetCustomerIdOrdersRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/:id/sources',
    handler: 'CustomerController.sources',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.string(),
          where: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetCustomerIdSourcesRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/:id/subscriptions',
    handler: 'CustomerController.subscriptions',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.string(),
          where: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetCustomerIdSubscriptionsRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/account/:account',
    handler: 'CustomerController.account',
    config: {
      validate: {
        params: {
          account: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetCustomerAccountAccountRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/order/:order',
    handler: 'CustomerController.order',
    config: {
      validate: {
        params: {
          order: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetCustomerOrderOrderRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/customer/source',
    handler: 'CustomerController.addSource',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiPostCustomerSourceRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/source/:source',
    handler: 'CustomerController.source',
    config: {
      validate: {
        params: {
          source: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetCustomerSourceSourceRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/customer/source/:source',
    handler: 'CustomerController.updateSource',
    config: {
      validate: {
        params: {
          source: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiPostCustomerSourceSourceRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/customer/source/:source',
    handler: 'CustomerController.destorySource',
    config: {
      validate: {
        params: {
          source: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiDeleteCustomerSourceSourceRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/subscription/:subscription',
    handler: 'CustomerController.subscription',
    config: {
      validate: {
        params: {
          subscription: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetCustomerSubscriptionSubscriptionRoute',
          roles: ['admin','registered']
        }
      }
    }
  },

  {
    method: ['POST'],
    path: '/customer/login',
    handler: 'CustomerController.login',
    config: {
      app: {
        proxyPermissions: {
          resource: 'apiPostCustomerLoginRoute',
          roles: ['public']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/customer/logout',
    handler: 'CustomerController.logout',
    config: {
      app: {
        proxyPermissions: {
          resource: 'apiPostCustomerLogoutRoute',
          roles: ['public']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/accounts',
    handler: 'CustomerController.accounts',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.string(),
          where: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetCustomerAccountsRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/orders',
    handler: 'CustomerController.orders',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.string(),
          where: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetCustomerOrdersRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/sources',
    handler: 'CustomerController.sources',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.string(),
          where: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetCustomerSourcesRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/subscriptions',
    handler: 'CustomerController.subscriptions',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.string(),
          where: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetCustomerSubscriptionsRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/session',
    handler: 'CustomerController.session',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetCustomerSessionRoute',
          roles: ['public']
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
          resource: 'apiPostCustomerUploadCsvRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/customer/:id/switch',
    handler: 'CustomerController.switchCustomer',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource: 'apiPostCustomerIdSwitchRoute',
          roles: ['public','registered']
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
          resource: 'apiPostFulfillmentRoute',
          roles: ['admin']
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
          resource: 'apiPostFulfillmentIdRoute',
          roles: ['admin']
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
          resource: 'apiDeleteFulfillmentIdRoute',
          roles: ['admin']
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
          sort: joi.string(),
          where: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetProductRoute',
          roles: ['public']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/product/:id',
    handler: 'ProductController.findById',
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
          resource: 'apiGetProductIdRoute',
          roles: ['public']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/product/search',
    handler: 'ProductController.search',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.string(),
          where: joi.any(),
          term: joi.string().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetProductSearchRoute',
          roles: ['public']
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
          sort: joi.string(),
          where: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetProductTagRoute',
          roles: ['public']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/product/handle/:handle',
    handler: 'ProductController.findByHandle',
    config: {
      validate: {
        params: {
          handle: joi.string().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetProductHandleRoute',
          roles: ['public']
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
          resource: 'apiGetProductCollectionHandleRoute',
          roles: ['public']
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
          resource: 'apiGetProductCountRoute',
          roles: ['admin']
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
          resource: 'apiPostProductAddRoute',
          roles: ['admin']
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
          resource: 'apiPostProductAddProductsRoute',
          roles: ['admin']
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
          resource: 'apiPostProductIdUpdateRoute',
          roles: ['admin']
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
          resource: 'apiPostProductUpdateProductsRoute',
          roles: ['admin']
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
          resource: 'apiDeleteProductIdRemoveRoute',
          roles: ['admin']
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
          resource: 'apiPostProductRemoveProductRoute',
          roles: ['admin']
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
          resource: 'apiPostProductVariantIdRemoveRoute',
          roles: ['admin']
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
          resource: 'apiPostProductRemoveVariantRoute',
          roles: ['admin']
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
          resource: 'apiPostProductImageIdRemoveRoute',
          roles: ['admin']
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
          resource: 'apiPostProductRemoveImagesRoute',
          roles: ['admin']
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
          resource: 'apiPostProductUploadCsvRoute',
          roles: ['admin']
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
          resource: 'apiPostProductProcessUploadRoute',
          roles: ['admin']
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
          resource: 'apiPostProductExportRoute',
          roles: ['admin']
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
          resource: 'apiPostProductUploadMetaCsvRoute',
          roles: ['admin']
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
          resource: 'apiPostProductProcessMetaUploadRoute',
          roles: ['admin']
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
          sort: joi.string(),
          where: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetOrderRoute',
          roles: ['admin','registered']
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
          resource: 'apiPostOrderRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/order/:id',
    handler: 'OrderController.findById',
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
          resource: 'apiGetOrderIdRoute',
          roles: ['admin','registered']
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
          resource: 'apiPostOrderIdRoute',
          roles: ['admin','registered']
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
          resource: 'apiPostOrderIdCancelRoute',
          roles: ['admin','registered']
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
          resource: 'apiPostOrderIdRefundRoute',
          roles: ['admin']
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
          resource: 'apiGetOrderCountRoute',
          roles: ['admin']
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
          resource: 'apiPostOrderExportRoute',
          roles: ['admin']
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
          resource: 'apiGetShopCountRoute',
          roles: ['admin']
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
          resource: 'apiPostShopRoute',
          roles: ['admin']
        }
      }
    }
  },
  // Subscription
  {
    method: ['GET'],
    path: '/subscription',
    handler: 'SubscriptionController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.string(),
          where: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource: 'apiGetSubscriptionRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/subscription/:id',
    handler: 'SubscriptionController.update',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource: 'apiPostSubscriptionIdRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/subscription/:id',
    handler: 'SubscriptionController.findById',
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
          resource: 'apiGetSubscriptionIdRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/subscription/:id/activate',
    handler: 'SubscriptionController.activate',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource: 'apiGetSubscriptionIdActivateRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/subscription/:id/addItems',
    handler: 'SubscriptionController.addItems',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource: 'apiPostSubscriptionIdAddItemsRoute',
          roles: ['admin', 'registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/subscription/:id/cancel',
    handler: 'SubscriptionController.cancel',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource: 'apiPostSubscriptionIdCancelRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/subscription/:id/removeItems',
    handler: 'SubscriptionController.removeItems',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource: 'apiPostSubscriptionIdRemoveItemsRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/subscription/:id/update',
    handler: 'SubscriptionController.update',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource: 'apiGetSubscriptionIdUpdateRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
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
          resource: 'apiGetSubscriptionCountRoute',
          roles: ['admin']
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
          resource: 'apiPostTransactionRoute',
          roles: ['admin']
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
          resource: 'apiPostTransactionIdRoute',
          roles: ['admin']
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
          resource: 'apiDeleteTransactionIdRoute',
          roles: ['admin']
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
          resource: 'apiPostTransactionAuthorizeRoute',
          roles: ['admin']
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
          resource: 'apiPostTransactionIdCaptureRoute',
          roles: ['admin']
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
          resource: 'apiPostTransactionIdSaleRoute',
          roles: ['admin']
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
          resource: 'apiPostTransactionIdVoidRoute',
          roles: ['admin']
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
          resource: 'apiPostTransactionIdRefundRoute',
          roles: ['admin']
        }
      }
    }
  }
]
