module.exports = {
  default: (app) => {
    return {
      include: [
        {
          model: app.orm['Customer'],
        }
      ]
    }
  }
}
