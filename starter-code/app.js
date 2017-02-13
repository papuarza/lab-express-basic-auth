const express        = require("express");
const path           = require("path");
const logger         = require("morgan");
const cookieParser   = require("cookie-parser");
const bodyParser     = require("body-parser");
const mongoose       = require("mongoose");
const app            = express();
const index = require('./routes/index');
const PageScrapper = require('scrappers').PageScrapper;

// Controllers
const session = require("express-session");
const createMongoStorage = require("connect-mongo")
const MongoStore = createMongoStorage(session);

// Mongoose configuration
mongoose.connect("mongodb://localhost/basic-auth");

// Middlewares configuration
app.use(logger("dev"));

// View engine configuration
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Access POST params with body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Authentication
app.use(cookieParser());
app.use(session({
  secret: "basic-auth-secret",
  cookie: { maxAge: 60000 * 5 },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  }),
  resave: true,
  saveUninitialized: true,
}));

// Routes

app.use('/', index);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});




//////SCRAPPER/////
var hnParser = {
  //$ is cheerio (jquery) instance of the parsed page
  parse:function($){
    //get the text of the third link in a page
    let noticia = {
      title: $('title').eq(1).text(),
      description: $('description').eq(1).text(),
      url: $('link').eq(1).text()
    }
    return noticia;
  }
};

var SPORT_NEWS_HOME = "http://www.sport.es/es/rss/futbol/rss.xml";
var scrapper = new PageScrapper({
  url: SPORT_NEWS_HOME,
  parser: hnParser
});

// scrapper.get(function(err,parsed){
//   console.log(parsed.title, parsed.description, parsed.url);
// });

module.exports = app;
