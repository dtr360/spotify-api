/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 * In terminal run: node app.js
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = 'your-client-id'; // Your client id
var client_secret = 'your-client-secret'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri


var token = '';
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  console.log("Getting a new token....")
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());



app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  //var scope = 'user-follow-modify user-read-recently-played user-read-private user-read-email';
  console.log(">>>>>Setting the SCOPE now....");
  var scope = 'user-follow-modify user-follow-read user-read-recently-played user-read-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});



app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  console.log(">>>>> Entering /callback function....")

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  //console.log("Cookies:"+ req.cookies + "<<<<");

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        console.log(">>>>> Saving new access token....")
        token = body.access_token;

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          //console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});



app.get('/refresh_token', function(req, res) {
  // requesting access token from refresh token
  console.log(">>>>> Entering /refresh_token function....")

  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    console.log("Access Token:"+ body.access_token);
    token = body.access_token;
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});


app.get('/get_info', function(req, res) {

  console.log(">>>>> Entering /get_info function...");

/**  This is what the returned JSON looks like
{"items":[
	{
		"track":{
			"artists":[
				{
				"external_urls": {"spotify":"https://open.spotify.com/artist/5INjqkS1o8h1imAzPqGZBb"},
				"href":"https://api.spotify.com/v1/artists/5INjqkS1o8h1imAzPqGZBb","id":"5INjqkS1o8h1imAzPqGZBb",
				"name":"Tame Impala","type":"artist","uri":"spotify:artist:5INjqkS1o8h1imAzPqGZBb"
				}
			],	
			"available_markets":["CA","MX","US"],
			"disc_number":1,
			"duration_ms":108546,
			"explicit":false,
			"external_urls":{"spotify":"https://open.spotify.com/track/2gNfxysfBRfl9Lvi9T3v6R"},
			"href":"https://api.spotify.com/v1/tracks/2gNfxysfBRfl9Lvi9T3v6R","id":"2gNfxysfBRfl9Lvi9T3v6R",
			"name":"Disciples",
			"preview_url":"https://p.scdn.co/mp3-preview/6023e5aac2123d098ce490488966b28838b14fa2",
			"track_number":9,
			"type":"track",
			"uri":"spotify:track:2gNfxysfBRfl9Lvi9T3v6R"
		},
		"played_at":"2016-12-13T20:44:04.589Z",
		"context":{
			"uri":"spotify:artist:5INjqkS1o8h1imAzPqGZBb",
			"external_urls":{"spotify":"https://open.spotify.com/artist/5INjqkS1o8h1imAzPqGZBb"},
		"href":"https://api.spotify.com/v1/artists/5INjqkS1o8h1imAzPqGZBb",
		"type":"artist"
		}
	}
]
**/

//   var info_played = {
//     headers: { 'Authorization': 'Bearer ' + token },
//     uri: 'https://api.spotify.com/v1/me/player/recently-played',
//     json: true
//   };

//   request.get(info_played, function(error, response, body) {
//     console.log("Status Code: " + response.statusCode);

//     if (!error && response.statusCode === 200) {
//       var played_list = '<p><h2>Your most recently played songs</h2></p>';
//       for (i = 0; i < body.items.length; i++) {
//         console.log(body['items'][i]['track']['name']);
//         played_list += body.items[i]['track']['name'] + '<br>';
//       }
//       res.send(played_list);

//     }
//   });
});



console.log('Listening on 8888');
app.listen(8888);