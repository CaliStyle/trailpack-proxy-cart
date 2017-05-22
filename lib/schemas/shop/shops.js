'use strict'
const joi = require('joi')
const shopSchema = require('./shop')
module.exports = joi.array().items(shopSchema)
