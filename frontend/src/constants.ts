
export const showNumberGps = 20;
export const whereAmI: 'production' | 'dev' | 'local' = 'local';

// @ts-ignore
export const apiHostname = whereAmI === 'dev'
  ? 'https://pxlb07iq0m.execute-api.ap-southeast-2.amazonaws.com/dev/'
  // @ts-ignore
  : (whereAmI === 'local'
    ? 'http://localhost:3000/'
    : 'https://ytmw05y6di.execute-api.ap-southeast-2.amazonaws.com/production/');

