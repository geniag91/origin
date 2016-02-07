var express = require('express');
//var mongoose = require('mongoose');
//var Account = require('../models/account');
var Vehicle = require('../models/vehicle');
var AddAccessory = require('../models/addAccessory');
var Order = require('../models/order');
var mailer = require("nodemailer");

// Use Smtp Protocol to send Email
var smtpTransport = mailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
        user: "geniag91@gmail.com",
        pass: "newpassword1"
    }
});

module.exports = {
    getOrdersHistory : getOrdersHistory,
    searchVehicles : searchVehicles,
    getPage : getPage,
    getVehicle : getVehicle,
    saveOrder : saveOrder,
    updateOrder : updateOrder,
    getOrder : getOrder
};

Date.prototype.getLocalDate = function () {
    var x = new Date();
    x = this;
    var currentTimeZoneOffsetInHours = x.getTimezoneOffset() / 60;
    this.setHours(x.getHours() - currentTimeZoneOffsetInHours);
    return x;
}

Date.prototype.getDateStr = function () {
    return this.toISOString().replace('T', ' ').substr(0, 19);
}

Date.prototype.daysDiff = function (anotherDate) {
    
    // Copy date parts of the timestamps, discarding the time parts.
    //var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
    //var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());
    
    // Do the math.
    var millisecondsPerDay = 1000 * 60 * 60 * 24;
    var millisBetween = anotherDate.getTime() - this.getTime();
    var days = millisBetween / millisecondsPerDay;
    
    // Round down.
    return Math.ceil(days);
}

Date.prototype.dateAdd = function (interval, units) {
    var ret = new Date(); //don't change original date
    switch (interval.toLowerCase()) {
        case 'year': ret.setFullYear(this.getFullYear() + units); break;
        case 'quarter': ret.setMonth(this.getMonth() + 3 * units); break;
        case 'month': ret.setMonth(this.getMonth() + units); break;
        case 'week': ret.setDate(this.getDate() + 7 * units); break;
        case 'day': ret.setDate(this.getDate() + units); break;
        case 'hour': ret.setTime(this.getTime() + units * 3600000); break;
        case 'minute': ret.setTime(this.getTime() + units * 60000); break;
        case 'second': ret.setTime(this.getTime() + units * 1000); break;
        default       : ret = undefined; break;
    }
    return ret;
}

//Returns the Vehicle Search fields object for aggregation
function getVehicleSearchGroup() { 

    return {
        _id: {
            MAKER: "$MAKER", MODEL: "$MODEL", YEAR: "$YEAR", ENGINE: "$ENGINE", ENGINE_TYPE: "$ENGINE_TYPE", 
            GEAR: "$GEAR", DAILY_PRICE: "$DAILY_PRICE", FUEL_TYPE: "$FUEL_TYPE", DOORS: "$DOORS", 
            AIR_COND: "$AIR_COND", CAR_CATEGORY: "$CAR_CATEGORY", PIC_PATH: "$PIC_PATH", 
            PIC_PATH_2: "$PIC_PATH_2"
        }
    };
};

//Returns the Vehicle Search fields object to be returned
function getVehicleSearchFields() { 

    return  {
        _id: 0, VEHICLE_NUMBER: { $literal: "1111" }, MAKER: "$_id.MAKER", MODEL: "$_id.MODEL", YEAR: "$_id.YEAR",
        ENGINE: "$_id.ENGINE", ENGINE_TYPE: "$_id.ENGINE_TYPE", GEAR: "$_id.GEAR", DAILY_PRICE: "$_id.DAILY_PRICE", 
        FUEL_TYPE: "$_id.FUEL_TYPE", DOORS: "$_id.DOORS", AIR_COND: "$_id.AIR_COND", CAR_CATEGORY: "$_id.CAR_CATEGORY",
        PIC_PATH: "$_id.PIC_PATH", PIC_PATH_2: "$_id.PIC_PATH_2",
    };
};

//Returns the Vehicle Search crireria object
function getVehicleSearchFilter(vehcategory, fromDate, toDate, vehicleNumbers, inVehicleNumbers, searchOrders) {
    var filter = {};
    
    filter['STATUS'] = 1;
    
    if (vehicleNumbers !== '') {
        var nums = [];
        vehicleNumbers.forEach(function (entry) {
            if (entry.VEHICLE_NUMBER) {
                nums.push(entry.VEHICLE_NUMBER)
            }
            else if (entry.VEHICLE_NUMBER) {
                nums.push(entry.VEHICLE_NUMBER)
            }
            else {
                nums.push(entry)
            }
        });
        
        if (inVehicleNumbers) {
            filter['VEHICLE_NUMBER'] = { $in : nums };//'15-348-69';//vehicleNumbers.toString()
        }
        else {
            filter['VEHICLE_NUMBER'] = { $nin : nums };//'15-348-69';//vehicleNumbers.toString()
        }
    }
    
    if (vehcategory !== '*') {
        filter['CAR_CATEGORY'] = vehcategory.trim().toUpperCase();
    }

    if (searchOrders && (toDate)) {
        filter['dateIn'] ={ $gte : new Date()};
    }

    return filter;
};

//Search Vehicles available by criteria
 function searchVehicles(res, user , dateFrom, dateTo, 
                                         locationFrom, locationTo, age, vehCategory){
    
    var vehs = [];
    var vehsCount = [];
    var skip = 0;
    //var totalCount;
    var rentalDays = dateFrom.daysDiff(dateTo);

    var sort={};
    var filter = {};
    var limit = 10;
    
    var group = getVehicleSearchGroup();
    var fields = getVehicleSearchFields();
    

    //var searchCriteria = dateFrom.toLocaleString('en-GB') 
    //    + ' - ' + dateTo.toLocaleString('en-GB') + '. ';
    
    var searchCriteria = dateFrom.getLocalDate().getDateStr()
        + ' -- ' + dateTo.getLocalDate().getDateStr() + '. ';

    searchCriteria = searchCriteria + ' Pick up: ' + locationFrom + '. ';
    searchCriteria = searchCriteria + ' Return: ' + locationTo + '. ';
    searchCriteria = searchCriteria + ' Category: ' + vehCategory + '. ';//(!vehcategory =='*' ? ' Category: ' + vehcategory +'. ' :'');
    searchCriteria = searchCriteria + ' Driver age: ' + age + '. ';
    
    //set sorting object
    sort['DAILY_PRICE'] = 1;
    sort['MAKER'] = 1;
    sort['MODEL'] = 1;
    sort['GEAR'] = 1;
    
    //get orders to filter out rented vehicles
    ordersFilter = getVehicleSearchFilter(vehCategory, dateFrom, dateTo, '',false, true);
    //Order.find(ordersFilter).exec(function (err, ordrs) {
    findOrders(ordersFilter, {}, function (ordrs) {
        var rentedVehicles= getRentedVehicles(ordrs,dateFrom,dateTo)
        var filter = getVehicleSearchFilter(vehCategory, dateFrom, dateTo, rentedVehicles,false, false);

        Vehicle.aggregate(
            [
                { $match: filter },
                { $group: group },
                { $project: fields },
                { $sort: sort },
                { $limit: limit },
                { $skip: skip }
            ], function (err, vehs) {
                if (err) {
                    console.warn(err.message);
                }
                else if (vehs) {
                    //console.log(vehs);
                    //get the total records count
                    Vehicle.aggregate(
                        [
                            { $match: filter },
                            { $group: group },
                        ], function (err, vehsCount) {
                            if (err) {
                                console.warn(err.message);
                            }
                            else {
                                if (vehsCount.length) {
                                    setPrices(vehs, null , rentalDays, age);
                                    // vehs = vehs.sort(sort);

                                    res.send({
                                        screenName: 'vclList', user : user, searchCriteria: searchCriteria , vehicles: vehs, total: vehsCount.length
                                    });

                                    //res.render('vclList', {
                                    //    user : user, 
                                    //    searchCriteria: searchCriteria , 
                                    //    vehicles: vehs, 
                                    //    total: vehsCount.length
                                    //});
                                    
                                }
                            }
                        });


                }
            });
    });

}

//get page from the 'search vehicles' list by the page number
function getPage(res, criteria, orderBy,
        page, itemsOnPage, itemsOnPageChanged) {

    var vehs = [];
    var vehsCount = [];
    var categories;
    var ages;
    var sort = {};
    var ordersFilter= {};
    //parse criteria
    var criteriaObj = parseCriteria(criteria);

    var dateFrom = criteriaObj.dateFrom;
    var dateTo = criteriaObj.dateTo;
    var locationFrom = criteriaObj.locationFrom;
    var locationTo = criteriaObj.locationTo;
    var age = criteriaObj.age;
    var vehicleCategory = criteriaObj.vehicleCategory;
    var rentalDays = dateFrom.daysDiff(dateTo);
    
    var group = getVehicleSearchGroup();
    var fields = getVehicleSearchFields();
    var filter = getVehicleSearchFilter(vehicleCategory, dateFrom, dateTo,'', false, false);
    var skip = parseInt(itemsOnPage) * (parseInt(page) - 1);
    var limit = parseInt(itemsOnPage) * parseInt(page);//parseInt(itemsOnPage);
    orderBy = orderBy.trim().toUpperCase()

    if (orderBy === 'MAKER MODEL') {
        sort['MAKER'] = 1;
        sort['MODEL'] = 1;
    } 
    else {
        sort['DAILY_PRICE'] = 1;
        sort['MAKER'] = 1;
        sort['MODEL'] = 1;
    }
    //get orders to filter out rented vehicles
    ordersFilter = getVehicleSearchFilter(vehicleCategory, dateFrom, dateTo, '', false, true);
    findOrders(ordersFilter, {}, function (ordrs) {
        var rentedVehicles = getRentedVehicles(ordrs, dateFrom, dateTo)
        var filter = getVehicleSearchFilter(vehicleCategory, dateFrom, dateTo, rentedVehicles, false, false);

        Vehicle.aggregate(
            [
                { $match: filter },
                { $group: group },
                { $project: fields },
                { $sort: sort },
                { $limit: limit },
                { $skip: skip },
            ], function (err, vehs) {
                if (err) {
                    console.warn(err.message);
                }
                else if (vehs) {
                    //console.log(vehs);
                    //get the total records count
                    Vehicle.aggregate(
                        [
                            { $match: filter },
                            { $group: group }
                        ], function (err, vehsCount) {
                            if (err) {
                                console.warn(err.message);
                            }
                            else {
                                if (vehsCount.length) {
                                    setPrices(vehs, null , rentalDays, age);
                                    res.json( {
                                        vehicles: vehs, total: vehsCount.length
                                    });
                                }
                            }
                        });


                }
                
            });
        });
}

//get selected vehicle details with additional options available for this vehicle
function getVehicle(req, res, vehicleDescr, criteria) {
    
    var vehs = [];
    var addAccesses = [];
    var categories;
    var ages;

    //parse criteria
    var criteriaObj = parseCriteria(criteria);
    //KIA; PICANTO; 2015; 1200; AUTO; G; 5;
    var vehicleFilter = parseVehicleDescription(vehicleDescr);

    var dateFrom = criteriaObj.dateFrom;
    var dateTo = criteriaObj.dateTo;
    var locationFrom = criteriaObj.locationFrom;
    var locationTo = criteriaObj.locationTo;
    var age = criteriaObj.age;
    var vehicleCategory = criteriaObj.vehicleCategory;
    var rentalDays = dateFrom.daysDiff(dateTo);

    Vehicle.find(vehicleFilter).limit(1).exec(function (err, vehs) {
        if (err) {
            console.warn(err.message);
        }
        else {
            //console.log(location);
            if (vehs) {
                getAdditionalAccessories(function (addAccesses) {
                    if (addAccesses) {
                        addAccesses=filterAccessories(addAccesses,vehs[0])
                        setPrices(vehs, addAccesses, rentalDays, age);
                        //res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0,  post-check=0, pre-check=0');
                        //res.render('vclDetails', {
                        //    user : req.user, searchCriteria: criteria , vehicles: vehs, addAccessories: addAccesses
                        //});

                        res.send({
                            screenName: 'vclDetails', user : req.user, searchCriteria: criteria , vehicles: vehs, addAccessories: addAccesses
                        });
                    }

                })
            }
            else {
                console.log('null');
            }
        }
    });
}

//save selected vehicle and additional options
function saveOrder(req, res, vehicleDescr, vehPrice, criteria, carCategory, addOpps, remarks) {
    
    var vehs = [];
    var addAccesses = [];
    var ordrs = [];
    var ordersFilter = {};
    var categories;
    var ages;

    var foundVehicle ;
    //parse criteria
    var criteriaObj = parseCriteria(criteria);

    //parse vehicle descr
    var vehicleFilter = parseVehicleDescription(vehicleDescr);

    var dateFrom = criteriaObj.dateFrom;
    var dateTo = criteriaObj.dateTo;
    var locationFrom = criteriaObj.locationFrom;
    var locationTo = criteriaObj.locationTo;
    var age = criteriaObj.age;
    var vehicleCategory = criteriaObj.vehicleCategory;
    var rentalDays = dateFrom.daysDiff(dateTo);
    
    //check for duplicity data before saving. Build a filter
    var duplicateOrderFilter = {
        customer: req.user.username,
        locationOut: locationFrom,
        locationIn: locationTo,
        dateOut: dateFrom,
        dateIn: dateTo,
        driver_age: age,
        STATUS: 1,
        UPD_DATE: { $gte : new Date().dateAdd('minute',-1)}//get orders made in the last 3 minutes
    };

    //add vehicle category to the filter only if it's specified
    if (vehicleCategory !== '*') {
        duplicateOrderFilter.CAR_CATEGORY = vehicleCategory.trim().toUpperCase();
    }
    //check for duplicity data before saving.
    findOrders(duplicateOrderFilter, {}, function (duplicateOrders) {
        if (duplicateOrders.length === 0) {
            // check if this vehicle is available for these dates
            // search the orders for vehicles of this type in these dates
            // if the number is already taken then
            // first - get all vehicles of this type
            // second- get the first one available
            Vehicle.find(vehicleFilter).exec(function (err, vehs) {
                if (err) {
                    console.warn(err.message);
                }
                else if (vehs && vehs.length > 0) {
                    ordersFilter = getVehicleSearchFilter(vehicleCategory, dateFrom, dateTo, vehs, true, true);
                    findOrders(ordersFilter, {}, function (ordrs) {
                        //find a vehicle that is not in orders
                        if (ordrs.length === 0) {
                            foundVehicle = vehs[0];
                        }
                        else {
                            foundVehicle = getAvailableVehicle(vehs, ordrs, dateFrom, dateTo);
                        }
                        
                        //get order additional options array
                        if (!foundVehicle) {
                            res.render('message', {
                                user : req.user, message: 'This vehicle is no longer available. Please choose another vehicle.'
                            });
                        }
                        else {
                            var addOppsArr = [];
                            var addOppsArr = parseAddOpps(addOpps);
                            
                            //var order = new Order({ vehicle_number: vehicleNum, car_category: vehicleCategory,driver_age:age,dateOut:dateFrom,dateIn:dateTo });
                            var newOrder = {
                                customer: req.user.username,
                                VEHICLE_NUMBER: foundVehicle.VEHICLE_NUMBER,
                                CAR_CATEGORY: carCategory,
                                driver_age: age,
                                dateOut: dateFrom,
                                dateIn: dateTo,
                                locationOut: locationFrom,
                                locationIn: locationTo,
                                vehiclePrice: vehPrice,        
                                remarks: remarks,
                                STATUS: 1,
                                UPD_DATE: new Date()
                            }
                            
                            //fill the additional options
                            fillInOrderAddOps(addOppsArr, newOrder)
                            
                            //create new  order object from the mongoose model
                            var order = new Order(newOrder);
                            order.save(function (err) {
                                if (err) {
                                    console.warn(err.message);
                                }
                                else {
                                    console.warn('your order id: ' + order._id);
                                    var orderArr = [];
                                    orderArr.push(order);

                                    displaySavedOrder(req, res, orderArr, foundVehicle);
                                }
                            });
                        }
                    });
                }
                else {
                    //console.warn('This vehicle is no longer available. Please choose another vehicle.');
                    res.render('message', {
                        user : req.user, message:'This vehicle is no longer available. Please choose another vehicle.'
                    });
                }
            });
        }
        else { //display the earlier saved order
            console.warn('Duplicate order.');
            getVehicleByNum(duplicateOrders[0].VEHICLE_NUMBER, function (duplOrdVehs) {
                displaySavedOrder(req, res, duplicateOrders, duplOrdVehs[0]);
            });
        }
    });

}

//update an existing order. Allowed changes are: add/ remove additional options and remarks
function updateOrder(req, res, selectedOrder, cancel, addOppsStr, remarks) {
    var newData = {};
    if (cancel) {
        newData = { STATUS: 3, remarks: remarks, UPD_DATE: new Date() };
    }
    else if (!addOppsStr) {
        newData = { remarks: remarks, UPD_DATE: new Date() };
    }
    else {
        var addOppsArr = [];
        var addOppsArr = parseAddOpps(addOppsStr);

        newData = {
            remarks: remarks,
            UPD_DATE: new Date()
        }
        fillInOrderAddOps(addOppsArr,newData);
    }
    //call the update function 
    updateExistingOrder(selectedOrder, newData, function (savedOrd) {
        if (savedOrd) {
            //get the order vehicle
            getVehicleByNum(savedOrd.VEHICLE_NUMBER, function (vehs) {
                //get the order from db
                findOrders({ _id: selectedOrder }, {}, function (ordrs) {
                    //var addOps = getOrderAddOps(ordrs[0]);
                    ////get the vehicle price for the rental period from the order
                    //vehs[0].DAILY_PRICE = ordrs[0].vehiclePrice;
                    ////calculate the total order price including the additional options
                    //setOrdersTotalPrice(ordrs);
                    ////res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0,  post-check=0, pre-check=0');
                    //res.render('orderSaved', {
                    //    user : req.user, order: ordrs[0], vcl : vehs[0], addAccessories: addOps
                    //});
                    displaySavedOrder(req, res, ordrs, vehs[0]);
                });
            });
        }
    });
}

//display saved order. used in updateOrder and savedOrder
//savedOrUpdated: 1-saved, 2-updated
function displaySavedOrder(req, res, orders, vehicle, savedOrUpdated) {
    var addOps = getOrderAddOps(orders[0]);
    //get the vehicle price for the rental period from the order
    vehicle.DAILY_PRICE = orders[0].vehiclePrice;
    //calculate the total order price including the additional options
    setOrdersTotalPrice(orders);
    //res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0,  post-check=0, pre-check=0');

    //res.render('orderSaved', 
    //    { user : req.user, order: orders[0], vcl : vehicle, addAccessories: addOps }
    //);
    res.render('orderSaved', 
        { user : req.user, order: orders[0], vcl : vehicle, addAccessories: addOps }
    );

    var subject = 'your rental car order #' + orders[0]._id + ' from Fisher Rental Car was ' 
        + (savedOrUpdated === 1? 'saved':'updated');
       
    sendOrderEmail(res, orders[0], addOps, vehicle, req.user.username, subject);
}

//send order email
function sendOrderEmail(res, order, addOps, vehicle,to, mailSubject){
    //build a simple html with the order details 
    //get Order Mail Body and send email
    res.render('orderMail', { order: order, vcl : vehicle, addAccessories: addOps}, function (err, body) {
        if (err) {
            console.log(err);
        } else if (body) {
            sendEmail(to, mailSubject, body);
        }
    });
}

//general send email
function sendEmail(to, mailSubject, body) {

    var mail = {
        from: 'Fisher Rental Car <geniag91@gmail.com@gmail.com>',
        to: to,
        subject: mailSubject,
        //text: 'your rental car order #'+ orders[0]._id +' was saved',
        html: body
    }
            
    smtpTransport.sendMail(mail, function (err, response) {
        if (err) {
            console.log(err);
        } else {
            console.log("Message sent: " + response.message);
        }
        smtpTransport.close();
    });
}

//get order details and display it on the vclDetails screen
//allow to edit only if it's a future order
function getOrder(req, res, selectedOrder) {
    var vehicleNumber = '';
    var criteria = '';
    var age = '';
    var rentalDays = 0;
    var dateFrom = new Date();
    var dateTo = new Date();
    
    findOrders({ _id: selectedOrder }, {}, function (ordrs) {
    //Order.find({_id: selectedOrder}).exec(function (err, ordrs) {
    //    if (err) {
    //        console.warn(err.message);
    //    }
    //    else if (ordrs) {
        getVehicleByNum(ordrs[0].VEHICLE_NUMBER, function(vehs) {
            if (vehs) {
                getAdditionalAccessories(function(addAccesses) {
                    if (addAccesses) {
                        criteria = buildCriteriaFromOrder(ordrs[0]);
                        dateFrom = ordrs[0].dateOut;
                        dateTo = ordrs[0].dateIn;
                        rentalDays = dateFrom.daysDiff(dateTo);
                        age = ordrs[0].driver_age;
                        addAccesses = filterAccessories(addAccesses, vehs[0])
                        setPrices(vehs, addAccesses, rentalDays, age);
                        //res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0,  post-check=0, pre-check=0');
                        if (ordrs[0].STATUS === 3) { //canceled order. show user's orders
                            getOrdersHistory(req, res);
                        }
                        else { 
                            res.send( {
                                screenName: 'orderDetails', user : req.user, searchCriteria: criteria , vehicles: vehs, addAccessories: addAccesses, order: ordrs[0]
                            });
                        }
                    }
                });
            }
        });
    });

}

//get user's orders history
function getOrdersHistory(req, res) {
    var user = req.user.username;
    var ordersFilter = {customer: user, STATUS: 1};

    findOrders(ordersFilter,{dateOut:-1}, function(ordrs){
        if (ordrs) {
            setOrdersTotalPrice(ordrs);
            res.send( {
                screenName:'history', user : req.user, orders: ordrs
            });
        }
    });
}

//find existing order and update
function findOrders(ordersFilter, sortObject, callback){
    Order.find(ordersFilter).sort(sortObject).exec(function (err, ordrs) {
        if (err) {
            console.warn(err.message);
        }
        else if (ordrs) {
            callback(ordrs);
        }
    });
}
//find existing order and update
function updateExistingOrder(orderNum,newData,callback){
    Order.findOneAndUpdate({ _id: orderNum }, newData , { upsert: false }, function (err, savedOrd) {
        if (err) {
            console.warn(err.message);
        }
        else if (savedOrd) {
            console.warn('updated order id: ' + savedOrd._id);
            callback(savedOrd);
        }
    });
}

//gets vehicle from the DB by the specified Vehicle Number
function getVehicleByNum(vehicleNum, callback) {
    Vehicle.find({ VEHICLE_NUMBER: vehicleNum }).exec(function (err, vehs) {
        if (err) {
            console.warn(err.message);
        }
        else if (vehs) {
            //return vehs[0]
            callback(vehs);
        }
    });
}

//gets Additional Accessories from the DB 
function getAdditionalAccessories(callback) {
    AddAccessory.find(function (err, addAccesses) {
        if (err) {
            console.warn(err.message);
        }
        else if (addAccesses) {
            //return vehs[0]
            callback(addAccesses);
        }
    });
}

//parse vehicle search criteria that comes from different screens
function parseCriteria(criteria){
    //Vehicles available for dates 10/20/2015, 8:00:00 AM - 10/27/2015, 8:00:00 AM. Category: *. Driver age: 27+.
    var tmp = criteria.split('.');
    tmp[0] = tmp[0].replace('Vehicles available for dates ', '')
    //dates
    var dateFrom = new Date( tmp[0].split('--')[0].trim());
    var dateTo = new Date(tmp[0].split('--')[1].trim());

    //Pick up
    var pickupCar = tmp[1].replace(' Pick up: ', '').trim();

    //return
    var returnCar = tmp[2].replace(' Return: ', '').trim();

    //Category
    var category = tmp[3].replace(' Category: ', '').trim();

    //Age
    var age = tmp[4].replace(' Driver age: ', '').trim();
    if (age == '27') {
        age='27+'
    }
    var criteriaObject = {
        dateFrom: dateFrom, dateTo: dateTo, locationFrom: pickupCar, locationTo: returnCar, vehicleCategory: category, age: age
    };

    return criteriaObject;
}

//build a text that appears at the top of the order page
function buildCriteriaFromOrder(order) {
    //11/17/2015, 8:00:00 AM - 11/18/2015, 8:00:00 AM. Pick up: Tel Aviv. Return: Tel Aviv. Category: *. Driver age: 27+.
    //11/24/2015, 8:00:00 AM.11/29/2015, 8:00:00 AM. Pick up: Tel Aviv. Return: Tel Aviv. Category: ECONOMY. Driver age: 27+. 
    x.getLocalDate(x).getDateStr()
    //var criteria = order.dateOut.toLocaleString('en-GB') + '-';
    //criteria += order.dateIn.toLocaleString('en-GB') + '.';

    var criteria = order.dateOut.getLocalDate().getDateStr() + '-';
    criteria += order.dateIn.getLocalDate().getDateStr() + '.';
    criteria += ' Pick up: ' + order.locationOut + '.';
    criteria += ' Return: ' + order.locationIn + '.';
    criteria += ' Category: ' + order.CAR_CATEGORY + '.';
    criteria += ' Driver age: ' + order.driver_age + '.';

    return criteria;
}

//parse vehicle search criteria that comes from the vehicles list
function parseVehicleDescription(vehicleDescr){
    //KIA; PICANTO; 2015; 1200; AUTO; G; 5;
    var tmp = vehicleDescr.split(';');
   
    var maker = tmp[0].trim();
    var model = tmp[1].trim();
    var year = parseInt(tmp[2].trim());
    var engine = parseInt(tmp[3].trim());
    var gear = tmp[4].trim();
    var fuel_type = tmp[5].trim();
    var doors = parseInt(tmp[6].trim());

    var vehDescriptionObject = {
        MAKER: maker, MODEL: model, YEAR: year, ENGINE: engine, GEAR: gear, FUEL_TYPE: fuel_type, DOORS:doors
    };

    return vehDescriptionObject;
}

//parse vehicle order additional options
function parseAddOpps(addOpps){
    //GPS=40;Baby Seat=60;Tire Insurance=80;
    var tmp = addOpps.split(';');
    var newArr = [];

    tmp.forEach(function (entry) {
        addOppStr = entry.trim();
        if (addOppStr) {
            var addOpp = {};
            addOpp.name = addOppStr.split('=')[0];
            addOpp.price = parseInt(addOppStr.split('=')[1]);

            newArr.push(addOpp)
        }
    });

    return newArr;
}


//filter additional accessories of 'insurance type' 
//by the selected vehicle 's category 
function filterAccessories(addAccesses, vehicle) {

    var vehicleCategory = vehicle.CAR_CATEGORY.trim().toUpperCase();
    var newArr = [];
    var accName = '';
    //addAccesses.filter(function (el) { return el !== elementToRemove });
    if (addAccesses) {
        
        addAccesses.forEach(function (entry) {
            accName = entry.Name.trim().toUpperCase();

            if ((accName.indexOf("INSURANCE") > -1
                        && (accName.indexOf(vehicleCategory) > -1 || accName.indexOf("TIRE") > -1))
                        ||(accName.indexOf("INSURANCE") === -1)){

                newArr.push(entry)
            }
        });
        return newArr;
    }

}

//fill the additional options for a new or updated order
//addOppsArr - array or pairs "name-price"
function fillInOrderAddOps(addOppsArr, order) {
    
    order.addOp1 = (addOppsArr.length > 0 ? addOppsArr[0].name : null);
    order.addOp1Price = (addOppsArr.length > 0 ? addOppsArr[0].price : null);
    order.addOp2 = (addOppsArr.length > 1 ? addOppsArr[1].name : null);
    order.addOp2Price = (addOppsArr.length > 1 ? addOppsArr[1].price : null);
    order.addOp3 = (addOppsArr.length > 2 ? addOppsArr[2].name : null);
    order.addOp3Price = (addOppsArr.length > 2 ? addOppsArr[2].price : null);
    order.addOp4 = (addOppsArr.length > 3 ? addOppsArr[3].name : null);
    order.addOp4Price = (addOppsArr.length > 3 ? addOppsArr[3].price : null);
    order.addOp5 = (addOppsArr.length > 4 ? addOppsArr[4].name : null);
    order.addOp5Price = (addOppsArr.length > 4 ? addOppsArr[4].price : null);
    order.addOp6 = (addOppsArr.length > 5 ? addOppsArr[5].name : null);
    order.addOp6Price = (addOppsArr.length > 5 ? addOppsArr[5].price : null);
    order.addOp7 = (addOppsArr.length > 6 ? addOppsArr[6].name : null);
    order.addOp7Price = (addOppsArr.length > 6 ? addOppsArr[6].price : null);
    order.addOp8 = (addOppsArr.length > 7 ? addOppsArr[7].name : null);
    order.addOp8Price = (addOppsArr.length > 7 ? addOppsArr[7].price : null);
    order.addOp9 = (addOppsArr.length > 8 ? addOppsArr[8].name : null);
    order.addOp9Price = (addOppsArr.length > 8 ? addOppsArr[8].price : null);
    order.addOp10 = (addOppsArr.length > 9 ? addOppsArr[9].name : null);
    order.addOp10Price = (addOppsArr.length > 9 ? addOppsArr[9].price : null);

}

//get an array of the order additional options 
//used in the "Order successfully saved " screen
//only selected options returned
function getOrderAddOps(order) {
    var newArr = [];
    
    if (order.addOp1) { newArr.push({ Name: order.addOp1, Daily_Price: order.addOp1Price }) };
    if (order.addOp2) { newArr.push({ Name: order.addOp2, Daily_Price: order.addOp2Price }) };
    if (order.addOp3) { newArr.push({ Name: order.addOp3, Daily_Price: order.addOp3Price }) };
    if (order.addOp4) { newArr.push({ Name: order.addOp4, Daily_Price: order.addOp4Price }) };
    if (order.addOp5) { newArr.push({ Name: order.addOp5, Daily_Price: order.addOp5Price }) };
    if (order.addOp6) { newArr.push({ Name: order.addOp6, Daily_Price: order.addOp6Price }) };
    if (order.addOp7) { newArr.push({ Name: order.addOp7, Daily_Price: order.addOp7Price }) };
    if (order.addOp8) { newArr.push({ Name: order.addOp8, Daily_Price: order.addOp8Price }) };
    if (order.addOp9) { newArr.push({ Name: order.addOp9, Daily_Price: order.addOp9Price }) };
    if (order.addOp10) { newArr.push({ Name: order.addOp10, Daily_Price: order.addOp10Price }) };
    
    return newArr;
}

//Set prices for vehicles by Rental Days and driver's age
function setPrices(vehicles, addAccesses, rentalDays, driverAge){
    var index = 1;
    if (driverAge === '18-21') { 
        index=index*1.1
    }

    vehicles.forEach(function(entry) {
        entry.DAILY_PRICE=Math.round(entry.DAILY_PRICE*rentalDays*index);
    });

    if (addAccesses) {
        addAccesses.forEach(function (entry) {
            if (entry.Name.trim().toUpperCase().indexOf("INSURANCE") > -1) {
                entry.Daily_Price = Math.round(entry.Daily_Price * rentalDays * index);
            }
            else {
                entry.Daily_Price = Math.round(entry.Daily_Price * rentalDays)
            }

        });
    }
}

//Check if the new order dates do not overlap with the existing orders
//for vehicles that fit order criteria
//returns first vehicle available
function getAvailableVehicle(vehicles, orders, newDateFrom, newDateTo){

    for (var i = 0; i < vehicles.length; i++) {
    //vehicles.forEach(function (vehEntry) {
        var found=false;
        //orders.forEach(function (orderEntry) {
        for (var j = 0; j < orders.length; j++) {
            if (vehicles[i].VEHICLE_NUMBER.trim() === orders[j].VEHICLE_NUMBER.trim()) {
                if (newDateFrom > orders[j].dateIn) {
                    found = false;
                }
                else if ((newDateFrom >= orders[j].dateOut && newDateFrom <= orders[j].dateIn)||
                    (newDateTo >= orders[j].dateOut && newDateTo <= orders[j].dateIn)) { 

                    found = true;
                }

            }
        };

        if (!found) {
            return vehicles[i];
        }
    };
}

//Check if the new order dates overlap with the existing orders
//for vehicles that fit order criteria
//returns ALL rented vehicles
function getRentedVehicles(orders, newDateFrom, newDateTo) {
    var rentedVehicles = [];
    var rented = false;

    orders.forEach(function (orderEntry) {

        if (newDateFrom > orderEntry.dateIn) {
            rented = false;
        }
        else if ((newDateFrom >= orderEntry.dateOut && newDateFrom <= orderEntry.dateIn) ||
            (newDateTo >= orderEntry.dateOut && newDateTo <= orderEntry.dateIn)) {
                
            rented = true;
        }

        if (rented) {
            rentedVehicles.push(orderEntry.VEHICLE_NUMBER);
        }
        
    });

    return rentedVehicles;
};

//sets total price for orders (vehicle + additional options)
function setOrdersTotalPrice(orders) {
    orders.forEach(function (orderEntry) {
        orderEntry.vehiclePrice += (orderEntry.addOp1 != null ? orderEntry.addOp1Price : 0);
        orderEntry.vehiclePrice += (orderEntry.addOp2 != null ? orderEntry.addOp2Price : 0);
        orderEntry.vehiclePrice += (orderEntry.addOp3 != null ? orderEntry.addOp3Price : 0);
        orderEntry.vehiclePrice += (orderEntry.addOp4 != null ? orderEntry.addOp4Price : 0);        
        orderEntry.vehiclePrice += (orderEntry.addOp5 != null ? orderEntry.addOp5Price : 0);
        orderEntry.vehiclePrice += (orderEntry.addOp6 != null ? orderEntry.addOp6Price : 0);
        orderEntry.vehiclePrice += (orderEntry.addOp7 != null ? orderEntry.addOp7Price : 0);
        orderEntry.vehiclePrice += (orderEntry.addOp8 != null ? orderEntry.addOp8Price : 0);               
        orderEntry.vehiclePrice += (orderEntry.addOp9 != null ? orderEntry.addOp9Price : 0);
        orderEntry.vehiclePrice += (orderEntry.addOp10 != null ? orderEntry.addOp10Price : 0);   
        
    });
}
    