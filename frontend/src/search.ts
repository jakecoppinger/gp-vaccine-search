import { debounce } from "ts-debounce";
import { optionsDivSelector, postcodeSearchSelector } from "./selectors";
import { whereAmI, apiHostname } from './constants';
import { SuburbSearchObject } from "./interfaces";
import { fetchNearbyClinics } from "./api";

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
export function focusSearch() {
  console.log("Called focus");
  const options = document.getElementById("options");
  if (options) {
    options.classList.add("show");
  }
}

export function blurSearch() {
  console.log("Called blur");
  const options = document.getElementById("options");
  if (options) {
    // Remove this line to always show dropdown for debugging!
    options.classList.remove("show");
  }
}


function selectSuburb(ev: MouseEvent) {
  blurSearch();

  console.log({ ev });

  console.log
  // @ts-ignore
  const rawSlug: any = ev.target.attributes.data.value;
  // @ts-ignore
  // const rawShortRouteId: any = ev.target.attributes['data-short'].value;
  if (typeof rawSlug !== "string") {
    throw new Error("Couldn't get slug from link");
  }
  const slug: string = rawSlug;
  console.log({ slug });

  fetchNearbyClinics(undefined,undefined,slug);

}

export const debouncedSearch = debounce(oninputSearch, 100, {
  isImmediate: true,
  maxWait: 100
});

async function searchSuburbs(query: string): Promise<SuburbSearchObject> {
  const getClinicsUrl = `${apiHostname}search_suburbs`;
  const response = await fetch(getClinicsUrl, {
    method: 'POST',
    body: new URLSearchParams({
      query
    })
  })
  const jsonString: string = await response.text();
  return JSON.parse(jsonString);
}


export async function oninputSearch(): Promise<void> {
  const input = document.querySelector(postcodeSearchSelector) as HTMLInputElement;
  if (input === null) {
    throw new Error("search input doesn't exist");
  }
  console.log("oninputSearch fired");

  const searchText = input.value;
  const results = await searchSuburbs(searchText);

  const optionsDiv = document.querySelector(
    optionsDivSelector
  ) as HTMLDivElement;
  optionsDiv.innerHTML = "";

  results.suburbs.forEach((suburb) => {
    const a = document.createElement("a");
    a.href = "#";
    a.onmousedown = selectSuburb;
    a.setAttribute("data", suburb.slug);

    const linkText = document.createTextNode(
      `${suburb.name}, ${suburb.postcode}`
    );
    a.appendChild(linkText);
    optionsDiv.appendChild(a);
  });
}
