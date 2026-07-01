import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDYcmjntPvmK7owF93l8ze9KILIE8igeTY",
  authDomain: "gen-lang-client-0935999478.firebaseapp.com",
  projectId: "gen-lang-client-0935999478",
  storageBucket: "gen-lang-client-0935999478.firebasestorage.app",
  messagingSenderId: "20501180419",
  appId: "1:20501180419:web:c66b0c1c8bc8829d9b5e36"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
