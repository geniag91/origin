var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LocationSchema = new Schema({
    _id:String,
    Name: String,
    Opening_Hours: String,
    Opening_Days: String,
}, { collection : 'locations' });


module.exports = mongoose.model('Location', LocationSchema, 'locations');