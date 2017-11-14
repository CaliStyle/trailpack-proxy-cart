module.exports = {
  default: (app) => {
    return {
      include: [
        {
          model: app.orm['OrderItem'],
          as: 'order_items',
          attributes: [
            'id',
            'quantity',
            'requires_shipping',
            'fulfillment_status',
            'fulfillment_service'
          ]
        }
      ]
    }
  }
}
