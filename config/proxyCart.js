/**
 * Proxy-Cart Configuration
 *
 * @see {@link http://
 */
module.exports = {
  // The default function for an automatic order payment: manual, authorize, sale
  order_payment: 'authorize',
  allow: {
    // Allows a product to be destroyed Recommended false
    destroy_product: false,
    // Allows a product variant to be destroyed Recommended false
    destroy_variant: false
  },
  subscribers: []
}
