import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyCiGDghs77Nwy5h3upjK-kzQTwR5fjO4k4",
    authDomain: "control-asistencia-e7499.firebaseapp.com",
    projectId: "control-asistencia-e7499",
    databaseURL: "https://control-asistencia-e7499-default-rtdb.firebaseio.com",
    storageBucket: "control-asistencia-e7499.firebasestorage.app",
    messagingSenderId: "839935230948",
    appId: "1:839935230948:web:a0d66d17a6ad8d87b8fdf1",
    measurementId: "G-26GT07D7D6"
};
                
// Initialize Firebase for client-side
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getDatabase(app);
