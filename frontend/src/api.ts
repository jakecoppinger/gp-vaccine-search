import { apiHostname, showNumberGps } from "./constants";
import { Clinic, OurWindow } from "./interfaces";
import { BackendClinicShape } from "./script";
import { compareClinic, createTable, formatIsoDate, setElementTextIfExists, sleep, statusToText, stopLoadingTimes } from "./utils";



/** Get nearby clinics from backend for given vaccine and lat/long or suburb, then kick off
 * time/view updates */
export async function fetchNearbyClinics(vaccine: 'astrazeneca' | 'pfizer', latitude?: number, longitude?: number, suburb?: string) {
  stopLoadingTimes()
  setElementTextIfExists('#clinic-fetch-status', 'Finding nearby GPs...');

  let params;
  if(latitude !== undefined && longitude !== undefined) {
    params = {
      vaccine,
      latitude: latitude.toString(),
      longitude: longitude.toString()
    }
  } else if(suburb !== undefined) {
    params = {
      vaccine,
      suburb
    };
  } else {
    throw Error("All args undefined");
  }

  const urlPath = latitude !== undefined ? `nearby_clinics` : `nearby_clinics_suburb`;

  try {
    const getClinicsUrl = `${apiHostname}${urlPath}`;

    const response = await fetch(getClinicsUrl, {
      method: 'POST',
      body: new URLSearchParams(params)
    })
    const jsonString: string = await response.text();
    const responseJson: BackendClinicShape[] = JSON.parse(jsonString);
    (window as OurWindow).clinics = responseToState(responseJson)

    updateView();
    setElementTextIfExists('#clinic-fetch-status', '');
    await findAppointments(vaccine);
  } catch (e) {
    console.log("Error getting nearby clinics:");
    console.error(e);
    setElementTextIfExists('#clinic-fetch-status', 'Failed to check GPs. Likely a bug, please check HotDoc manually.');
    // What errors happened?
    // @ts-ignore
    heap.track('clinic_fetch_failed');
  }
}

/** Get appointments from the backend for a given vaccine, update the state, and kick off view
 * update */
export async function findAppointments(vaccine: 'astrazeneca' | 'pfizer') {
  let callClinicErrors = 0;
  let serverReturnedErrorErrors = 0;
  let unknownErrors = 0;
  let exceptionErrors = 0;
  let successes = 0;
  let inPastErrors = 0;

  while((window as OurWindow).cancel_loading_times === true) {
    console.log("Cancel loading times is true, sleeping...");
    await sleep(500);
  }
  (window as OurWindow).currently_loading_times = true;

  for (let i = 0; i < Math.min(showNumberGps, (window as OurWindow).clinics.length); i++) {
    const clinic_id_string = (window as OurWindow).clinics[i].id_string;
    try {
      const reqUrl = `${apiHostname}get_soonest_clinic_appintment`;
      console.log(`Searching for ${vaccine} at ${clinic_id_string}`);
      const response = await fetch(reqUrl, {
        method: 'POST',
        body: new URLSearchParams({
          clinic_id_string: clinic_id_string,
          vaccine
        })
      });

      const jsonString: string = await response.text();
      const responseJson = JSON.parse(jsonString);

      // If another search is beginning, cancel our updates and don't change the state.
      if((window as OurWindow).cancel_loading_times === true) {
        (window as OurWindow).cancel_loading_times = false;
        (window as OurWindow).currently_loading_times = false;
        console.log("Cancel loading times is true, setting to false and returning...");
        return;
      }
      
      if (responseJson.status === 'error') {
        if (responseJson.error === 'call-clinic') {
          (window as OurWindow).clinics[i].appointment_status = 'call-clinic';
          callClinicErrors += 1;
        } else {
          console.log("Server returned error for url:");
          console.log(reqUrl);
          (window as OurWindow).clinics[i].appointment_status = 'error';
          serverReturnedErrorErrors += 1;
        }
      } else if (responseJson.status === 'success') {
        const appointmentTime = new Date(responseJson.soonest_appointment);
        const now = new Date();
        if(appointmentTime.getTime() <= now.getTime()) {
          (window as OurWindow).clinics[i].appointment_status = 'bad-time';
          inPastErrors += 1;
        } else {
          (window as OurWindow).clinics[i].next_appointment = responseJson.soonest_appointment;
          (window as OurWindow).clinics[i].appointment_status = 'found';
          successes += 1;
        }
      } else {
        console.log("Unknown error for fetchUrl:");
        console.log(reqUrl);
        console.log((window as OurWindow).clinics[i]);
        (window as OurWindow).clinics[i].appointment_status = 'error';
        unknownErrors += 1;
      }
    } catch (e) {
      console.error('Error making request.')
      console.error('Likely a lambda error, returning "message": "Internal server error", which fails CORS');
      console.error('TODO: Better logging & error handling');
      console.error(e);
      (window as OurWindow).clinics[i].appointment_status = 'error';
      exceptionErrors += 1;
    }
    updateView();
  }

  // What errors happened?
  // @ts-ignore
  heap.track('api_errors', { callClinicErrors, serverReturnedErrorErrors, unknownErrors, exceptionErrors,inPastErrors, successes });
  (window as OurWindow).currently_loading_times = false;
}

/** Create the HTML Table from the current state and put in DOM */
export function updateView() {
  const tableJson = stateToJSON();
  createTable(tableJson, 'table-container');
}
export function stateToJSON() {
  const {clinics: state} = (window as OurWindow);
  let sortedClinics = [
    ...state
  ];
  sortedClinics.sort(compareClinic);

  const mappedClinincs = sortedClinics
    .map((clinic: Clinic) => ({
      name: clinic.name,
      Date: clinic.next_appointment !== undefined ? formatIsoDate(clinic.next_appointment) : '',
      Status: statusToText(clinic.appointment_status),
      Address: `<a target="_blank" href="https://maps.google.com/?q=${clinic.street_address}+${clinic.suburb_name}">${clinic.street_address} ${clinic.suburb_name}</a>`,
      'Book on HotDoc': `<a target="_blank" href="${clinic.url}">Book</a>`,
    }))

  const firstXClinics = mappedClinincs.slice(0, Math.min(showNumberGps, mappedClinincs.length));
  return firstXClinics;
}

function responseToState(response: BackendClinicShape[]): Clinic[] {
  return response.map(clinic => {
    return { ...clinic, next_appointment: undefined, appointment_status: 'pending' }
  });
}