import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBQ9Bkuo3T_e-e8hVk1d1ZlWU1BavNK_WI",
    authDomain: "banana-game-f6bde.firebaseapp.com",
    projectId: "banana-game-f6bde",
    storageBucket: "banana-game-f6bde.appspot.com",
    messagingSenderId: "648784611095",
    appId: "1:648784611095:web:af9e1fac76a96efb169952"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
