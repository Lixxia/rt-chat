# Realtime Chat App
Implementation of a basic realtime chat UI, along with a minimal websocket server.

## Tools Used
* [Angular JS](https://github.com/angular/angular.js)
* [Websocket-Node](https://github.com/theturtle32/WebSocket-Node)
* [Emojione](https://github.com/Ranks/emojione)
* [Semantic UI](https://github.com/semantic-org/semantic-ui/)
* [Angular JS Scrollglue](https://github.com/Luegg/angularjs-scroll-glue)

## Getting Started

### Prerequisites
You must have `node.js` and its package manager `npm` installed. They can be found here: [http://nodejs.org/](http://nodejs.org/).

### Clone the Repo
```
git clone https://github.com/Lixxia/rt-chat.git
cd rt-chat
```

### Installing Dependencies
`npm` Should automatically call `bower` after being called, so all you need to do is:
```
npm install
```

### Running the App
You can run the app with `npm start`. 
Alternatively you can install http-server globally with `sudo npm install -g http-server` and then run:
```
http-server -a localhost -p 8080
```

### Starting the Server
The app depends on a websocket server, so navigate to `rt-chat/app` and run
```
node server.js
```

By default, this will start the websocket server listening on port `8000`. 
This behavior is set on line 20 of `server.js`:
```
server.listen(8000, function() { });
```

Now the app can open a connection, the default is `ws://localhost:8000`. This can be changed on line 105 of `app.js`
```
var connection = new WebSocket('ws://localhost:8000');
```

## Viewing the App
Finally you can open the app in your browser at 
```
http://localhost:8080/app/index.html
```

### Browser Compatibility
Firefox (v 41.02) isn't currently playing nice with websockets, and will complain about interrupted connections, as well as not 
loading the list of rooms for the menu. This can be temporarily worked around by changing the url to another room.

Tested in Chrome version 46 and IE version 11.
