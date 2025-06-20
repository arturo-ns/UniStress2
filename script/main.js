import { cargarDatosUsuario,Termometro,iniciarTourIntroJS, manejarFotoPerfil, manejarEdicionPerfil, manejarCerrarSesion } from './usuario.js';
import { cambioSeccion } from './navigation.js';
import { manejarFormularioTest } from './test.js';
import { manejarRegistroEmocional, GraficoEmociones, mostrarRecomendaciones } from './emociones.js';
import { cargarRecursosPsicoeducativos } from './recursos.js';
import { mostrarFraseMotivacional, mostrarDesafioDiario,renderizarMensajesAnonimos } from './comunidad.js';
import { mostrarNotificaciones } from './notificacion.js';
import {  } from './configuracion.js';
import { supabase } from './utils.js';
import { inicializarChatbot } from './chatbot.js';
document.addEventListener('DOMContentLoaded', async () => {
  cargarDatosUsuario();
  Termometro();
  cambioSeccion();
  manejarFotoPerfil();
  manejarEdicionPerfil();
  manejarCerrarSesion();
  manejarFormularioTest();
  manejarRegistroEmocional();
  GraficoEmociones();
  mostrarRecomendaciones();
  cargarRecursosPsicoeducativos();
  mostrarDesafioDiario();
  mostrarFraseMotivacional();
  renderizarMensajesAnonimos();
  mostrarNotificaciones();
  inicializarChatbot();

  // 🔁 Verifica si debe mostrar el tutorial
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user.id;
  const { data: perfil } = await supabase
    .from('userProfile')
    .select('tutorial')
    .eq('userId', userId)
    .single();

  if (perfil && perfil.tutorial === false) {
      iniciarTourIntroJS(); // ⬅️ Iniciar tour si no lo ha visto
    }
});
