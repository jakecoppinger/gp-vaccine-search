/*
Hello!
Forgive the horrible code, this is the product of two afternoons of work.
I promise I write better usually. It's open source on Github.

Please don't try and abuse the backend server - I just want to help people get vaccinated :)
*/


import { whereAmI, apiHostname } from './constants';
import { blurSearch, debouncedSearch, focusSearch, oninputSearch } from './search';
import { postcodeSearchSelector } from './selectors';
import { OurWindow, Clinic } from './interfaces';
import {setElementTextIfExists} from './utils';
import {fetchNearbyClinics} from './api';

// Set to true to use hardcoded coordinates (Central station)
const debugPosition = {
  latitude: -33.8893375,
  longitude: 151.197442
};

export async function setElementValueIfExists(selector: string, text: string) {
  const element: HTMLInputElement | null = document.querySelector(selector);
  if (element) {
    element.value = text;
  }
}

export interface BackendClinicShape {
  name: string,
  street_address: string,
  url: string,
  id_string: string
}

(window as OurWindow).state = [];

document.addEventListener("DOMContentLoaded", async (event) => {
  const searchInput = document.querySelector(postcodeSearchSelector);
  if (searchInput === null) {
    throw new Error("One of the frontend controls is null :(");
  }
  searchInput.addEventListener("focus", focusSearch);
  searchInput.addEventListener("blur", blurSearch);
  searchInput.addEventListener("keyup", debouncedSearch);

  // Show clinics near central station for local debug,
  // when can't do geolocation because localhost isn't HTTPS
  // @ts-ignore
  if (whereAmI === 'local') {
    let lat = debugPosition.latitude;
    let long = debugPosition.longitude;

    setElementTextIfExists('#location-status', '')

    await fetchNearbyClinics(lat, long);
  }
});




let button = document.getElementById("get-location");
if (button) {
  button.addEventListener("click", function () {
    console.log("getting location!");

    setElementTextIfExists('#location-status', 'Checking location...')
    navigator.geolocation.getCurrentPosition(async function (position) {
      let lat = position.coords.latitude;
      let long = position.coords.longitude;
      console.log({ lat, long });

      setElementTextIfExists('#location-status', '')
      setElementValueIfExists('#latitude', lat.toString())
      setElementValueIfExists('#longitude', long.toString())

      await fetchNearbyClinics(lat, long);
    });
  });
}


