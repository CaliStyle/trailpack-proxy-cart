'use strict'

module.exports = {
  CartController: {
    // '*': ['CartPolicy.session', 'CustomerPolicy.session'],
    create: ['ProxyCartPolicy.clientDetails'],
    checkout: ['ProxyCartPolicy.clientDetails']
  },
  CollectionController: {
    uploadCSV: [ 'CollectionPolicy.csv' ]
  },
  CustomerController: {
    // '*': ['CartPolicy.session', 'CustomerPolicy.session'],
    create: ['ProxyCartPolicy.clientDetails'],
    uploadCSV: [ 'CustomerPolicy.csv' ]
  },
  SubscriptionController: {
    uploadCSV: [ 'SubscriptionPolicy.csv' ]
  },
  ProductController: {
    uploadCSV: [ 'ProductPolicy.csv'],
    uploadMetaCSV: [ 'ProductPolicy.csv']
  },
  VendorController: {
    uploadCSV: [ 'VendorPolicy.csv' ]
  },
}
