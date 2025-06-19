import { supabase } from './utils.js';
const frasesMotivacionales = [
  "No tienes que hacerlo todo hoy. Respira, prioriza y avanza a tu ritmo.",
  "Cada pequeño paso cuenta, sigue avanzando.",
  "Tu bienestar es tan importante como tus logros.",
  "No estás solo/a. Hablar es un acto de valentía.",
  "El autocuidado no es egoísmo, es una necesidad.",
  "Eres más fuerte de lo que piensas."
];

export function mostrarFraseMotivacional() {
  const indiceAleatorio = Math.floor(Math.random() * frasesMotivacionales.length);
  const fraseElemento = document.getElementById("textoFrase");
  if (fraseElemento) {
    fraseElemento.textContent = `"${frasesMotivacionales[indiceAleatorio]}"`;
  }
}

// Escucha Anónima: Guardar y mostrar mensajes

const formEscucha = document.getElementById("formEscuchaAnonima");
const listaMensajes = document.getElementById("listaMensajesAnonimos");

// Obtener mensajes existentes
function obtenerMensajesAnonimos() {
  return JSON.parse(localStorage.getItem("mensajesAnonimos")) || [];
}

// Guardar mensajes en localStorage
function guardarMensajesAnonimos(mensajes) {
  localStorage.setItem("mensajesAnonimos", JSON.stringify(mensajes));
}

// Mostrar los mensajes en la lista
export function renderizarMensajesAnonimos() {
  const mensajes = obtenerMensajesAnonimos();
  listaMensajes.innerHTML = ""; // Limpiar lista

  if (mensajes.length === 0) {
    listaMensajes.innerHTML = '<li class="list-group-item text-muted">Aún no hay mensajes.</li>';
    return;
  }

  mensajes.slice(-5).reverse().forEach(mensaje => {
    const li = document.createElement("li");
    li.classList.add("list-group-item");
    li.textContent = mensaje;
    listaMensajes.appendChild(li);
  });
}

// Evento de envío del formulario
formEscucha.addEventListener("submit", (e) => {
  e.preventDefault();
  const texto = document.getElementById("mensajeAnonimo").value.trim();
  if (texto) {
    const mensajes = obtenerMensajesAnonimos();
    mensajes.push(texto);
    guardarMensajesAnonimos(mensajes);
    document.getElementById("mensajeAnonimo").value = "";
    renderizarMensajesAnonimos();
  }
});


export async function mostrarDesafioDiario() {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;
  if (!userId) return;

  const hoy = new Date().toISOString().split('T')[0];
  const contenedor = document.getElementById('desafioSemanal');
  if (!contenedor) return;

  // Verificar si ya completó el desafío hoy
  const { data: completado } = await supabase
    .from('desafioDiario')
    .select('id')
    .eq('userId', userId)
    .eq('fecha', hoy)
    .maybeSingle(); 

  if (completado) {
    contenedor.innerHTML = `
      <div class="alert alert-success">✅ Ya completaste tu desafío de hoy. ¡Bien hecho!</div>
    `;
    return;
  }

  // Obtener todos los desafíos disponibles
  const { data: desafios, error } = await supabase.from('desafios').select('*');
  if (error || !desafios || desafios.length === 0) {
    contenedor.innerHTML = '<p>No hay desafíos disponibles por el momento.</p>';
    return;
  }

  // Elegir un desafío aleatorio
  const aleatorio = desafios[Math.floor(Math.random() * desafios.length)];

  contenedor.innerHTML = `
    <div class="alert alert-info d-flex align-items-center" role="alert">
      📝 <div class="ms-3"><strong>Desafío de hoy:</strong> ${aleatorio.desafio}</div>
    </div>
    <div class="form-check mt-3">
      <input type="checkbox" class="form-check-input" id="desafioCompletado">
      <label class="form-check-label" for="desafioCompletado">✔️ He completado el desafío</label>
    </div>
  `;

  document.getElementById('desafioCompletado').addEventListener('change', async (e) => {
    if (e.target.checked) {
      const { error: insertError } = await supabase.from('desafioDiario').insert([
        {
          userId,
          desafioId: aleatorio.id,
          fecha: hoy
        }
      ]);
      if (!insertError) mostrarDesafioDiario();
    }
  });
}