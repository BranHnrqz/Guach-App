// js/app.js - ARCHIVO COMPLETO

// 1. IMPORTS (Todas las dependencias necesarias)
import { registroConGoogle } from './logic/auth-logic.js';
import { crearProducto } from './logic/products-logic.js';
import { procesarPagoSimulado } from './logic/subscription-logic.js'; 
import { mostrarPantallaDashboard } from './views/ui-manager.js';
import { auth } from './data/firebase-config.js';

console.log("App iniciada y cargada correctamente...");

// 2. ESPERAR A QUE EL HTML CARGUE
document.addEventListener('DOMContentLoaded', () => {

    // ---------------------------------------------------------
    // A. LÓGICA DE REGISTRO / LOGIN (GOOGLE)
    // ---------------------------------------------------------
    const btnGoogle = document.getElementById('btn-google');
    if (btnGoogle) {
        btnGoogle.addEventListener('click', async () => {
            const rolSelect = document.getElementById('reg-tipo-google').value;
            try {
                // 1. Iniciar sesión
                const resultado = await registroConGoogle(rolSelect);
                console.log("Login exitoso, usuario UID:", auth.currentUser.uid);

                // 2. Intentar ir al Dashboard (o Planes si no ha pagado)
                await mostrarPantallaDashboard(auth.currentUser.uid);

            } catch (error) {
                console.error("Error completo:", error);
                alert("Hubo un error al iniciar sesión: " + error.message);
            }
        });
    }

    // --- NUEVO: PREVISUALIZACIÓN DE IMAGEN ---
    const inputFile = document.getElementById('prod-file');
    const previewImg = document.getElementById('preview-img');

    if(inputFile) {
        inputFile.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImg.src = e.target.result; // Muestra la foto en el cuadrito
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // ---------------------------------------------------------
    // B. LÓGICA DE SUBIR PRODUCTO (Solo Vendedores)
    // ---------------------------------------------------------
    const formProducto = document.getElementById('form-producto');
    if(formProducto) {
        formProducto.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            // Obtenemos los valores
            const nombre = document.getElementById('prod-nombre').value;
            const precio = document.getElementById('prod-precio').value;
            const stock = document.getElementById('prod-stock').value; // Nuevo
            const categoria = document.getElementById('prod-cat').value;
            const talla = document.getElementById('div-talla').classList.contains('d-none') ? 'N/A' : document.getElementById('prod-talla').value;
            
            // Para la imagen, usaremos el Base64 que generó la previsualización
            // (En una app real se sube a Firebase Storage, pero esto sirve por ahora)
            const imagenBase64 = document.getElementById('preview-img').src; 

            const usuarioActual = auth.currentUser;

            if (!usuarioActual) return;

            try {
                // Modificamos la función crearProducto para aceptar un objeto con todo
                // Nota: Tienes que actualizar products-logic.js para recibir estos datos extra
                await crearProducto(nombre, precio, categoria, imagenBase64, usuarioActual.uid, stock, talla);
                
                alert("¡Producto publicado!");
                formProducto.reset();
                document.getElementById('preview-img').src = 'img/logo.png'; // Reset imagen
                bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide();

            } catch (error) {
                alert("Error: " + error.message);
            }
        });
    }

    // --- CONDICIONAL DE TALLA ---
    // (Esto debe ser global o agregado al window para que el onchange del HTML lo vea)
    window.verificarTalla = function() {
        const cat = document.getElementById('prod-cat').value;
        const divTalla = document.getElementById('div-talla');
        
        // Si es Ropa o Zapatos, mostramos talla
        if(cat === 'ropa' || cat === 'zapatos') {
            divTalla.classList.remove('d-none');
        } else {
            divTalla.classList.add('d-none');
        }
    };
    if(document.getElementById('prod-cat')) window.verificarTalla();

    // ---------------------------------------------------------
    // C. LÓGICA DE PAGOS (SUSCRIPCIÓN)
    // ---------------------------------------------------------
    const formPago = document.getElementById('form-pago');
    if(formPago) {
        formPago.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const tarjeta = document.getElementById('card-number').value;
            if(tarjeta.length < 16) {
                alert("Número de tarjeta inválido (min 16 dígitos)");
                return;
            }

            const btnSubmit = formPago.querySelector('button[type="submit"]');
            const textoOriginal = btnSubmit.innerHTML;
            
            try {
                // Efecto visual de carga
                btnSubmit.disabled = true;
                btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';

                const plan = document.getElementById('selected-plan-id').value;
                
                // Procesar pago simulado
                await procesarPagoSimulado(plan);

                alert("¡Pago exitoso! Bienvenido a Guachá Premium.");

                // Ocultar checkout
                document.getElementById('view-checkout').classList.add('d-none');
                document.getElementById('view-checkout').classList.remove('d-block'); // Asegurar ocultado

                // Mostrar Dashboard (Ahora sí dejará pasar)
                await mostrarPantallaDashboard(auth.currentUser.uid);

            } catch (error) {
                alert("Error en el pago: " + error.message);
            } finally {
                // Restaurar botón pase lo que pase
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = textoOriginal;
            }
        });
    }

    // D. FORMATO VISUAL DE TARJETA (Espacios cada 4 números)
    const inputCard = document.getElementById('card-number');
    if(inputCard){
        inputCard.addEventListener('input', function (e) {
            e.target.value = e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim();
        });
    }

});