"use strict";

let darkSkyAPI = require('../public/javascripts/darkskyapi');




describe("A call to the DarkSkyAPI", function() {
    let weatherKey = "da122a76ea01514b2d659d12db1b747c";
    let lat = 35.6895; //Should keep these global for production?
    let lon = 139.6917; //Tokyo lat/lon
    let weatherObj = darkSkyAPI(weatherKey, lat, lon);
    it("results in a Javascript object", function() {
        expect(typeof weatherObj).toBe('object');
    });
});