"use strict";

let express = require('express');
let router = express.Router();

let darkSky = require('../darkskyapi.js');
let darkSkyKey = process.env.DARK_SKY_API_KEY; //Set environment variable for your API Key



let lat;
let lon;

router.use(function (req, res, next) {
    if (req.query.lat && req.query.lon) {
        lat = req.query.lat; //Attempt to get lat and lon params
        lon = req.query.lon;
        console.log(lat, lon);
        let promiseDarkSky = darkSky(darkSkyKey, lat, lon);
        promiseDarkSky.then(function onFulfilled(data) {
            res.locals.darkSky = data;
            next();
        }, function onRejected(error) {
            next(error);
        });
    } else {
        next();
    }
});


router.get('/', function(req, res, next) {
    if (res.locals.darkSky) {
        res.send(res.locals.darkSky);
    }
    next("The routes you requested does not have any handlers. Please try a different one.");
});

module.exports = router;