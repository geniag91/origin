var currentPage=1;

//$("li").click(function () {
    
//    // `this` is the DOM element that was clicked
//    if (this.parentNode== document.getElementById("page")){
//        var index = this.outerText;
//        var itemsOnPage = document.getElementById("itemsOnPage").value;
//        //window.location.href = '/page?pageNum=' + index + '&itemsOnPage=' + document.getElementById("itemsOnPage").value;
//        if (!(index === '«' && currentPage === 1) && !(index === '»' && (currentPage === (this.parentNode.childElementCount-2)))) {
//            if (index === '«') {
//                index = currentPage - 1;
//            }
//            if (index === '»') {
//                index = currentPage + 1;
//            }
//            index = parseInt(index, 10);
//            getVehicles(index, itemsOnPage,0);
//            //this.parentNode.childNodes[index - 1].addClass('active');
//            currentPage = index;
//        }
//    }
//});

 function itemsOnPageChanged () {
    var a = document.getElementById("itemsOnPage");
    itemsOnPage = a.value;
    //window.locat.0ion.href = '/page?pageNum=1&itemsOnPage=' + this.value;
    if (itemsOnPage>0){
        getVehicles(1, itemsOnPage, 1);
        currentPage = 1;
    }
};

function orderByChanged () {
    var b = document.getElementById("itemsOnPage");
    var itemsOnPage = b.value;
    if (itemsOnPage > 0) {
        getVehicles(1, itemsOnPage, 0);
        currentPage = 1;
    }
};

//document.getElementById("itemsOnPage").onchange = function () {
//    //window.location.href = '/page?pageNum=1&itemsOnPage=' + this.value;
//    getVehicles(1, this.value, 1);
//    currentPage = 1;
//};

//document.getElementById("orderBy").onchange = function () {
//    var itemsOnPage = document.getElementById("itemsOnPage").value;
//    getVehicles(1, itemsOnPage, 0);
//    currentPage = 1;
//};

$('#page').on('click', 'li', function () {
    
    // `this` is the DOM element that was clicked
    //if (this.parentNode == document.getElementById("page")) {
        var index = this.outerText;
        var itemsOnPage = document.getElementById("itemsOnPage").value;
        //window.location.href = '/page?pageNum=' + index + '&itemsOnPage=' + document.getElementById("itemsOnPage").value;
        if (!(index === '«' && currentPage === 1) && !(index === '»' && (currentPage === (this.parentNode.childElementCount - 2)))) {
            if (index === '«') {
                index = currentPage - 1;
            }
            if (index === '»') {
                index = currentPage + 1;
            }
            index = parseInt(index, 10);
            getVehicles(index, itemsOnPage, 0);
            //this.parentNode.childNodes[index - 1].addClass('active');
            currentPage = index;
        }
    //}
});



// Fill table with data
function getVehicles(page,itemsOnPage, itemsOnPageChanged) {
    // Empty content string
    itemsOnPage= parseInt(itemsOnPage, 10);
    var vehiclesContent = '';
    var counter = (page - 1) * itemsOnPage;
    var searchCriteria = document.getElementById("criteriaLabel").outerText;
    // jQuery AJAX call for JSON
    $.getJSON('/page?pageNum=' + page + '&itemsOnPage=' + itemsOnPage 
        + '&itemsOnPageChanged=' + itemsOnPageChanged
        + '&criteria=' + searchCriteria
        + '&orderBy=' + document.getElementById("orderBy").value , function (data) {
        
        // For each item in our JSON, add a vehicle to the content string
        $.each(data.vehicles, function () {
            counter = counter + 1;
            vehiclesContent += '<div class="row"><div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">';
            vehiclesContent += '<panel><div class="panel-default">';
            vehiclesContent += '<div class="row"><div class="col-xs-8 col-sm-8 col-md-8 col-lg-8">';
            vehiclesContent += '<panel><div class="panel-default"><div class="panel-heading">';
            vehiclesContent += counter + '. ' + this.MAKER + ' ' + this.MODEL + ' ' + this.YEAR + ' '+ this.ENGINE + ' '+ this.ENGINE_TYPE;

            vehiclesContent += '<span class="badge">' + (this.CAR_CATEGORY) + '</span>'
            vehiclesContent += '<span class="badge">' + (this.FUEL_TYPE == 'G' ? 'GAS' : 'DIESEL') + '</span><span class="badge">' + this.GEAR + 
                '</span><span class="badge">' + this.DOORS + ' Doors</span></div>';
            
            
//a(href='/vclList/selected?veh='+ this.MAKER +';'+ this.MODEL +';'+ this.YEAR +';'+ this.ENGINE +';'+ this.GEAR +';'+ this.FUEL_TYPE +';'+ this.DOORS +';' +'&criteria=' + searchCriteria ,class ="linkOrderVcl",rel=vcl.VEHICLE_NUMBER)
            vehiclesContent += '<a href="/vclList/selected?veh=' + this.MAKER + ';' + this.MODEL + ';'  
                + this.YEAR + ';' + this.ENGINE + ';' + this.GEAR + ';' + this.FUEL_TYPE + ';' 
                + this.DOORS + ';' + '&criteria=' + searchCriteria + '" rel = "' 
                + this.VEHICLE_NUMBER + '" class="linkOrderVcl">' +  
                '<button type="button" style="float: right" class="btn btn-success btn-sm order">Order</button></a>';

            vehiclesContent += '<div style="float: right" class="block badge priceLabel">' + this.DAILY_PRICE +
                ' ₪</div><div class="panel-body">Additional Details: Air Conditioner- <span class="badge">' +
                (this.AIR_COND ? 'Yes' : 'No') + '</span></div></div></panel>';

            vehiclesContent += '</div><div class="col-xs-2 col-sm-2 col-md-2 col-lg-2">';
            vehiclesContent += '<panel><img src="images/' + this.PIC_PATH + '" alt="Cinque Terre" width="95" height="63" class="img-rounded"></panel>';
            vehiclesContent += '</div></div></div></panel></div></div>';

               // Inject the whole content string into our existing HTML table
            $('#formVclList').html('<br>' + vehiclesContent);

            //if itemsOnPage changed, change also the pagination control
        
            var total = data.total;
            if (total) {//(itemsOnPageChanged) {
                var paginationContent = '<ul name="page" id="page" class="pagination">';
                paginationContent += '<li' + (page== 1 ? ' class="disabled">' : '>') + '<a href="#">«</a></li>'

                for (var i = 1; i <=  Math.ceil(total / itemsOnPage) ; i++)
                    paginationContent += '<li'+ (i==page ? ' class="active">' : '>') +'<a href="#">'+ i +'</a></li>'

                paginationContent += '<li' + (page== Math.ceil(total / itemsOnPage) ? ' class="disabled">' : '>') + '<a href="#">»</a></li>'
                paginationContent += '</ul>'

                $('#page').html(paginationContent);
           }
        }); 
    });
};