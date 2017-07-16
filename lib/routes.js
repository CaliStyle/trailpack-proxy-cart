'use strict'
const joi = require('joi')
// const Schemas = require('./schemas')

module.exports = [
  {
    method: ['GET'],
    path: '/generalStats',
    handler: 'ProxyCartController.generalStats',
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
          resource_name: 'apiGetGeneralStatsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/countries',
    handler: 'CountryController.countries',
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
          resource_name: 'apiGetCountriesRoute',
          roles: ['admin','registered','public']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/provinces',
    handler: 'CountryController.provinces',
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
          resource_name: 'apiGetProvincesRoute',
          roles: ['admin','registered','public']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/counties',
    handler: 'CountryController.counties',
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
          resource_name: 'apiGetCountiesRoute',
          roles: ['admin','registered','public']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/cities',
    handler: 'CountryController.cities',
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
          resource_name: 'apiGetCitiesRoute',
          roles: ['admin','registered','public']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/country',
    handler: 'CountryController.createCountry',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCountryRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/country/:id',
    handler: 'CountryController.country',
    config: {
      validate: {
        params: {
          id: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCountryIdRoute',
          roles: ['admin','registered','public']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/country/:id',
    handler: 'CountryController.updateCountry',
    config: {
      validate: {
        params: {
          id: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCountryIdRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/country/:id',
    handler: 'CountryController.destroyCountry',
    config: {
      validate: {
        params: {
          id: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiDeleteCountryIdRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/country/:id/addProvince/:province',
    handler: 'CountryController.addProvince',
    config: {
      validate: {
        params: {
          id: joi.any(),
          province: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCountryIdAddProvinceProvinceRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/country/:id/removeProvince/:province',
    handler: 'CountryController.removeProvince',
    config: {
      validate: {
        params: {
          id: joi.any(),
          province: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCountryIdRemoveProvinceProvinceRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/province',
    handler: 'CountryController.createProvince',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostProvinceRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/province/:id',
    handler: 'CountryController.province',
    config: {
      validate: {
        params: {
          id: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetProvinceIdRoute',
          roles: ['admin','registered','public']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/province/:id',
    handler: 'CountryController.updateProvince',
    config: {
      validate: {
        params: {
          id: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostProvinceIdRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/province/:id',
    handler: 'CountryController.destroyProvince',
    config: {
      validate: {
        params: {
          id: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiDeleteProvinceIdRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/county',
    handler: 'CountryController.createCounty',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCountyRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/county/:id',
    handler: 'CountryController.county',
    config: {
      validate: {
        params: {
          id: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCountyIdRoute',
          roles: ['admin','registered','public']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/county/:id',
    handler: 'CountryController.updateCounty',
    config: {
      validate: {
        params: {
          id: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCountyIdRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/county/:id',
    handler: 'CountryController.destroyCounty',
    config: {
      validate: {
        params: {
          id: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiDeleteCountyIdRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/city',
    handler: 'CountryController.createCity',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCityRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/city/:id',
    handler: 'CountryController.city',
    config: {
      validate: {
        params: {
          id: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCityIdRoute',
          roles: ['admin','registered','public']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/city/:id',
    handler: 'CountryController.updateCity',
    config: {
      validate: {
        params: {
          id: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCityIdRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/city/:id',
    handler: 'CountryController.destroyCity',
    config: {
      validate: {
        params: {
          id: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiDeleteCityIdRoute',
          roles: ['admin']
        }
      }
    }
  },
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
    method: ['POST'],
    path: '/cart/:id',
    handler: 'CartController.update',
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
          resource_name: 'apiPostCartIdRoute',
          roles: ['admin','registered','public']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/cart/generalStats',
    handler: 'CartController.generalStats',
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
          resource_name: 'apiGetCartGeneralStatsRoute',
          roles: ['admin']
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
    path: '/cart/:id/pricingOverrides',
    handler: 'CartController.pricingOverrides',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCartIdPricingOverridesRoute',
          roles: ['admin']
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
  {
    method: ['GET'],
    path: '/coupon/generalStats',
    handler: 'CouponController.generalStats',
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
          resource_name: 'apiGetCouponGeneralStatsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/coupon',
    handler: 'CouponController.findAll',
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
          resource_name: 'apiGetCouponRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/coupon/:id',
    handler: 'CouponController.findById',
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
          resource_name: 'apiGetCouponIdRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/coupon',
    handler: 'CouponController.create',
    config: {
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCouponRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/coupon/:id',
    handler: 'CouponController.update',
    config: {
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCouponIdRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/coupon/:id',
    handler: 'CouponController.destroy',
    config: {
      app: {
        proxyPermissions: {
          resource_name: 'apiDeleteCouponIdRoute',
          roles: ['admin']
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
    method: ['POST'],
    path: '/collection/:id/add/:collection',
    handler: 'CollectionController.addCollection',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          collection: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCollectionIdAddCollectionCollectionRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/collection/:id/remove/:collection',
    handler: 'CollectionController.removeCollection',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          collection: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCollectionIdRemoveCollectionCollectionRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/collection/:id/addProduct/:product',
    handler: 'CollectionController.addProduct',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          product: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCollectionIdAddProductProductRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/collection/:id/removeProduct/:product',
    handler: 'CollectionController.removeProduct',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          product: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCollectionIdRemoveProductProductRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/collection/:id/addCustomer/:customer',
    handler: 'CollectionController.addCustomer',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          customer: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCollectionIdAddCustomerCustomerRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/collection/:id/removeCustomer/:customer',
    handler: 'CollectionController.removeCustomer',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          customer: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCollectionIdRemoveCustomerCustomerRoute',
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
    method: ['GET'],
    path: '/collection/generalStats',
    handler: 'CollectionController.generalStats',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCollectionGeneralStatsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/collection/search',
    handler: 'CollectionController.search',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.string(),
          where: joi.any().optional(),
          term: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCollectionSearchRoute',
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
    method: ['GET'],
    path: '/customer/:id/reviews',
    handler: 'CustomerController.reviews',
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
          resource_name: 'apiGetCustomerIdReviewsRoute',
          roles: ['admin','registered','public']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/generalStats',
    handler: 'CustomerController.generalStats',
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
          resource_name: 'apiGetCustomerGeneralStatsRoute',
          roles: ['admin']
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
    method: ['GET'],
    path: '/customer/search',
    handler: 'CustomerController.search',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.string(),
          where: joi.any().optional(),
          term: joi.string().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomerSearchRoute',
          roles: ['admin']
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
    path: '/customer/:id/accountBalance',
    handler: 'CustomerController.accountBalance',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCustomerIdAccountBalanceRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/customer/:id/addTag/:tag',
    handler: 'CustomerController.addTag',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          tag: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCustomerIdAddTagTagRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/customer/:id/removeTag/:tag',
    handler: 'CustomerController.removeTag',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          tag: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCustomerIdRemoveTagTagRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/customer/:id/addCollection/:collection',
    handler: 'CustomerController.addCollection',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          collection: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCustomerIdAddCollectionCollectionRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/customer/:id/removeCollection/:collection',
    handler: 'CustomerController.removeCollection',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          collection: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCustomerIdRemoveCollectionCollectionRoute',
          roles: ['admin']
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
          roles: ['admin']
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
          roles: ['admin']
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
          roles: ['admin']
        }
      }
    }
  },
  // Customer Address
  {
    method: ['POST'],
    path: '/customer/:id/address',
    handler: 'CustomerController.addAddress',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCustomerIdAddressRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/customer/:id/address/:address',
    handler: 'CustomerController.updateAddress',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          address: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCustomerIdAddressAddressRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/customer/:id/address/:address',
    handler: 'CustomerController.destroyAddress',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          address: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiDeleteCustomerIdAddressAddressRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/customer/:id/event/:event',
    handler: 'CustomerController.destroyEvent',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiDeleteCustomerIdEventEventRoute',
          roles: ['admin']
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
          resource_name: 'apiGetCustomerIdAccountsRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/:id/users',
    handler: 'CustomerController.users',
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
          resource_name: 'apiGetCustomerIdUsersRoute',
          roles: ['admin']
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
          resource_name: 'apiGetCustomerIdOrdersRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/:id/addresses',
    handler: 'CustomerController.addresses',
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
          resource_name: 'apiGetCustomerIdAddressesRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/:id/events',
    handler: 'CustomerController.events',
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
          resource_name: 'apiGetCustomerIdEventsRoute',
          roles: ['admin']
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
          resource_name: 'apiGetCustomerIdSourcesRoute',
          roles: ['admin']
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
    path: '/customer/user/:user',
    handler: 'CustomerController.user',
    config: {
      validate: {
        params: {
          user: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomerUserUserRoute',
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
    path: '/customer/tag/:tag',
    handler: 'CustomerController.findByTag',
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
          resource_name: 'apiGetCustomerTagTagRoute',
          roles: ['public','registered','admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/collection/:handle',
    handler: 'CustomerController.findByCollection',
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
          resource_name: 'apiGetCustomerCollectionHandleRoute',
          roles: ['public','registered','admin']
        }
      }
    }
  },
  // Customer Addresses
  {
    method: ['POST'],
    path: '/customer/address',
    handler: 'CustomerController.addAddress',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCustomerAddressRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/address/:address',
    handler: 'CustomerController.address',
    config: {
      validate: {
        params: {
          address: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomerAddressAddressRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/customer/address/:address',
    handler: 'CustomerController.updateAddress',
    config: {
      validate: {
        params: {
          address: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCustomerAddressAddressRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/customer/address/:address',
    handler: 'CustomerController.destroyAddress',
    config: {
      validate: {
        params: {
          address: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiDeleteCustomerAddressAddressRoute',
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
    path: '/customer/addresses',
    handler: 'CustomerController.addresses',
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
          resource_name: 'apiGetCustomerAddressesRoute',
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
    method: ['GET'],
    path: '/customer/users',
    handler: 'CustomerController.users',
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
          resource_name: 'apiGetCustomerUsersRoute',
          roles: ['admin','registered']
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
  // Discount
  {
    method: ['GET'],
    path: '/discount/generalStats',
    handler: 'DiscountController.generalStats',
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
          resource_name: 'apiGetDiscountGeneralStatsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/discount',
    handler: 'DiscountController.findAll',
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
          resource_name: 'apiGetDiscountRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/discount/:id',
    handler: 'DiscountController.findById',
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
          resource_name: 'apiGetDiscountIdRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/discount',
    handler: 'DiscountController.create',
    config: {
      app: {
        proxyPermissions: {
          resource_name: 'apiPostDiscountRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/discount/:id',
    handler: 'DiscountController.update',
    config: {
      app: {
        proxyPermissions: {
          resource_name: 'apiPostDiscountIdRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/discount/:id',
    handler: 'DiscountController.destroy',
    config: {
      app: {
        proxyPermissions: {
          resource_name: 'apiDeleteDiscountIdRoute',
          roles: ['admin']
        }
      }
    }
  },
  // Fulfillment
  {
    method: ['GET'],
    path: '/fulfillment',
    handler: 'FulfillmentController.findAll',
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
          resource_name: 'apiGetFulfillmentRoute',
          roles: ['admin']
        }
      }
    }
  },
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
    method: ['GET'],
    path: '/fulfillment/generalStats',
    handler: 'FulfillmentController.generalStats',
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
          resource_name: 'apiGetFulfillmentGeneralStatsRoute',
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
          where: joi.any().optional(),
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
    path: '/product/generalStats',
    handler: 'ProductController.generalStats',
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
          resource_name: 'apiGetProductGeneralStatsRoute',
          roles: ['admin']
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
    path: '/product',
    handler: 'ProductController.addProduct',
    config: {
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductRoute',
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
    path: '/products',
    handler: 'ProductController.addProducts',
    config: {
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductsRoute',
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
    path: '/product/:id/addTag/:tag',
    handler: 'ProductController.addTag',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          tag: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdAddTagTagRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/product/:id/removeTag/:tag',
    handler: 'ProductController.removeTag',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          tag: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdRemoveTagTagRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/product/:id/addCollection/:collection',
    handler: 'ProductController.addCollection',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          collection: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdAddCollectionCollectionRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/product/:id/removeCollection/:collection',
    handler: 'ProductController.removeCollection',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          collection: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdRemoveCollectionCollectionRoute',
          roles: ['admin']
        }
      }
    }
  },

  {
    method: ['POST','PUT'],
    path: '/product/:id/addAssociation/:association',
    handler: 'ProductController.addAssociation',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          association: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdAddAssociationAssociationRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/product/:id/removeAssociation/:association',
    handler: 'ProductController.removeAssociation',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          association: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdRemoveAssociationAssociationRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/product/:id/addShop/:shop',
    handler: 'ProductController.addShop',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          shop: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdAddShopShopRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/product/:id/removeShop/:shop',
    handler: 'ProductController.removeShop',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          shop: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdRemoveShopShopRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/product/:id/addVendor/:vendor',
    handler: 'ProductController.addVendor',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          vendor: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdAddVendorVendorRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/product/:id/removeVendor/:vendor',
    handler: 'ProductController.removeVendor',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          vendor: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdRemoveVendorVendorRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['PUT'],
    path: '/products',
    handler: 'ProductController.updateProducts',
    config: {
      app: {
        proxyPermissions: {
          resource_name: 'apiPutProductsRoute',
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
    method: ['POST'],
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
          resource_name: 'apiPostProductIdRemoveRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/product/:id',
    handler: 'ProductController.removeProduct',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiDeleteProductIdRoute',
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
    method: ['POST'],
    path: '/product/:id/variant',
    handler: 'ProductController.createVariant',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdVariantRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/product/:id/variant/:variant/remove',
    handler: 'ProductController.removeVariant',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          variant: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdVariantVariantRemoveRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/product/:id/variant/:variant',
    handler: 'ProductController.updateVariant',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          variant: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdVariantVariantRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/product/:id/variant/:variant',
    handler: 'ProductController.removeVariant',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          variant: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiDeleteProductIdVariantVariantRoute',
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
    method: ['POST'],
    path: '/product/:id/image/:image/remove',
    handler: 'ProductController.removeImage',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          image: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdImageImageRemoveRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/product/:id/image/:image',
    handler: 'ProductController.removeImage',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiDeleteProductIdImageImageRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/product/:id/associations',
    handler: 'ProductController.associations',
    config: {
      validate: {
        params: {
          id: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetProductIdAssociationsRoute',
          roles: ['public','registered','admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/product/:id/reviews',
    handler: 'ProductController.reviews',
    config: {
      validate: {
        params: {
          id: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetProductIdReviewsRoute',
          roles: ['public','registered','admin']
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
    path: '/order/:id/events/:event',
    handler: 'OrderController.event',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          event: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdEventsEventRoute',
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
    path: '/order/:id/addItem',
    handler: 'OrderController.addItem',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdAddItemRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/order/:id/updateItem',
    handler: 'OrderController.updateItem',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdUpdateItemRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/order/:id/removeItem',
    handler: 'OrderController.removeItem',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdRemoveItemRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/order/:id/addShipping',
    handler: 'OrderController.addShipping',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdAddShippingRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/order/:id/removeShipping',
    handler: 'OrderController.removeShipping',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdRemoveShippingRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/order/:id/pay',
    handler: 'OrderController.pay',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdPayRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/order/:id/events',
    handler: 'OrderController.events',
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
        proxyPermissions: {
          resource_name: 'apiPostOrderIdEventsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/order/:id/refunds',
    handler: 'OrderController.refunds',
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
        proxyPermissions: {
          resource_name: 'apiPostOrderIdRefundsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/order/:id/transactions',
    handler: 'OrderController.transactions',
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
        proxyPermissions: {
          resource_name: 'apiPostOrderIdTransactionsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/order/:id/fulfillments',
    handler: 'OrderController.fulfillments',
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
        proxyPermissions: {
          resource_name: 'apiPostOrderIdFulfillmentsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/order/:id/addTag/:tag',
    handler: 'OrderController.addTag',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          tag: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdAddTagTagRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/order/:id/removeTag/:tag',
    handler: 'OrderController.removeTag',
    config: {
      validate: {
        params: {
          id: joi.any().required(),
          tag: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdRemoveTagTagRoute',
          roles: ['admin']
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
    path: '/order/:id/authorize',
    handler: 'OrderController.authorize',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdAuthorizeRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/order/:id/capture',
    handler: 'OrderController.capture',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdCaptureRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/order/:id/void',
    handler: 'OrderController.void',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdVoidRoute',
          roles: ['admin']
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
    method: ['POST'],
    path: '/order/:id/retry',
    handler: 'OrderController.retry',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdRetryRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/order/generalStats',
    handler: 'OrderController.generalStats',
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
          resource_name: 'apiGetOrderGeneralStatsRoute',
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
    method: ['GET'],
    path: '/order/search',
    handler: 'OrderController.search',
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
          resource_name: 'apiGetOrderSearchRoute',
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
  {
    method: ['POST'],
    path: '/order/uploadCSV',
    handler: 'OrderController.uploadCSV',
    config: {
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderUploadCsvRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/order/processUpload/:id',
    handler: 'OrderController.processUpload',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderProcessUploadRoute',
          roles: ['admin']
        }
      }
    }
  },
  // Reviews
  {
    method: ['POST'],
    path: '/review',
    handler: 'ReviewController.create',
    config: {
      app: {
        proxyPermissions: {
          resource_name: 'apiPostReviewRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/review',
    handler: 'ReviewController.findAll',
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
        proxyPermissions: {
          resource_name: 'apiGetReviewRoute',
          roles: ['admin','registered','public']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/review/:id',
    handler: 'ReviewController.findById',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiGetReviewIdRoute',
          roles: ['admin','registered','public']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/review/:id',
    handler: 'ReviewController.update',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostReviewIdRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/review/generalStats',
    handler: 'ReviewController.generalStats',
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
          resource_name: 'apiGetReviewGeneralStatsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/review/count',
    handler: 'ReviewController.count',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetReviewCountRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/review/search',
    handler: 'ReviewController.search',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.string(),
          where: joi.any().optional(),
          term: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetReviewSearchRoute',
          roles: ['public','registered','admin']
        }
      }
    }
  },

  // Shop
  {
    method: ['GET'],
    path: '/shop/generalStats',
    handler: 'ShopController.generalStats',
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
          resource_name: 'apiGetShopGeneralStatsRoute',
          roles: ['admin']
        }
      }
    }
  },
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
    path: '/subscription/:id/deactivate',
    handler: 'SubscriptionController.deactivate',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiGetSubscriptionIdDeactivateRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/subscription/:id/renew',
    handler: 'SubscriptionController.renew',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiGetSubscriptionIdRenewRoute',
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
    path: '/subscription/generalStats',
    handler: 'SubscriptionController.generalStats',
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
          resource_name: 'apiGetSubscriptionGeneralStatsRoute',
          roles: ['admin']
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
  {
    method: ['POST'],
    path: '/subscription/uploadCSV',
    handler: 'SubscriptionController.uploadCSV',
    config: {
      app: {
        proxyPermissions: {
          resource_name: 'apiPostSubscriptionUploadCsvRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/subscription/processUpload/:id',
    handler: 'SubscriptionController.processUpload',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostSubscriptionProcessUploadRoute',
          roles: ['admin']
        }
      }
    }
  },

  // Tag
  {
    method: ['GET'],
    path: '/tag',
    handler: 'TagController.findAll',
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
          resource_name: 'apiGetTagRoute',
          roles: ['public','registered','admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/tag/:id',
    handler: 'TagController.findById',
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
          resource_name: 'apiGetTagIdRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/tag/name/:name',
    handler: 'TagController.findByName',
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
          resource_name: 'apiGetTagNameRoute',
          roles: ['public','registered','admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/tag/count',
    handler: 'TagController.count',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetTagCountRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/tag/search',
    handler: 'TagController.search',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.string(),
          where: joi.any().optional(),
          term: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetTagSearchRoute',
          roles: ['public','registered','admin']
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
    method: ['GET'],
    path: '/transaction/generalStats',
    handler: 'TransactionController.generalStats',
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
          resource_name: 'apiGetTransactionGeneralStatsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/transaction',
    handler: 'TransactionController.findAll',
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
          resource_name: 'apiGetTransactionRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/transaction/:id',
    handler: 'TransactionController.findById',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiGetTransactionIdRoute',
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
    path: '/transaction/:id/retry',
    handler: 'TransactionController.retry',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostTransactionIdRetryRoute',
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
  },
  {
    method: ['POST'],
    path: '/transaction/:id/cancel',
    handler: 'TransactionController.cancel',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostTransactionIdCancelRoute',
          roles: ['admin']
        }
      }
    }
  },
  // User
  {
    method: ['GET'],
    path: '/user/:id/customers',
    handler: 'UserController.customers',
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
          resource_name: 'apiGetUserIdCustomersRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/user/customers',
    handler: 'UserController.customers',
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
          resource_name: 'apiGetUserCustomersRoute',
          roles: ['admin','registered']
        }
      }
    }
  },

  // Vendor
  {
    method: ['POST'],
    path: '/vendor/uploadCSV',
    handler: 'VendorController.uploadCSV',
    config: {
      app: {
        proxyPermissions: {
          resource_name: 'apiPostVendorUploadCsvRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/vendor/processUpload/:id',
    handler: 'VendorController.processUpload',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostVendorProcessUploadRoute',
          roles: ['admin']
        }
      }
    }
  }
]
