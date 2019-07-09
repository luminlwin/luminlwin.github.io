import * as firebase from 'firebase';
// import firestore from 'firebase/firestore';

// const settings = {timestampsInSnapshots: true};
const settings = {};

const config = {
  apiKey: "AIzaSyCicfImhXsn9K6AoxLP5sDvjF6QJVg85s0",
  authDomain: "migs-survey-app.firebaseapp.com",
  databaseURL: "https://migs-survey-app.firebaseio.com",
  projectId: "migs-survey-app",
  storageBucket: "migs-survey-app.appspot.com",
  messagingSenderId: "513999238506"
};
firebase.initializeApp(config);

firebase.firestore().settings(settings);

export default firebase;