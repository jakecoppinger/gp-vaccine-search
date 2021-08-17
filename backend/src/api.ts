import { Clinic, ClinicSearch, ClinicSearchRootObject, FrontendClinicData, Reason, RootObject, SuburbSearch, TimeSlotRootObject } from './interfaces';
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

export function firstDoseReason(reason: Reason): boolean {
  const name = reason.name.toLowerCase();
  const nameWithout19 = name.replace('19', '');

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
 * Scary function name! The arg is a number signifying a vaccine reason type (hopefully 1st dose).
 * It returns a list of ids which are the availability ids, which get passed to the availability
 * search.
 */
function getAvailabilityIdsForAzFirstDoseReasonId(firstDoseReasonId: number, clinicInfo: RootObject): number[] {
  const availabilityIdsDuplicates: number[] = clinicInfo.doctor_reasons
    .filter(doctor_reason => doctor_reason.reason_id === firstDoseReasonId)
    .map(doctor_reason => doctor_reason.availability_type_id)
  return availabilityIdsDuplicates;
}

export function clinicInfoToAvailabilityIds(clinicInfo: RootObject): number[] {
  /*
  Rough idea:
  - Go to "reasons"
  - find one with "name": "COVID-19 Astrazeneca Vaccine Dose 1",
  - get id: 59096
  - in "doctor_reasons", for each record with "reason_id" = that id, get the availability_type_id
  - put all those availability ids into the request!
  */
  const reasons = clinicInfo.reasons
  const azFirstDoseReasons = reasons.filter(firstDoseReason);
  if (azFirstDoseReasons.length === 0) {
    console.error(azFirstDoseReasons);
    throw Error("doesn't have 1st dose AZ apparently. Check firstDoseReason()");
    return undefined;
  }
  //  else if(azFirstDoseReasons.length > 1){
  //   console.error(azFirstDoseReasons);
  //   throw Error("has more than one type of 1st dose AZ apparently. Check firstDoseReason()");
  //   return undefined;
  // }

  const allAvailabilityIds: number[][] = azFirstDoseReasons.map(
    reason => getAvailabilityIdsForAzFirstDoseReasonId(reason.id, clinicInfo));
  const flatAllAvailabilityIds: number[] = allAvailabilityIds.reduce((acc, val) => acc.concat(val), []);

  const availabilityIds: number[] = Array.from(new Set(flatAllAvailabilityIds));
  // console.log({azFirstDoseReasons,  allAvailabilityIds, flatAllAvailabilityIds, availabilityIds});
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

export function rawTimeslotsToSoonestTimestamp(rawTimeslots: TimeSlotRootObject): undefined | string {

  // Use this logic if the appointments are in the selected range of the query.
  // We just want the next timestamps, so we've intentionall set to the past, so that
  // we only have to handle one logic path.
  ////
  // const timeslots = rawTimeslots.time_slots.map(timeslot => timeslot.start_time);
  // if(timeslots.length === 0) {
  //   return undefined;
  // }

  const timeslots = rawTimeslots.doctors.map(doctor => doctor.next_available)

  let sortedTimeslots = [...timeslots];
  sortedTimeslots.sort()
  return sortedTimeslots[0];
}

export async function getSoonestClinicAppointments(
  slug: string,
  mockClinicInfo?: RootObject,
  mockRawTimeslots?: TimeSlotRootObject
): Promise<string | undefined> {
  const clinicInfo: RootObject = mockClinicInfo !== undefined
    ? mockClinicInfo
    : await getClinicInfo(slug);
  // if(slug === 'crown-st-medical-centre') {
  //   console.log("Slug:");
  //   console.log(slug)
  //   console.log("clinicInfo:");
  //   console.log(JSON.stringify(clinicInfo,null,2));
  // }
  if (clinicInfo.errors !== undefined) {
    throw Error(JSON.stringify(clinicInfo.errors, null, 2));
  }
  const clinicId: number = clinicInfo.clinic.id;
  let availabilityIds: number[];
  try {
    availabilityIds = clinicInfoToAvailabilityIds(clinicInfo);
  } catch (e) {
    console.error("Failed to get availability IDs");
    console.error(e);
    return undefined;
  }


  const rawTimeslots = mockRawTimeslots !== undefined
    ? mockRawTimeslots
    : await getRawTimeslots(availabilityIds, clinicId);

  // if(slug === 'crown-st-medical-centre') {
  //   console.log("Slug:");
  //   console.log(slug)
  //   console.log("timeslots:");
  //   console.log(JSON.stringify(rawTimeslots,null,2));
  // }
  // console.log(JSON.stringify(rawTimeslots,null,2));
  const soonestTimestamp: string | undefined = rawTimeslotsToSoonestTimestamp(rawTimeslots);
  return soonestTimestamp;
}

/**
 * Make request to HotDoc API to get nearby clinics
 * @param suburb Must be defined if latitude and longitude not defined
 */
async function makeNearbyClinicsRequest(latitude?: number, longitude?: number, suburb?: string): Promise<ClinicSearchRootObject> {
  const params = latitude !== undefined
    ? {
      entities: 'clinics',
      filters: 'covid_vaccine-available',
      latitude: latitude,
      longitude: longitude,
    }
    : {
      entities: 'clinics',
      filters: 'covid_vaccine-available',
      suburb: suburb
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
  latitude?: number,
  longitude?: number,
  suburb?: string,
  mockData?: ClinicSearchRootObject
): Promise<FrontendClinicData[]> {
  const nearbyClinics = mockData !== undefined
    ? mockData
    : await makeNearbyClinicsRequest(latitude, longitude, suburb);

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
      url: `https://www.hotdoc.com.au/medical-centres/${suburb.slug}/${slug}/doctors?purpose=covid-vaccine?wp=gpvaccinesearch`,
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