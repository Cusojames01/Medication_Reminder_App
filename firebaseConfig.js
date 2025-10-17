import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAw-bwFr2CWqXpMNu3Ir1oTxlLuEYnQl1A",
  authDomain: "med-reminderapp-de4bb.firebaseapp.com",
  projectId: "med-reminderapp-de4bb",
  storageBucket: "med-reminderapp-de4bb.firebasestorage.app",
  messagingSenderId: "172875727349",
  appId: "1:172875727349:web:04591327cddca5f20320bc",
  measurementId: "G-38XK6CFRT9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ✅ Initialize Firebase Auth properly
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
