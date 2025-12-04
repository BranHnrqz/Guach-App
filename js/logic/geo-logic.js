import { db } from '../data/firebase-config.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. FÓRMULA MATEMÁTICA (Haversine) ---
function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
    if(!lat1 || !lon1 || !lat2 || !lon2) return 99999; 

    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
}

// --- 2. TRAER VENDEDORES (LÓGICA INVERSA) ---
export async function obtenerVendedoresCercanos(latCliente, lngCliente) {
    try {
        const latC = parseFloat(latCliente);
        const lngC = parseFloat(lngCliente);

        // Traemos TODOS los vendedores
        const q = query(collection(db, "usuarios"), where("rol", "==", "vendedor"));
        const querySnapshot = await getDocs(q);
        
        let lista = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            if (data.latitudNegocio && data.longitudNegocio) {
                const latV = parseFloat(data.latitudNegocio);
                const lngV = parseFloat(data.longitudNegocio);
                const dist = calcularDistanciaKm(latC, lngC, latV, lngV);

                // AQUI FILTRAMOS: Solo mostramos si está a menos de 50km (puedes bajarlo a 1.5 después)
                if(dist <= 1.5) { 
                    lista.push({
                        id: doc.id,
                        nombre: data.nombreNegocio || "Tienda",
                        foto: data.fotoNegocio,
                        lat: latV, // <--- AGREGAR ESTO
                        lng: lngV, // <--- AGREGAR ESTO
                        distanciaVal: dist,
                        distanciaTxt: dist < 1 ? `${(dist*1000).toFixed(0)} m` : `${dist.toFixed(1)} km`,
                        categorias: [] // Se llenará después
                    });
                }
            }
        });

        // Ordenar por cercanía
        return lista.sort((a, b) => a.distanciaVal - b.distanciaVal);

    } catch (error) {
        console.error("Error geo:", error);
        return [];
    }
}

// --- 3. TRAER PRODUCTOS ---
export async function obtenerProductosDeVendedores(listaVendedores) {
    if (!listaVendedores || listaVendedores.length === 0) return [];
    try {
        const ids = listaVendedores.slice(0, 10).map(v => v.id); // Max 10 por limitación de Firebase
        const q = query(collection(db, "productos"), where("idVendedor", "in", ids), where("activo", "==", true));
        const snap = await getDocs(q);
        const prods = [];
        snap.forEach(d => prods.push({id: d.id, ...d.data()}));
        return prods;
    } catch (error) { return []; }
}