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
          sort: joi.array().items(joi.array()),
          where: joi.object()
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
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
          id: joi.number()
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
    method: ['GET'],
    path: '/country/:id/provinces',
    handler: 'CountryController.countryProvinces',
    config: {
      validate: {
        params: {
          id: joi.number()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCountryIdProvincesRoute',
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
          id: joi.number()
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
          id: joi.number()
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
          id: joi.number(),
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
          id: joi.number(),
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
          id: joi.number()
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
          id: joi.number()
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
          id: joi.number()
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
          id: joi.number()
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
          id: joi.number()
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
          id: joi.number()
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
          id: joi.number()
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
          id: joi.number()
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
          id: joi.number()
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
    path: '/carts',
    handler: 'CartController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCartsRoute',
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
    path: '/cart',
    handler: 'CartController.session',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCartRoute',
          roles: ['admin','registered','public']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/cart/draft',
    handler: 'CartController.draft',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCartDraftRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/cart/:id',
    handler: 'CartController.resolve',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['PUT'],
    path: '/cart',
    handler: 'CartController.update',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPutCartRoute',
          roles: ['admin','registered','public']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/cart/:id',
    handler: 'CartController.update',
    config: {
      validate: {
        params: {
          id: joi.number().required()
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
    method: ['POST','PUT'],
    path: '/cart/:id/addShipping',
    handler: 'CartController.addShipping',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCartIdAddShippingRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/cart/:id/removeShipping',
    handler: 'CartController.removeShipping',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCartIdRemoveShippingRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/cart/:id/addTaxes',
    handler: 'CartController.addTaxes',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCartIdAddTaxesRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/cart/:id/removeTaxes',
    handler: 'CartController.removeTaxes',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCartIdRemoveTaxesRoute',
          roles: ['admin']
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
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
        },
        proxyPermissions: {
          resource_name: 'apiGetCartInitRoute',
          roles: ['admin','registered','public']
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
    method: ['POST','PUT'],
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
    method: ['POST','PUT'],
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
    method: ['POST','PUT'],
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
    method: ['POST','PUT'],
    path: '/cart/removeItems',
    handler: 'CartController.removeItems',
    config: {
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCartRemoveItemsRoute',
          roles: ['public','registered','admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/cart/clear',
    handler: 'CartController.clear',
    config: {
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCartClearRoute',
          roles: ['public','registered','admin']
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
          roles: ['public','registered','admin']
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/cart/:id/checkout',
    handler: 'CartController.checkout',
    config: {
      validate: {
        params: {
          id: joi.number().required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/cart/:id/addItems',
    handler: 'CartController.addItems',
    config: {
      validate: {
        params: {
          id: joi.number().required()
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
    method: ['POST','PUT'],
    path: '/cart/:id/removeItems',
    handler: 'CartController.removeItems',
    config: {
      validate: {
        params: {
          id: joi.number().required()
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
    method: ['POST','PUT'],
    path: '/cart/:id/pricingOverrides',
    handler: 'CartController.pricingOverrides',
    config: {
      validate: {
        params: {
          id: joi.number().required()
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
    method: ['POST','PUT'],
    path: '/cart/:id/clear',
    handler: 'CartController.clear',
    config: {
      validate: {
        params: {
          id: joi.number().required()
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
    path: '/collections',
    handler: 'CollectionController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCollectionsRoute',
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
    method: ['POST','PUT'],
    path: '/collection/:id',
    handler: 'CollectionController.update',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.number().required()
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
    method: ['POST','PUT'],
    path: '/collection/:id/collection/:collection',
    handler: 'CollectionController.addCollection',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          collection: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCollectionIdCollectionCollectionRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/collection/:id/addCollection/:collection',
    handler: 'CollectionController.addCollection',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          collection: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/collection/:id/collections',
    handler: 'CollectionController.addCollections',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCollectionIdCollectionsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/collection/:id/collection/:collection',
    handler: 'CollectionController.removeCollection',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          collection: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiDeleteCollectionIdCollectionCollectionRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/collection/:id/removeCollection/:collection',
    handler: 'CollectionController.removeCollection',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          collection: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiDeleteCollectionIdRemoveCollectionCollectionRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/collection/:id/collections',
    handler: 'CollectionController.collections',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCollectionIdCollectionsRoute',
          roles: ['admin','registered','public']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/collection/:id/addProduct/:product',
    handler: 'CollectionController.addProduct',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          product: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/collection/:id/product/:product',
    handler: 'CollectionController.addProduct',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          product: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCollectionIdProductProductRoute',
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          product: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/collection/:id/products',
    handler: 'CollectionController.addProducts',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCollectionIdProductsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/collection/:id/product/:product',
    handler: 'CollectionController.removeProduct',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          product: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiDeleteCollectionIdProductProductRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/collection/:id/products',
    handler: 'CollectionController.products',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCollectionIdProductsRoute',
          roles: ['admin','registered','public']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/collection/:id/discounts',
    handler: 'CollectionController.discounts',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCollectionIdDiscountsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/collection/:id/addTag/:tag',
    handler: 'CollectionController.addTag',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          tag: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCollectionIdAddTagTagRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/collection/:id/tag/:tag',
    handler: 'CollectionController.addTag',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          tag: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCollectionIdTagTagRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/collection/:id/removeTag/:tag',
    handler: 'CollectionController.removeTag',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          tag: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCollectionIdRemoveTagTagRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/collection/:id/tag/:tag',
    handler: 'CollectionController.removeTag',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          tag: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiDeleteCollectionIdTagTagRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/collection/:id/tags',
    handler: 'CollectionController.tags',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCollectionIdTagsRoute',
          roles: ['admin','registered','public']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/collection/:id/addCustomer/:customer',
    handler: 'CollectionController.addCustomer',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          customer: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/collection/:id/customer/:customer',
    handler: 'CollectionController.addCustomer',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          customer: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCollectionIdCustomerCustomerRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/collection/:id/customers',
    handler: 'CollectionController.addCustomers',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCollectionIdCustomersRoute',
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          customer: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['DELETE'],
    path: '/collection/:id/customer/:customer',
    handler: 'CollectionController.removeCustomer',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          customer: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiDeleteCollectionIdCustomerCustomerRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/collection/:id/customers',
    handler: 'CollectionController.customers',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCollectionIdCustomersRoute',
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
    path: '/collections/search',
    handler: 'CollectionController.search',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any().optional(),
          term: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCollectionsSearchRoute',
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
          // This is a only ever a String
          id: joi.string().required()
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
    path: '/customers',
    handler: 'CustomerController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomersRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/customer',
    handler: 'CustomerController.createAndLogin',
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
    method: ['PUT'],
    path: '/customer',
    handler: 'CustomerController.update',
    config: {
      app: {
        proxyPermissions: {
          resource_name: 'apiPutCustomerRoute',
          roles: ['registered','admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/customer/create',
    handler: 'CustomerController.create',
    config: {
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCustomerCreateRoute',
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
          // This is a only ever a String
          id: joi.string().required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    path: '/customer/token/:token',
    handler: 'CustomerController.findByToken',
    config: {
      validate: {
        params: {
          token: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomerTokenTokenRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/:id/discounts',
    handler: 'CustomerController.discounts',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomerIdDiscountsRoute',
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          sort: joi.array().items(joi.array()),
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
    path: '/customers/search',
    handler: 'CustomerController.search',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any().optional(),
          term: joi.string().required(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomersSearchRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/customer/:id',
    handler: 'CustomerController.update',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST', 'PUT'],
    path: '/customer/:id/accountBalance',
    handler: 'CustomerController.accountBalance',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['PUT'],
    path: '/customer/:id/enable',
    handler: 'CustomerController.enable',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPutCustomerIdEnableRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['PUT'],
    path: '/customer/:id/disable',
    handler: 'CustomerController.disable',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPutCustomerIdDisableRoute',
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          tag: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    path: '/customer/:id/tag/:tag',
    handler: 'CustomerController.addTag',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          tag: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCustomerIdPostTagTagRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT','DELETE'],
    path: '/customer/:id/removeTag/:tag',
    handler: 'CustomerController.removeTag',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          tag: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['DELETE'],
    path: '/customer/:id/tag/:tag',
    handler: 'CustomerController.removeTag',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          tag: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCustomerIdDeleteTagTagRoute',
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          collection: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    path: '/customer/:id/collections',
    handler: 'CustomerController.addCollections',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCustomerIdCollectionsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/customer/:id/collection/:collection',
    handler: 'CustomerController.addCollection',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          collection: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCustomerIdPostCollectionCollectionRoute',
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          collection: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['DELETE'],
    path: '/customer/:id/collection/:collection',
    handler: 'CustomerController.removeCollection',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          collection: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiDeleteCustomerIdDeleteCollectionCollectionRoute',
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/customer/:id/source/:source',
    handler: 'CustomerController.updateSource',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          source: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          source: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/customer/:id/address/:address',
    handler: 'CustomerController.updateAddress',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
    path: '/customer/:id/account/:account',
    handler: 'CustomerController.customerAccount',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          account: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomerIdAccountAccountRoute',
          roles: ['admin','registered']
        }
      }
    }
  },

  {
    method: ['GET'],
    path: '/customer/:id/account/:account/sources',
    handler: 'CustomerController.customerAccountSources',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          account: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomerIdAccountAccountSourcesRoute',
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
    path: '/customer/:id/collections',
    handler: 'CustomerController.collections',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomerIdCollectionsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/:id/tags',
    handler: 'CustomerController.tags',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomerIdTagsRoute',
          roles: ['admin']
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
    path: '/customer/:id/user/:user',
    handler: 'CustomerController.user',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          user: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomerIdUserUserRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['PUT','POST'],
    path: '/customer/:id/user/:user',
    handler: 'CustomerController.addUser',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          user: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCustomerIdUserUserRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['PUT','POST'],
    path: '/customer/:id/addUsers',
    handler: 'CustomerController.addUsers',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCustomerIdAddUsersRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['PUT','POST'],
    path: '/customer/:id/users',
    handler: 'CustomerController.addUsers',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCustomerIdUsersRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/customer/:id/user/:user',
    handler: 'CustomerController.removeUser',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          user: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiDeleteCustomerIdUserUserRoute',
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
    path: '/customer/:id/events',
    handler: 'CustomerController.events',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
          order: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['GET'],
    path: '/customer/isSubscribed/:product',
    handler: 'CustomerController.isSubscribedToProduct',
    config: {
      validate: {
        params: {
          product: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomerIsSubscribedProductRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/hasPurchased/:product',
    handler: 'CustomerController.hasPurchasedProduct',
    config: {
      validate: {
        params: {
          product: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomerHasPurchasedProductRoute',
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
          source: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          source: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          source: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
          address: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          address: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          address: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
    path: '/customer/addresses',
    handler: 'CustomerController.addresses',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
    path: '/customer/collections',
    handler: 'CustomerController.collections',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomerCollectionsRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/events',
    handler: 'CustomerController.events',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomerEventsRoute',
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
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
    path: '/customer/tags',
    handler: 'CustomerController.tags',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomerTagsRoute',
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
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
    path: '/customer/subscription/:subscription',
    handler: 'CustomerController.subscription',
    config: {
      validate: {
        params: {
          subscription: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/customer/subscription/:subscription',
    handler: 'CustomerController.subscriptionUpdate',
    config: {
      validate: {
        params: {
          subscription: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiPostCustomerSubscriptionSubscriptionRoute',
          roles: ['admin','registered']
        }
      }
    }
  },

  {
    method: ['POST','PUT'],
    path: '/customer/subscription/:subscription/activate',
    handler: 'CustomerController.subscriptionActivate',
    config: {
      validate: {
        params: {
          subscription: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCustomerSubscriptionSubscriptionActivateRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/customer/subscription/:subscription/deactivate',
    handler: 'CustomerController.subscriptionDeactivate',
    config: {
      validate: {
        params: {
          subscription: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCustomerSubscriptionSubscriptionDeactivateRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/customer/subscription/:subscription/renew',
    handler: 'SubscriptionController.renew',
    config: {
      validate: {
        params: {
          subscription: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCustomerSubscriptionSubscriptionRenewRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/customer/subscription/:subscription/addItems',
    handler: 'CustomerController.subscriptionAddItems',
    config: {
      validate: {
        params: {
          subscription: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCustomerSubscriptionSubscriptionAddItemsRoute',
          roles: ['admin', 'registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/customer/subscription/:subscription/cancel',
    handler: 'CustomerController.subscriptionCancel',
    config: {
      validate: {
        params: {
          subscription: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCustomerSubscriptionSubscriptionCancelRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/customer/subscription/:subscription/removeItems',
    handler: 'CustomerController.subscriptionRemoveItems',
    config: {
      validate: {
        params: {
          subscription: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostCustomerSubscriptionSubscriptionRemoveItemsRoute',
          roles: ['admin']
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
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
    path: '/customer',
    handler: 'CustomerController.session',
    config: {
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomerRoute',
          roles: ['public','registered','admin']
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
    path: '/customer/:product/isSubscribedToProduct',
    handler: 'CustomerController.isSubscribedToProduct',
    config: {
      validate: {
        params: {
          product: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomerProductIsSubscribedToProductRoute',
          roles: ['registered','admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/customer/:product/hasPurchasedProduct',
    handler: 'CustomerController.hasPurchasedProduct',
    config: {
      validate: {
        params: {
          product: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetCustomerProductHasPurchasedProductRoute',
          roles: ['registered','admin']
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
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
          id: joi.number().required()
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
          sort: joi.array().items(joi.array()),
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
    path: '/discounts',
    handler: 'DiscountController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetDiscountsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/discounts/search',
    handler: 'DiscountController.search',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          term: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetDiscountsSearchRoute',
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
          id: joi.number().required()
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
    method: ['GET'],
    path: '/discount/handle/:handle',
    handler: 'DiscountController.findByHandle',
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
          resource_name: 'apiGetDiscountHandleHandleRoute',
          roles: ['admin','registered','public']
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
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
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
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiDeleteDiscountIdRoute',
          roles: ['admin']
        }
      }
    }
  },

  {
    method: ['POST','PUT'],
    path: '/discount/:id/product/:product',
    handler: 'DiscountController.addProduct',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          product: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostDiscountIdProductProductRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/discount/:id/events',
    handler: 'discountController.events',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetdiscountIdEventsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/discount/:id/products',
    handler: 'DiscountController.addProducts',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostDiscountIdProductsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/discount/:id/product/:product',
    handler: 'DiscountController.removeProduct',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          product: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiDeleteDiscountIdProductProductRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/discount/:id/products',
    handler: 'DiscountController.products',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiGetDiscountIdProductsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/discount/:id/customer/:customer',
    handler: 'DiscountController.addCustomer',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          customer: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostDiscountIdCustomerCustomerRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/discount/:id/customers',
    handler: 'DiscountController.addCustomers',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostDiscountIdCustomersRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/discount/:id/customer/:customer',
    handler: 'DiscountController.removeCustomer',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          customer: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiDeleteDiscountIdCustomerCustomerRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/discount/:id/customers',
    handler: 'DiscountController.customers',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiGetDiscountIdCustomersRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/discount/:id/cart/:cart',
    handler: 'DiscountController.addCart',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          cart: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostDiscountIdCartCartRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/discount/:id/cart/:cart',
    handler: 'DiscountController.removeCart',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          cart: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiDeleteDiscountIdCartCartRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/discount/:id/carts',
    handler: 'DiscountController.carts',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiGetDiscountIdCartsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/discount/:id/collection/:collection',
    handler: 'DiscountController.addCollection',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          collection: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostDiscountIdCollectionCollectionRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/discount/:id/collections',
    handler: 'DiscountController.addCollections',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostDiscountIdCollectionsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/discount/:id/collection/:collection',
    handler: 'DiscountController.removeCollection',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          collection: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiDeleteDiscountIdCollectionCollectionRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/discount/:id/collections',
    handler: 'DiscountController.collections',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiGetDiscountIdCollectionsRoute',
          roles: ['admin']
        }
      }
    }
  },

  // Fulfillment
  {
    method: ['GET'],
    path: '/fulfillments',
    handler: 'FulfillmentController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetFulfillmentsRoute',
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
          sort: joi.array().items(joi.array()),
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
    method: ['POST', 'PUT'],
    path: '/fulfillment/:id',
    handler: 'FulfillmentController.update',
    config: {
      validate: {
        params: {
          id: joi.number().required()
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
          id: joi.number().required()
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
    path: '/products',
    handler: 'ProductController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetProductsRoute',
          roles: ['public','registered','admin']
        }
      }
    }
  },

  // TODO make this resolve instead of by Id only
  {
    method: ['GET'],
    path: '/product/:id',
    handler: 'ProductController.findById',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    path: '/products/search',
    handler: 'ProductController.search',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any().optional(),
          term: joi.string().required(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetProductsSearchRoute',
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
          tag: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
    path: '/product/collection/:handle/search',
    handler: 'ProductController.searchByCollection',
    config: {
      validate: {
        params: {
          handle: joi.string().required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          term: joi.string(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetProductCollectionHandleSearchRoute',
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
          sort: joi.array().items(joi.array()),
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          tag: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          tag: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          collection: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          collection: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          association: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          association: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    path: '/product/variant/:id/addAssociation/:association',
    handler: 'ProductController.addVariantAssociation',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          association: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductVariantIdAddAssociationAssociationRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/product/variant/:id/removeAssociation/:association',
    handler: 'ProductController.removeVariantAssociation',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          association: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductVariantIdRemoveAssociationAssociationRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/product/:id/variant/:variant/addAssociation/:association',
    handler: 'ProductController.addVariantAssociation',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          variant: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          association: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdVariantVariantAddAssociationAssociationRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/product/:id/variant/:variant/removeAssociation/:association',
    handler: 'ProductController.removeVariantAssociation',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          variant: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          association: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdVariantVariantRemoveAssociationAssociationRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/product/:id/variant/:variant/associations',
    handler: 'ProductController.variantAssociations',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          variant: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          association: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiGetProductIdVariantVariantAssociationsRoute',
          roles: ['admin','registered','public']
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          shop: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          shop: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['GET'],
    path: '/product/:id/collections',
    handler: 'ProductController.collections',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiGetProductIdCollectionsRoute',
          roles: ['admin','registered','public']
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          vendor: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          vendor: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['GET'],
    path: '/product/:id/vendors',
    handler: 'ProductController.vendors',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiGetProductIdVendorsRoute',
          roles: ['admin','registered','public']
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          variant: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          variant: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          variant: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    path: '/product/:id/image/create',
    handler: 'ProductController.createImage',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdImageCreateRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/product/:id/variant/:variant/image/create',
    handler: 'ProductController.createImage',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          variant: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdVariantVariantImageCreateRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/product/:id/image/:image/add',
    handler: 'ProductController.addImage',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          image: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdImageImageAddRoute',
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          image: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          image: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    path: '/product/variant/:id/associations',
    handler: 'ProductController.variantAssociations',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetProductIdVariantAssociationsRoute',
          roles: ['public','registered','admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/product/:id/relations',
    handler: 'ProductController.relations',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetProductIdRelationsRoute',
          roles: ['public','registered','admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/product/:id/suggestions',
    handler: 'ProductController.suggestions',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetProductIdSuggestionsRoute',
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
    method: ['GET'],
    path: '/product/:id/variants',
    handler: 'ProductController.variants',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetProductIdVariantsRoute',
          roles: ['public','registered','admin']
        }
      }
    }
  },

  {
    method: ['GET'],
    path: '/product/:id/variants/search',
    handler: 'ProductController.variantsSearch',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          term: joi.string().required(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetProductIdVariantsSearchRoute',
          roles: ['public','registered','admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/product/:id/images',
    handler: 'ProductController.images',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetProductIdImagesRoute',
          roles: ['public','registered','admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/product/:id/shops',
    handler: 'ProductController.shops',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetProductIdShopsRoute',
          roles: ['public','registered','admin']
        }
      }
    }
  },
  {
    method: ['DELETE','POST'],
    path: '/product/:id/removeImages',
    handler: 'ProductController.removeImages',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductIdRemoveImagesRoute',
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
          // This will only ever be a string
          id: joi.string().required()
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
          // this will only ever be a string
          id: joi.string().required()
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
  {
    method: ['POST'],
    path: '/product/uploadReviewCSV',
    handler: 'ProductController.uploadReviewCSV',
    config: {
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductUploadReviewCsvRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST'],
    path: '/product/processReviewUpload/:id',
    handler: 'ProductController.processReviewUpload',
    config: {
      validate: {
        params: {
          // this will only ever be a string
          id: joi.string().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostProductProcessReviewUploadRoute',
          roles: ['admin']
        }
      }
    }
  },

  // Orders
  {
    method: ['GET'],
    path: '/orders',
    handler: 'OrderController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.object(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetOrdersRoute',
          roles: ['admin']
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          event: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['GET'],
    path: '/order/token/:token',
    handler: 'OrderController.findByToken',
    config: {
      validate: {
        params: {
          token: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetOrderTokenTokenRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/order/:id/customer',
    handler: 'OrderController.customer',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetOrderIdCustomerRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST', 'PUT'],
    path: '/order/:id',
    handler: 'OrderController.update',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/order/:id/pricingOverrides',
    handler: 'OrderController.pricingOverrides',
    config: {
      validate: {
        params: {
          id: joi.number().required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdPricingOverridesRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/order/:id/addItem',
    handler: 'OrderController.addItem',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/order/:id/addItems',
    handler: 'OrderController.addItems',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdAddItemsRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/order/:id/updateItem',
    handler: 'OrderController.updateItem',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/order/:id/removeItem',
    handler: 'OrderController.removeItem',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/order/:id/addShipping',
    handler: 'OrderController.addShipping',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/order/:id/removeShipping',
    handler: 'OrderController.removeShipping',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/order/:id/addTaxes',
    handler: 'OrderController.addTaxes',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdAddTaxesRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/order/:id/removeTaxes',
    handler: 'OrderController.removeTaxes',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdRemoveTaxesRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/order/:id/fulfill',
    handler: 'OrderController.fulfill',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdFulfillRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/order/:id/pay',
    handler: 'OrderController.pay',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdEventsRoute',
          roles: ['admin']
        },
        proxyRouter: {
          ignore: true
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdRefundsRoute',
          roles: ['admin']
        },
        proxyRouter: {
          ignore: true
        },
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdTransactionsRoute',
          roles: ['admin']
        },
        proxyRouter: {
          ignore: true
        },
      }
    }
  },
  {
    method: ['PUT'],
    path: '/order/:id/transaction/:transaction/pay',
    handler: 'OrderController.payTransaction',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          transaction: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPutOrderIdTransactionTransactionPayRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['PUT'],
    path: '/order/:id/transaction/:transaction/authorize',
    handler: 'OrderController.authorizeTransaction',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          transaction: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPutOrderIdTransactionTransactionAuthorizeRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['PUT'],
    path: '/order/:id/transaction/:transaction/capture',
    handler: 'OrderController.captureTransaction',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          transaction: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPutOrderIdTransactionTransactionCaptureRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['PUT'],
    path: '/order/:id/transaction/:transaction/void',
    handler: 'OrderController.voidTransaction',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          transaction: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPutOrderIdTransactionTransactionVoidRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['PUT'],
    path: '/order/:id/transaction/:transaction/refund',
    handler: 'OrderController.refundTransaction',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          transaction: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPutOrderIdTransactionTransactionRefundRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['PUT'],
    path: '/order/:id/transaction/:transaction/retry',
    handler: 'OrderController.retryTransaction',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          transaction: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPutOrderIdTransactionTransactionRetryRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['PUT'],
    path: '/order/:id/transaction/:transaction/cancel',
    handler: 'OrderController.cancelTransaction',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          transaction: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPutOrderIdTransactionTransactionCancelRoute',
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdFulfillmentsRoute',
          roles: ['admin']
        },
        proxyRouter: {
          ignore: true
        }
      }
    }
  },
  {
    method: ['PUT'],
    path: '/order/:id/fulfillment/:fulfillment',
    handler: 'OrderController.updateFulfillment',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          fulfillment: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPutOrderIdFulfillmentFulfillmentRoute',
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          tag: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          tag: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/order/:id/tag/:tag',
    handler: 'OrderController.addTag',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          tag: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPutOrderIdTagTagRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['DELETE'],
    path: '/order/:id/tag/:tag',
    handler: 'OrderController.removeTag',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          tag: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiDeleteOrderTagTagRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/order/:id/cancel',
    handler: 'OrderController.cancel',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/order/:id/authorize',
    handler: 'OrderController.authorize',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/order/:id/capture',
    handler: 'OrderController.capture',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/order/:id/void',
    handler: 'OrderController.void',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/order/:id/refund',
    handler: 'OrderController.refund',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/order/:id/retry',
    handler: 'OrderController.retry',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/order/:id/send',
    handler: 'OrderController.send',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostOrderIdSendRoute',
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
          sort: joi.array().items(joi.array()),
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
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          term: joi.string().required(),
          include: joi.array().items(joi.string())
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
          // this will only ever be a string
          id: joi.string().required()
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
    path: '/reviews',
    handler: 'ReviewController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiGetReviewsRoute',
          roles: ['admin']
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiGetReviewIdRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/review/:id',
    handler: 'ReviewController.update',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          sort: joi.array().items(joi.array()),
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
    path: '/reviews/search',
    handler: 'ReviewController.search',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any().optional(),
          term: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetReviewsSearchRoute',
          roles: ['public','registered','admin']
        }
      }
    }
  },

  // Shop
  {
    method: ['GET'],
    path: '/shops',
    handler: 'ShopController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetShopsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/shop/generalStats',
    handler: 'ShopController.generalStats',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
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
    path: '/subscriptions',
    handler: 'SubscriptionController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetSubscriptionsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/subscriptions/search',
    handler: 'SubscriptionController.search',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any().optional(),
          term: joi.string().required(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetSubscriptionsSearchRoute',
          roles: ['public','registered','admin']
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostSubscriptionIdRoute',
          roles: ['admin']
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['GET'],
    path: '/subscription/token/:token',
    handler: 'SubscriptionController.findByToken',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetSubscriptionTokenTokenRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/subscription/:id/activate',
    handler: 'SubscriptionController.activate',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostSubscriptionIdActivateRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/subscription/:id/deactivate',
    handler: 'SubscriptionController.deactivate',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostSubscriptionIdDeactivateRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/subscription/:id/renew',
    handler: 'SubscriptionController.renew',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostSubscriptionIdRenewRoute',
          roles: ['admin']
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostSubscriptionIdAddItemsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/subscription/:id/cancel',
    handler: 'SubscriptionController.cancel',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostSubscriptionIdCancelRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/subscription/:id/removeItems',
    handler: 'SubscriptionController.removeItems',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostSubscriptionIdRemoveItemsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/subscription/:id/events',
    handler: 'SubscriptionController.events',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetSubscriptionIdEventsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['POST','PUT'],
    path: '/subscription/:id/update',
    handler: 'SubscriptionController.update',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyPermissions: {
          resource_name: 'apiPostSubscriptionIdUpdateRoute',
          roles: ['admin']
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
          sort: joi.array().items(joi.array()),
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
          // this will only ever be a string
          id: joi.string().required()
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
    path: '/tags',
    handler: 'TagController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetTagsRoute',
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          // this will only ever be a string
          name: joi.string().required()
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
          sort: joi.array().items(joi.array()),
          where: joi.any().optional(),
          term: joi.any(),
          include: joi.array().items(joi.string())
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
          sort: joi.array().items(joi.array()),
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
    path: '/transactions',
    handler: 'TransactionController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetTransactionsRoute',
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/transaction/:id',
    handler: 'TransactionController.update',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/transaction/:id/authorize',
    handler: 'TransactionController.authorize',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/transaction/:id/capture',
    handler: 'TransactionController.capture',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/transaction/:id/retry',
    handler: 'TransactionController.retry',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/transaction/:id/sale',
    handler: 'TransactionController.sale',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/transaction/:id/void',
    handler: 'TransactionController.void',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/transaction/:id/refund',
    handler: 'TransactionController.refund',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
    method: ['POST','PUT'],
    path: '/transaction/:id/cancel',
    handler: 'TransactionController.cancel',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
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
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
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

  {
    method: ['GET'],
    path: '/user/:id/passports',
    handler: 'UserController.passports',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetUserIdPassportsRoute',
          roles: ['admin']
        }
      }
    }
  },

  {
    method: ['GET'],
    path: '/user/reviews',
    handler: 'UserController.reviews',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetUserReviewsRoute',
          roles: ['admin','registered']
        }
      }
    }
  },

  // Vendor
  {
    method: ['GET'],
    path: '/vendors',
    handler: 'VendorController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetVendorsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/vendors/search',
    handler: 'VendorController.search',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.array().items(joi.array()),
          where: joi.any(),
          term: joi.any(),
          include: joi.array().items(joi.string())
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetVendorsSearchRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/vendor/:id/products',
    handler: 'VendorController.products',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetVendorIdProductsRoute',
          roles: ['admin']
        }
      }
    }
  },
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
          // This will only ever be a sting
          id: joi.string().required()
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
