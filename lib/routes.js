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
          resource_name: 'apiGetCartRoute',
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
          resource_name: 'apiPostCartRoute',
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
          resource_name: 'apiGetCartIdRoute',
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
          resource_name: 'apiGetCartCountRoute',
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
          resource_name: 'apiPostCartLogoutRoute',
          roles: ['public','registered','admin']
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
          resource_name: 'apiPostCartCheckoutRoute',
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
          resource_name: 'apiPostCartAddItemsRoute',
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
          resource_name: 'apiPostCartRemoveItemsRoute',
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
          resource_name: 'apiPostCartClearRoute',
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
          resource_name: 'apiPostCartLoginRoute',
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
          resource_name: 'apiPostCartIdLoginRoute',
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
          resource_name: 'apiPostCartIdCheckoutRoute',
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
          resource_name: 'apiPostCartIdSwitchRoute',
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
          resource_name: 'apiPostCartIdAddItemsRoute',
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
          resource_name: 'apiPostCartIdRemoveItemsRoute',
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
          resource_name: 'apiPostCartIdClearRoute',
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
          resource_name: 'apiGetCollectionRoute',
          roles: ['public','registered','admin']
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
          resource_name: 'apiPostCollectionRoute',
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
          resource_name: 'apiPostCollectionIdRoute',
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
          resource_name: 'apiGetCollectionIdRoute',
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
          resource_name: 'apiGetCollectionHandleRoute',
          roles: ['public','registered','admin']
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
          resource_name: 'apiGetCollectionCountRoute',
          roles: ['public','registered','admin']
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
          resource_name: 'apiPostCollectionUploadCsvRoute',
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
          resource_name: 'apiPostCollectionProcessUploadRoute',
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
          resource_name: 'apiGetCustomerRoute',
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
          resource_name: 'apiPostCustomerRoute',
          roles: ['public','registered','admin']
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
          resource_name: 'apiGetCustomerCountRoute',
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
          resource_name: 'apiPostCustomerExportRoute',
          roles: ['admin']
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
          resource_name: 'apiPostCustomerProcessUploadRoute',
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
          resource_name: 'apiGetCustomerIdRoute',
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
          resource_name: 'apiPostCustomerIdRoute',
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
          resource_name: 'apiPostCustomerIdLoginRoute',
          roles: ['public','registered','admin']
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
          resource_name: 'apiPostCustomerIdSourceRoute',
          roles: ['public','registered','admin']
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
          resource_name: 'apiPostCustomerIdSourceIdRoute',
          roles: ['public','registered','admin']
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
          resource_name: 'apiDeleteCustomerIdSourceSourceRoute',
          roles: ['public','registered','admin']
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
          resource_name: 'apiGetCustomerIdAccountsRoute',
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
          resource_name: 'apiGetCustomerIdOrdersRoute',
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
          resource_name: 'apiGetCustomerIdSourcesRoute',
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
          resource_name: 'apiGetCustomerIdSubscriptionsRoute',
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
          resource_name: 'apiGetCustomerAccountAccountRoute',
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
          resource_name: 'apiGetCustomerOrderOrderRoute',
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
          resource_name: 'apiPostCustomerSourceRoute',
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
          resource_name: 'apiGetCustomerSourceSourceRoute',
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
          resource_name: 'apiPostCustomerSourceSourceRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/customer/source/:source',
    handler: 'CustomerController.destroySource',
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
          resource_name: 'apiDeleteCustomerSourceSourceRoute',
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
          resource_name: 'apiGetCustomerSubscriptionSubscriptionRoute',
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
          resource_name: 'apiPostCustomerLoginRoute',
          roles: ['public','registered','admin']
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
          resource_name: 'apiPostCustomerLogoutRoute',
          roles: ['public','registered','admin']
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
          resource_name: 'apiGetCustomerAccountsRoute',
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
          resource_name: 'apiGetCustomerOrdersRoute',
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
          resource_name: 'apiGetCustomerSourcesRoute',
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
          resource_name: 'apiGetCustomerSubscriptionsRoute',
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
          resource_name: 'apiGetCustomerSessionRoute',
          roles: ['public','registered','admin']
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
          resource_name: 'apiPostCustomerUploadCsvRoute',
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
          resource_name: 'apiPostCustomerIdSwitchRoute',
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
          resource_name: 'apiPostFulfillmentRoute',
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
          resource_name: 'apiPostFulfillmentIdRoute',
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
          resource_name: 'apiDeleteFulfillmentIdRoute',
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
          resource_name: 'apiGetProductRoute',
          roles: ['public','registered','admin']
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
          resource_name: 'apiGetProductIdRoute',
          roles: ['public','registered','admin']
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
          resource_name: 'apiGetProductSearchRoute',
          roles: ['public','registered','admin']
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
          resource_name: 'apiGetProductTagTagRoute',
          roles: ['public','registered','admin']
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
          resource_name: 'apiGetProductHandleHandleRoute',
          roles: ['public','registered','admin']
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
          resource_name: 'apiGetProductCollectionHandleRoute',
          roles: ['public','registered','admin']
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
          resource_name: 'apiGetProductCountRoute',
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
          resource_name: 'apiPostProductAddRoute',
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
          resource_name: 'apiPostProductAddProductsRoute',
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
          resource_name: 'apiPostProductIdUpdateRoute',
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
          resource_name: 'apiPostProductUpdateProductsRoute',
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
          resource_name: 'apiDeleteProductIdRemoveRoute',
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
          resource_name: 'apiPostProductRemoveProductsRoute',
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
          resource_name: 'apiPostProductVariantIdRemoveRoute',
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
          resource_name: 'apiPostProductRemoveVariantsRoute',
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
          resource_name: 'apiPostProductImageIdRemoveRoute',
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
          resource_name: 'apiPostProductRemoveImagesRoute',
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
          resource_name: 'apiPostProductUploadCsvRoute',
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
          resource_name: 'apiPostProductProcessUploadRoute',
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
          resource_name: 'apiPostProductExportRoute',
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
          resource_name: 'apiPostProductUploadMetaCsvRoute',
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
          resource_name: 'apiPostProductProcessMetaUploadRoute',
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
          resource_name: 'apiGetOrderRoute',
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
          resource_name: 'apiPostOrderRoute',
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
          resource_name: 'apiGetOrderIdRoute',
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
          resource_name: 'apiPostOrderIdRoute',
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
          resource_name: 'apiPostOrderIdCancelRoute',
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
          resource_name: 'apiPostOrderIdRefundRoute',
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
          resource_name: 'apiGetOrderCountRoute',
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
          resource_name: 'apiPostOrderExportRoute',
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
          resource_name: 'apiGetShopCountRoute',
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
          resource_name: 'apiPostShopRoute',
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
          resource_name: 'apiGetSubscriptionRoute',
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
          resource_name: 'apiPostSubscriptionIdRoute',
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
          resource_name: 'apiGetSubscriptionIdRoute',
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
          resource_name: 'apiGetSubscriptionIdActivateRoute',
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
          resource_name: 'apiPostSubscriptionIdAddItemsRoute',
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
          resource_name: 'apiPostSubscriptionIdCancelRoute',
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
          resource_name: 'apiPostSubscriptionIdRemoveItemsRoute',
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
          resource_name: 'apiGetSubscriptionIdUpdateRoute',
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
          resource_name: 'apiGetSubscriptionCountRoute',
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
          resource_name: 'apiPostTransactionRoute',
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
          resource_name: 'apiPostTransactionIdRoute',
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
          resource_name: 'apiDeleteTransactionIdRoute',
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
          resource_name: 'apiPostTransactionAuthorizeRoute',
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
          resource_name: 'apiPostTransactionIdCaptureRoute',
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
          resource_name: 'apiPostTransactionIdSaleRoute',
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
          resource_name: 'apiPostTransactionIdVoidRoute',
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
          resource_name: 'apiPostTransactionIdRefundRoute',
          roles: ['admin']
        }
      }
    }
  }
]
