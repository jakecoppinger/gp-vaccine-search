import * as express from 'express';
import {getNearbyClinics, getSoonestClinicAppointments} from './api';

const areWeDebugging = process.env.ARE_WE_DEBUGGING;
console.log(`Are we debugging? process.env.ARE_WE_DEBUGGING is ${areWeDebugging}`);

const allowReqDomain = areWeDebugging === 'true' ? 'http://localhost:8000' : 'https://gpvaccinesearch.com';
var allowCrossDomain = function(req: any, res: any, next: any) {
  req;
  res.header('Access-Control-Allow-Origin', allowReqDomain);
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

  const soonestAppointment = await getSoonestClinicAppointments(clinic_id_string);
  res.json({status: 'success', soonest_appointment: soonestAppointment});
});

app.post('/nearby_clinics', async (req, res) => {
  if(req.body === undefined) {
    res.status(400);
    res.send(`no body!`);
    return;
  }
  const rawLatitude = req.body.latitude;
  const rawLongitude = req.body.longitude;

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
  const nearbyClinics = await getNearbyClinics(latitude,longitude);
  res.json(nearbyClinics);
});

export default app;
