// dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
 
var routes = require('./routes/index');
//var users = require('./routes/users');


var app = express();

//init paths and ports
//process.env.mongoPath = "mongodb://localhost:27017/myDb";
process.env.PORT = '3000';
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

console.log('init mongoPath');

process.env.mongoPath = "mongodb://mydb:pass1@ds027479.mongolab.com:27479/mydb";
process.env.socketIOPort = "3001";
//process.env.myUrl ="http://socketd.azurewebsites.net/";
process.env.myUrl = "ec2-54-88-233-131.compute-1.amazonaws.com/";

console.log('mongo ' + process.env.mongoPath );

// mongoose
//mongoose.connect('mongodb://localhost/passport_local_mongoose_express4');
//mongoose.connection.once("open", function () {
//    mongoose.connection.db.listCollections().toArray(function (err, names) {
//        if (err) {
//            console.log(err);
//        }
//        else {
//            names.forEach(function (e, i, a) {
//                //mongoose.connection.db.dropCollection(e.name);
//                console.log("--->>", e.name);
//            });
//        }
//    });
//});


mongoose.connect(process.env.mongoPath, function (err, db) {
    if (err) {
        console.warn(err.message);
    }
});

console.log('mongo connected');

var date = new Date(Date.UTC(2012, 11, 20, 15, 0, 0));
console.log(date.toLocaleString('en-GB'));

var options = {
    year: "numeric", month: "numeric",
    day: "numeric", hour: "numeric", hour12: false, minute:"numeric"
};

// Using I18N toLocaleString
console.log(date.toLocaleString('en-GB', options));
console.log(date.toLocaleString("en-US", options));
console.log(date.toLocaleString("ja-JP", options));
console.log(date.toLocaleString("ar-SA", options));
console.log(date.toLocaleString("hi-IN", options));


autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);
//Make our db accessible to our router
app.use(function (req, res, next) {
    req.db = mongoose.connection;
    next();
});

app.use('/', routes);


// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

////listen to the isers ask for help
//var http = require('http');
//var server = http.createServer(app);
//var io = require('socket.io').listen(server);

//server.listen('3000', function () {
//    console.log('Express server listening on port 3000');
//});

//io.on('connection', function (socket) {
//    console.log('a user connected');
    
//    socket.on('disconnect', function () {
//        console.log('user disconnected');
//    });
    
//    socket.on('chat', function (msg) {
        
//        socket.broadcast.emit('chat', msg);
//    });
//});
////listen to the isers ask for help

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



module.exports = app;
