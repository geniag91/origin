
//$('#send-message-btn').click(function () {
function onSubmitCheckLogin() {
    var msg = ''
    
    if ($('#username').val() == '') {
        //alert('1');
        msg = 'Email is a mandatory field. ';
    }
    else if (!validateEmail($('#username').val())) {
        msg = 'Email is invalid. ';
    };
    
    if ($('#password').val() == '') {
        msg += 'password is a mandatory field.';
    }
    
    $('#messages').text(msg);
    
    if (msg === '') {
        //alert('2');
        return true;
    }
    else {
        //alert('3');
        return false
    }

};




