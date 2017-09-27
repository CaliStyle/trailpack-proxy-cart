module.exports = {
  default: (app) => {
    return {
      include: [
        // {
        //   model: app.orm['Customer'],
        //   // as: 'customer'
        // },
        {
          model: app.orm['OrderItem'],
          as: 'order_items'
        },
        {
          model: app.orm['Transaction'],
          as: 'transactions'
        },
        {
          model: app.orm['Fulfillment'],
          as: 'fulfillments',
          include: [
            {
              model: app.orm['OrderItem'],
              as: 'order_items',
              attributes: ['id','quantity','fulfillment_status','fulfillment_service']
            }
          ]
        },
        {
          model: app.orm['Refund'],
          as: 'refunds'
        },
        // {
        //   model: app.orm['Event'],
        //   as: 'events'
        // },
        {
          model: app.orm['Tag'],
          as: 'tags'
        }
      ],
      order: [
        [
          {
            model: app.orm['OrderItem'],
            as: 'order_items'
          },
          'calculated_price'
        ],
        [
          {
            model: app.orm['Transaction'],
            as: 'transactions'
          },
          'amount', 'DESC'
        ],
        // [
        //   {
        //     model: app.orm['Event'],
        //     as: 'events'
        //   },
        //   'created_at', 'DESC'
        // ]
      ]
    }
  },
  customer: (app) => {
    return {
      include: [
        {
          model: app.orm['Customer']
        }
      ]
    }
  },
  events: (app) => {
    return {
      include: [
        {
          model: app.orm['Event'],
          as: 'events'
        }
      ],
      order: [
        {
          model: app.orm['Event'],
          as: 'events'
        },
        'created_at', 'DESC'
      ]
    }
  },
  fulfillments: (app) => {
    return {
      include: [
        {
          model: app.orm['Fulfillment'],
          as: 'fulfillments',
          include: [
            {
              model: app.orm['OrderItem'],
              as: 'order_items',
              attributes: ['id','quantity','fulfillment_status','fulfillment_service']
            }
          ]
        }
      ]
    }
  },
  order_items: (app) => {
    return {
      include: [
        {
          model: app.orm['OrderItem'],
          as: 'order_items'
        }
      ],
      order: [
        {
          model: app.orm['OrderItem'],
          as: 'order_items'
        },
        'calculated_price'
      ]
    }
  },
  refunds: (app) => {
    return {
      include: [
        {
          model: app.orm['Refund'],
          as: 'refunds'
        }
      ]
    }
  },
  subscription: (app) => {
    return {
      include: [
        {
          model: app.orm['Subscription']
        }
      ]
    }
  },
  tags: (app) => {
    return {
      include: [
        {
          model: app.orm['Tag'],
          as: 'tags'
        }
      ]
    }
  },
  transactions: (app) => {
    return {
      include: [
        {
          model: app.orm['Transaction'],
          as: 'transactions'
        }
      ],
      order: [
        {
          model: app.orm['Transaction'],
          as: 'transactions'
        },
        'amount', 'DESC'
      ]
    }
  }
}
