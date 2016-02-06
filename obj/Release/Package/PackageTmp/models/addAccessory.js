var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AddAccessorySchema = new Schema({
    _id: String,
    Name: String,
    Daily_Price: Number
}, { collection : 'AddAccessories' });


module.exports = mongoose.model('AddAccessory', AddAccessorySchema, 'AddAccessories');