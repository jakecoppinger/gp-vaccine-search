/*
Hello!
Forgive the horrible code, this is the product of a few afternoons of work.
I promise I write better usually. It's open source on Github.

Please don't try and abuse the backend server - I just want to help people get vaccinated :)
*/


import { whereAmI } from './constants';
import { blurSearch, debouncedSearch, focusSearch } from './search';
import { postcodeSearchSelector, vaccineRadioSelector } from './selectors';
import { OurWindow } from './interfaces';
import {getVaccineFromRadioButtons, setElementTextIfExists, stopLoadingTimes} from './utils';
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
  suburb_name: string,
  url: string,
  id_string: string
}

(window as OurWindow).clinics = [];

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
    (window as OurWindow).coordinates = debugPosition;
    const {latitude, longitude} = debugPosition;

    setElementTextIfExists('#location-status', '')

    const vaccine = getVaccineFromRadioButtons();
    console.log(`Fetching nearby clinics for ${vaccine}`);
    await fetchNearbyClinics(vaccine, latitude, longitude);
  }
});

let button = document.getElementById("get-location");
if (button) {
  button.addEventListener("click", function () {
    console.log("getting location!");

    setElementTextIfExists('#location-status', 'Checking location...')
    navigator.geolocation.getCurrentPosition(async function (position) {
      let {latitude, longitude} = position.coords;
      let long = position.coords.longitude;
      (window as OurWindow).coordinates = { latitude, longitude };

      setElementTextIfExists('#location-status', '')

      const vaccine = getVaccineFromRadioButtons();
      console.log(`Fetching nearby clinics for ${vaccine}`);
      await fetchNearbyClinics(vaccine, latitude, longitude);
    });
  });
}

const radios = document.querySelectorAll(vaccineRadioSelector);
radios.forEach(radio => {
  radio.addEventListener('click', async function () {
    console.log("Radio click")
    const value = (radio as HTMLInputElement).value;
    if(value !== 'pfizer' && value !== 'astrazeneca') {
      console.error(`radio button val is unknown: ${value})`);
      return;
    }
    console.log(`Value is now: ${value}`);

    const {coordinates, suburb_code} = (window as OurWindow);
    if (coordinates !== undefined) {
      const {latitude, longitude} = coordinates;
      console.log("fetching coordinates clinics");
      await fetchNearbyClinics(value, latitude, longitude);
    } else if(suburb_code !== undefined) {
      console.log("fetching suburb clinics");
      await fetchNearbyClinics(value, undefined, undefined,suburb_code);
    } else {
      console.log("Do nothing, we don't have coordinates or suburb yet!");
    }
  });
})


