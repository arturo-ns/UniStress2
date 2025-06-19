import { supabase } from './utils.js';
import { notificarUsuario } from './notificacion.js';

/* ========== 1. Cargar datos del usuario desde Supabase ========== */
export async function cargarDatosUsuario() {
  // 1. Obtener sesión actual
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  const user = sessionData?.session?.user;
  if (sessionError || !user) {
    console.warn('⚠️ No hay sesión activa');
    window.location.href = 'login.html';
    return;
  }

  const userId = user.id;

  // 2. Obtener datos del perfil del usuario
  const { data: perfil, error: perfilError } = await supabase
    .from('userProfile')
    .select('*')
    .eq('userId', userId)
    .single();

  if (perfilError || !perfil) {
    console.warn('⚠️ No se encontró perfil del usuario');
    return;
  }

  // 3. Insertar datos en el DOM
  document.getElementById('nombreUsuarioTexto').textContent = `${perfil.nombre ?? ''} ${perfil.apellido ?? ''}`;
  document.getElementById('tipoCuenta').textContent = 'Gratuito';
  document.getElementById('correoUsuario').textContent = user.email;
  document.getElementById('fechaNacimientoUsuario').textContent = perfil.fechaNacimiento
    ? new Date(perfil.fechaNacimiento).toLocaleDateString('es-ES')
    : 'No registrada';
  document.getElementById('generoUsuario').textContent = perfil.genero ?? 'No especificado';
  document.getElementById('carreraUsuarioTexto').textContent = perfil.carrera ?? 'No especificada';
  document.getElementById('universidadUsuarioTexto').textContent = perfil.universidad ?? 'No especificada';

  // Mostrar foto de perfil si existe
  if (perfil.fotoPerfil) {
    const img = document.getElementById('foto-perfil');
    if (img) img.src = perfil.fotoPerfil;

    const preview = document.getElementById('previewFotoPerfil');
    if (preview) preview.src = perfil.fotoPerfil;
  }

}

/* ========== 2. TermometroEmocional ========== */

function convertirEmocionEnNumero(emocion) {
  switch (emocion.toLowerCase()) {
    case 'feliz': return 5;
    case 'neutral': return 3;
    case 'ansioso': return 2;
    case 'triste': return 1;
    case 'enojado': return 0;
    default: return 3;
  }
}

export async function Termometro() {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;
  if (!userId) return;

  const { data, error } = await supabase
    .from('estadoEmocional')
    .select('emocion')
    .eq('userId', userId);

  if (error || !data || data.length === 0) return;

  const valores = data.map(entry => convertirEmocionEnNumero(entry.emocion));
  const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
  const porcentaje = (promedio / 5) * 100; // 0 a 100%

  // Rellenar el termómetro
  anime({
    targets: '#rellenoTermometro',
    height: `${porcentaje}%`,
    easing: 'easeInOutCubic',
    duration: 1200
  });

  // Mostrar valor
  document.getElementById('valorTermometro').textContent = promedio.toFixed(1);
}


/* ========== 3. Tutorial ========== */
export async function iniciarTourIntroJS() {
  const tourSecuencias = [
    {
      seccion: 'perfil',
      pasos: [
        {
          element: '#perfil',
          intro: '👤 Este es tu perfil. Aquí podrás ver tu información personal y editarla fácilmente.',
        },
        {
          element: '[data-bs-target="#modalFotoPerfil"]',
          intro: '🖼️ ¡Haz clic aquí para subir una imagen que te represente! Esta será tu foto de perfil visible.',
        },
        {
          element: '[data-bs-target="#modalEditarPerfil"]',
          intro: '✏️ Si deseas cambiar tus datos como nombre o carrera, puedes hacerlo aquí.',
        }
      ],
    },
    {
      seccion: 'chatbot',
      pasos: [
        {
          element: '#btnAbrirChatbot',
          intro: '💬 Este botón abre UniBot, tu asistente emocional disponible 24/7.',
        },
        {
          element: '#chatbotVentana',
          intro: '🧘 Aquí puedes conversar con UniBot si necesitas apoyo, motivación o simplemente desahogarte.',
        }
      ],
    },
    {
      seccion: 'test',
      pasos: [
        {
          element: '#test',
          intro: '🧠 Este es el test de estrés académico. Te ayudará a identificar tu nivel de estrés actual.',
        },
        {
          element: '#preguntasTest',
          intro: '📋 Aquí verás 10 preguntas. Responde del 1 (nada de acuerdo) al 5 (totalmente de acuerdo).',
        },
        {
          element: '#formTest button[type="submit"]',
          intro: '✅ Una vez respondido todo, haz clic aquí para calcular tu resultado.',
        },
        {
          element: '#resultadoTest',
          intro: '📈 Aquí se mostrará tu puntaje total y podrás reflexionar sobre tu estado actual.',
        }
      ],
    },
    {
      seccion: 'estadoEmocional',
      pasos: [
        {
          element: '#estadoEmocional h2',
          intro: '📊 Aquí puedes llevar un registro diario de tu estado emocional.',
        },
        {
          element: '#formRegistroEmocion .emotion-option:nth-child(1)', // primer emoji
          intro: '😊 Elige cómo te sientes hoy. Puedes seleccionar una emoción con un solo clic.',
        },
        {
          element: '#notaEmocion',
          intro: '📝 También puedes escribir algo opcional sobre tu día.',
        },
        {
          element: '#formRegistroEmocion button[type="submit"]',
          intro: '💾 Guarda tu emoción para llevar un seguimiento a lo largo del tiempo.',
        },
        {
          element: '#graficoEmociones',
          intro: '📈 Aquí verás un gráfico con el historial de tus emociones. Te ayuda a reflexionar sobre tu evolución.',
        },
        {
          element: '#recomendacionesEmocionales',
          intro: '💡 Recibe recomendaciones personalizadas basadas en cómo te has sentido.',
        }
      ],
    },
    {
      seccion: 'recursosPsicoeducativos',
      pasos: [
        {
          element: '#recursosPsicoeducativos h2',
          intro: '📚 En esta sección encontrarás recursos útiles para manejar tu estrés y mejorar tu bienestar emocional.',
        },
        {
          element: '#contenedorArticulos',
          intro: '📖 Explora artículos sobre autocuidado, técnicas de relajación y manejo del estrés académico.',
        },
        {
          element: '#contenedorVideosAudios',
          intro: '🎧 Aquí aparecerán videos y audios recomendados para ayudarte a relajarte o aprender nuevas técnicas.',
        },
        {
          element: '#contenedorHerramientas',
          intro: '🛠️ Accede a herramientas prácticas como meditaciones guiadas, ejercicios de respiración y más.',
        }
      ],
    },
    {
      seccion: 'comunidad',
      pasos: [
        {
          element: '#comunidad h2',
          intro: '🤝 Bienvenido a la Comunidad UniStress, un espacio creado para compartir, apoyar y crecer juntos.',
        },
        {
          element: '#listaGruposApoyo',
          intro: '👥 Únete a grupos de apoyo temáticos para compartir experiencias y recibir orientación emocional.',
        },
        {
          element: '#desafioSemanal',
          intro: '📝 Participa en el desafío emocional semanal para fortalecer tu bienestar personal.',
        },
        {
          element: '#fraseMotivacional',
          intro: '💡 Aquí verás frases motivacionales que se actualizan para inspirarte cada día.',
        },
        {
          element: '#formEscuchaAnonima',
          intro: '🔒 Este es un espacio seguro para expresar tus emociones de forma anónima. Nadie te juzga.',
        }
      ],
    },
    {
      seccion: 'notificaciones',
      pasos: [
        {
          element: '#notificaciones h2',
          intro: '🔔 Aquí encontrarás todas tus notificaciones importantes dentro de UniStress.',
        },
        {
          element: '#listaNotificaciones',
          intro: '📬 Este centro se actualizará con mensajes relevantes sobre tu progreso, recomendaciones y más.',
        }
      ],
    },
    {
      seccion: 'configuracion',
      pasos: [
        {
          element: '#configuracion h2',
          intro: '⚙️ Aquí puedes personalizar tu experiencia dentro de UniStress.',
        },
        {
          element: '#toggleModoOscuro',
          intro: '🌙 Activa el modo oscuro para cuidar tu vista en ambientes con poca luz.',
        },
        {
          element: '#selectorColorAcento',
          intro: '🎨 Personaliza el color principal de tu interfaz.',
        },
        {
          element: '#selectorIdioma',
          intro: '🌍 Selecciona el idioma que prefieras para navegar la app.',
        },
        {
          element: '#toggleNotificaciones',
          intro: '🔔 Activa o desactiva las notificaciones importantes del sistema.',
        },
        {
          element: '#btnEliminarCuenta',
          intro: '❌ Desde aquí puedes eliminar tu cuenta si lo deseas. ¡Pero preferimos que te quedes!',
        }
      ],
    }
  ];

  let pasoActual = 0;

  const ejecutarPaso = () => {
    const { seccion, pasos } = tourSecuencias[pasoActual];

    if (seccion === 'chatbot') {
    // Aseguramos que el chatbot se muestre
    const ventana = document.getElementById('chatbotVentana');
    const boton = document.getElementById('btnAbrirChatbot');
    if (ventana && boton) {
      ventana.classList.add('mostrar'); 
    }
  } else {
    document.querySelector(`[data-seccion="${seccion}"]`)?.click();
  }

    setTimeout(() => {
      introJs()
        .setOptions({
          steps: pasos,
          showProgress: true,
          overlayOpacity: 0.5,
          hidePrev: true,
          scrollToElement: true,
          showStepNumbers: false,
          tooltipClass: 'customIntroTooltip',
          nextLabel: 'Siguiente',
          doneLabel: pasoActual === tourSecuencias.length - 1 ? 'Finalizar' : 'Continuar',
        })
        .oncomplete(() => {
          if (seccion === 'chatbot') {
            document.getElementById('chatbotVentana')?.classList.remove('mostrar');
          }
          pasoActual++;
          if (pasoActual < tourSecuencias.length) {
            ejecutarPaso();
          } else {
            document.querySelector('[data-seccion="perfil"]')?.click();
            marcarTutorialComoVisto();
          }
        })
        .onexit(() => {
          if (seccion === 'chatbot') {
            document.getElementById('chatbotVentana')?.classList.remove('mostrar');
          } else {
            marcarTutorialComoVisto();
          }
        })
        .start();
    }, 500);
  };

  ejecutarPaso();
}


async function marcarTutorialComoVisto() {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user.id;

  if (!userId) return;

  await supabase
    .from('userProfile')
    .update({ tutorial: true })
    .eq('userId', userId);
}


/* ========== 4. Foto de perfil ========== */
export function manejarFotoPerfil() {
  const input = document.getElementById('inputFotoPerfil');
  const preview = document.getElementById('previewFotoPerfil');
  const guardar = document.getElementById('guardarFotoPerfil');
  const foto = document.getElementById('foto-perfil');

  if (!input || !preview || !guardar || !foto) return;

  // Al cargar, obtener la foto actual del perfil
  cargarFotoPerfil();

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = e => preview.src = e.target.result;
      reader.readAsDataURL(file);
    } else {
      notificarUsuario('Archivo muy grande o inválido. Máximo 2MB.');
      input.value = '';
    }
  });

  guardar.addEventListener('click', async () => {
    const file = input.files[0];
    if (!file) return notificarUsuario('Selecciona una imagen válida');

    const { data: session, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !session.user) {
      notificarUsuario('No se pudo obtener el usuario actual');
      return;
    }

    const userId = session.user.id;
    const filePath = `perfil/${userId}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Error al subir imagen:', uploadError.message);
      return notificarUsuario('Error al subir imagen');
    }

    const { data: publicURLData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const timestamp = Date.now();
    const fotoURL = `${publicURLData.publicUrl}?t=${timestamp}`;

    const { error: updateError } = await supabase
      .from('userProfile')
      .update({ fotoPerfil: fotoURL })
      .eq('userId', userId);

    if (updateError) {
      console.error('❌ Error al guardar la URL en el perfil:', updateError.message);
      return notificarUsuario('Error al guardar la foto');
    }

    foto.src = fotoURL;
    preview.src = fotoURL;

    const modal = bootstrap.Modal.getInstance(document.getElementById('modalFotoPerfil'));
    if (modal) modal.hide();
  });
}

async function cargarFotoPerfil() {
  const { data: session, error } = await supabase.auth.getUser();
  if (error || !session.user) return;

  const { data, error: perfilError } = await supabase
    .from('userProfile')
    .select('fotoPerfil')
    .eq('userId', session.user.id)
    .single();

  if (!perfilError && data?.fotoPerfil) {
    document.getElementById('foto-perfil').src = data.fotoPerfil;
    document.getElementById('previewFotoPerfil').src = data.fotoPerfil;
  }
}


/* ========== 5. Edición de perfil ========== */
export function manejarEdicionPerfil() {
  const form = document.getElementById('formEditarPerfil');
  const nombre = document.getElementById('nombreUsuarioInput');
  const apellido = document.getElementById('apellidoUsuarioInput');
  const correo = document.getElementById('correoUsuarioInput');
  const carrera = document.getElementById('carreraUsuario');
  const universidad = document.getElementById('universidadUsuario');
  const nombreTexto = document.getElementById('nombreUsuarioTexto');

  const modal = document.getElementById('modalEditarPerfil');
  if (!form || !modal) return;

  // Cargar datos del usuario cuando se abre el modal
  modal.addEventListener('show.bs.modal', async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !sessionData.user) return;

    const userId = sessionData.user.id;

    const { data: perfil, error: perfilError } = await supabase
      .from('userProfile')
      .select('*')
      .eq('userId', userId)
      .single();

    if (perfilError || !perfil) return;

    // Rellena formulario con datos actuales
    nombre.value = perfil.nombre || '';
    apellido.value = perfil.apellido || '';
    correo.value = sessionData.user.email || '';
    carrera.value = perfil.carrera || '';
    universidad.value = perfil.universidad || '';
    nombreTexto.textContent = `${perfil.nombre} ${perfil.apellido}`;
  });

  // Guarda cambios
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const { data: sessionData } = await supabase.auth.getUser();
    const userId = sessionData.user.id;

    const { error: updateError } = await supabase
      .from('userProfile')
      .update({
        nombre: nombre.value.trim(),
        apellido: apellido.value.trim(),
        carrera: carrera.value.trim(),
        universidad: universidad.value.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('userId', userId);

    if (updateError) {
      notificarUsuario('Error al actualizar perfil');
      return;
    }

    // Refresca texto mostrado
    nombreTexto.textContent = `${nombre.value.trim()} ${apellido.value.trim()}`;
    document.getElementById('correoUsuario').textContent = correo.value.trim();
    document.getElementById('carreraUsuarioTexto').textContent = carrera.value.trim();
    document.getElementById('universidadUsuarioTexto').textContent = universidad.value.trim();

    // Cerrar modal
    const bsModal = bootstrap.Modal.getInstance(modal);
    if (bsModal) bsModal.hide();
  });
}

/* ========== 6. Cerrar sesión ========== */
export function manejarCerrarSesion() {
  const btn = document.getElementById('btnCerrarSesion');
  const confirmarBtn = document.getElementById('confirmarCerrarSesion');
  const modal = document.getElementById('modalConfirmarCerrarSesion');

  if (!btn || !confirmarBtn || !modal) return;

  const bootstrapModal = new bootstrap.Modal(modal);

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    bootstrapModal.show();
  });

  confirmarBtn.addEventListener('click', async () => {
    // 🔐 Cierra sesión en Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      notificarUsuario('⚠️ Error al cerrar sesión: ' + error.message);
      return;
    }

    // 🔁 Redirige al login
    window.location.href = 'login.html';
  }, { once: true });
}

