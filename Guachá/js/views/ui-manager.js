// Este archivo solo se encarga de MOSTRAR u OCULTAR pantallas (Vistas)

// js/views/ui-manager.js

// 1. Importar la Base de Datos
import { db } from '../data/firebase-config.js';

// 2. Importar las funciones de Firestore (AQUÍ FALTABA 'doc')
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

function mostrarRegistro() {
    document.getElementById('view-landing').classList.remove('d-flex');
    document.getElementById('view-landing').classList.add('d-none');
    
    document.getElementById('view-register').classList.remove('d-none');
    document.getElementById('view-register').classList.add('d-block');
}

function volverInicio() {
    document.getElementById('view-register').classList.remove('d-block');
    document.getElementById('view-register').classList.add('d-none');

    document.getElementById('view-landing').classList.remove('d-none');
    document.getElementById('view-landing').classList.add('d-flex');
}

function mostrarLogin() {
    alert("Primero vamos a configurar el Registro en Firebase, luego hacemos el Login :)");
}

// ... (imports anteriores) ...

async function mostrarPantallaDashboard(userUid) {
    // 1. Ocultar TODAS las vistas previas
    document.getElementById('view-landing').classList.remove('d-flex');
    document.getElementById('view-landing').classList.add('d-none');
    document.getElementById('view-register').classList.add('d-none');
    document.getElementById('view-plans').classList.add('d-none'); // Asegurar que planes se oculta
    document.getElementById('view-checkout').classList.add('d-none');

    // Consultar datos del usuario
    const docRef = doc(db, "usuarios", userUid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();

        // 2. Lógica de Redirección según ROL
        if (data.rol === 'vendedor') {
            
            // Verificación de pago
            if (data.estadoCuenta !== 'activo') {
                irAlPago('basico', 5.00); // O mostrar planes
                document.getElementById('view-plans').classList.remove('d-none');
                document.getElementById('view-plans').classList.add('d-block');
                return;
            }

            // --- MOSTRAR PANEL VENDEDOR ---
            document.getElementById('view-seller-dashboard').classList.remove('d-none');
            document.getElementById('view-seller-dashboard').classList.add('d-block');
            
            // Llenar datos vendedor
            document.getElementById('seller-name').innerText = data.nombre;
            if(data.foto) document.getElementById('seller-photo').src = data.foto;
            
        } else {
            // --- MOSTRAR TIENDA CLIENTE ---
            document.getElementById('view-client-dashboard').classList.remove('d-none');
            document.getElementById('view-client-dashboard').classList.add('d-block');

            // Llenar datos cliente
            document.getElementById('client-name').innerText = data.nombre;
            if(data.foto) document.getElementById('client-photo').src = data.foto;
        }
    }
}

window.mostrarRegistro = mostrarRegistro;
window.volverInicio = volverInicio;
window.mostrarLogin = mostrarLogin;

// --- FUNCIONES DE SUSCRIPCIÓN ---

function irAlPago(plan, precio) {
    // 1. Ocultar planes
    document.getElementById('view-plans').classList.add('d-none');
    document.getElementById('view-plans').classList.remove('d-block');

    // 2. Configurar checkout con los datos del plan
    document.getElementById('checkout-plan-name').innerText = 'Plan ' + plan.toUpperCase();
    document.getElementById('checkout-amount').innerText = '$' + precio.toFixed(2);
    document.getElementById('selected-plan-id').value = plan;

    // 3. Mostrar checkout
    const checkout = document.getElementById('view-checkout');
    checkout.classList.remove('d-none');
    checkout.classList.add('d-block');
}

function volverAPlanes() {
    document.getElementById('view-checkout').classList.add('d-none');
    document.getElementById('view-plans').classList.remove('d-none');
    document.getElementById('view-plans').classList.add('d-block');
}

// Hacemos públicas las funciones para el onclick del HTML
window.irAlPago = irAlPago;
window.volverAPlanes = volverAPlanes;

// Exportamos para que app.js lo pueda leer
export { mostrarPantallaDashboard };