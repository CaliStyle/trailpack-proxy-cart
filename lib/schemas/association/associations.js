'use strict'
const joi = require('joi')
const associationSchema = require('./association')

module.exports = joi.array().items(associationSchema)
