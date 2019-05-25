module.exports = {
  success: {
    status: 200,
    detail: { code: 'RC100200', message: 'Success' }
  },
  paramError: {
    status: 400,
    detail: { code: 'RC100400', message: 'Parameter error' }
  },
  unauthorized: {
    status: 401,
    detail: { code: 'RC100401', message: 'Unauthrorized' }
  },
  forbidden: {
    status: 403,
    detail: { code: 'RC100403', message: 'Forbidden' }
  },
  resourceNotFound: {
    status: 404,
    detail: { code: 'RC100404', message: 'Resource not found' }
  },
  emailParamError: {
    status: 400,
    detail: { code: 'RC100421', message: 'Email format is wrong' }
  },
  emailDuplicateError: {
    status: 400,
    detail: { code: 'RC100422', message: 'Email duplicated' }
  },
  nameDuplicateError: {
    status: 400,
    detail: { code: 'RC100423', message: 'Name duplicated' }
  },
  snsDuplicateError: {
    status: 400,
    detail: { code: 'RC100424', message: 'Sns duplicated' }
  },
  ageError: {
    status: 400,
    detail: { code: 'RC100425', message: 'Age occurred error' }
  },
  prohibitedWordsError: {
    status: 400,
    detail: { code: 'RC100426', message: 'Prohibited words error' }
  },
  ownerError: {
    status: 400,
    detail: { code: 'RC100427', message: 'You are not resources owner' }
  },
  nameContainNotSupportedCharactorError: {
    status: 400,
    detail: {
      code: 'RC100428',
      message: 'Name contain not supported character'
    }
  },
  inputSizeError: {
    status: 400,
    detail: { code: 'RC100429', message: 'Input size too long or short' }
  },
  tokenExpired: {
    status: 403,
    detail: { code: 'RC101430', message: 'Token expired' }
  },
  tokenInvalid: {
    status: 403,
    detail: { code: 'RC100431', message: 'Token invalid' }
  },
  internalError: {
    status: 500,
    detail: { code: 'RC100500', message: 'Internal server error' }
  }
};
