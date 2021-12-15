import { Clinic, ClinicSearch, ClinicSearchRootObject, Doctor, DoctorReason, FrontendClinicData, Reason, RootObject, SuburbSearch, TimeSlotDoctor, TimeSlotRootObject } from './interfaces';
import fetch from 'node-fetch';
import * as querystring from "querystring";

export async function getClinicInfo(slug: string): Promise<RootObject> {
  const params = {
    slug
  }
  const qs = querystring.stringify(params);
  const url = `https://www.hotdoc.com.au/api/patient/clinics?${qs}`
  const result = await fetch(url, {
    "headers": {
      "accept": "application/au.com.hotdoc.v5",
    },
    "method": "GET",
  });
  const jsonText = await result.text();
  const jsonObj = JSON.parse(jsonText);
  // console.log(JSON.stringify(jsonObj,null,2));
  return jsonObj;
}

/**
 * Returns true if the appointment reason is for any type of vaccine
 */
export function isVaccineReason(reasonName: string): boolean {
  const name = reasonName.toLowerCase();
  const nameWithout19 = name.replace('19', '');
  if (!(nameWithout19.includes('1') || nameWithout19.includes('first'))) {
    // Looking for first dose!
    return false;
  }
  if (nameWithout19.includes('pfizer')) {
    return true;
  }
  if (nameWithout19.includes('flu')) {
    return false;
  }

  if (nameWithout19.includes('covid') || nameWithout19.includes('astra') || nameWithout19.includes('vaccine')) {
    return true;
  }
  return false;
}
/**
 * Returns true if the appointment reason is to get 1st dose of AZ
 */
export function isFirstDoseAZReason(reasonName: string): boolean {
  const name = reasonName.toLowerCase();
  const nameWithout19 = name.replace('19', '');

  if (name.includes('pfizer')) {
    return false;
  }

  if (!(nameWithout19.includes('1') || nameWithout19.includes('first'))) {
    // Looking for first dose!
    return false;
  }
  if (name.includes('covid') || name.includes('astra') || name.includes('vaccine')) {
    return true;
  }
  return false;
}

/**
 * Returns true if the appointment reason is to get 1st dose of Pfizer
 */
export function isFirstDosePfizerReason(reasonName: string): boolean {
  const name = reasonName.toLowerCase();
  const nameWithout19 = name.replace('19', '');

  if (name.includes('astra') || name.includes('zeneca') || name.includes('az')) {
    return false;
  }

  if (!(nameWithout19.includes('1') || nameWithout19.includes('first'))) {
    // Looking for first dose!
    return false;
  }
  if (name.includes('pfizer')) {
    return true;
  }
  return false;
}

/**
 * Returns true if the appointment reason is a booster dose.
 */
export function isBoosterReason(reasonName: string): boolean {
  const name = reasonName.toLowerCase();

  if (name.includes('booster')) {
    return true;
  }

  return false;
}

/**
 * Scary function name! The arg is a number signifying a vaccine reason type (hopefully 1st dose).
 * It returns a list of ids which are the availability ids, which get passed to the availability
 * search.
 */
function getAvailabilityIdsForReason(firstDoseReasonId: number, doctor_reasons: DoctorReason[]): number[] {
  const availabilityIdsDuplicates: number[] = doctor_reasons
    .filter(doctor_reason => doctor_reason.reason_id === firstDoseReasonId)
    .map(doctor_reason => doctor_reason.availability_type_id)
  return availabilityIdsDuplicates;
}

export function clinicInfoToAvailabilityIds(reasons: Reason[], doctor_reasons: DoctorReason[]): number[] {
  /*
  Rough idea:
  - Go to "reasons"
  - find one with "name": "COVID-19 Astrazeneca Vaccine Dose 1",
  - get id: 59096
  - in "doctor_reasons", for each record with "reason_id" = that id, get the availability_type_id
  - put all those availability ids into the request!
  */
  const allAvailabilityIds: number[][] = reasons.map(
    reason => getAvailabilityIdsForReason(reason.id, doctor_reasons));
  const flatAllAvailabilityIds: number[] = allAvailabilityIds.reduce((acc, val) => acc.concat(val), []);

  const availabilityIds: number[] = Array.from(new Set(flatAllAvailabilityIds));
  return availabilityIds;
}


export async function getRawTimeslots(availabilityIds: number[], clinicId: number): Promise<TimeSlotRootObject> {
  const params = {
    // We just want the next timestamps, so we've intentionall set to the past, so that
    // we only have to handle one logic path.
    // See comment in rawTimeslotsToSoonestTimestamp();
    start_time: '2021-07-08T08%3A06%3A10.828Z',
    end_time: '2021-07-12T13%3A59%3A59.999Z',
    clinic_id: clinicId
  }

  // Gotta make this separately as there are multiple!
  let availabilityParam = ''
  availabilityIds.forEach(id => {
    availabilityParam += `&availability_type_ids%5B%5D=${id}`
  })

  const qs = querystring.stringify(params);

  const url = `https://www.hotdoc.com.au/api/patient/time_slots?${qs}${availabilityParam}`
  const result = await fetch(url, {
    "headers": {
      "accept": "application/au.com.hotdoc.v5",
    },
    "method": "GET",
  });
  const jsonText = await result.text();
  const jsonObj = JSON.parse(jsonText);
  // console.log(JSON.stringify(jsonObj,null,2));
  return jsonObj;
}

export function isAZClinic(clinic_name: string) {
  const name = clinic_name.toLowerCase();
  if (name.includes('pfizer')) {
    return false;
  }
  if (name.includes('astra') || name.includes('az')) {
    return true;
  }
  return false;
}

export function isPfizerClinic(clinic_name: string) {
  const name = clinic_name.toLowerCase();
  if (name.includes('astra') || name.includes('zeneca') || name.includes('AZ')) {
    return false;
  }
  if (name.includes('pfizer')) {
    return true;
  }
  return false;
}

export function isModernaClinic(clinic_name: string) {
  const name = clinic_name.toLowerCase();
  if (name.includes('moderna')) {
    return true;
  }
  return false;
}

/** Join timeslots and doctors on ids */
export function getSoonestDoctorAvailabilities(
  rawTimeslotsDoctors: TimeSlotDoctor[],
  doctors: Doctor[]
): string[] {
  // We just want the next timestamps, so we've intentionall set to the past, so that
  // we only have to handle one logic path.
  const timeslots = rawTimeslotsDoctors
    .filter((doctor: TimeSlotDoctor) => {
      const doctorInfo: Doctor | undefined = doctors.find(doctor_search => doctor_search.id === doctor.id);
      if (doctorInfo === undefined) {
        return false;
      }
      if (doctorInfo.accepts_new_patients === false) {
        return false;
      }
      return true;
    })
    .map(doctor => doctor.next_available)
    // Remove timestamps that are null or undefined 
    .filter((o: string | undefined | null): o is string => {
      return o !== undefined && o !== null;
    });
  return timeslots;
}

/**
 * Get the soonest appointments for a given clinic.
 * 
 * Some clinics display an option between Pfizer & AZ, then ask for doctor.
 * Some clinics display an option for any vaccine, then make you pick between two "Doctors"
 * that are named AZ or Pfizer.
 * 
 * That's why there is two code paths here for those two scenarios.
 * 
 * @param clinic_code_string Clinic identifier - human readable name with dashes
 * @returns ISO8601 string of earliest appointment time
 */
export async function getSoonestClinicAppointments(
  vaccine: 'astrazeneca' | 'pfizer' | 'anybooster',
  clinic_code_string: string,
): Promise<string | undefined> {
  const clinicInfo: RootObject = await getClinicInfo(clinic_code_string);
  if (clinicInfo.errors !== undefined) {
    throw Error(JSON.stringify(clinicInfo.errors, null, 2));
  }
  const clinicId: number = clinicInfo.clinic.id;
  ///////////
  // These reasons just have to be about any vaccine
  const anyVaccineReasons: Reason[] = clinicInfo.reasons
    .filter(reason => isVaccineReason(reason.name));

  const vaccineAvailabilityIds = clinicInfoToAvailabilityIds(
    anyVaccineReasons, clinicInfo.doctor_reasons);
  const rawTimeslotsForAnyVaccine: Promise<TimeSlotRootObject> =
    getRawTimeslots(vaccineAvailabilityIds, clinicId);

  const checkReason = {
    'anybooster': isBoosterReason,
    'astrazeneca': isFirstDoseAZReason,
    'pfizer': isFirstDosePfizerReason
  }
  /////////////////
  // These reasons must be for our given vaccine
  const reasonsWithOurVaccine = clinicInfo.reasons.filter(reason =>
    (checkReason[vaccine])(reason.name)
  );
  const availabilityIdsForOurVaccine = clinicInfoToAvailabilityIds(
    reasonsWithOurVaccine, clinicInfo.doctor_reasons);
  const rawTimeslotsForOurVaccine: Promise<TimeSlotRootObject> =
    getRawTimeslots(availabilityIdsForOurVaccine, clinicId);
  ////////////////

  const doctorsNamedByOurVaccine = clinicInfo.doctors.filter(doctor => {
    if (vaccine === 'astrazeneca') {
      return isAZClinic(doctor.full_name);
    } else if (vaccine === 'pfizer') {
      return isPfizerClinic(doctor.full_name);
    } else if (vaccine === 'anybooster') {
      return isPfizerClinic(doctor.full_name) || isModernaClinic(doctor.full_name);
    }
  }
  )
  const soonestTimestamps1 = getSoonestDoctorAvailabilities(
    (await rawTimeslotsForAnyVaccine).doctors, doctorsNamedByOurVaccine);

  const soonestTimestamps2 = getSoonestDoctorAvailabilities(
    (await rawTimeslotsForOurVaccine).doctors, clinicInfo.doctors);

  let sortedTimeslots = [...soonestTimestamps1, ...soonestTimestamps2];
  if (sortedTimeslots.length === 0) {
    return;
  }
  sortedTimeslots.sort()
  return sortedTimeslots[0];
}

/**
 * Make request to HotDoc API to get nearby clinics
 * @param suburb Must be defined if latitude and longitude not defined
 */
async function makeNearbyClinicsRequest(vaccine: 'astrazeneca' | 'pfizer' | 'anybooster', latitude?: number, longitude?: number, suburb?: string): Promise<ClinicSearchRootObject> {

  /* Currently
  filters=covid_vaccine-astrazeneca_under_60 and &filters=covid_vaccine-astrazeneca_60_plus
  are the only AZ filter options. Seeing as AZ is pretty popular, it should be *very* likely
  clinics that give any vaccine give AZ.
  */
  const filterParams = vaccine === 'astrazeneca'
    ? {} : { filters: 'covid_vaccine-pfizer' }

  const params = latitude !== undefined
    ? {
      entities: 'clinics',
      filters: 'covid_vaccine-available',
      latitude: latitude,
      longitude: longitude,
      ...filterParams
    }
    : {
      entities: 'clinics',
      filters: 'covid_vaccine-available',
      suburb: suburb,
      ...filterParams
    }

  const qs = querystring.stringify(params);
  const url = `https://www.hotdoc.com.au/api/patient/search?${qs}`

  const result = await fetch(url, {
    "headers": {
      "accept": "application/au.com.hotdoc.v5",
      "accept-language": "en-GB,en;q=0.9",
      "content-type": "application/json; charset=utf-8",
      "context": "purpose=covid-vaccine;",
    },
    "method": "GET",
  });
  const jsonText = await result.text();
  const jsonObj = JSON.parse(jsonText);
  // console.log(JSON.stringify(jsonObj,null,2));
  return jsonObj;
}

/**
 * Create nearby clinics object ready to send to frontend
 */
export async function getNearbyClinics(
  vaccine: 'astrazeneca' | 'pfizer' | 'anybooster',
  latitude?: number,
  longitude?: number,
  suburb?: string,
  mockData?: ClinicSearchRootObject
): Promise<FrontendClinicData[]> {
  const nearbyClinics = mockData !== undefined
    ? mockData
    : await makeNearbyClinicsRequest(vaccine, latitude, longitude, suburb);

  // Create map of suburb IDs to suburb objects
  const suburbs: { [key: number]: SuburbSearch } = {};
  nearbyClinics.suburbs.forEach(suburb => {
    suburbs[suburb.id] = suburb;
  });

  return nearbyClinics.clinics.map(clinic => {
    const { name, slug, street_address, suburb_id } = clinic;

    // Look up suburb object
    const suburb = suburbs[suburb_id];

    return {
      name,
      id_string: slug,
      street_address,
      /** Include the suburb if not already included in the address */
      suburb_name: street_address.includes(suburb.name) ? '' : suburb.name,
      url: `https://www.hotdoc.com.au/medical-centres/${suburb.slug}/${slug}/doctors?purpose=covid-vaccine&wp=gpvaccinesearch`,
    }
  });
}

export async function fetchSuburbs(query: string): Promise<Object> {
  const url = `https://www.hotdoc.com.au/api/patient/suburbs/search?query=${query}`
  const result = await fetch(url, {
    "headers": {
      "accept": "application/au.com.hotdoc.v5",
      "content-type": "application/json; charset=utf-8",
    },
    "method": "GET",
  });
  const jsonText = await result.text();
  return JSON.parse(jsonText);
}