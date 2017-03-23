const joi = require('joi')

module.exports = joi.object().keys({
  order: joi.array().items(joi.string(), joi.string().label('proxyCartInit', 'proxyCartSession').required())
}).unknown()
