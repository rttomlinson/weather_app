"use strict";

let express = require('express');
let app = express();

let path = require("path");

/** Set views path and view engine **/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


/** Set path for static files **/
app.use(express.static(path.join(__dirname, 'public')));


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
    
    
    res.status(err.status || 500);
    res.send('An error occured or a file could not be found');
});




app.listen(process.env.port || 8080, function() {
    console.log('listening on port 8080');
});
