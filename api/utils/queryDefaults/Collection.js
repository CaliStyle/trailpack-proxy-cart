module.exports = {
  default: (app) => {
    return {
      include: [
        {
          model: app.orm['Collection'],
          as: 'collections',
          attributes: {
            exclude: ['created_at','updated_at']
          },
          include: [
            {
              model: app.orm['Image'],
              as: 'images',
              attributes: {
                exclude: ['src','created_at','updated_at']
              }
            }
          ]
        },
        {
          model: app.orm['Image'],
          as: 'images',
          attributes: {
            exclude: ['src','created_at','updated_at']
          }
        }
      ]
      // order: [
      //   [
      //     {
      //       model: app.orm['Image'],
      //       through: 'ItemImage',
      //       as: 'images'
      //     },
      //     'position'
      //   ]
      // ]
    }
  },
  findAndCountDefault: (app) => {
    return {
      distinct: true,
      include: [
        {
          model: app.orm['Collection'],
          as: 'collections',
          attributes: {
            exclude: ['created_at','updated_at']
          },
          include: [
            {
              model: app.orm['Image'],
              as: 'images',
              attributes: {
                exclude: ['src','created_at','updated_at']
              }
            }
          ]
        },
        {
          model: app.orm['Image'],
          as: 'images',
          attributes: {
            exclude: ['src','created_at','updated_at']
          }
        }
      ]
      // order: [
      //   [
      //     {
      //       model: app.orm['Image'],
      //       through: 'ItemImage',
      //       as: 'images'
      //     },
      //     'position'
      //   ]
      // ]
    }
  }
}
