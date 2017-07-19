module.exports = {
  default: (app) => {
    return {
      include: [
        {
          model: app.orm['Address'],
          as: 'default_address'
        },
        {
          model: app.orm['Address'],
          as: 'shipping_address'
        },
        {
          model: app.orm['Address'],
          as: 'billing_address'
        },
        // {
        //   model: app.orm['Address'],
        //   as: 'addresses'
        // },
        {
          model: app.orm['Tag'],
          as: 'tags',
          attributes: ['name', 'id']
        },
        {
          model: app.orm['Metadata'],
          as: 'metadata',
          attributes: ['data', 'id']
        },
        {
          model: app.orm['Cart'],
          as: 'default_cart'
        },
        {
          model: app.orm['Collection'],
          as: 'collections'
        },
        {
          model: app.orm['Account'],
          as: 'accounts'
        },
        {
          model: app.orm['Event'],
          as: 'events'
        }
        // ,
        // {
        //   model: app.orm['Order'],
        //   as: 'orders',
        //   attributes: [[app.orm['Order'].sequelize.fn('COUNT', app.orm['Order'].sequelize.col('orders.id')), 'orders_count']]
        // }
        // ,
        // {
        //   model: app.orm['Cart'],
        //   as: 'carts'
        // }
      ],
      order: [
        [
          {
            model: app.orm['Event'],
            as: 'events'
          },
          'created_at', 'ASC'
        ]
      ]
    }
  }
}
