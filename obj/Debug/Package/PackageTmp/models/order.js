var mongoose = require('mongoose');
var Schema = mongoose.Schema;

autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

var OrderSchema = new Schema({
    customer: String,
    VEHICLE_NUMBER: String,
    CAR_CATEGORY: String,
    driver_age:String,
    dateOut: Date,
    dateIn: Date,
    locationOut: String,
    locationIn: String,
    vehiclePrice:Number,
    addOp1:String,
    addOp1Price: Number,
    addOp2:String,
    addOp2Price: Number,
    addOp3:String,
    addOp3Price: Number,    
    addOp4:String,
    addOp4Price: Number,       
    addOp5:String,
    addOp5Price: Number,
    addOp6:String,
    addOp6Price: Number,    
    addOp7:String,
    addOp7Price: Number,   
    addOp8:String,
    addOp8Price: Number,  
    addOp9:String,
    addOp9Price: Number,
    addOp10:String,
    addOp10Price: Number,         
    remarks: String,
    STATUS: Number,
    UPD_DATE: Date
}, { collection : 'orders' });

OrderSchema.plugin(autoIncrement.plugin, { model: 'Order', startAt: 1 });

//"_id" : "13-347-67", "VEHICLE_NUMBER" : "13-347-67", "MAKER" : "TOYOTA", "MODEL" : "COROLA", "YEAR" : 2015,
//"ENGINE" : 1600, "ENGINE_TYPE" : "", "GEAR" : "AUTO",
//"FUEL_TYPE" : "G", "DOORS" : 4, "AIR_COND" : 1, "CURRENT_ODO" : 300000, "CAR_CATEGORY" : "FAMILY", 
//"STATUS" : 1, "UPD_DATE" : ISODate("2015-08-16T14:38:42.1

module.exports = mongoose.model('Order', OrderSchema, 'orders');