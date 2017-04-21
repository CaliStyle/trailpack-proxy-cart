module.exports = {
  default: (app) => {
    return {
      include: [
        {
          model: app.orm['Customer'],
          // as: 'customer'
        },
        {
          model: app.orm['Event'],
          as: 'events'
        }
      ]
    }
  }
}
