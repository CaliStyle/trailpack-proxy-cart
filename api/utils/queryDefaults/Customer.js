module.exports = {
  default: (app) => {
    return {
      // include: [{ all: true }]
      attributes: {
        exclude: [
          'shipping_address_id',
          'billing_address_id',
          'default_address_id'
        ]
      },
      // [
      //   'Customer.*',
      //   // 'billing_address.*',
      //   // 'shipping_address.*',
      //   // 'metadata.*',
      //   // 'tags.*',
      //   // 'default_cart.*'
      //   // [app.orm['Order'].sequelize.fn('COUNT', app.orm['Order'].sequelize.col('orders.id')), 'orders_count']
      // ],
      // {
      //   // include: [
      //   //   'billing_address.*',
      //   //   'shipping_address.*',
      //   //   'metadata.*',
      //   //   'tags.*',
      //   //   'default_cart.*'
      //   //   // [app.orm['Order'].sequelize.fn('COUNT', app.orm['Order'].sequelize.col('orders.id')), 'orders_count']
      //   // ],
      //   exclude: [
      //     'shipping_address_id',
      //     'billing_address_id',
      //     'default_address_id'
      //   ]
      // },
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
        //   model: app.orm['CustomerAddress'],
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
      ]
    }
  }
}
