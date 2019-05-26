const express = require('express');
const Promise = require('bluebird');
const router = express.Router();

const OrdersDocument = require('../../models/documents/sikguadang/ordersDocument');
const preProcessingUtils = require('../../utils/preProcessingUtils');
const authUtils = require('../../utils/authUtils');

router.get('/', function(req, res, next) {
  preProcessingUtils
    .initData(req, false)
    .then(authUtils.getAuthorIdByToken)
    .then(getOrderList)
    .then(function(data) {
      res.json(data.orderArray);
    })
    .catch(function(ex) {
      if (ex instanceof Error) {
        log.error(ex.message);
        log.error(ex.stack);
        res
          .status(responseCode.internalError.status)
          .json(responseCode.internalError.detail);
      } else {
        res.status(ex.status).json(ex.detail);
      }
    });
});
function getOrderList(data) {
  return new Promise(function(resolve, reject) {
    const limit = util.isNullOrUndefined(data.query.limit)
      ? 20
      : parseInt(data.query.limit);
    const offset = util.isNullOrUndefined(data.query.offset)
      ? 0
      : parseInt(data.query.offset);
    const sort = util.isNullOrUndefined(data.query.sort)
      ? '-cdate'
      : data.query.sort;

    OrdersDocument.find({
      cdate: { $lte: data.now }
    })
      .limit(limit)
      .skip(offset)
      .sort(sort)
      .exec(function(err, ordersDocument) {
        if (err) return reject(err);
        const orderArray = [];
        for (let i in ordersDocument) {
          const order = {};
          order.orderId = ordersDocument[i]._id;
          order.userId = ordersDocument[i].userId;
          order.userName = ordersDocument[i].userName;
          order.postcode = ordersDocument[i].postcode;
          order.address = ordersDocument[i].address;
          order.addressDetail = ordersDocument[i].addressDetail;
          order.recipientName = ordersDocument[i].recipientName;
          order.recipientPhoneNumber = ordersDocument[i].recipientPhoneNumber;
          order.productName = ordersDocument[i].productName;
          order.productImage = ordersDocument[i].productImage;
          order.optionItemName = ordersDocument[i].optionItemName;
          order.optionItemPrice = ordersDocument[i].optionItemPrice;
          order.price = ordersDocument[i].price;
          order.discountPrice = ordersDocument[i].discountPrice;
          order.totalPrice = ordersDocument[i].totalPrice;
          order.productQty = ordersDocument[i].productQty;
          order.deliveryDate = ordersDocument[i].deliveryDate;
          order.purchaseMethod = ordersDocument[i].purchaseMethod;
          order.imp_uid = ordersDocument[i].imp_uid;
          order.merchant_uid = ordersDocument[i].merchant_uid;
          order.status = ordersDocument[i].status;
          order.cdate = ordersDocument[i].cdate;

          orderArray.push(order);
        }
        data.orderArray = orderArray;
        return resolve(data);
      });
  });
}

router.get('/:orderId', function(req, res, next) {
  preProcessingUtils
    .initData(req, true)
    .then(authUtils.getAuthorIdByToken)
    .then(getOrder)
    .then(function(data) {
      res.json(data.order);
    })
    .catch(function(err) {
      if (err instanceof Error) {
        log.error(err.message);
        log.error(err.stack);
        res
          .status(responseCode.internalError.status)
          .json(responseCode.internalError.detail);
      } else {
        res.status(err.status).json(err.detail);
      }
    });
});
function getOrder(data) {
  return new Promise(function(resolve, reject) {
    OrdersDocument.findById(data.params.orderId, function(err, orderDocument) {
      if (err) return reject(err);
      const order = {};
      order.orderId = orderDocument._id;
      order.userId = orderDocument.userId;
      order.userName = orderDocument.userName;
      order.postcode = orderDocument.postcode;
      order.address = orderDocument.address;
      order.addressDetail = orderDocument.addressDetail;
      order.recipientName = orderDocument.recipientName;
      order.recipientPhoneNumber = orderDocument.recipientPhoneNumber;
      order.productName = orderDocument.productName;
      order.productImage = orderDocument.productImage;
      order.optionItemName = orderDocument.optionItemName;
      order.optionItemPrice = orderDocument.optionItemPrice;
      order.price = orderDocument.price;
      order.discountPrice = orderDocument.discountPrice;
      order.totalPrice = orderDocument.totalPrice;
      order.productQty = orderDocument.productQty;
      order.deliveryDate = orderDocument.deliveryDate;
      order.purchaseMethod = orderDocument.purchaseMethod;
      order.imp_uid = orderDocument.imp_uid;
      order.merchant_uid = orderDocument.merchant_uid;
      order.status = orderDocument.status;
      order.cdate = orderDocument.cdate;
      data.order = order;
      return resolve(data);
    });
  });
}

module.exports = router;
