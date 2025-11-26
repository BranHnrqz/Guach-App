// js/logic/products-logic.js
import { db } from '../data/firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Función para subir un producto
export async function crearProducto(nombre, precio, categoria, imagen, idVendedor) {
    try {
        const docRef = await addDoc(collection(db, "productos"), {
            nombre: nombre,
            precio: parseFloat(precio),
            categoria: categoria,
            imagen: imagen, // Aquí irá la cadena Base64 larga
            idVendedor: idVendedor,
            stock: parseInt(stock),
            talla: talla,
            fecha: new Date().toISOString()
        });
        console.log("Producto guardado ID: ", docRef.id);
        return true;
    } catch (e) {
        console.error("Error al guardar producto: ", e);
        throw e;
    }
}