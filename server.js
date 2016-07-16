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


var user_data = []

app.get("/auth", function(req, res) {
	var clientCode = req.param("code");

	console.log(clientCode)
	var reqUrl = "https://api.instagram.com/oauth/access_token"
	var reqBody = {
		"client_id":"a0cb68128abd4ef99d23451fe30657a6",
		"client_secret":"7834c945f05c4a2baf4f96cb088e0cd6",
		"grant_type":"authorization_code",
		"redirect_uri":"http://10.16.20.247:8083/auth",
		"code": clientCode
	}
	request( {
			url: reqUrl,
			method: "POST",
			form: reqBody
		}, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		  	// console.log(body)
		  	access_data = JSON.parse(body);
		  	access_token = access_data["access_token"];
		  	var finalURL = "https://api.instagram.com/v1/users/search?q=hypotheticaleatsinsf&access_token=" + access_token
			request({
					url : finalURL,
					method: "GET"
				}, function(error, response, body) {
					followed_data = JSON.parse(body);
					var id = followed_data["data"][0]["id"];
					// console.log(id);
					var onionURL ="https://api.instagram.com/v1/users/" + id + "/media/recent/?access_token=" + access_token;
					request({
						url: onionURL,
						method:"GET"
					}, function(error, response, body) {
						raw_onion = JSON.parse(body);
						raw_onion = raw_onion["data"];
						for  (var post of raw_onion) {
							console.log(post["location"]["name"]);
							user_data.push( {
								"name": post["location"]["name"],
								"latitude": post["location"]["latitude"],
								"longitude": post["location"]["longitude"],
								"image_url": post["images"]["standard_resolution"]["url"]
							});
						}
					});
				}
			);
		}
	});
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
			"longitude": -122.070718
	};

	// sample target locations (Insta API)
	console.log(user_data);
	var interestList = user_data

	// query for every interest point
	var list = []
	for (i = 0; i < interestList.length; i++) {
		var corLocation = interestList[i];
		(function(corLocation) {
		//generate request url
		var reqUrl = MAP_API + RETURN_TYPE
			+ "?" + UNITS
			+ "&" + MODE
			+ "&" + ORI
				+ myLocation.latitude + ","
				+ myLocation.longitude
			+ "&" + DEST
				+ corLocation["latitude"] + ","
				+ corLocation["longitude"]
			+ "&" + API_KEY;
		
			request( {
				url: reqUrl,
				method: "GET"
			}, function (error, response, body) {
			  if (!error && response.statusCode == 200) {

			  	// add into list of interest point distances
			  	data = JSON.parse(body);
			  	data = {
					"image_url": corLocation["image_url"],
					"location": {
						"latitude": corLocation["latitude"],
						"longitude": corLocation['longitude']
					},
					"distance": data["rows"][0]["elements"][0]["distance"],
					"duration": data["rows"][0]["elements"][0]["duration"],
					"name": corLocation["name"],
					"address": data["destination_addresses"][0]
			  	};
			  	list.push(data);
			  }
			});

		})(corLocation);
		//issue request to Google Maps API
		

	}
	// rank location in order
	setTimeout(function() {
		list.sort (function(js1, js2) {
			return js1["duration"]["value"] - js2["duration"]["value"];
		});
		console.log("==================");
		console.log(list);
		console.log("==================")

		//push data back
		//return type template
		res.json(list);
	}, 300);


});


app.listen(8083, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:8083");
});