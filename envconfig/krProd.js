module.exports = {
  url: 'https://admin.soosooplace.com/',
  cdnURL: 'https://cdna.soosooplace.com/',
  log: {
    level: 'info',
    accessLogFormat: 'tiny'
  },
  mongodb: {
    url: 'mongodb+srv://root:123456!@sikguadang-vlvwm.mongodb.net/sikguadang_db'
  },
  aws: {
    s3: {
      tempBucket: 'kr-prod-soosoo-temp-01',
      serviceBucket: 'kr-prod-soosoo-01'
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
    authSecret: 'moment',
    restoreSecret: 'mesmerized',
    authExpireTime: 86400000,
    restoreExpireTime: 604800000
  },
  shortenerHost: 'https://feiv.kr',
  systemAuthorId: '583d44a07663820b063dc185',
  exceptedContentsIds: [
    '57a58dd0e4b0add8e99accb5',
    '582ed567fceae3746e16e352',
    '57beb612e4b0b58a95dda474',
    '5836a22c41cdc4513ab36355',
    '583cfe0641cdc4513ab363c3',
    '58339fa4349eefb9305c052e',
    '582be47dfceae3746e16e258',
    '58183c6ea087b03f43d5d115',
    '57a58dd0e4b0add8e99accb5'
  ]
};
