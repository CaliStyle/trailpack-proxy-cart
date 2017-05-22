'use strict'
const joi = require('joi')
const tagSchema = require('./tag')
module.exports = joi.array().items(tagSchema)
