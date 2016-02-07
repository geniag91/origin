Date.prototype.isDate = function (d) {
    if (Object.prototype.toString.call(d) === "[object Date]") {
        // it is a date
        if (isNaN(d.getTime())) {  // d.valueOf() could also work
            return false;
        }
        else {
            return true;
        }
    }
    else {
        return false;
    }
}

Date.prototype.addDays = function (days) {
    var ms = new Date().getTime() + (86400000 * days);
    var added = new Date(ms);
    return added;
}

Date.prototype.dayName=function(dateString){
    var daysOfWeek = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    return daysOfWeek[new Date(dateString).getDay()];
}

Date.prototype.dayName=function(dayNum){
    var daysOfWeek = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    return daysOfWeek[dayNum];
}

Date.prototype.daysDiff=function(anotherDate) {
    
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

Date.prototype.getLocalDate = function () {
    var x = new Date();
    
    var currentTimeZoneOffsetInHours = x.getTimezoneOffset() / 60;
    x = this;
    this.setHours(x.getHours() - currentTimeZoneOffsetInHours);
    return x;
}

Date.prototype.getDateStr = function () {
    return this.toISOString().replace('T', ' ').substr(0, 19);
}

Array.prototype.itemByProp = function arrayObjectIndexOf(property, value) {
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i][property] === $.trim(value)) return this[i];
    }
    return -1;
}

Array.prototype.indexOf = function arrayObjectIndexOf(property, value) {
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i][property] === $.trim(value)) return i;
    }
    return -1;
}

function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    //alert (email);
    //return re.test(email);
    return true;
}