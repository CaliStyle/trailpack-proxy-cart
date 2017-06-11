module.exports = {
  default: (app) => {
    return {
      include: [
        {
          model: app.orm['Collection'],
          as: 'collections',
          attributes: {
            exclude: ['created_at','updated_at']
          }
        },
        {
          model: app.orm['Image'],
          as: 'images',
          attributes: {
            exclude: ['src','created_at','updated_at']
          }
        }
      ]
    }
  }
}
