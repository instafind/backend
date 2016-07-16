var express = require('express');
// var http = require('http');
// var server = http.createServer(app);
var app = express();
var path = require("path");


var API_KEY = "key=AIzaSyCx6MMMEoT9dFT0okzS77vk80sNqLJIgjo"
var MAP_API = "https://maps.googleapis.com/maps/api/distancematrix/"
var RETURN_TYPE = "json"
var UNITS = "units=imperial"
var MODE = "mode=walking"
var ORI = "origins="
var DEST = "destinations="

// MAP_API + RETURN_TYPE + ? +UNITS + & + MODE + & + ORI + & + DEST + API_KEY

//landing point
app.get('/', function (req, res) {
	res.sendFile('index.html' , { root : path.join(__dirname, "../frontend")});
});

// template request on data
app.get("/data", function(req, res) {
	var dummyJSON = {
		"url": "http://imgur.com/gallery/0DQQTAv",
		"location": {
			"lattitude":37.4233111,
			"longtitude": 122.07064579999997 
		},
		"name": "LinkedIn"
	}
	var list = [];
	for (i < 0; i < 10; i++) {
		list.push(dummyJSON)
	}

	// push data back?
});

// tempalte post request
app.post('/choice', function(req, res) {	
	var choiceNumber = req.param("choice");
	choiceNumber = parseInt(choiceNumber);
	console.log(choiceNumber);
	// res.sendFile("/Users/zliu/Desktop/InstaFind/backend/b.html");
});

app.listen(8080, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:8080");
});