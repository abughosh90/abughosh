import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getAuth, type Auth } from "firebase/auth"
import { getStorage, type FirebaseStorage } from "firebase/storage"
import { getAnalytics, type Analytics } from "firebase/analytics"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0IYzEDQnaJc1jjtjvPahRmyJT4Ot6lnY",
  authDomain: "wwtp-activity.firebaseapp.com",
  projectId: "wwtp-activity",
  storageBucket: "wwtp-activity.firebasestorage.app",
  messagingSenderId: "711172083093",
  appId: "1:711172083093:web:1485ba9e33d9046f993a9c",
  measurementId: "G-G21FRZSMG4",
}

// Initialize Firebase app (only once)
let app: FirebaseApp
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
  console.log("✅ Firebase app initialized successfully")
} else {
  app = getApps()[0]
  console.log("✅ Firebase app already initialized")
}

// Initialize Firebase services
export const db: Firestore = getFirestore(app)
export const auth: Auth = getAuth(app)
export const storage: FirebaseStorage = getStorage(app)

// Initialize Analytics (only in browser environment)
export let analytics: Analytics | null = null
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app)
    console.log("✅ Firebase Analytics initialized")
  } catch (error) {
    console.warn("⚠️ Firebase Analytics initialization failed:", error)
  }
}

// Firebase is enabled with your configuration
export const firebaseEnabled = true

console.log("🔥 Firebase configuration loaded:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
})

export default app
