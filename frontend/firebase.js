// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, // Capital K
  authDomain: "country-kitchen-a3e22.firebaseapp.com",
  projectId: "country-kitchen-a3e22",
  storageBucket: "country-kitchen-a3e22.appspot.com",
  messagingSenderId: "406355504265",
  appId: "1:406355504265:web:e9baaa4d2aadae4fe9aa58"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


export { app, auth};
