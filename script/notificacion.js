// Notificaciones simuladas
const listaNotificaciones = document.getElementById("listaNotificaciones");

// Datos de ejemplo
const notificacionesEjemplo = [
  "📌 Recuerda registrar tu emoción del día.",
  "🧠 Nuevo artículo disponible: Cómo reducir la ansiedad en época de exámenes.",
  "💡 Sugerencia: Prueba una meditación guiada hoy.",
  "🎯 Has completado 3 días consecutivos de registro emocional. ¡Bien hecho!"
];

// Mostrar notificaciones
export function mostrarNotificaciones() {
  if (!listaNotificaciones) return;

  listaNotificaciones.innerHTML = "";

  if (notificacionesEjemplo.length === 0) {
    listaNotificaciones.innerHTML = '<li class="list-group-item">No tienes nuevas notificaciones.</li>';
    return;
  }

  notificacionesEjemplo.forEach(nota => {
    const li = document.createElement("li");
    li.classList.add("list-group-item", "custom-list-item");
    li.textContent = nota;
    listaNotificaciones.appendChild(li);
  });
}

export function notificarUsuario(mensaje, tipo = 'info') {
  const colores = {
    info: "#0d6efd",        // Azul informativo
    exito: "#198754",       // Verde éxito
    error: "#dc3545",       // Rojo error
    advertencia: "#ffc107"  // Amarillo advertencia
  };

  Toastify({
    text: mensaje,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: colores[tipo] || "#0d6efd",
    close: true,
    stopOnFocus: true
  }).showToast();
}