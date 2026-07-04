export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  socketUrl: 'http://node-app:3000',
  webRtcUrl: 'http://webrtc:${WEBRTC_PORT:-5002}',
  stripePublishableKey: 'live_test_key_here',
  firebase: {
    vapidKey: '',
  },
};
