module.exports = {
  url: 'http://dev-admin.soosooplace.com/',
  cdnURL: 'http://dev-cdna.soosooplace.com/',
  log: {
    level: 'info',
    accessLogFormat: 'tiny'
  },
  mongodb: {
    url: 'mongodb+srv://root:123456!@sikguadang-vlvwm.mongodb.net/sikguadang_db'
  },
  // redis: {
  //     auth: {
  //         host: 'localhost',
  //         port: 6379,
  //         password: 'faveredis',
  //         database: 1
  //     },
  //     count: {
  //         host: 'localhost',
  //         port: 6379,
  //         password: 'faveredis',
  //         database: 2
  //     },
  //     cache: {
  //         host: 'localhost',
  //         port: 6379,
  //         password: 'faveredis',
  //         database: 3
  //     },
  //     shortener: {
  //         host: 'localhost',
  //         port: 6379,
  //         password: 'faveredis',
  //         database: 4
  //     },
  //     buzzvil: {
  //         host: 'localhost',
  //         port: 6379,
  //         password: 'faveredis',
  //         database: 5
  //     }
  // },
  aws: {
    s3: {
      tempBucket: 'kr-soosoo-dev-temp-01',
      serviceBucket: 'kr-soosoo-dev-01'
    },
    kor: {
      accessKeyId: 'AKIAI4CUZTE5J3IJQ5AQ',
      secretAccessKey: '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',
      region: 'ap-northeast-1',
      signatureVersion: 'v4',
      maxRetries: 3
    },
    virginia: {
      accessKeyId: 'AKIAI4CUZTE5J3IJQ5AQ',
      secretAccessKey: '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',
      region: 'us-east-1',
      signatureVersion: 'v4',
      maxRetries: 3
    }
  },
  auth: {
    authSecret: 'secret',
    restoreSecret: 'secret',
    authExpireTime: 86400000,
    restoreExpireTime: 604800000
  },
  shortenerHost: 'http://rx.fave.land',
  systemAuthorId: '583d43467663820b063dc184',
  exceptedContentsIds: []
};
