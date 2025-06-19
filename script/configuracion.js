import { notificarUsuario } from './notificacion.js';

document.addEventListener('DOMContentLoaded', () => {
  inicializarConfiguracion();
});

function inicializarConfiguracion() {
  manejarModoOscuro();
  manejarColorAcento();
  manejarSelectorIdioma();
  manejarNotificaciones();
  manejarEliminarCuenta();
}

/* ========== 1. Modo Claro/Oscuro ========== */
function manejarModoOscuro() {
  const toggle = document.getElementById('toggleModoOscuro');
  const modoOscuro = localStorage.getItem('modoOscuro') === 'true';

  document.body.classList.toggle('modo-oscuro', modoOscuro);
  if (toggle) toggle.checked = modoOscuro;

  toggle?.addEventListener('change', () => {
    const activo = toggle.checked;
    document.body.classList.toggle('modo-oscuro', activo);
    localStorage.setItem('modoOscuro', activo);
  });
}

/* ========== 2. Color de acento ========== */
function manejarColorAcento() {
  const selector = document.getElementById('selectorColorAcento');
  const colorGuardado = localStorage.getItem('colorAcento') || '#0d6efd';
  document.documentElement.style.setProperty('--bs-primary', colorGuardado);

  if (selector) selector.value = colorGuardado;

  selector?.addEventListener('change', () => {
    const color = selector.value;
    document.documentElement.style.setProperty('--bs-primary', color);
    localStorage.setItem('colorAcento', color);
  });
}

/* ========== 3. Selector de idioma (básico) ========== */
function manejarSelectorIdioma() {
  const selector = document.getElementById('selectorIdioma');
  const idioma = localStorage.getItem('idioma') || 'es';

  if (selector) selector.value = idioma;

  selector?.addEventListener('change', () => {
    const nuevoIdioma = selector.value;
    localStorage.setItem('idioma', nuevoIdioma);
    notificarUsuario('Idioma cambiado a: ' + (nuevoIdioma === 'es' ? 'Español' : 'English'));
  });
}

/* ========== 4. Notificaciones simuladas ========== */
function manejarNotificaciones() {
  const toggle = document.getElementById('toggleNotificaciones');
  const notificaciones = localStorage.getItem('notificaciones') === 'true';

  if (toggle) toggle.checked = notificaciones;

  toggle?.addEventListener('change', () => {
    const activo = toggle.checked;
    localStorage.setItem('notificaciones', activo);
    notificarUsuario(`Notificaciones ${activo ? 'activadas' : 'desactivadas'}`);
  });
}

/* ========== 5. Eliminar cuenta ========== */
function manejarEliminarCuenta() {
  const btnEliminar = document.getElementById('btnEliminarCuenta');

  btnEliminar?.addEventListener('click', () => {
    mostrarModalEliminarCuenta();
  });
}

function mostrarModalEliminarCuenta() {
  const modal = new bootstrap.Modal(document.getElementById('modalConfirmarEliminarCuenta'));
  modal.show();

  const confirmarBtn = document.getElementById('confirmarEliminarCuenta');

  const confirmarHandler = () => {
    localStorage.clear();
    modal.hide();
    notificarUsuario('Cuenta eliminada correctamente.');
    window.location.href = 'login.html';
  };

  confirmarBtn.addEventListener('click', confirmarHandler, { once: true });
}

