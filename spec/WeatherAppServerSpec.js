"use strict";

let darkSkyAPI = require('../darkskyapi');
let http = require('http');
let app = require('../app');

let {darkSkyKey} = require('../keys/darkSkyKey');


describe("A call to the DarkSkyAPI", function() {
    let lat = 35.6895; //Should keep these global for production?
    let lon = 139.6917; //Tokyo lat/lon
    let darkSkyPromise = darkSkyAPI(darkSkyKey, lat, lon);
    
    it("results in a Javascript object", function() {
        expect(typeof darkSkyPromise).toBe('object');
    });
});