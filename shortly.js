var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var Bookshelf = require('bookshelf');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt');
var uuid = require('uuid');



var db = require('./app/config');
var Users = require('./app/collections/users');
var Sessions = require('./app/collections/sessions');
var Session = require('./app/models/session');
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
function(req, res) {
  res.render('index');
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
  // retrieve the userID for the current sessionID and then select * from links where userID matches
  // then res.send the current set of links

  Sessions.query('where', 'session_id', '=', req.session.id)
   .fetch().then(function(session) {

    Links.query('where', 'user_id', '=', session.user_id)
    .fetch().then(function(models) {
      res.send(200, models);
    })
   });
  // Links.reset().fetch().then(function(links) {
  //   res.send(200, links.models);
  // });
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


app.post('/signup',
  function (req, res) {
    var uri = req.body.url;
    var u = new User({ username: req.body.username, password: req.body.password })
    u.save();
    console.log(u.attributes.password)
    res.send(201, null);
  }
);

app.post('/login',
  function (req, res) {

   Users.query('where', 'username', '=', req.body.username)
   .fetch()
   .then(function (collection) {
      // bcrypt.compare(req.body.password, collection.models[0].attributes.password, function (err, result) {
      //   // console.log(collection.models[0].attributes.password)
      //   // console.log(collection.models[0].get('password'))
      //   if (result === true) {
      //     console.log("correct");
      //   } else {
      //     console.log("incorrect");
      //   }
      // });
      if (req.body.password === collection.models[0].attributes.password) {
        console.log("correct");
        req.session.regenerate(function() {
          req.session.user = req.body.username;
          new Session({'session_id': req.session.id, 'user_id': collection.models[0].attributes.user_id}).save().then(function (model) {
            res.redirect('/links');
          });
        })
      } else {
        res.redirect('/login');
      }
   });

  }
);

app.get('/logout', function (req, res) {
  req.session.destroy(function () {
    res.render('index');
  });
});

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.render('index');
  }
}

app.get('/restricted', restrict, function(request, response){
  response.send(200);
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
