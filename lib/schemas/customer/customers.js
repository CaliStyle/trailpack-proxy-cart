'use strict'
const joi = require('joi')
const customerSchema = require('./customer')
module.exports = joi.array().items(customerSchema)
