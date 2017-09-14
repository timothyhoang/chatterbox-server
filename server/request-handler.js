/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var path = require('path');
var url = require('url');

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var utils = {
  respond: function(response, data, status) {
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = 'application/json';
    response.writeHead(status || 200, defaultCorsHeaders);
    response.end(data);
  },

  respond404: function(response) {
    utils.respond(response, 'NOT FOUND', 404);
  },

  respondBadRequest: function(response) {
    utils.respond(response, 'BAD REQUEST', 400);
  }
};

var actions = {
  'OPTIONS': function(request, response) {
    var action = request.headers['access-control-request-method'];
    (defaultCorsHeaders['access-control-allow-methods'].includes(action)) ? actions[action](request, response) : utils.respondBadRequest();
  },

  'GET': function(request, response) {
    var data = JSON.stringify({results: []});
    utils.respond(response, data, 200);
  },

  'POST': function(request, response) {
    var data = '';
    request.on('data', function(chunk) {
      data += chunk;
    });
    utils.respond(response, data, 201);
  }
};

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  var parsedURL = url.parse(request.url);
  if (parsedURL.pathname !== '/classes/messages') {
    utils.respond404(response);
  }

  var action = actions[request.method];
  action ? action(request, response) : utils.respond404();
};

module.exports = requestHandler;