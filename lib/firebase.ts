import { initializeApp, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore, collection, where, getDocs, query, limit, orderBy } from "firebase/firestore"
import type { DocumentSnapshot } from "firebase/firestore";
import { getStorage } from "firebase/storage"

import PurchaseDetails from "../models/PurchaseDetails"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Only initialize firebase app once
const createFirebaseApp = (config: typeof firebaseConfig) => {
  try {
    return getApp()
  } catch {
    return initializeApp(config)
  }
}

const firebaseApp = createFirebaseApp(firebaseConfig)

// Auth exports
export const auth = getAuth(firebaseApp)
// export const googleAuthProvider = new GoogleAuthProvider()

// Firestore exports
export const firestore = getFirestore(firebaseApp)

// Storage exports
export const storage = getStorage(firebaseApp)


// helper functions

/**
 * Gets a users/{uid} document with username
 * @param  {string} username
 */
 export const getUserWithUsername = async (username: string) => {

  const usersCollection = collection(firestore, 'users');
  const q = query(usersCollection, where('username', '==', username), limit(2))
  const userDoc = ( await getDocs(q) ).docs[0]
  
  return userDoc;
}

/**
 * Gets a usernames/{username} document with uid
 * @param  {string} uid
 */
 export const getUsernameWithUserId = async (uid: string) => {

  const usernamesCollection = collection(firestore, 'usernames');
  const q = query(usernamesCollection, where('uid', '==', uid), limit(2))
  const usernameDoc= ( await getDocs(q) ).docs[0]
  
  return usernameDoc;
}

/**
 * Converts a firestore document to JSON
 * @param  {DocumentSnapshot} doc
 */
export const purchaseToJSON = (doc: DocumentSnapshot) => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    date: new Date(data?.date.toMillis()) ,
  } as PurchaseDetails;
}