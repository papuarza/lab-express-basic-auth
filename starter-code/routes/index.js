var express = require('express');
var router = express.Router();
const PageScrapper = require('scrappers').PageScrapper;
var Xray = require('x-ray');
var x = Xray();

const User = require('../models/user')
const bcrypt = require('bcrypt')

router.get('/', function(req, res, next) {
    x('http://www.sport.es/es/rss/liga-bbva/rss.xml', {
    title: 'title',
    items: x('item', [{
      title: 'title',
      link: 'link',
      description: 'description'
    }])
  })(function(err, obj) {
    res.render('noticias', { obj });
    console.log(obj);
  })


});

router.get('/logout', function(req, res, next) {
  req.session.currentUser = null
  res.redirect('/')
});

router.get('/register', function(req, res, next) {
  if (req.session.currentUser) {
    return res.render('user-home', {username: "Papu"})
  }
  res.render('auth-user', {
    header: 'Register a new secure user',
    action: '/register',
    buttonText: 'Register',
    error: false
  });
});

router.post('/register', function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;
  const saltRounds = 10;
  User.findOne({username: username}, function(err, user) {
    if (err) return next(err);
    if(user === null){
      console.log(user)
      bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) return next(err);
        const user = new User({username, hash});
        user.save(function(err, doc) {
          if (err) return next(err);
          req.session.currentUser = user;
          res.render('user-home', {username});
        });
      });
    } else {
      res.render('auth-user', {
        header: 'Login a new secure user',
        action: '/login',
        buttonText: 'Login',
        error: true
      });
    }
  });
});

router.get('/login', function(req, res, next) {
  res.render('auth-user', {
    header: 'Login a new secure user',
    action: '/login',
    buttonText: 'Login',
    error: false
  });
});

router.post('/login', function(req, res, next) {
  const username = req.body.username
  const password = req.body.password
  User.findOne({username: username}, function(err, user) {
    if (err) return next(err);
    const hash = user.hash;
    bcrypt.compare(password, hash, function(err, isValid) {
      if (err) return next(err);
      if (!isValid) {
        res.render('auth-user', {
          header: 'Login a new secure user',
          action: '/login',
          buttonText: 'Login',
          error: true
        });
      }
      else {
        req.session.currentUser = user;
        res.render('user-home', {username});
      }
    });
  });
});


module.exports = router;
