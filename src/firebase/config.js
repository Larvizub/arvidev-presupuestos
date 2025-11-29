import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Configuración con fallback a valores estáticos cuando las variables de entorno no estén disponibles
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCT7MXC-Xhz-FRsn7C9xAWdHtm6OzmTro8",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "arvidev-presupuestos.firebaseapp.com",
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://arvidev-presupuestos-default-rtdb.firebaseio.com",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "arvidev-presupuestos",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "arvidev-presupuestos.firebasestorage.app",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1020022959131",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1020022959131:web:2e8ccef40151766ffa9cbe",
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-B5H3ZR254K"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };
