'use strict'

const joi = require('joi')
const lib = require('../')
const Errors = require('proxy-engine-errors')

module.exports = {
  // Validate Create Country
  createCountry(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.country.country, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Update Country
  updateCountry(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.country.country, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Destroy Country
  destroyCountry(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.country.country, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Create Province
  createProvince(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.country.province, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Update Province
  updateProvince(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.country.province, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Destroy Province
  destroyProvince(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.country.province, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Create County
  createCounty(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.country.county, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Update County
  updateCounty(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.country.county, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Destroy County
  destroyCounty(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.country.county, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Create City
  createCity(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.country.city, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Update City
  updateCity(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.country.city, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  },
  // Validate Destroy City
  destroyCity(data) {
    return new Promise((resolve, reject) => {
      joi.validate(data, lib.Schemas.country.city, (err, value) => {
        if (err) {
          return reject(new Errors.ValidationError(err))
        }
        return resolve(value)
      })
    })
  }
}
