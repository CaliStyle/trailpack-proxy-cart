/* eslint no-console: [0] */
'use strict'

const joi = require('joi')
const lib = require('.')
const Errors = require('proxy-engine-errors')

module.exports = {
  // Validate Database Config
  validateDatabaseConfig (config) {
    return new Promise((resolve, reject) => {
      joi.validate(config, lib.Schemas.databaseConfig, (err, value) => {
        if (err) {
          return reject(new TypeError('config.database: ' + err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Proxy Cart Config
  validateProxyCartConfig (config) {
    return new Promise((resolve, reject) => {
      joi.validate(config, lib.Schemas.proxyCartConfig, (err, value) => {
        if (err) {
          return reject(new TypeError('config.proxyCart: ' + err))
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
  validateTransaction: {
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
