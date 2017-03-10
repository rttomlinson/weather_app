"use strict";

let express = require('express');
let app = express();
let path = require("path");

/** Set views path and view engine **/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


/** Set path for static files **/
app.use(express.static(path.join(__dirname, 'public')));


/** Get routes **/
let weather = require('./routes/weather');

app.use('/weather', weather);

app.get('/', function(req, res) {
    res.render('index');
});


/** 404 Handler **/
app.use(function (req, res, next) {
    let error = new Error("File not found");
    error.status = 404;
    next(error);
});

/** Error Handler **/
app.use(function (err, req, res, next) {
    //set locals, only provide error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    
    res.status(err.status || 500);
    res.send('An error occured or a file could not be found');
});


module.exports = app;
