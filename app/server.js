var webSocketServer = require('websocket').server;
var http = require('http');


var msgHistory = [
    {room: 0, history: []},
    {room: 1, history: []},
    {room: 2, history: []},
    {room: 3, history: []}
];

var chatRooms = [
    { id: 0, name: 'Room 1', unread: 0 },
    { id: 1, name: 'Introductions', unread: 0 },
    { id: 2, name: 'AngularJS', unread: 0 },
    { id: 3, name: 'Cat Pics', unread: 0 }
];

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
        request.reject();
        console.log((new Date()) + ' Connection from ' + request.origin + ' was rejected.');
        return;
    }

    var connection = request.accept(null, request.origin);
    var username = false;
    console.log((new Date()) + ' Connection accepted.');

    // Since we've accepted a new connection, send chat history if it exists
    if (msgHistory.length > 0) {
        connection.sendUTF(JSON.stringify({ type: 'history', data: msgHistory}));
    }

    //send rooms
    connection.sendUTF(JSON.stringify({ type: 'rooms', data: chatRooms}));

    //sending messages
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            if (username === false) {
                //first time, user needs to set name
                username = message.utf8Data.slice(0,-1);

                //send username
                connection.sendUTF(JSON.stringify({ type: 'name', data: username }));
                // set default channel as well
                var room = "0";
                console.log((new Date()) + ' User: ' + username + ' connected.');
            }
            else {
                console.log((new Date()) + message.utf8Data);
                var msgData = {
                    room: message.utf8Data.slice(-1),
                    from: username,
                    text: message.utf8Data.slice(0,-1)
                };
                // keep a brief message history, organized by rooms
                msgHistory[msgData.room].history.push(msgData);
                msgHistory = msgHistory.slice(-100); // fix this

                // send message to connected clients
                var json = JSON.stringify({ type:'message', data: msgData });
                wsServer.connections.forEach(function(conn) {
                    conn.send(json);
                });
                console.log(msgData);

                // send updated history
                var history = JSON.stringify({ type: 'history', data: msgHistory});
                connection.send(history);
            }
        }
    });

    connection.on('close', function(reasonCode,description) {
        console.log((new Date() + ' User ' + connection.remoteAddress + ' disconnected.'));
    });

});
