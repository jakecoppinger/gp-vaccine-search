import * as express from 'express';
import {fetchSuburbs, getNearbyClinics, getSoonestClinicAppointments} from './api';

const whereAmI = process.env.WHEREAMI;
console.log(`WHEREAMI: ${whereAmI}`);

const corsOrigin = whereAmI === 'dev'
  ? 'https://beta.gpvaccinesearch.com'
  : (whereAmI === 'local' ? 'http://localhost:8000' : 'https://gpvaccinesearch.com')

console.log(`corsOrigin is: ${corsOrigin}`);

var allowCrossDomain = function(req: any, res: any, next: any) {
  req;
  res.header('Access-Control-Allow-Origin', corsOrigin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

const app = express();
app.use(allowCrossDomain);
app.use(express.urlencoded({ extended: true }));
app.set('json spaces', 2);

app.post('/get_soonest_clinic_appintment', async (req, res) => {
  const clinic_id_string = req.body.clinic_id_string;

  if(typeof clinic_id_string !== 'string' || clinic_id_string === undefined || clinic_id_string.length < 1) {
    res.send(`clinic_id_string isn't in body`);
    return;
  }

  const soonestAppointment = await getSoonestClinicAppointments('astrazeneca', clinic_id_string);
  res.json({status: 'success', soonest_appointment: soonestAppointment});
});

app.post('/search_suburbs', async (req,res) => {
  if(req.body === undefined) {
    res.status(400);
    res.send(`no body!`);
    return;
  }
  const query = req.body.query;
  if(typeof query !== 'string' || query.length === 0) {
    res.status(400);
    res.send(`empty or missing query`);
    return;
  }

  const result = await fetchSuburbs(query);
  res.json(result);
});

app.post('/nearby_clinics', async (req, res) => {
  if(req.body === undefined) {
    res.status(400);
    res.send(`no body!`);
    return;
  }
  const vaccine = req.body.vaccine;
  const rawLatitude = req.body.latitude;
  const rawLongitude = req.body.longitude;

  if(typeof vaccine !== 'string' || vaccine === undefined || vaccine.length < 1) {
    res.status(400);
    res.send(`vaccine isn't in body`);
    return;
  }
  if(vaccine !== 'astrazeneca' && vaccine !== 'pfizer') {
    res.status(400);
    res.send(`vaccine must be astrazeneca or pfizer`);
    return;
  }
  if(typeof rawLatitude !== 'string' || rawLatitude === undefined || rawLatitude.length < 1) {
    res.status(400);
    res.send(`latitude isn't in body`);
    return;
  }
  if(typeof rawLongitude !== 'string' || rawLongitude === undefined || rawLongitude.length < 1) {
    res.status(400);
    res.send(`longitude isn't in body`);
    return;
  }
  let latitude: number | undefined;
  let longitude: number | undefined;
  try {
    latitude = parseFloat(rawLatitude);
    longitude = parseFloat(rawLongitude);
  } catch(e) {
    res.send(`can't parse lat and lon into floats`);
    return;
  }
  const nearbyClinics = await getNearbyClinics(vaccine, latitude,longitude, undefined);
  res.json(nearbyClinics);
});

app.post('/nearby_clinics_suburb', async (req, res) => {
  if(req.body === undefined) {
    res.status(400);
    res.send(`no body!`);
    return;
  }
  const suburb = req.body.suburb;

  if(typeof suburb !== 'string' || suburb === undefined || suburb.length < 1) {
    res.status(400);
    res.send(`suburb isn't in body`);
    return;
  }

  const vaccine = req.body.vaccine;
  if(typeof vaccine !== 'string' || vaccine === undefined || vaccine.length < 1) {
    res.status(400);
    res.send(`vaccine isn't in body`);
    return;
  }
  if(vaccine !== 'astrazeneca' && vaccine !== 'pfizer') {
    res.status(400);
    res.send(`vaccine must be astrazeneca or pfizer`);
    return;
  }

  const nearbyClinics = await getNearbyClinics(vaccine, undefined,undefined, suburb);
  res.json(nearbyClinics);
});
export default app;
