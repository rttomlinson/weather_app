"use strict";

var isFahrenheit = true; //Used by switch to toggle between temperature measurements.


$(document).ready(function() {
	console.log("ready function run");
	attachButtonListeners();
	addTempSwitchListener();
	
	
	let location = getLocation();//Attempt to get geolocation information. Returns a promise
	location.then(function onFulfilled(position) { //Returns Position Object
		let latitude = position.coords.latitude;
		let longitude = position.coords.longitude;
		console.log(`latitude: ${latitude}, longtitude: ${longitude}`);
		return ([latitude, longitude]); //fulfill next promise with array of latitude and longitude
		
	}, function onRejected(error) {
		//Need to ask user for latitude and longitude. Or zipcode? Alternate way to get lat and long
		let latitude = 35.6895; //Used for testing
		let longitude = 139.6917; //Tokyo lat/lon
		console.log(error);
		return ([latitude, longitude]);
		
	}).
	then(function onFulfilled([latitude, longitude]) {
		console.log("calling DarkSkyAPI");
		return queryDarkSkyAPI(latitude, longitude);
		//Returns a promise with Query from DarkSkyAPI
	}, function onRejected(error) {
		throw "Something happened when trying to get coordinates";
	}).
	then(function onFulfilled(weatherObj) {
		console.log("Weather Obj received!");
		/** Make all calls for what to do with the weather object **/
		let nowWrapperInfo = {"id": "now-weather", "info": weatherObj.currently};
		createNowDisplay(nowWrapperInfo);
		let todaysWrapperInfo = {"id": "todays-weather", "info": weatherObj.daily.data[0]};
		createTodaysDisplay(todaysWrapperInfo);
		let tomorrowsWrapperInfo = {"id": "tomorrows-weather", "info": weatherObj.daily.data[1]};
		createTomorrowsDisplay(tomorrowsWrapperInfo);
		let firstForecast = {"id": "day-one-forecast", "info": weatherObj.daily.data[1], "shortDate" : true};
        let secondForecast = {"id": "day-two-forecast", "info": weatherObj.daily.data[2], "shortDate": true};
        let thirdForecast = {"id": "day-three-forecast", "info": weatherObj.daily.data[3], "shortDate": true};
        let fourthForecast = {"id": "day-four-forecast", "info": weatherObj.daily.data[4], "shortDate": true};
        let forecastWrapperInfo = [ firstForecast, secondForecast, thirdForecast, fourthForecast];
	    createFourDayForecast(forecastWrapperInfo);
		
	}, function onRejected(err) {
		throw err;
	}).
	catch(function (error) {
		console.log(error);
	});	
});





