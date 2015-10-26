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

chatApp.controller("ChatCtrl", function($scope, wsService) {
    $scope.messages = [];
    console.log("1st usr",$scope.username);
    $scope.receiveMessage = function(message) {
        $scope.$apply(function () { // wrapper to update view
            $scope.username = wsService.username;
            $scope.messages.push(message);
        });
    };

    $scope.addMessage = function () {
        console.log($scope.username);
        wsService.send($scope.newMessage);
        $scope.newMessage="";
    };

    wsService.addListener($scope.receiveMessage);
});

chatApp.service("wsService", function() {
    var connection = new WebSocket('ws://192.168.1.7:8000');

    var wsService = {};
    var listeners = []; // room names : arrays of listeners : messages

    wsService.addListener = function (listener) {
        listeners.push(listener);
    };

    wsService.send = function(message) {
        connection.send(message);
    };

    connection.onopen = function () {
        // logon element show
        console.log("onopen");
    };

    connection.onerror = function (error) {
        // display error
    };

    connection.onmessage = function (message) {
        console.log("on message is called");

        // handle incoming message
        var json = JSON.parse(message.data);
        if(json.data.text === undefined) {
            console.log("some text exists");
        }
        else {
            console.log("some text doesn't exist");
        }
        console.log("message was ", json);

        for(var i=0; i<listeners.length; i++) {
            listeners[i](json.data.text);
        }
        wsService.username = json.data.from;
        console.log("json username data",json.data.from);
        console.log("variable username", wsService.username);

    };
    return wsService;

});