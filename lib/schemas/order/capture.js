'use strict'
const joi = require('joi')

module.exports = joi.array().items(joi.object().keys({
  transaction: joi.alternatives().try(
    joi.number(),
    joi.string()
  ),
  transactions: joi.array().items(joi.alternatives().try(
    joi.number(),
    joi.string()
  )),
}))
