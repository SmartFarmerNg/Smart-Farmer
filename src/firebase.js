import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5ym3SsUgAZjoHEL-bniiWolDzDwmXNUU",
  authDomain: "jobb-deddf.firebaseapp.com",
  projectId: "jobb-deddf",
  storageBucket: "jobb-deddf.firebasestorage.app",
  messagingSenderId: "621234580656",
  appId: "1:621234580656:web:41f8eb55858b6949629f75",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
