import { db } from '../data/firebase-config.js';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. CONFIGURACIÓN DE CATEGORÍAS ---
export const CATEGORIAS_SYSTEM = [
    // Ropa y Accesorios (Requieren Talla)
    { nombre: "Ropa", tipo: "talla_ropa" },
    { nombre: "Zapatos", tipo: "talla_numero" },
    { nombre: "Joyería", tipo: "normal" },
    { nombre: "Relojes", tipo: "normal" },
    
    // Tecnología
    { nombre: "Electrónica", tipo: "normal" },
    { nombre: "Computadoras y accesorios", tipo: "normal" },
    { nombre: "Celulares y accesorios", tipo: "normal" },
    { nombre: "Televisores y video", tipo: "normal" },
    { nombre: "Audio y sonido", tipo: "normal" },
    { nombre: "Videojuegos", tipo: "normal" },
    { nombre: "Software", tipo: "normal" },

    // Hogar
    { nombre: "Hogar y cocina", tipo: "normal" },
    { nombre: "Muebles", tipo: "medidas_mueble" }, // Podríamos pedir dimensiones
    { nombre: "Decoración del hogar", tipo: "normal" },
    { nombre: "Electrodomésticos", tipo: "normal" },
    { nombre: "Herramientas y mejoras del hogar", tipo: "normal" },
    { nombre: "Jardín y exteriores", tipo: "normal" },
    { nombre: "Iluminación", tipo: "normal" },

    // Cuidado Personal y Salud
    { nombre: "Belleza y cuidado personal", tipo: "volumen" }, // ML
    { nombre: "Cuidado del cabello", tipo: "volumen" },
    { nombre: "Cuidado de la piel", tipo: "volumen" },
    { nombre: "Salud y bienestar", tipo: "normal" },
    { nombre: "Suplementos alimenticios", tipo: "peso" }, // KG/Lbs

    // Entretenimiento y Otros
    { nombre: "Deportes y aire libre", tipo: "normal" },
    { nombre: "Fitness y ejercicio", tipo: "peso" },
    { nombre: "Juguetes y juegos", tipo: "normal" },
    { nombre: "Bebés", tipo: "normal" },
    { nombre: "Mascotas", tipo: "normal" },
    { nombre: "Libros", tipo: "normal" },
    { nombre: "Instrumentos musicales", tipo: "normal" },
    { nombre: "Arte y manualidades", tipo: "normal" },
    { nombre: "Oficina y papelería", tipo: "normal" },

    // Consumibles
    { nombre: "Alimentos", tipo: "peso" },
    { nombre: "Bebidas", tipo: "volumen" },
    { nombre: "Snacks", tipo: "peso" }
];

// --- 2. FUNCIONES CRUD ---

// A. CREAR PRODUCTO
export async function crearProducto(datos) {
    try {
        // datos debe incluir: nombre, precio, categoria, imagen, stock, idVendedor, detalles (talla/peso), descripcion
        const docRef = await addDoc(collection(db, "productos"), {
            ...datos,
            fechaCreacion: new Date().toISOString(),
            activo: true
        });
        console.log("Producto creado ID:", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error creando producto:", e);
        throw e;
    }
}

// B. LEER PRODUCTOS (Por Vendedor)
export async function obtenerProductosVendedor(idVendedor) {
    try {
        const q = query(
            collection(db, "productos"), 
            where("idVendedor", "==", idVendedor),
            where("activo", "==", true) // Solo traemos los activos (Soft Delete)
            // orderBy("fechaCreacion", "desc") // Requiere índice compuesto a veces, lo omitimos por seguridad inicial
        );
        
        const querySnapshot = await getDocs(q);
        const productos = [];
        querySnapshot.forEach((doc) => {
            productos.push({ id: doc.id, ...doc.data() });
        });
        // Ordenamos manual por fecha (más nuevo primero)
        return productos.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    } catch (e) {
        console.error("Error obteniendo productos:", e);
        throw e;
    }
}

// C. ACTUALIZAR PRODUCTO (NUEVO)
export async function actualizarProducto(idProducto, nuevosDatos) {
    try {
        const prodRef = doc(db, "productos", idProducto);
        await updateDoc(prodRef, nuevosDatos);
        return true;
    } catch (e) {
        throw e;
    }
}

// D. ELIMINAR PRODUCTO (Borrado Lógico)
export async function eliminarProducto(idProducto) {
    try {
        // No lo borramos de la DB para mantener historial de ventas, solo lo marcamos inactivo
        const prodRef = doc(db, "productos", idProducto);
        await updateDoc(prodRef, { activo: false });
        return true;
    } catch (e) {
        throw e;
    }
}

