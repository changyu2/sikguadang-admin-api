const winston = require('winston');
const moment = require('moment');
const FileStreamRotator = require('file-stream-rotator');

// default log by winston
module.exports = function(filename) {
  const logTransports = [];

  const consoleTransPort = new winston.transports.Console({
    level: config.log.level,
    json: false,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    timestamp: function() {
      return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    },
    formatter: function(options) {
      // Return string will be passed to logger
      return (
        options.timestamp() +
        ' ' +
        options.level.toUpperCase() +
        ' ' +
        (undefined !== options.message ? options.message : '') +
        (options.meta && Object.keys(options.meta).length
          ? '\n\t' + JSON.stringify(options.meta)
          : '')
      );
    }
  });

  const fileTransPort = new winston.transports.File({
    level: config.log.level,
    json: false,
    filename: filename,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    timestamp: function() {
      return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    },
    formatter: function(options) {
      // Return string will be passed to logger
      return (
        options.timestamp() +
        ' ' +
        options.level.toUpperCase() +
        ' ' +
        (undefined !== options.message ? options.message : '') +
        (options.meta && Object.keys(options.meta).length
          ? '\n\t' + JSON.stringify(options.meta)
          : '')
      );
    }
  });

  switch (process.env.NODE_ENV) {
    case 'kr_prod':
      logTransports.push(fileTransPort);
      break;
    default:
      logTransports.push(consoleTransPort);
      logTransports.push(fileTransPort);
  }

  const logger = new winston.Logger({
    transports: logTransports
  });

  logger.setLevels(winston.config.syslog.levels);
  logger.exitOnError = true;

  return logger;
};

// access log rotation stream
const accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: './logs/access-%DATE%.log',
  frequency: 'daily',
  verbose: false
});

module.exports.stream = accessLogStream;
