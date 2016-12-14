# trailpack-proxy-cart

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]

## Node.js eCommerce built for speed, scalability, flexibility, and love from [Cali Style](https://cali-style.com)
Proxy Cart is the eCommerce component for Proxy Engine. Connect your own Merchant Processor, Fulfillment, and import your products.

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

##### CartController.checkout

##### CartController.addItems

##### CartController.removeItems

##### CartController.clear

#### ProductController
##### ProductController.addProducts

##### ProductController.updateProducts

##### ProductController.removeProducts

### Services

[npm-image]: https://img.shields.io/npm/v/trailpack-proxy-cart.svg?style=flat-square
[npm-url]: https://npmjs.org/package/trailpack-proxy-cart
[ci-image]: https://img.shields.io/travis/calistyle/trailpack-proxy-cart/master.svg?style=flat-square
[ci-url]: https://travis-ci.org/calistyle/trailpack-proxy-cart
[daviddm-image]: http://img.shields.io/david/calistyle/trailpack-proxy-cart.svg?style=flat-square
[daviddm-url]: https://david-dm.org/calistyle/trailpack-proxy-cart
[codeclimate-image]: https://img.shields.io/codeclimate/github/calistyle/trailpack-proxy-cart.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/calistyle/trailpack-proxy-cart

