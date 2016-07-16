var express = require('express');
var app = express();
var path = require("path");
var request = require("request")


//static var for google maps api 
var API_KEY = "key=AIzaSyCx6MMMEoT9dFT0okzS77vk80sNqLJIgjo"
var MAP_API = "https://maps.googleapis.com/maps/api/distancematrix/"
var RETURN_TYPE = "json"
var UNITS = "units=imperial"
var MODE = "mode=walking"
var ORI = "origins="
var DEST = "destinations="

// MAP_API + RETURN_TYPE + ? +UNITS + & + MODE + & + ORI + & + DEST + & + API_KEY


var requestString = "https://maps.googleapis.com/maps/api/distancematrix/json?untis=imperial&mode=walking&origins=37.427156,-122.080711&destinations=37.423370,-122.071474&key=AIzaSyCx6MMMEoT9dFT0okzS77vk80sNqLJIgjo"
//landing point
app.get('/', function (req, res) {
	res.sendFile('index.html' , { root : path.join(__dirname, "../frontend")});
});

// template request on geo data
app.get("/data", function(req, res) {

	// sample location data (acquired)
	var myLocation = {
			"lattitude":37.4233111,
			"longtitude": -122.07064579999997 
	};

	// sample target locations (Insta API)
	var interestList = [ 
		{
			"lattitude": 37.332144, 
			"longtitude":-122.031234
		},
		{
			"lattitude": 37.426811, 
			"longtitude":-122.078655
		}
	]

	// query for every interest point =) 
	var list = []
	for (i = 0; i < interestList.length; i++) {

		//generat request url 
		var reqUrl = MAP_API + RETURN_TYPE + "?" +UNITS + "&" + MODE + "&" + ORI + myLocation["lattitude"]
		+ "," + myLocation["longtitude"] + "&" + DEST + interestList[i]["lattitude"] + "," +  interestList[i]["longtitude"] + "&" + API_KEY
		console.log(reqUrl);

		//issue request to Google Maps API
		request( {
			url: reqUrl,
			method: "GET"
		}, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		  	// add into list of interest point distances
		  	list.push(JSON.parse(body)["rows"][0]["elements"]);
			console.log(list);
		  }
		});

	}

	res.sendFile('index.html' , { root : path.join(__dirname, "../frontend")});

	//push data back
	// yet to be implemented

	//return type template
	// var dummyJSON = [{
	// 	"url": "http://imgur.com/gallery/0DQQTAv",
	// 	"location": {
	// 		"lattitude":37.4233111,
	// 		"longtitude": 122.07064579999997 
	// 	},
	// 	"name": "LinkedIn"
	// }]
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