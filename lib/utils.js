/* eslint no-console: [0] */
'use strict'

const lib = require('./')
// const _ = require('lodash')

module.exports = {
  /**
   *
   * @param app
   * @returns {Promise.<{shops: Array}>}
   */
  buildShopFixtures: (app) => {
    const fixtures = {
      shops: []
    }
    fixtures.shops.push(app.config.proxyCart.nexus)
    // console.log('utils.buildShopFixtures', fixtures)
    return Promise.resolve(fixtures)
  },
  /**
   *
   * @param app
   * @returns {*|Promise.<TResult>}
   */
  loadShopFixtures: (app) => {
    return app.orm.Shop.find({limit: 1})
      .then(shops => {
        if (!shops || shops.length === 0) {
          app.log.debug('utils.loadShopFixtures: Shops empty, loadShops...')
          return lib.Utils.loadShops(app)
        }
        else {
          return
        }
      })
  },
  /**
   *
   * @param app
   * @returns {Promise.<*>}
   */
  loadShops: (app) => {
    const shops = app.packs['proxy-cart'].shopFixtures.shops
    if (shops.length > 0) {
      app.log.debug('utils.loadShops Promise All()')
      return Promise.all(shops.map(shop => {
        return app.orm['Shop'].create(shop, {
          include: [
            {
              model: app.orm['Address'],
              as: 'address'
            }
          ]
        })
      }))
    }
    else {
      return Promise.resolve()
    }
  },
  /**
   *
   * @param app
   */
  buildCountryFixtures: (app) => {
    const fixtures = {
      countries: []
    }
    if (!app.config.proxyCart.default_countries || app.config.proxyCart.default_countries.length === 0) {
      app.config.proxyCart.default_countries = ['USA']
    }
    app.config.proxyCart.default_countries.forEach(country => {
      fixtures.countries.push(country)
    })
    // console.log('utils.buildShopFixtures', fixtures)
    return Promise.resolve(fixtures)
  },
  /**
   *
   * @param app
   * @returns {*|Promise.<TResult>}
   */
  loadCountryFixtures: (app) => {
    return app.orm.Country.find({limit: 1})
      .then(countries => {
        if (!countries || countries.length === 0) {
          app.log.debug('utils.loadCountriesFixtures: Countries empty, loadCountries...')
          return lib.Utils.loadCountries(app)
        }
        else {
          return
        }
      })
  },
  /**
   *
   * @param app
   * @returns {Promise.<*>}
   */
  loadCountries: (app) => {
    const countries = app.packs['proxy-cart'].countryFixtures.countries
    if (countries.length > 0) {
      app.log.debug('utils.loadCountries Promise All()')
      return Promise.all(countries.map((country, index) => {
        const resCountry = app.services.ProxyCountryService.info(country)
        if (!resCountry) {
          return Promise.resolve()
        }
        const create = {
          code: resCountry.ISO.alpha2,
          name: resCountry.name,
          tax_name: resCountry.tax_name,
          tax_type: resCountry.tax_type,
          position: index + 1,
          provinces: []
        }
        if (resCountry.tax_type === 'rate') {
          create.tax_rate = resCountry.tax
        }
        else {
          create.tax_percentage = resCountry.tax
        }

        resCountry.states.forEach((state, i) => {
          const newState = {
            code: state.code,
            name: state.name,
            tax_name: state.tax_name,
            tax_type: state.tax_type,
            position: i + 1
          }
          if (state.tax_type === 'rate') {
            newState.tax_rate = state.tax
          }
          else {
            newState.tax_percentage = state.tax
          }
          create.provinces.push(newState)
        })
        return app.orm['Country'].create(create, {
          include: [
            {
              model: app.orm['Province'],
              as: 'provinces'
            }
          ]
        })
      }))
    }
    else {
      return Promise.resolve()
    }
  }
}
