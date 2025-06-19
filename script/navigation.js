/* ========== Manejo de secciones ========== */
export function manejarCambioSeccion() {
  const botones = document.querySelectorAll('.btn-seccion');
  const secciones = document.querySelectorAll('.seccionDashboard');

  botones.forEach(boton => {
    boton.addEventListener('click', e => {
      e.preventDefault();

      const seccionId = boton.getAttribute('data-seccion');
      localStorage.setItem('ultimaSeccionActiva', seccionId); // ✅ Guardar

      // Ocultar todas las secciones
      secciones.forEach(sec => sec.classList.add('d-none'));

      // Mostrar la sección correspondiente
      const activa = document.getElementById(seccionId);
      if (activa) activa.classList.remove('d-none');

      // Marcar enlace activo
      botones.forEach(b => b.classList.remove('active'));
      boton.classList.add('active');
    });
  });

  // Mostrar última sección activa o "perfil" por defecto
  const seccionGuardada = localStorage.getItem('ultimaSeccionActiva') || 'perfil';

  // Ocultar todas las secciones
  secciones.forEach(sec => sec.classList.add('d-none'));

  // Mostrar la sección guardada
  const activa = document.getElementById(seccionGuardada);
  if (activa) activa.classList.remove('d-none');

  // Marcar botón correspondiente como activo
  botones.forEach(b => {
    const id = b.getAttribute('data-seccion');
    if (id === seccionGuardada) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
}

