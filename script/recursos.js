import { supabase } from './utils.js';
export async function cargarRecursosPsicoeducativos() {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;
  if (!userId) return;

  const ahora = new Date();
  const zonaOffset = ahora.getTimezoneOffset() * 60000;
  const hoyLocal = new Date(ahora.getTime() - zonaOffset); // hora local en UTC
  const hoyStr = hoyLocal.toISOString().split('T')[0];

  const { data: emocionHoy } = await supabase
    .from('estadoEmocional')
    .select('emocion')
    .eq('userId', userId)
    .gte('created_at', `${hoyStr}T00:00:00`)
    .lte('created_at', `${hoyStr}T23:59:59`)
    .maybeSingle();

  const emocion = emocionHoy?.emocion;
  if (!emocion) {
    document.getElementById('contenedorArticulos').innerHTML = '<p class="text-muted">Registra tu emoción de hoy para ver recursos personalizados.</p>';
    return;
  }

  const { data: recursos, error } = await supabase
    .from('recursos')
    .select('*')
    .eq('emocion', emocion);

  if (error || !recursos || recursos.length === 0) {
    document.getElementById('contenedorArticulos').innerHTML = '<p class="text-muted">No hay recursos disponibles para esta emoción aún.</p>';
    return;
  }

  // Separar por tipo
  const articulos = recursos.filter(r => r.tipo === 'articulo');
  const videos = recursos.filter(r => r.tipo === 'video');
  const audios = recursos.filter(r => r.tipo === 'audio');
  const herramientas = recursos.filter(r => r.tipo === 'herramienta');

  // 1. Artículos
  const listaArticulos = document.getElementById('listaArticulos');
  listaArticulos.innerHTML = articulos.map(a => `
    <li class="list-group-item custom-list-item">
      <a href="${a.enlace}" target="_blank">${a.descripcion}</a>
    </li>
  `).join('');

  // 2. Videos y audios
  const contenedorVideos = document.getElementById('contenedorVideosAudios');
  contenedorVideos.innerHTML = videos.map(v => `
    <div class="ratio ratio-16x9 mb-3">
      <iframe src="${v.enlace}" title="${v.descripcion}" allowfullscreen></iframe>
    </div>
  `).join('') + audios.map(a => `
    <p>
      <a href="${a.enlace}" class="btn btn-sm btn-personalizado" target="_blank">${a.descripcion}</a>
    </p>
  `).join('');

  // 3. Herramientas
  const listaHerramientas = document.getElementById('contenedorHerramientas');
  listaHerramientas.innerHTML = `
    <ul class="custom-list-group">
      ${herramientas.map(h => `
        <li class="list-group-item custom-list-item">
          <a href="${h.enlace}" target="_blank">${h.descripcion}</a>
        </li>
      `).join('')}
    </ul>
  `;
  console.log("Artículos encontrados:", articulos);
console.log("Herramientas encontradas:", herramientas);
}
