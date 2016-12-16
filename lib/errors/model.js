module.exports = class extends Error {
  constructor(code, message, errors) {
    super(message)
    this.code = code
    this.name = 'Model error'
    this.errors = errors

    Object.defineProperty(this.prototype, 'message', {
      configurable: true,
      enumerable: true
    })
  }
}
