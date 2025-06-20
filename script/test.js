import { supabase } from './utils.js';
import { notificarUsuario } from './notificacion.js';

/* ========== Test psicológico ========== */
export function formularioTest() {
  const form = document.getElementById('formTest');
  const resultado = document.getElementById('resultadoTest');
  const contenedorPreguntas = document.getElementById('preguntasTest');

  if (!form || !resultado || !contenedorPreguntas) return;

  const preguntas = [
    "Me siento abrumado por la cantidad de tareas académicas.",
    "Me cuesta concentrarme en mis estudios debido al estrés.",
    "Siento que no tengo suficiente tiempo para cumplir con mis obligaciones académicas.",
    "Me siento ansioso(a) antes de los exámenes o entregas.",
    "Tengo dificultades para dormir por preocupaciones académicas.",
    "Evito estudiar porque me siento saturado(a).",
    "Me siento frustrado(a) con mi rendimiento académico.",
    "He pensado en abandonar alguna materia por estrés.",
    "Siento que pierdo el control cuando tengo muchas tareas.",
    "Me siento agotado(a) emocionalmente por la universidad."
  ];

  generarPreguntas(contenedorPreguntas, preguntas);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const respuestas = obtenerRespuestas(form, preguntas.length);
    if (!respuestas) {
      notificarUsuario('Por favor responde todas las preguntas.');
      return;
    }

    const puntaje = respuestas.reduce((acc, val) => acc + val, 0);

    const { data: session, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !session.user) {
      notificarUsuario('No estás autenticado. Inicia sesión.');
      return;
    }

    const { error: insertError } = await supabase.from('test').insert([{
      puntaje,
      fecha: new Date().toISOString()
    }]);

    if (insertError) {
      console.error('❌ Error al guardar el test:', insertError.message);
      notificarUsuario('Error al guardar el resultado del test.');
      return;
    }

    form.reset();
    mostrarResultado(resultado, puntaje);
  });
}

function generarPreguntas(contenedor, preguntas) {
  preguntas.forEach((texto, index) => {
    const num = index + 1;
    const grupo = document.createElement('div');
    grupo.classList.add('mb-3');

    const opciones = Array.from({ length: 5 }, (_, i) => {
      const valor = i + 1;
      return `
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="pregunta${num}" id="p${num}_${valor}" value="${valor}" required>
          <label class="form-check-label" for="p${num}_${valor}">${valor}</label>
        </div>
      `;
    }).join('');

    grupo.innerHTML = `
      <label class="form-label"><strong>${num}.</strong> ${texto}</label><br/>
      ${opciones}
    `;
    contenedor.appendChild(grupo);
  });
}

function obtenerRespuestas(formulario, totalPreguntas) {
  const seleccionadas = Array.from(formulario.querySelectorAll('input[type="radio"]:checked'));
  if (seleccionadas.length !== totalPreguntas) return null;
  return seleccionadas.map(input => parseInt(input.value));
}

function mostrarResultado(contenedor, puntaje) {
  contenedor.innerHTML = `
    <div class="alert alert-info mt-4" id="mensajeTest">
      <h5 class="mb-2">Resultado del Test</h5>
      <p>Puntaje total: <strong>${puntaje}</strong> de 50</p>
    </div>
  `;

  setTimeout(() => {
    document.getElementById('mensajeTest')?.remove();
  }, 4000);
}
