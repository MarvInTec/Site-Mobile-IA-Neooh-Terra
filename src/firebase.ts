import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    // Handle the case where the user closes the popup before completing sign-in
    if (error.code === 'auth/popup-closed-by-user') {
      console.log('User closed the login popup.');
    } else {
      console.error('Error signing in with Google:', error);
    }
  }
};
export const logout = () => signOut(auth);

export { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where };
