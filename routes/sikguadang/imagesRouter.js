const express = require('express');
const Promise = require('bluebird');
const multer = require('multer');
const shortId = require('shortid');
const sizeOf = require('image-size');
const awsKor = require('aws-sdk');
awsKor.config.update(config.aws.kor);

const router = express.Router();
const s3 = new awsKor.S3();

const preProcessingUtils = require('../../utils/preProcessingUtils');
const authUtils = require('../../utils/authUtils');

router.post('/', function(req, res, next) {
  preProcessingUtils
    .initData(req, true)
    .then(authUtils.getAuthorIdByToken)
    .then(function(data) {
      next();
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

const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

router.post('/', upload.array('images'), function(req, res, next) {
  const promiseArray = [];
  req.files.forEach(function(fileObj, index) {
    promiseArray.push(getPromiseToSendS3(fileObj));
  });
  Promise.all(promiseArray)
    .then(function(data) {
      res.json(data);
    })
    .catch(function(ex) {
      if (ex instanceof Error) {
        log.error(ex.message);
        log.error(ex.stack);
        res
          .status(responceCode.internalError.status)
          .json(responceCode.internalError.detail);
      } else {
        res.status(ex.status).json(ex.detail);
      }
    });
});
function getPromiseToSendS3(fileObj) {
  return new Promise(function(resolve, reject) {
    const fileInfoObject = sizeOf(fileObj.buffer);
    const type = fileInfoObject.type;
    const ext = apiConst.delimiter.dot + type;
    const key =
      apiConst.fileMetaCode.temp +
      apiConst.delimiter.slash +
      fileInfoObject.width +
      apiConst.delimiter.slash +
      fileInfoObject.height +
      apiConst.delimiter.slash +
      fileObj.size +
      apiConst.delimiter.slash +
      shortId.generate() +
      ext;
    const s3Params = {};
    s3Params.Key = key;
    s3Params.Bucket = config.aws.s3.tempBucket;
    s3Params.ContentType = fileObj.mimetype;
    s3Params.Body = fileObj.buffer;

    s3.upload(s3Params).send(function(err, data) {
      if (err) return reject(err);
      return resolve(key);
    });
  });
}

module.exports = router;
