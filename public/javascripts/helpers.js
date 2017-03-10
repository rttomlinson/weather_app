"use strict";

/** Helper functions used with main.js **/



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
 * Sends a request BACK TO ORIGIN to get the Dark Sky API
 * @params none
 * @return undefined
 */
function queryDarkSkyAPI(lat, lon) {
	return new Promise(function (resolve, reject) {
		  let httpRequest = new XMLHttpRequest();
	    httpRequest.open("GET", `/weather?lat=${lat}&lon=${lon}`, true);
		  httpRequest.onload = function() {
	      if (httpRequest.status === 200){
	        let dataRequested =  JSON.parse(httpRequest.responseText); //Holds response from Dark Sky API. Right now scoped. Should this be global?
	        resolve(dataRequested);
	      }
	      else {
	        reject(`Status code: ${httpRequest.status}`);
	      }
	    };
	    httpRequest.onerror = function() {
	      reject("An error occurred while fetching this resource");
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
function attachButtonListeners() {
  document.getElementById("weather-display-buttons").addEventListener("click", function(event) {
  	if (event.target.tagName === 'BUTTON') {
  		let buttons = Array.from(event.currentTarget.querySelectorAll('button')); //For each button, remove the active-button class
  		buttons.forEach(function (element, index, arr) {
  			element.classList.remove('active-button');
  		});
  		
  		let weatherHolders = Array.from(document.getElementsByClassName("weather-holder"));//clear display class from weather-holders
  		weatherHolders.forEach(function (element, index, arr) {
  			element.classList.remove('active');
  		});
  		
  		let clickedButton = event.target;
  		clickedButton.classList.add('active-button');//Then add the active-button class to the target element
  		let sectionID = clickedButton.dataset.target;//then get the data-target attribute from the element, which is the id of the weather holder
  		let weatherHolder = document.getElementById(sectionID);
  		weatherHolder.classList.add('active'); //add display to the selected weather holder
  	}
	//Remove all active-button from all display-button to clean. Then add active to button to the button that was clicked
	//Relies on display and buttons divs staying in the same order. Very brittle. Need to change.   
  }, false); 

}
    /** Toggle between Fahrenheit and Celsius
     *
     *
     **/
function addTempSwitchListener() {
	  document.querySelector(".slider").addEventListener("click", switchMeasure);
}
  
function switchMeasure() {
	console.log("handler called");
	if (isFahrenheit) {//global state
	  document.querySelectorAll(".fahrenheit").forEach(function(element) {
	    element.classList.remove("active-block");
	  });
	  document.querySelectorAll(".celsius").forEach(function(element) {
	    element.classList.add("active-block");
	  });
	}
	else {
	   document.querySelectorAll(".celsius").forEach(function(element) {
	    element.classList.remove("active-block");
	  });
	  document.querySelectorAll(".fahrenheit").forEach(function(element) {
	    element.classList.add("active-block");
	  });
	}
	isFahrenheit = !isFahrenheit;
}

function timeoutPromise(delay) {
	return new Promise(function (resolve, reject) {
		setTimeout(function() {
			reject("timeout")
		}, delay);
	});
}


