'use strict'
module.exports = {
  ouncesToGrams: (ounces) => {
    return ounces * 28.3495231
  },
  poundsToGrams: (pounds) => {
    return pounds * 16 * 28.3495231
  },
  kilogramsToGrams: (kilogram) => {
    return kilogram / 1000
  }
}
