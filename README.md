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

## Running frontend
```
cd frontend/
yarn
yarn build
```

Frontend code is compiled and put into `dist/`. You could `cd dist` and `python -m SimpleHTTPServer` but notice that the geolocation doesn't work without HTTPS.

You can use `ngrok` as well for HTTPS (`ngrok http 8000`), however you'll hit CORs issues. I'll try and make this dev experience better soon :)

## Author

Built by Jake Coppinger.

Contact me at [jake@jakecoppinger.com](mailto:jakecoppinger.com). My portfolio is [jakecoppinger.com](https://jakecoppinger.com).
