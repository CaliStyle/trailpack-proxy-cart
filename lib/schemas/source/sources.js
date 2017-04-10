'use strict'
const joi = require('joi')
const sourceSchema = require('./source')
module.exports = joi.array().items(sourceSchema)
