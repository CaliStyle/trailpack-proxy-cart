# trailpack-proxy-cart

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]

## Node.js eCommerce built for speed, scalability, flexibility, and love from [Cali Style](https://cali-style.com)
Proxy Cart is the eCommerce component for [Proxy Engine](https://github.com/calistyle/trailpack-proxy-engine). Connect your own [Merchant Processor, Shipping Provider, Fulfillment Service, Tax Provider](https://github.com/calistyle/trailpack-proxy-generics), and import your products. Attach it to Proxy Engine and start building with [Proxy CMS](https://github.com/calistyle/trailpack-proxy-cms)!

## Dependencies
### Proxy Engine
| Repo          |  Build Status (edge)                  |
|---------------|---------------------------------------|
| [trailpack-proxy-engine](https://github.com/calistyle/trailpack-proxy-engine) | [![Build status][ci-proxyengine-image]][ci-proxyengine-url] |

### Proxy Permissions
| Repo          |  Build Status (edge)                  |
|---------------|---------------------------------------|
| [trailpack-proxy-permissions](https://github.com/calistyle/trailpack-proxy-permissions) | [![Build status][ci-proxypermissions-image]][ci-proxypermissions-url] |

### Proxy Passport
| Repo          |  Build Status (edge)                  |
|---------------|---------------------------------------|
| [trailpack-proxy-passport](https://github.com/calistyle/trailpack-proxy-passport) | [![Build status][ci-proxypassport-image]][ci-proxypassport-url] |

### Supported ORMs
| Repo          |  Build Status (edge)                  |
|---------------|---------------------------------------|
| [trailpack-sequelize](https://github.com/trailsjs/trailpack-sequelize) | [![Build status][ci-sequelize-image]][ci-sequelize-url] |

### Supported Webserver
| Repo          |  Build Status (edge)                  |
|---------------|---------------------------------------|
| [trailpack-express](https://github.com/trailsjs/trailpack-express) | [![Build status][ci-express-image]][ci-express-url] |

## Install

```sh
$ npm install --save trailpack-proxy-cart
```

## Configure

```js
// config/main.js
module.exports = {
  packs: [
    // ... other trailpacks
    require('trailpack-proxy-cart'),
    require('trailpack-proxy-cart-countries')
  ]
}
// config/web.js
module.exports = {
  /**
   * Middlewares to load (in order)
   * Add the Proxy Cart middleware after the passport middleware
   */
  middlewares: {

    //middlewares loading order
    order: [
      '...',
      'session',
      'passportInit',
      'passportSession',
      'proxyCartInit',
      'proxyCartSession',
      'proxyCartSessionCart',
      'proxyCartSessionCustomer',
      '...'
    ],
  }
}

// config/proxyCart.js
module.exports = {
  // The default Shop address (Nexus)
  nexus: {
    name: '<name>',
    host: '<host>',
    email: '<email>',
    address: {
      address_1: '<address 1>',
      address_2: '',
      address_3: '',
      company: '<company>',
      city: '<city>',
      province: '<full name of state/province>',
      country: '<full name of country>',
      postal_code: '<postal code>'
    }
  },
  // The default function for an automatic order payment: manual, authorize, sale
  order_payment_kind: 'sale',
  // The default function for an automatic order fulfillment: manual, immediate
  order_fulfillment_kind: 'immediate',
  // Restock default for refunded order items
  refund_restock: false,
  // Allow certain events
  allow: {
    // Allows a product to be destroyed, Recommended false
    destroy_product: false,
    // Allows a product variant to be destroyed, Recommended false
    destroy_variant: false
  }
}

```

## Shops
A shop represents a physical location that sells a product. When taxes and shipping are calculated per product, they are calculated by the nearest shop to the destination of an order. This means that the same product can be sold in multiple stores and shipped from different locations which may effect shipping and tax rates.

## Products
A Product is a Physical or Digital item.

## Product Variants
A Product Variant is a variation of a product denoted by a unique Stock Keeping Unit (SKU)

## Product Association
A Product Association is a product that is associated to another product beyond the levels of a collection or tag.

## Product Images
A Product Image is an image that is associated directly with a product and sometimes a product variant.

## Product Reviews
A Product Review is input from a customer with a history of purchasing a product.

## Metadata
A Metadata is additional information about a product, customer, or review that is not constrained by the parent model.

## Collections
A Collection is a grouping of like items, such as products, customers, and shipping zones and can apply collection discounts, shipping overrides, and tax overrides.

## Tags
A Tag is a searching marker for a customer or product.

## Customers
A Customer is a user or guest.

## Accounts
An Account is a 3rd party that the customer belongs to such as Stripe or Authorize.net

## Sources
A Source is a payment method used by the customer at checkout that belongs to a customer and an account.

## Carts
A Cart is a bucket that holds products and data until an order is placed.

## Orders
An Order is a bucket that holds products and data and the transactions of purchases and fulfillment.

## Fulfillment
A Fulfillment is a shipping transaction for an order.

## Fulfillment Event
A Fulfillment Event is the progress of a Fulfillment.

## Transactions
A Transaction is a representation of a purchasing event.

## Gift Cards
A Gift Card is an alternate payment method that acts as a customer source.

## Discounts
A Discount is a value or percent off of a product, shipping cost, or total order applied by meeting criteria.

## Coupon
A redeemable discount that has a code.

## Subscriptions
A Subscription is the reoccurring of an order based on time period.

## Shipping Zones
A Shipping Zone is a geographical area that may override shipping and tax costs.

## Shipping Restrictions
A Shipping Restriction is a geographical restriction on the shipping of certain products.

## Vendors
Vendors are companies that distribute a product. In the case of drop shipping, the taxes and shipping are calculated from the vendor address to the customer.

## Events
Proxy Cart publishes many subscribable events.

### Customer Events
Events published during customer actions.

#### customer.checkout

#### customer.updated

#### customer.account.created

#### customer.account.updated

#### customer.account_balance.updated

#### customer.source.created

#### customer.source.updated

#### customer.source.removed

#### customer.subscription.subscribed

#### customer.subscription.updated

#### customer.subscription.cancelled

#### customer.subscription.activated

#### customer.subscription.deactivated

#### customer.subscription.items_added

#### customer.subscription.items_removed

#### customer.subscription.renewed

### Order Events
Order events published during order operations.
#### order.transaction.sale.*

#### order.transaction.authorize.*

#### order.transaction.capture.*

#### order.transaction.void.*

#### order.transaction.refund.*

#### order.fulfillment.create.*

## Crons

## Generics
All of Proxy Carts generics can be overridden by 3rd party generic services. 
### DefaultFulfillmentProvider

### DefaultGeoLocationProvider

### DefaultImageProvider

### DefaultShippingProvider

### DefaultTaxProvider

## Policies

## Tasks

## Usage

### Controllers
#### CustomerController
Handles Customer operations

##### CustomerController.create
Creates a Customer
```
//POST <api>/customer
```

##### CustomerController.update
Updates a Customer
```
//POST <api>/customer/:id
```

##### CustomerController.findOne
Find a Customer by id
```
//GET <api>/customer/:id
```

##### CustomerController.session
Get the current customer in session
```
//GET <api>/customer/session
```

##### CustomerController.search
```
//GET <api>/customer/search
```


##### CustomerController.uploadCSV
Upload a Customer CSV
```
//POST <api>/customer/uploadCSV
```

##### CustomerController.processUpload
Process Uploaded Customer CSV
```
//POST <api>/customer/processUpload
```

##### CustomerController.exportCustomers
Exports customers as a CSV

#### CartController
Handles Cart operations

##### CartController.create
Creates a new cart and can add items at the start. Some interesting features:

- Specify a `product_id`, `variant_id`, or `product_variant_id` which is an alias of 'variant_id' 
- Specify a quantity 
- Specify properties, useful for custom specifics to an order
- Checks if the product inventory is available according to inventory policy
- Checks for geographic restrictions
- Checks for Product and Customer Discounts
- Checks and validates Coupons

```
//POST <api>/cart
{
  line_items: [
    {
      variant_id: 1,
      properties: [
        { custom_engraving: 'Hello World' }
      ]
    },
    {
      product_variant_id: 1
    },
    {
      product_id: 1,
      quantity: 2
    }
  ]
}
```
Returns a Cart Object

##### CartController.checkout
From cart to checkout is easy and there are some special features to note:
- You can supply multiple payment methods
- You can override the the shipping and billing address
- You can process payments immediately
- You can send to fulfillment immediately

`payment_kind`: the type of transactions to create, 'authorize', 'capture', 'sale', or 'manual'

`payment_details`: an array of payment information, requires a 'gateway' attribute and normally a 'token' or a 'source'

`fulfillment_kind`: the type of fulfillment to perform, 'immediate', null or blank

`billing_address`: an address object or you can leave null if cart has a customer with address 

`shipping_address`: an address object or you can leave null if cart has a customer with address

`shop_id`: an id, provide a shop ID if you want to require calculations be based on a shop location

```
//POST <api>/cart/:id/checkout
{
  payment_kind: 'sale',
  payment_details: [
    {
      gateway: 'payment_processor',
      token: '123'
    }
  ],
  fulfillment_kind: 'immediate'
}
```
Returns an Order

##### CartController.addItems
Add Items to an open cart. Some interesting things to note:

- You can add an existing item to a cart and it will increase the quantity
- Checks if the product inventory is available according to inventory policy
- Checks for geographic restrictions
- Checks for Product and Customer Discounts
- Checks and validates Coupons

```
//POST <api>/cart/:id/addItems
{
  line_items: [
    {
      variant_id: 1,
      properties: [
        { custom_engraving: 'Hello World' }
      ]
    },
    {
      product_variant_id: 1
    },
    {
      product_id: 1,
      quantity: 2
    }
  ]
}
```

##### CartController.removeItems
Remove Items from an open cart. Some interesting things to note:

- If you specify just an id form, it will only reduce the quantity in the cart by 1.
- If you specify a quantity, it will reduce the quantity in the cart by that number

```
//POST <api>/cart/:id/removeItems
{
  line_items: [
    {
      variant_id: 1,
    },
    {
      product_variant_id: 1
    },
    {
      product_id: 1,
      quantity: 2
    }
  ]
}
```
Returns updated Cart

##### CartController.clear
Removes all items from an open cart
```
//POST <api>/cart/:id/clear
```
Returns updated Cart

#### CollectionController
Handles Transaction operations

#### FulfillmentController
Handles Fulfillment operations

#### ProductController
Handles Product operations

##### ProductController.findOne
Find a Product by `id`

##### ProductController.addProduct
Adds a new product
```
//POST <api>/product/add
```

##### ProductController.addProducts
Adds new products
```
//POST <api>/product/addProducts
```

##### ProductController.updateProduct
Updates a product
```
//POST <api>/product/:id/update
```

##### ProductController.updateProducts
Updates multiple products
```
//POST <api>/product/updateProducts
```

##### ProductController.removeProduct
Removes a product (does not delete unless configured too)
```
//POST <api>/product/:id/remove
```

##### ProductController.removeProducts
Removes multiple products (does not delete unless configured too)
```
//POST <api>/product/removeProducts
```

##### ProductController.removeVariant
Removes a product variant (does not delete unless configured too)
```
//POST <api>/product/variant/:variant/remove
```

##### ProductController.removeVariants
Removes multiple product variants (does not delete unless configured too)

##### ProductController.removeImage
Removes a product image
```
//POST <api>/product/image/:image/remove
```

##### ProductController.removeImages
Removes multiple images

##### ProductController.uploadCSV
Uploads a Product CSV
```
//POST <api>/product/uploadCSV
name: csv
```

##### ProductController.processUpload
Processes Uploaded CSV
```
//POST <api>product/processUpload/:uploadID
```

##### ProductController.uploadMetaCSV
Uploads a Metadata CSV
```
//POST <api>product/uploadMetaCSV
name csv
```

##### ProductController.processMetaUpload
Processes Uploaded Metadata CSV
```
//POST <api>product/processMetaUpload/:uploadMetaID
```

##### ProductController.exportProducts
Exports products as a CSV
```
//POST <api>product/exportProducts
```

#### OrderController
Handles Order operations

##### OrderController.exportOrders
Exports orders as a CSV
```
//POST <api>/order/exportOrders
```

#### ProxyCartController
Handles ProxyCart operations

#### ReviewController
Handles Review operations

#### ShopController
Handles Shop operations

##### ShopController.create
Creates a new Shop
```
//POST <api>/shop
```

##### ShopController.update
Updates a Shop
```
//POST <api>/shop/:id
```

#### SubscriptionController
Handles Subscription operations

#### TagController
Handles Tag operations

#### TransactionController
Handles Transaction operations

#### UserController
Handles User operations

### Services
Proxy Cart creates many services to handle operations

#### AccountService
#### CartService
#### CollectionService
#### CollectionCsvService
#### CouponService
#### CustomerService
#### CustomerCsvService
#### DiscountService
#### FulfillmentService
#### GiftCardService
#### OrderService
#### PaymentService
#### ProductService
#### ProductCsvService
#### ProductCsvService
#### ProxyCartService
#### ReviewService
#### ShippingService
#### ShopService
#### SubscriptionService
#### SubscriptionCsvService
#### TagService
#### TaxService
#### TransactionService
#### VendorService

### Models
Proxy Cart creates many models and extends models from Proxy Engine and Proxy Permissions

#### Account
#### Address
#### Cart
#### City
#### Collection
#### CollectionUpload
#### Country
#### County
#### Coupon
#### Customer
#### CustomerAccount
#### CustomerCart
#### CustomerOrder
#### CustomerSource
#### CustomerUpload
#### CustomerUser
#### Discount
#### Fulfillment
#### FulfillmentEvent
#### GiftCard
#### ItemAddress
#### ItemCollection
#### ItemDiscount
#### ItemMetadata
#### ItemRefund
#### ItemTag
#### Metadata
#### Order
#### OrderItem
#### OrderRisk
#### Product
#### ProductAssociation
#### ProductImage
#### ProductReview
#### ProductVariant
#### ProductUpload
#### ProductMetaUpload
#### Province
#### Refund
#### ShippingRestriction
#### ShippingZone
#### Shop
#### Source
#### Subscription
#### SubscriptionUpload
#### Tag
#### Transaction
#### User
#### Vendor
#### VendorProduct

[npm-image]: https://img.shields.io/npm/v/trailpack-proxy-cart.svg?style=flat-square
[npm-url]: https://npmjs.org/package/trailpack-proxy-cart
[ci-image]: https://img.shields.io/circleci/project/github/CaliStyle/trailpack-proxy-cart/master.svg
[ci-url]: https://circleci.com/gh/CaliStyle/trailpack-proxy-cart/tree/master
[daviddm-image]: http://img.shields.io/david/calistyle/trailpack-proxy-cart.svg?style=flat-square
[daviddm-url]: https://david-dm.org/calistyle/trailpack-proxy-cart
[codeclimate-image]: https://img.shields.io/codeclimate/github/calistyle/trailpack-proxy-cart.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/calistyle/trailpack-proxy-cart

[ci-sequelize-image]: https://img.shields.io/travis/trailsjs/trailpack-sequelize/master.svg?style=flat-square
[ci-sequelize-url]: https://travis-ci.org/trailsjs/trailpack-sequelize

[ci-proxyengine-image]: https://img.shields.io/circleci/project/github/CaliStyle/trailpack-proxy-engine/nmaster.svg
[ci-proxyengine-url]: https://circleci.com/gh/CaliStyle/trailpack-proxy-engine/tree/master

[ci-proxypassport-image]: https://img.shields.io/circleci/project/github/CaliStyle/trailpack-proxy-passport/nmaster.svg
[ci-proxypassport-url]: https://circleci.com/gh/CaliStyle/trailpack-proxy-passport/tree/master

[ci-proxypermissions-image]: https://img.shields.io/circleci/project/github/CaliStyle/trailpack-proxy-permissions/nmaster.svg
[ci-proxypermissions-url]: https://circleci.com/gh/CaliStyle/trailpack-proxy-permissions/tree/master

[ci-express-image]: https://img.shields.io/travis/trailsjs/trailpack-express/master.svg?style=flat-square
[ci-express-url]: https://travis-ci.org/trailsjs/trailpack-express
