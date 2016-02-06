var socket = io.connect('http://localhost:3000');

$(document).ready(function () {
    var navBarText = document.getElementById("navBarUl").textContent;
    if (navBarText.toUpperCase().indexOf("LOGGED IN AS ") > -1) {
        var emlStart = navBarText.toUpperCase().indexOf("LOGGED IN AS ") + 13;
        var emlEnd = navBarText.toUpperCase().indexOf("MY ORDERS");
        var eml = navBarText.substring(emlStart, emlEnd).trim();
        //alert(eml);
        socket.emit('join',  {email:eml });
    }
});

$('#send-message-btn').click(function () {
    var msg = $('#message-box').val();
    socket.emit('chat', msg);
    $('#messages').append($('<div class="row"> <div class="col-xs-12 col-sm-12"> <p> <label style="background-color:lightblue;margin-left: 5px;border-radius: 4px 4px 4px 4px;">' + msg + '</p>'));
    $('#message-box').val('');
    return false;
});

$('#message-box').on('keydown', function (e) {
    if (e.which == 13 && $('#message-box').val()!='') {
        var msg = $('#message-box').val();
        socket.emit('chat', msg);
        $('#messages').append($('<div class="row"> <div class="col-xs-12 col-sm-12"> <p> <label style="background-color:lightblue;margin-left: 5px;border-radius: 4px 4px 4px 4px;">' + msg + '</p>'));
        $('#message-box').val('');
        return false;
    }
});

socket.on('chat', function (msg) {
    if (msg.indexOf('~~~1~~~') > -1) { 
        msg= msg.replace('~~~1~~~', ''); 
        $('#messages').append($('<div class="row"> <div class="col-xs-12 col-sm-12"> <p> <label style="background-color:lightblue;margin-left: 5px;border-radius: 4px 4px 4px 4px; ">' + msg + '</p>'));
    }
    else {
        $('#messages').append($('<div class="row"> <div class="col-xs-12 col-sm-12"> <p> <label style="float: right;text-align: right;background-color:lightgrey;margin-right: 5px;border-radius: 4px 4px 4px 4px;">' + msg + '</p>'));
    }
});