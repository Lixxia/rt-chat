var chatApp = angular.module('app', ['ngRoute']);
chatApp.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider) {
    $routeProvider.
        when('/view',{
            templateUrl: 'view/view.html',
            controller: "ViewCtrl"
        }).
        otherwise({
            redirectTo: 'view'
        });
}]);

chatApp.controller('ViewCtrl', [function() {
    // controll stuff
}]);