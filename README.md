GP Vaccine Search
=================

Unofficial Australian GP AstraZeneca Search: https://gpvaccinesearch.com/

Searches HotDoc for nearby GPs, and ranks them by their next available appointment for first AstraZeneca dose.

Rate limited so as not to affect HotDoc.
Built in two afternoons, definitely isn't my prettiest code. If it helps get us out of this national emergency one day sooner I'll be very happy.

Hosted on AWS S3 behind Cloudflare and Lambda.

## Resources
- [Official Aus Gov Eligibility Checker](https://covid-vaccine.healthdirect.gov.au/eligibility?lang=en)
- Unofficial Pfizer appointment finder: https://covidqueue.com/

## Getting started

This is a monorepo of sorts. Frontend code in `frontend/`, Express server
in `backend/`.

## Running backend

```
cd backend/
yarn
yarn build
yarn run dev
```

Starts express server on `localhost:3000`

For debugging, this might be handy:

`ls src/*.ts | entr -rcs "yarn build && WHEREAMI=local yarn run dev"`

`ARE_WE_DEBUGGING` sets the `Access-Control-Allow-Origin` to a localhost debug URL.

## Running frontend
```
cd frontend/
yarn
yarn build
```

For debugging, set `debug = true` at the top of `frontend/src/script.ts`.

This uses the coordinates of Central to find clinics, see comment in
`document.addEventListener("DOMContentLoaded", ...`.

Frontend code is compiled and put into `dist/`. 
You could `cd dist` and `python -m SimpleHTTPServer` but notice that the geolocation doesn't work without HTTPS.

You can use `ngrok` as well for HTTPS (`ngrok http 8000`), however you'll hit CORs issues.

## Author

Built by Jake Coppinger.

Contact me at [jake@jakecoppinger.com](mailto:jakecoppinger.com). My portfolio is [jakecoppinger.com](https://jakecoppinger.com).
