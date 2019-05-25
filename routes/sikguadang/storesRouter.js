const express = require('express');
const _ = require('lodash');
const Promise = require('bluebird');
const moment = require('moment');
const shortIdGenerator = require('shortid');
const awsKor = require('aws-sdk');

awsKor.config.update(config.aws.kor);

const s3 = new awsKor.S3();
const router = express.Router();

const StoreItemsDocument = require('../../models/documents/sikguadang/storeItemsDocument');
const FileMetaDocument = require('../../models/documents/sikguadang/fileMetasDocument');
const preProcessingUtils = require('../../utils/preProcessingUtils');
const authUtils = require('../../utils/authUtils');

router.get('/', function(req, res, next) {
  preProcessingUtils
    .initData(req, false)
    .then(authUtils.getAuthorIdByToken)
    .then(getStoreItemsList)
    .then(function(data) {
      res.json(data.storeItemArray);
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
function getStoreItemsList(data) {
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
    StoreItemsDocument.find(query)
      .populate('authorId')
      .limit(limit)
      .skip(offset)
      .sort(sort)
      .exec(function(err, storeItemsDocument) {
        if (err) return reject(err);
        const storeItemArray = [];
        for (let i in storeItemsDocument) {
          const storeItem = {};
          storeItem.storeItemId = storeItemsDocument[i]._id;
          storeItem.title = storeItemsDocument[i].title;
          storeItem.description = storeItemsDocument[i].description;
          storeItem.thumbnailUrl = storeItemsDocument[i].thumbnailUrl;
          storeItem.price = storeItemsDocument[i].price;
          storeItem.discountPrice = storeItemsDocument[i].discountPrice;
          storeItem.optionItem1Name = storeItemsDocument[i].optionItem1Name;
          storeItem.optionItem1Price = storeItemsDocument[i].optionItem1Price;
          storeItem.optionItem2Name = storeItemsDocument[i].optionItem2Name;
          storeItem.optionItem2Price = storeItemsDocument[i].optionItem2Price;
          storeItem.optionItem3Name = storeItemsDocument[i].optionItem3Name;
          storeItem.optionItem3Price = storeItemsDocument[i].optionItem3Price;
          storeItem.optionItem4Name = storeItemsDocument[i].optionItem4Name;
          storeItem.optionItem4Price = storeItemsDocument[i].optionItem4Price;
          storeItem.weight = storeItemsDocument[i].weight;
          storeItem.expirationDate = storeItemsDocument[i].expirationDate;
          storeItem.category = storeItemsDocument[i].category;
          storeItem.soldOut = storeItemsDocument[i].soldOut;
          storeItem.limited = storeItemsDocument[i].limited;
          storeItem.hot = storeItemsDocument[i].hot;
          storeItem.new = storeItemsDocument[i].new;
          storeItem.author = {};
          storeItem.author.authorName =
            storeItemsDocument[i].authorId.authorName;
          storeItem.status = storeItemsDocument[i].status;
          storeItem.sdate = storeItemsDocument[i].sdate;
          storeItem.cdate = storeItemsDocument[i].cdate;
          storeItem.productDetailCards =
            storeItemsDocument[i].productDetailCards;
          storeItem.productInfoCards = storeItemsDocument[i].productInfoCards;
          storeItemArray.push(storeItem);
        }
        data.storeItemArray = storeItemArray;
        return resolve(data);
      });
  });
}

router.get('/:storeItemId', function(req, res, next) {
  preProcessingUtils
    .initData(req, true)
    .then(authUtils.getAuthorIdByToken)
    .then(getStoreItem)
    .then(function(data) {
      res.json(data.storeItem);
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
function getStoreItem(data) {
  return new Promise(function(resolve, reject) {
    const query = {};
    StoreItemsDocument.findById(data.params.storeItemId, function(
      err,
      storeItemDocument
    ) {
      if (err) return reject(err);
      const storeItem = {};
      storeItem.storeItemId = storeItemDocument._id;
      storeItem.title = storeItemDocument.title;
      storeItem.description = storeItemDocument.description;
      storeItem.thumbnailUrl = storeItemDocument.thumbnailUrl;
      storeItem.price = storeItemDocument.price;
      storeItem.discountPrice = storeItemDocument.discountPrice;
      storeItem.optionItem1Name = storeItemDocument.optionItem1Name;
      storeItem.optionItem1Price = storeItemDocument.optionItem1Price;
      storeItem.optionItem2Name = storeItemDocument.optionItem2Name;
      storeItem.optionItem2Price = storeItemDocument.optionItem2Price;
      storeItem.optionItem3Name = storeItemDocument.optionItem3Name;
      storeItem.optionItem3Price = storeItemDocument.optionItem3Price;
      storeItem.optionItem4Name = storeItemDocument.optionItem4Name;
      storeItem.optionItem4Price = storeItemDocument.optionItem4Price;
      storeItem.weight = storeItemDocument.weight;
      storeItem.expirationDate = storeItemDocument.expirationDate;
      storeItem.category = storeItemDocument.category;
      storeItem.soldOut = storeItemDocument.soldOut;
      storeItem.limited = storeItemDocument.limited;
      storeItem.hot = storeItemDocument.hot;
      storeItem.new = storeItemDocument.new;
      storeItem.status = storeItemDocument.status;
      storeItem.sdate = storeItemDocument.sdate;
      storeItem.productDetailCards = storeItemDocument.productDetailCards;
      storeItem.productInfoCards = storeItemDocument.productInfoCards;
      data.storeItem = storeItem;
      return resolve(data);
    });
  });
}

router.post('/', function(req, res, next) {
  preProcessingUtils
    .initData(req, true)
    .then(authUtils.getAuthorIdByToken)
    .then(createStoreItem)
    .then(moveStoreItemTempImage)
    .then(assembleStoreItemByDocument)
    .then(function(data) {
      res.json(data.storeItem);
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
function createStoreItem(data) {
  return new Promise(function(resolve, reject) {
    const storeItem = data.body.storeItem;
    const storeItemDocument = new StoreItemsDocument();
    storeItemDocument.title = storeItem.title ? storeItem.title : '';
    storeItemDocument.description = storeItem.description
      ? storeItem.description
      : '';
    storeItemDocument.thumbnailUrl = storeItem.thumbnailUrl
      ? storeItem.thumbnailUrl
      : null;
    storeItemDocument.price = storeItem.price ? storeItem.price : null;
    storeItemDocument.discountPrice = storeItem.discountPrice
      ? storeItem.discountPrice
      : null;
    storeItemDocument.optionItem1Name = storeItem.optionItem1Name
      ? storeItem.optionItem1Name
      : '';
    storeItemDocument.optionItem1Price = storeItem.optionItem1Price
      ? storeItem.optionItem1Price
      : 0;
    storeItemDocument.optionItem2Name = storeItem.optionItem2Name
      ? storeItem.optionItem2Name
      : '';
    storeItemDocument.optionItem2Price = storeItem.optionItem2Price
      ? storeItem.optionItem2Price
      : 0;
    storeItemDocument.optionItem3Name = storeItem.optionItem3Name
      ? storeItem.optionItem3Name
      : '';
    storeItemDocument.optionItem3Price = storeItem.optionItem3Price
      ? storeItem.optionItem3Price
      : 0;
    storeItemDocument.optionItem4Name = storeItem.optionItem4Name
      ? storeItem.optionItem4Name
      : '';
    storeItemDocument.optionItem4Price = storeItem.optionItem4Price
      ? storeItem.optionItem4Price
      : 0;
    storeItemDocument.weight = storeItem.weight ? storeItem.weight : '';
    storeItemDocument.expirationDate = storeItem.expirationDate
      ? storeItem.expirationDate
      : '';
    storeItemDocument.category = storeItem.category ? storeItem.category : null;
    storeItemDocument.soldOut = storeItem.soldOut ? true : false;
    storeItemDocument.limited = storeItem.limited ? true : false;
    storeItemDocument.hot = storeItem.hot ? true : false;
    storeItemDocument.new = storeItem.new ? true : false;
    storeItemDocument.status = storeItem.status
      ? storeItem.status
      : apiConst.status.delete;
    storeItemDocument.sdate = storeItem.sdate
      ? moment(storeItem.sdate).utc()
      : null;
    storeItemDocument.cdate = new Date();
    storeItemDocument.edate = new Date();
    storeItemDocument.productDetailCards = storeItem.productDetailCards
      ? storeItem.productDetailCards
      : null;
    storeItemDocument.productInfoCards = storeItem.productInfoCards
      ? storeItem.productInfoCards
      : null;
    storeItemDocument.authorId = data.authorId;

    storeItemDocument.save(function(err, result) {
      if (err) return reject(err);
      data.storeItemDocument = result;
      return resolve(data);
    });
  });
}
function moveStoreItemTempImage(data) {
  const storeItem = data.body.storeItem;
  const promiseArray = [];
  promiseArray.push(
    batchMoveCardsTempImage(
      storeItem.thumbnailUrl,
      apiConst.collectionName.storeItem,
      data.storeItemDocument._id,
      apiConst.fileMetaCode.thumbnail
    )
  );
  promiseArray.push(
    batchMoveCardsTempImage(
      storeItem.productDetailCards,
      apiConst.collectionName.storeItem,
      data.storeItemDocument._id,
      apiConst.fileMetaCode.image
    )
  );
  promiseArray.push(
    batchMoveCardsTempImage(
      storeItem.productInfoCards,
      apiConst.collectionName.storeItem,
      data.storeItemDocument._id,
      apiConst.fileMetaCode.image
    )
  );
  return new Promise.all(promiseArray).then(function(resultKeyArray) {
    return new Promise(function(resolve, reject) {
      const deleteImageJsonArray = [];
      const storeItemDocument = data.storeItemDocument;
      if (!_.isEqual(storeItemDocument.thumbnailUrl, resultKeyArray[0])) {
        storeItemDocument.thumbnailUrl.forEach(function(card, index) {
          if (card.imageUrl.startsWith(apiConst.fileMetaCode.image)) {
            deleteImageJsonArray.push(
              getJsonForDeleteImage(
                apiConst.collectionName.storeItem,
                storeItemDocument._id,
                card.imageUrl
              )
            );
          }
        });
        storeItemDocument.thumbnailUrl = resultKeyArray[0];
      }

      if (!_.isEqual(storeItemDocument.productDetailCards, resultKeyArray[1])) {
        storeItemDocument.productDetailCards.forEach(function(card, index) {
          if (card.imageUrl.startsWith(apiConst.fileMetaCode.image)) {
            deleteImageJsonArray.push(
              getJsonForDeleteImage(
                apiConst.collectionName.storeItem,
                storeItemDocument._id,
                card.imageUrl
              )
            );
          }
        });
        storeItemDocument.productDetailCards = resultKeyArray[1];
      }

      if (!_.isEqual(storeItemDocument.productInfoCards, resultKeyArray[2])) {
        storeItemDocument.productInfoCards.forEach(function(card, index) {
          if (card.imageUrl.startsWith(apiConst.fileMetaCode.image)) {
            deleteImageJsonArray.push(
              getJsonForDeleteImage(
                apiConst.collectionName.storeItem,
                storeItemDocument._id,
                card.imageUrl
              )
            );
          }
        });
        storeItemDocument.productInfoCards = resultKeyArray[2];
      }

      storeItemDocument.save(function(err, updateStoreItemResult) {
        if (err) return reject(err);
        data.storeItemDocument = updateStoreItemResult;
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
function assembleStoreItemByDocument(data) {
  return new Promise(function(resolve, reject) {
    const storeItem = {};
    storeItem.storeItemId = data.storeItemDocument._id;
    storeItem.title = data.storeItemDocument.title;
    storeItem.description = data.storeItemDocument.description;
    storeItem.thumbnailUrl = data.storeItemDocument.thumbnailUrl;
    storeItem.price = data.storeItemDocument.price;
    storeItem.discountPrice = data.storeItemDocument.discountPrice;
    storeItem.optionItem1Name = data.storeItemDocument.optionItem1Name;
    storeItem.optionItem1Price = data.storeItemDocument.optionItem1Price;
    storeItem.optionItem2Name = data.storeItemDocument.optionItem2Name;
    storeItem.optionItem2Price = data.storeItemDocument.optionItem2Price;
    storeItem.optionItem3Name = data.storeItemDocument.optionItem3Name;
    storeItem.optionItem3Price = data.storeItemDocument.optionItem3Price;
    storeItem.optionItem4Name = data.storeItemDocument.optionItem4Name;
    storeItem.optionItem4Price = data.storeItemDocument.optionItem4Price;
    storeItem.weight = data.storeItemDocument.weight;
    storeItem.expirationDate = data.storeItemDocument.expirationDate;
    storeItem.category = data.storeItemDocument.category;
    storeItem.soldOut = data.storeItemDocument.soldOut;
    storeItem.limited = data.storeItemDocument.limited;
    storeItem.hot = data.storeItemDocument.hot;
    storeItem.new = data.storeItemDocument.new;
    storeItem.status = data.storeItemDocument.status;
    storeItem.sdate = data.storeItemDocument.sdate;
    storeItem.cdate = data.storeItemDocument.cdate;
    storeItem.edate = data.storeItemDocument.edate;
    storeItem.authorId = data.storeItemDocument.authorId;
    storeItem.productDetailCards = data.storeItemDocument.productDetailCards;
    storeItem.productInfoCards = data.storeItemDocument.productInfoCards;
    data.storeItem = storeItem;
    return resolve(data);
  });
}

router.put('/:storeItemId', function(req, res, next) {
  preProcessingUtils
    .initData(req, true)
    .then(authUtils.getAuthorIdByToken)
    .then(updateStoreItem)
    .then(moveStoreItemTempImage)
    .then(removeDeletedImages)
    .then(assembleStoreItemByDocument)
    .then(function(data) {
      res.json(data.storeItem);
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
function updateStoreItem(data) {
  return new Promise(function(resolve, reject) {
    const storeItemId = data.params.storeItemId;
    const storeItem = data.body.storeItem;
    StoreItemsDocument.findById(storeItemId).exec(function(
      err,
      storeItemDocument
    ) {
      if (err) return reject(err);
      if (!storeItemDocument) return reject(responseCode.resourceNotFound);
      storeItemDocument.title = storeItem.title ? storeItem.title : '';
      storeItemDocument.description = storeItem.description
        ? storeItem.description
        : '';
      storeItemDocument.thumbnailUrl = storeItem.thumbnailUrl
        ? storeItem.thumbnailUrl
        : null;
      storeItemDocument.price = storeItem.price ? storeItem.price : null;
      storeItemDocument.discountPrice = storeItem.discountPrice
        ? storeItem.discountPrice
        : null;
      storeItemDocument.optionItem1Name = storeItem.optionItem1Name
        ? storeItem.optionItem1Name
        : '';
      storeItemDocument.optionItem1Price = storeItem.optionItem1Price
        ? storeItem.optionItem1Price
        : 0;
      storeItemDocument.optionItem2Name = storeItem.optionItem2Name
        ? storeItem.optionItem2Name
        : '';
      storeItemDocument.optionItem2Price = storeItem.optionItem2Price
        ? storeItem.optionItem2Price
        : 0;
      storeItemDocument.optionItem3Name = storeItem.optionItem3Name
        ? storeItem.optionItem3Name
        : '';
      storeItemDocument.optionItem3Price = storeItem.optionItem3Price
        ? storeItem.optionItem3Price
        : 0;
      storeItemDocument.optionItem4Name = storeItem.optionItem4Name
        ? storeItem.optionItem4Name
        : '';
      storeItemDocument.optionItem4Price = storeItem.optionItem4Price
        ? storeItem.optionItem4Price
        : 0;
      storeItemDocument.weight = storeItem.weight ? storeItem.weight : '';
      storeItemDocument.expirationDate = storeItem.expirationDate
        ? storeItem.expirationDate
        : '';
      storeItemDocument.category = storeItem.category
        ? storeItem.category
        : null;
      storeItemDocument.soldOut = storeItem.soldOut ? true : false;
      storeItemDocument.limited = storeItem.limited ? true : false;
      storeItemDocument.hot = storeItem.hot ? true : false;
      storeItemDocument.new = storeItem.new ? true : false;
      storeItemDocument.status = storeItem.status
        ? storeItem.status
        : apiConst.status.delete;
      storeItemDocument.sdate = storeItem.sdate
        ? moment(storeItem.sdate).utc()
        : null;
      storeItemDocument.edate = new Date();
      storeItemDocument.productDetailCards = storeItem.productDetailCards
        ? storeItem.productDetailCards
        : null;
      storeItemDocument.productInfoCards = storeItem.productInfoCards
        ? storeItem.productInfoCards
        : null;
      storeItemDocument.save(function(err, updateStoreItemResult) {
        if (err) return reject(err);
        data.storeItemDocument = updateStoreItemResult;
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
