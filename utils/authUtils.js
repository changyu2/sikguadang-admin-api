const jwt = require('jwt-simple');

exports.getUserEmailByToken = function(data) {
  return new Promise(function(resolve, reject) {
    // data.userEmail = null;
    const now = new Date();
    if (util.isNullOrUndefined(data.authToken)) {
      if (data.authRequired) return reject(responseCode.forbidden);
      return resolve(data);
    }
    const authBody = jwt.decode(data.authToken, config.auth.authSecret);
    try {
      if (!authBody) {
        if (data.authRequired) return reject(responseCode.tokenInvalid);
        return resolve(data);
      }
      if (authBody.expireTime < now.getTime()) {
        if (data.authRequired) return reject(responseCode.tokenExpired);
        return resolve(data);
      }
    } catch (err) {
      log.error(data.authToken);
      log.error(err.message);
      log.error(err.stack);
      if (data.authRequired) return reject(responseCode.tokenInvalid);
      return resolve(data);
    }
    data.userEmail = authBody.userEmail;
    // data.user.type = authBody.type;

    return resolve(data);
  });
};

exports.getAuthorIdByToken = function(data) {
  return new Promise(function(resolve, reject) {
    let now = new Date();
    if (util.isNullOrUndefined(data.authToken)) {
      if (data.authRequired) return reject(responseCode.forbidden);
      return resolve(data);
    }
    const authBody = jwt.decode(data.authToken, config.auth.authSecret);
    try {
      if (!authBody) {
        if (data.authRequired) return reject(responseCode.tokenInvalid);
        return resolve(data);
      }
      if (authBody.expireTime < now.getTime()) {
        if (data.authRequired) return reject(responseCode.tokenExpired);
        return resolve(data);
      }
    } catch (err) {
      log.error(data.authToken);
      log.error(err.message);
      log.error(err.stack);
      if (data.authRequired) return reject(responseCode.tokenInvalid);
      return resolve(data);
    }

    data.authorId = authBody.authorId;
    data.authorName = authBody.authorName;
    data.authorType = authBody.type;
    return resolve(data);
  });
};
