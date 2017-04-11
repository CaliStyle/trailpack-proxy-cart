'use strict'

const Service = require('trails/service')
const _ = require('lodash')
/**
 * @module VendorService
 * @description Vendor Service
 */
module.exports = class VendorService extends Service {
  resolve(vendor, options) {
    const Vendor =  this.app.orm.Vendor
      // const Sequelize = Vendor.sequelize

    if (vendor instanceof Vendor.Instance){
      return Promise.resolve(vendor)
    }
    else if (vendor && _.isObject(vendor) && vendor.id) {
      return Vendor.findById(vendor.id, options)
        .then(foundVendor => {
          if (!foundVendor) {
            // TODO create proper error
            throw new Error(`Vendor with ${vendor.id} not found`)
          }
          return foundVendor
        })
    }
    else if (vendor && _.isObject(vendor) && (vendor.handle || vendor.name)) {
      return Vendor.find({
        where: {
          $or: {
            handle: vendor.handle,
            name: vendor.name
          }
        }
      }, options)
        .then(resVendor => {
          if (resVendor) {
            return resVendor
          }
          return Vendor.create(vendor, options)
        })
    }
    else if (vendor && _.isString(vendor)) {
      return Vendor.find({
        where: {
          $or: {
            handle: vendor,
            name: vendor,
            id: vendor
          }
        }
      }, options)
        .then(resVendor => {
          if (resVendor) {
            return resVendor
          }
          const err = new Error(`Not able to resolve vendor ${vendor}`)
          return Promise.reject(err)
        })
    }
    else {
        // TODO make Proper Error
      const err = new Error(`Not able to resolve vendor ${vendor}`)
      return Promise.reject(err)
    }
  }

  // TODO if this drop shipping, we need to resolve the vendors address
  getVendorAddress(address) {
    //
  }
}

