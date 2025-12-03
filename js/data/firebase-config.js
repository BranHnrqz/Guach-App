// Importamos las funciones necesarias de los SDKs de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyC8ou9Z9aT44ke0fNMfAAlXmR2ZnzqefAE",
  authDomain: "guachaapp.firebaseapp.com",
  projectId: "guachaapp",
  storageBucket: "guachaapp.firebasestorage.app",
  messagingSenderId: "105961279510",
  appId: "1:105961279510:web:bc792888983c1da0f7a537"
};
// ----------------------------------------------

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Exportamos las instancias para usarlas en otras capas
export { auth, db };
console.log("Firebase inicializado correctamente");