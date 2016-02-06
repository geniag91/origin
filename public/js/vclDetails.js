var curr_order = {};

$(document).ready(function () {
    document.getElementById("remarks").maxLength = "300";

    //if this is an existing order then display order accessories
    //if (document.getElementById("criteriaHeader").textContent.indexOf('Rental Order #')>0) {
    //if ($("#criteriaHeader")[0].textContent.indexOf('Vehicle Order #')>0) {
        //if (g_order){
        //    curr_order = g_order;
        //    checkOrderAccessories();
        //}
    //}
});

function showWaitCursor(){
    var ldiv = document.getElementById('loadingDiv');
    ldiv.style.display = 'block';
    /*Do your ajax calls, sorting or laoding, etc.*/
    //ldiv.style.display = 'none';
}

//function checkOrderAccessories() {
//    var recalc = false;
//    //check existing add option
//    function setAccessory(accName, accprice) {
//        var inputs = document.querySelectorAll('input[type=checkbox]');
//        for (var i = 0; i < inputs.length; i++) {
//            var thisName = inputs[i].parentNode.getElementsByClassName('nameLabel')[0].outerText;
//            if (thisName === accName) {
//                inputs[i].parentNode.getElementsByClassName('checkBox')[0].checked = true;
//                recalc = true;
//            }
//        };
//    }

//    //check existing add options
//    if (curr_order.addOp1) {setAccessory (curr_order.addOp1,curr_order.addOp1Price)};
//    if (curr_order.addOp2) {setAccessory (curr_order.addOp2,curr_order.addOp2Price)};
//    if (curr_order.addOp3) {setAccessory (curr_order.addOp3,curr_order.addOp3Price)};
//    if (curr_order.addOp4) {setAccessory (curr_order.addOp4,curr_order.addOp4Price)};
//    if (curr_order.addOp5) {setAccessory (curr_order.addOp5,curr_order.addOp5Price)};
//    if (curr_order.addOp6) {setAccessory (curr_order.addOp6,curr_order.addOp6Price)};
//    if (curr_order.addOp7) { setAccessory(curr_order.addOp7,curr_order.addOp7Price)};
//    if (curr_order.addOp8) { setAccessory(curr_order.addOp8,curr_order.addOp8Price)};
//    if (curr_order.addOp9) { setAccessory(curr_order.addOp9,curr_order.addOp9Price)};
//    if (curr_order.addOp10) { setAccessory(curr_order.addOp10,curr_order.addOp10Price)};

//    //calculate total sum
//    if (recalc){
//        calcSum(false);
//    }
//}

$('#orderBtns').on('click', '.btn', function (e) {
    if (e.toElement.id === "cancelOrder") { 
        e.preventDefault();
        $('#myModal').modal();
    }
    else if (e.toElement.id === "Order") { 
        if (document.getElementById("navBarUl").textContent.toUpperCase().indexOf("LOGIN") > -1) {
            e.preventDefault();
            $('#myModal').modal();
        }
        else {
            showWaitCursor();
            var addOpps = calcSum(true);
            $(this).attr('disabled', 'disabled');
            this.parentNode.href = this.parentNode.href + addOpps + '&remarks=' + document.getElementById("remarks").value.trim();
        }
    }
});

//$("#Order").click(function (e) {
//    if (document.getElementById("navBarUl").textContent.toUpperCase().indexOf("LOGIN") > -1){
//        e.preventDefault();
//        $('#myModal').modal();
//    }
//    else {
//        showWaitCursor();
//        var addOpps = calcSum(true);
//        $(this).attr('disabled', 'disabled');
//        this.parentNode.href =this.parentNode.href + addOpps + '&remarks=' + document.getElementById("remarks").value.trim();
//    }
//});

//$("#cancelOrder").click(function (e) {
//    e.preventDefault();
//    $('#myModal').modal();
//    //this.parentNode.href =this.parentNode.href+ '&remarks=' + document.getElementById("remarks").value.trim();
    
//});

$("#cancelOk").click(function (e) {
    showWaitCursor();
    this.parentNode.href = this.parentNode.href + '&remarks=' + document.getElementById("remarks").value.trim();
    $(this).attr('disabled', 'disabled');
});

//$('#imgs').on('click', 'li', function () {
    
//    // `this` is the DOM element that was clicked
//    //if (this.parentNode == document.getElementById("page")) {
//    var ref = $(this).find('a').attr("innerText");
//    document.getElementById("viewer").src = ref;
//});

$('#mainPanel').on('change', 'input:checkbox', function (event) {
    calcSum(false);
});

function calcSum(finalCall){
    var totalPrice = 0;
    var addOpps = '&addOpps=';
    var vehPrice = parseInt(document.getElementById("vehiclePrice").outerText, 10);
    totalPrice = vehPrice;
    var inputs = document.querySelectorAll('input[type=checkbox]:checked');
    //var inpts = document.getElementsByClassName('priceLabel');//"badge priceLabel"
    //var inputs = document.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
        //if (inputs[i].type == "checkbox" && inputs[i].checked == true) {
        //totalPrice = totalPrice + parseInt(inputs[i].labels[0].getElementsByClassName('priceLabel')[0].outerText,10);
        var thisPrice=parseInt(inputs[i].parentNode.getElementsByClassName('priceLabel')[0].outerText, 10);
        totalPrice = totalPrice + thisPrice;
        if (finalCall){
            addOpps = addOpps + inputs[i].labels[0].innerText + '=' + thisPrice + ';';
        }
    };

    $('#totalPrice').text(totalPrice + ' ₪');
    return addOpps;
};

