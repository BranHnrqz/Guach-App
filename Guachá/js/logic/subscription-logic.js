import { db, auth } from '../data/firebase-config.js';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function procesarPagoSimulado(planSeleccionado) {
    const usuario = auth.currentUser;
    if (!usuario) throw new Error("No hay usuario autenticado");

    // Simulamos un retraso de red de 2 segundos para dar realismo
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Si la simulación pasa, actualizamos la Base de Datos
    const userRef = doc(db, "usuarios", usuario.uid);
    
    await updateDoc(userRef, {
        plan: planSeleccionado,
        estadoCuenta: 'activo', // Esto desbloqueará el dashboard
        fechaSuscripcion: new Date().toISOString()
    });

    return true;
}