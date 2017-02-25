const config = require('./config.json')

const express = require('express');
const app = express();
const exphbs = require('express-handlebars');

const clientId = config.clientId
const clientSecret = config.clientSecret
const Linkedin = require('node-linkedin')(clientId, clientSecret);


app.engine('.hbs', exphbs({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', './views')

app.get('/', function(req, res){
  res.render('index')
});

// Using a library like `expressjs` the module will
// redirect for you simply by passing `res`.
app.get('/oauth/linkedin', function(req, res) {
    // This will ask for permisssions etc and redirect to callback url.
    Linkedin.setCallback(req.protocol + '://' + req.headers.host + '/oauth/linkedin/callback');
    Linkedin.auth.authorize(res, ['r_basicprofile']);
});

// Again, `res` is optional, you could pass `code` as the first parameter
app.get('/oauth/linkedin/callback', function(req, res) {
    Linkedin.auth.getAccessToken(res, req.query.code, req.query.state, function(err, results) {
        if ( err )
            return console.error(err);
        res.render('close-oauth', results)
    });
});

app.get('/oauth/linkedin/get-profile', function(req, res) {

	const linkedin = Linkedin.init(req.query.access_token);
	linkedin.people.url(req.query.url, ['picture-url','picture-urls::(original)','first-name','last-name','positions'], function(err, $in) {
		if(err) return res.json(err)
		res.json($in)
	});
})

app.listen(3000);