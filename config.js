let config;
switch (process.env.NODE_ENV) {
  case 'kr_prod':
    config = require('./envconfig/krProd');
    break;
  case 'kr_stg':
    config = require('./envconfig/krStg');
    break;
  case 'kr_dev':
    config = require('./envconfig/krDev');
    break;
  default:
    process.env.NODE_ENV = 'local';
    config = require('./envconfig/local');
}

module.exports = config;
