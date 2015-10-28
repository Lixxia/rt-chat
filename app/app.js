var chatApp = angular.module('app', ['ngRoute','luegg.directives']);
chatApp.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider) {
    $routeProvider.
        //when('/chat',{
        //    templateUrl: 'view/chat.html',
        //    controller: 'ChatCtrlNull'
        //}).
        when('/chat/:room/',{
            templateUrl: 'view/chat.html',
            controller: 'ChatCtrl'
        }).
        otherwise({
            redirectTo: '/chat/0/'
        });
}]);

chatApp.controller("ChatCtrl", function($scope, wsService, roomService, $location, $rootScope, Emojis) {
    //Set current room, based on URL
    $rootScope.currentRoom = $location.path().slice(-2,-1);
    console.log("current room got", $rootScope.currentRoom);

    //Retrieve list of rooms from promise
    wsService.getRooms().then(function(rooms) {
        $scope.rooms = rooms;
    });

    // Changing active room
    $scope.menuClass = function (page) {
        var currentRoute = $location.path().slice(-2,-1);
        return page === currentRoute ? 'active teal' : '';
    };

    // Display the message count only we've got new unread messages
    $scope.showCount = function (id) {
        $scope.rooms[$rootScope.currentRoom].unread = 0;
        return $scope.rooms[id].unread === 0 ? 'hidden' : '';
    };

    // Update the unread count in menu if another room receives a message
    $scope.menuCount = function(roomId) {
        $scope.$apply(function () { // wrapper to update view
            $scope.rooms[roomId].unread++;
        });
    };

    $scope.messages = [];

    //Retrieve history for room from promise + populate messages
    //wsService.getHistory($rootScope.currentRoom).then(function(history) {
    //    $scope.history = history;
    //    for(var i=0; i < $scope.history[$rootScope.currentRoom].history.length; i++) {
    //        //console.log("history playbyplay",$scope.history[$rootScope.currentRoom].history[i]);
    //        $scope.messages.push($scope.history[$rootScope.currentRoom].history[i]);
    //    }
    //});

    roomService.readRoom($rootScope.currentRoom).then(function(roomHist) {
        for(var j=0; j < roomHist.length; j++) {
            $scope.messages.push(roomHist[j]);
            console.log("msgs", $scope.messages[j]);
        }
        //roomService.clearRoom($rootScope.currentRoom);
    });

    $scope.receiveMessage = function(message) {
        // Check if we're in the correct room to receive message
        if($rootScope.currentRoom === message.room) {
            console.log("Current room msg");
            $scope.$apply(function () { // another wrapper to update view because angular
                $scope.messages.push({room: message.room, from: message.from, text: message.text});
            });
        }
        else {
            console.log("Message received in different room, update unread count and store message for later.");
            $scope.menuCount(message.room);
            roomService.pushMessage({room: message.room, from: message.from, text: message.text});
        }
    };

    $scope.emojiClick = function(emoji) {
        console.log("emoj?", emoji);
        $scope.newMessage= $scope.newMessage + emoji;
    };

    $scope.addMessage = function () {
        // append room ID to end of message so we know where it came from
        // pretty dumb solution, come back and fix later. TODO
        wsService.send($scope.newMessage + $rootScope.currentRoom);
        $scope.newMessage="";
    };

    wsService.addListener($scope.receiveMessage);

    // display some emojis
    $scope.emojis = Emojis.all();
});

chatApp.service("wsService", function($q, $timeout) {
    var connection = new WebSocket('ws://192.168.1.7:8000');

    var wsService = {};
    var listeners = []; // room id, username, message

    wsService.addListener = function (listener) {
        listeners.push(listener);
    };

    wsService.send = function(message) {
        connection.send(message);
    };

    connection.onopen = function () {
        // logon element show
        console.log("onopen");

        $(document).ready(function() {
            $(".convert-emoji").each(function() {
                var original = $(this).html();
                var converted = emojione.toImage(original);
                $(this).html(converted);
            });
        });

        $(document).ready(function(){
            $('.emoji-zoom').hover(function() {
                $(this).addClass('enlarge-emoji');

            }, function() {
                $(this).removeClass('enlarge-emoji');
            });
        });

        $('.ui.modal')
            .modal('setting', 'closable', false)
            .modal('show')
        ;
    };

    connection.onerror = function (error) {
        // display error
    };

    connection.onmessage = function (message) {
        // handle incoming message
        var json = JSON.parse(message.data);
        if(json.type === 'name') {
            console.log("Just setting username, no messages yet.");
        }
        else if(json.type === 'message') {
            console.log("twas a message!");
            for(var i=0; i<listeners.length; i++) {
                listeners[i]({
                    room: json.data.room, from: json.data.from, text: json.data.text
                });
            }
        }
        else if(json.type === 'rooms') {
            wsService.rooms = json.data;
        }
        else if(json.type === 'history') {
            // feed history to users upon joining channels
            wsService.history = json.data;
            console.log("history here!", json.data);
        }
        else {
            console.log("Unknown json type.");
        }
    };

    // Need a promise to get history
    wsService.getHistory = function(roomId) {
        var deferred = $q.defer();

        $timeout(function() {
            deferred.resolve(wsService.history);
        }, 100);

        return deferred.promise;
    };

    // Need another promise to get the rooms list
    wsService.getRooms = function() {
        var deferred = $q.defer();

        $timeout(function() {
            deferred.resolve(wsService.rooms);
        }, 50);

        return deferred.promise;
    };

    return wsService;

});

// service to hold info for each room?
chatApp.service("roomService", function ($q, $timeout) {
    roomService = {
        0: [],
        1: [],
        2: [],
        3: []
    };

    roomService.pushMessage = function(message) {
        console.log("calling pushMessage with room: "+ message.room + 'and message: ' + message);
        if(roomService[message.room].indexOf(message) == -1) {
            console.log("exists??");
            roomService[message.room].push(message);
        }
    };

    //roomService.readRoom = function(roomNum) {
    //    console.log("rs 1", roomService[0]);
    //    console.log("returned roomdata", roomService[roomNum]);
    //    return roomService[roomNum];
    //};

    roomService.readRoom = function(roomNum) {
        var deferred = $q.defer();

        $timeout(function() {
            deferred.resolve(roomService[roomNum]);
            //roomService[roomNum] = [];
        }, 50);

        return deferred.promise;
    };

    roomService.clearRoom = function(roomNum) {
        roomService[roomNum] = [];
    };

    return roomService;
});

chatApp.factory("Emojis", function() {
    emojis = [":laughing:",":blush:",":smiley:",":heart_eyes:",":kissing_closed_eyes:",
    ":relieved:",":satisfied:",":grimacing:",":confused:",":hushed:",":expressionless:",":unamused:",":sweat_smile:",
    ":sweat:",":clap:",":yellow_heart:",":blue_heart:",":purple_heart:",":green_heart:",":star:",":exclamation:",
    ":musical_note:",":fire:",":question:",":dash:"
    ];

    return {
        all: function () {
            return emojis;
        }
    };
});