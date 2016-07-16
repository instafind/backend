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

//landing
app.use('/', express.static('public'));


app.get("/auth", function(req, res) {
	var clientID = req.param("code");
	console.log(clientID);
	res.redirect("/#!/search");
});

app.get("/insta", function(req, res) {
	var instaURL = "https://api.instagram.com/oauth/authorize/?client_id=a0cb68128abd4ef99d23451fe30657a6&redirect_uri=http://10.16.20.247:8083/auth&response_type=code&scope=public_content"
	request( {
			url: instaURL,
			method: "GET"
		}, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		  	res.redirect(instaURL);
		}
	});
});


// template request on geo data
app.get("/data", function(req, res) {
	// sample location data (acquired)
	var myLocation = {
			"latitude":37.423601,
			"longtitude": -122.070718
	};

	// sample target locations (Insta API)
	var interestList = [
		{
			"name": "Apple",
			"latitude": 37.332144,
			"longtitude":-122.031234,
			"image_url": "http://imgur.com/gallery/0DQQTAv"
		},
		{
			"name": "Shoreline Park",
			"latitude": 37.426811,
			"longtitude":-122.078655,
			"image_url": "http://imgur.com/gallery/0DQQTAv"
		}
	]

	// query for every interest point =)
	var list = []
	for (i = 0; i < interestList.length; i++) {
		var corLocation = interestList[i]
		//generate request url
		var reqUrl = MAP_API + RETURN_TYPE
			+ "?" + UNITS
			+ "&" + MODE
			+ "&" + ORI
				+ myLocation.latitude + ","
				+ myLocation.longtitude
			+ "&" + DEST
				+ corLocation["latitude"] + ","
				+ corLocation["longtitude"]
			+ "&" + API_KEY;

		//issue request to Google Maps API
		request( {
			url: reqUrl,
			method: "GET"
		}, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		  	// add into list of interest point distances
		  	data = JSON.parse(body);

		  	data = {
				"image_url": corLocation["image_url"],
				"location": corLocation,
				"distance": data["rows"][0]["elements"][0]["distance"],
				"duration": data["rows"][0]["elements"][0]["duration"],
				"name": corLocation["name"]
		  	};
		  	list.push(data);
		  }
		});

	}
	// rank location in order
	setTimeout(function() {
		list.sort (function(js1, js2) {
			return js1["duration"]["value"] - js2["duration"]["value"];
		});
		console.log(list);
		//push data back
		//return type template
		res.send(JSON.stringify(list))
		res.sendStatus(200)
	}, 500);


});


app.listen(8083, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:8083");
});
