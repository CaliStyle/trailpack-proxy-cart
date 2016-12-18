'use strict'

module.exports = {
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
  }
}
