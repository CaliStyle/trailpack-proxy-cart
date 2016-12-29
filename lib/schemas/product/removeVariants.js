'use strict'
const joi = require('joi')
const variantSchema = require('./variant')

module.exports =  joi.array().items(variantSchema)
