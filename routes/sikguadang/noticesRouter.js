const express = require('express');
const _ = require('lodash');
const Promise = require('bluebird');
const moment = require('moment');
const shortIdGenerator = require('shortid');
const awsKor = require('aws-sdk');

awsKor.config.update(config.aws.kor);

const s3 = new awsKor.S3();
const router = express.Router();

const NoticesDocument = require('../../models/documents/sikguadang/noticesDocument');
const FileMetaDocument = require('../../models/documents/sikguadang/fileMetasDocument');
const preProcessingUtils = require('../../utils/preProcessingUtils');
const authUtils = require('../../utils/authUtils');

router.get('/', function(req, res, next) {
  preProcessingUtils
    .initData(req, false)
    .then(authUtils.getAuthorIdByToken)
    .then(getNoticesList)
    .then(function(data) {
      res.json(data.noticeArray);
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
function getNoticesList(data) {
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
    const isMine = util.isNullOrUndefined(data.query.isMine)
      ? false
      : data.query.isMine === 'true';

    const query = {};
    if (isMine) {
      query.authorId = data.authorId;
    }
    NoticesDocument.find(query)
      .populate('authorId')
      .limit(limit)
      .skip(offset)
      .sort(sort)
      .exec(function(err, noticesDocument) {
        if (err) return reject(err);
        const noticeArray = [];
        for (let i in noticesDocument) {
          const notice = {};
          notice.noticeId = noticesDocument[i]._id;
          notice.title = noticesDocument[i].title;
          notice.text = noticesDocument[i].text;
          notice.imageCards = noticesDocument[i].imageCards;
          notice.author = {};
          notice.author.authorName = noticesDocument[i].authorId.authorName;
          notice.status = noticesDocument[i].status;
          notice.sdate = noticesDocument[i].sdate;
          notice.cdate = noticesDocument[i].cdate;
          noticeArray.push(notice);
        }
        data.noticeArray = noticeArray;
        return resolve(data);
      });
  });
}

router.get('/:noticeId', function(req, res, next) {
  preProcessingUtils
    .initData(req, true)
    .then(authUtils.getAuthorIdByToken)
    .then(getNotice)
    .then(function(data) {
      res.json(data.notice);
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
function getNotice(data) {
  return new Promise(function(resolve, reject) {
    const query = {};
    NoticesDocument.findById(data.params.noticeId, function(
      err,
      noticeDocument
    ) {
      if (err) return reject(err);
      const notice = {};
      notice.noticeId = noticeDocument._id;
      notice.title = noticeDocument.title;
      notice.text = noticeDocument.text;
      notice.imageCards = noticeDocument.imageCards;
      notice.status = noticeDocument.status;
      notice.sdate = noticeDocument.sdate;
      data.notice = notice;
      return resolve(data);
    });
  });
}

router.post('/', function(req, res, next) {
  preProcessingUtils
    .initData(req, true)
    .then(authUtils.getAuthorIdByToken)
    .then(createNotice)
    .then(moveNoticeTempImage)
    .then(assembleNoticeByDocument)
    .then(function(data) {
      res.json(data.notice);
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
function createNotice(data) {
  return new Promise(function(resolve, reject) {
    const notice = data.body.notice;
    const noticeDocument = new NoticesDocument();
    noticeDocument.title = notice.title ? notice.title : '';
    noticeDocument.text = notice.text ? notice.text : '';
    noticeDocument.imageCards = notice.imageCards ? notice.imageCards : null;
    noticeDocument.status = notice.status
      ? notice.status
      : apiConst.status.delete;
    noticeDocument.sdate = notice.sdate ? moment(notice.sdate).utc() : null;
    noticeDocument.cdate = new Date();
    noticeDocument.edate = new Date();
    noticeDocument.authorId = data.authorId;

    noticeDocument.save(function(err, result) {
      if (err) return reject(err);
      data.noticeDocument = result;
      return resolve(data);
    });
  });
}
function moveNoticeTempImage(data) {
  const notice = data.body.notice;
  const promiseArray = [];
  promiseArray.push(
    batchMoveCardsTempImage(
      notice.imageCards,
      apiConst.collectionName.notice,
      data.noticeDocument._id,
      apiConst.fileMetaCode.image
    )
  );
  return new Promise.all(promiseArray).then(function(resultKeyArray) {
    return new Promise(function(resolve, reject) {
      const deleteImageJsonArray = [];
      const noticeDocument = data.noticeDocument;
      if (!_.isEqual(noticeDocument.imageCards, resultKeyArray[0])) {
        noticeDocument.imageCards.forEach(function(card, index) {
          if (card.imageUrl.startsWith(apiConst.fileMetaCode.image)) {
            deleteImageJsonArray.push(
              getJsonForDeleteImage(
                apiConst.collectionName.notice,
                noticeDocument._id,
                card.imageUrl
              )
            );
          }
        });
        noticeDocument.imageCards = resultKeyArray[0];
      }

      noticeDocument.save(function(err, updateNoticeResult) {
        if (err) return reject(err);
        data.noticeDocument = updateNoticeResult;
        data.deleteImageJsonArray = data.deleteImageJsonArray
          ? data.deleteImageJsonArray.concat(deleteImageJsonArray)
          : [];
        return resolve(data);
      });
    });
  });
}
function moveTempImageToServiceBucket(
  tempKey,
  collectionName,
  documentId,
  fileMetaCode
) {
  return new Promise(function(resolve, reject) {
    if (tempKey && tempKey.startsWith(apiConst.fileMetaCode.temp)) {
      const tempKeyInfoArray = tempKey.split('/');
      const tempKeyExt = tempKey.split('.');

      const serviceKey =
        fileMetaCode +
        apiConst.delimiter.slash +
        moment().format('YYYY') +
        apiConst.delimiter.slash +
        moment().format('MM') +
        apiConst.delimiter.slash +
        moment().format('DD') +
        apiConst.delimiter.slash +
        fileMetaCode +
        apiConst.delimiter.underscore +
        documentId +
        apiConst.delimiter.underscore +
        +moment() +
        apiConst.delimiter.dot +
        tempKeyExt[1];

      const s3params = {};
      s3params.Bucket = config.aws.s3.serviceBucket;
      s3params.Key = serviceKey;
      s3params.CopySource =
        config.aws.s3.tempBucket + apiConst.delimiter.slash + tempKey;

      s3.copyObject(s3params, function(err, copyData) {
        if (err) return reject(err);
        const fileMetaDocument = new FileMetaDocument();
        fileMetaDocument.code = fileMetaCode;
        fileMetaDocument.fileKey = serviceKey;
        fileMetaDocument.collectionName = collectionName;
        fileMetaDocument.documentId = documentId;
        fileMetaDocument.width = tempKeyInfoArray[1];
        fileMetaDocument.height = tempKeyInfoArray[2];
        fileMetaDocument.size = tempKeyInfoArray[3];
        fileMetaDocument.save(function(err, fileMetaResult) {
          if (err) {
            log.warning('file meta save failure.');
            log.warning(err.message);
            log.warning(err.stack);
          }
        });
        return resolve(serviceKey);
      });
    } else {
      return resolve(tempKey);
    }
  });
}
function batchMoveCardsTempImage(
  cardArray,
  collectionName,
  documentId,
  fileMetaCode
) {
  const promiseArray = [];
  const newCardArray = [];
  if (cardArray && cardArray.length > 0) {
    cardArray.forEach(function(card, index) {
      promiseArray.push(
        moveTempImageToServiceBucket(
          card.imageUrl,
          collectionName,
          documentId,
          fileMetaCode
        )
      );
    });
    return new Promise.all(promiseArray).then(function(results) {
      cardArray.forEach(function(card, index, cardArray) {
        const newCard = {};
        newCard.type = cardArray[index].type;
        newCard.imageUrl = results[index];
        newCardArray.push(newCard);
      });
      return new Promise(function(resolve, reject) {
        return resolve(newCardArray);
      });
    });
  } else {
    return new Promise.resolve(cardArray);
  }
}
function assembleNoticeByDocument(data) {
  return new Promise(function(resolve, reject) {
    const notice = {};
    notice.noticeId = data.noticeDocument._id;
    notice.title = data.noticeDocument.title;
    notice.text = data.noticeDocument.text;
    notice.imageCards = data.noticeDocument.imageCards;
    notice.status = data.noticeDocument.status;
    notice.sdate = data.noticeDocument.sdate;
    notice.cdate = data.noticeDocument.cdate;
    notice.edate = data.noticeDocument.edate;
    notice.authorId = data.noticeDocument.authorId;
    data.notice = notice;
    return resolve(data);
  });
}

router.put('/:noticeId', function(req, res, next) {
  preProcessingUtils
    .initData(req, true)
    .then(authUtils.getAuthorIdByToken)
    .then(updateNotice)
    .then(moveNoticeTempImage)
    .then(removeDeletedImages)
    .then(assembleNoticeByDocument)
    .then(function(data) {
      res.json(data.notice);
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
function updateNotice(data) {
  return new Promise(function(resolve, reject) {
    const noticeId = data.params.noticeId;
    const notice = data.body.notice;
    NoticesDocument.findById(noticeId).exec(function(err, noticeDocument) {
      if (err) return reject(err);
      if (!noticeDocument) return reject(responseCode.resourceNotFound);
      noticeDocument.title = notice.title ? notice.title : '';
      noticeDocument.text = notice.text ? notice.text : '';
      noticeDocument.imageCards = notice.imageCards ? notice.imageCards : null;
      noticeDocument.status = notice.status
        ? notice.status
        : apiConst.status.delete;
      noticeDocument.sdate = notice.sdate ? moment(notice.sdate).utc() : null;
      noticeDocument.edate = new Date();

      noticeDocument.save(function(err, updateNoticeResult) {
        if (err) return reject(err);
        data.noticeDocument = updateNoticeResult;
        return resolve(data);
      });
    });
  });
}
function getJsonForDeleteImage(collectionName, documentId, fileKey) {
  const deleteImageJson = {};
  deleteImageJson.collectionName = collectionName;
  deleteImageJson.documentId = documentId;
  deleteImageJson.fileKey = fileKey;
  return deleteImageJson;
}
function removeDeletedImages(data) {
  return new Promise(function(resolve, reject) {
    const deleteImageJsonArray = [];
    data.deleteImageJsonArray = data.deleteImageJsonArray
      ? data.deleteImageJsonArray.concat(deleteImageJsonArray)
      : [];
    removeImagesFromService(data.deleteImageJsonArray);
    return resolve(data);
  });
}
function removeImagesFromService(deleteImageJsonArray) {
  return new Promise(function(resolve, reject) {
    if (deleteImageJsonArray.length > 0) {
      const removeFileMetaPromiseArray = [];
      const removeFileKeyArray = [];
      deleteImageJsonArray.forEach(function(deleteImageJson, index) {
        if (deleteImageJson.fileKey !== null) {
          const keyJson = {};
          keyJson.key = deleteImageJson.fileKey;
          removeFileKeyArray.push(keyJson);
          removeFileMetaPromiseArray.push(
            removeFileMeta(
              deleteImageJson.collectionName,
              deleteImageJson.documentId,
              deleteImageJson.fileKey
            )
          );
        }
      });
      if (removeFileKeyArray.length > 0) {
        const s3params = {};
        s3params.Bucket = config.aws.s3.serviceBucket;
        s3params.delete = {
          Objects: removeFileKeyArray
        };
        s3.deleteObjects(s3params, function(err, deleteResult) {
          if (err) {
            log.warning('delete s3 object failure!');
            log.warning(err.message);
            log.warning(err.stack);
          } else {
            new Promise.all(removeFileMetaPromiseArray);
          }
        });
      }
    }
  });
}
function removeFileMeta(collectionName, documentId, fileKey) {
  return new Promise(function(resolve, reject) {
    FileMetaDocument.remove(
      {
        collectionName: collectionName,
        documentId: documentId,
        fileKey: fileKey
      },
      function(err, removeResult) {
        if (err) {
          log.warning('remove filemeta failure!, filekey: ' + fileKey);
          log.warning(err.message);
          log.warning(err.stack);
        }
      }
    );
  });
}

module.exports = router;
