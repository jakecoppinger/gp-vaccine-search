
export const showNumberGps = 20;

// Use local when you want to run the frontend on non-HTTPs to mock in a location (you can't use
// geolocation without HTTPs)
export const whereAmI: 'production' | 'dev' | 'local' = 'production';

// @ts-ignore
export const apiHostname = whereAmI === 'dev'
  ? 'https://pxlb07iq0m.execute-api.ap-southeast-2.amazonaws.com/dev/'
  // @ts-ignore
  : (whereAmI === 'local'
    ? 'http://localhost:3000/'
    : 'https://ytmw05y6di.execute-api.ap-southeast-2.amazonaws.com/production/');

