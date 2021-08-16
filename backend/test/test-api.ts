var assert = require("assert");
import * as greenSquareHealth from './mocks/green-square-health.json'
import * as greenSquareHealthTimeSlots from './mocks/green-square-health-time-slots.json'

import * as montroseMedicalPractice from './mocks/montrose-medical-practice.json'
import * as montroseMedicalPracticeTimeSlots from './mocks/montrose-medical-practice-time-slots.json'

import * as clincsNearCentral from './mocks/clinics-near-central.json'
import {getNearbyClinics, getSoonestClinicAppointments} from '../src/api'
process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
  // @ts-ignore
  console.log(reason.stack);
  // application specific logging, throwing an error, or other logic here
});

describe("#getSoonestClinicAppointments()", async function () {
  it("Green Square Health (1425): returns earliest time", async () => {
    const soonestTimestamp = await getSoonestClinicAppointments('green-square-health', greenSquareHealth, greenSquareHealthTimeSlots);
    assert(soonestTimestamp === '2021-08-14T15:00:00+10:00');
  });

  it("Montrose Medical Practice: returns earliest time", async () => {
    const soonestTimestamp = await getSoonestClinicAppointments('montrose-medical-practice', montroseMedicalPractice, montroseMedicalPracticeTimeSlots);
    assert(soonestTimestamp === '2021-08-19T11:40:00+10:00');
  });
});

describe("#getNearbyClinics()", async function () {
  it("finds clinics near central", async () => {
    const nearbyClinics = await getNearbyClinics(-33.8834805, 151.2058995, undefined, clincsNearCentral);

    const expected = {
      name: 'World Square Medical Centre',
      id_string: 'world-square-medical-centre',
      street_address: 'Shop 9.09c, 644 George St, Sydney',
      suburb_name: '',
      url: 'https://www.hotdoc.com.au/medical-centres/sydney-NSW-2000/world-square-medical-centre/doctors?purpose=covid-vaccine?wp=gpvaccinesearch',
    }
    assert(JSON.stringify(nearbyClinics[0]) === JSON.stringify(expected));
  });
});