const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || './serviceAccountKey.json';
const serviceAccount = require(path.resolve(serviceAccountPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'your-project-id.appspot.com'
});

const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

module.exports = { admin, db, auth, bucket };
