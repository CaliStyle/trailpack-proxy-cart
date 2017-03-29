module.exports = {
  default: (app) => {
    return {
      include: [
        {
          model: app.orm['ProductImage'],
          as: 'images',
          order: ['position', 'ASC']
        },
        {
          model: app.orm['Tag'],
          as: 'tags',
          attributes: ['name', 'id'],
          order: ['name', 'ASC']
        },
        {
          model: app.orm['ProductVariant'],
          as: 'variants',
          attributes: {
            exclude: ['updated_at','created_at']
          },
          include: [
            {
              model: app.orm['Metadata'],
              as: 'metadata',
              attributes: ['data', 'id']
            },
            {
              model: app.orm['ProductImage'],
              as: 'images',
              attributes: {
                exclude: ['src','updated_at','created_at']
              }
            }
          ]
        },
        {
          model: app.orm['Metadata'],
          as: 'metadata',
          attributes: ['data', 'id']
        },
        {
          model: app.orm['Collection'],
          as: 'collections',
          attributes: ['id', 'title', 'handle']
        }
        // app.orm['ProductVariant'].associations.variants
      ],
      order: [
        [
          {
            model: app.orm['ProductVariant'],
            as: 'variants'
          },
          'position'
        ],
        [
          {
            model: app.orm['ProductImage'],
            as: 'images'
          },
          'position'
        ]
      ]
    }
  }
}
