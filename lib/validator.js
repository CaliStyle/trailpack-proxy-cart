/* eslint no-console: [0] */
'use strict'

const joi = require('joi')
const lib = require('.')
const Errors = require('proxy-engine-errors')

module.exports = {
  validateDatabase: {
    // Validate Database Config
    config(config) {
      return new Promise((resolve, reject) => {
        joi.validate(config, lib.Schemas.databaseConfig, (err, value) => {
          if (err) {
            return reject(new TypeError('config.database: ' + err))
          }
          return resolve(value)
        })
      })
    }
  },
  validateProxyCart: {
    config(config){
      return new Promise((resolve, reject) => {
        joi.validate(config, lib.Schemas.proxyCartConfig, (err, value) => {
          if (err) {
            return reject(new TypeError('config.proxyCart: ' + err))
          }
          return resolve(value)
        })
      })
    }
  },
  // Validate Address
  validateAddress (data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.address.address, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Shop
  validateShop (data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.shop.shop, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Customer
  validateCustomer (data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.customer.customer, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  validateProduct: {
    // Validate Add Product
    add(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.product.product, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    },
    // Validate Add Products
    addProducts(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.product.add, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    },
    // Validate Update Product
    update(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.product.product, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    },
    // Validate Update Products
    updateProducts(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.product.update, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    },
    // Validate Remove Product
    remove(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.product.product, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    },
    // Validate Remove Products
    removeProducts(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.product.remove, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    }
  },
  validateVariant: {
    // Validate Remove Product Variant
    remove(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.product.variant, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    },
    // Validate Remove Product Variants
    removeVariants(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.product.removeVariants, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    }
  },
  validateImage: {
    // Validate remove Product Image
    remove(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.product.image, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    },
    // Validate remove Product Images
    removeImages(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.product.removeImages, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    }
  },
  validateCart: {
    // Validate Creating a cart
    create(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.cart.cart, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    },
    // Validate Cart Checkout
    checkout(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.cart.checkout, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    },
    // Validate Items to add to cart
    addItems(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.cart.addItems, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    },
    // Validate Items to remove from cart
    removeItems(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.cart.removeItems, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    },
    // Validate Clearing all items from the cart
    clear(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.cart.clear, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    }
  },
  validateOrder: {
    // Validate Order Create
    create(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.orders.order, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    },
    // Validate Order Update
    update(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.orders.update, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    },
    // Validate Order Cancel
    cancel(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.orders.cancel, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    }
  },
  validateTransaction: {
    // Validate Transaction
    authorize(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.transactions.transaction, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    },
    // Validate Transaction
    capture(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.transactions.transaction, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    },
    // Validate Transaction
    sale(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.transactions.transaction, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    },
    // Validate Transaction
    void(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.transactions.transaction, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    },
    // Validate Transaction
    refund(data) {
      return new Promise((resolve, reject) => {
        joi.validate(data, lib.Schemas.transactions.transaction, (err, value) => {
          if (err) {
            return reject(new Errors.ValidationError(err))
          }
          return resolve(value)
        })
      })
    }
  }
}
