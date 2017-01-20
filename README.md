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
```

## Shops
A shop represents a physical location that sells a product. When taxes and shipping are calculated per product, they are calculated by the nearest shop to the destination of an order. This means that the same product can be sold in multiple stores and shipped from different locations which may effect shipping and tax rates.

## Products
A Product is a Physical or Digital item.

## Product Variants
A Product Variant is a variation of a product denoted by a unique Stock Keeping Unit (SKU)

## Product Images
A Product Image is an image that is associated directly with a product and sometimes a product variant.

## Product Reviews
A Product Review is input from a customer with a history of purchasing a product.

## Metadata
A Metadata is additional information about a product, customer, or review that is not constrained by the parent model.

## Collections
A Collection is a grouping of like items, such as products, customers, and shipping zones.

## Tags
A Tag is a searching marker for a customer or product.

## Customers
A Customer is a user or guest.

## Carts
A Cart is a bucket that holds products and data until an order is placed.

## Orders
An Order is a bucket that holds products and data and the transactions of purchases and fulfillment.

## Fulfillment
A Fulfillment is a shipping transaction for an order.

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
//GET <api>/cart/:id
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

`payment_details`: an array of payment information, requires a 'gateway' attribute and normally a 'token'

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

##### ProductController.removeVariants
Removes multiple product variants (does not delete unless configured too)

##### ProductController.removeImage
Removes a product image

##### ProductController.removeImages
Removes multiple images

##### ProductController.uploadCSV
Uploads a Product CSV

##### ProductController.processUpload
Processes Uploaded CSV

##### ProductController.uploadMetaCSV
Uploads a Metadata CSV

##### ProductController.processMetaUpload
Processes Uploaded Metadata CSV

##### ProductController.exportProducts
Exports products as a CSV

#### OrderController
Handles Order operations

##### OrderController.exportOrders
Exports orders as a CSV

#### ShopController
Handles Shop operations

##### ShopController.create
Creates a new Shop

##### ShopController.update
Updates a Shop

#### SubscriptionController
Handles Subscription operations

#### TransactionController
Handles Transaction operations

### Services
#### CartService
#### CollectionService
#### CouponService
#### CustomerService
#### CustomerCsvService
#### DiscountService
#### FulfillmentService
#### GiftCardService
#### OrderService
#### ProductService
#### ProductCsvService
#### ProxyCartService
#### ShippingService
#### ShopService
#### SubscriptionService
#### TaxService
#### TransactionService

### Models
#### Address
#### Cart
#### City
#### Collection
#### Country
#### County
#### Coupon
#### Customer
#### CustomerAddress
#### CustomerUpload
#### Discount
#### Fulfillment
#### FulfillmentEvent
#### GiftCard
#### ItemCollection
#### ItemMetadata
#### ItemTag
#### Metadata
#### Order
#### OrderItem
#### Product
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
#### Subscription
#### Tag
#### Transaction

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

[ci-express-image]: https://img.shields.io/travis/trailsjs/trailpack-express/master.svg?style=flat-square
[ci-express-url]: https://travis-ci.org/trailsjs/trailpack-express
