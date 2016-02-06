var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Help_ChatSchema = new Schema({
    message: String,
    user: String,
    msg_date: Date,
    isUser: Number
}, { collection : 'help_chats' });


module.exports = mongoose.model('Help_Chat', Help_ChatSchema, 'help_chats');