'use strict'
const _ = require('lodash')
const smokesignals = require('smokesignals')
const fs = require('fs')
const path = require('path')
// const bodyParser = require('body-parser')
// const lib = require('../lib')
const Service = require('trails/service')

const packs = [
  require('trailpack-router'),
  require('trailpack-proxy-passport'),
  require('trailpack-proxy-engine'),
  require('trailpack-proxy-permissions'),
  require('trailpack-proxy-generics'),
  require('trailpack-proxy-cart-countries'),
  require('../') // trailpack-proxy-cart
]


const SERVER = process.env.SERVER || 'express'
const ORM = process.env.ORM || 'sequelize'
const DIALECT = process.env.DIALECT || 'sqlite'

let web = {}

const stores = {
  sqlitedev: {
    adapter: require('sails-disk')
  },
  uploads: {
    database: 'ProxyCart',
    storage: './test/test.uploads.sqlite',
    host: '127.0.0.1',
    dialect: 'sqlite'
  }
}

if (ORM === 'waterline') {
  packs.push(require('trailpack-waterline'))
}
else if (ORM === 'sequelize') {
  packs.push(require('trailpack-sequelize'))
  if (DIALECT == 'postgres') {
    stores.sqlitedev = {
      database: 'ProxyCart',
      host: '127.0.0.1',
      dialect: 'postgres'
    }
  }
  else {
    stores.sqlitedev = {
      database: 'ProxyCart',
      storage: './test/test.sqlite',
      host: '127.0.0.1',
      dialect: 'sqlite'
    }
  }
}

if ( SERVER == 'express' ) {
  packs.push(require('trailpack-express'))
  web = {
    express: require('express'),
    middlewares: {
      order: [
        'static',
        'addMethods',
        'cookieParser',
        'session',
        'bodyParser',
        'passportInit',
        'passportSession',
        'proxyCartInit',
        'proxyCartSession',
        'proxyCartSessionCart',
        'proxyCartSessionCustomer',
        'methodOverride',
        'router',
        'www',
        '404',
        '500'
      ],
      static: require('express').static('test/static')
    }
  }
}

const App = {
  api: _.defaultsDeep(require('../api'), {
    services: {
      FailTransaction: class FailTransaction extends Service {

      },
      FailFulfillment: class FailFulfillment extends Service {

      }
    }
  }),
  pkg: {
    name: 'trailpack-proxy-cart-test',
    version: '1.0.0'
  },
  config: {
    database: {
      stores: stores,
      models: {
        defaultStore: 'sqlitedev',
        migrate: 'drop'
      }
    },
    routes: [],
    main: {
      packs: packs
    },
    policies: {
      // '*': [ 'CheckPermissions.checkRoute' ]
    },
    log: {
      logger: new smokesignals.Logger('debug')
    },
    web: web,
    session: {
      secret: 'proxyCart'
    },
    proxyPassport: {
      strategies: {
        local: {
          strategy: require('passport-local').Strategy
        }
      },
      onUserLogin: {
        cart: (req, app, user) => {
          if (!req || !user.current_cart_id) {
            return Promise.resolve(user)
          }
          else {
            return new Promise((resolve, reject) => {
              app.orm['Cart'].findById(user.current_cart_id)
                .then(cart => {
                  if (!cart) {
                    return resolve(user)
                  }
                  if (user.current_customer_id) {
                    cart.customer_id = user.current_customer_id
                  }
                  return cart.save()
                })
                .then(cart => {
                  req.loginCart(cart, (err) => {
                    if (err) {
                      return reject(err)
                    }
                    else {
                      return resolve(user)
                    }
                  })
                })
            })
          }
        },
        customer: (req, app, user) => {
          if (!req || !user.current_customer_id) {
            return Promise.resolve(user)
          }
          else {
            return new Promise((resolve, reject) => {
              app.orm['Customer'].findById(user.current_customer_id)
                .then(customer => {
                  if (!customer) {
                    return resolve(user)
                  }
                  // console.log(customer)
                  req.loginCustomer(customer, (err) => {
                    if (err) {
                      return reject(err)
                    }
                    else {
                      return resolve(user)
                    }
                  })
                })
            })
          }
        }
      },
      onUserLogout: {
        cart: (req, app, user) => {
          if (req) {
            req.logoutCart()
          }
          return Promise.resolve(user)
        },
        customer: (req, app, user) => {
          if (req) {
            req.logoutCustomer()
          }
          return Promise.resolve(user)
        }
      },
      onUserRecovered: {
        cart: (req, app, user) => {
          if (!req || !user.current_cart_id) {
            return Promise.resolve(user)
          }
          else {
            return new Promise((resolve, reject) => {
              app.orm['Cart'].findById(user.current_cart_id)
                .then(cart => {
                  if (!cart) {
                    return resolve(user)
                  }
                  if (user.current_customer_id) {
                    cart.customer_id = user.current_customer_id
                  }
                  return cart.save()
                })
                .then(cart => {
                  req.loginCart(cart, (err) => {
                    if (err) {
                      return reject(err)
                    }
                    else {
                      return resolve(user)
                    }
                  })
                })
            })
          }
        },
        customer: (req, app, user) => {
          if (!req || !user.current_customer_id) {
            return Promise.resolve(user)
          }
          else {
            return new Promise((resolve, reject) => {
              app.orm['Customer'].findById(user.current_customer_id)
                .then(customer => {
                  if (!customer) {
                    return resolve(user)
                  }
                  // console.log(customer)
                  req.loginCustomer(customer, (err) => {
                    if (err) {
                      return reject(err)
                    }
                    else {
                      return resolve(user)
                    }
                  })
                })
            })
          }
        }
      }
    },
    proxyPermissions: {
      defaultRole: 'public',
      defaultRegisteredRole: 'registered',
      modelsAsResources: true,
      fixtures: {
        roles: [{
          name: 'admin',
          public_name: 'Admin'
        }, {
          name: 'registered' ,
          public_name: 'Registered'
        }, {
          name: 'public' ,
          public_name: 'Public'
        }],
        permissions: []
      },
      defaultAdminUsername: 'admin',
      defaultAdminPassword: 'admin1234'
    },
    proxyCart: {
      // The default Shop address (Nexus)
      nexus: {
        name: 'Test Shop',
        email: 'example@example.com',
        host: 'localhost',
        address: {
          address_1: '1 Infinite Loop',
          city: 'Cupertino',
          province: 'California',
          country: 'United States',
          postal_code: '95014'
        }
      },
      // The default function for an automatic order payment: manual, authorize, sale
      order_payment_kind: 'authorize',
      // The default function for an automatic order fulfillment: manual, immediate
      order_fulfillment_kind: 'manual',
      // Restock default for refunded order items
      refund_restock: false,
      // Allow certain events
      allow: {
        // Allows a product to be destroyed Recommended false
        destroy_product: false,
        // Allows a product variant to be destroyed Recommended false
        destroy_variant: false
      },
      // Subscriptions
      subscriptions: {
        // The amount of times a Subscription will retry failed transactions
        retry_attempts: 5,
        // The amount of days before a Subscription will cancel from failed transactions
        grace_period_days: 5
      },
      // Orders
      orders: {
        // The amount of times a Order will retry failed transactions
        retry_attempts: 5,
        // The amount of days before a Order will cancel from failed transactions
        grace_period_days: 5
      }
    },
    // Proxy Generics
    proxyGenerics: {
      payment_processor: {
        adapter: require('./fixtures/FakePayment'),
        options: {}
      },
      email_provider: {
        adapter: require('./fixtures/FakeEmail'),
        options: {}
      },
      data_store_provider: {
        adapter: require('./fixtures/FakeDataStore'),
        options: {}
      }
      // Moved to Default Generics
      // tax_provider: {
      //   adapter: require('../api/generics').taxProvider,
      //   options: {}
      // },
      // shipping_provider: {
      //   adapter: require('../api/generics').shippingProvider,
      //   options: {}
      // },
      // image_provider: {
      //   adapter: require('../api/generics').imageProvider,
      //   options: {}
      // },
      // geolocation_provider: {
      //   adapter: require('../api/generics').geolocationProvider,
      //   options: {}
      // },
      // render_service: {
      //   adapter: require('../api/generics').renderService,
      //   options: {}
      // },
      // fulfillment_provider: {
      //   adapter: require('./fixtures/FakeFulfillment'),
      //   options: {}
      // }
    },
    proxyEngine: {
      live_mode: false,
      worker: 'testProfile'
    }
  }
}

const dbPath = path.resolve(__dirname, './test.sqlite')
// console.log(dbPath)
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath)
}
const uploadPath = path.resolve(__dirname, './test.uploads.sqlite')
// console.log(uploadPath)
if (fs.existsSync(uploadPath)) {
  fs.unlinkSync(uploadPath)
}

_.defaultsDeep(App, smokesignals.FailsafeConfig)
module.exports = App
