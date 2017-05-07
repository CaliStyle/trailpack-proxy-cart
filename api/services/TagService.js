'use strict'

const Service = require('trails/service')
const _ = require('lodash')
// const Errors = require('proxy-engine-errors')

/**
 * @module TagService
 * @description Tag Service
 */
module.exports = class TagService extends Service {
  resolve(tag, options) {
    const Tag =  this.app.orm.Tag

    if (!options) {
      options = {}
    }

    if (tag instanceof Tag.Instance){
      return Promise.resolve(tag)
    }
    else if (tag && _.isObject(tag) && tag.id) {
      return Tag.findById(tag.id, options)
        .then(foundTag => {
          if (!foundTag) {
            // TODO create proper error
            throw new Error(`Tag with ${tag.id} not found`)
          }
          return foundTag
        })
    }
    else if (tag && _.isObject(tag) && tag.name) {
      return Tag.findOne({
        where: {
          name: tag.name
        }
      }, options)
        .then(resTag => {
          if (resTag) {
            return resTag
          }
          return Tag.create(tag, options)
        })
    }
    else if (tag && _.isString(tag)) {
      return Tag.findOne({
        where: {
          $or: {
            name: tag,
            id: tag
          }
        }
      }, options)
        .then(resTag => {
          if (resTag) {
            return resTag
          }
          return Tag.create({name: tag})
        })
    }
    else {
      // TODO make Proper Error
      const err = new Error(`Not able to resolve tag ${tag}`)
      return Promise.reject(err)
    }
  }
}

