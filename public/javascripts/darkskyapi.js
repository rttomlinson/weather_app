"use strict";

/**
 * Sends a request to the Dark Sky API using the globally defined xmlhttprequest object
 * @params none
 * @return undefined
 */
function queryDarkSkyAPI(weatherKey, lat, lon) {
	let httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", "https://crossorigin.me/https://api.darksky.net/forecast/" + weatherKey + "/" + lat + "," + lon, true);
	httpRequest.onload = function() {
      if (httpRequest.status === 200){
        var weatherObj = JSON.parse(httpRequest.responseText); //Holds response from Dark Sky API. Right now scoped. Should this be global?
        console.log(weatherObj);
        return weatherObj;//Just to see the JSON structure
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
        console.log("An error occured while sending a request to Dark Sky's servers. Status code returned was " + httpRequest.status);
      }
      httpRequest.send(null);
    };
}

module.exports = queryDarkSkyAPI;