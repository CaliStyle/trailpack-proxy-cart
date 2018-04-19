'use strict'

const joi = require('joi')
const lib = require('../')
const Errors = require('proxy-engine-errors')

module.exports = {
  // Validate Order Create
  create(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.order.order, (err, value) => {
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
      joi.validate(data, lib.Schemas.order.update, (err, value) => {
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
      joi.validate(data, lib.Schemas.order.cancel, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Order Pay
  pay(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.order.pay, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Order Refund
  refund(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.order.refund, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Order Refund
  retry(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.order.retry, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Order transaction capture
  authorize(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.order.authorize, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Order transaction capture
  capture(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.order.capture, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Order transaction void
  void(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.order.void, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  addItem(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.order.addItem, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  addItems(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.order.addItems, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  updateItem(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.order.updateItem, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  removeItem(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.order.removeItem, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  addShipping(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.order.addShipping, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  removeShipping(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.order.removeShipping, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  addTaxes(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.order.addTaxes, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  removeTaxes(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.order.removeTaxes, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  fulfill(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.order.fulfill, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  send(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.order.send, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  }
}
