var webSocketServer = require('websocket').server;
var http = require('http');


var msgHistory = [ ];
var chatRooms = [ ];

var server = http.createServer(function(request,response) { });
server.listen(8000, function() { });

wsServer = new webSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originAllowed(origin) {
    //TODO: make sure origin is website
    return true;
}
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from ' + request.origin + '.');
    if (!originAllowed(request.origin)) {
        // if not allowed, reject request and return
        request.reject;
        console.log((new Date()) + ' Connection from ' + request.origin + ' was rejected.');
        return;
    }

    var connection = request.accept(null, request.origin);
    var username = false;
    console.log((new Date()) + ' Connection accepted.');
    //sending messages
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            if (username === false) {
                //first time, user needs to set name
                username = message.utf8Data;
                console.log((new Date()) + ' User is known as: ' + username + '.');
            }
            else {
                console.log((new Date()) + message.utf8Data);
                var msgData = {
                    from: username,
                    text: message.utf8Data
                };
                msgHistory.push(msgData);
                msgHistory = msgHistory.slice(-100); // keep only last 100 msgs

            }
            console.log(msgData);
             // broadcast message to all connected clients
            var json = JSON.stringify({ type:'message', data: msgData });
            wsServer.connections.forEach(function(conn) {
                conn.send(json);
            });

        }
    });

    connection.on('close', function(reasonCode,description) {
        console.log((new Date() + ' User ' + connection.remoteAddress + ' disconnected.'));
    });

});