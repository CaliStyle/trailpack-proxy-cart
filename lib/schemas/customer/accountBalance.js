'use strict'
const joi = require('joi')

module.exports = joi.object().keys({
  id: joi.any(),
  account_balance: joi.number()
})
