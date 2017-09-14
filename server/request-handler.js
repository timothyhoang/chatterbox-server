/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var url = require('url');
var _ = require('../node_modules/underscore/underscore.js');
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
  'access-control-max-age': 10, // Seconds.
};

var state = [];
var modelVariables = ['username', 'text', 'roomname', 'objectId', 'createdAt'];
var id = 0;

var utils = {
  respond: function(response, data, status, headers) {
    response.writeHead(status, headers);
    response.end(data);
  },

  respond404: function(response) {
    utils.respond(response, 'NOT FOUND', 404);
  },

  respondMethodNotAllowed: function(response) {
    utils.respond(response, 'METHOD NOT ALLOWED', 405);
  },
  
  getSortedState: function(response) {
    var parsedURL = url.parse(response.url);
    var searchParam = parsedURL.path.searchParams.get('order');
    var order;
    if (!searchParam) {
      return state;  
    } else if (searchParam[0] === '-') {
      order = -1;
      searchParam = searchParam.slice(1);
    } else { 
      order = 1;
    }
    
    if (!modelVariables.includes(searchParam)) {   
      return state;
    } else {
      var copy = state.slice(0);
      return _.sortBy(copy, (message) => { return (message[searchParam]) * order; });
    }
  }
};

var actions = {
  'OPTIONS': function(request, response) {
    var action = request.headers['access-control-request-method'];
    (defaultCorsHeaders['access-control-allow-methods'].includes(action)) ? actions[action](request, response) : utils.respondMethodNotAllowed();
  },

  'GET': function(request, response) {
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = 'application/json';
    var data = JSON.stringify({results: state});
    utils.respond(response, data, 200, headers);
  },

  'POST': function(request, response) {
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = 'text/plain';
    var data = '';
    request.on('data', function(chunk) {
      data += chunk;
    });
    request.on('end', function() {
      data = JSON.parse(data);
      data.roomname = data.roomname || 'lobby';
      data.objectId = ++id;
      data.createdAt = Date.now();
      state.push(data);
      utils.respond(response, 'CREATED', 201, headers);
    });
  }
};

var requestHandler = function(request, response) {
  var parsedURL = url.parse(request.url);
  if (parsedURL.pathname !== '/classes/messages') {
    utils.respond404(response);
  } else {
    var action = actions[request.method];
    action ? action(request, response) : utils.respond404();
  }
};

module.exports.requestHandler = requestHandler;