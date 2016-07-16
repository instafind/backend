var express = require('express');
var http = require('http');
var server = http.createServer(app);
var app = express();

app.get('/', function (req, res) {
	// do something about it
});

app.post('/things', function(req, res) {	
	// do something 
});

app.listen(8080, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:8080");
});