/**
 * Trailpack Configuration
 *
 * @see {@link http://trailsjs.io/doc/trailpack/config
 */
module.exports = {
  type: 'misc',
  /**
   * API and config resources provided by this Trailpack.
   */
  provides: {
    api: {
      controllers: ['CartController','CollectionController','CountryController','CouponController','CustomerController','DiscountController','FulfillmentController','OrderController','ProductController','ProxyCartController','ReviewController','ShopController','SubscriptionController','TagController','TransactionController','UserController','VendorController'],
      services: ['AccountService','CartService','CollectionCsvService','CollectionService','CountryService','CouponService','CustomerCsvService','CustomerService','DiscountService','FulfillmentService','GiftCardService','OrderCsvService','OrderService','PaymentService','ProductCsvService','ProductService','ProxyCartService','ReviewService','ShippingService','ShopService','SubscriptionService','TagService','TaxService','TransactionService','VendorCsvService','VendorService'],
      models: ['Account','Address','Cart','City','Collection','Country','County','Coupon','Customer','CustomerAccount','CustomerCart','CustomerOrder','CustomerSource','CustomerUpload','CustomerUser','Discount','Fulfillment','FulfillmentEvent','GiftCard','Image','ItemAddress','ItemCollection','ItemCoupon','ItemDiscount','ItemImage','ItemRefund','ItemShippingZone','ItemTag','Metadata','Order','OrderItem','OrderRisk','OrderSource','OrderUpload','Product','ProductAssociation','ProductAssociationUpload','ProductImage','ProductMetaUpload','ProductReview','ProductUpload','ProductVariant','Province','Refund','Shop','ShopProduct','Source','Subscription','SubscriptionUpload','Tag','Transaction','User','Vendor','VendorProduct','VendorUpload'],
      events: [],
      crons: [],
      tasks: []
    },
    config: [ ]
  },
  /**
   * Configure the lifecycle of this pack; that is, how it boots up, and which
   * order it loads relative to other trailpacks.
   */
  lifecycle: {
    configure: {
      /**
       * List of events that must be fired before the configure lifecycle
       * method is invoked on this Trailpack
       */
      listen: [
        'trailpack:proxy-sequelize:configured',
        'trailpack:proxy-engine:configured',
        'trailpack:proxy-generics:configured',
        'trailpack:proxy-permissions:configured'
      ],

      /**
       * List of events emitted by the configure lifecycle method
       */
      emit: [
        'trailpack:proxy-cart:configured'
      ]
    },
    initialize: {
      listen: [
        'trailpack:proxy-sequelize:initialized',
        'trailpack:proxy-engine:initialized',
        'trailpack:proxy-permissions:initialized',
        'trailpack:proxy-generics:initialized'
      ],
      emit: [
        'trailpack:proxy-cart:initialized'
      ]
    }
  }
}

