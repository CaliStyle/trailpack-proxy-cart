'use strict'
const joi = require('joi')

module.exports =  joi.object().keys({
  live_mode: joi.boolean()
})
