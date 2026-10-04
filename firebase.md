Project name
kartu-review-pintar
Project ID 
kartu-review-pintar
Project number 
653959578590


var admin = require("firebase-admin");

var serviceAccount = require("path/to/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQoyupuvVYQ4c1Db4aI-QquQlqi4WeG8w",
  authDomain: "kartu-review-pintar.firebaseapp.com",
  projectId: "kartu-review-pintar",
  storageBucket: "kartu-review-pintar.firebasestorage.app",
  messagingSenderId: "653959578590",
  appId: "1:653959578590:web:992bec7cbf97163a75534f",
  measurementId: "G-R4H7P03TVS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);



npm install -g firebase-tools
kartu-pintar
App ID 
1:653959578590:web:992bec7cbf97163a75534f
