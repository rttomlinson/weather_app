"use strict";

$(document).ready(function() {
	console.log("ready function run");
	var locationNode = document.getElementById("location");
	var weatherKey = "da122a76ea01514b2d659d12db1b747c";

	var isFahrenheit = true; //Used by switch to toggle between temperature measurements.
	
	
	
	
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
		return queryDarkSkyAPI(weatherKey, latitude, longitude);
		//Returns a promise with Query from DarkSkyAPI
	}, function onRejected(error) {
		throw "Something happened when trying to get coordinates";
	}).
	then(function onFulfilled(weatherObj) {
		console.log("Weather Obj received!");
		console.log(weatherObj);
		/** Make all calls for what to do with the weather object **/
		let nowWrapperInfo = {"id": "now-weather", "info": weatherObj.currently};
		createNowDisplay(nowWrapperInfo);
		let todaysWrapperInfo = {"id": "todays-weather", "info": weatherObj.daily.data[0]};
		createTodaysDisplay(todaysWrapperInfo);
		let tomorrowsWrapperInfo = {"id": "tomorrows-weather", "info": weatherObj.daily.data[1]};
		createTomorrowsDisplay(tomorrowsWrapperInfo);

		
		
		
		
	}).
	catch(function (error) {
		console.log(error);
	});	
});


/**
 * Attempts to get user location using the getCurrentPosition method of the geolocation object
 * @params none
 * @return none
 * Writes error message if browser does not support geolocation.
 * Note from Google: Request is likely to fail on Chrome if not requested on https. Unknown about other browers. Google recommends assuming that user's will not give location.
 */
function getLocation() {
	return new Promise(function (resolve, reject) {
	    if (navigator.geolocation) {
	      navigator.geolocation.getCurrentPosition(resolve, reject);
	    } else {
	        reject("Geolocation is not supported by this browser.");
	    }
	});
}





/**
 * Sends a request to the Dark Sky API using the globally defined xmlhttprequest object
 * @params none
 * @return undefined
 */
function queryDarkSkyAPI(weatherKey, lat, lon) {
	return new Promise(function (resolve, reject) {
		let httpRequest = new XMLHttpRequest();
	    httpRequest.open("GET", "https://crossorigin.me/https://api.darksky.net/forecast/" + weatherKey + "/" + lat + "," + lon, true);
		httpRequest.onload = function() {
	      if (httpRequest.status === 200){
	        var weatherObj = JSON.parse(httpRequest.responseText); //Holds response from Dark Sky API. Right now scoped. Should this be global?
	        resolve(weatherObj);
	        
	        
	        
	        
	        
	        
	        
	        //Just to see the JSON structure
	        //Build objects to hold information for each respective wrapper
	        /*var nowWrapperInfo = {"id": "now-weather", "info": weatherObj.currently};
	        var todaysWrapperInfo = {"id": "todays-weather", "info": weatherObj.daily.data[0]};
	        var tomorrowsWrapperInfo = {"id": "tomorrows-weather", "info": weatherObj.daily.data[1]};
	        var firstForecast = {"id": "day-one-forecast", "info": weatherObj.daily.data[1], "shortDate" : true};
	        var secondForecast = {"id": "day-two-forecast", "info": weatherObj.daily.data[2], "shortDate": true};
	        var thirdForecast = {"id": "day-three-forecast", "info": weatherObj.daily.data[3], "shortDate": true};
	        var fourthForecast = {"id": "day-four-forecast", "info": weatherObj.daily.data[4], "shortDate": true};
	        var forecastWrapperInfo = [ firstForecast, secondForecast, thirdForecast, fourthForecast];
	        createFourDayForecast(forecastWrapperInfo);
	        createNowDisplay(nowWrapperInfo);
	        createTodaysDisplay(todaysWrapperInfo);
	        createTomorrowsDisplay(tomorrowsWrapperInfo);
	        getTimeOfWeatherInfo(weatherObj);
	        window.addEventListener("resize", function() {
	          forecastWrapperInfo.forEach(addDate);
	        })
			*/
	      }
	      else {
	        reject("An error occured while sending a request to Dark Sky's servers. Status code returned was " + httpRequest.status);
	      }
	    };
	    httpRequest.send(null);
	});

}



  /**
 * Takes the wrapper obj and looks up the  weather icon and places this HTML(SVG) in the .icon-holder div for it's id
 * @params {Object} obj
 * @return undefined
 *
 */
function addIcon(wrapperObj) {
  var iconText = wrapperObj.info.icon;
  var iconSVG = iconsMapObj[iconText]["svg"] === undefined ? "Insert Default SVG" : iconsMapObj[iconText]["svg"];
  var iconHolder = document.querySelector("#" + wrapperObj.id + " " + ".icon-holder");
  iconHolder.innerHTML = iconSVG;
}
/**
 * Displays the current day of the week and month above today's weather
 * @params {Object} obj, weather object
 * @params [Boolean] addEventListenerForShortText, flag for adding event listener
 * @return none, maybe return an event?
 */
  function addDate(wrapperObj) {
    var time = wrapperObj.info.time * 1000;
    var todaysDateObj = new Date(time);
    var longTextDate = todaysDateObj.toDateString();
    var shortTextDate = (todaysDateObj.getMonth() + 1 + "") + "/" + (todaysDateObj.getDate() +  "");
    var querySelectorString = `#${wrapperObj.id} .date-box`;
    var dateBox = document.querySelector(querySelectorString);
    if (wrapperObj.shortDate) {
      if (window.innerWidth < 1000) {
        dateBox.textContent = shortTextDate;
      }
      else {
        dateBox.textContent = longTextDate;
      }
    }
    else {
      dateBox.textContent = longTextDate;
    }
  }
  /* Applies corresponding background colors according to the icon for the passed in wrapper
  * @params [Object] wrapperObj
  * @return undefined
  */
  function addWrapperBG(wrapperObj) {
    var backgroundColor = iconsMapObj[wrapperObj.info.icon].colors;
    document.getElementsByTagName("main")[0].style.background = backgroundColor;
  }

/**
 * Gets the time registered in the "currently" object's time. Likely the time when the Dark Sky API queried its weather sources to populate the weather obj. It might be better to just return the time when the weather obj is returned, in case the API do not update it's info as often. Will provide a better UI. Will need to implement cache busting, but likely not necessary for a low-importance weather app.
 * @params {Object} obj - The weather obj
 * @return none
 */
  function getTimeOfWeatherInfo(obj) {
    var time = (obj.currently.time) * 1000; //Need to multiple by 1000 because Dark Sky API drops the milliseconds.
    time = new Date(time);
    document.getElementById("last-update").innerHTML = time; 
  }
  
/**
 * Gets the current air temperature of the location submitted at the time that the weather object was created on the Dark Sky API servers.
 * @params {Object} obj - The weather obj
 * @return none
 */
  function getAirTemp(wrapperObj) {
    var temp = wrapperObj.info.temperature;
    var fahrenheitTemp = Math.round(temp); //DarkSkyAPI defaults to Fahrenheit
    var celsiusTemp = Math.round(convertToCelsius(temp));
    document.querySelector(`#${wrapperObj.id} .fahrenheit .air-temp`).innerHTML = fahrenheitTemp + "&#176;" + "F";
    document.querySelector(`#${wrapperObj.id} .celsius .air-temp`).innerHTML = celsiusTemp + "&#176;" + "C";
  }
  /**
 * Gets the todays air temperature max and min for the current day of the location submitted at the time that the weather object was created on the Dark Sky API servers.
 * @params {Object} obj - The weather obj
 * @return none
 */
  function getTempMaxAndMin(wrapperObj) {
    var tempMax = wrapperObj.info.temperatureMax; //DarkSkyAPI defaults to Fahrenheit
    var tempMaxFahrenheit = Math.round(tempMax);
    var tempMaxCelsius = Math.round(convertToCelsius(tempMax));
    var tempMin = wrapperObj.info.temperatureMin;
    var tempMinFahrenheit = Math.round(tempMin);
    var tempMinCelsius = Math.round(convertToCelsius(tempMin));
    document.querySelector(`#${wrapperObj.id} .fahrenheit .max-temp`).innerHTML = tempMaxFahrenheit + "&#176;" + "F"; 
    document.querySelector(`#${wrapperObj.id} .fahrenheit .min-temp`).innerHTML = tempMinFahrenheit + "&#176;" + "F"; 
    document.querySelector(`#${wrapperObj.id} .celsius .max-temp`).innerHTML = tempMaxCelsius + "&#176;" + "C"; 
    document.querySelector(`#${wrapperObj.id} .celsius .min-temp`).innerHTML = tempMinCelsius + "&#176;" + "C";  
  }
  
   /**
 * Gets the todays precipitation percentage of the current day of the location submitted at the time that the weather object was created on the Dark Sky API servers.
 * @params {Object} obj - The weather obj
 * @return none
 */
  function getPrecipPercentage(wrapperObj) {
    var precipProbability = "Precip: " + (Math.round((wrapperObj.info.precipProbability) * 100)) + "%"; //DarkSkyAPI defaults to Fahrenheit
    document.querySelectorAll(`#${wrapperObj.id} .precip-percentage`).forEach(function(element) { //Loop for fahrenheit and for celsius
    	element.innerHTML = precipProbability;
    });
  }

  
  /**
   * Creates a container for each forecast day and adds them to the #forecasts div
   * @params {Object} obj, weather obj
   * @returns none, acts on HTML DOM elements
   */
  function createFourDayForecast(forecastWrapperObj) {
    forecastWrapperObj.forEach(function(day) {
      addDate(day, true);
      addIcon(day);
      getTempMaxAndMin(day);
      getPrecipPercentage(day);
    });
  }
  
  function createNowDisplay(nowWrapperInfo) {
    //Add date to #now-weather > .todays-date
    //Add icon to #now-weather > #big-icon-holder
    //Add temperature to #current-temp-holder
    addDate(nowWrapperInfo);
    addIcon(nowWrapperInfo);
    addWrapperBG(nowWrapperInfo);
    getAirTemp(nowWrapperInfo);

  }
  
  function createTodaysDisplay(todaysWrapperInfo) {
    addIcon(todaysWrapperInfo);
    addDate(todaysWrapperInfo);
    addWrapperBG(todaysWrapperInfo);
    getPrecipPercentage(todaysWrapperInfo);
    getTempMaxAndMin(todaysWrapperInfo);
  }
  
  function createTomorrowsDisplay(tomorrowsWrapperInfo) {
    addIcon(tomorrowsWrapperInfo);
    addWrapperBG(tomorrowsWrapperInfo);
    getPrecipPercentage(tomorrowsWrapperInfo);
    getTempMaxAndMin(tomorrowsWrapperInfo);
    addDate(tomorrowsWrapperInfo);
  }
  
  function convertToCelsius(temp) {
    return ((temp - 32) * (5/9));
  }
  
  /*Add click event listeners to display-buttons
  *
  */
  document.getElementById("weather-display-buttons").addEventListener("click", function(event) {
  	if (event.target.tagName === 'BUTTON') {
  		let buttons = Array.from(event.currentTarget.querySelectorAll('button')); //For each button, remove the active-button class
  		buttons.forEach(function (element, index, arr) {
  			element.classList.remove('active-button');
  		});
  		
  		let weatherHolders = Array.from(document.getElementsByClassName("weather-holder"));//clear display class from weather-holders
  		weatherHolders.forEach(function (element, index, arr) {
  			element.classList.remove('display');
  		});
  		
  		let clickedButton = event.target;
  		clickedButton.classList.add('active-button');//Then add the active-button class to the target element
  		let sectionID = clickedButton.dataset.target;//then get the data-target attribute from the element, which is the id of the weather holder
  		let weatherHolder = document.getElementById(sectionID);
  		weatherHolder.classList.add('display'); //add display to the selected weather holder
  	}
	//Remove all active-button from all display-button to clean. Then add active to button to the button that was clicked
	//Relies on display and buttons divs staying in the same order. Very brittle. Need to change.   
  }, false); 






   
    /** Toggle between Fahrenheit and Celsius
     *
     *
     **/
//    document.querySelector(".nub").addEventListener("click", switchMeasure);
  
  function switchMeasure() {
    if (isFahrenheit) {//global state
      document.querySelectorAll(".fahrenheit").forEach(function(element) {
        element.classList.remove("active-weather");
      });
      document.querySelectorAll(".celsius").forEach(function(element) {
        element.classList.add("active-weather");
      });
      this.textContent = "C";
    }
    else {
       document.querySelectorAll(".celsius").forEach(function(element) {
        element.classList.remove("active-weather");
      });
      document.querySelectorAll(".fahrenheit").forEach(function(element) {
        element.classList.add("active-weather");
      });
      this.textContent = "F";
    }
    isFahrenheit = !isFahrenheit;
  }
























  /**Ignore for now. Supposed to use nub to open menu
  document.querySelector(".nub").addEventListener("click", function() {
  console.log("click click");  document.querySelector(".menu").classList.toggle("active-menu");
  }, false);
  **/
  var iconsMapObj = {
    "clear-night": { "svg": `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="26.568px" height="28.475px" viewBox="0 0 26.568 28.475" style="enable-background:new 0 0 26.568 28.475;"
	 xml:space="preserve">
<path id="_x30_2" style="fill:#83A5B3;" d="M0.07,12.568C-0.703,20.506,5.035,27.59,12.969,28.4
	c4.913,0.502,9.47-1.555,12.474-5.022c2.785-3.197-0.33-3.181-1.471-3.299C12.232,18.537,10.314,6.86,12.146,2.131
	c0.582-2.273-0.621-2.284-1.576-2.009C10.57,0.122,0.969,2.733,0.07,12.568z M13.309,25.068C7.215,24.445,2.781,19,3.402,12.908
	c0.354-3.454,2.285-6.474,4.979-8.242c-1.326,7.823,4.613,16.961,13.105,17.854C19.325,24.17,16.228,25.365,13.309,25.068z"/>
</svg>`,
                   "colors": "linear-gradient(to bottom, #010711 0%, #010711 20%, #09162D 20%, #09162D 40%, #2D4671 40%, #2D4671 60%, #708BBA 60%, #708BBA 80%, #A8BEE5 80%, #A8BEE5 100%)"},
    "clear-day": { "svg": `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="40.367px" height="40.973px" viewBox="0 0 40.367 40.973" style="enable-background:new 0 0 40.367 40.973;"
	 xml:space="preserve">
<g id="_x30_1">
	<path style="fill:#83A5B3;" d="M22.594,1.79c0-0.988-0.801-1.79-1.789-1.79c-0.988,0-1.79,0.802-1.791,1.79l0.001,3.977
		c0,0.988,0.802,1.791,1.79,1.791c0.988,0,1.789-0.803,1.789-1.791V1.79z"/>
	<path style="fill:#83A5B3;" d="M8.632,6.078c-0.699-0.699-1.833-0.699-2.532,0c-0.699,0.699-0.699,1.833,0,2.532l2.812,2.811
		c0.7,0.699,1.833,0.699,2.532,0c0.699-0.698,0.699-1.832,0-2.53L8.632,6.078z"/>
	<path style="fill:#83A5B3;" d="M1.791,18.377C0.802,18.377,0,19.179,0,20.167c0,0.988,0.803,1.79,1.79,1.79h3.977
		c0.988,0,1.79-0.802,1.79-1.791c0-0.987-0.802-1.789-1.79-1.789H1.791z"/>
	<path style="fill:#83A5B3;" d="M6.078,32.944c-0.699,0.699-0.699,1.832,0,2.531c0.7,0.698,1.832,0.698,2.532,0l2.811-2.812
		c0.7-0.699,0.7-1.833,0-2.531c-0.698-0.697-1.833-0.697-2.531,0.001L6.078,32.944z"/>
	<path style="fill:#83A5B3;" d="M18.982,39.181c0,0.988,0.801,1.791,1.79,1.791c0.988-0.002,1.791-0.803,1.791-1.791v-3.977
		c0-0.988-0.803-1.79-1.791-1.79c-0.987,0-1.79,0.803-1.79,1.789V39.181z"/>
	<path style="fill:#83A5B3;" d="M32.945,35.499c0.697,0.699,1.832,0.699,2.531,0c0.696-0.699,0.696-1.832,0-2.531l-2.812-2.812
		c-0.699-0.698-1.832-0.698-2.531,0c-0.699,0.699-0.699,1.832,0,2.53L32.945,35.499z"/>
	<path style="fill:#83A5B3;" d="M38.576,22.595c0.99,0,1.791-0.803,1.791-1.79c0-0.989-0.801-1.791-1.789-1.791h-3.977
		c-0.988,0-1.791,0.801-1.791,1.791c0,0.987,0.803,1.79,1.791,1.788L38.576,22.595z"/>
	<path style="fill:#83A5B3;" d="M35.498,8.632c0.701-0.698,0.701-1.833,0-2.53c-0.699-0.699-1.83-0.699-2.531,0l-2.811,2.812
		c-0.699,0.699-0.699,1.831,0,2.531c0.699,0.699,1.832,0.699,2.531,0L35.498,8.632z"/>
	<path style="fill:#83A5B3;" d="M20.805,9.7c-6.145,0-11.125,4.981-11.125,11.127s4.981,11.127,11.125,11.127
		c6.146,0,11.127-4.981,11.127-11.127C31.932,14.682,26.951,9.7,20.805,9.7z M20.805,28.401c-4.184,0-7.576-3.392-7.576-7.574
		s3.392-7.576,7.576-7.576c4.185,0,7.576,3.394,7.576,7.576S24.988,28.401,20.805,28.401z"/>
</g>
</svg>`, "colors": "linear-gradient(to bottom, #FEDF0E 0%, #FEDF0E 20%, #F9E24B 20%, #F9E24B 40%, #FFEF80 40%, #FFEF80 60%, #FFF9CF 60%, #FFF9CF 80%, #DBBF00 80%, #DBBF00 100%)"},
    "rain": { "svg": `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="43.243px" height="42.547px" viewBox="0 0 43.243 42.547" style="enable-background:new 0 0 43.243 42.547;"
	 xml:space="preserve">
<g id="_x32_2">
	<path style="fill:#83A5B3;" d="M32.375,13.823c1.453-0.588,2.904-0.541,3.318-0.541c2.084,0,4.598,1.821,4.598,4.81
		c0,2.54-2.061,4.598-4.598,4.598h-0.203c-0.777,0-1.408,0.631-1.408,1.41c0,0.774,0.631,1.403,1.408,1.403h0.199
		c4.172,0,7.553-3.381,7.553-7.554c0,0,0.039-7.547-7.902-7.547c-1.717-7.069-8.33-7.428-10.187-6.929
		C23.143,1.472,19.793,0,16.404,0C9.689,0,4.186,5.193,3.689,11.783C1.486,13.052,0,15.429,0,18.153c0,4.061,3.291,7.35,7.352,7.35
		h0.99c0.635,0,1.234-0.688,1.234-1.407c0-0.775-0.633-1.406-1.408-1.406H7.986c-2.746,0-4.771-1.985-4.771-4.557
		c0-2.099,1.334-3.94,3.418-4.568c0.248-9.921,8.963-10.428,9.93-10.428c2.879,0,5.736,1.412,7.574,3.502
		C27.852,5.419,32.948,8.283,32.375,13.823z"/>
	<g>
		<path style="fill:#83A5B3;" d="M16.789,23.374c0.414-0.713,0.168-1.627-0.545-2.039c-0.715-0.412-1.629-0.168-2.041,0.546
			l-1.656,2.872c-0.416,0.715-0.17,1.628,0.545,2.039c0.715,0.413,1.627,0.168,2.039-0.545L16.789,23.374z"/>
		<path style="fill:#83A5B3;" d="M12.26,30.791c0.412-0.714,0.17-1.628-0.547-2.04c-0.713-0.412-1.625-0.168-2.039,0.547
			L8.016,32.17c-0.412,0.714-0.166,1.628,0.549,2.04c0.713,0.412,1.625,0.167,2.037-0.548L12.26,30.791z"/>
		<path style="fill:#83A5B3;" d="M23.825,23.374c0.409-0.713,0.166-1.627-0.55-2.039c-0.713-0.412-1.627-0.168-2.037,0.546
			l-1.66,2.872c-0.412,0.715-0.168,1.628,0.547,2.039c0.715,0.413,1.627,0.168,2.042-0.545L23.825,23.374z"/>
		<path style="fill:#83A5B3;" d="M19.293,31.15c0.412-0.715,0.168-1.629-0.547-2.041c-0.713-0.411-1.627-0.166-2.039,0.548
			l-1.658,2.872c-0.41,0.714-0.168,1.628,0.549,2.039c0.711,0.412,1.627,0.166,2.039-0.547L19.293,31.15z"/>
		<path style="fill:#83A5B3;" d="M14.803,38.928c0.41-0.715,0.166-1.628-0.549-2.041c-0.715-0.41-1.627-0.166-2.039,0.549
			l-1.658,2.871c-0.412,0.715-0.168,1.627,0.545,2.039c0.715,0.413,1.629,0.168,2.041-0.546L14.803,38.928z"/>
		<path style="fill:#83A5B3;" d="M30.856,23.374c0.412-0.713,0.168-1.627-0.545-2.039c-0.716-0.412-1.63-0.168-2.042,0.546
			l-1.658,2.872c-0.409,0.715-0.168,1.628,0.548,2.039c0.715,0.413,1.627,0.168,2.041-0.545L30.856,23.374z"/>
		<path style="fill:#83A5B3;" d="M26.329,31.15c0.412-0.715,0.166-1.629-0.547-2.041c-0.714-0.411-1.63-0.166-2.041,0.548
			l-1.659,2.872c-0.412,0.714-0.168,1.628,0.547,2.039c0.715,0.412,1.629,0.166,2.041-0.547L26.329,31.15z"/>
	</g>
</g>
</svg>`, "colors" : "linear-gradient(to bottom, #128FFF 0%, #128FFF 20%, #AAD7FF 20%, #AAD7FF 40%, #7AC0FF 40%, #7AC0FF 60%, #004A8C 60%, #004A8C 80%, #00396C 80%, #00396C 100%)"},
    "snow": {"svg": `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="43.244px" height="33.704px" viewBox="0 0 43.244 33.704" style="enable-background:new 0 0 43.244 33.704;"
	 xml:space="preserve">
<g id="_x32_5">
	<g>
		<path style="fill:#83A5B3;" d="M24.054,24.627l-0.947-0.545l0.947-0.547c0.327-0.188,0.438-0.605,0.25-0.934
			c-0.189-0.326-0.607-0.438-0.933-0.25l-0.947,0.547v-1.092c0-0.378-0.305-0.684-0.682-0.684c-0.379,0-0.684,0.306-0.684,0.684
			v1.092l-0.947-0.547c-0.326-0.188-0.742-0.076-0.932,0.25c-0.188,0.327-0.076,0.744,0.25,0.934l0.945,0.547l-0.945,0.545
			c-0.326,0.188-0.438,0.605-0.25,0.935c0.189,0.326,0.605,0.438,0.932,0.249l0.947-0.548v1.094c0,0.379,0.305,0.685,0.684,0.685
			c0.377,0,0.682-0.306,0.682-0.685v-1.094l0.947,0.548c0.323,0.188,0.741,0.077,0.933-0.249
			C24.493,25.236,24.381,24.817,24.054,24.627z"/>
		<path style="fill:#83A5B3;" d="M31.472,24.627l-0.947-0.545l0.947-0.547c0.325-0.188,0.438-0.605,0.25-0.934
			c-0.188-0.326-0.605-0.438-0.935-0.25l-0.947,0.547v-1.092c0-0.378-0.303-0.684-0.682-0.684c-0.377,0-0.685,0.306-0.685,0.684
			v1.092l-0.945-0.547c-0.323-0.188-0.741-0.076-0.932,0.25c-0.188,0.327-0.076,0.744,0.25,0.934l0.945,0.547l-0.945,0.545
			c-0.326,0.188-0.438,0.605-0.25,0.935c0.188,0.326,0.607,0.438,0.932,0.249l0.945-0.548v1.094c0,0.379,0.308,0.685,0.685,0.685
			c0.379,0,0.682-0.306,0.682-0.685v-1.094l0.947,0.548c0.328,0.188,0.746,0.077,0.935-0.249
			C31.91,25.235,31.797,24.817,31.472,24.627z"/>
		<path style="fill:#83A5B3;" d="M16.635,24.627l-0.945-0.545l0.945-0.547c0.326-0.188,0.439-0.605,0.25-0.934
			c-0.188-0.326-0.604-0.438-0.932-0.25l-0.947,0.547v-1.092c0-0.378-0.305-0.684-0.684-0.684c-0.377,0-0.68,0.306-0.68,0.684v1.092
			l-0.947-0.547c-0.328-0.188-0.744-0.076-0.934,0.25c-0.188,0.327-0.076,0.744,0.25,0.934l0.947,0.547l-0.947,0.545
			c-0.326,0.188-0.438,0.605-0.25,0.935c0.189,0.326,0.605,0.438,0.934,0.249l0.947-0.548v1.094c0,0.379,0.303,0.685,0.68,0.685
			c0.379,0,0.684-0.306,0.684-0.685v-1.094l0.947,0.548c0.328,0.188,0.744,0.077,0.932-0.249
			C17.074,25.235,16.961,24.817,16.635,24.627z"/>
		<path style="fill:#83A5B3;" d="M20.209,31.293l-0.949-0.547l0.949-0.547c0.324-0.189,0.438-0.605,0.248-0.934
			c-0.189-0.326-0.607-0.438-0.934-0.249l-0.945,0.548v-1.094c0-0.377-0.307-0.684-0.684-0.684c-0.375,0-0.682,0.307-0.682,0.684
			v1.094l-0.945-0.548c-0.326-0.188-0.746-0.076-0.934,0.249c-0.189,0.326-0.076,0.744,0.25,0.934l0.945,0.547l-0.945,0.547
			c-0.326,0.188-0.439,0.604-0.25,0.933c0.188,0.325,0.607,0.438,0.934,0.25l0.945-0.548v1.094c0,0.378,0.307,0.684,0.682,0.684
			c0.377,0,0.684-0.306,0.684-0.684v-1.093l0.945,0.547c0.326,0.188,0.744,0.075,0.934-0.25
			C20.647,31.9,20.533,31.481,20.209,31.293z"/>
		<path style="fill:#83A5B3;" d="M27.306,31.293l-0.947-0.547l0.947-0.547c0.325-0.189,0.438-0.605,0.25-0.934
			c-0.188-0.326-0.605-0.438-0.935-0.249l-0.945,0.548v-1.094c0-0.377-0.307-0.684-0.682-0.684c-0.379,0-0.685,0.307-0.685,0.684
			v1.094l-0.947-0.548c-0.325-0.188-0.741-0.076-0.934,0.249c-0.188,0.326-0.076,0.744,0.25,0.934l0.947,0.547l-0.947,0.547
			c-0.326,0.188-0.438,0.604-0.25,0.933c0.191,0.325,0.607,0.438,0.934,0.25l0.947-0.548v1.094c0,0.378,0.306,0.684,0.685,0.684
			c0.375,0,0.682-0.306,0.682-0.684v-1.093l0.945,0.547c0.328,0.188,0.746,0.075,0.935-0.25
			C27.744,31.899,27.631,31.481,27.306,31.293z"/>
	</g>
	<path style="fill:#83A5B3;" d="M32.377,13.823c1.449-0.588,2.901-0.541,3.315-0.541c2.082,0,4.597,1.821,4.597,4.81
		c0,2.539-2.058,4.598-4.597,4.598h-0.215c-0.774,0-1.406,0.632-1.406,1.409c0,0.774,0.632,1.403,1.406,1.403h0.209
		c4.174,0,7.558-3.381,7.558-7.553c0,0,0.037-7.548-7.904-7.548c-1.717-7.069-8.332-7.428-10.188-6.929
		C23.142,1.472,19.791,0,16.404,0C9.688,0,4.186,5.193,3.688,11.783C1.484,13.052,0,15.429,0,18.153c0,4.061,3.289,7.35,7.35,7.35
		h1.025c0.637,0,1.236-0.688,1.236-1.406c0-0.776-0.633-1.406-1.406-1.406H7.984c-2.744,0-4.771-1.986-4.771-4.557
		c0-2.099,1.334-3.94,3.418-4.568c0.248-9.921,8.963-10.428,9.932-10.428c2.879,0,5.736,1.412,7.572,3.502
		C27.853,5.419,32.946,8.283,32.377,13.823z"/>
</g>
</svg>`, "colors" : "linear-gradient(to bottom, #FFFDF6 0%, #FFFDF6 20%, #FFF4C4 20%, #FFF4C4 40%, #FFF8D9 40%, #FFF8D9 60%, #FFFBEC 60%, #FFFBEC 80%, #E9E5D3 80%, #E9E5D3 100%)"},
    "sleet": {"svg": `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="43.223px" height="33.758px" viewBox="0 0 43.223 33.758" style="enable-background:new 0 0 43.223 33.758;"
	 xml:space="preserve">
<g id="_x32_6">
	<g>
		<path style="fill:#83A5B3;" d="M16.674,23.392c0.412-0.716,0.168-1.628-0.545-2.041c-0.715-0.411-1.629-0.166-2.039,0.548
			l-1.66,2.872c-0.412,0.714-0.168,1.627,0.547,2.04s1.627,0.168,2.041-0.548L16.674,23.392z"/>
		<path style="fill:#83A5B3;" d="M31.545,23.392c0.412-0.716,0.168-1.628-0.547-2.041c-0.715-0.411-1.627-0.166-2.039,0.548
			l-1.656,2.872c-0.416,0.714-0.17,1.627,0.543,2.04c0.715,0.413,1.629,0.168,2.041-0.548L31.545,23.392z"/>
		<path style="fill:#83A5B3;" d="M25.424,30.11c0.414-0.714,0.17-1.627-0.545-2.039s-1.629-0.168-2.041,0.547l-1.656,2.871
			c-0.414,0.715-0.168,1.629,0.545,2.04c0.715,0.413,1.629,0.167,2.039-0.546L25.424,30.11z"/>
		<path style="fill:#83A5B3;" d="M18.709,31.347l-0.945-0.548l0.945-0.545c0.326-0.188,0.438-0.606,0.252-0.934
			c-0.189-0.326-0.607-0.438-0.935-0.25l-0.946,0.547v-1.093c0-0.378-0.306-0.683-0.683-0.683s-0.684,0.305-0.684,0.683v1.093
			l-0.947-0.547c-0.322-0.189-0.742-0.076-0.93,0.25c-0.188,0.326-0.078,0.744,0.25,0.934l0.945,0.545l-0.945,0.548
			c-0.328,0.188-0.438,0.604-0.25,0.933c0.188,0.328,0.606,0.438,0.93,0.249l0.947-0.546v1.094c0,0.377,0.307,0.684,0.684,0.684
			s0.683-0.307,0.683-0.684v-1.095l0.946,0.547c0.326,0.188,0.744,0.078,0.935-0.249C19.148,31.952,19.035,31.536,18.709,31.347z"/>
		<path style="fill:#83A5B3;" d="M24.615,24.627l-0.947-0.547l0.947-0.547c0.323-0.188,0.438-0.604,0.25-0.933
			c-0.189-0.327-0.605-0.437-0.935-0.251l-0.947,0.548v-1.092c0-0.38-0.305-0.683-0.682-0.683s-0.682,0.303-0.682,0.683v1.092
			l-0.947-0.548c-0.326-0.188-0.742-0.075-0.93,0.251c-0.191,0.327-0.08,0.743,0.248,0.933l0.944,0.547l-0.944,0.547
			c-0.328,0.188-0.439,0.604-0.248,0.933c0.186,0.325,0.604,0.438,0.93,0.25l0.947-0.547v1.094c0,0.377,0.305,0.683,0.682,0.683
			s0.682-0.306,0.682-0.683v-1.094l0.947,0.547c0.328,0.188,0.744,0.075,0.935-0.25C25.053,25.233,24.939,24.816,24.615,24.627z"/>
	</g>
	<path style="fill:#83A5B3;" d="M32.377,13.823c1.451-0.588,2.901-0.541,3.317-0.541c2.08,0,4.597,1.82,4.597,4.808
		c0,2.541-2.062,4.6-4.597,4.6h-0.213c-0.776,0-1.407,0.631-1.407,1.407s0.631,1.405,1.407,1.405h0.207
		c4.172,0,7.554-3.381,7.554-7.555c0,0,0.039-7.546-7.9-7.546c-1.719-7.069-8.334-7.428-10.189-6.929C23.141,1.47,19.791,0,16.404,0
		C9.688,0,4.184,5.192,3.689,11.783C1.484,13.052,0,15.429,0,18.153c0,4.061,3.291,7.35,7.348,7.35h1.025
		c0.639,0,1.233-0.688,1.233-1.406c0-0.777-0.629-1.406-1.403-1.406h-0.22c-2.743,0-4.77-1.986-4.77-4.559
		c0-2.097,1.334-3.938,3.416-4.567c0.248-9.921,8.965-10.428,9.932-10.428c2.881,0,5.736,1.413,7.572,3.502
		C27.852,5.418,32.945,8.283,32.377,13.823z"/>
</g>
</svg>`, "colors": "linear-gradient(to bottom, #8C8B93 0%, #8C8B93 20%, #9A97AD 20%, #9A97AD 40%, #7C7B87 40%, #7C7B87 60%, #6B697A 60%, #6B697A 80%, #5D5A6F 80%, #5D5A6F 100%)"},
    "wind": {"svg": `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="43.244px" height="38.406px" viewBox="0 0 43.244 38.406" style="enable-background:new 0 0 43.244 38.406;"
	 xml:space="preserve">
<g id="_x33_0">
	<line style="fill:none;" x1="19.055" y1="30.991" x2="19.055" y2="30.991"/>
	<g>
		<path style="fill:#83A5B3;" d="M21.1,23.266c0.395-0.687,0.162-1.562-0.523-1.955c-0.686-0.395-1.561-0.16-1.955,0.522
			L13.409,30.6l-2.154,3.731c-0.543,0.942-1.076,1.205-1.92,1.205c-1.164,0-2.105-0.94-2.105-2.104c0-1.056,0.781-1.922,1.795-2.072
			l-0.002-0.01c0.744-0.096,1.203-0.949,1.02-1.707c-0.188-0.772-0.967-1.248-1.742-1.061v0.002
			c-2.242,0.479-3.924,2.469-3.924,4.855c0,2.742,2.223,4.965,4.965,4.965c1.479,0,2.791-0.586,3.701-1.644
			c1.051,1.599,3.178,2.125,4.861,1.159c1.52-0.874,2.172-2.675,1.656-4.279l0.002-0.002c-0.164-0.561-0.752-0.884-1.314-0.72
			c-0.549,0.16-0.926,0.765-0.715,1.274l-0.008,0.002c0.277,0.701,0.01,1.517-0.662,1.902c-0.738,0.424-1.686,0.17-2.111-0.572
			c-0.268-0.467-0.324-0.858-0.068-1.405C17.082,29.999,21.1,23.266,21.1,23.266z"/>
		<path style="fill:#83A5B3;" d="M23.263,28.218L23.263,28.218c-0.412,0.724-0.378,1.179-0.046,1.734
			c0.451,0.766,1.438,1.021,2.203,0.565c0.692-0.412,0.961-1.262,0.666-1.988l0.006-0.002c-0.227-0.528,0.156-1.162,0.729-1.336
			c0.582-0.178,1.197,0.15,1.375,0.732h-0.002c0.559,1.662-0.098,3.549-1.668,4.475c-1.808,1.069-4.137,0.472-5.201-1.336
			c-0.701-1.181-0.744-2.543-0.082-3.715c0.568-1.006,3.324-5.672,3.324-5.672c0.297-0.525,0.967-0.714,1.494-0.418
			c0.524,0.299,0.709,0.967,0.414,1.492L23.263,28.218z"/>
	</g>
	<path style="fill:#83A5B3;" d="M32.377,13.794c1.451-0.588,2.901-0.541,3.317-0.541c2.08,0,4.597,1.821,4.597,4.811
		c0,2.54-2.06,4.597-4.597,4.597h-5.188c-0.777,0-1.406,0.632-1.406,1.409c0,0.775,0.629,1.404,1.406,1.404h5.182
		c4.172,0,7.556-3.382,7.556-7.556c0,0,0.037-7.545-7.904-7.545c-1.717-7.07-8.33-7.428-10.188-6.93
		c-2.01-2.004-5.36-3.474-8.745-3.474c-6.717,0-12.221,5.192-12.717,11.783C1.486,13.022,0,15.399,0,18.124
		c0,4.06,3.291,7.351,7.35,7.351h5.248c0.639,0,1.236-0.688,1.236-1.408c0-0.775-0.631-1.405-1.408-1.405h-4.44
		c-2.746,0-4.77-1.987-4.77-4.557c0-2.099,1.33-3.94,3.414-4.568c0.25-9.921,8.965-10.428,9.934-10.428
		c2.879,0,5.736,1.413,7.574,3.503C27.854,5.39,32.946,8.254,32.377,13.794z"/>
</g>
</svg>`, "colors": "linear-gradient(to bottom, #584F77 0%, #584F77 20%, #9B95AD 20%, #9B95AD 40%, #756D8F 40%, #756D8F 60%, #41385F 60%, #41385F 80%, #2D224F 80%, #2D224F 100%)"},
    "fog": {"svg": `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="47.707px" height="24.756px" viewBox="0 0 47.707 24.756" style="enable-background:new 0 0 47.707 24.756;"
	 xml:space="preserve">
<g id="_x31_0">
	<path style="fill:#83A5B3;" d="M9.246,17.8c1.084,0,1.967-0.881,1.967-1.967s-0.883-1.967-1.967-1.967H1.969
		C0.881,13.866,0,14.747,0,15.833s0.881,1.967,1.969,1.966L9.246,17.8z"/>
	<path style="fill:#83A5B3;" d="M23.855,17.8c1.084,0,1.965-0.881,1.965-1.967c-0.002-1.086-0.881-1.967-1.965-1.967h-7.279
		c-1.088,0-1.969,0.881-1.969,1.967s0.881,1.967,1.969,1.966L23.855,17.8z"/>
	<path style="fill:#83A5B3;" d="M38.461,17.8c1.088,0,1.969-0.881,1.969-1.967s-0.881-1.967-1.969-1.967h-7.279
		c-1.086,0-1.965,0.881-1.965,1.967s0.879,1.967,1.965,1.966L38.461,17.8z"/>
	<path style="fill:#83A5B3;" d="M9.246,3.886c1.084,0,1.967-0.879,1.967-1.965S10.33-0.046,9.246-0.046H1.969
		C0.881-0.046,0,0.834,0,1.921c0,1.086,0.881,1.965,1.969,1.965H9.246z"/>
	<path style="fill:#83A5B3;" d="M23.855,3.886c1.084,0,1.965-0.879,1.965-1.965c-0.002-1.086-0.881-1.967-1.965-1.967h-7.279
		c-1.088,0-1.969,0.881-1.969,1.967s0.881,1.965,1.969,1.965H23.855z"/>
	<path style="fill:#83A5B3;" d="M38.461,3.886c1.088,0,1.969-0.879,1.969-1.965s-0.881-1.967-1.969-1.967h-7.279
		c-1.086,0-1.965,0.881-1.965,1.967s0.879,1.965,1.965,1.965H38.461z"/>
	<path style="fill:#83A5B3;" d="M16.525,24.756c1.084,0,1.965-0.88,1.965-1.967c0-1.085-0.881-1.966-1.965-1.966H9.246
		c-1.088,0-1.967,0.881-1.967,1.966c0,1.087,0.879,1.967,1.967,1.966L16.525,24.756z"/>
	<path style="fill:#83A5B3;" d="M31.133,24.756c1.086,0,1.967-0.88,1.967-1.967c-0.002-1.085-0.883-1.966-1.967-1.966h-7.277
		c-1.09,0-1.967,0.881-1.967,1.966c0,1.087,0.877,1.967,1.967,1.966L31.133,24.756z"/>
	<path style="fill:#83A5B3;" d="M45.74,24.756c1.086,0,1.967-0.88,1.967-1.967c0-1.085-0.881-1.966-1.967-1.966h-7.279
		c-1.086,0-1.965,0.881-1.965,1.966c0,1.087,0.879,1.967,1.965,1.966L45.74,24.756z"/>
	<path style="fill:#83A5B3;" d="M16.525,10.843c1.084,0,1.965-0.88,1.965-1.967c0-1.085-0.881-1.966-1.965-1.966H9.246
		c-1.088,0-1.967,0.881-1.967,1.966c0,1.087,0.879,1.967,1.967,1.966L16.525,10.843z"/>
	<path style="fill:#83A5B3;" d="M31.133,10.843c1.086,0,1.967-0.88,1.967-1.967c-0.002-1.085-0.883-1.966-1.967-1.966h-7.277
		c-1.09,0-1.967,0.881-1.967,1.966c0,1.087,0.877,1.967,1.967,1.966L31.133,10.843z"/>
	<path style="fill:#83A5B3;" d="M45.74,10.843c1.086,0,1.967-0.88,1.967-1.967c0-1.085-0.881-1.966-1.967-1.966h-7.279
		c-1.086,0-1.965,0.881-1.965,1.966c0,1.087,0.879,1.967,1.965,1.966L45.74,10.843z"/>
</g>
</svg>`, "colors": "linear-gradient(to bottom, #DAD7DE 0%, #DAD7DE 20%, #9D91B7 20%, #9D91B7 40%, #B7AFCA 40%, #B7AFCA 60%, #AAA6B2 60%, #AAA6B2 80%, #96919F 80%, #96919F 100%)"},
    "cloudy": {"svg": `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="52.045px" height="26.648px" viewBox="0 0 52.045 26.648" style="enable-background:new 0 0 52.045 26.648;"
	 xml:space="preserve">
<path id="_x30_6" style="fill:#83A5B3;" d="M46.119,7.799c-1.287-5.301-6.246-5.569-7.638-5.195C36.976,1.102,34.463,0,31.924,0
	c-3.155,0-5.957,1.531-7.699,3.892c-2.029-1.593-4.926-2.693-7.854-2.693c-6.703,0-12.195,5.182-12.689,11.76
	C1.482,14.223,0,16.595,0,19.315c0,4.052,3.283,7.334,7.334,7.334h28.281c4.161,0,7.534-3.371,7.541-7.53h3.225
	c3.127,0,5.664-2.535,5.664-5.663C52.045,13.456,52.071,7.799,46.119,7.799z M35.621,23.841H7.969c-2.738,0-4.76-1.982-4.76-4.547
	c0-2.094,1.33-3.933,3.41-4.56c0.246-9.9,8.943-10.406,9.91-10.406c2.873,0,5.725,1.408,7.559,3.495
	c3.709-1.219,8.791,1.643,8.224,7.17c1.446-0.586,2.896-0.541,3.311-0.541c2.076,0,4.588,1.818,4.588,4.801
	C40.209,21.788,38.153,23.841,35.621,23.841z M46.385,17.009h-3.553c-0.615-2.228-2.396-5.429-7.563-5.429
	c-1.361-5.611-5.816-6.986-8.515-7.063c2.031-2.011,4.83-2.165,5.289-2.165c2.158,0,4.299,1.059,5.679,2.625
	c2.784-0.915,6.604,1.232,6.176,5.386c1.088-0.439,2.178-0.405,2.487-0.405c1.56,0,3.445,1.366,3.445,3.605
	C49.83,15.467,48.287,17.009,46.385,17.009z"/>
</svg>`, "colors": "linear-gradient(to bottom, #818589 0%, #818589 20%, #8C97A1 20%, #8C97A1 40%, #72787E 40%, #72787E 60%, #616971 60%, #616971 80%, #525E68 80%, #525E68 100%)"},
    "partly-cloudy-day": {"svg": `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="54.682px" height="33.525px" viewBox="0 0 54.682 33.525" style="enable-background:new 0 0 54.682 33.525;"
	 xml:space="preserve">
<g id="_x30_3">
	<path style="fill:#83A5B3;" d="M37.252,6.341c0.832,0,1.502-0.673,1.502-1.502V1.502c0-0.83-0.67-1.502-1.502-1.502
		c-0.828,0-1.502,0.673-1.502,1.502v3.336C35.75,5.668,36.424,6.341,37.252,6.341z"/>
	<path style="fill:#83A5B3;" d="M27.273,9.583c0.586,0.586,1.537,0.586,2.125,0c0.586-0.587,0.586-1.538,0-2.124L27.039,5.1
		c-0.586-0.587-1.539-0.587-2.125,0s-0.586,1.538,0,2.124L27.273,9.583z"/>
	<path style="fill:#83A5B3;" d="M47.203,25.305c-0.586-0.587-1.537-0.587-2.123,0c-0.586,0.586-0.586,1.536,0,2.123l2.358,2.358
		c0.586,0.588,1.537,0.588,2.123,0c0.586-0.586,0.586-1.537,0-2.123L47.203,25.305z"/>
	<path style="fill:#83A5B3;" d="M53.18,15.955h-3.336c-0.83,0-1.504,0.674-1.504,1.502c0,0.83,0.674,1.502,1.504,1.502h3.336
		c0.828,0,1.502-0.672,1.502-1.502C54.682,16.628,54.008,15.955,53.18,15.955z"/>
	<path style="fill:#83A5B3;" d="M47.223,9.603l2.359-2.359c0.588-0.587,0.588-1.539,0-2.125c-0.586-0.587-1.537-0.587-2.125,0
		L45.1,7.478c-0.586,0.586-0.586,1.538,0,2.125C45.686,10.189,46.637,10.189,47.223,9.603z"/>
	<path style="fill:#83A5B3;" d="M46.59,17.476c0-5.156-4.182-9.336-9.338-9.336c-3.027,0-5.715,1.443-7.422,3.678
		c-1.908-0.678-3.74-0.629-4.586-0.4c-2.021-2.011-5.382-3.486-8.779-3.486c-6.74,0-12.266,5.211-12.762,11.824
		C1.492,21.029,0,23.416,0,26.15c0,4.074,3.303,7.375,7.377,7.375h28.438c4.188,0,7.582-3.396,7.582-7.582
		c0,0,0.002-0.535-0.145-1.32C45.293,22.91,46.59,20.345,46.59,17.476z M35.824,30.701H8.016c-2.756,0-4.789-1.992-4.789-4.572
		c0-2.104,1.34-3.953,3.431-4.586c0.247-9.956,8.995-10.463,9.967-10.463c2.889,0,5.758,1.416,7.6,3.514
		c3.73-1.225,8.842,1.65,8.271,7.212c1.455-0.591,2.912-0.546,3.33-0.546c2.086,0,4.61,1.828,4.61,4.828
		C40.436,28.637,38.369,30.701,35.824,30.701z M35.467,18.371c-0.574-2.367-1.697-3.983-3.006-5.07
		c1.166-1.336,2.879-2.182,4.791-2.182c3.512,0,6.354,2.848,6.354,6.357c0,1.567-0.569,3.006-1.514,4.115
		C39.859,18.056,35.467,18.371,35.467,18.371z"/>
</g>
</svg>`, "colors": "linear-gradient(to bottom, #AD9F6B 0%, #AD9F6B 20%, #726329 20%, #726329 40%, #8A7C4A 40%, #8A7C4A 60%, #D0C498 60%, #D0C498 80%, #FBF3D4 80%, #FBF3D4 100%)"},
    "partly-cloudy-night": {"svg": `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="51.256px" height="33.85px" viewBox="0 0 51.256 33.85" style="enable-background:new 0 0 51.256 33.85;"
	 xml:space="preserve">
<path id="_x30_7" style="fill:#83A5B3;" d="M35.942,33.849c4.201,0,7.607-3.406,7.607-7.607c0,0,0.004-0.979-0.357-2.234
	c2.798-0.528,5.291-2.021,7.113-4.125c2.369-2.72-0.332-2.661-1.25-2.806C43.63,16.41,36.3,10.757,38.995,1.811
	c0.584-1.921-0.529-1.941-1.34-1.708c0,0-8.463,1.877-8.992,11.607c-1.422-0.294-2.676-0.225-3.332-0.048
	c-2.027-2.017-5.4-3.498-8.811-3.498c-6.766,0-12.309,5.23-12.807,11.867C1.494,21.308,0,23.703,0,26.447
	c0,4.09,3.312,7.402,7.4,7.402H35.942z M8.041,31.015c-2.766,0-4.805-2-4.805-4.589c0-2.114,1.344-3.969,3.441-4.602
	c0.25-9.993,9.027-10.503,10.002-10.503c2.9,0,5.777,1.422,7.629,3.527c3.742-1.229,8.871,1.656,8.298,7.235
	c1.461-0.592,2.922-0.545,3.34-0.545c2.099,0,4.63,1.834,4.63,4.846c0,2.558-2.072,4.63-4.63,4.63H8.041z M41.828,21.289
	c-1.146-1.447-3.06-2.647-6.236-2.647c-0.723-2.975-2.305-4.769-4.038-5.813c-0.437-5.017,2.688-7.91,4.241-8.861
	c-1.244,6.447,3.924,14.429,11.147,15.188C45.556,20.211,43.713,21.05,41.828,21.289z"/>
</svg>`, "colors": "linear-gradient(to bottom, #555078 0%, #555078 20%, #9A97AE 20%, #9A97AE 40%, #736F90 40%, #736F90 60%, #3E3960 60%, #3E3960 80%, #29234F 80%, #29234F 100%)"}

  }

 /* -------Toggle in JS--------
  var tempsSlider = document.getElementById("temps-slider");
  document.getElementById("temps-slider-holder").addEventListener("click", function() {
  //Should we check if tempSlider DOM Element in the the variable before using?
tempsSlider.classList.toggle("temps-fahr"); //classList will not work in IE9. Need a workaround using className property
});
  ----End Toggle button in JS */ 

function timeoutPromise(delay) {
	return new Promise(function (resolve, reject) {
		setTimeout(function() {
			reject("timeout")
		}, delay);
	});
}





