const express = require('express');
const Promise = require('bluebird');
const moment = require('moment');

const router = express.Router();

const InquiriesDocument = require('../../models/documents/sikguadang/inquiriesDocument');
const preProcessingUtils = require('../../utils/preProcessingUtils');
const authUtils = require('../../utils/authUtils');

router.get('/', function(req, res, next) {
  preProcessingUtils
    .initData(req, false)
    .then(authUtils.getAuthorIdByToken)
    .then(getInquiriesList)
    .then(function(data) {
      res.json(data.inquiryArray);
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
function getInquiriesList(data) {
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

    InquiriesDocument.find({
      status: apiConst.status.active,
      cdate: { $lte: data.now }
    })
      .limit(limit)
      .skip(offset)
      .sort(sort)
      .exec(function(err, inquiriesDocument) {
        if (err) return reject(err);
        const inquiryArray = [];
        for (let i in inquiriesDocument) {
          const inquiry = {};
          inquiry.inquiryId = inquiriesDocument[i]._id;
          inquiry.title = inquiriesDocument[i].title;
          inquiry.text = inquiriesDocument[i].text;
          inquiry.answer = inquiriesDocument[i].answer;
          inquiry.status = inquiriesDocument[i].status;
          inquiry.sdate = inquiriesDocument[i].sdate;
          inquiry.cdate = inquiriesDocument[i].cdate;
          inquiryArray.push(inquiry);
        }
        data.inquiryArray = inquiryArray;
        return resolve(data);
      });
  });
}

router.get('/:inquiryId', function(req, res, next) {
  preProcessingUtils
    .initData(req, true)
    .then(authUtils.getAuthorIdByToken)
    .then(getInquiry)
    .then(function(data) {
      res.json(data.inquiry);
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
function getInquiry(data) {
  return new Promise(function(resolve, reject) {
    const query = {};
    InquiriesDocument.findById(data.params.inquiryId, function(
      err,
      inquiryDocument
    ) {
      if (err) return reject(err);
      const inquiry = {};
      inquiry.inquiryId = inquiryDocument._id;
      inquiry.number = inquiryDocument.number;
      inquiry.title = inquiryDocument.title;
      inquiry.text = inquiryDocument.text;
      inquiry.userName = inquiryDocument.userName;
      inquiry.cdate = inquiryDocument.cdate;
      inquiry.answer = inquiryDocument.answer;
      data.inquiry = inquiry;
      return resolve(data);
    });
  });
}

router.put('/:inquiryId', function(req, res, next) {
  preProcessingUtils
    .initData(req, true)
    .then(authUtils.getAuthorIdByToken)
    .then(updateInquiry)
    .then(assembleInquiryByDocument)
    .then(function(data) {
      res.json(data.inquiry);
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
function updateInquiry(data) {
  return new Promise(function(resolve, reject) {
    console.log(data);
    const inquiryId = data.params.inquiryId;
    const answer = data.body.answer;
    InquiriesDocument.findById(inquiryId).exec(function(err, inquiryDocument) {
      if (err) return reject(err);
      if (!inquiryDocument) return reject(responseCode.resourceNotFound);
      inquiryDocument.answer.authorName = answer.authorName
        ? answer.authorName
        : '';
      inquiryDocument.answer.text = answer.text ? answer.text : '';
      inquiryDocument.answer.answerDate = answer.answerDate
        ? moment(answer.answerDate).utc()
        : null;

      inquiryDocument.save(function(err, updateInquiryResult) {
        if (err) return reject(err);
        data.inquiryDocument = updateInquiryResult;
        return resolve(data);
      });
    });
  });
}
function assembleInquiryByDocument(data) {
  return new Promise(function(resolve, reject) {
    const inquiry = {};
    inquiry.answer = data.inquiryDocument.answer;
    data.inquiry = inquiry;
    return resolve(data);
  });
}

module.exports = router;
