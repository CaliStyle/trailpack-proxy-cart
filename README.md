# trailpack-proxy-cart

[![Waffle.io - Columns and their card count](https://badge.waffle.io/CaliStyle/trailpack-proxy-cart.svg?columns=all)](https://waffle.io/CaliStyle/trailpack-proxy-cart)

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]

## Node.js eCommerce built for speed, scalability, flexibility, and love from [Cali Style](https://cali-style.com)
Proxy Cart is the eCommerce component for [Proxy Engine](https://github.com/calistyle/trailpack-proxy-engine). Connect your own [Merchant Processor, Shipping Provider, Fulfillment Service, Tax Provider](https://github.com/calistyle/trailpack-proxy-generics), and import your products. Attach it to Proxy Engine and you have a fully REST API based eCommerce solution!

# Documentation
[Proxy Cart Documentation](https://calistyle.github.io/proxy-cart-docs)

## Development Notes
Proxy Cart currently only support sequelize on Postgres. To contribute to Proxy Cart, first create a Local Postgres Database named `ProxyCart`. Then test the build with `DIALECT=postgres npm test`. 

[npm-image]: https://img.shields.io/npm/v/trailpack-proxy-cart.svg?style=flat-square
[npm-url]: https://npmjs.org/package/trailpack-proxy-cart
[ci-image]: https://img.shields.io/circleci/project/github/CaliStyle/trailpack-proxy-cart/master.svg
[ci-url]: https://circleci.com/gh/CaliStyle/trailpack-proxy-cart/tree/master
[daviddm-image]: http://img.shields.io/david/calistyle/trailpack-proxy-cart.svg?style=flat-square
[daviddm-url]: https://david-dm.org/calistyle/trailpack-proxy-cart
[codeclimate-image]: https://img.shields.io/codeclimate/github/calistyle/trailpack-proxy-cart.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/calistyle/trailpack-proxy-cart
