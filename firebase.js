const admin = require('firebase-admin');
const serviceAccount = require('./orderflow-2cc98-2e8a8a97018c.json');

admin.initializeApp({

    credential: admin.credential.cert(serviceAccount)
    
});

module.exports = admin;




