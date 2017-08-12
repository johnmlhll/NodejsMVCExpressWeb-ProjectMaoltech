
//define server/midware/client variable definitions & module dependencies
var express = require('express'),
    http = require('http'),
    path = require('path'),
    config = require('./config')(),
    connect = require('connect'),
    favicon = require('serve-favicon'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    MongoClient = require('mongodb').MongoClient,
    Admin = require('./controllers/Admin'),
    Home = require('./controllers/Home'),
    Blog = require('./controllers/Blog'),
    Page = require('./controllers/Page');

var app = express();
//var database,= null;

app.set('port', process.env.PORT || 3000);//default back up for port config routing


//notifications to all env/dependencies on changes/operations
app.set('views', __dirname+'/templates');
app.set('view engine', 'hjs');
app.use(favicon(__dirname+'/public/images/favicon.ico'));
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(multer());
app.use(cookieParser('maoltech-site'));
app.use(methodOverride());
app.use(session({secret:'soldier', resave:false, saveUninitialized:true}));
app.use(require('less-middleware')({src: __dirname+'/public'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('views', __dirname+'/templates'); //social media routingm -  meddelareExpress.getRouter()


//dev only***
if('development'== app.get('env')) {
  app.use(express.errorHandler());
}
var db;

//console.log('PROCESS', process.env)

var mongoUri = process.env.MONGODB_URI ? process.env.MONGODB_URI : config.mongo.host + ':' + config.mongo.port + '/maoltech';//not assigning the connection string?? 25/9.

if(mongoUri != process.env.MONGODB_URI) {
  mongoUri = 'mongodb://' + config.mongo.host + ':' + config.mongo.port + '/maoltech';
}
else {
  mongoUri = process.env.MONGODB_URI;
}
console.log("Note that cloud storage var mongoUri is "+mongoUri);


//main mongodb server connection eventhandler - local first
MongoClient.connect(mongoUri, function(err, db){
    if(err) {
        console.log('Sorry, the server (mongodb) is not running');
    }
    else{
      var attachDB = function(req, res, next) {
        req.db=db;
        next();
      };
      app.all('/admin', attachDB, function (req, res, next){
        Admin.run(req, res, next);
      });
      app.all('/blog/:id', attachDB, function (req, res, next){
        Blog.runArticle(req, res, next);
      });
      app.all('/blog', attachDB, function (req, res, next){
        Blog.run(req, res, next);
      });
      app.all('/services', attachDB, function (req, res, next){
         Page.run('services',req, res, next);
      });
      app.all('/about', attachDB, function (req, res, next){
         Page.run('about',req, res, next);
      });
      app.all('/contacts', attachDB, function (req, res, next){
         Page.run('contacts',req, res, next);
      });
      app.all('/', attachDB, function (req, res, next){
         Home.run(req, res, next);
      });
      http.createServer(app).listen(config.port, function(){
        console.log(
          'Successfully connected to local mongodb://'+config.mongo.host+':'+config.mongo.port,
          '\nExpress server listening on port '+config.port
      );
    });
  }
});
