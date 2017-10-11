'use strict'
const joi = require('joi')
const _ = require('lodash')
const ORDER_CANCEL = require('../../enums').ORDER_CANCEL
module.exports = joi.object().keys({
  cancel_reason: joi.string().allow().valid(_.values(ORDER_CANCEL))
})
