import { supabase } from './utils.js';
import { notificarUsuario } from './notificacion.js';

let graficoEmocionalInstance = null;
export function manejarRegistroEmocional() {
  const form = document.getElementById('formRegistroEmocion');
  const notaInput = document.getElementById('notaEmocion');

  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const emocionSeleccionada = form.querySelector('input[name="emocion"]:checked');
    if (!emocionSeleccionada) {
      notificarUsuario('Por favor selecciona una emoción.');
      return;
    }

    const emocion = emocionSeleccionada.value;
    const comentario = notaInput.value.trim();
    const hoy = new Date().toISOString().split('T')[0];

    // Obtener el usuario actual
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user.id;

    if (sessionError || !userId) {
      notificarUsuario('No estás autenticado.');
      return;
    }

    // Verificar si ya hay un registro hoy
    const { data: existente } = await supabase
      .from('estadoEmocional')
      .select('id')
      .eq('userId', userId)
      .filter('created_at', 'eq', hoy)
      .maybeSingle();

    if (existente) {
      notificarUsuario('Ya registraste una emoción hoy.');
      return;
    }

    // Insertar nuevo registro
    const { error: insertError } = await supabase.from('estadoEmocional').insert([
      {
        userId,
        emocion,
        comentario
      }
    ]);

    if (insertError) {
      console.error('❌ Error al registrar emoción:', insertError.message);
      notificarUsuario('Hubo un problema al registrar la emoción.');
      return;
    }

    notificarUsuario('¡Emoción registrada con éxito!');
    form.reset();

    await GraficoEmociones();
    await mostrarRecomendaciones();
  });
}

export async function GraficoEmociones() {
  const ctx = document.getElementById('graficoEmociones')?.getContext('2d');
  if (!ctx) return;

  const { data: session } = await supabase.auth.getUser();
  const userId = session?.user?.id;
  if (!userId) return;

  const { data, error } = await supabase
    .from('estadoEmocional')
    .select('emocion, created_at')
    .eq('userId', userId)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) {
    console.warn('⚠️ No hay datos emocionales para graficar.');
    return;
  }

  const fechas = [];
  const valores = [];

  data.forEach(entry => {
    fechas.push(new Date(entry.created_at).toLocaleDateString('es-ES'));
    valores.push(convertirEmocionEnNumero(entry.emocion));
  });

  // Destruye el gráfico anterior si ya existe
  if (graficoEmocionalInstance) {
    graficoEmocionalInstance.destroy();
  }

  // Crea un nuevo gráfico
  graficoEmocionalInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: fechas,
      datasets: [{
        label: 'Evolución Emocional',
        data: valores,
        fill: true,
        borderColor: '#36a2eb',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: context => traducirNumeroAEmocion(context.raw)
          }
        }
      },
      scales: {
        y: {
          min: -1,
          max: 6,
          ticks: {
            stepSize: 1,
            callback: valor => {
              const mapa = {
                0: '😠 Enojado',
                1: '😢 Triste',
                2: '😨 Ansioso',
                3: '😐 Neutral',
                5: '😊 Feliz'
              };
              return mapa[valor] || '';
            }
          },
          title: {
            display: true,
            text: 'Emoción',
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        },
        x: {
          offset: true,
          title: {
            display: true,
            text: 'Fecha',
            padding: 10,
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          ticks: {
            maxRotation: 45,
            minRotation: 30
          }
        }
      }
    }
  });
}


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

function traducirNumeroAEmocion(valor) {
  const mapa = {
    5: '😊 Feliz',
    3: '😐 Neutral',
    2: '😨 Ansioso',
    1: '😢 Triste',
    0: '😠 Enojado'
  };
  return mapa[valor] || valor;
}

export async function mostrarRecomendaciones() {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;
  if (!userId) return;

  const hoy = new Date().toISOString().split('T')[0];
  const contenedor = document.getElementById('recomendacionesEmocionales');
  if (!contenedor) return;

  // Buscar la emoción registrada hoy
  const { data: emocionData, error: emocionError } = await supabase
    .from('estadoEmocional')
    .select('emocion')
    .eq('userId', userId)
    .gte('created_at', `${hoy}T00:00:00Z`)
    .lte('created_at', `${hoy}T23:59:59Z`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (emocionError || !emocionData?.emocion) {
    contenedor.innerHTML = `<p class="texto-secundario">Registra tu emoción de hoy para ver una recomendación personalizada.</p>`;
    return;
  }

  const emocion = emocionData.emocion;

  // Buscar una recomendación para esa emoción
  const { data: recomendaciones, error: recomendacionError } = await supabase
    .from('recomendaciones')
    .select('recomendacion')
    .eq('emocion', emocion);

  if (recomendacionError || !recomendaciones || recomendaciones.length === 0) {
    contenedor.innerHTML = `<p class="texto-secundario">No hay recomendaciones disponibles para la emoción "${emocion}".</p>`;
    return;
  }

  // Elegir una recomendación aleatoria
  const aleatoria = recomendaciones[Math.floor(Math.random() * recomendaciones.length)].recomendacion;

  contenedor.innerHTML = `
    <div class="alert alert-primary d-flex align-items-center" role="alert">
      💡 <div class="ms-3">${aleatoria}</div>
    </div>
  `;
}

