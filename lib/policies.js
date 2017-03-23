'use strict'

module.exports = {
  CartController: {
    '*': ['CartPolicy.session', 'CustomerPolicy.session'],
    create: ['CartPolicy.session', 'CustomerPolicy.session','ProxyCartPolicy.clientDetails'],
    checkout: ['CartPolicy.session', 'CustomerPolicy.session', 'ProxyCartPolicy.clientDetails']
  },
  CollectionController: {
    uploadCSV: [ 'CollectionPolicy.csv' ]
  },
  CustomerController: {
    '*': ['CartPolicy.session', 'CustomerPolicy.session'],
    create: ['CartPolicy.session', 'CustomerPolicy.session', 'ProxyCartPolicy.clientDetails'],
    uploadCSV: [ 'CustomerPolicy.csv' ]
  },
  ProductController: {
    uploadCSV: [ 'ProductPolicy.csv'],
    uploadMetaCSV: [ 'ProductPolicy.csv']
  }
}
