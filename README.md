# trailpack-proxy-cart

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]

## Node.js eCommerce built for speed, scalability, flexibility, and love from [Cali Style](https://cali-style.com)
Proxy Cart is the eCommerce component for Proxy Engine. Connect your own Merchant Processor, Shipping Provider, Fulfillment Service, Tax Provider, and import your products. Attach it to Proxy-Engine and start building with Proxy CMS.

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
#### CartController

##### CartController.create

##### CartController.checkout

##### CartController.addItems

##### CartController.removeItems

##### CartController.clear

#### ProductController
##### ProductController.addProducts

##### ProductController.updateProducts

##### ProductController.removeProducts

##### ProductController.removeVariant

##### ProductController.removeImage

### Services
#### CartService
#### CouponService
#### CustomerService
#### DiscountService
#### FulfillmentService
#### GiftCardService
#### OrderService
#### ProductService
#### ProxyCartService
#### ShippingService
#### TaxService

### Models
#### Cart
#### Country
#### Coupon
#### Customer
#### CustomerAddress
#### Discount
#### Fulfillment
#### GiftCard
#### Metadata
#### Order
#### OrderItem
#### Product
#### ProductCollection
#### ProductImage
#### ProductReview
#### ProductVariant
#### Province
#### Refund
#### ShippingZone
#### Subscription
#### Tag
#### Transaction

[npm-image]: https://img.shields.io/npm/v/trailpack-proxy-cart.svg?style=flat-square
[npm-url]: https://npmjs.org/package/trailpack-proxy-cart
[ci-image]: https://img.shields.io/travis/calistyle/trailpack-proxy-cart/master.svg?style=flat-square
[ci-url]: https://travis-ci.org/calistyle/trailpack-proxy-cart
[daviddm-image]: http://img.shields.io/david/calistyle/trailpack-proxy-cart.svg?style=flat-square
[daviddm-url]: https://david-dm.org/calistyle/trailpack-proxy-cart
[codeclimate-image]: https://img.shields.io/codeclimate/github/calistyle/trailpack-proxy-cart.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/calistyle/trailpack-proxy-cart

[ci-sequelize-image]: https://img.shields.io/travis/trailsjs/trailpack-sequelize/master.svg?style=flat-square
[ci-sequelize-url]: https://travis-ci.org/trailsjs/trailpack-sequelize

[ci-express-image]: https://img.shields.io/travis/trailsjs/trailpack-express/master.svg?style=flat-square
[ci-express-url]: https://travis-ci.org/trailsjs/trailpack-express
