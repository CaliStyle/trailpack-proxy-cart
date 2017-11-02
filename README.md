# trailpack-proxy-cart

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]

## Node.js eCommerce built for speed, scalability, flexibility, and love from [Cali Style](https://cali-style.com)
Proxy Cart is the eCommerce component for [Proxy Engine](https://github.com/calistyle/trailpack-proxy-engine). Connect your own [Merchant Processor, Shipping Provider, Fulfillment Service, Tax Provider](https://github.com/calistyle/trailpack-proxy-generics), and import your products. Attach it to Proxy Engine and you have an REST API based eCommerce solution!

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

### Proxy Notifications
| Repo          |  Build Status (edge)                  |
|---------------|---------------------------------------|
| [trailpack-proxy-notifications](https://github.com/calistyle/trailpack-proxy-notifications) | [![Build status][ci-proxynotifications-image]][ci-proxynotifications-url] |

### Supported ORMs
| Repo          |  Build Status (edge)                  |
|---------------|---------------------------------------|
| [trailpack-proxy-sequelize](https://github.com/calistyle/trailpack-proxy-sequelize) | [![Build status][ci-sequelize-image]][ci-sequelize-url] |

### Supported Webserver
| Repo          |  Build Status (edge)                  |
|---------------|---------------------------------------|
| [trailpack-express](https://github.com/trailsjs/trailpack-express) | [![Build status][ci-express-image]][ci-express-url] |


## Development
Proxy Cart currently only support sequelize on Postgres. To contribute to Proxy Cart, first create a Local Postgres Database named `ProxyCart`. Then test the build with `DIALECT=postgres npm test`. 

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
  // Allow certain events
  allow: {
    // Allows a product to be destroyed, Recommended false
    destroy_product: false,
    // Allows a product variant to be destroyed, Recommended false
    destroy_variant: false
  },
  // The default currency used
  default_currency: 'USD',
  // The countries to load by default
  default_countries: ['USA'],
  // Emails to send
  emails: {
    orderCreated: false,
    orderUpdated: false,
    orderPaid: false,
    orderFulfilled: false,
    orderRefunded: false,
    orderCancelled: false,
    sourceExpired: false,
    sourceWillExpire: false,
    sourceUpdated: false,
    subscriptionCreated: false,
    subscriptionUpdated: false,
    subscriptionActivated: false,
    subscriptionDeactivated: false,
    subscriptionCancelled: false,
    subscriptionWillRenew: false,
    subscriptionRenewed: false,
    transactionFailed: false
  },
  // Orders
  orders: {
    // Restock default for refunded order items
    refund_restock: false,
    // The default function for an automatic order payment: manual, immediate
    payment_kind: 'immediate',
    // the default function for transaction kind: authorize, sale
    transaction_kind: 'authorize',
    // The default function for an automatic order fulfillment: manual, immediate
    fulfillment_kind: 'manual',
    // The amount of times a Order will retry failed transactions
    retry_attempts: 5,
    // The amount of days before a Order will cancel from failed transactions
    grace_period_days: 5
  },
  // Subscriptions
  subscriptions: {
    // The amount of times a Subscription will retry failed transactions
    retry_attempts: 5,
    // The amount of days before a Subscription will cancel from failed transactions
    grace_period_days: 5
  },
  // Transactions
  transactions: {
    // The amount of times a Transaction will retry failed
    retry_attempts: 5,
    // The amount of days before a Transaction will cancel from failed
    authorization_exp_days: 5
  }
}

```

## Shops
A shop represents a physical location that sells a product. When taxes and shipping are calculated per product, they are calculated by the nearest shop to the destination of an order. This means that the same product can be sold in multiple stores and shipped from different locations which may effect shipping and tax rates. They also track on hand inventory and inventory lead time.

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
A Tag is a searching marker for a customer, product, or order.

## Customers
A Customer represents an account of one more users or guests.

## Users
A User is a registered user account with an username/email and password with given permission roles. Multiple users can share a single Customer account.

## Accounts
An Account is a 3rd party payment provider that the customer belongs to such as Stripe or Authorize.net, each customer can have multiple accounts

## Sources
A Source is a payment method used by the customer at checkout that belongs to a customer and a 3rd party Account.

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

## Refunds
A Refund represents a transaction that has been completely or partially refunded.

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
Proxy Cart publishes many subscribable events using Proxy Engine's pub/sub.

### Customer Events
Events published and saved during customer actions.

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
Order events published and saved during order operations.

#### order.created.*{pending|success|failure|error}

#### order.transaction.sale.*{pending|success|failure|error}

#### order.transaction.authorize.*{pending|success|failure|error}

#### order.transaction.capture.*{pending|success|failure|error}

#### order.transaction.void.*{pending|success|failure|error}

#### order.transaction.refund.*{pending|success|failure|error}

#### order.fulfillment.create.*{pending|success|failure|error}

## Crons
### Expire Coupons
Expires coupons on a schedule

### Start Discounts
Start discounts on a schedule

### Expire Discounts
Expires discounts on a schedule

### Renew Subscriptions
Renews subscriptions on a schedule
`SubscriptionsCron.renew`

### Retry Subscriptions
Retry failed subscriptions
`SubscriptionsCron.retryFailed`

### Cancel Subscriptions
Cancels Subscriptions that failed to renew
`SubscriptionsCron.cancelFailed`

### Retry Transactions
Retries failed transactions
`TransactionsCron.retryFailed`

### Cancel Transactions
Cancels failed transactions.
`TransactionsCron.cancelFailed`

### Source Will Expire
Notifies Customers that their Payment Method will Expire
`AccountsCron.expired`

### Source Expired
Notifies Customers that their Payment Method expired
`AccoutnsCron.willExipre`

## Emails
Emails that are constructed to be passed as notifications to the users.

### Customer

### Order

### Source

### Subscription

## Templates
Templates that are used in the construction of emails.

### Customer
### Order
### Source
### Subscription

## Generics
All of Proxy Carts generics can be overridden by 3rd party generic services. 

### DefaultFulfillmentProvider
Default Provider to handle manual Fulfillments

### DefaultGeoLocationProvider
Default Provider to handle Geolocation

### DefaultImageProvider
Default Provider to handle Image Manipulation

### DefaultShippingProvider
Default Provider to handle Shipping rates 

### DefaultTaxProvider
Default Provider to handle Tax Rates

## Policies
### CartPolicy

### CollectionPolicy

### ProductPolicy

### ProxyCartPolicy

### SubscriptionPolicy

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
Returns updated customer
```
{}
```

##### CustomerController.findOne
Find a Customer by id
```
//GET <api>/customer/:id
```
Returns customer
```
{}
```

##### CustomerController.session
Get the current customer in session
```
//GET <api>/customer/session
```
Returns customer
```
{}
```

##### CustomerController.search
```
//GET <api>/customer/search
```
Returns customers
```
[]
```

##### CustomerController.uploadCSV
Upload a Customer CSV
```
//POST <api>/customer/uploadCSV
```

##### CustomerController.processUpload
Process Uploaded Customer CSV
```
//POST <api>/customer/processUpload/:id
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

`payment_kind`: the type of payment to be made, 'immediate', 'manual'

`transaction_kind`: The type of transaction to create, 'authorize', 'capture', 'sale', or 'manual'

`payment_details`: an array of payment information, requires a 'gateway' attribute and normally a 'token' or a 'source'

`fulfillment_kind`: the type of fulfillment to perform, 'immediate', 'manual', null or blank

`billing_address`: an address object or you can leave null if cart has a customer with address 

`shipping_address`: an address object or you can leave null if cart has a customer with address

`shop_id`: an id, provide a shop ID if you want to require calculations be based on a shop location

```
//POST <api>/cart/:id/checkout
//POST <api>/cart/checkout (If cart in session)
{
  payment_kind: 'immediate',
  transaction_kind: 'sale',
  payment_details: [
    {
      gateway: 'payment_processor',
      token: '123'
    }
  ],
  fulfillment_kind: 'immediate'
}
```
Returns the placed Order and a new Cart object, and if Customer was provided/created a Customer Object
```
{
  order: ...,
  cart: ....
  customer: ....
}

```

##### CartController.addItems
Add Items to an open cart. Some interesting things to note:

- You can add an existing item to a cart and it will increase the quantity
- Checks if the product inventory is available according to inventory policy
- Checks for geographic restrictions
- Checks for Product, Collections, and Customer Discounts
- Checks for Account Balance
- Checks and validates Coupons

```
// POST <api>/cart/:id/addItems
// POST <api>/cart/addItems (if cart in session)
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
Returns the cart with new values 
```
{}
```

##### CartController.removeItems
Remove Items from an open cart. Some interesting things to note:

- If you specify just an id form, it will only reduce the quantity in the cart by 1.
- If you specify a quantity, it will reduce the quantity in the cart by that number

```
//POST <api>/cart/:id/removeItems
//POST <api>/cart/removeItems (if cart in session)
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
```
{}
```

##### CartController.clear
Removes all items from an open cart
```
//POST <api>/cart/:id/clear
//POST <api>/cart/clear (if cart in session)
```
Returns updated Cart
```
{}
```

#### CollectionController
Handles Collection operations

##### CollectionController.create
Creates a new Collection. Some interesting things to note:
- A collection has many products associated to it.  In addition, it can have a discount that applies to the products which is reflected in their calculated price.  This is different then the discount object (which effects an individual product).  For the collection, you can have the discount be ignored for certain product types.  Put those product type strings in the `discount_product_exclude` array.  But let’s say that the product types you want to discount is shorter then the product types you don’t want to discount, in which case, you would use the `discount_product_include`. You would never want to use both. If the `discount_product_exclude`'s length is greater than 0, `discount_product_include` will be ignored.

```
//POST `<api>/collection`
{
  handle: "customer-discount-test",
  title: "Customer Discount",
  body: "# Customer Discount",
  published: true,
  sort_order: "price-desc",
  discount_type: "fixed",
  discount_scope: "global",
  discount_rate: 100,
  primary_purpose: "discount",
  discount_product_exclude: [
    "subscription"
  ],
  collections: [
    // Add an existing sub collection
    "existing-collection-handle",
    // Create a new collection
    {
      handle: 'new-collection-handle',
      title: 'New Collection'
    }
  ]
}
```
Returns created collection
```
{}
```

##### CollectionController.update
Updates a Collection
```
//POST `<api>/collection/:id`
{}
```
Returns updated collection
```
{}
```

##### CollectionController.add
Adds a Collection to a collection
```
//POST `<api>/collection/:id/add/:collection`
```
Returns updated collection
```
{}
```

##### CollectionController.remove
Remove a Collection from a collection
```
//POST `<api>/collection/:id/remove/:collection`
```
Returns updated collection
```
{}
```

##### CollectionController.addProduct
Add a product to a Collection
```
//POST `<api>/collection/:id/addProduct/:product`
```
Returns updated collection
```
{}
```

##### CollectionController.removeProduct
Removes a product from a Collection
```
//POST `<api>/collection/:id/removeProduct/:product`
```
Returns updated collection
```
{}
```

##### CollectionController.addCustomer
Add a customer to a Collection
```
//POST `<api>/collection/:id/addCustomer/:customer`
```
Returns updated collection
```
{}
```

##### CollectionController.removeCustomer
Removes a customer from a Collection
```
//POST `<api>/collection/:id/removeCustomer/:customer`
```
Returns updated collection
```
{}
```

##### CustomerController.uploadCSV
Uploads a Customer CSV using a template and makes it ready to process
```
//POST <api>/customer/uploadCSV
name: csv
```
Returns statistics of the upload

##### CustomerController.processUpload
Processes Uploaded CSV
```
//POST <api>/customer/processUpload/:uploadID
```
Returns statistics of the processed upload

#### FulfillmentController
Handles Fulfillment operations

#### ProductController
Handles Product operations

##### ProductController.findOne
Find a Product by `id`
```
//GET <api>/product/:id
```
Returns the product
```
{}
```

##### ProductController.findAll
Find a Products by query
```
//GET <api>/product
```
Returns paginated products with pagination `x-headers`
```
[]
```

##### ProductController.findByTag
Find a Products by tag name with query
```
//GET <api>/product/tag/:tag
```
Returns paginated products with pagination `x-headers`
```
[]
```

##### ProductController.findByCollection
Find a Products by collection handle with query
```
//GET <api>/product/collection/:handle
```
Returns paginated products with pagination `x-headers`
```
[]
```

##### ProductController.addProduct
Adds a new product. Some interesting things to note:
- If you do not supply a currency, it will use the your configs default currency (USD)
- Prices are all in whole numbers a their base level eg. $1.00 = 100
- If a collection is not found in the list, it will be created.
- If a tag is not found in the list, it will be created.
- If you do not provide any variants, a default variant will be created if there is provided SKU.
```
//POST <api>/product
//POST <api>/product/add
{
  handle: 'snowboard',
  title: 'Burton Custom Freestyle 151',
  body: '<strong>Good snowboard!</strong>',
  vendors: [
    'Burton'
  ],
  type: 'Snowboard',
  price: '10000',
  published: true,
  tags: [
    'snow',
    'equipment',
    'outdoor'
  ],
  collections: [
    'fire sale'
  ],
  metadata: {
    test: 'value'
  },
  sku: 'board-m-123',
  weight: '20',
  weight_unit: 'lb',
  images: [
    {
      src: 'https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150',
      alt: 'Hello World'
    }
  ],
  variants: [
    {
      title: 'Women\'s Burton Custom Freestyle 151',
      price: '10001',
      sku: 'board-w-123',
      images: [
        {
          src: 'https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150',
          alt: 'Hello World 2'
        }
      ]
    }
  ]
}
```

Returns Created Product
```
{}
```

##### ProductController.addProducts
Adds new products
```
//POST <api>/product/addProducts
//POST <api>/products
[]
```

Returns Created Products
```
[]
```

##### ProductController.updateProduct
Updates a product. updateProduct can update a product, add new variants and update existing ones, and add/update images all in one step.
Some interesting things to note:
- Updating the metadata will override the original metadata completely
- Supplying a list of collection's will override the original collections list.
- You can supply a completely new collection in the collection list and one will be created.
- Supplying a list of tags will override original tags list.
- You can supply a completely new tag in the tag list and one will be created.
- If you supply a title and there is no original SEO title, an SEO title will be created.
- If you supply a body, the html attribute will be updated.
- You can not modify the html attribute, instead, use the body to write new markdown/html or a mixture of both.
- Supplying a list of Images will only add new images to the product or modify existing ones by supplying an image `id`. IT DOES NOT REMOVE ANY IMAGES
- Supplying a list of variants will only add new variants to the product or modify existing ones by supplying a variant `id`. IT DOES NOT REMOVE ANY VARIANTS
```
//POST <api>/product/:id/update
{
  id: <id>,
  // Updates Title
  title: 'Burton Custom Freestyle 151 Gen 2',
  // Updates Metdata
  metadata: {
    test: 'new value'
  },
  // Alters collections
  collections: [
    // Existing Collection
    'free-shipping',
    // A completely new collection
    {
      handle: 'merorial-day-sale',
      title: 'Memorial Day Sale',
      discount_type: "fixed",
      discount_scope: "global",
      discount_rate: 100,
      primary_purpose: "discount",
      published: true
    }
  ],
  tags: [
    'new tag'
  ],
  images: [
    // Updates existing Image alt
    {
      id: <image_id>,
      alt: 'Hello World 2 Updated'
    },
    // Creates new Image
    {
      src: 'https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150',
      alt: 'Hello World 3'
    }
  ],
  variants: [
    // Updates Variant
    {
      id: <variant_id>,
      // Updates the Title
      title: 'Women\'s Burton Custom Freestyle 151 Updated',
      // Updates the Variants position
      position: 1,
      // Updates existing Image alt
      images: [
        {
          id: <image_id>,
          alt: 'Image Updated'
        },
        // Add a new Image
        {
          src: 'https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150',
          alt: 'Hello World 5'
        }
      ]
    },
    // Creates new Variant
    {
      title: 'Youth Burton Custom Freestyle 151',
      sku: 'board-y-123',
      images: [
        {
          src: 'https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150',
          alt: 'Hello World 4'
        }
      ]
    }
  ]
}
```
Returns the updated Product
```
{}
```

##### ProductController.updateProducts
Updates multiple products at once.
```
//PUT <api>/products
//POST <api>/product/updateProducts
[]
```
Returns the updated Products
```
[]
```

##### ProductController.removeProduct
Removes a product (does not delete unless configured too)
```
//POST <api>/product/:id/remove
//DELETE <api>/product/:id
{}
```
Returns the removed product
```
{}
```

##### ProductController.removeProducts
Removes multiple products (does not delete unless configured too)
```
//POST <api>/product/removeProducts
[]
```
Returns the removed products
```
[]
```

##### ProductController.createVariant
Creates a variant. Some interesting things to note:
- Any attributes not defined, will be inherited from the parent product
- Any new options provided will be added to the product options array eg. Price, weight, currency, etc.

```
//POST <api>/product/:id/variant
{
  sku: 'new-sku',
  title: 'Awesome SKU',
  option: {'Option 1': 'This is Option 1', 'Option 2': 'This is Option 2' },
  price: 10000,
  currecny: 'USD'
}
```
Returns created Variant
```
{}
```

##### ProductController.updateVariant
Updates a variant. Some interesting things to note:
- Any new options provided will be added to the product options array eg. Price, weight, currency, etc.
- You can not update the SKU on an already created variant!
```
//POST <api>/product/:id/variant/:variant
{
 title: 'Awesome SKU',
 option: {'Option 3': 'This is Option 3', 'Option 4': 'This is Option 4' } 
}
```
Returns updated Variant
```
{}
```

##### ProductController.removeVariant
Removes a product variant (does not delete unless configured too)
```
//POST <api>/product/:id/variant/:variant/remove
//DELETE <api>/product/:id/variant/:variant
```
Returns the removed variant
```
{}
```

##### ProductController.removeVariants
Removes multiple product variants (does not delete unless configured too)
// TODO

##### ProductController.removeImage
Removes a product image
```
//POST <api>/product/:id/image/:image/remove
//DELETE <api>/product/:id/image/:image
```

##### ProductController.addTag
Adds a tag to a product
```
//POST <api>/product/:id/addTag/:tag
```
Returns Updated Product
```
{}
```

##### ProductController.removeTag
Removes a tag from a product
```
//POST <api>/product/:id/removeTag/:tag
```
Returns Updated Product
```
{}
```

##### ProductController.addCollection
Adds a product to a collection
```
//POST <api>/product/:id/addCollection/:collection
```
Returns Updated Product
```
{}
```

##### ProductController.removeCollection
Removes a product from a collection
```
//POST <api>/product/:id/addCollection/:collection
```
Returns Updated Product
```
{}
```

##### ProductController.addVendor
Adds a Vendor to a product
```
//POST <api>/product/:id/addVendor/:vendor
```
Returns Updated Product
```
{}
```

##### ProductController.removeVendor
Removes a Vendor from a product
```
//POST <api>/product/:id/removeVendor/:vendor
```
Returns Updated Product
```
{}
```


##### ProductController.uploadCSV
Uploads a Product CSV using a template and makes it ready to process
```
//POST <api>/product/uploadCSV
name: csv
```
Returns statistics of the upload

##### ProductController.processUpload
Processes Uploaded CSV
```
//POST <api>product/processUpload/:uploadID
```
Returns statistics of the processed upload

##### ProductController.uploadMetaCSV
Uploads a Metadata CSV using a template and makes it ready to process
```
//POST <api>product/uploadMetaCSV
name csv
```
Returns statistics of the upload
```
{}
```

##### ProductController.processMetaUpload
Processes Uploaded Metadata CSV
```
//POST <api>product/processMetaUpload/:uploadMetaID
```
Returns statistics of the processed upload
```
{}
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
#### CountryService
#### CouponService
#### CustomerService
#### CustomerCsvService
#### DiscountService
#### FulfillmentService
#### GiftCardService
#### OrderService
#### OrderCsvService
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
#### VendorCsvService

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
Join table to handle collection children
#### ItemCoupon
#### ItemDiscount
Join table to handle discount children
#### ItemImage
#### ItemRefund
#### ItemShippingZone
#### ItemTag
#### Metadata
#### Order
#### OrderItem
#### OrderRisk
#### OrderSource
#### OrderUpload
#### Product
##### id: number;
The Id of the Product, can not be modified.
##### handle: string;
A 'ka-ba-ab' style string, can not be modified once set.
##### title: string;
The selling title of the of the product.
##### body: string;
The information or description of the product in either markdown, html, or both.
##### html: string;
The rendered version of the product body.
##### vendors: string[];
The name of each Vendor of the product.
##### type: string;
The lowest level description of a product.
##### tags: string[];
The name of each tag that the product is associated to.
##### collections: Collection[];
A list of Collections this product is in. 
##### associations: Product[];
A list of products that this product is associated with.
##### metadata: Metadata.data
The metadata associated to the product, an object that contains data in JSON in the Metadata table.
##### weight: number;
The weight as a number.
##### weight_unit: string;
THe weight unit of the product expressed in either grams (g), kilograms (kg), ounces (oz), pounds (lb).
##### images: Image[];
A list of images associated with a product.
##### variants: ProductVariant[];
A list of product variants associated with a product.
##### seo_title: string;
A special title used for SEO purposes.
##### seo_description: string;
A special description used for SEO purposes.
##### tax_code: string;
The code that the product uses for tax purposes.
##### price: number;
The price of the product in whole numbers eg. ($1.00) = 100.
##### calculated_price: number;
The price of the product after discounts in whole numbers eg. ($1.00) = 100.
##### currency: string;
The currency the prices are in.
##### total_discounts: number;
The total amount of discounts applied to the product at the time it's displated in whole numbers eg. ($1.00) = 100.
##### discounted_lines: [{price: number, name: string, line: number}]
A list of discounts applied to the product.
##### published_scope: string;
A container for where the product is displayable.
##### published: boolean;
A boolean if the product is published.
##### published_at: string;
When the product was published.
##### unpublished_at: string;
When the product was unpublished.
##### options: string[]
The options generated by the product variants.
##### review_score: number;
The score of the product based on reviews.
##### total_reviews: number;
The total amount of reviews the product has.
##### total_variants: number;
The total amount of variants the product has.
##### google
The google shopping attributes
###### g_product_category: string;
###### g_gender: string;
###### g_age_group: string;
###### g_mpn: string;
###### g_adwords_grouping: string;
###### g_adwords_label: string;
###### g_condition: string;
###### g_custom_product: string;
###### g_custom_label_0: string;
###### g_custom_label_1: string;
###### g_custom_label_2: string;
###### g_custom_label_3: string;
###### g_custom_label_4: string;
##### amazon
The amazon shopping attributes
##### live_mode: boolean;
If the product was created in a live environment.
##### created_at: string;
When the product was created.
##### updated_at: string;
When the product was last updated.

#### ProductAssociation
#### ProductAssociationUpload
#### ProductImage
#### ProductMetaUpload
#### ProductReview

#### ProductVariant
##### id: number;
The Variant's ID
##### product_id: number;
The product ID this variant belongs to
##### sku: string;
The Stock Keeping Unit (sku) for this variant
##### title: string;
The Title of the variant
##### option: {<option_name_1: string>: <option_value_1:string>}
An Object of options that this variant is
##### barcode: string;
The Barcode associated to the variant
##### price: number;
The Price of the variant
##### compare_at_price: number;
A comparative price of the variant
##### currency: string;
The currency of the prices
##### fulfillment_service: string;
The service to be used to fulfill this variant
##### position: number;
The position of this variant in context to other variants
##### published: boolean;
If this variant is published
##### published_at: string;
When this variant was published
##### requires_shipping: boolean;
If this variant requires shipping
##### requires_tax: boolean;
If this variant requires taxes
##### requires_subscription: boolean;
If this variant requires a subscription
##### subscription_interval: string;
The interval of the required subscription
##### subscription_unit: string;
The interval unit of the required subscription
##### inventory_management: string;
The service that manages the inventory
##### inventory_policy: string;
The policy that effects wether this variant can be purchased
##### inventory_quantity: string;
The amount of inventory total of this variant
##### inventory_lead_time: string;
The amount of time to get more of this variant
##### tax_code: string;
The US tax code this variant belongs to
##### weight: number;
The weight of this variant
##### weight_unit: string;
The weight unit of this variant
##### images: Image[];
Images that belong to this variant
##### live_mode: boolean;
If this variant was created in a live environment 
##### created_at: string;
When this variant was first created
##### updated_at: string;
When this variant was last updated.

#### Province
#### Refund
#### ShippingRestriction
#### ShippingZone
#### Shop
#### ShopProduct
#### Source
#### Subscription
#### SubscriptionUpload
#### Tag
#### Transaction
#### User
#### Vendor
#### VendorProduct
#### VendorUpload

## Utils
### Enums
### Query Defaults

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

[ci-proxynotifications-image]: https://img.shields.io/circleci/project/github/CaliStyle/trailpack-proxy-notifications/nmaster.svg
[ci-proxynotifications-url]: https://circleci.com/gh/CaliStyle/trailpack-proxy-notifications/tree/master

[ci-express-image]: https://img.shields.io/travis/trailsjs/trailpack-express/master.svg?style=flat-square
[ci-express-url]: https://travis-ci.org/trailsjs/trailpack-express
