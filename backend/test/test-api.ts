var assert = require("assert");
import * as greenSquareHealth from './mocks/green-square-health.json'
import * as greenSquareHealthTimeSlots from './mocks/green-square-health-time-slots.json'

import * as montroseMedicalPractice from './mocks/montrose-medical-practice.json'
import * as montroseMedicalPracticeTimeSlots from './mocks/montrose-medical-practice-time-slots.json'

import * as crownStMedicalCentre from './mocks/crown-st-medical-centre.json'
import * as crownStMedicalCentreTimeSlots from './mocks/crown-st-medical-centre-time-slots.json'

import * as mirandaSkinCancerClinic from './mocks/miranda-skin-cancer-clinic.json';
import * as mirandaSkinCancerClinicTimeSlots from './mocks/miranda-skin-cancer-clinic-time-slots.json';

import * as concordFamilyDoctors from './mocks/concord-family-doctors.json';
import * as concordFamilyDoctorsTimeSlots from './mocks/concord-family-doctors-time-slots.json';

import * as clincsNearCentral from './mocks/clinics-near-central.json'
import { getNearbyClinics, getSoonestClinicAppointments, isFirstDoseAZReason, isFirstDosePfizerReason, getSoonestDoctorAvailabilities, isBoosterReason } from '../src/api'
import { Doctor, TimeSlotDay, TimeSlotDoctor } from '../src/interfaces';
import { concordFamilyDoctorsDoctors } from './mocks/objects';
process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
  // @ts-ignore
  console.log(reason.stack);
  // application specific logging, throwing an error, or other logic here
});

describe('#isFirstDosePfizerReason()', function () {
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

describe("#isFirstDoseAZReason()", function () {
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


describe('#isFirstDoseBoosterReason()', function () {
  it('returns true for booster consult', () => {
    const reasonName = 'PFIZER: COVID-19 Vaccine booster/Dose 3';
    const result = isBoosterReason(reasonName);
    assert(result === true);
  });
  it('returns true for booster consult in capitals', () => {
    const reasonName = 'PFIZER: COVID-19 Vaccine BOOSTER/Dose 3';
    const result = isBoosterReason(reasonName);
    assert(result === true);
  });
  it('returns false for standard vaccine consult', () => {
    const reasonName = 'COVID-19 Vaccine Dose 2 - Moderna';
    const result = isBoosterReason(reasonName);
    assert(result === false);
  });
});

describe("#getSoonestDoctorAvailabilities()", async function () {
  it("finds soonest timeslot for example doctor", async () => {
    const timeslotDoctors: TimeSlotDoctor[] = [{
      "id": 1,
      "detail": false,
      "next_available": "2021-01-01T01:00:00+10:00",
      "prev_available": null
    },
    {
      "id": 2,
      "detail": false,
      "next_available": "2021-02-01T01:00:00+10:00",
      "prev_available": null
    }]

    const doctors: Doctor[] = [
      {
        "id": 1,
        "slug": "dr-colin-chu",
        "full_name": "Dr Colin Chu",
        "gender": "male",
        "pre_triage_availability_type_id": "24157-900",
        "profile_image_url": "https://d3sjaxzllw9rho.cloudfront.net/doctor_images/24157/profile_631eec61a74c99d1faa0d76440c104af.jpg",
        "accepts_new_patients": true,
        "does_not_accept_new_patients_call_to_discuss": true,
        "does_not_accept_new_patients_message_html": "Dr Colin Chu does not take on new patients <strong>online</strong>. Please call the practice to book an appointment.",
        "statement": "Graduated 1993 with Honours from Sydney University. Completed a Diploma of Child Health with The Children's Hospital in 1995 and a Certificate in Family Planning in 1996. He then attained his Fellowship of the Royal Australian College of General Practitioners in 1997. All aspects of general practice including paediatrics, men's health and skin checks. ",
        "statement_html": "<p>Graduated 1993 with Honours from Sydney University. Completed a Diploma of Child Health with The Children's Hospital in 1995 and a Certificate in Family Planning in 1996. He then attained his Fellowship of the Royal Australian College of General Practitioners in 1997. All aspects of general practice including paediatrics, men's health and skin checks. </p>\n",
        "position": 4,
        "earliest_available": "2021-08-19T01:15:00+00:00",
        "call_to_book": false,
        "visible_on_hot_doc": true,
        "has_bookings_support": true,
        "languages": [],
        "qualifications": [],
        "detail": true,
        "segment": {},
        "clinic_id": 1629,
        "doctor_reason_ids": [
          82947,
          82943,
          82942,
          106675,
          310231,
          445359,
          82944,
          82946
        ],
        "doctor_interest_ids": []
      },
      {
        "id": 2,
        "slug": "dr-colin-chu",
        "full_name": "Dr Old mate",
        "gender": "male",
        "pre_triage_availability_type_id": "24157-900",
        "profile_image_url": "https://d3sjaxzllw9rho.cloudfront.net/doctor_images/24157/profile_631eec61a74c99d1faa0d76440c104af.jpg",
        "accepts_new_patients": true,
        "does_not_accept_new_patients_call_to_discuss": true,
        "does_not_accept_new_patients_message_html": "Dr Colin Chu does not take on new patients <strong>online</strong>. Please call the practice to book an appointment.",
        "statement": "Graduated 1993 with Honours from Sydney University. Completed a Diploma of Child Health with The Children's Hospital in 1995 and a Certificate in Family Planning in 1996. He then attained his Fellowship of the Royal Australian College of General Practitioners in 1997. All aspects of general practice including paediatrics, men's health and skin checks. ",
        "statement_html": "<p>Graduated 1993 with Honours from Sydney University. Completed a Diploma of Child Health with The Children's Hospital in 1995 and a Certificate in Family Planning in 1996. He then attained his Fellowship of the Royal Australian College of General Practitioners in 1997. All aspects of general practice including paediatrics, men's health and skin checks. </p>\n",
        "position": 4,
        "earliest_available": "2021-08-19T01:15:00+00:00",
        "call_to_book": false,
        "visible_on_hot_doc": true,
        "has_bookings_support": true,
        "languages": [],
        "qualifications": [],
        "detail": true,
        "segment": {},
        "clinic_id": 1629,
        "doctor_reason_ids": [
          82947,
          82943,
          82942,
          106675,
          310231,
          445359,
          82944,
          82946
        ],
        "doctor_interest_ids": []
      }
    ]
    const soonestTimestamp = await getSoonestDoctorAvailabilities(
      timeslotDoctors, doctors
    );
    const jsonOutput = JSON.stringify(soonestTimestamp)
    assert(jsonOutput === '["2021-01-01T01:00:00+10:00","2021-02-01T01:00:00+10:00"]'
    );
  });
});