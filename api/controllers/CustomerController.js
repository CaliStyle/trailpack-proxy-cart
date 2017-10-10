/* eslint no-console: [0] */
'use strict'

const Controller = require('trails/controller')
const lib = require('../../lib')
const Errors = require('proxy-engine-errors')
const _ = require('lodash')
/**
 * @module CustomerController
 * @description Customer Controller.
 */
// TODO lock down certain requests by Owner(s)
module.exports = class CustomerController extends Controller {
  generalStats(req, res) {
    res.json({})
  }
  /**
   *
   * @param req
   * @param res
   */
  count(req, res){
    const ProxyEngineService = this.app.services.ProxyEngineService
    ProxyEngineService.count('Customer')
      .then(count => {
        const counts = {
          customers: count
        }
        return res.json(counts)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  session(req, res) {
    if (!req.customer) {
      return res.sendStatus(401)
    }
    return this.app.services.ProxyPermissionsService.sanitizeResult(req, req.customer)
    .then(result => {
      return res.json(result)
    })
  }

  /**
   *
   * @param req
   * @param res
   */
  search(req, res) {
    const orm = this.app.orm
    const Customer = orm['Customer']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['last_name', 'ASC']]
    const term = req.query.term
    const where = this.app.services.ProxyCartService.jsonCritera(req.query.where)
    const defaults = _.defaults(where, {
      $or: [
        {
          first_name: {
            $iLike: `%${term}%`
          }
        },
        {
          last_name: {
            $iLike: `%${term}%`
          }
        },
        {
          email: {
            $iLike: `%${term}%`
          }
        },
        {
          company: {
            $iLike: `%${term}%`
          }
        }
      ]
    })
    // console.log('CustomerController.search', term)
    Customer.findAndCount({
      where: defaults,
      order: sort,
      offset: offset,
      req: req,
      limit: limit
    })
      .then(customers => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, customers.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customers.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  findById(req, res){
    const orm = this.app.orm
    const Customer = orm['Customer']
    let id = req.params.id
    if (!id && req.customer) {
      id = req.customer.id
    }
    Customer.findByIdDefault(id, {})
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error(`Customer id ${id} not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customer)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  findByToken(req, res){
    const orm = this.app.orm
    const Customer = orm['Customer']
    let token = req.params.id
    if (!token && req.customer) {
      token = req.customer.token
    }
    Customer.findByTokenDefault(token, {})
      .then(customer => {
        if (!customer) {
          throw new Errors.FoundError(Error(`Customer token ${token} not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customer)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  findAll(req, res){
    const orm = this.app.orm
    const Customer = orm['Customer']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    const where = this.app.services.ProxyCartService.jsonCritera(req.query.where)

    Customer.findAndCount({
      order: sort,
      offset: offset,
      limit: limit,
      where: where
    })
      .then(customers => {
        this.app.services.ProxyEngineService.paginate(res, customers.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customers.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  findByTag(req, res) {
    const orm = this.app.orm
    const Customer = orm['Customer']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    Customer.findAndCountDefault({
      where: {
        '$tags.name$': req.params.tag
      },
      order: sort,
      offset: offset,
      req: req,
      include: [
        {
          model: this.app.orm['Tag'],
          as: 'tags'
        }
      ]
      // limit: limit // TODO Sequelize breaks if a limit is here.
    })
      .then(customers => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, customers.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customers.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  findByCollection(req, res) {
    const orm = this.app.orm
    const Customer = orm['Customer']
    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    Customer.findAndCountDefault({
      where: {
        '$collections.handle$': req.params.handle
      },
      include: [
        {
          model: this.app.orm['Collection'],
          as: 'collections'
        }
      ],
      order: sort,
      offset: offset,
      req: req
      // limit: limit // TODO Sequelize breaks if a limit is here.
    })
      .then(customers => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, customers.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customers.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  create(req, res) {

    // if (req.user && !req.body.owners) {
    //   req.body.owners = [req.user]
    // }

    const CustomerService = this.app.services.CustomerService
    lib.Validator.validateCustomer.create(req.body)
      .then(values => {
        return CustomerService.create(req.body)
      })
      .then(customer => {
        // console.log('Customer Request', req.customer)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customer)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CustomerController.create', err)
        return res.serverError(err)
      })

  }

  createAndLogin(req, res) {

    // if (req.user && !req.body.owners) {
    //   req.body.owners = [req.user]
    // }

    const CustomerService = this.app.services.CustomerService
    lib.Validator.validateCustomer.create(req.body)
      .then(values => {
        return CustomerService.create(req.body)
      })
      .then(customer => {
        return new Promise((resolve,reject) => {
          req.loginCustomer(customer, function (err) {
            if (err) {
              return reject(err)
            }
            return resolve(customer)
          })
        })
      })
      .then(customer => {
        // console.log('Customer Request', req.customer)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customer)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CustomerController.create', err)
        return res.serverError(err)
      })

  }

  /**
   *
   * @param req
   * @param res
   */
  update(req, res) {
    const CustomerService = this.app.services.CustomerService
    let id = req.params.id

    if (!id && req.customer) {
      id = req.customer.id
    }
    if (!req.body) {
      req.body = {}
    }
    if (!req.body.id) {
      req.body.id = id
    }
    lib.Validator.validateCustomer.update(req.body)
      .then(values => {
        return CustomerService.update(req.body)
      })
      .then(customer => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customer)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CustomerController.update', err)
        return res.serverError(err)
      })
  }

  accountBalance(req, res) {
    const CustomerService = this.app.services.CustomerService
    const id = req.params.id
    if (!req.body) {
      req.body = {}
    }
    if (!req.body.id) {
      req.body.id = id
    }
    lib.Validator.validateCustomer.accountBalance(req.body)
      .then(values => {
        return CustomerService.accountBalance(req.body)
      })
      .then(customer => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customer)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CustomerController.update', err)
        return res.serverError(err)
      })
  }

  /**
   * upload CSV
   * @param req
   * @param res
   */
  uploadCSV(req, res) {
    const CustomerCsvService = this.app.services.CustomerCsvService
    const csv = req.file

    if (!csv) {
      const err = new Error('File failed to upload')
      return res.serverError(err)
    }

    CustomerCsvService.customerCsv(csv.path)
      .then(result => {
        return res.json({
          file: req.file,
          result: result
        })
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  processUpload(req, res) {
    const CustomerCsvService = this.app.services.CustomerCsvService
    CustomerCsvService.processCustomerUpload(req.params.id)
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  /**
   *
   * @param req
   * @param res
   */
  exportCustomers(req, res) {
    //
  }

  /**
   *
   * @param req
   * @param res
   */
  login(req, res) {
    let customerId = req.params.id
    const Customer = this.app.orm['Customer']

    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }

    if (!customerId && !req.user) {
      const err = new Error('A customer id and a user in session are required')
      return res.send(401, err)
    }

    Customer.findById(customerId)
      .then(customer => {
        if (!customer) {
          throw new Error('Unexpected Error while authenticating customer')
        }
        return new Promise((resolve,reject) => {
          req.loginCustomer(customer, function (err) {
            if (err) {
              return reject(err)
            }
            return resolve(customer)
          })
        })
      })
      .then(customer => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customer)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('ProductController.clearCustomer', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  switchCustomer(req, res) {
    const customerId = req.params.id
    const Customer = this.app.orm['Customer']
    const User = this.app.orm['User']

    if (!customerId && !req.user) {
      const err = new Error('A customer id and a user in session are required')
      return res.send(401, err)
    }
    User.findById(req.user.id)
      .then(user => {
        user.current_customer_id = customerId
        return user.save()
      })
      .then(user => {
        return Customer.findById(customerId)
      })
      .then(customer => {
        return new Promise((resolve, reject) => {
          req.loginCustomer(customer, (err) => {
            if (err) {
              return reject(err)
            }
            return resolve(customer)
          })
        })
      })
      .then(customer => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, customer)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  logout(req, res) {
    req.logoutCustomer()
    res.ok()
  }

  /**
   *
   * @param req
   * @param res
   */
  account(req, res) {
    const Account = this.app.orm['Account']
    const accountId = req.params.account
    let customerId = req.params.id
    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId || !accountId || !req.user) {
      const err = new Error('A customer id and a user in session are required')
      res.send(401, err)

    }
    Account.findByIdDefault(accountId)
      .then(account => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, account)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  accounts(req, res) {
    const Account = this.app.orm['Account']
    let customerId = req.params.id

    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId && !req.user) {
      const err = new Error('A customer id and a user in session are required')
      return res.send(401, err)
    }

    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    Account.findAndCount({
      account: sort,
      where: {
        customer_id: customerId
      },
      offset: offset,
      limit: limit
    })
      .then(accounts => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, accounts.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, accounts.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  // TODO
  addAccount(req, res){

  }
  // TODO
  removeAccount(req, res){

  }
  /**
   *
   * @param req
   * @param res
   */
  // TODO
  updateAccount(req, res) {
    let customerId = req.params.id
    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId && !req.user) {
      const err = new Error('A customer id and a user in session are required')
      return res.serverError(err)
    }
  }

  /**
   *
   * @param req
   * @param res
   */
  order(req, res) {
    const Order = this.app.orm['Order']
    const orderId = req.params.order
    let customerId = req.params.id
    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId || !orderId || !req.user) {
      const err = new Error('A customer id and a user in session are required')
      res.send(401, err)

    }
    Order.resolve(orderId)
      .then(order => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, order)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  /**
   *
   * @param req
   * @param res
   */
  orders(req, res) {
    const Order = this.app.orm['Order']
    let customerId = req.params.id

    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId || !req.user) {
      const err = new Error('A customer id and a user in session are required')
      return res.send(401, err)
    }

    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    Order.findAndCount({
      order: sort,
      where: {
        customer_id: customerId
      },
      offset: offset,
      limit: limit
    })
      .then(orders => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, orders.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, orders.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  subscription(req, res) {
    const Subscription = this.app.orm['Subscription']
    const subscriptionId = req.params.subscription
    let customerId = req.params.id
    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId || !subscriptionId ||  !req.user) {
      const err = new Error('A customer id, subscription id, and a user in session are required')
      return res.forbidden(err)
    }

    Subscription.resolve(subscriptionId)
      .then(subscription => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscription)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   * @returns {*}
   */
  subscriptionUpdate(req, res) {
    const SubscriptionService = this.app.services.SubscriptionService
    const subscriptionId = req.params.subscription

    let customerId = req.params.id
    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId || !subscriptionId ||  !req.user) {
      const err = new Error('A customer id, subscription id, and a user in session are required')
      return res.forbidden(err)
    }

    if (!req.body) {
      req.body = {}
    }

    lib.Validator.validateSubscription.update(req.body)
      .then(values => {
        return SubscriptionService.update(req.body, subscriptionId)
      })
      .then(subscription => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscription)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('SubscriptionController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   * @returns {*}
   */
  subscriptionActivate(req, res) {
    const SubscriptionService = this.app.services.SubscriptionService
    const subscriptionId = req.params.subscription

    let customerId = req.params.id
    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId || !subscriptionId ||  !req.user) {
      const err = new Error('A customer id, subscription id, and a user in session are required')
      return res.forbidden(err)
    }

    lib.Validator.validateSubscription.activate(req.body)
      .then(values => {
        req.body.id = subscriptionId
        return SubscriptionService.activate(req.body, subscriptionId)
      })
      .then(subscription => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscription)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('SubscriptionController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   * @returns {*}
   */
  subscriptionDeactivate(req, res) {
    const SubscriptionService = this.app.services.SubscriptionService
    const subscriptionId = req.params.subscription

    let customerId = req.params.id
    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId || !subscriptionId ||  !req.user) {
      const err = new Error('A customer id, subscription id, and a user in session are required')
      return res.forbidden(err)
    }

    lib.Validator.validateSubscription.deactivate(req.body)
      .then(values => {
        req.body.id = subscriptionId
        return SubscriptionService.deactivate(req.body, subscriptionId)
      })
      .then(subscription => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscription)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('SubscriptionController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   * @returns {*}
   */
  subscriptionRenew(req, res) {
    const SubscriptionService = this.app.services.SubscriptionService
    const subscriptionId = req.params.subscription

    let customerId = req.params.id
    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }

    if (!customerId || !subscriptionId ||  !req.user) {
      const err = new Error('A customer id, subscription id, and a user in session are required')
      return res.forbidden(err)
    }

    SubscriptionService.renew(subscriptionId)
      .then(subscription => {
        if (!subscription) {
          throw new Error('Unexpected Error while renewing subscription')
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscription)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('SubscriptionController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   * @returns {*}
   */
  subscriptionCancel(req, res) {
    const SubscriptionService = this.app.services.SubscriptionService
    const subscriptionId = req.params.subscription
    let customerId = req.params.id

    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }

    if (!customerId || !subscriptionId ||  !req.user) {
      const err = new Error('A customer id, subscription id, and a user in session are required')
      return res.forbidden(err)
    }

    lib.Validator.validateSubscription.cancel(req.body)
      .then(values => {
        return SubscriptionService.cancel(req.body, subscriptionId)
      })
      .then(subscription => {
        if (!subscription) {
          throw new Error('Unexpected Error while Cancelling Subscription')
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscription)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('SubscriptionController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  subscriptionAddItems(req, res) {
    const SubscriptionService = this.app.services.SubscriptionService
    const subscriptionId = req.params.subscription
    let customerId = req.params.id

    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }

    if (!customerId || !subscriptionId ||  !req.user) {
      const err = new Error('A customer id, subscription id, and a user in session are required')
      return res.forbidden(err)
    }


    lib.Validator.validateSubscription.addItems(req.body)
      .then(values => {
        return SubscriptionService.addItems(req.body, subscriptionId)
      })
      .then(subscription => {
        // console.log('ProductController.addItemsToSubscription',data)
        if (!subscription) {
          throw new Error('Unexpected Error while adding items')
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscription)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('ProductController.addItemsToSubscription', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  subscriptionRemoveItems(req, res) {
    const SubscriptionService = this.app.services.SubscriptionService
    const subscriptionId = req.params.subscription

    let customerId = req.params.id
    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId || !subscriptionId ||  !req.user) {
      const err = new Error('A customer id, subscription id, and a user in session are required')
      return res.forbidden(err)
    }

    lib.Validator.validateSubscription.removeItems(req.body)
      .then(values => {
        return SubscriptionService.removeItems(req.body, subscriptionId)
      })
      .then(subscription => {
        if (!subscription) {
          throw new Error('Unexpected Error while removing items')
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscription)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('ProductController.removeItemsFromSubscription', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  subscriptions(req, res) {
    // console.log('I WAS CALLED')
    const Subscription = this.app.orm['Subscription']
    let customerId = req.params.id

    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId && !req.user) {
      const err = new Error('A customer id and a user in session are required')
      return res.send(401,err)
    }

    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    Subscription.findAndCount({
      subscription: sort,
      where: {
        customer_id: customerId
      },
      offset: offset,
      limit: limit
    })
      .then(subscriptions => {
        this.app.services.ProxyEngineService.paginate(res, subscriptions.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, subscriptions.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  address(req, res) {
    const Address = this.app.orm['Address']
    const addressId = req.params.address
    let customerId = req.params.id

    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }

    if (!customerId || !addressId || !req.user) {
      const err = new Error('A customer id and a user in session are required')
      res.send(401, err)
    }

    Address.resolve(addressId)
      .then(address => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, address)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  addresses(req, res) {
    const Address = this.app.orm['Address']
    let customerId = req.params.id

    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }

    if (!customerId && !req.user) {
      const err = new Error('A customer id and a user in session are required')
      return res.send(401, err)
    }

    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    Address.findAndCount({
      order: sort,
      include: [{
        model: this.app.orm['Customer'],
        attributes: [
          'id',
          'shipping_address_id',
          'billing_address_id',
          'default_address_id'
        ],
        where: {
          id: customerId
        }
      }],
      offset: offset,
      limit: limit
    })
      .then(addresses => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, addresses.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, addresses.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  addAddress(req, res) {
    const CustomerService = this.app.services.CustomerService
    let customerId = req.params.id
    const addressId = req.params.address

    let type = null
    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }

    if (!customerId) {
      const err = new Error('A customer id is required')
      return res.serverError(err)
    }

    if (!req.body.customer) {
      req.body.customer = {}
    }
    if (!req.body.address) {
      req.body.address = {}
    }
    if (req.body.shipping_address) {
      type = 'shipping'
      req.body.address = req.body.shipping_address
      delete req.body.shipping_address
    }
    else if (req.body.billing_address) {
      type = 'billing'
      req.body.address = req.body.billing_address
      delete req.body.billing_address
    }
    else if (req.body.default_address) {
      type = 'default'
      req.body.address = req.body.default_address
      delete req.body.default_address
    }

    // If an addressId param was passed, set it as the id
    if (addressId) {
      req.body.address.id = addressId
    }

    // Set body variables just in case
    req.body.customer.id = customerId

    lib.Validator.validateAddress.add(req.body.address)
      .then(values => {
        return CustomerService.addAddress(req.body.customer, req.body.address, type)
      })
      .then(address => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, address)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CustomerController.update', err)
        return res.serverError(err)
      })

  }

  /**
   *
   * @param req
   * @param res
   */
  // TODO, resolve the address by id or token
  updateAddress(req, res) {
    const CustomerService = this.app.services.CustomerService
    const addressId = req.params.address
    let customerId = req.params.id
    let type = null

    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }

    if (!customerId || !addressId) {
      const err = new Error('A customer id, and an address id are required')
      return res.serverError(err)
    }

    if (!req.body.customer) {
      req.body.customer = {}
    }
    if (!req.body.address) {
      req.body.address = {}
    }

    if (req.body.shipping_address) {
      type = 'shipping'
      req.body.address = req.body.shipping_address
      delete req.body.shipping_address
    }
    else if (req.body.billing_address) {
      type = 'billing'
      req.body.address = req.body.billing_address
      delete req.body.billing_address
    }
    else if (req.body.default_address) {
      type = 'default'
      req.body.address = req.body.default_address
      delete req.body.default_address
    }

    // Set body variables just in case
    req.body.customer.id = customerId

    if (addressId) {
      req.body.address.id = addressId
    }

    lib.Validator.validateAddress.update(req.body.address)
      .then(values => {
        return CustomerService.updateAddress(req.body.customer, req.body.address, type)
      })
      .then(address => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, address)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CustomerController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  destroyAddress(req, res) {
    const CustomerService = this.app.services.CustomerService
    const addressId = req.params.address
    let customerId = req.params.id

    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId || !addressId) {
      const err = new Error('A customer id, and address id are required')
      return res.serverError(err)
    }
    if (!req.body.customer) {
      req.body.customer = {}
    }
    if (!req.body.address) {
      req.body.address = {}
    }

    // Set body variables just in case
    req.body.customer.id = customerId

    if (addressId) {
      req.body.address.id = addressId
    }

    lib.Validator.validateAddress.remove(req.body.address)
      .then(values => {
        return CustomerService.removeAddress(req.body.customer, req.body.address)
      })
      .then(address => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, address)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CustomerController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  source(req, res) {
    const Source = this.app.orm['Source']
    const sourceId = req.params.source
    let customerId = req.params.id
    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId || !sourceId || !req.user) {
      const err = new Error('A customer id and a user in session are required')
      res.send(401, err)

    }
    Source.resolve(sourceId)
      .then(source => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, source)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  sources(req, res) {
    const Source = this.app.orm['Source']
    let customerId = req.params.id

    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId && !req.user) {
      const err = new Error('A customer id and a user in session are required')
      return res.send(401, err)
    }

    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    Source.findAndCount({
      order: sort,
      where: {
        customer_id: customerId
      },
      offset: offset,
      limit: limit
    })
      .then(sources => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, sources.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, sources.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  /**
   *
   * @param req
   * @param res
   */
  addSource(req, res) {
    const CustomerService = this.app.services.CustomerService
    // const source = req.params.source
    let customerId = req.params.id
    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId || !req.user) {
      const err = new Error('A customer id and a user in session are required')
      return res.serverError(err)
    }
    if (!req.body.customer) {
      req.body.customer = {}
    }
    req.body.customer.id = customerId
    // req.body.source.id = source

    lib.Validator.validateSource.add(req.body.source)
      .then(values => {
        return CustomerService.createCustomerSource(req.body.customer, req.body.source)
      })
      .then(source => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, source)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CustomerController.update', err)
        return res.serverError(err)
      })

  }

  /**
   *
   * @param req
   * @param res
   */
  updateSource(req, res) {
    const CustomerService = this.app.services.CustomerService
    const sourceId = req.params.source
    let customerId = req.params.id
    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId || !req.user || !sourceId) {
      const err = new Error('A customer id, source id, and a user in session are required')
      return res.serverError(err)
    }
    if (!req.body.customer) {
      req.body.customer = {}
    }
    if (!req.body.source) {
      req.body.source = {}
    }

    // Set body variables just in case
    req.body.customer.id = customerId
    req.body.source.id = sourceId

    lib.Validator.validateSource.add(req.body.source)
      .then(values => {
        return CustomerService.updateCustomerSource(req.body.customer, req.body.source, req.body.source)
      })
      .then(source => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, source)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CustomerController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  destroySource(req, res) {
    const CustomerService = this.app.services.CustomerService
    const sourceId = req.params.source
    let customerId = req.params.id
    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId || !req.user || !sourceId) {
      const err = new Error('A customer id, source id, and a user in session are required')
      return res.serverError(err)
    }
    if (!req.body.customer) {
      req.body.customer = {}
    }
    if (!req.body.source) {
      req.body.source = {}
    }

    // Set body variables just in case
    req.body.customer.id = customerId
    req.body.source.id = sourceId

    lib.Validator.validateSource.remove(req.body.source)
      .then(values => {
        return CustomerService.removeCustomerSource(req.body.customer, req.body.source)
      })
      .then(source => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, source)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CustomerController.update', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  user(req, res) {
    const User = this.app.orm['User']
    const userId = req.params.user
    let customerId = req.params.id
    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId || !userId || !req.user) {
      const err = new Error('A customer id and a user in session are required')
      res.send(401, err)

    }
    User.findById(userId)
      .then(user => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, user)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  users(req, res) {
    const User = this.app.orm['User']
    let customerId = req.params.id

    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId && !req.user) {
      const err = new Error('A customer id or a user in session are required')
      return res.send(401, err)
    }

    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    User.findAndCount({
      // TODO fix for sqlite
      // order: sort,
      where: {
        '$customers.id$': customerId
      },
      include: [{
        model: this.app.orm['Customer'],
        as: 'customers',
        attributes: ['id']
      }],
      offset: offset
      // TODO sequelize breaks if limit is set here
      // limit: limit
    })
      .then(users => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, users.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, users.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  addTag(req, res){
    const CustomerService = this.app.services.CustomerService
    CustomerService.addTag(req.params.id, req.params.tag)
      .then(tag => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, tag)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CustomerController.addTag', err)
        return res.serverError(err)
      })
  }

  tags(req, res) {
    const Tag = this.app.orm['Tag']
    let customerId = req.params.id

    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId && !req.user) {
      const err = new Error('A customer id or a user in session are required')
      return res.send(401, err)
    }

    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    Tag.findAndCount({
      // TODO fix for sqlite
      include: [{
        model: this.app.orm['Customer'],
        as: 'customers',
        attributes: ['id'],
        where: {
          id: customerId
        }
      }],
      offset: offset,
      // TODO sequelize breaks if limit is set here
      limit: limit,
      order: sort
    })
      .then(tags => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, tags.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, tags.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  /**
   *
   * @param req
   * @param res
   */
  removeTag(req, res){
    const CustomerService = this.app.services.CustomerService
    CustomerService.removeTag(req.params.id, req.params.tag)
      .then(tag => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, tag)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CustomerController.removeTag', err)
        return res.serverError(err)
      })
  }
  /**
   * add a customer to a collection
   * @param req
   * @param res
   */
  addCollection(req, res){
    const CustomerService = this.app.services.CustomerService
    CustomerService.addCollection(req.params.id, req.params.collection)
      .then(collection => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CustomerController.addCollection', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  collections(req, res) {
    const Collection = this.app.orm['Collection']
    let customerId = req.params.id

    if (!customerId && req.user) {
      customerId = req.user.current_customer_id
    }
    if (!customerId && !req.user) {
      const err = new Error('A customer id or a collection in session are required')
      return res.send(401, err)
    }

    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]
    Collection.findAndCount({
      // TODO fix for sqlite
      include: [{
        model: this.app.orm['Customer'],
        as: 'customers',
        attributes: ['id'],
        where: {
          id: customerId
        }
      }],
      offset: offset,
      // TODO sequelize breaks if limit is set here
      limit: limit,
      order: sort
    })
      .then(collections => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, collections.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collections.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
  /**
   * remove a customer from a collection
   * @param req
   * @param res
   */
  removeCollection(req, res){
    const CustomerService = this.app.services.CustomerService
    CustomerService.removeCollection(req.params.id, req.params.collection)
      .then(collection => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, collection)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        // console.log('CustomerController.removeCollection', err)
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  event(req, res) {
    const Event = this.app.orm['Event']
    const eventId = req.params.event
    const customerId = req.params.id

    if (!customerId || !eventId || !req.user) {
      const err = new Error('A customer id and a user in session are required')
      res.send(401, err)

    }
    Event.findById(eventId)
      .then(event => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, event)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  events(req, res) {
    const Event = this.app.orm['Event']
    const customerId = req.params.id

    if (!customerId && !req.user) {
      const err = new Error('A customer id and a user in session are required')
      return res.send(401, err)
    }

    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    Event.findAndCount({
      order: sort,
      where: {
        object_id: customerId,
        object: 'customer'
      },
      offset: offset,
      limit: limit
    })
      .then(events => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, events.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, events.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  destroyEvent(req, res) {
    const Event = this.app.orm['Event']
    const eventId = req.params.event
    const customerId = req.params.id

    if (!customerId || !eventId || !req.user) {
      const err = new Error('A customer id and a user in session are required')
      res.send(401, err)

    }
    Event.findById(eventId)
      .then(event => {
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, event)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  reviews(req, res) {
    const Review = this.app.orm['Review']
    const customerId = req.params.id

    if (!customerId) {
      const err = new Error('A customer id is required')
      return res.send(401, err)
    }

    const limit = Math.max(0,req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || [['created_at', 'DESC']]

    Review.findAndCount({
      order: sort,
      where: {
        customer_id: customerId
      },
      offset: offset,
      limit: limit
    })
      .then(reviews => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, reviews.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, reviews.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  hasPuchasedProduct(req, res) {
    if (!req.customer) {
      const err = new Error('A customer must be logged in')
      return res.send(401, err)
    }
  }

  isSubscribedToProduct(req, res) {
    if (!req.customer) {
      const err = new Error('A customer must be logged in')
      return res.send(401, err)
    }
  }
}
