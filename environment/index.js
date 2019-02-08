const env = {
  Mlab: {
    host: 'ds127115.mlab.com',
    port: 27115,
    database: 'lab-2',
    username: 'psynapsus',
    password: 'password123'
  },
  JWT: {
    key: '45gH8pt'
  },
  cloudinary: {
    cloud_name: 'imagebag',
    api_key: '187733662376354', 
    api_secret: 'mJJsX75Nef9_9T0nQkshWcLoy9Y'
  },

  /**
   * @description Allowed Origins are listed here.
   */
  ao: [
    'https://psynapsus.netlify.com'
    , 'https://rottenvisions.netlify.com'
    , 'http://localhost:4004'
    , 'http://localhost:4005'
  ],

  ver: {
    server: '1.4.3',
    clientLatest: '3.0.3',
    clientCurrent: '3.0.2',
  }
};

module.exports = env;