/* eslint no-underscore-dangle: [0]*/
/**
 * ProxyCart initialization.
 *
 * Initializes ProxyCart for incoming requests, allowing cart and customer sessions
 *
 * If sessions are being utilized, applications must set up ProxyCart with
 * functions to serialize a cart/customer into and out of a session.  For example, a
 * common pattern is to serialize just the cart/customer ID into the session (due to the
 * fact that it is desirable to store the minimum amount of data in a session).
 * When a subsequent request arrives for the session, the full Cart/Customer object can
 * be loaded from the database by ID.
 *
 * Note that additional middleware is required to persist login state, so we
 * must use the `connect.session()` middleware _before_ `proxyCart.initialize()`.
 *
 * If sessions are being used, this middleware must be in use by the
 * Connect/Express application for ProxyCart to operate.  If the application is
 * entirely stateless (not using sessions), this middleware is not necessary,
 * but its use will not have any adverse impact.
 *
 * Examples:
 *
 *     app.use(connect.cookieParser());
 *     app.use(connect.session({ secret: 'keyboard cat' }));
 *     app.use(proxyCart.initialize());
 *     app.use(proxyCart.session());
 *
 *     proxyCart.serializeCart(function(cart, done) {
 *       done(null, cart.id);
 *     });
 *
 *     proxyCart.deserializeCart(function(id, done) {
 *       Cart.findById(id, function (err, cart) {
 *         done(err, cart);
 *       });
 *     });
 *
 *     proxyCart.serializeCustomer(function(customer, done) {
 *       done(null, customer.id);
 *     });
 *
 *     proxyCart.deserializeCustomer(function(id, done) {
 *       Customer.findById(id, function (err, customer) {
 *         done(err, customer);
 *       });
 *     });
 *
 * @return {Function}
 * @api public
 */
module.exports = function initialize(proxyCart) {

  return function initialize(req, res, next) {
    req._proxyCart = {}
    req._proxyCart.instance = proxyCart

    if (req.session && req.session[proxyCart._key]) {
      // load data from existing session
      req._proxyCart.session = req.session[proxyCart._key]
    }

    next()
  }
}
