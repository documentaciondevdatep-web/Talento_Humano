import {
  obtenerColaboradores,
  obtenerColaboradoresActivos
} from '../shared/js/colaboradoresStorage.js';
import { departamentos, areas } from '../shared/data/catalogos.js';

const $ = s => document.querySelector(s);

let currentSelectedColabId = null;
let currentCanalFilter = '';
let currentSelectedFecha = null;

const escape = val => String(val ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const norm = s => String(s ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const label = (list, id, key) => list.find(x => x[key] === id)?.nombre ?? '—';
const name = p => [p.nombres, p.apellidoPaterno, p.apellidoMaterno].filter(Boolean).join(' ');

function getVisibleIdentifier(person) {
  const firstName = String(person.nombres ?? '').trim().split(/\s+/)[0] ?? '';
  const paternalSurname = String(person.apellidoPaterno ?? '').trim();
  const base = [firstName, paternalSurname].filter(Boolean).join('_');
  const code = String(person.codigoColaborador ?? '').trim();
  return `${base}.${/^\d+$/.test(code) ? code : 'Código pendiente'}`;
}

function notice(message, isError = false) {
  const el = $('#status');
  if (!el) return;
  el.textContent = message;
  el.className = isError ? 'error' : 'success';
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Cálculo de métricas de voz por colaborador
function calcularMetricasVoz(colaborador) {
  const code = String(colaborador.codigoColaborador || '1000');
  const num = parseInt(code, 10) || 1000;
  const hash = Math.abs(hashCode(colaborador.idColaborador || code));

  // Datos base calibrados con los screenshots
  let conexionesHoras = 63;
  let conexionesMeta = 50;
  let dentroRangoPct = 100;
  let tiempoHabladoHoras = 16;
  let tiempoHabladoMeta = 36;
  let canalFrecuente = 'Documentación';
  let rankingPos = 17;

  if (code === '1101') { // Alex Rios Luna
    conexionesHoras = 72;
    dentroRangoPct = 100;
    tiempoHabladoHoras = 28;
    rankingPos = 4;
    canalFrecuente = 'Desarrollo';
  } else if (code === '1102') { // Sam Vega Sol
    conexionesHoras = 68;
    dentroRangoPct = 98;
    tiempoHabladoHoras = 25;
    rankingPos = 7;
    canalFrecuente = 'Capacitación';
  } else if (code === '1104' || code === '1026') { // Dani Cruz / Luis
    conexionesHoras = 48;
    dentroRangoPct = 85;
    tiempoHabladoHoras = 11;
    rankingPos = 34;
    canalFrecuente = 'General';
  } else {
    // Variación según código
    conexionesHoras = 50 + (hash % 25);
    dentroRangoPct = 90 + (hash % 11);
    tiempoHabladoHoras = 12 + (hash % 24);
    rankingPos = (hash % 35) + 1;
    canalFrecuente = (hash % 2 === 0) ? 'Documentación' : 'General';
  }

  const conexionesPct = ((conexionesHoras / conexionesMeta) * 100).toFixed(1);
  const tiempoHabladoPct = ((tiempoHabladoHoras / tiempoHabladoMeta) * 100).toFixed(1);
  const promedioHabladoHoras = (tiempoHabladoHoras / 12).toFixed(1);
  const promedioHabladoMeta = 3;

  let nivel = 'BAJO';
  let badgeCls = 'red';
  let nivelLabel = 'Bajo (-40%)';

  if (Number(tiempoHabladoPct) >= 70) {
    nivel = 'OPTIMO';
    badgeCls = 'green';
    nivelLabel = 'Óptimo (+70%)';
  } else if (Number(tiempoHabladoPct) >= 40) {
    nivel = 'MODERADO';
    badgeCls = 'yellow';
    nivelLabel = 'Moderado (40% - 70%)';
  }

  return {
    conexionesHoras,
    conexionesMeta,
    conexionesPct,
    dentroRangoPct,
    tiempoHabladoHoras,
    tiempoHabladoMeta,
    tiempoHabladoPct,
    promedioHabladoHoras,
    promedioHabladoMeta,
    canalFrecuente,
    rankingPos,
    nivel,
    badgeCls,
    nivelLabel
  };
}

// Generador de registros diarios de noviembre 2026 para el colaborador
function generarRegistrosDiariosVoz(colaborador) {
  // Exactamente alineado a las capturas proporcionadas
  return [
    { fecha: '2026-11-17', promHablado: 3.54, pct: 117.95, pillCls: 'cyan', nivel: 'optimo' },
    { fecha: '2026-11-16', promHablado: 3.16, pct: 105.27, pillCls: 'cyan', nivel: 'optimo' },
    { fecha: '2026-11-13', promHablado: 2.01, pct: 66.84, pillCls: 'light-cyan', nivel: 'moderado' },
    { fecha: '2026-11-12', promHablado: 0.63, pct: 20.98, pillCls: 'red', nivel: 'bajo' },
    { fecha: '2026-11-11', promHablado: 2.80, pct: 93.33, pillCls: 'cyan', nivel: 'optimo' },
    { fecha: '2026-11-10', promHablado: 0.90, pct: 30.00, pillCls: 'red', nivel: 'bajo' },
    { fecha: '2026-11-09', promHablado: 0.50, pct: 16.67, pillCls: 'red', nivel: 'bajo' },
    { fecha: '2026-11-06', promHablado: 0.70, pct: 23.33, pillCls: 'red', nivel: 'bajo' },
    { fecha: '2026-11-05', promHablado: 0.85, pct: 28.33, pillCls: 'red', nivel: 'bajo' },
    { fecha: '2026-11-04', promHablado: 0.40, pct: 13.33, pillCls: 'red', nivel: 'bajo' },
    { fecha: '2026-11-03', promHablado: 0.60, pct: 20.00, pillCls: 'red', nivel: 'bajo' },
    { fecha: '2026-11-02', promHablado: 0.75, pct: 25.00, pillCls: 'red', nivel: 'bajo' }
  ];
}

// Generador de movimientos de canal de voz
function generarMovimientosCanal(fechaFiltro = null) {
  const base = [
    { fecha: '2026-11-17', microOn: 1030, canal: 'Documentación', canalCls: 'cyan', ingreso: '11:31:42', salida: '13:04:28' },
    { fecha: '2026-11-17', microOn: 0, canal: 'General', canalCls: 'navy', ingreso: '13:04:28', salida: '13:04:39' },
    { fecha: '2026-11-16', microOn: 1030, canal: 'Documentación', canalCls: 'cyan', ingreso: '11:34:02', salida: '13:00:47' },
    { fecha: '2026-11-16', microOn: 0, canal: 'General', canalCls: 'navy', ingreso: '13:00:47', salida: '13:01:00' },
    { fecha: '2026-11-13', microOn: 720, canal: 'Documentación', canalCls: 'cyan', ingreso: '10:15:00', salida: '12:20:10' },
    { fecha: '2026-11-13', microOn: 0, canal: 'General', canalCls: 'navy', ingreso: '12:20:10', salida: '13:00:00' },
    { fecha: '2026-11-12', microOn: 220, canal: 'General', canalCls: 'navy', ingreso: '09:00:00', salida: '11:15:30' },
    { fecha: '2026-11-11', microOn: 950, canal: 'Documentación', canalCls: 'cyan', ingreso: '10:00:15', salida: '12:45:00' }
  ];

  if (fechaFiltro) {
    const filtrados = base.filter(m => m.fecha === fechaFiltro);
    return filtrados.length > 0 ? filtrados : base;
  }
  return base;
}

function renderCalendarioVoz(registrosDiarios) {
  const mapLogs = {};
  registrosDiarios.forEach(r => { mapLogs[r.fecha] = r; });

  let cellsHtml = '';
  // 6 celdas vacías antes del Domingo 1
  for (let i = 0; i < 6; i++) {
    cellsHtml += '<div class="cal-day-cell empty"></div>';
  }

  // Días 1 al 30 de Noviembre 2026
  for (let d = 1; d <= 30; d++) {
    const dayOfWeek = (6 + (d - 1)) % 7; // 0=Lun .. 6=Dom
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const dateStr = `2026-11-${String(d).padStart(2, '0')}`;

    let cls = 'future';
    if (isWeekend) {
      cls = 'weekend';
    } else if (d === 17) {
      cls = 'today optimo'; // Hoy (17) con borde azul y nivel óptimo
    } else if (d < 17) {
      const log = mapLogs[dateStr];
      if (log) {
        cls = log.nivel; // 'optimo', 'moderado', 'bajo'
      } else {
        cls = 'bajo';
      }
    }

    cellsHtml += `<div class="cal-day-cell ${cls}" title="${dateStr}">${d}</div>`;
  }

  return cellsHtml;
}

function populateDepartments() {
  const opts = '<option value="">Todos los departamentos</option>' +
    departamentos.map(d => `<option value="${escape(d.idDepartamento)}">${escape(d.nombre)}</option>`).join('');
  $('#department').innerHTML = opts;
}

function populateDashColabDropdown(selectedId) {
  const select = $('#dashColabSelect');
  if (!select) return;
  const activos = obtenerColaboradoresActivos();
  select.innerHTML = activos.map(p => {
    const idVis = getVisibleIdentifier(p);
    return `<option value="${escape(p.idColaborador)}"${p.idColaborador === selectedId ? ' selected' : ''}>${escape(name(p))} (${escape(idVis)})</option>`;
  }).join('');
}

function renderGeneralKPIs(colaboradores) {
  let countOptimo = 0;
  let countBajo = 0;
  let sumaHoras = 0;

  colaboradores.forEach(c => {
    const m = calcularMetricasVoz(c);
    if (m.nivel === 'OPTIMO') countOptimo++;
    if (m.nivel === 'BAJO') countBajo++;
    sumaHoras += Number(m.promedioHabladoHoras);
  });

  const prom = colaboradores.length > 0 ? (sumaHoras / colaboradores.length).toFixed(1) : '1.8';

  $('#kpiTotalColabs').textContent = colaboradores.length;
  $('#kpiPromedioGrupal').textContent = `${prom}h / día`;
  $('#kpiNivelOptimo').textContent = countOptimo;
  $('#kpiNivelBajo').textContent = countBajo;
}

function render() {
  const colaboradores = obtenerColaboradoresActivos();
  renderGeneralKPIs(colaboradores);

  const query = norm($('#search').value);
  const dep = $('#department').value;
  const nivel = $('#nivelFilter').value;
  const tbody = $('#rows');

  const filtered = colaboradores.filter(c => {
    const matchQuery = norm(`${name(c)} ${c.codigoColaborador ?? ''} ${c.numeroDocumento ?? ''}`).includes(query);
    const matchDep = !dep || c.idDepartamento === dep;
    const m = calcularMetricasVoz(c);
    const matchNivel = !nivel || m.nivel === nivel;
    return matchQuery && matchDep && matchNivel;
  });

  tbody.innerHTML = filtered.map(c => {
    const m = calcularMetricasVoz(c);
    const idVis = getVisibleIdentifier(c);

    return `
      <tr class="tr-clickable" data-ver-detalle="${escape(c.idColaborador)}" title="Ver Dashboard de Tiempo Hablado de ${escape(name(c))}">
        <td>
          <strong>${escape(name(c))}</strong>
          <small>${escape(idVis)} · ${escape(c.tipoColaborador)}</small>
        </td>
        <td>
          ${escape(label(areas, c.idArea, 'idArea'))}
          <small>${escape(label(departamentos, c.idDepartamento, 'idDepartamento'))}</small>
        </td>
        <td>
          <div class="voice-progress-container">
            <strong>${m.conexionesHoras}h / ${m.conexionesMeta}h</strong>
            <div class="voice-progress-bg">
              <div class="voice-progress-fill" style="width: ${Math.min(100, m.conexionesPct)}%"></div>
            </div>
            <small>${m.conexionesPct}% de meta (${m.dentroRangoPct}% en rango)</small>
          </div>
        </td>
        <td>
          <strong style="font-size:14px;color:var(--navy)">${m.tiempoHabladoHoras}h / ${m.tiempoHabladoMeta}h</strong>
          <small>${m.tiempoHabladoPct}% hablado mensual</small>
        </td>
        <td>
          <strong>${m.promedioHabladoHoras}h / ${m.promedioHabladoMeta}h</strong>
          <small>promedio por jornada</small>
        </td>
        <td>
          <span class="badge ${m.badgeCls}">
            ${escape(m.nivelLabel)}
          </span>
        </td>
        <td>
          <span class="badge ${m.canalFrecuente === 'Documentación' ? 'cyan' : 'navy'}">
            ${escape(m.canalFrecuente)}
          </span>
        </td>
        <td>
          <button class="subtle" type="button" data-ver-detalle="${escape(c.idColaborador)}">
            Ver detalle / Dashboard
          </button>
        </td>
      </tr>
    `;
  }).join('');

  $('#empty').hidden = filtered.length > 0;
  $('#count').textContent = `${filtered.length} colaboradores monitoreados`;
}

function abrirModalDetalle(idColaborador) {
  currentSelectedColabId = idColaborador;
  currentCanalFilter = '';
  currentSelectedFecha = null;

  const colabs = obtenerColaboradores();
  const person = colabs.find(c => c.idColaborador === idColaborador);
  if (!person) throw new Error('Colaborador no encontrado.');

  populateDashColabDropdown(idColaborador);

  const m = calcularMetricasVoz(person);
  const idVis = getVisibleIdentifier(person);
  const registrosDiarios = generarRegistrosDiariosVoz(person);
  const movimientos = generarMovimientosCanal(currentSelectedFecha);

  const calHtml = renderCalendarioVoz(registrosDiarios);

  const dailyRowsHtml = registrosDiarios.map(r => `
    <tr>
      <td>${escape(r.fecha)}</td>
      <td><span class="voice-pill ${r.pillCls}">${r.promHablado.toFixed(2)}</span></td>
      <td>${r.pct.toFixed(2)}</td>
      <td>
        <button type="button" class="btn-icon-eye" data-ver-fecha="${escape(r.fecha)}" title="Ver registro de movimiento del ${escape(r.fecha)}">
          👁
        </button>
      </td>
    </tr>
  `).join('');

  const movimientosRowsHtml = movimientos
    .filter(mov => !currentCanalFilter || mov.canal === currentCanalFilter)
    .map(mov => `
      <tr>
        <td><strong>${mov.microOn}</strong></td>
        <td><span class="channel-pill ${mov.canalCls}">${escape(mov.canal)}</span></td>
        <td>${escape(mov.ingreso)}</td>
        <td>${escape(mov.salida)}</td>
      </tr>
    `).join('');

  $('#modalHabladoBody').innerHTML = `
    <!-- Encabezado del Dashboard de Tiempo Hablado -->
    <header class="dash-view-header">
      <div class="dash-view-title-wrap">
        <h1>Tiempo Hablado</h1>
        <p>Verifica tu conexión y asegúrate de estar siempre activo. · <strong>${escape(name(person))}</strong> (${escape(idVis)})</p>
      </div>
      <div class="dash-filter-pills">
        <div class="dash-pill-btn" title="Periodo de consulta">
          <span>📅</span>
          <span>Periodo: <strong>Mensual</strong></span>
          <span class="dash-pill-arrow">▾</span>
        </div>
        <div class="dash-pill-btn" title="Rango de fechas">
          <span>📅</span>
          <span>Rango De Fecha: <strong>Seleccionar</strong></span>
          <span class="dash-pill-arrow">▾</span>
        </div>
        <button type="button" class="dash-pill-clear" id="btnDashResetFilters">
          ✕ Limpiar filtros
        </button>
      </div>
    </header>

    <!-- Fila de 4 Tarjetas KPIs de Tiempo Hablado -->
    <section class="voice-kpi-grid" aria-label="Métricas de tiempo hablado">
      <!-- 1. Conexiones totales -->
      <div class="voice-kpi-card">
        <div class="voice-kpi-top">
          <div class="voice-kpi-icon-wrap">
            <div class="voice-kpi-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 11l2 2 4-4"/></svg>
            </div>
            <span class="voice-kpi-title">Conexiones totales</span>
          </div>
          <button type="button" class="voice-kpi-info-btn" title="Horas acumuladas en canal de voz">ⓘ</button>
        </div>
        <div class="voice-kpi-val-row">
          <div class="voice-kpi-main-val">
            ${m.conexionesHoras}h <span class="sub-val">/${m.conexionesMeta}h</span>
          </div>
          <div class="voice-kpi-pct">${m.conexionesPct}%</div>
        </div>
        <div class="voice-compare-pill green">
          0% respecto a ayer
        </div>
      </div>

      <!-- 2. % dentro del rango -->
      <div class="voice-kpi-card">
        <div class="voice-kpi-top">
          <div class="voice-kpi-icon-wrap">
            <div class="voice-kpi-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 11l2 2 4-4"/></svg>
            </div>
            <span class="voice-kpi-title">% dentro del rango</span>
          </div>
          <button type="button" class="voice-kpi-info-btn" title="Porcentaje de asistencia cumplido en el horario">ⓘ</button>
        </div>
        <div class="voice-kpi-val-row">
          <div class="voice-kpi-main-val" style="font-size:32px">
            ${m.dentroRangoPct}%
          </div>
        </div>
        <div class="voice-compare-pill green">
          +17% respecto a ayer
        </div>
      </div>

      <!-- 3. Tiempo total Hablado -->
      <div class="voice-kpi-card">
        <div class="voice-kpi-top">
          <div class="voice-kpi-icon-wrap">
            <div class="voice-kpi-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 11l2 2 4-4"/></svg>
            </div>
            <span class="voice-kpi-title">Tiempo total Hablado</span>
          </div>
          <button type="button" class="voice-kpi-info-btn" title="Horas con micrófono abierto activo">ⓘ</button>
        </div>
        <div class="voice-kpi-val-row">
          <div class="voice-kpi-main-val">
            ${m.tiempoHabladoHoras}h <span class="sub-val">/${m.tiempoHabladoMeta}h</span>
          </div>
          <div class="voice-kpi-pct">${m.tiempoHabladoPct}%</div>
        </div>
        <div class="voice-compare-pill red">
          -14% respecto a ayer
        </div>
      </div>

      <!-- 4. Promedio Hablado -->
      <div class="voice-kpi-card">
        <div class="voice-kpi-top">
          <div class="voice-kpi-icon-wrap">
            <div class="voice-kpi-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 11l2 2 4-4"/></svg>
            </div>
            <span class="voice-kpi-title">Promedio Hablado</span>
          </div>
          <button type="button" class="voice-kpi-info-btn" title="Promedio de horas habladas por día">ⓘ</button>
        </div>
        <div class="voice-kpi-val-row">
          <div class="voice-kpi-main-val">
            ${m.promedioHabladoHoras}h <span class="sub-val">/${m.promedioHabladoMeta}h</span>
          </div>
        </div>
        <div class="voice-compare-pill red">
          -14% respecto a ayer
        </div>
      </div>
    </section>

    <!-- Fila Media: Calendario de voz y Mi Desempeño -->
    <div class="dash-two-cols">
      <!-- Calendario de voz -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title">
            <span style="font-size:18px">📅</span> Calendario de voz
          </h2>
        </div>
        <div class="cal-nav-bar">
          <button type="button" class="cal-nav-btn" aria-label="Mes anterior">‹</button>
          <span class="cal-nav-title">Noviembre De 2026</span>
          <button type="button" class="cal-nav-btn" aria-label="Mes siguiente">›</button>
        </div>
        <div class="cal-grid">
          <div class="cal-header-day">Lun</div>
          <div class="cal-header-day">Mar</div>
          <div class="cal-header-day">Mié</div>
          <div class="cal-header-day">Jue</div>
          <div class="cal-header-day">Vie</div>
          <div class="cal-header-day">Sáb</div>
          <div class="cal-header-day">Dom</div>
          ${calHtml}
        </div>
        <div class="cal-legend-row">
          <div class="cal-legend-badge opt">
            <span class="dot"></span> Óptimo <strong>+70%</strong>
          </div>
          <div class="cal-legend-badge mod">
            <span class="dot"></span> Moderado <strong>40% - 70%</strong>
          </div>
          <div class="cal-legend-badge bajo">
            <span class="dot"></span> Bajo <strong>-40%</strong>
          </div>
        </div>
      </div>

      <!-- Mi Desempeño: Podio Dorado con Estrella -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title">
            <span style="font-size:18px">📊</span> Mi Desempeño
          </h2>
        </div>
        <div class="perf-podium-card-body">
          <div class="perf-podium-text">
            <span>Top del ranking</span>
            <strong>N° ${m.rankingPos}</strong>
          </div>
          <div class="perf-podium-svg-wrap">
            <svg width="140" height="110" viewBox="0 0 140 110" fill="none">
              <!-- Estrella dorada con resplandor -->
              <path d="M70,8 L74.8,22.2 L89.8,22.5 L77.8,31.3 L82.2,45.5 L70,36.8 L57.8,45.5 L62.2,31.3 L50.2,22.5 L65.2,22.2 Z" fill="#eab308" filter="drop-shadow(0px 3px 6px rgba(234,179,8,0.45))"/>
              <!-- Pedestal central (1er lugar) -->
              <rect x="52" y="46" width="36" height="60" rx="8" fill="#eab308"/>
              <!-- Pedestal izquierdo (2do lugar) -->
              <rect x="18" y="68" width="34" height="38" rx="8" fill="#fde047"/>
              <!-- Pedestal derecho (3er lugar) -->
              <rect x="88" y="78" width="34" height="28" rx="8" fill="#fef08a"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Fila Inferior: Registro de Asistencia y Registro de Movimiento -->
    <div class="dash-two-cols">
      <!-- Registro de Asistencia / Tiempo Hablado Diario -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title">
            <span style="font-size:18px">📅</span> Registro de Asistencia
          </h2>
        </div>
        <div class="voice-table-wrap">
          <table class="voice-data-tbl">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Prom. Hablado</th>
                <th>% Tiempo Hablado</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              ${dailyRowsHtml}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Registro de Movimiento de Canales -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title">
            <span style="font-size:18px">📅</span> Registro de Movimiento
          </h2>
          <label class="channel-select-label">
            <span>Canal:</span>
            <select id="canalFilterSelect">
              <option value="" ${currentCanalFilter === '' ? 'selected' : ''}>Todas</option>
              <option value="Documentación" ${currentCanalFilter === 'Documentación' ? 'selected' : ''}>Documentación</option>
              <option value="General" ${currentCanalFilter === 'General' ? 'selected' : ''}>General</option>
            </select>
          </label>
        </div>
        <div class="voice-table-wrap">
          <table class="voice-data-tbl">
            <thead>
              <tr>
                <th>Micro ON</th>
                <th>Canal</th>
                <th>Ingreso</th>
                <th>Salida</th>
              </tr>
            </thead>
            <tbody id="movimientosRows">
              ${movimientosRowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  $('#modalDetalleHablado').showModal();
}

function actualizarMovimientosModal() {
  const movs = generarMovimientosCanal(currentSelectedFecha);
  const rows = movs
    .filter(mov => !currentCanalFilter || mov.canal === currentCanalFilter)
    .map(mov => `
      <tr>
        <td><strong>${mov.microOn}</strong></td>
        <td><span class="channel-pill ${mov.canalCls}">${escape(mov.canal)}</span></td>
        <td>${escape(mov.ingreso)}</td>
        <td>${escape(mov.salida)}</td>
      </tr>
    `).join('');

  const container = $('#movimientosRows');
  if (container) container.innerHTML = rows;
}

// Event Listeners
document.addEventListener('click', event => {
  try {
    const b = event.target.closest('button');
    if (b) {
      if (b.dataset.close) {
        $('#' + b.dataset.close)?.close();
        return;
      }

      if (b.dataset.verDetalle) {
        abrirModalDetalle(b.dataset.verDetalle);
        return;
      }

      if (b.dataset.verFecha) {
        currentSelectedFecha = b.dataset.verFecha;
        notice(`Mostrando movimientos de canal para la fecha: ${b.dataset.verFecha}`);
        actualizarMovimientosModal();
        return;
      }

      if (b.id === 'btnDashResetFilters') {
        currentCanalFilter = '';
        currentSelectedFecha = null;
        notice('Filtros del dashboard de voz restablecidos al mes de Noviembre 2026.');
        if (currentSelectedColabId) abrirModalDetalle(currentSelectedColabId);
        return;
      }

      return;
    }

    // Clic en fila completa del colaborador
    const row = event.target.closest('tr.tr-clickable');
    if (row && row.dataset.verDetalle) {
      abrirModalDetalle(row.dataset.verDetalle);
    }
  } catch (err) {
    notice(err.message, true);
  }
});

document.addEventListener('change', event => {
  if (event.target.id === 'dashColabSelect') {
    if (event.target.value) abrirModalDetalle(event.target.value);
    return;
  }

  if (event.target.id === 'canalFilterSelect') {
    currentCanalFilter = event.target.value;
    actualizarMovimientosModal();
    return;
  }
});

['#search', '#department', '#nivelFilter'].forEach(selector => {
  const el = $(selector);
  if (el) {
    el.addEventListener(selector === '#search' ? 'input' : 'change', () => {
      try { render(); } catch (err) { notice(err.message, true); }
    });
  }
});

window.addEventListener('storage', event => {
  if (event.key === 'th_colaboradores' || event.key === null) {
    render();
  }
});

try {
  populateDepartments();
  render();
} catch (err) {
  notice(err.message, true);
}
