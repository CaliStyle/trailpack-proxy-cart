'use strict'
const joi = require('joi')
const imageSchema = require('./image')

module.exports =  joi.array().items(imageSchema)
