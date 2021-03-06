var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var Bookshelf = require('bookshelf');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var uuid = require('uuid');



var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Session Based Authentication
app.use(cookieParser());
app.use(session({
  genid: function(req) {
    return genuuid() // use UUIDs for session IDs
  },
  secret: 'keyboard cat'
}))

function genuuid(){
  return uuid.v1();
};


app.get('/', 
function (req, res) {
  util.checkUser(req, res, function (loggedIn) {
    res.render('index');
  })
  
});

app.get('/create', 
function(req, res) {
  res.render('index');
});

app.get('/login', 
function(req, res) {
  res.render('login');
});

app.get('/signup', 
function(req, res) {
  res.render('signup');
});

app.get('/links', 
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        Links.create({
          url: uri,
          title: title,
          base_url: req.headers.origin
        })
        .then(function(newLink) {
          res.send(200, newLink);
        });
      });
    }
  });
});


/************************************************************/
// Write your authentication routes here
/************************************************************/


app.post('/signup', function (req, res) {
 
  new User({ username: req.body.username}).fetch().then(function (user) {
    if(user) {
      res.redirect('/login');
      console.log('fuck you');
    } else {
      var newUser = new User({username: req.body.username, password: req.body.password });
      newUser.save()
      .then(function (newUser) {
        util.createSession(req, res, newUser);
      });
    }
  });
});

app.post('/login', function (req, res) {
    new User({username: req.body.username }).fetch()
    .then(function (user) {
      if(user) {
        user.comparePassword(req.body.password, function (match) {
          if(match) {
            console.log(match)
            util.createSession(req, res);
          } else {
            console.log(match)
            res.redirect('/login')
          }
        });
      } else {
        res.redirect('/login');
      }
    });
  }
);

app.get('/logout', function (req, res){
  if(req.session.id) {
    req.session.destroy();
    res.redirect('/login');
  }
});



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits')+1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
