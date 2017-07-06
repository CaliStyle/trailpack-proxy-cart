module.exports = {
  default: (app) => {
    return {
      include: [
        {
          model: app.orm['OrderItem'],
          as: 'order_items'
        }
      ]
    }
  }
}
