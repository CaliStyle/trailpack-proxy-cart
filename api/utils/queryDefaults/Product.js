module.exports = {
  default: (app) => {
    return {
      include: [
        {
          model: app.orm['ProductImage'],
          as: 'images',
          // attributes: {
          //   exclude: ['src', 'updated_at', 'created_at']
          // },
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
        // {
        //   model: app.orm['Product'],
        //   through: app.orm['ProductAssociation'],
        //   as: 'associations'
        // },
        {
          model: app.orm['Metadata'],
          as: 'metadata',
          attributes: ['data', 'id']
        },
        {
          model: app.orm['Vendor'],
          as: 'vendors',
          attributes: ['id','name']
        },
        {
          model: app.orm['Collection'],
          as: 'collections',
          attributes: [
            'id',
            'title',
            'handle',
            'tax_type',
            'tax_rate',
            'tax_name',
            'tax_type',
            'discount_scope',
            'discount_type',
            'discount_rate',
            'discount_percentage'
          ]
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
