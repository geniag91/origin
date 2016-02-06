//$('#send-message-btn').click(function () {
function ValidateVclSearch() {
    var msg = ''
    var dateFrom = new Date($('#dateFrom').val()+ ' ' +$('#hourFrom').val());
    var dateTo = new Date($('#dateTo').val() + ' ' + $('#hourTo').val());

    if (!new Date().isDate(dateFrom)) { return false;}
    if (!new Date().isDate(dateTo)) { return false; }

    var hrFrom = $('#hourFrom').val();
    var hrTo = $('#hourTo').val();
    var scope = angular.element("#divAng").scope();
    var locOut = scope.data.locations.itemByProp('Name', $('#locationFrom option:selected').text());
    var locIn = scope.data.locations.itemByProp('Name', $('#locationTo option:selected').text());
    //var locOut = g_locations.itemByProp('Name', $('#locationFrom option:selected').text());
    //var locIn = g_locations.itemByProp('Name',$('#locationTo option:selected').text());

    //check if dates are valid
    if (dateTo <= dateFrom) {
        msg = '"From Date" cannot be later than or equal "To Date". ';
        $('#dateTo').first().css('border-color','red');
    };
    
    
    //check if pickup and return car location and time are at the legal day od week and time 
    var locationCheck = function (loc,dt,hr,ctrl) {
        var days = parseInt(loc.Opening_Days);//   /(.*days\s+)(.*)(\s+hours.*)/;
        var hrs = loc.Opening_Hours;//    /(.*hours\s+)(.*)(\s+).*)/;
        var retVal = '';

        if (days !== '7') {
            var tmpDate = new Date(dt);
            var day = tmpDate.getDay();
            if (day === days) {
                retVal = loc.Name + ' station is not open on ' + dt.dayName(day) + 's <br />';
            }
        }
        
        var locHrFrom=hrs.split('-')[0];
        var locHrTo=hrs.split('-')[1];
        
        if (parseInt(hr) < parseInt(locHrFrom) || parseInt(hr) > parseInt(locHrTo)) {
            retVal = retVal + loc.Name + ' station is not open at this hour- ' + hr + '<br />';
            retVal = retVal + loc.Name + ' station is open at ' + hrs + '<br />';
        }
        if (retVal) {
            ctrl.first().css('border-color', 'red');
        }
        return retVal;
    };
    
    msg = msg + locationCheck(locOut,dateFrom,hrFrom, $('#hourFrom')) + (msg !== '' ? '<br />' : '');
    msg = msg + locationCheck(locIn,dateTo,hrTo, $('#hourTo'));

    $('#messages').html(msg);
   
    if (msg === '') {
        //alert('2');
        return true;
    }
    else {
        //alert('3');
        return false
    }

};


$(document).ready(function () {


    var today = new Date();
    today.setHours(8, 0, 1);
    var tomorrow = new Date().addDays(1);
    tomorrow.setHours(8, 0, 0);
    var afterTomorrow = new Date().addDays(2);
    afterTomorrow.setHours(8, 0, 0);

    $('#dateFrom').datepicker({
        format: 'mm/dd/yyyy',
        startDate: tomorrow,
        autoclose: true
    })
        .on('changeDate', function (e) {
        // Revalidate the date field
        $('#datepicker').formValidation('revalidateField', 'dateFrom');
    });

    $('#dateTo').datepicker({
        format: 'mm/dd/yyyy',
        startDate: afterTomorrow,
        autoclose: true
    })
        .on('changeDate', function (selected) {
        // Revalidate the date field
        $('#datepicker').formValidation('revalidateField', 'dateTo');
    });
    

    $('#submit').on('click', function (event) {
        $('#datepicker').formValidation('revalidateField', 'dateFrom');
        $('#datepicker').formValidation('revalidateField', 'dateTo');
        //ValidateVclSearch();
        if (!ValidateVclSearch()) {
            event.preventDefault();
        }
        else {
            //var dateFrom = new Date(req.body.dateFrom + ' ' + req.body.hourFrom);
            //var dateTo = new Date(req.body.dateTo + ' ' + req.body.hourTo);
            //functions.searchVehicles(res, req.user, dateFrom, dateTo, req.body.locationFrom, req.body.locationTo, req.body.age, req.body.category);
            
            var dateFrom = $('#dateFrom').val() + ' ' + $('#hourFrom').val();
            var dateTo = $('#dateTo').val() + ' ' + $('#hourTo').val();

            var locOut = $('#locationFrom option:selected').text();
            var locIn = $('#locationTo option:selected').text();

            var category = $('#category option:selected').text();
            var age = $('#age option:selected').text();

            //$('#formVclSearch').submit();
            this.parentNode.href = this.parentNode.href + 'dateFrom=' + dateFrom + '&dateTo=' + dateTo  + '&locOut=' + locOut  + '&locIn=' + locIn  + '&category=' + category  + '&age=' + age ;
        }
    });

    $('#datepicker').formValidation({
        framework: 'bootstrap',
        icon: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            name: {
                validators: {
                    notEmpty: {
                        message: 'The name is required'
                    }
                }
            },
            dateFrom: {
                validators: {
                    notEmpty: {
                        message: 'The date is required'
                    },
                    date: {
                        min: today,
                        format: 'MM/DD/YYYY',
                        message: 'The date is not a valid'
                    }
                }
            },
            dateTo: {
                validators: {
                    notEmpty: {
                        message: 'The date is required'
                    },
                    date: {
                        min: tomorrow,
                        format: 'MM/DD/YYYY',
                        message: 'The date is not a valid'
                    }
                }
            }
        }
    })


    .on('success.validator.fv', function (e, data) {
        e.target.style.borderColor= 'red';
        if ((data.field === 'dateFrom' || data.field === 'dateTo') && data.validator === 'date' && data.result.date) {
            // The eventDate field passes the date validator
            // We can get the current date as a Javascript Date object
            var currentDate = data.result.date,
                day = currentDate.getDay();
            
            // If the selected date is Sunday
            if (day === 6) {
                e.target.style.borderColor = 'red';
                // Treat the field as invalid
                data.fv
                    .updateStatus(data.field, data.fv.STATUS_INVALID, data.validator)
                    .updateMessage(data.field, data.validator, 'Please choose a day except Saturday');

            } else {
                e.target.style.borderColor = 'green';
                // Reset the message
                data.fv.updateMessage(data.field, data.validator, 'The date is not valid');
            }
        }
    });
});





