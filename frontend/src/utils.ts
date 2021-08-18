import { Clinic, OurWindow } from "./interfaces";
import { vaccineRadioSelector } from "./selectors";

// TODO: Not sure whats up with my tsconfig, using import halts the program
// when format is called.
const format = require('date-fns/format');

export async function setElementTextIfExists(selector: string, text: string) {
  const element = document.querySelector(selector);
  if (element) {
    element.innerHTML = text;
  }
}
/**
 * StackOverflow code :D
 */
export function createTable(inputJson: any, containerId: string) {
  const myBooks = inputJson;
  const headerLookup = {
    'name': "GP",
    'next_appointment': "Next",
    'appointment_status': "Status",
    'url': ''
  }

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
    const rawCellText = col[i]
    // @ts-ignore
    const cellText = rawCellText in headerLookup ? headerLookup[rawCellText] : rawCellText;
    th.innerHTML = cellText;
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

export function compareClinic(a: Clinic, b: Clinic): number {
  if (a.next_appointment === undefined && b.next_appointment === undefined) {
    return 0;
  }
  if (a.next_appointment === undefined) {
    return 1;
  }
  if (b.next_appointment === undefined) {
    return -1;
  }

  const date1 = new Date(a.next_appointment);
  const date2 = new Date(b.next_appointment);
  // @ts-ignore
  return date1 - date2;
}

export function statusToText(status: 'pending' | 'found' | 'call-clinic' | 'error' | 'bad-time') {
  if (status === 'pending') {
    // return "...";
    return `<img class='loading' src="/img/Spinning arrows.gif">`;
  } else if (status == 'found') {
    return "✓";
  } else if (status == 'bad-time') {
    return "Time in past";
  } else if (status === 'call-clinic') {
    return "Call clinic";
  }
  return "Error";
}

export function formatIsoDate(isoDate: string): string {
  return format(new Date(isoDate), 'eee dd LLL h:mmaaa').toString();
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getVaccineFromRadioButtons(): 'pfizer' | 'astrazeneca' {
  const radios = document.querySelectorAll(vaccineRadioSelector);
  console.log({radios});
  for(let i = 0; i< radios.length; i++) {
    const typedRadio = radios[i] as HTMLInputElement

    console.log(typedRadio.checked);
    if(typedRadio.checked) {
      const val = typedRadio.value
      console.log({val});
      return val as 'astrazeneca' | 'pfizer';
    }
  };
  throw Error("Defaulting to astra");
  return 'astrazeneca';
}

export function stopLoadingTimes() {
  if((window as OurWindow).currently_loading_times === true) {
    (window as OurWindow).cancel_loading_times = true;
  }
}