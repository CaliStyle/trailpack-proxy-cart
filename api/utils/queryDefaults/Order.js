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
          as: 'fulfillments'
        },
        {
          model: app.orm['Refund'],
          as: 'refunds'
        },
        {
          model: app.orm['Event'],
          as: 'events'
        }
      ]
    }
  }
}
