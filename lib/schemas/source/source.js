'use strict'
const joi = require('joi')
module.exports = joi.object().keys({
  id: joi.string(),
  account_foreign_id: joi.any(),
  account_foreign_key: joi.any(),
  gateway: joi.string()
}).unknown()
