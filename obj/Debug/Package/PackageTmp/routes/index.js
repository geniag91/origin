var express = require('express');
//var mongoose = require('mongoose');
var passport = require('passport');
var Account = require('../models/account');
var Location = require('../models/location');
var functions = require('./functions.js');
var help = require('./help_desk.js');
var router = express.Router();
//
var Vehicle = require('../models/vehicle');
global.io;
global.socket;

//DISPLAY MAIN SEARCH SCREEN
router.get('/', isAuthenticated, function (req, res) {
    res.render('index');
});

//get locations array
router.get('/home.json', function (req, res) {

    Location.find().sort({ 'Name': 'asc' }).exec({}, function (err, locs) {
        if (err) {
            console.warn(err.message);
        }
        else {
            //console.log(location);
            if (locs) {
                //res.('index', { locations : locs });
                var categories = [ '*', 'Business',  'SUV',  'Family',  'Economy' ];
                var ages = ['18-21', '21-27', '27+' ];
                //res.send(JSON.stringify(locs));
                res.send({screenName: 'index' ,user: req.user, locations: locs, categories: categories, ages : ages });
            }
            else {
                console.log('null');
            }
        }
    });
});

//open help desk screen
router.get('/help', function (req, res) {

    
    //var http = require('http');
    //var server = http.createServer(app);
    //var io = require('socket.io').listen(server);
    
    //server.listen('3000', function () {
    //    console.log('Express server listening on port 3000');
    //});
    
    //listen to the isers ask for help
    var app = require('../app');
    var http = require('http');
    var server = http.createServer(app);
    var hd=require('./help_desk')
    global.io = hd.listen(app,server,req.user,global.io);
    res.render('help_desk', {user: req.user});
});


//DISPLAY FIRST SEARCH RESULT
router.get('/vclList', function (req, res) {
    res.render('vclList');
});

router.get('/vclList.json', function (req, res) {
    //parse criteria
    var dateFrom = new Date(req.query.dateFrom );
    var dateTo = new Date(req.query.dateTo);
    var locOut = req.query.locOut;
    var locIn = req.query.locIn;
    var category = req.query.category;
    var age = req.query.age;

    functions.searchVehicles(res, req.user, dateFrom, dateTo, locOut, locIn, age, category);
});

//DISPLAY SEARCH RESULTS AFTER THE USER CHANGED "ITEMS ON PAGE" NUMBER OR A PAGE NUMBER.
router.get('/page', function (req, res) {
    var pageNum = req.query.pageNum;
    var itemsOnPage = req.query.itemsOnPage;
    var itemsOnPageChanged = req.query.itemsOnPageChanged;
    var criteria= req.query.criteria;
    var orderBy = req.query.orderBy;

    functions.getPage(res, criteria, orderBy, pageNum, itemsOnPage, itemsOnPageChanged);
});

router.get('/vclDetails/selected', function (req, res) {
    var selectedVehicle = req.query.veh;
    var vehPrice = parseInt(req.query.vehPrice);
    var criteria = req.query.criteria;
    var carCategory=req.query.carCategory;
    var addOpps = req.query.addOpps || '';
    var remarks = req.query.remarks || '';

    functions.saveOrder(req, res, selectedVehicle, vehPrice, criteria, carCategory, addOpps, remarks);
});

//get orders history if user is logged in
router.get('/history', function (req, res) {
    res.render('history');
});

router.get('/history.json', function (req, res) {
    functions.getOrdersHistory(req, res);
});

router.get('/vclList/selected', function (req, res) {
    //res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0,  post-check=0, pre-check=0');
    res.render('vclDetails');
});

//get orders history if user is logged in
router.get('/order/selected', function (req, res) {
    //res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0,  post-check=0, pre-check=0');
    res.render('vclDetails');
    //functions.getOrder(req, res,selectedOrder);
});

router.get('/vehicleOrOrderDetails.json', function (req, res) {
   
    var selectedOrder = parseInt(req.query.id);
    var selectedVehicle = req.query.veh;
    var criteria = req.query.criteria;

    if (selectedOrder) {
        functions.getOrder(req, res, selectedOrder);
    }
    else if(selectedVehicle) { 
        functions.getVehicle(req, res, selectedVehicle , criteria);
    }
});

//get orders history if user is logged in
router.get('/orderUpdate/selected', function (req, res) {
    var selectedOrder = parseInt(req.query.id);
    var cancel= parseInt(req.query.cancel);
    var addOpps = req.query.addOpps;
    var remarks = req.query.remarks;
    functions.updateOrder(req, res,selectedOrder,cancel, addOpps,remarks);
});


router.get('/register', function (req, res) {
    req.session.returnTo = req.header('Referer') || '/';
    res.render('register');
});

router.post('/register', function (req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function (err, account) {
        if (err) {
            return res.render("register", { info: "Sorry. That username already exists. Try again." });
        }
        
        passport.authenticate('local')(req, res, function () {
            //res.redirect('/');
            res.redirect(req.session.returnTo || '/');
            delete req.session.returnTo;
        });
    });
});

router.get('/login', function (req, res) {
    //req.session.returnTo = req.path;

    req.session.returnTo = req.header('Referer') || '/';
    res.render('login');
});

router.post('/login', passport.authenticate('local'), function (req, res) {
    //res.redirect('/');
    var redir = req.session.returnTo;
    if (redir.indexOf('/login') > -1) {
        redir = '/';
    }
    res.redirect(redir || '/');
    delete req.session.returnTo;
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});


router.get('/ping', function (req, res) {
    res.status(200).send("pong!");
});

function isAuthenticated(req, res, next) {
    
    // do any checks you want to in here
    
    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    // you can do this however you want with whatever variables you set up
    if (req.user){
        return next();
    }
    // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
    res.redirect('/login');
}

module.exports = router;
