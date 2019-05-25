const express = require('express');
const _ = require('lodash');
const Promise = require('bluebird');
const moment = require('moment');
const shortIdGenerator = require('shortid');
const awsKor = require('aws-sdk');

awsKor.config.update(config.aws.kor);

const s3 = new awsKor.S3();
const router = express.Router();

const ArticlesDocument = require('../../models/documents/sikguadang/articlesDocument');
const FileMetaDocument = require('../../models/documents/sikguadang/fileMetasDocument');
const preProcessingUtils = require('../../utils/preProcessingUtils');
const authUtils = require('../../utils/authUtils');

router.get('/', function(req, res, next) {
  preProcessingUtils
    .initData(req, false)
    .then(authUtils.getAuthorIdByToken)
    .then(getArticlesList)
    .then(function(data) {
      res.json(data.articleArray);
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
function getArticlesList(data) {
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

    ArticlesDocument.find(query)
      .populate('authorId')
      .limit(limit)
      .skip(offset)
      .sort(sort)
      .exec(function(err, articlesDocument) {
        if (err) return reject(err);
        const articleArray = [];
        for (let i in articlesDocument) {
          const article = {};
          article.articleId = articlesDocument[i]._id;
          article.title = articlesDocument[i].title;
          article.thumbnailUrl = articlesDocument[i].thumbnailUrl;
          article.bannerUrl = articlesDocument[i].bannerUrl;
          article.imageUrl = articlesDocument[i].imageUrl;
          article.hashTag = articlesDocument[i].hashTag;
          article.source = articlesDocument[i].source;
          article.sourceLink = articlesDocument[i].sourceLink;
          article.category = articlesDocument[i].category;
          article.author = {};
          article.author.authorName = articlesDocument[i].authorId.authorName;
          article.status = articlesDocument[i].status;
          article.sdate = articlesDocument[i].sdate;
          article.cdate = articlesDocument[i].cdate;
          articleArray.push(article);
        }
        data.articleArray = articleArray;
        return resolve(data);
      });
  });
}

router.get('/:articleId', function(req, res, next) {
  preProcessingUtils
    .initData(req, true)
    .then(authUtils.getAuthorIdByToken)
    .then(getArticle)
    .then(function(data) {
      res.json(data.article);
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
function getArticle(data) {
  return new Promise(function(resolve, reject) {
    const query = {};
    ArticlesDocument.findById(data.params.articleId, function(
      err,
      articleDocument
    ) {
      if (err) return reject(err);
      const article = {};
      article.id = articleDocument._id;
      article.title = articleDocument.title;
      article.thumbnailUrl = articleDocument.thumbnailUrl;
      article.bannerUrl = articleDocument.bannerUrl;
      article.imageUrl = articleDocument.imageUrl;
      article.hashTag = articleDocument.hashTag;
      article.source = articleDocument.source;
      article.sourceLink = articleDocument.sourceLink;
      article.category = articleDocument.category;
      article.status = articleDocument.status;
      article.sdate = articleDocument.sdate;
      data.article = article;
      return resolve(data);
    });
  });
}

router.post('/', function(req, res, next) {
  preProcessingUtils
    .initData(req, true)
    .then(authUtils.getAuthorIdByToken)
    .then(createArticle)
    .then(moveArticleTempImage)
    .then(assembleArticleByDocument)
    .then(function(data) {
      res.json(data.article);
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
function createArticle(data) {
  return new Promise(function(resolve, reject) {
    const article = data.body.article;
    const articleDocument = new ArticlesDocument();
    articleDocument.title = article.title ? article.title : '';
    articleDocument.thumbnailUrl = article.thumbnailUrl
      ? article.thumbnailUrl
      : null;
    articleDocument.bannerUrl = article.bannerUrl ? article.bannerUrl : null;
    articleDocument.imageUrl = article.imageUrl ? article.imageUrl : null;
    articleDocument.hashTag = article.hashTag ? article.hashTag : '';
    articleDocument.source = article.source ? article.source : '';
    articleDocument.sourceLink = article.sourceLink ? article.sourceLink : '';
    articleDocument.category = article.category ? article.category : null;
    articleDocument.status = article.status
      ? article.status
      : apiConst.status.delete;
    articleDocument.sdate = article.sdate ? moment(article.sdate).utc() : null;
    articleDocument.cdate = new Date();
    articleDocument.edate = new Date();
    articleDocument.authorId = data.authorId;

    articleDocument.save(function(err, result) {
      if (err) return reject(err);
      data.articleDocument = result;
      return resolve(data);
    });
  });
}
function moveArticleTempImage(data) {
  const article = data.body.article;
  const promiseArray = [];
  promiseArray.push(
    batchMoveCardsTempImage(
      article.thumbnailUrl,
      apiConst.collectionName.article,
      data.articleDocument._id,
      apiConst.fileMetaCode.thumbnail
    )
  );
  promiseArray.push(
    batchMoveCardsTempImage(
      article.bannerUrl,
      apiConst.collectionName.article,
      data.articleDocument._id,
      apiConst.fileMetaCode.image
    )
  );
  promiseArray.push(
    batchMoveCardsTempImage(
      article.imageUrl,
      apiConst.collectionName.article,
      data.articleDocument._id,
      apiConst.fileMetaCode.image
    )
  );
  return new Promise.all(promiseArray).then(function(resultKeyArray) {
    return new Promise(function(resolve, reject) {
      const deleteImageJsonArray = [];
      const articleDocument = data.articleDocument;
      if (!_.isEqual(articleDocument.thumbnailUrl, resultKeyArray[0])) {
        articleDocument.thumbnailUrl.forEach(function(card, index) {
          if (card.imageUrl.startsWith(apiConst.fileMetaCode.image)) {
            deleteImageJsonArray.push(
              getJsonForDeleteImage(
                apiConst.collectionName.article,
                articleDocument._id,
                card.imageUrl
              )
            );
          }
        });
        articleDocument.thumbnailUrl = resultKeyArray[0];
      }

      if (!_.isEqual(articleDocument.bannerUrl, resultKeyArray[1])) {
        articleDocument.bannerUrl.forEach(function(card, index) {
          if (card.imageUrl.startsWith(apiConst.fileMetaCode.image)) {
            deleteImageJsonArray.push(
              getJsonForDeleteImage(
                apiConst.collectionName.article,
                articleDocument._id,
                card.imageUrl
              )
            );
          }
        });
        articleDocument.bannerUrl = resultKeyArray[1];
      }

      if (!_.isEqual(articleDocument.imageUrl, resultKeyArray[2])) {
        articleDocument.imageUrl.forEach(function(card, index) {
          if (card.imageUrl.startsWith(apiConst.fileMetaCode.image)) {
            deleteImageJsonArray.push(
              getJsonForDeleteImage(
                apiConst.collectionName.article,
                articleDocument._id,
                card.imageUrl
              )
            );
          }
        });
        articleDocument.imageUrl = resultKeyArray[2];
      }

      articleDocument.save(function(err, updateArticleResult) {
        if (err) return reject(err);
        data.articleDocument = updateArticleResult;
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
function assembleArticleByDocument(data) {
  return new Promise(function(resolve, reject) {
    const article = {};
    article.articleId = data.articleDocument._id;
    article.title = data.articleDocument.title;
    article.thumbnailUrl = data.articleDocument.thumbnailUrl;
    article.bannerUrl = data.articleDocument.bannerUrl;
    article.imageUrl = data.articleDocument.imageUrl;
    article.hashTag = data.articleDocument.hashTag;
    article.source = data.articleDocument.source;
    article.sourceLink = data.articleDocument.sourceLink;
    article.category = data.articleDocument.category;
    article.status = data.articleDocument.status;
    article.sdate = data.articleDocument.sdate;
    article.cdate = data.articleDocument.cdate;
    article.edate = data.articleDocument.edate;
    article.authorId = data.articleDocument.authorId;
    data.article = article;
    return resolve(data);
  });
}

router.put('/:articleId', function(req, res, next) {
  preProcessingUtils
    .initData(req, true)
    .then(authUtils.getAuthorIdByToken)
    .then(updateArticle)
    .then(moveArticleTempImage)
    .then(removeDeletedImages)
    .then(assembleArticleByDocument)
    .then(function(data) {
      res.json(data.article);
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
function updateArticle(data) {
  return new Promise(function(resolve, reject) {
    const articleId = data.params.articleId;
    const article = data.body.article;
    ArticlesDocument.findById(articleId).exec(function(err, articleDocument) {
      if (err) return reject(err);
      if (!articleDocument) return reject(responseCode.resourceNotFound);
      articleDocument.title = article.title ? article.title : '';
      articleDocument.thumbnailUrl = article.thumbnailUrl
        ? article.thumbnailUrl
        : null;
      articleDocument.bannerUrl = article.bannerUrl ? article.bannerUrl : null;
      articleDocument.imageUrl = article.imageUrl ? article.imageUrl : null;
      articleDocument.hashTag = article.hashTag ? article.hashTag : '';
      articleDocument.source = article.source ? article.source : '';
      articleDocument.sourceLink = article.sourceLink ? article.sourceLink : '';
      articleDocument.category = article.category ? article.category : null;
      articleDocument.status = article.status
        ? article.status
        : apiConst.status.delete;
      articleDocument.sdate = article.sdate
        ? moment(article.sdate).utc()
        : null;
      articleDocument.edate = new Date();
      articleDocument.save(function(err, updateArticleResult) {
        if (err) return reject(err);
        data.articleDocument = updateArticleResult;
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
