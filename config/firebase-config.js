// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Configuración específica de tu Realtime Database
const firebaseConfig = {
  apiKey: "AIzaSyAIx8aghavPNUrU0BX2mZfv827PhZMORfQ",
  authDomain: "zapatostatiana1000.firebaseapp.com",
  projectId: "zapatostatiana1000",
  storageBucket: "zapatostatiana1000.firebasestorage.app",
  messagingSenderId: "667433459290",
  appId: "1:667433459290:web:34ac834b65677d14280263",
  measurementId: "G-QR0174TMH3"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { database, auth};