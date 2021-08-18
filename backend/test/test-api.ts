var assert = require("assert");
import * as greenSquareHealth from './mocks/green-square-health.json'
import * as greenSquareHealthTimeSlots from './mocks/green-square-health-time-slots.json'

import * as montroseMedicalPractice from './mocks/montrose-medical-practice.json'
import * as montroseMedicalPracticeTimeSlots from './mocks/montrose-medical-practice-time-slots.json'

import * as crownStMedicalCentre from './mocks/crown-st-medical-centre.json'
import * as crownStMedicalCentreTimeSlots from './mocks/crown-st-medical-centre-time-slots.json'

import * as mirandaSkinCancerClinic from './mocks/miranda-skin-cancer-clinic.json';
import * as mirandaSkinCancerClinicTimeSlots from './mocks/miranda-skin-cancer-clinic-time-slots.json';


import * as clincsNearCentral from './mocks/clinics-near-central.json'
import {getNearbyClinics, getSoonestClinicAppointments, isFirstDoseAZReason, isFirstDosePfizerReason} from '../src/api'
process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
  // @ts-ignore
  console.log(reason.stack);
  // application specific logging, throwing an error, or other logic here
});

describe('#isFirstDosePfizerReason()', function() {
  it('returns false for standard consultation', () => {
    const reasonName = 'Standard Consult -  Children & Concession Card, 10am to 3.45pm - Mon-Fri';
    const result = isFirstDosePfizerReason(reasonName);
    assert(result === false);
  });
  it('returns false for Astra Zeneca dose 1', () => {
    const reasonName = 'Astra Zeneca COVID-19 Vaccine Dose 1  - Bulk Billed';
    const result = isFirstDosePfizerReason(reasonName);
    assert(result === false);
  });
  it('returns false for AstraZeneca dose 1', () => {
    const reasonName = 'AstraZeneca COVID-19 Vaccine Dose 1  - Bulk Billed';
    const result = isFirstDosePfizerReason(reasonName);
    assert(result === false);
  });
  it('returns false for AstraZeneca dose 2', () => {
    const reasonName = 'AstraZeneca COVID-19 Vaccine Dose 2  - Bulk Billed';
    const result = isFirstDosePfizerReason(reasonName);
    assert(result === false);
  });
  it('returns false for COVID dose 1', () => {
    const reasonName = 'COVID-19 Vaccine Dose 1  - Bulk Billed';
    const result = isFirstDosePfizerReason(reasonName);
    assert(result === false);
  });
  it('returns true for Pfizer COVID dose 1', () => {
    const reasonName = 'Pfizer COVID-19 Vaccine Dose 1  - Bulk Billed';
    const result = isFirstDosePfizerReason(reasonName);
    assert(result === true);
  });
  it('returns false for Flu vaccine', () => {
    const reasonName = 'Flu Vaccine - Bulk Billed Appointment';
    const result = isFirstDosePfizerReason(reasonName);
    assert(result === false);
  });
  it('returns false for Flu symptoms consult', () => {
    const reasonName = 'PHONE Consult - Cold & Flu Symptoms (Bulk-Billed During Covid 19 Lockdown)';
    const result = isFirstDosePfizerReason(reasonName);
    assert(result === false);
  });

});

describe("#isFirstDoseAZReason()", function() {
    it('returns false for standard consultation', () => {
      const reasonName = 'Standard Consult -  Children & Concession Card, 10am to 3.45pm - Mon-Fri';
      const result = isFirstDoseAZReason(reasonName);
      assert(result === false);
    });
    it('returns true for Astra Zeneca dose 1', () => {
      const reasonName = 'Astra Zeneca COVID-19 Vaccine Dose 1  - Bulk Billed';
      const result = isFirstDoseAZReason(reasonName);
      assert(result === true);
    });
    it('returns true for AstraZeneca dose 1', () => {
      const reasonName = 'AstraZeneca COVID-19 Vaccine Dose 1  - Bulk Billed';
      const result = isFirstDoseAZReason(reasonName);
      assert(result === true);
    });
    it('returns false for AstraZeneca dose 2', () => {
      const reasonName = 'AstraZeneca COVID-19 Vaccine Dose 2  - Bulk Billed';
      const result = isFirstDoseAZReason(reasonName);
      assert(result === false);
    });
    it('returns true for COVID dose 1', () => {
      const reasonName = 'COVID-19 Vaccine Dose 1  - Bulk Billed';
      const result = isFirstDoseAZReason(reasonName);
      assert(result === true);
    });
    it('returns false for Pfizer COVID dose 1', () => {
      const reasonName = 'Pfizer COVID-19 Vaccine Dose 1  - Bulk Billed';
      const result = isFirstDoseAZReason(reasonName);
      assert(result === false);
    });
    it('returns false for Flu vaccine', () => {
      const reasonName = 'Flu Vaccine - Bulk Billed Appointment';
      const result = isFirstDoseAZReason(reasonName);
      assert(result === false);
    });
    it('returns false for Flu symptoms consult', () => {
      const reasonName = 'PHONE Consult - Cold & Flu Symptoms (Bulk-Billed During Covid 19 Lockdown)';
      const result = isFirstDoseAZReason(reasonName);
      assert(result === false);
    });
});

describe("#getSoonestClinicAppointments()", async function () {
  describe("pfizer", async function () {
    it("Green Square Health (1425): returns earliest time", async () => {
      const soonestTimestamp = await getSoonestClinicAppointments('pfizer', 'green-square-health', greenSquareHealth, greenSquareHealthTimeSlots);
      assert(soonestTimestamp === '2021-08-14T15:00:00+10:00');
    });

    it("mirandaSkinCancerClinic: returns Wed 10th nov 3:20pm", async() => {
      const soonestTimestamp = await getSoonestClinicAppointments('pfizer', 'miranda-skin-cancer-clinic', mirandaSkinCancerClinic, mirandaSkinCancerClinicTimeSlots);
      assert(soonestTimestamp === '2021-11-10T15:20:00+11:00');
    });
  });
  describe("astrazeneca", async function () {
    it("Green Square Health (1425): returns earliest time", async () => {
      const soonestTimestamp = await getSoonestClinicAppointments('astrazeneca', 'green-square-health', greenSquareHealth, greenSquareHealthTimeSlots);
      assert(soonestTimestamp === '2021-08-23T15:15:00+10:00');
    });

    it("Montrose Medical Practice: returns earliest time", async () => {
      const soonestTimestamp = await getSoonestClinicAppointments('astrazeneca', 'montrose-medical-practice', montroseMedicalPractice, montroseMedicalPracticeTimeSlots);
      assert(soonestTimestamp === '2021-08-19T11:40:00+10:00');
    });

    // TODO: Fix getSoonestClinicAppointments
    it("Crowd St Medical Centre: returns earliest time", async () => {
      // TODO: Fix this type error
      // @ts-ignore
      const soonestTimestamp = await getSoonestClinicAppointments('astrazeneca', 'crown-st-medical-centre', crownStMedicalCentre, crownStMedicalCentreTimeSlots);
      // 24 Aug, 1:45 according to the website a few mins after data capture
      assert(soonestTimestamp === '2021-08-24T13:45:00+10:00');
    });
  });
});

describe("#getNearbyClinics()", async function () {
  it("finds clinics near central", async () => {
    const nearbyClinics = await getNearbyClinics('astrazeneca',-33.8834805, 151.2058995, undefined, clincsNearCentral);

    const expected = {
      name: 'World Square Medical Centre',
      id_string: 'world-square-medical-centre',
      street_address: 'Shop 9.09c, 644 George St, Sydney',
      suburb_name: '',
      url: 'https://www.hotdoc.com.au/medical-centres/sydney-NSW-2000/world-square-medical-centre/doctors?purpose=covid-vaccine&wp=gpvaccinesearch',
    }
    assert(JSON.stringify(nearbyClinics[0]) === JSON.stringify(expected));
  });
});