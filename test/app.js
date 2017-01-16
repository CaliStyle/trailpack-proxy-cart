'use strict'
const _ = require('lodash')
const smokesignals = require('smokesignals')
const fs = require('fs')
// const bodyParser = require('body-parser')
// const lib = require('../lib')

const packs = [
  require('trailpack-router'),
  require('trailpack-proxy-engine'),
  require('trailpack-proxy-permissions'),
  require('trailpack-proxy-generics'),
  require('trailpack-proxy-cart-countries'),
  require('../') // trailpack-proxy-cart
]


const SERVER = process.env.SERVER || 'express'
const ORM = process.env.ORM || 'sequelize'
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
  stores.sqlitedev = {
    database: 'ProxyCart',
    storage: './test/test.sqlite',
    host: '127.0.0.1',
    dialect: 'sqlite'
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
  api: require('../api'),
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
    policies: {},
    log: {
      logger: new smokesignals.Logger('debug')
    },
    web: web,
    // Proxy Generics
    proxyGenerics: {
      payment_processor: {
        adapter: require('./fixtures/FakePayment'),
        options: {}
      },
      data_store_provider: {
        adapter: require('./fixtures/FakeDataStore'),
        options: {}
      },
      tax_provider: {
        adapter: require('./fixtures/FakeTax'),
        options: {}
      },
      shipping_provider: {
        adapter: require('./fixtures/FakeShipping'),
        options: {}
      },
      fulfillment_provider: {
        adapter: require('./fixtures/FakeFulfillment'),
        options: {}
      }

    },
    proxyEngine: {
      live_mode: false
    }
  }
}

const dbPath = __dirname + './test.sqlite'
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath)
}
const uploadPath = __dirname + './test.uploads.sqlite'
if (fs.existsSync(uploadPath)) {
  fs.unlinkSync(uploadPath)
}

_.defaultsDeep(App, smokesignals.FailsafeConfig)
module.exports = App
