import { supabase } from './utils.js';
import { notificarUsuario } from './notificacion.js';
/* ========== Test psicológico ========== */
export function manejarFormularioTest() {
  const formTest = document.getElementById('formTest');
  const resultadoDiv = document.getElementById('resultadoTest');
  const preguntasContainer = document.getElementById('preguntasTest');

  if (!formTest || !resultadoDiv || !preguntasContainer) return;

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

  // Generar preguntas dinámicamente
  preguntas.forEach((texto, i) => {
    const num = i + 1;
    const grupo = document.createElement('div');
    grupo.classList.add('mb-3');

    let opciones = '';
    for (let j = 1; j <= 5; j++) {
      opciones += `
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="pregunta${num}" id="p${num}_${j}" value="${j}" required>
          <label class="form-check-label" for="p${num}_${j}">${j}</label>
        </div>
      `;
    }

    grupo.innerHTML = `
      <label class="form-label"><strong>${num}.</strong> ${texto}</label><br/>
      ${opciones}
    `;
    preguntasContainer.appendChild(grupo);
  });

  // Evento al enviar
  formTest.addEventListener('submit', async e => {
    e.preventDefault();

    const respuestas = Array.from(formTest.querySelectorAll('input[type="radio"]:checked')).map(input => parseInt(input.value));
    if (respuestas.length !== 10) {
      notificarUsuario('Por favor responde todas las preguntas.');
      return;
    }

    const puntaje = respuestas.reduce((acc, val) => acc + val, 0);

    // Obtener usuario autenticado
    const { data: sessionData, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !sessionData.user) {
      notificarUsuario('No estás autenticado. Inicia sesión.');
      return;
    }

    // Insertar en tabla test
    const { error: insertError } = await supabase.from('test').insert([{
      puntaje,
      fecha: new Date().toISOString() // o puedes dejarlo NULL si en DB lo manejas
    }]);

    if (insertError) {
      console.error('❌ Error al guardar el test:', insertError.message);
      notificarUsuario('Error al guardar el resultado del test.');
      return;
    }

    // ✅ Limpiar el formulario
    formTest.reset();

    resultadoDiv.innerHTML = `
      <div class="alert alert-info mt-4" id="mensajeTest">
        <h5 class="mb-2">Resultado del Test</h5>
        <p>Puntaje total: <strong>${puntaje}</strong> de 50</p>
      </div>
    `;
    setTimeout(() => {
    const mensaje = document.getElementById('mensajeTest');
    if (mensaje) mensaje.remove();
    }, 4000); // Ocultar después de 4 segundos
  });
}
