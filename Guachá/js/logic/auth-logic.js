// js/logic/auth-logic.js
import { auth, db } from '../data/firebase-config.js';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const provider = new GoogleAuthProvider();

// --- FUNCIÓN 1: LOGIN CON GOOGLE ---
export async function registroConGoogle(rolSeleccionado) {
    try {
        // 1. Abrir Popup de Google
        const resultado = await signInWithPopup(auth, provider);
        const usuario = resultado.user;

        // 2. Verificar si el usuario ya existe en Firestore
        // (Para no sobrescribir sus datos si ya se había registrado antes)
        const docRef = doc(db, "usuarios", usuario.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            // --> ES NUEVO: Lo guardamos en la base de datos
            await setDoc(docRef, {
                uid: usuario.uid,
                nombre: usuario.displayName,
                email: usuario.email,
                foto: usuario.photoURL,
                rol: rolSeleccionado, // 'cliente' o 'vendedor'
                fechaRegistro: new Date().toISOString()
            });
            console.log(`Usuario nuevo creado como: ${rolSeleccionado}`);
            return { status: "nuevo", rol: rolSeleccionado, nombre: usuario.displayName };
        } else {
            // --> YA EXISTÍA: Solo recuperamos su rol real
            const datosExistentes = docSnap.data();
            console.log("Usuario existente detectado.");
            return { status: "existente", rol: datosExistentes.rol, nombre: datosExistentes.nombre };
        }

    } catch (error) {
        console.error("Error en Google Auth:", error);
        throw error; // Lanzamos el error para que lo maneje la vista/controlador
    }
}

// --- FUNCIÓN 2: REGISTRO CON EMAIL (Opcional por ahora) ---
export async function registroConEmail(nombre, email, password, rol) {
    // ... (Podemos dejar esto pendiente o usarlo si quieres el formulario manual también)
}