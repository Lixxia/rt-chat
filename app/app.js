var chatApp = angular.module('app', ['ngRoute','luegg.directives']);
chatApp.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider) {
    $routeProvider.
        when('/chat',{
            templateUrl: 'view/chat.html',
            controller: 'ChatCtrl'
        }).
        otherwise({
            redirectTo: 'chat'
        });
}]);

chatApp.controller("ChatCtrl", function($scope) {
    $scope.messages = "";
    $scope.username = "test";
    $scope.addMessage = function () {
        $scope.messages.$add({
            from: $scope.username, text: $scope.newMessage
        });
        // empty the field after adding
        $scope.newMessage="";
    };

});