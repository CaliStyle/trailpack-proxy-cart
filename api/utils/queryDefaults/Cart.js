module.exports = {
  default: (app) => {
    return {
      include: [
        {
          model: app.orm['Address'],
          as: 'billing_address'
        },
        {
          model: app.orm['Address'],
          as: 'shipping_address'
        }
      ]
    }
  }
}
