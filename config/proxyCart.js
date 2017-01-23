/**
 * Proxy-Cart Configuration
 *
 * @see {@link http://
 */
module.exports = {
  // The default Shop address (Nexus)
  nexus: {
    name: '',
    host: '',
    address: {
      address_1: '',
      address_2: '',
      address_3: '',
      company: '',
      province: '',
      country: ''
    }
  },
  // The default function for an automatic order payment: manual, authorize, sale
  order_payment_kind: 'authorize',
  // The default function for an automatic order fulfillment: manual, immediate
  order_fulfillment_kind: 'manual',
  // Restock default for refunded order items
  refund_restock: false,
  // Allow certain events
  allow: {
    // Allows a product to be destroyed Recommended false
    destroy_product: false,
    // Allows a product variant to be destroyed Recommended false
    destroy_variant: false
  }
}
