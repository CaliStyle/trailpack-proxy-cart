'use strict'
const joi = require('joi')
const collectionSchema = require('./collection')
module.exports = joi.array().items(collectionSchema)
