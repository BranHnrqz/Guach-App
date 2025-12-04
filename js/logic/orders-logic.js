import { db } from '../data/firebase-config.js';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, runTransaction } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. CREAR PEDIDO CON CONTROL DE STOCK (CORREGIDO) ---
export async function crearPedido(datosPedido) {
    try {
        const resultado = await runTransaction(db, async (transaction) => {
            
            // PASO 1: LECTURAS (READS)
            // Primero obtenemos todos los datos actuales de los productos en el carrito.
            // Guardamos las referencias y los snapshots para usarlos después.
            const lecturas = [];
            
            for (const item of datosPedido.items) {
                const prodRef = doc(db, "productos", item.id);
                const prodDoc = await transaction.get(prodRef);
                
                if (!prodDoc.exists()) {
                    throw "El producto " + item.nombre + " ya no existe.";
                }
                
                lecturas.push({
                    ref: prodRef,
                    doc: prodDoc,
                    itemSolicitado: item
                });
            }

            // PASO 2: ESCRITURAS (WRITES)
            // Ahora que ya leímos todo, verificamos stock y preparamos las actualizaciones.
            // Si llegamos aquí, es seguro escribir.
            
            for (const lectura of lecturas) {
                const stockActual = lectura.doc.data().stock;
                const cantidadSolicitada = lectura.itemSolicitado.cantidad;

                if (stockActual < cantidadSolicitada) {
                    throw "Stock insuficiente para: " + lectura.itemSolicitado.nombre + " (Quedan " + stockActual + ")";
                }

                const nuevoStock = stockActual - cantidadSolicitada;
                transaction.update(lectura.ref, { stock: nuevoStock });
            }

            // Crear el pedido
            const pedidoRef = doc(collection(db, "pedidos"));
            const pedidoFinal = {
                ...datosPedido,
                fecha: new Date().toISOString(),
                leido: false
            };

            transaction.set(pedidoRef, pedidoFinal);
            
            return pedidoRef.id;
        });

        console.log("Pedido y Stock procesados correctamente. ID:", resultado);
        return resultado;

    } catch (e) {
        console.error("Error transacción pedido:", e);
        throw e; 
    }
}

// --- 2. LEER PEDIDOS (VENDEDOR) ---
export async function obtenerPedidosVendedor(idVendedor) {
    try {
        const q = query(
            collection(db, "pedidos"),
            where("idVendedor", "==", idVendedor)
        );

        const querySnapshot = await getDocs(q);
        const pedidos = [];

        querySnapshot.forEach((doc) => {
            pedidos.push({ id: doc.id, ...doc.data() });
        });

        return pedidos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    } catch (e) {
        console.error("Error obteniendo pedidos:", e);
        return [];
    }
}

// --- 3. ACTUALIZAR ESTADO (VENDEDOR) ---
export async function actualizarEstadoPedido(idPedido, nuevoEstado) {
    try {
        const pedidoRef = doc(db, "pedidos", idPedido);
        await updateDoc(pedidoRef, {
            estado: nuevoEstado
        });
        return true;
    } catch (e) {
        console.error("Error actualizando estado:", e);
        throw e;
    }
}

// --- 4. LEER PEDIDOS CLIENTE ---
export async function obtenerPedidosCliente(idCliente) {
    try {
        const q = query(collection(db, "pedidos"), where("idCliente", "==", idCliente));
        const snap = await getDocs(q);
        // Ordenamos del más reciente al más antiguo
        return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
    } catch (e) { return []; }
}