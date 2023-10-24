// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAL5we6Pwz0pO5DycMvkgUJCjl44s1Cr5k",
  authDomain: "dmsapp-c934a.firebaseapp.com",
  projectId: "dmsapp-c934a",
  storageBucket: "dmsapp-c934a.appspot.com",
  messagingSenderId: "808281300927",
  appId: "1:808281300927:web:c1068d7ff95bf009df8b0a",
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
/*export const  db= initializeFirestore(db, {
  experimentalForceLongPolling: true,
});*/
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIRE_STORE = getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
