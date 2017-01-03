'use strict'

module.exports = {
  CUSTOMER_UPLOAD: {
    first_name: 'First Name',
    last_name: 'Last Name',
    phone: 'Phone',
    billing_address_1: 'Billing Address 1',
    billing_address_2: 'Billing Address 2',
    billing_address_3: 'Billing Address 3',
    billing_company: 'Billing Company',
    billing_city: 'Billing City',
    billing_province: 'Billing Province',
    billing_postal_code: 'Billing Postal Code',
    billing_country_code: 'Billing Country Code',
    shipping_address_1: 'Shipping Address 1',
    shipping_address_2: 'Shipping Address 2',
    shipping_address_3: 'Shipping Address 3',
    shipping_company: 'Shipping Company',
    shipping_city: 'Shipping City',
    shipping_province: 'Shipping Province',
    shipping_postal_code: 'Shipping Postal Code',
    shipping_country_code: 'Shipping Country Code'
  },
  PRODUCT_UPLOAD: {
    handle: 'Handle',
    title: 'Title',
    body: 'Body',
    seo_title: 'SEO Title',
    seo_description: 'SEO Description',
    vendor: 'Vendor',
    type: 'Type',
    tags: 'Tags',
    published: 'Published',
    option_name: 'Option / * Name',
    option_value: 'Option / * Value',
    images: 'Images Sources',
    images_alt: 'Images Alt Text',
    sku: 'Variant SKU',
    weight: 'Variant Weight',
    weight_unit: 'Variant Weight Unit',
    inventory_tracker: 'Variant Inventory Tracker',
    inventory_quantity: 'Variant Inventory Quantity',
    inventory_policy: 'Variant Inventory Policy',
    fulfillment_service: 'Variant Fulfillment Service',
    price: 'Variant Price',
    compare_at_price: 'Variant Compare at Price',
    variant_currency: 'Variant Currency',
    requires_shipping: 'Variant Requires Shipping',
    taxable: 'Variant Taxable',
    barcode: 'Variant Barcode',
    variant_images: 'Variant Images',
    variant_images_alt: 'Variant Images Alt Text',
    tax_code: 'Variant Tax Code',
    gift_card: 'Gift Card',
    metadata: 'Metadata',
    subscription: 'Subscription',
    subscription_unit: 'Subscription Unit',
    subscription_interval: 'Subscription Interval',
    collections: 'Collections',
    g_product_category: 'Google Shopping / Google Product Category',
    g_gender: 'Google Shopping / Gender',
    g_age_group: 'Google Shopping / Age Group',
    g_mpn: 'Google Shopping / MPN',
    g_adwords_grouping: 'Google Shopping / Adwords Grouping',
    g_adwords_label: 'Google Shopping / Adwords Labels',
    g_condition: 'Google Shopping / Condition',
    g_custom_product: 'Google Shopping / Custom Product',
    g_custom_label_0: 'Google Shopping / Custom Label 0',
    g_custom_label_1: 'Google Shopping / Custom Label 1',
    g_custom_label_2: 'Google Shopping / Custom Label 2',
    g_custom_label_3: 'Google Shopping / Custom Label 3',
    g_custom_label_4: 'Google Shopping / Custom Label 4'
  },
  UNITS: {
    // Grams
    G: 'g',
    // Kilograms
    KG: 'kg',
    // Ounces
    OZ: 'oz',
    // Pounds
    LB: 'lb'
  },
  INTERVALS: {
    NONE: 0,
    // Every Day
    DAY: 'd',
    // Every Week
    WEEK: 'w',
    // Every 2 weeks
    BIWEEK: 'ww',
    // Every Month
    MONTH: 'm',
    // Every 2 months
    BIMONTH: 'mm',
    // Every year
    YEAR: 'y',
    // Every 2 years
    BIYEAR: 'yy'
  },
  // deny (default): Customers are not allowed to place orders for a product variant when it's out of stock.
  // continue: Customers are allowed to place orders for a product variant when it's out of stock.
  INVENTORY_POLICY: {
    DENY: 'deny',
    CONTINUE: 'continue'
  },
//   disabled: customers are disabled by default until they are invited. Staff accounts can disable a customer's account at any time.
// invited: the customer has been emailed an invite to create an account that saves their customer settings.
//   enabled: the customer accepted the email invite and created an account.
//   declined: the customer declined the email invite to create an account.
  CUSTOMER_STATE: {
    DISABLED: 'disabled',
    INVITED: 'invited',
    ENABLED: 'enabled',
    DECLINED: 'declined'
  },
  DISCOUNT_TYPES: {
    PERCENTAGE: 'percentage',
    FIXED_AMOUNT: 'fixed_amount',
    SHIPPING: 'shipping'
  },
  DISCOUNT_STATUS: {
    ENABLED: 'enabled',
    DISABLED: 'disabled',
    DEPLETED: 'depleted'
  },
  // customer: The customer changed or cancelled the order.
  // fraud: The order was fraudulent.
  // inventory: Items in the order were not in inventory.
  // other: The order was cancelled for a reason not in the list above.
  ORDER_CANCEL: {
    CUSTOMER: 'customer',
    FRAUD: 'fraud',
    INVENTORY: 'inventory',
    OTHER: 'other'
  },
  // pending: The finances are pending.
  // authorized: The finances have been authorized.
  // partially_paid: The finances have been partially paid.
  // paid: The finances have been paid. (This is the default value.)
  // partially_refunded: The finances have been partially refunded.
  // refunded: The finances have been refunded.
  // voided: The finances have been voided.
  ORDER_FINANCIAL: {
    PENDING: 'pending',
    AUTHORIZED: 'authorized',
    PARTIALLY_PAID: 'partially_paid',
    PAID: 'paid',
    PARTIALLY_REFUNDED: 'partially_refunded',
    REFUNDED: 'refunded',
    VOIDED: 'voided'
  },
  // fulfilled: Every line item in the order has been fulfilled.
  // none: None of the line items in the order have been fulfilled.
  // partial: At least one line item in the order has been fulfilled.
  ORDER_FULFILLMENT: {
    FULFILLED: 'fulfilled',
    NONE: 'none',
    PARTIAL: 'partial'
  },
  FULFILLMENT_STATUS: {
    FULFILLED: 'fulfilled',
    NONE: 'none',
    PARTIAL: 'partial'
  },
  FULFILLMENT_EVENT_STATUS: {
    // The shipping carrier confirms that they have received the shipment request.
    CONFIRMED: 'confirmed',
    // The shipment has been received by the shipping carrier and it is on its way to its destination.
    IN_TRANSIT: 'in_transit',
    // The shipment has been received at the facility which will deliver the mailpiece.
    OUT_FOR_DELIVERY: 'out_for_delivery',
    // The shipment has been scanned at the final delivery address.
    DELIVERED: 'delivered',
    // For whatever reason, the shipping carrier failed to deliver the shipment.
    FAILURE: 'failure'
  },
  TRANSACTION_ERRORS: {
    INCORRECT_NUMBER: 'incorrect_number',
    INVALID_NUMBER: 'invalid_number',
    INVALID_EXPIRY_DATE: 'invalid_expiry_date',
    INVALID_CVC: 'invalid_cvc',
    EXPIRED_CARD: 'expired_card',
    INCORRECT_CVC: 'incorrect_cvc',
    INCORRECT_ZIP: 'incorrect_zip',
    INCORRECT_ADDRESS: 'incorrect_address',
    CARD_DECLINED: 'card_declined',
    PROCESSING_ERROR: 'processing_error',
    CALL_ISSUER: 'call_issuer',
    PICK_UP_CARD: 'pick_up_card'
  },
  TRANSACTION_STATUS: {
    PENDING: 'pending',
    FAILURE: 'failure',
    SUCCESS: 'success',
    ERROR: 'error'
  },
  TRANSACTION_KIND: {
    // Money that the customer has agreed to pay. Authorization period lasts for up to 7 to 30 days (depending on your payment service) while a store awaits for a customer's capture.
    AUTHORIZATION: 'authorization',
    // Transfer of money that was reserved during the authorization of a shop.
    CAPTURE: 'capture',
    // The combination of authorization and capture, performed in one single step.
    SALE: 'sale',
    // The cancellation of a pending authorization or capture.
    VOID: 'void',
    //  The partial or full return of the captured money to the customer.
    REFUND: 'refund'
  },
  COLLECTION_SORT_ORDER: {
    // Alphabetically, in ascending order (A - Z).
    ALPHA_ASC: 'alpha-asc',
    // Alphabetically, in descending order (Z - A).
    ALPHA_DESC: 'alpha-desc',
    // By best-selling products.
    BEST_SELLING: 'best-selling',
    //  By date created, in ascending order (oldest - newest).
    CREATED: 'created',
    // By date created, in descending order (newest - oldest).
    CREATED_DESC: 'created-desc',
    // Order created by the shop owner.
    MANUAL: 'manual',
    // By price, in ascending order (lowest - highest).
    PRICE_ASC: 'price-asc',
    // By price, in descending order (highest - lowest).
    PRICE_DESC: 'price-desc'
  }
}
