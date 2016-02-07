(function () {
    var app = angular.module('angHome', []);

    app.constant('paths', {
        //images: 'http://localhost:1337/images/', 
        //directives: 'http://localhost:1337/javascripts/'
        //images: 'http://socketd.azurewebsites.net/images/', 
        //directives: 'http://socketd.azurewebsites.net/javascripts/'
        images: 'http://ec2-54-88-233-131.compute-1.amazonaws.com:3000/images/', 
        directives: 'http://ec2-54-88-233-131.compute-1.amazonaws.com:3000/javascripts/'
    });

    app.controller('HomeController', ['$scope','$http', function($scope, $http, paths ){

    //var store = this;
    //store.locations = [];

        $http.get('/home.json').success(function (data) {

            $scope.data = {       
                hrs: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', 
                    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'],
                selectedHr: '09:00',
                selectedHr2: '09:00',
                user: data.user,
                locations: data.locations,
                selectedLoc: data.locations[3],
                selectedLoc2: data.locations[3],
                categories: data.categories,
                selectedCat: data.categories[0],
                ages: data.ages,
                selectedAge: data.ages[2],
                screenName: data.screenName
            };
            //g_locations = $scope.data.locations;
        });
    }]);
    
    app.controller('vclListController', ['$scope', '$http', '$window','$document', 'paths', function ($scope, $http, $window, $document, paths) {
        //$templateCache.removeAll();
        var params = $window.location.search;
        //var selectedOrder = parseInt(req.query.id);
        $http.get('/vclList.json/' + params, { headers: { 'Cache-Control': 'no-cache' } }).success(function (data) {
            
            $scope.data = {
                user: data.user,
                searchCriteria: data.searchCriteria,
                vehicles: data.vehicles, 
                total: data.total,
                pages: $scope.pages(data.total),
                screenName: data.screenName
            };
               
        });
            
        //get Datetime
        $scope.getDatetime = function () {
            return (new Date).toLocaleFormat("%A, %B %e, %Y");
        };
            
        //check if date is later than now 
        $scope.laterThanNow = function laterThanNow(date1) {
            var dateObj1 = new Date(date1);
            var now1 = new Date();
                
            return (dateObj1 > now1);
        };
        //get image
        $scope.getImg = function (path) {
            return paths.images + path ;
        };

        //get pages number
        $scope.pages = function (total) {
            var pages = [];
            for (var i=2; i<=Math.ceil( total / 10); i++) {
                pages.push(i);
            }
            return pages;
        };    
    }]);  

    app.controller('HistoryController', ['$scope','$http', function($scope, $http, paths){
        $http.get('/history.json').success(function (data) {

            $scope.data = {       
                user: data.user,
                orders: data.orders,
                screenName: data.screenName
            };

        });

        $scope.getDatetime = function () {
            return (new Date).toLocaleFormat("%A, %B %e, %Y");
        };

        $scope.laterThanNow =function laterThanNow(date1) {
            var dateObj1 = new Date(date1);
            var now1=new Date();
                
            return (dateObj1 > now1);
        }
    }]);    
    

    app.controller('orderDetailsController', ['$scope', '$http', '$window','paths' , function ($scope, $http, $window, paths) {
        //$templateCache.removeAll();
        var params = $window.location.search; 
        //var selectedOrder = parseInt(req.query.id);
        $http.get('/vehicleOrOrderDetails.json/'+params, {headers: {'Cache-Control':'no-cache'}}).success(function (data) {
                
            $scope.data = {
                user: data.user,
                searchCriteria:  data.searchCriteria,
                vehicles:  data.vehicles, 
                addAccessories:  data.addAccessories,
                order:  data.order,
                screenName: data.screenName,
                loadingPic: paths.images + 'ajax-loader_w.gif',
                loadingBGPic: paths.images + 'transbg.png',
            };

            //set orderRemarks property
             $scope.orderRemarks = '';
            if($scope.data.order){
                $scope.orderRemarks = $scope.data.order.remarks;
                }

            if($scope.data.vehicles[0].PIC_PATH){
                    $scope.data.vehicles[0].PIC_PATH = paths.images + $scope.data.vehicles[0].PIC_PATH;
            }

            if ($scope.data.vehicles[0].PIC_PATH_2) {
                $scope.data.vehicles[0].PIC_PATH_2 = paths.images + $scope.data.vehicles[0].PIC_PATH_2;
            }
        });
            
        //get Datetime
        $scope.getDatetime = function () {
            return (new Date).toLocaleFormat("%A, %B %e, %Y");
        };
            
        //check if date is later than now 
        $scope.laterThanNow = function laterThanNow(date1) {
            var dateObj1 = new Date(date1);
            var now1 = new Date();
                
            return (dateObj1 > now1);
        };

        //check existing additional option
        $scope.setAccessory = function setAccessory(accName) {
            if ($scope.data.order){
                for (var i = 1; i < 11 ; i++) {
                    //get property name
                    var propName = 'addOp' + i;
                    //get property value
                    var propValue = $scope.data.order[propName];
                    if (propValue === accName) {
                        return true;
                    //recalc = true;
                    }
                };
            }
        };
        //check existing additional option
        $scope.orderTotalSum = function () {
            if ($scope.data){
                var total = $scope.data.vehicles[0].DAILY_PRICE;
                if ($scope.data.order) {
                    var total = $scope.data.order.vehiclePrice;
                    for (var i = 1; i < 11 ; i++) {
                        //get property name
                        var propName = 'addOp' + i + 'Price';
                        //get property value
                        var propValue = $scope.data.order[propName];
                        if (propValue >0) {
                            total=total+propValue;
                        }
                    };
                }
                return total;
            }
        };
        //get image
        $scope.getImg = function (imgNum) {
            var imgPath =  $scope.data.vehicles[0].PIC_PATH;
            if (imgNum > 1) { 
                imgPath = $scope.data.vehicles[0].PIC_PATH_2;
            }
            document.getElementById("viewer").src = imgPath;
        };
    }]);  

   app.controller('orderSavedController', ['$scope', '$http',  function ($scope, $http) {
        //$templateCache.removeAll();
        //var params = $window.location.search;
        //var selectedOrder = parseInt(req.query.id);
        $http.get('/orderSaved.json/', {headers: {'Cache-Control':'no-cache'}}).success(function (data) {
                
            $scope.data = {
                user: data.user,
                order:  data.order,
                vcl:  data.vehicle, 
                addAccessories:  data.addAccessories,
                screenName: data.screenName
                };
        });
    }]);
    
    app.controller('loginController', ['$scope', '$http', '$window', function ($scope, $http, $window) {
        var scrName = '';
        if (angular.lowercase($window.location.pathname).indexOf('/login') > -1) { 
            scrName = 'login';
        }
        else if (angular.lowercase($window.location.pathname).indexOf('/register') > -1) {
            scrName = 'register';
        }
                 
        $scope.data = {
            screenName: scrName
        };
        }]);

    app.controller('HelpController', ['$scope', '$http', '$window', function ($scope, $http, $window) {
        var scrName = '';
        if (angular.lowercase($window.location.pathname).indexOf('/login') > -1) { 
            scrName = 'login';
        }
        else if (angular.lowercase($window.location.pathname).indexOf('/register') > -1) {
            scrName = 'register';
        }
                 
        $scope.data = {
            screenName: scrName
        };
    }]);    

    app.directive("myNavbar", function (paths) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: paths.directives + 'my-navbar.html'
            //,link : function ngitemsOnPageChanged(scope,element) {
            //    var a = element.find("itemsOnPage");
            //    a.onchange = itemsOnPageChanged(a.value);

            ////    var b = element.find("orderBy");
            ////    b.onchange = orderByChanged(a.value);
            //}

        };
    });
    
    app.directive("vclDetails", function (paths) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: paths.directives + 'vcl-details.html'
        };
    });

    app.directive("vclHeading", function (paths) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: paths.directives + 'vcl-heading.html'
        };
    });

    app.directive("vclBody", function (paths) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: paths.directives + 'vcl-body.html'
        };
    });

    app.directive("vclPics", function (paths) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: paths.directives + 'vcl-pics.html'
        };
    });

    app.directive("loadDiv", function (paths) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: paths.directives + 'load-div.html'
        };
    });

    app.directive("vclAddOps", function (paths) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: paths.directives + 'vcl-add-ops.html'
        };
    });

    app.directive("orderBlock", function (paths) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: paths.directives + 'order-block.html'
        };
    });

/*     app.controller('StoreController',['$http' ,function($http){
    var store = this;
    store.products = [];
    $http.get('/store-products.json').success(function(data){
              store.products=data;
         });
  }]); */

    //app.controller("ReviewController", function(){

    //    this.review = {};

    //    this.addReview = function(product){
    //        product.reviews.push(this.review);
    //        this.review = {};
    //    };

    //});
    
    //app.directive("productGallery", function () {
    //    return {
    //        restrict: "E",
    //        templateUrl: "product-gallery.html",
    //        controller: function () {
    //            this.current = 0;
    //            this.setCurrent = function (imageNumber) {
    //                this.current = imageNumber || 0;
    //            };
    //        },
    //        controllerAs: "gallery"
    //    };
    //});  
   

    //app.directive("productReviews", function() {
    //    return {
    //        restrict: 'E',
    //        templateUrl: "product-reviews.html"
    //    };
    //});E:\Projects\JavaScript\tmp\NodeMVA-master\NodeMVA-master\10_Login\public\myNavBar.html

    //app.directive("productSpecs", function() {
    //    return {
    //        restrict:"A",
    //        templateUrl: "product-specs.html"
    //    };
    //});

    //app.directive("productTabs", function() {
    //    return {
    //        restrict: "E",
    //        templateUrl: "product-tabs.html",
    //        controller: function() {
    //            this.tab = 1;

    //            this.isSet = function(checkTab) {
    //                return this.tab === checkTab;
    //            };

    //            this.setTab = function(activeTab) {
    //                this.tab = activeTab;
    //            };
    //        },
    //        controllerAs: "tab"
    //    };
    //});

})();
