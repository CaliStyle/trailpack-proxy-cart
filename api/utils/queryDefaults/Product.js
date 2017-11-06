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
          order: [['position', 'ASC']]
        },
        {
          model: app.orm['Tag'],
          as: 'tags',
          attributes: ['name', 'id'],
          order: [['name', 'ASC']]
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
              order: [['position', 'ASC']],
              attributes: {
                exclude: ['src','updated_at','created_at']
              }
            }
          ]
        },
        // {
        //   model: app.orm['Product'],
        //   as: 'associations',
        //   // duplicating: false
        // },
        {
          model: app.orm['Metadata'],
          as: 'metadata',
          attributes: ['data', 'id']
        },
        {
          model: app.orm['Vendor'],
          as: 'vendors',
          attributes: ['id','handle','name']
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
            // 'discount_scope',
            // 'discount_type',
            // 'discount_rate',
            // 'discount_percentage'
          ]
        }
      ],
      order: [
        [
          {
            model: app.orm['ProductVariant'],
            as: 'variants'
          },
          'position','ASC'
        ],
        [
          {
            model: app.orm['ProductImage'],
            as: 'images'
          },
          'position','ASC'
        ]
      ]
    }
  },
  findAllDefault: (app) => {
    return {
      distinct: true,
      include: [
        {
          model: app.orm['ProductImage'],
          as: 'images',
        },
        {
          model: app.orm['Tag'],
          as: 'tags',
          attributes: ['name', 'id']
        },
        // {
        //   model: app.orm['Product'],
        //   as: 'associations',
        //   duplicating: false
        // },
        {
          model: app.orm['Collection'],
          as: 'collections',
          // duplicating: false,
          // require: true,
          attributes: [
            'id',
            'title',
            'handle',
            'tax_type',
            'tax_rate',
            'tax_name',
            // 'discount_scope',
            // 'discount_type',
            // 'discount_rate',
            // 'discount_percentage'
          ]
        },
        {
          model: app.orm['Vendor'],
          as: 'vendors',
          // duplicating: false,
          // require: true,
          attributes: [
            'id',
            'handle',
            'name'
          ]
        }
      ],
      order: [
        [
          {
            model: app.orm['ProductImage'],
            as: 'images'
          },
          'position', 'ASC'
        ]
      ]
    }
  },
  collections: (app) => {
    return {
      include: [
        {
          model: app.orm['Collection'],
          as: 'collections',
          // duplicating: false,
          // require: true,
          attributes: [
            'id',
            'title',
            'handle',
            'tax_type',
            'tax_rate',
            'tax_name',
            // 'discount_scope',
            // 'discount_type',
            // 'discount_rate',
            // 'discount_percentage'
          ]
        }
      ]
    }
  },
  images: (app) => {
    return {
      include: [
        {
          model: app.orm['ProductImage'],
          as: 'images'
        }
      ],
      order: [
        [
          {
            model: app.orm['ProductImage'],
            as: 'images'
          },
          'position', 'ASC'
        ]
      ]
    }
  },
  tags: (app) => {
    return {
      include: [
        {
          model: app.orm['Tag'],
          as: 'tags',
          attributes: ['name', 'id']
        }
      ],
      order: [
        [
          {
            model: app.orm['Tag'],
            as: 'tags'
          },
          'name', 'ASC'
        ]
      ]
    }
  },
  variants: (app) => {
    return {
      include: [
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
              order: [['position', 'ASC']],
              attributes: {
                exclude: ['src','updated_at','created_at']
              }
            }
          ]
        }
      ]
    }
  }
}
