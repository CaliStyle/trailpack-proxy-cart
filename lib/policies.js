'use strict'

module.exports = {
  ProductController: {
    uploadCSV: [ 'ProductPolicy.csv'],
    uploadMetaCSV: [ 'ProductPolicy.csv']
  },
  CustomerController: {
    create: ['ProxyCartPolicy.clientDetails'],
    uploadCSV: [ 'CustomerPolicy.csv' ]
  },
  CartController: {
    create: ['ProxyCartPolicy.clientDetails'],
    checkout: ['ProxyCartPolicy.clientDetails']
  }
}
