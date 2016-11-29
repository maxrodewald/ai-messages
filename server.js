var express = require('express');
var app = module.exports = express();
var cors = require('cors');
var massive = require('massive');
var bodyParser = require('body-parser');
var config = require('./config.js');
var session = require('express-session');


//controllers
var BasketballController = require('./controllers/BasketballController.js');
var MessagesController = require('./controllers/MessagesController.js');
var LoginController = require('./controllers/UserControllers/LoginController.js');
var SignupController = require('./controllers/UserControllers/SignupController.js');

//db setup
var massiveInstance = massive.connectSync({
    connectionString: config.database
});

app.set('db', massiveInstance);
var db = app.get('db');

//express setup
app.use(cors());
app.use(bodyParser.json());
app.use(session({
    secret: 'sdfsdgadgsassrg',
    saveUninitialized: false,
    resave: false
}));

//ENDPOINTS

//messaging
    app.post('/api/handleRequest',BasketballController.handleRequest);
    app.get('/api/getAllMessages/:id', MessagesController.getAllMessages);

//user login/signupView
    app.post('/api/signup', SignupController.signup);
    app.post('/api/login', LoginController.login);

app.listen(config.port, function() {
    console.log('listening on ' + config.port);
});
