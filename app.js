var express = require('express');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});

var routes = require('./routes');

var app = express();

app.set('port', process.env.port || 3000);
// 视图引擎设置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(flash());

//app.use(favicon());
app.use(favicon(__dirname, '/public/images/favicon.ico'));
//app.use(express.favicon(__dirname, '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(express.logger({stream: accessLog}));

app.use(express.bodyParser({ keepExtensions: true, uploadDir: './public/images' }));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.session({
    secret: settings.cookieSecret,
    key: settings.db,//cookie name
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30天
    store: new MongoStore({
        db: settings.db
    })
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

routes(app);

app.use(function (err, req, res, next) {
    var meta = '[' + new Date() + '] ' + req.url + '\n';
    errorLog.write(meta + err.stack + '\n');
    next();
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('common/error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('common/error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
