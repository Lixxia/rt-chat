var chatApp = angular.module('app', ['ngRoute','firebase','luegg.directives']);
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

chatApp.controller("ChatCtrl", function($scope, $firebaseArray) {
    var ref = new Firebase("https://rtchatlb.firebaseio.com/messages");
    $scope.messages = $firebaseArray(ref.limitToLast(200));
    $scope.username = "test";
    $scope.addMessage = function () {
        $scope.messages.$add({
            from: $scope.username, text: $scope.newMessage
        });
        // empty the field after adding
        $scope.newMessage="";
    };


});