'use strict'
const joi = require('joi')
const itemSchema = require('./line_item')
// TODO add schema
module.exports =  joi.array().items(itemSchema)
