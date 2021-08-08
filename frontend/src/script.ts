/*
Hello!
Forgive the horrible code, this is the product of two afternoons of work.
I promise I write better usually. It's open source on Github.

Please don't try and abuse the backend server - I just want to help people get vaccinated :)
*/
const showNumberGps = 20;

export async function setElementTextIfExists(selector: string, text: string) {
  const element = document.querySelector(selector);
  if (element) {
    element.innerHTML = text;
  }
}
export async function setElementValueIfExists(selector: string, text: string) {
  const element: HTMLInputElement | null = document.querySelector(selector);
  if (element) {
    element.value = text;
  }
}

interface Clinic {
  url: string;
  name: string;
  id_string: string;
  street_address: string;
  next_appointment?: string;
  appointment_status: 'pending' | 'found' | 'call-clinic' | 'error';
}

export interface BackendClinicShape {
  name: string,
  street_address: string,
  url: string,
  id_string: string
}

let state: Clinic[] = [];
function statusToText(status: 'pending' | 'found' | 'call-clinic'| 'error') {
  if(status === 'pending') {
    return "Pending...";
  } else if(status == 'found') {
    return "Checked";
  } else if(status === 'call-clinic') {
    return "Unable to check online. Call clinic.";
  }
  return "Error";
}

function compareClinic(a: Clinic, b: Clinic): number {
  if(a.next_appointment === undefined && b.next_appointment === undefined) {
    return 0;
  }
  if(a.next_appointment === undefined) {
    return 1;
  }
  if(b.next_appointment === undefined) {
    return -1;
  }

  const date1 = new Date(a.next_appointment);
  const date2 = new Date(b.next_appointment);
  // @ts-ignore
  return date1 - date2;
}

function stateToJSON() {
  let sortedClinics = [
    ...state
  ];
  sortedClinics.sort(compareClinic);
  const mappedClinincs = sortedClinics.map((clinic: Clinic) => ({
    name: clinic.name,
    next_appointment: clinic.next_appointment !== undefined ? clinic.next_appointment : '',
    appointment_status: statusToText(clinic.appointment_status),
    url: `<a href="${clinic.url}">Book on HotDoc</a>`
  }))

  const firstXClinics = mappedClinincs.slice(0,Math.min(showNumberGps, mappedClinincs.length));
  return firstXClinics;
}


function responseToState(response: BackendClinicShape[]): Clinic[] {
  return response.map(clinic => {
    return {...clinic, next_appointment: undefined, appointment_status: 'pending'}
  });
}


document.addEventListener("DOMContentLoaded", async (event) => {

});


const apiHostname = 'https://pxlb07iq0m.execute-api.ap-southeast-2.amazonaws.com/dev/';
async function fetchNearbyClinics(latitude: number, longitude: number) {

  setElementTextIfExists('#clinic-fetch-status','Finding nearby GPs...');

  try {
    const getClinicsUrl = `${apiHostname}nearby_clinics`;
    const response = await fetch(getClinicsUrl,{
      method: 'POST',
      body: new URLSearchParams({
        latitude: latitude.toString(),
        longitude:longitude.toString()
      })
    })
    const jsonString: string = await response.text();
    const responseJson: BackendClinicShape[] = JSON.parse(jsonString);
    state = responseToState(responseJson)

    updateView();
    setElementTextIfExists('#clinic-fetch-status','');
    await findAppointments();
  } catch(e) {
    setElementTextIfExists('#clinic-fetch-status','Failed to check GPs. Likely a bug, please check HotDoc manually.');
    // What errors happened?
    // @ts-ignore
    heap.track('clinic_fetch_failed');
  }
}
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateView() {
  const tableJson = stateToJSON();
  createTable(tableJson, 'table-container');
}

async function findAppointments() {
  let callClinicErrors = 0;
  let serverReturnedErrorErrors = 0;
  let unknownErrors = 0;
  let exceptionErrors = 0;
  let successes = 0;

  for(let i = 0; i < Math.min(showNumberGps,state.length); i++) {
    const clinic_id_string = state[i].id_string;
    try {
      const reqUrl = `${apiHostname}get_soonest_clinic_appintment`;
      const response = await fetch(reqUrl,{
        method: 'POST',
        body: new URLSearchParams({
          clinic_id_string: clinic_id_string,
      })});

      const jsonString: string = await response.text();
      const responseJson = JSON.parse(jsonString);
      if(responseJson.status === 'error') {
        if(responseJson.error === 'call-clinic') {
          state[i].appointment_status = 'call-clinic';
          callClinicErrors += 1;
        } else {
          console.log("Server returned error for url:");
          console.log(reqUrl);
          state[i].appointment_status = 'error';
          serverReturnedErrorErrors += 1;
        }
      } else if(responseJson.status === 'success') {
        state[i].next_appointment = responseJson.soonest_appointment;
        state[i].appointment_status = 'found';
        successes += 1;
      } else {
        console.log("Unknown error for fetchUrl:");
        console.log(reqUrl);
        console.log(state[i]);
        state[i].appointment_status = 'error';
        unknownErrors += 1;
      }
    } catch(e) {
      console.error('Error making request.')
      console.error('Likely a lambda error, returning "message": "Internal server error", which fails CORS');
      console.error('TODO: Better logging & error handling');
      console.error(e);
      state[i].appointment_status = 'error';
      exceptionErrors += 1;
    }
    updateView();
    // On top of backend rate limiting
    await sleep(2000);
  }

  // What errors happened?
  // @ts-ignore
  heap.track('api_errors', {callClinicErrors,serverReturnedErrorErrors,unknownErrors,exceptionErrors,successes});
}

/**
 * StackOverflow code :D
 */
function createTable(inputJson: any, containerId: string) {
  const myBooks = inputJson;

  // EXTRACT VALUE FOR HTML HEADER. 
  // ('Book ID', 'Book Name', 'Category' and 'Price')
  var col = [];
  for (var i = 0; i < myBooks.length; i++) {
    for (var key in myBooks[i]) {
      if (col.indexOf(key) === -1) {
        col.push(key);
      }
    }
  }

  // CREATE DYNAMIC TABLE.
  var table = document.createElement("table");

  // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

  var tr = table.insertRow(-1);                   // TABLE ROW.

  for (var i = 0; i < col.length; i++) {
    var th = document.createElement("th");      // TABLE HEADER.
    th.innerHTML = col[i];
    tr.appendChild(th);
  }

  // ADD JSON DATA TO THE TABLE AS ROWS.
  for (var i = 0; i < myBooks.length; i++) {

    tr = table.insertRow(-1);

    for (var j = 0; j < col.length; j++) {
      var tabCell = tr.insertCell(-1);
      tabCell.innerHTML = myBooks[i][col[j]];
    }
  }

  // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
  const divContainer = document.getElementById(containerId);
  if (divContainer === null || divContainer === undefined) {
    console.error("table container not found");
    return;
  }
  divContainer.innerHTML = "";
  divContainer.appendChild(table);
}
/////

let button = document.getElementById("get-location");

if(button) {
  button.addEventListener("click", function() {
    console.log("getting location!");
    
    setElementTextIfExists('#location-status','Checking location...')
    navigator.geolocation.getCurrentPosition(async function(position) {
      let lat = position.coords.latitude;
      let long = position.coords.longitude;
      console.log({lat,long});

      setElementTextIfExists('#location-status','')
      setElementValueIfExists('#latitude',lat.toString())
      setElementValueIfExists('#longitude',long.toString())

      await fetchNearbyClinics(lat, long);
    });
  });
}
