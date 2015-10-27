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

    $scope.receiveMessage = function(message) {
        $scope.$apply(function () { // wrapper to update view
            $scope.messages.push({from: message.from, text: message.text});
        });
    };

    $scope.addMessage = function () {
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
        $('.ui.modal')
            .modal('setting', 'closable', false)
            .modal('show')
        ;
    };

    connection.onerror = function (error) {
        // display error
    };

    connection.onmessage = function (message) {
        console.log("on message is called");

        // handle incoming message
        var json = JSON.parse(message.data);
        if(json.type === 'name') {
            console.log("Just setting username, no messages yet.");
        }
        else if(json.type === 'message') {
            console.log("twas a message!");
            wsService.username = json.data.from;
            for(var i=0; i<listeners.length; i++) {
                //listeners[i](json.data.text);
                listeners[i]({
                    from: json.data.from, text: json.data.text
                });
            }
        }
        //else if(json.type === 'history') {
        //    // feed history to users
        //}
        else {
            console.log("something went wrong.");
        }
    };

    return wsService;

});