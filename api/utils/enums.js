'use strict'

module.exports = {
  COLLECTION_UPLOAD: {
    title: 'Title',
    handle: 'Handle',
    body: 'Body',
    primary_purpose: 'Primary Purpose',
    published: 'Published',
    sort_order: 'Sort Order',
    tax_rate: 'Tax Rate',
    tax_percentage: 'Tax Percentage',
    tax_type: 'Tax Type',
    tax_name: 'Tax Name',
    discount_scope: 'Discount Scope',
    discount_type: 'Discount Type',
    discount_rate: 'Discount Rate',
    discount_percentage: 'Discount Percentage',
    discount_product_include: 'Discount Product Include',
    discount_product_exclude: 'Discount Product Exclude'
  },
  CUSTOMER_UPLOAD: {
    account_balance: 'Account Balance',
    first_name: 'First Name',
    last_name: 'Last Name',
    company: 'Company',
    phone: 'Phone',
    billing_address_1: 'Billing Address 1',
    billing_address_2: 'Billing Address 2',
    billing_address_3: 'Billing Address 3',
    billing_company: 'Billing Company',
    billing_city: 'Billing City',
    billing_province: 'Billing Province',
    billing_postal_code: 'Billing Postal Code',
    billing_country: 'Billing Country',
    shipping_address_1: 'Shipping Address 1',
    shipping_address_2: 'Shipping Address 2',
    shipping_address_3: 'Shipping Address 3',
    shipping_company: 'Shipping Company',
    shipping_city: 'Shipping City',
    shipping_province: 'Shipping Province',
    shipping_postal_code: 'Shipping Postal Code',
    shipping_country: 'Shipping Country',
    tags: 'Tags',
    collections: 'Collections'
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
    collections: 'Collections',
    associations: 'Associations',
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
    max_quantity: 'Variant Max Quantity',
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
    requires_subscription: 'Subscription',
    subscription_unit: 'Subscription Unit',
    subscription_interval: 'Subscription Interval',
    shops: 'Shops',
    shops_quantity: 'Shops Quantity',
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
  PRODUCT_META_UPLOAD: {
    handle: 'Handle',
    id: 'ID',
    product_id: 'Product ID'
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
    NONE: null,
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
  INVENTORY_POLICY: {
    // deny (default): Customers are not allowed to place orders for a product variant when it's out of stock.
    DENY: 'deny',
    // continue: Customers are allowed to place orders for a product variant when it's out of stock.
    CONTINUE: 'continue'
  },
  CUSTOMER_STATE: {
    // disabled: customers are disabled by default until they are invited. Staff accounts can disable a customer's account at any time.
    DISABLED: 'disabled',
    // invited: the customer has been emailed an invite to create an account that saves their customer settings.
    INVITED: 'invited',
    // enabled: the customer accepted the email invite and created an account.
    ENABLED: 'enabled',
    //   declined: the customer declined the email invite to create an account.
    DECLINED: 'declined'
  },
  CART_STATUS: {
    // open: Cart is open for transactions
    OPEN: 'open',
    // closed: Cart was closed by
    CLOSED: 'closed',
    // abandoned: Cart was abandoned
    ABANDONED: 'abandoned',
    // ordered: Cart resulted in an Order
    ORDERED: 'ordered'
  },
  DISCOUNT_TYPES: {
    // A percentage of the price was discounted
    PERCENTAGE: 'percentage',
    // A fixed amount of the price was discounted
    FIXED_AMOUNT: 'fixed_amount',
    // Shipping was discounted
    SHIPPING: 'shipping'
  },
  DISCOUNT_STATUS: {
    // Discount is ready for use
    ENABLED: 'enabled',
    // Discount is disabled
    DISABLED: 'disabled',
    // Discount has met total allowed uses and is now depleted
    DEPLETED: 'depleted'
  },
  ORDER_CANCEL: {
    // customer: The customer changed or cancelled the order.
    CUSTOMER: 'customer',
    // fraud: The order was fraudulent.
    FRAUD: 'fraud',
    // inventory: Items in the order were not in inventory.
    INVENTORY: 'inventory',
    // other: The order was cancelled for a reason not in the list above.
    OTHER: 'other'
  },
  SUBSCRIPTION_CANCEL: {
    // customer: The customer changed or cancelled the order.
    CUSTOMER: 'customer',
    // fraud: The subscription was fraudulent.
    FRAUD: 'fraud',
    // inventory: Items in the subscription were not in inventory.
    INVENTORY: 'inventory',
    // other: The order was cancelled for a reason not in the list above.
    OTHER: 'other'
  },
  ORDER_FINANCIAL: {
    // pending: The finances are pending.
    PENDING: 'pending',
    // authorized: The finances have been authorized.
    AUTHORIZED: 'authorized',
    // partially_paid: The finances have been partially paid.
    PARTIALLY_PAID: 'partially_paid',
    // paid: The finances have been paid. (This is the default value.)
    PAID: 'paid',
    // partially_refunded: The finances have been partially refunded.
    PARTIALLY_REFUNDED: 'partially_refunded',
    // refunded: The finances have been refunded.
    REFUNDED: 'refunded',
    // voided: The finances have been voided.
    VOIDED: 'voided'
  },
  ORDER_FULFILLMENT: {
    // Fulfillment is complete, Every line item in the order has been fulfilled.
    FULFILLED: 'fulfilled',
    // Fulfillment has been sent to provider
    SENT: 'sent',
    // Nothing has happened yet, None of the line items in the order have been fulfilled.
    NONE: 'none',
    // Fulfillment has partially fulfilled order, At least one line item in the order has been fulfilled.
    PARTIAL: 'partial'
  },
  ORDER_FULFILLMENT_KIND: {
    // Schedule to fulfill order immediately upon creating order
    IMMEDIATE: 'immediate',
    // Schedule to fulfill at a later time
    MANUAL: 'manual'
  },
  FULFILLMENT_SERVICE: {
    // Fulfillment is manually taken care of
    MANUAL: 'manual'
  },
  FULFILLMENT_STATUS: {
    // Fulfillment is complete
    FULFILLED: 'fulfilled',
    // Fulfillment has been sent to provider
    SENT: 'sent',
    // Nothing has happened yet
    NONE: 'none',
    // Fulfillment has partially fulfilled order
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
  PAYMENT_PROCESSING_METHOD: {
    // Payment processed at digital checkout
    CHECKOUT: 'checkout',
    // Payment processed at digital subscription
    SUBSCRIPTION: 'subscription',
    // Payment processed default
    DIRECT: 'direct',
    // Payment processed by means other than digital
    MANUAL: 'manual',
    // Payment processed by 3rd party in network
    OFFSITE: 'offsite',
    //
    EXPRESS: 'express'
  },
  TRANSACTION_ERRORS: {
    // Incorrect credit card number
    INCORRECT_NUMBER: 'incorrect_number',
    // Invalid credit card number
    INVALID_NUMBER: 'invalid_number',
    // Invalid Expiration date
    INVALID_EXPIRY_DATE: 'invalid_expiry_date',
    // Invalid Security code
    INVALID_CVC: 'invalid_cvc',
    // Card is expired
    EXPIRED_CARD: 'expired_card',
    // Incorrect security code
    INCORRECT_CVC: 'incorrect_cvc',
    // Incorrect zip code
    INCORRECT_ZIP: 'incorrect_zip',
    // Incorrect Address
    INCORRECT_ADDRESS: 'incorrect_address',
    // Card declined by processor
    CARD_DECLINED: 'card_declined',
    // Processor had an error
    PROCESSING_ERROR: 'processing_error',
    // Call card issuer
    CALL_ISSUER: 'call_issuer',
    // Inform representative to confiscate card
    PICK_UP_CARD: 'pick_up_card'
  },
  TRANSACTION_STATUS: {
    // Transaction is pending
    PENDING: 'pending',
    // Transaction failed
    FAILURE: 'failure',
    // Transaction succeeded
    SUCCESS: 'success',
    // Transaction resulted in error
    ERROR: 'error'
  },
  TRANSACTION_KIND: {
    // Money that the customer has agreed to pay. Authorization period lasts for up to 7 to 30 days (depending on your payment service) while a store awaits for a customer's capture.
    AUTHORIZE: 'authorize',
    // Transfer of money that was reserved during the authorization of a shop.
    CAPTURE: 'capture',
    // The combination of authorization and capture, performed in one single step.
    SALE: 'sale',
    // The cancellation of a pending authorization or capture.
    VOID: 'void',
    //  The partial or full return of the captured money to the customer.
    REFUND: 'refund'
  },
  COLLECTION_PURPOSE: {
    // The collection is used for navigation
    NAVIGATION: 'navigation',
    // The collection is used to group objects
    GROUP: 'group',
    // The collection applies a discount to products/customers
    DISCOUNT: 'discount',
    // The collection applies shipping to products/customers
    SHIPPING: 'shipping',
    // The collection applies taxes to products/customers
    TAXES: 'taxes'
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
  },
  COLLECTION_DISCOUNT_SCOPE: {
    INDIVIDUAL: 'individual',
    GLOBAL: 'global'
  },
  COLLECTION_DISCOUNT_TYPE: {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed',
  },
  COLLECTION_TAX_TYPE: {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed',
  }
}
