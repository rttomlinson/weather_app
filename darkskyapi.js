"use strict";
let https = require('https');
/**
 * Sends a request to the Dark Sky API using the globally defined xmlhttprequest object
 * @params none
 * @return undefined
 */
function queryDarkSkyAPI(weatherKey, lat, lon) {
  return new Promise(function (resolve, reject) {
    https.get(`https://api.darksky.net/forecast/${weatherKey}/${lat},${lon}`, (res) => {
      if (res.statusCode === 200) {//Successful request
        let data = [];
        res.on('data', (d) => {
          data.push(d);
        });
        res.on('end', () => {
          data = Buffer.concat(data).toString(); //Turn to a string, which we assume in JSON
          data = JSON.parse(data); //Turn JSON to an object
          resolve(data); //Resolve the promise with this object
        });
      } else {
        reject(`Error: Status code is ${res.statusCode}`);
      }
    
    }).on('error', (e) => {
      reject(e);
    });
  });
}

module.exports = queryDarkSkyAPI;