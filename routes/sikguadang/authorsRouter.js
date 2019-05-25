const express = require('express');
const router = express.Router();
const AuthorsDocument = require('../../models/documents/sikguadang/authorsDocument');
const preProcessingUtils = require('../../utils/preProcessingUtils');
const authUtils = require('../../utils/authUtils');
const jwt = require('jwt-simple');
const Promise = require('bluebird');
const moment = require('moment');
const Base64 = require('js-base64').Base64;

router.get('/me', function(req, res, next) {
  preProcessingUtils
    .initData(req, true)
    .then(authUtils.getAuthorIdByToken)
    .then(getAuthor)
    .then(function(data) {
      res.json(data.author);
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
function getAuthor(data) {
  return new Promise(function(resolve, reject) {
    const authorId = data.authorId;
    AuthorsDocument.findOne({ authorId: authorId })
      .where({
        status: apiConst.status.active,
        ldate: { $gt: moment().subtract(1, 'years') }
      })
      .exec(function(err, authorDocument) {
        if (err) return reject(err);
        if (!authorDocument) return reject(responseCode.resourceNotFound);
        const author = {};
        author.authorId = authorDocument._id;
        author.authorName = authorDocument.authorName;
        author.type = authorDocument.type;
        data.author = author;
        return resolve(data);
      });
  });
}

router.post('/login', function(req, res, next) {
  preProcessingUtils
    .initData(req, false)
    .then(getAuthorByAuthorIdAndPassword)
    .then(createToken)
    .then(function(data) {
      res.setHeader(apiConst.authTokenHeader, data.authToken);
      res.setHeader(apiConst.restoreTokenHeader, data.restoreToken);
      // data.author.authToken = data.authToken;
      // data.author.restoreToken = data.restoreToken;
      res.json(data.author);
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
function getAuthorByAuthorIdAndPassword(data) {
  return new Promise(function(resolve, reject) {
    const query = {};
    query.status = apiConst.status.active;
    query.authorId = data.body.authorId;
    query.password = data.body.password;

    AuthorsDocument.findOneAndUpdate(
      query,
      { ldate: data.now },
      { new: true },
      function(err, authorDocument) {
        if (err) return reject(err);
        if (!authorDocument) return reject(responseCode.resourceNotFound);
        const author = {};
        author.authorId = authorDocument.authorId;
        author.authorName = authorDocument.authorName;
        author.profilePhotoUrl = authorDocument.profilePhotoUrl;
        author.type = authorDocument.type;
        data.author = author;
        return resolve(data);
      }
    );
  });
}
function createToken(data) {
  return new Promise(function(resolve, reject) {
    const authorId = data.author.authorId;
    const authorName = data.author.authorName;

    const authTokenJwtBody = {};
    authTokenJwtBody.authorId = authorId;
    authTokenJwtBody.authorName = authorName;
    authTokenJwtBody.expireTime =
      data.now.getTime() + config.auth.authExpireTime;
    authTokenJwtBody.type = data.author.type;
    const authToken = jwt.encode(authTokenJwtBody, config.auth.authSecret);

    const restoreTokenJwtBody = {};
    restoreTokenJwtBody.authorId = authorId;
    restoreTokenJwtBody.expireTime =
      data.now.getTime() + config.auth.restoreExpireTime;
    const restoreToken = jwt.encode(
      restoreTokenJwtBody,
      config.auth.restoreSecret
    );

    data.authToken = authToken;
    data.restoreToken = restoreToken;
    return resolve(data);
  });
}

router.put('/restore', function(req, res, next) {
  preProcessingUtils
    .initData(req, false)
    .then(checkRestoreTokenCondition)
    .then(getAuthor)
    .then(reissueToken)
    .then(function(data) {
      res.setHeader(apiConst.authTokenHeader, data.authToken);
      res.setHeader(apiConst.restoreTokenHeader, data.restoreToken);
      // data.author.authToken = data.authToken;
      // data.author.restoreToken = data.restoreToken;
      res.json(data.author);
    })
    .catch(function(ex) {
      if (ex instanceof Error) {
        log.error(ex.message);
        log.error(ex.stack);
        res
          .status(responseCode.internalError.status)
          .json(responseCode.internalError.detail);
      } else {
        log.error(ex.detail);
        res.status(ex.status).json(ex.detail);
      }
    });
});
function checkRestoreTokenCondition(data) {
  return new Promise(function(resolve, reject) {
    const authToken = data.authToken;
    const restoreToken = data.restoreToken;
    if (util.isNullOrUndefined(authToken))
      return reject(responseCode.forbidden);
    if (util.isNullOrUndefined(restoreToken))
      return reject(responseCode.paramError);

    try {
      const authDecoded = jwt.decode(authToken, config.auth.authSecret);
      if (!authDecoded) return reject(responseCode.tokenInvalid);

      const restoreDecoded = jwt.decode(
        restoreToken,
        config.auth.restoreSecret
      );
      if (!restoreDecoded) return reject(responseCode.tokenInvalid);

      if (authDecoded.authorId !== restoreDecoded.authorId)
        return reject(responseCode.paramError);

      // if (authDecoded.expireTime > data.now.getTime()) return reject(responseCode.internalError);
      if (restoreDecoded.expireTime < data.now.getTime())
        return reject(responseCode.tokenInvalid);
      data.authorId = authDecoded.authorId;

      return resolve(data);
    } catch (err) {
      log.warn(err.message);
      log.warn(err.stack);
      return reject(responseCode.tokenInvalid);
    }
  });
}
function reissueToken(data) {
  return new Promise(function(resolve, reject) {
    const authTokenJwtBody = {};
    authTokenJwtBody.authorId = data.authorId;
    authTokenJwtBody.type = data.author.type;
    authTokenJwtBody.expireTime =
      data.now.getTime() + config.auth.authExpireTime;
    const authToken = jwt.encode(authTokenJwtBody, config.auth.authSecret);

    const restoreTokenJwtBody = {};
    restoreTokenJwtBody.authorId = data.authorId;
    restoreTokenJwtBody.expireTime =
      data.now.getTime() + config.auth.restoreExpireTime;
    const restoreToken = jwt.encode(
      restoreTokenJwtBody,
      config.auth.restoreSecret
    );

    data.authToken = authToken;
    data.restoreToken = restoreToken;
    return resolve(data);
  });
}
module.exports = router;
