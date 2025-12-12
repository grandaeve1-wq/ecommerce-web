import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBgn1VsiHqKcRfZApqoDrISZzXgyvXcy1w",
  authDomain: "base-de-datos-comentarios.firebaseapp.com",
  projectId: "base-de-datos-comentarios",
  storageBucket: "base-de-datos-comentarios.firebasestorage.app",
  messagingSenderId: "956000809556",
  appId: "1:956000809556:web:ae245765ee9adc9e8cf3c1",
  measurementId: "G-ZDBESG2J48"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const productId = window.location.pathname.split('/').pop().replace('.html', '');

document.addEventListener("DOMContentLoaded", async function() {
  await cargarComentarios();
  
  const formComentario = document.getElementById("formComentario");
  
  if (formComentario) {
    formComentario.addEventListener("submit", async function(e) {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value.trim();
      const calificacion = document.getElementById("calificacion").value;
      const comentario = document.getElementById("comentario").value.trim();
      const foto = document.getElementById("foto").files[0];

      if (!nombre || !comentario) {
        alert("Por favor completa todos los campos requeridos");
        return;
      }

      try {
        let fotoBase64 = null;
        if (foto) {
          fotoBase64 = await convertirFotoABase64(foto);
        }

        await addDoc(collection(db, "comentarios"), {
          productId: productId,
          nombre: nombre,
          calificacion: parseInt(calificacion),
          comentario: comentario,
          foto: fotoBase64,
          fecha: new Date(),
          timestamp: new Date().getTime()
        });

        formComentario.reset();

        await cargarComentarios();

        alert("¡Comentario agregado exitosamente!");
      } catch (error) {
        console.error("Error al guardar comentario:", error);
        alert("Error al guardar el comentario");
      }
    });
  }
});

async function cargarComentarios() {
  try {
    const listaOpiniones = document.getElementById("lista-opiniones");
    
    if (!listaOpiniones) {
      console.error("No se encontró el elemento lista-opiniones");
      return;
    }

    listaOpiniones.innerHTML = "";

    const q = query(
      collection(db, "comentarios"),
      where("productId", "==", productId)
    );

    console.log("Buscando comentarios para producto:", productId);

    const querySnapshot = await getDocs(q);
    console.log("Comentarios encontrados:", querySnapshot.size);

    const comentarios = [];
    querySnapshot.forEach((doc) => {
      comentarios.push(doc.data());
    });
    
    comentarios.sort((a, b) => b.timestamp - a.timestamp);

    comentarios.forEach((datos) => {
      console.log("Comentario cargado:", datos);
      
      const nuevaOpinion = document.createElement("div");
      nuevaOpinion.classList.add("opinion");

      const estrellas = "⭐".repeat(datos.calificacion);

      let contenido = `<p><strong>Cliente:</strong> ${datos.nombre}</p>
<p><strong>Calificación:</strong> ${estrellas}</p>
<p>${datos.comentario}</p>`;

      nuevaOpinion.innerHTML = contenido;

      if (datos.foto) {
        const img = document.createElement("img");
        img.src = datos.foto;
        img.alt = "Foto de " + datos.nombre;
        nuevaOpinion.appendChild(img);
      }

      listaOpiniones.appendChild(nuevaOpinion);
    });
  } catch (error) {
    console.error("Error al cargar comentarios:", error);
  }
}

function convertirFotoABase64(foto) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(foto);
  });
}
