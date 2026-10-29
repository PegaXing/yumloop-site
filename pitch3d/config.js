/* Sightline 3D publisher pitch — configuration (same scheme as pitch/config.js for Sightline).
   ?to=<key> swaps in a named "Why you?" section; with no key the page names nobody. */
window.PITCH = {
  defaultPublisher: '',
  links: {
    trailer: '#trailer',
    build: '',                 /* '' = on request: the page shows "on request" and opens an email */
    buildWindows: '',
    pdf: '',
    contact: 'mailto:yoni@yumloop.net?subject=Sightline%203D',
    storeBuilds: 'mailto:yoni@yumloop.net?subject=' + encodeURIComponent('Sightline 3D: TestFlight / Google Play / Windows build request'),
    sightline: 'sightline-pitch.html'
  },
  launch: '',                  /* '' keeps "set with the right partner" */
  budget: '',
  publishers: {
    rawfury:    { name: 'Raw Fury',   why: [ 'PLACEHOLDER — write the Raw Fury-specific reasoning for Sightline 3D here.' ] }
  }
};
