module.exports = {
  default: (app) => {
    return {
      include: [
        {
          model: app.orm['Collection'],
          as: 'collections'
        }
      ]
    }
  }
}
