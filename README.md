# trailpack-proxy-cart

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]

## Node.js eCommerce built for speed, scalability, flexibility, and love from [Cali Style](https://cali-style.com)
Proxy Cart is the eCommerce component for [Proxy Engine](https://github.com/calistyle/trailpack-proxy-engine). Connect your own [Merchant Processor, Shipping Provider, Fulfillment Service, Tax Provider](https://github.com/calistyle/trailpack-proxy-generics), and import your products. Attach it to Proxy Engine and start building with [Proxy CMS](https://github.com/calistyle/trailpack-proxy-cms)!

## Dependencies
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
    require('trailpack-proxy-cart')
  ]
}
```

## Usage

### Controllers
#### CustomerController
Handles Customer operations
##### CustomerController.create

##### CustomerController.update

##### CustomerController.findOne

##### CustomerController.uploadCSV

##### CustomerController.processUpload

#### CartController
Handles Cart operations
##### CartController.create

##### CartController.checkout

##### CartController.addItems

##### CartController.removeItems

##### CartController.clear

#### OrderController
Handles Order operations

#### ProductController
Handles Product operations
##### ProductController.findOne

##### ProductController.addProduct

##### ProductController.addProducts

##### ProductController.updateProduct

##### ProductController.updateProducts

##### ProductController.removeProduct

##### ProductController.removeProducts

##### ProductController.removeVariant

##### ProductController.removeVariants

##### ProductController.removeImage

##### ProductController.removeImages

##### ProductController.uploadCSV

##### ProductController.processUpload

##### ProductController.uploadMetaCSV

##### ProductController.processMetaUpload

#### ShopController
Handles Shop operations

#### SubscriptionController
Handles Subscription operations

#### TransactionController
Handles Transaction operations

### Services
#### CartService
#### CollectionService
#### CouponService
#### CustomerService
#### CustomerCSVService
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

[ci-express-image]: https://img.shields.io/travis/trailsjs/trailpack-express/master.svg?style=flat-square
[ci-express-url]: https://travis-ci.org/trailsjs/trailpack-express
