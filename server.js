var express = require('express');
var path = require('path');
var request = require('request');
var config = require('./config.json');

var GOOGLE_MAPS_BASE_URL = "https://maps.googleapis.com/maps/api/distancematrix/";
var RETURN_TYPE = "json"
var UNITS = "units=imperial"
var MODE = "mode=walking"
var ORI = "origins="
var DEST = "destinations="

var app = express();

app.use('/', express.static('public'));

var userData = [];

app.get("/auth", function(req, res) {
  userData = []
  var requestConf = {
    url: 'https://api.instagram.com/oauth/access_token',
    method: 'POST',
    form: {
      "client_id":"a0cb68128abd4ef99d23451fe30657a6",
      "client_secret":"7834c945f05c4a2baf4f96cb088e0cd6",
      "grant_type":"authorization_code",
      "redirect_uri":"http://10.16.20.247:8083/auth",
      "code": req.param("code")
    }
  }
  var requestCallback = function (error, response, body) {
    if (!error && response.statusCode == 200) {
      accessData = JSON.parse(body);
      accessToken = accessData["access_token"];

      var requestConf = {
        url: 'https://api.instagram.com/v1/users/search?q=hypotheticaleatsinsf&access_token=' + accessToken,
        method: 'GET'
      }

      request(requestConf, function(error, response, body) {
        followedData = JSON.parse(body);
        var id = followedData.data[0].id;
        var requestConf = {
          url: 'https://api.instagram.com/v1/users/' + id + '/media/recent/?access_token=' + accessToken,
          method: 'GET'
        }
        request(requestConf, function(error, response, body) {
          rawOnion = JSON.parse(body);
          rawOnion = rawOnion["data"];
          for (var post of rawOnion) {
            console.log(post["location"]["name"]);
            userData.push({
              name:      post.location.name,
              latitude:  post.location.latitude,
              longitude: post.location.longitude,
              imageUrl:  post.images.standard_resolution.url
            });
          }
        });
      });
    }
  }

  request(requestConf, requestCallback);

  // Redirect the user to the search page.
  res.redirect("/#!/search");
});

app.get("/insta", function(req, res) {
  var instaURL = "https://api.instagram.com/oauth/authorize/?client_id=a0cb68128abd4ef99d23451fe30657a6&redirect_uri=http://10.16.20.247:8083/auth&response_type=code&scope=public_content"
  var requestConf = {
    url: instaURL,
    method: "GET"
  }
  var requestCallback = function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.redirect(instaURL);
    }
  }
  request(requestConf, requestCallback);
});

// template request on geo data
app.get("/data", function(req, res) {
  // sample location data (acquired)
  var myLocation = {
      "latitude":37.423601,
      "longitude": -122.070718
  };

  // sample target locations (Insta API)
  console.log(userData);
  var interestList = userData

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
      + "&" + config.GOOGLE_MAPS_API_KEY;

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
  }
  // rank location in order
  setTimeout(function() {
    list.sort (function(js1, js2) {
      return js1["duration"]["value"] - js2["duration"]["value"];
    });
    res.json(list);
  }, 300);
});

var PORT = 8003
app.listen(PORT, function() {
  console.log("Server listening on: http://localhost:" + PORT);
});
