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
    , 'http://localhost:4006'
  ],

  ver: {
    server: '1.5.7',
    clientLatest: '1.1.3',
    clientCurrent: '1.1.2',
  },

  Google: {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: 'abhisek.dutta.507@gmail.com',
      pass: ''
    }
  },
};

module.exports = env;