var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VehicleSchema = new Schema( {
    _id: String,
    VEHICLE_NUMBER: String,
    MAKER: String,
    MODEL: String,
    YEAR: Number,
    ENGINE: Number,
    ENGINE_TYPE: String,
    GEAR: String,
    FUEL_TYPE: String,
    DOORS: Number,
    AIR_COND: Number,
    CURRENT_ODO: Number,
    CAR_CATEGORY: String,
    STATUS: Number,
    UPD_DATE: Date,
    PIC_PATH: String,
    PIC_PATH_2: String,
    DAILY_PRICE: Number,
    }, { collection : 'vehicles' });

//"_id" : "13-347-67", "VEHICLE_NUMBER" : "13-347-67", "MAKER" : "TOYOTA", "MODEL" : "COROLA", "YEAR" : 2015,
//"ENGINE" : 1600, "ENGINE_TYPE" : "", "GEAR" : "AUTO",
//"FUEL_TYPE" : "G", "DOORS" : 4, "AIR_COND" : 1, "CURRENT_ODO" : 300000, "CAR_CATEGORY" : "FAMILY", 
//"STATUS" : 1, "UPD_DATE" : ISODate("2015-08-16T14:38:42.1

module.exports = mongoose.model('Vehicle', VehicleSchema, 'vehicles');