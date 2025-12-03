import { auth, db } from '../data/firebase-config.js';
// AGREGAMOS 'signOut' AQUI ABAJO 👇
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const provider = new GoogleAuthProvider();

// 1. LOGIN EMAIL (Función para iniciar sesión tradicional)
export async function loginConEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        throw error;
    }
}

// 2. REGISTRO EMAIL (Guardado de todos los datos personales)
export async function registroConEmail(datos) {
    const { email, password, nombre, apellido, fechaNacimiento, dui, rol } = datos;
    try {
        // Se crea el usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Se guarda el perfil completo en Firestore
        await setDoc(doc(db, "usuarios", user.uid), {
            uid: user.uid,
            nombre: `${nombre} ${apellido}`,
            nombrePila: nombre,
            apellido: apellido,
            email: email,
            fechaNacimiento: fechaNacimiento,
            dui: dui,
            rol: rol,
            foto: null, // Foto vacía al inicio para registro por correo
            fechaRegistro: new Date().toISOString()
        });
        return user;
    } catch (error) {
        // Si el email está duplicado, Firebase lanzará el error aquí
        throw error;
    }
}

// 3. GOOGLE (Lógica inteligente para saber si es Login o Registro)
export async function authConGoogle(modoIntentado) { 
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);

        // ESCENARIO A: El usuario YA EXISTE en la base de datos
        if (docSnap.exists()) {
            if (modoIntentado === 'register') {
                // Si el usuario presiona "Registrarse con Google" pero ya existe: Rechazar
                throw new Error("DUPLICADO_GOOGLE"); 
            }
            // Si está en modo 'login' y existe: Permitir
            return { status: 'existente', uid: user.uid };
        } 
        
        // ESCENARIO B: El usuario NO EXISTE en la base de datos
        else {
            if (modoIntentado === 'login') {
                // Si el usuario presiona "Entrar con Google" pero no existe: Rechazar
                await user.delete(); // Borramos el usuario auth temporal para limpiar
                throw new Error("NO_REGISTRADO"); 
            }
            // Si intenta registrarse y no existe, es correcto -> Devolver estado nuevo para pedir rol
            return { status: 'nuevo', user: user };
        }

    } catch (error) {
        throw error;
    }
}

// 4. COMPLETAR PERFIL GOOGLE (Guardar el rol elegido después del modal)
export async function completarRegistroGoogle(uid, rol) {
    const user = auth.currentUser;
    if(!user || user.uid !== uid) throw new Error("Sesión inválida");

    await setDoc(doc(db, "usuarios", uid), {
        uid: uid,
        nombre: user.displayName,
        email: user.email,
        foto: user.photoURL,
        rol: rol,
        fechaRegistro: new Date().toISOString(),
        metodo: 'google'
    });
    return true;
}

// 5. CERRAR SESIÓN (CORREGIDO)
export async function cerrarSesionUsuario() {
    try {
        await signOut(auth); // Ahora sí funcionará porque lo importamos arriba
        return true;
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        throw error;
    }
}