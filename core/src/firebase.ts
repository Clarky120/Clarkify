import * as admin from "firebase-admin";
import { App, initializeApp } from "firebase-admin/app";
const serviceAccount = require(process.env.FIREBASE_CREDENTIALS ||
  "../service-keys/dev.json");

let app: App;

export const loadFirebase = () => {
  app = initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return app;
};

export const getFirebase = () => {
  return app;
};

export const getAdmin = () => {
  return admin;
};
