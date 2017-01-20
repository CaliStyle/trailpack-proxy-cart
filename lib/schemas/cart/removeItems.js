'use strict'
const joi = require('joi')
const itemSchema = require('./line_item')
module.exports =  joi.array().items(itemSchema)
