export const environment = {
  production: false,
  // Same host the page was opened from, so it works on localhost and from a phone on the LAN.
  apiUrl: `http://${window.location.hostname}:8000/api/v1`,
};
