global.config = require('./config');
global.responseCode = require('./utils/responseCode');
global.apiConst = require('./utils/apiConst');
global.util = require('util');
global.autoIncrement = require('mongoose-auto-increment');

const Logger = require('./utils/logger');
global.log = new Logger('./logs/error.log');

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const winston = require('winston');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

//routers
const authorsRouter = require('./routes/sikguadang/authorsRouter');
const noticesRouter = require('./routes/sikguadang/noticesRouter');
const inquiriesRouter = require('./routes/sikguadang/inquiriesRouter');
const ordersRouter = require('./routes/sikguadang/ordersRouter');
const imagesRouter = require('./routes/sikguadang/imagesRouter');
const storesRouter = require('./routes/sikguadang/storesRouter');
const articlesRouter = require('./routes/sikguadang/articlesRouter');

process.on('uncaughtException', function(err) {
  log.warning('uncaughtException ===');
  log.warning(err.stack);
});
process.on('exit', function(code) {
  log.error('About to exit with code: %s', code);
  // redisAuthClient.quit();
  // redisCountClient.quit();
  // redisCacheClient.quit();
});
process.on('warning', function(warning) {
  log.warning(warning.name);
  log.warning(warning.message);
  log.warning(warning.stack);
});
log.info('env : ' + process.env.NODE_ENV);
log.info('log level : ' + config.log.level);

// express
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after place your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// [MONGODB]
// CONNECT TO MONGODB SERVER
const db = mongoose.connection;

db.on('error', function(data) {
  log.error(data);
});
db.once('open', function() {
  // CONNECTED TO MONGODB SERVER
  log.info('Connected to mongod server');
});

mongoose.Promise = require('bluebird');

mongoose.connect(config.mongodb.url, {
  // useMongoClient: true
  useCreateIndex: true,
  useNewUrlParser: true
});

// use routers
app.use('/v1/authors/', authorsRouter);
app.use('/v1/notices/', noticesRouter);
app.use('/v1/inquiries', inquiriesRouter);
app.use('/v1/orders', ordersRouter);
app.use('/v1/images/', imagesRouter);
app.use('/v1/stores/', storesRouter);
app.use('/v1/articles/', articlesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
