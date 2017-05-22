'use strict'

const Service = require('trails/service')
const Errors = require('proxy-engine-errors')

/**
 * @module CountryService
 * @description Country Service
 */
module.exports = class CountryService extends Service {
  // TODO
  createCountry(country){
    return Promise.resolve(country)
  }
  // TODO
  updateCountry(country){
    return Promise.resolve(country)
  }
  // TODO
  destroyCountry(country){
    return Promise.resolve(country)
  }
  // TODO
  createProvince(province){
    return Promise.resolve(province)
  }
  // TODO
  updateProvince(province){
    return Promise.resolve(province)
  }
  // TODO
  destroyProvince(province){
    return Promise.resolve(province)
  }
  // TODO
  createCounty(county){
    return Promise.resolve(county)
  }
  // TODO
  updateCounty(county){
    return Promise.resolve(county)
  }
  // TODO
  destroyCounty(county){
    return Promise.resolve(county)
  }
  // TODO
  createCity(city){
    return Promise.resolve(city)
  }
  // TODO
  updateCity(city){
    return Promise.resolve(city)
  }
  // TODO
  destroyCity(city){
    return Promise.resolve(city)
  }
  /**
   *
   * @param country
   * @param province
   * @returns {Promise.<TResult>}
   */
  addProvince(country, province){
    let resCountry, resProvince
    return this.resolveCountry(country)
      .then(country => {
        if (!country) {
          throw new Errors.FoundError(Error('Country not found'))
        }
        resCountry = country
        return this.resolveProvince(province)
      })
      .then(province => {
        if (!province) {
          throw new Errors.FoundError(Error('Country not found'))
        }
        resProvince = province
        return resCountry.hasProvince(resProvince.id)
      })
      .then(hasProvince => {
        if (!hasProvince) {
          return resCountry.addProvince(resProvince.id)
        }
        return resCountry
      })
      .then(province => {
        return this.app.orm['Country'].findById(resCountry.id)
      })
  }

  /**
   *
   * @param country
   * @param province
   * @returns {Promise.<TResult>}
   */
  removeProvince(country, province){
    let resCountry, resProvince
    return this.resolveCountry(country)
      .then(country => {
        if (!country) {
          throw new Errors.FoundError(Error('Country not found'))
        }
        resCountry = country
        return this.resolveProvince(province)
      })
      .then(province => {
        if (!province) {
          throw new Errors.FoundError(Error('Country not found'))
        }
        resProvince = province
        return resCountry.hasProvince(resProvince.id)
      })
      .then(hasProvince => {
        if (hasProvince) {
          return resCountry.removeProvince(resProvince.id)
        }
        return resCountry
      })
      .then(province => {
        return this.app.orm['Country'].findById(resCountry.id)
      })
  }
}

