var socketio = require('socket.io');
var Help_chat = require('../models/help_chat');
var msgsDispalyed=0;
var chatDispalyed = 0;
var lastChat = '';

module.exports.listen = function (app, server, currUser, io) {

    //if (!io){
        io = socketio(server);
        io.listen(process.env.socketIOPort, function () {
            console.log('Express server listening on port' + process.env.socketIOPort);
        });
    //}


    io.on('connection', function (socket) {
        var sockId = socket.id;
        console.log('a user connected');
        //msgsDispalyed = 0;
        var dt = new Date();
        dt = dt.dateAdd('hour', -1)
        var filter = {};
        if (currUser && msgsDispalyed===0){
            
            io.sockets.connected[sockId].emit('chat', 'Hello, ' + currUser.username);
            filter['msg_date'] = { $gte : dt };
            filter['user'] = currUser.username;
        
            // if there are messages earlier in thr last hour, display them
            var stream = Help_chat.find(filter).limit(10).stream();
            stream.on('data', function (chat) {
                console.log('emitting chat');
                io.sockets.connected[sockId].emit('chat', chat.message + (chat.isUser === 1 ? '~~~1~~~' : ''));
            });
            msgsDispalyed = 1;
        }
        
        io.sockets.connected[sockId].on('chat',function(msg) {
            //io.sockets.in(currUser.username).on('chat',function(msg) {

            if (lastChat==='' || lastChat.toUpperCase().trim()!=msg.toUpperCase().trim()) {
                saveChat(msg, 1);
                saveChat(msg + ' my answer', 0, onSaveMyMsg);
                
                //chatDispalyed = 1;
                lastChat = msg;
            }

            function saveChat(mssg, isUserMsg, callback) {
                var chat = new Help_chat({ user: currUser.username, message: mssg, msg_date: new Date(), isUser: isUserMsg });
                    
                chat.save(function (err) {
                    if (err) {
                        console.warn(err.message);
                    }
                    else {
                        console.warn('message saved');
                        if (callback) {
                            callback();
                        }
                    }
                //io.sockets.connected[sockId].emit('chat', msg);
                //io.sockets.in(currUser.username).emit('chat', { msg: msg });
                });
            }
                
            function onSaveMyMsg() {
                io.sockets.connected[sockId].emit('chat', msg + ' my answer');
            }
        });

        socket.on('join', function (data) {
            socket.join(data.email); // We are using room of socket io
        });

        socket.on('disconnect', function () {
            
            console.log('user disconnected');
            //socket.disconnect('unauthorized');
            socket.disconnect(true);
            msgsDispalyed = 0;
            lastChat = '';
            //chatDispalyed = 0;
            socket.removeAllListeners();
        });

    });
    

    return io;
}


//function openHelpScreen(req, res){

// server = http.createServer(app);
// io = require('socket.io')(server);
//    if (app) {

//        server.listen(app.get('port'), function () {
//            console.log('Express server listening on port ' + app.get('port'));
//        });
       

        
//    }

//}

//io.on('connection', function (socket) {
//    console.log('a user connected');
    
//    //mongo.connect("mongodb://localhost:27017/myDb", function (err, db) {
//    //    if (err) {
//    //        console.warn(err.message);
//    //    } else {
//    //        var collection = db.collection('chat messages')
//    //        var stream = collection.find().sort().limit(10).stream();
//    //        stream.on('data', function (chat) { console.log('emitting chat'); socket.emit('chat', chat.content); });
//    //    }
//    //});
    
//    socket.on('disconnect', function () {
//        console.log('user disconnected');
//    });
    
//    socket.on('chat', function (msg) {
//        //mongo.connect("mongodb://localhost:27017/myDb", function (err, db) {
//        //    if (err) {
//        //        console.warn(err.message);
//        //    } else {
//        //        var collection = db.collection('chat messages');
//        //        collection.insert({ content: msg }, function (err, o) {
//        //            if (err) { console.warn(err.message); }
//        //            else { console.log("chat message inserted into db: " + msg); }
//        //        });
//        //    }
//        //});
        
//        socket.broadcast.emit('chat', msg);
//    });
//});

//jade 
//script(type = 'text/javascript' src='/socket.io/socket.io.js')
//think about dividing the functions.js

////client side code
//var socket = io();
//$('#send-message-btn').click(function () {
//    var msg = $('#message-box').val();
//    socket.emit('chat', msg);
//    $('#messages').append($('<p>').text(msg));
//    $('#message-box').val('');
//    return false;
//});
//socket.on('chat', function (msg) {
//    $('#messages').append($('<p>').text(msg));
//});
