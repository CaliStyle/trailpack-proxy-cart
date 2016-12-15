'use strict'
const joi = require('joi')
const productSchema = require('./product')

module.exports =  joi.array().items(productSchema)
