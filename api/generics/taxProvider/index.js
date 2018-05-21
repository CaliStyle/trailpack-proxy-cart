/* eslint no-console: [0] */
'use strict'
// const _ = require('lodash')
const Generic = require('trailpack-proxy-generics').Generic
module.exports = class DefaultTaxProvider extends Generic {
  constructor(options) {
    super()
    this.options = options
  }
  getRate(data) {
    return Promise.resolve({
      amount: 0,
      rate: 0.0,
      title: 'Sales Tax',
      tax_details: {}
    })
  }

  taxForOrder(data) {
    const app = this.options.app
    const Country = app.orm['Country']
    const Province = app.orm['Province']
    return Promise.resolve()
      .then(() => {
        return Province.sequelize.Promise.mapSeries(data.nexus_addresses, nexus => {
          return Province.findOne({
            where: {
              code: nexus.province_code
            },
            attributes: ['id','code','tax_name','tax_type','tax_rate','tax_percentage'],
            include: [
              {
                model: Country,
                attributes: ['id','code','tax_name','tax_rate','tax_percentage'],
                where: {
                  code: nexus.country_code
                }
              }
            ]
          })
        })
      })
      .then((nexusProvinces) => {
        nexusProvinces = nexusProvinces.filter(n => n)

        if (data.to_address && nexusProvinces.some(p => p.code === data.to_address.province_code)) {
          this.options.app.log.debug('HAS NEXUS TAXES:', data.to_address.province_code)

          const nexus = nexusProvinces.find(p => p.code === data.to_address.province_code)

          const taxLines = []
          let totalTaxes = 0
          const lineItems = data.line_items.map(item => {
            const calc = nexus.tax_type === 'rate' ?
              item.calculated_price + nexus.tax_rate
              : Math.round(item.calculated_price * nexus.tax_percentage)

            item.tax_lines = [
              {
                name: nexus.tax_name,
                price: calc
              }
            ]
            item.total_taxes = calc
            return item
          })

          lineItems.forEach(item => {
            totalTaxes = totalTaxes + item.total_taxes
            taxLines.push(item.tax_lines[0])
          })

          return Promise.resolve({
            tax_lines: taxLines,
            line_items: lineItems
          })
        }
        else {
          return {
            line_items: data.line_items,
            tax_lines: [],
            total_taxes: 0
          }
        }
      })
  }
}
