const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const signRouter = require('./routes/sign');
const articleRouter = require('./routes/article');
const commentsRouter = require('./routes/comment');
const imageRouter = require('./routes/image');
const connectionRouter = require('./routes/connection');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

var dir = path.join(__dirname, 'uploads');
app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/sign',signRouter);
app.use('/article',articleRouter);
app.use('/comment',commentsRouter);
app.use('/image',imageRouter);
app.use('/connection',connectionRouter);
app.use(express.static(dir))



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
