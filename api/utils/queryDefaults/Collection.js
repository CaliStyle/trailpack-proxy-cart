module.exports = {
  default: (app) => {
    return {
      include: [
        {
          model: app.orm['Collection'],
          as: 'collections'
        },
        {
          model: app.orm['Image'],
          as: 'images'
        }
      ]
    }
  }
}
