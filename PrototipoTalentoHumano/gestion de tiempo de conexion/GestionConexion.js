(function() {
"use strict";

/**
 * ==========================================================================
 * DEVDATEP CONSULTING - GESTIÓN DE TIEMPO DE CONEXIÓN
 * Compatible con protocolo file:// y entornos web estándar sin dependencias de módulos externos.
 * ==========================================================================
 */

const departamentos = (typeof window !== "undefined" && window.departamentos) || [
  { idDepartamento: "DEP-001", nombre: "Talento Humano" },
  { idDepartamento: "DEP-002", nombre: "Desarrollo Web" },
  { idDepartamento: "DEP-003", nombre: "Comercial" }
];

const areas = (typeof window !== "undefined" && window.areas) || [
  { idArea: "ARE-001", nombre: "Reclutamiento", idDepartamento: "DEP-001" },
  { idArea: "ARE-002", nombre: "Capacitación", idDepartamento: "DEP-001" },
  { idArea: "ARE-003", nombre: "Clima y Cultura", idDepartamento: "DEP-001" },
  { idArea: "ARE-004", nombre: "Backend", idDepartamento: "DEP-002" },
  { idArea: "ARE-005", nombre: "Frontend", idDepartamento: "DEP-002" },
  { idArea: "ARE-006", nombre: "Base de Datos", idDepartamento: "DEP-002" },
  { idArea: "ARE-007", nombre: "Documentación", idDepartamento: "DEP-002" },
  { idArea: "ARE-008", nombre: "Diseño Web", idDepartamento: "DEP-002" },
  { idArea: "ARE-009", nombre: "Desarrollo Rápido de Aplicaciones", idDepartamento: "DEP-002" },
  { idArea: "ARE-010", nombre: "Diseño Gráfico", idDepartamento: "DEP-003" },
  { idArea: "ARE-012", nombre: "Marketing y Ventas", idDepartamento: "DEP-003" }
];

const $ = s => document.querySelector(s);

let currentSelectedColabId = null;
let currentConnPage = 1;
const CONN_PAGE_SIZE = 6;

const escape = val => String(val ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const norm = s => String(s ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const label = (list, id, key) => list.find(x => x[key] === id)?.nombre ?? '—';
const name = p => [p.nombres, p.apellidoPaterno, p.apellidoMaterno].filter(Boolean).join(' ');

let currentSelectedDate = '';

function formatearFechaEspanol(dateObj) {
  const opciones = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  let texto = dateObj.toLocaleDateString('es-ES', opciones);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function actualizarFechaDelDia(dateVal) {
  const el = document.querySelector('#fechaMonitoreoActual');
  if (!el) return;
  let dateObj;
  if (typeof dateVal === 'string' && dateVal.includes('-')) {
    const [y, m, d] = dateVal.split('-').map(Number);
    dateObj = new Date(y, m - 1, d);
  } else if (dateVal instanceof Date) {
    dateObj = dateVal;
  } else {
    dateObj = new Date();
  }
  el.textContent = formatearFechaEspanol(dateObj);
}

function inicializarSelectorFecha() {
  const input = document.querySelector('#headerDatePicker');
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  currentSelectedDate = `${yyyy}-${mm}-${dd}`;
  
  if (input) {
    input.value = currentSelectedDate;
    input.addEventListener('change', (e) => {
      if (e.target.value) {
        currentSelectedDate = e.target.value;
        actualizarFechaDelDia(currentSelectedDate);
        try { render(); } catch (err) { notice(err.message, true); }
      }
    });
  }
  actualizarFechaDelDia(currentSelectedDate);
}

function obtenerListaColaboradores() {
  if (typeof window !== "undefined" && typeof window.obtenerColaboradoresActivos === "function") {
    try {
      const list = window.obtenerColaboradoresActivos();
      if (Array.isArray(list) && list.length >= 65) return list;
    } catch (err) {}
  }
  if (typeof window !== "undefined" && typeof window.obtenerColaboradores === "function") {
    try {
      const all = window.obtenerColaboradores();
      if (Array.isArray(all) && all.length >= 65) {
        const activos = all.filter(c => c.estado === 'Activo' || !c.estado);
        if (activos.length > 0) return activos;
      }
    } catch (err) {}
  }
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem("th_colaboradores") : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 65) {
        const activos = parsed.filter(c => c.estado === 'Activo' || !c.estado);
        if (activos.length > 0) return activos;
      }
    }
  } catch (err) {}

  if (typeof window !== "undefined" && Array.isArray(window.colaboradores70Oficiales) && window.colaboradores70Oficiales.length > 0) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("th_colaboradores", JSON.stringify(window.colaboradores70Oficiales));
      }
    } catch (e) {}
    const activos = window.colaboradores70Oficiales.filter(c => c.estado === 'Activo' || !c.estado);
    if (activos.length > 0) return activos;
  }

  const iniciales = (typeof window !== "undefined" && window.colaboradoresIniciales) || [];
  const demo = (typeof window !== "undefined" && window.colaboradoresDemostracion) || [];
  const todos = [...iniciales, ...demo];
  const activos = todos.filter(c => c.estado === 'Activo' || !c.estado);
  return activos.length > 0 ? activos : todos;
}

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

// Cálculo de métricas de conexión por colaborador
function calcularMetricasConexion(colaborador, dateStr) {
  const code = String(colaborador.codigoColaborador || '1000');
  const fechaSeed = dateStr || currentSelectedDate || '2026-11-23';
  const hash = Math.abs(hashCode((colaborador.idColaborador || code) + '_' + fechaSeed));
  const dateHash = Math.abs(hashCode(fechaSeed));

  // Convenio base: meta de horas y días
  const metaHoras = colaborador.fichaTalento?.periodos?.at(-1)?.meta ?? 420;
  const diasConvenio = Math.ceil(metaHoras / 5); // ej. 84 días para 420h
  const metaDiaria = 5.00; // Meta base diaria de 5 horas

  let tiempoConectadoHoras = 63.24;
  let tiempoMetaMes = 85;
  let tiempoDiarioHoras = 5.24;
  let tiempoDiarioFmt = '05:14:10';
  let dentroRangoPct = 100;
  let rachaDias = 13;
  let estado = 'EXCELENTE';
  let estadoLabel = 'Excelente (≥ 5h)';
  let badgeCls = 'green';

  const dateDelta = ((dateHash % 7) - 3) * 0.04;

  if (code === '1101') { // Alex Rios
    tiempoConectadoHoras = 74.50;
    tiempoDiarioHoras = Number(Math.max(4.8, 5.44 + dateDelta).toFixed(2));
    const mins = Math.floor((tiempoDiarioHoras % 1) * 60);
    const secs = 10 + (hash % 45);
    tiempoDiarioFmt = `0${Math.floor(tiempoDiarioHoras)}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    rachaDias = 15;
    dentroRangoPct = 100;
  } else if (code === '1102') { // Sam Vega
    tiempoConectadoHoras = 68.10;
    tiempoDiarioHoras = Number(Math.max(4.7, 5.26 + dateDelta).toFixed(2));
    const mins = Math.floor((tiempoDiarioHoras % 1) * 60);
    const secs = 10 + (hash % 45);
    tiempoDiarioFmt = `0${Math.floor(tiempoDiarioHoras)}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    rachaDias = 14;
    dentroRangoPct = 99;
  } else if (code === '1104' || code === '1026') { // Dani / Luis
    tiempoConectadoHoras = 46.20;
    tiempoDiarioHoras = Number(Math.max(3.8, 4.60 + dateDelta).toFixed(2));
    const mins = Math.floor((tiempoDiarioHoras % 1) * 60);
    const secs = 10 + (hash % 45);
    tiempoDiarioFmt = `0${Math.floor(tiempoDiarioHoras)}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    rachaDias = 4;
    dentroRangoPct = 88;
    estado = 'NORMAL';
    estadoLabel = 'Normal (4.5h - 5h)';
    badgeCls = 'yellow';
  } else {
    tiempoConectadoHoras = Number((55 + (hash % 20) + (hash % 100) / 100).toFixed(2));
    tiempoDiarioHoras = Number((4.90 + ((hash % 15) - 3) / 10).toFixed(2));
    const mins = Math.floor((tiempoDiarioHoras % 1) * 60);
    const secs = 10 + (hash % 45);
    tiempoDiarioFmt = `0${Math.floor(tiempoDiarioHoras)}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    dentroRangoPct = 92 + (hash % 9);
    rachaDias = 5 + (hash % 10);
    if (tiempoDiarioHoras >= 5.00) {
      estado = 'EXCELENTE';
      estadoLabel = 'Excelente (≥ 5h)';
      badgeCls = 'green';
    } else if (tiempoDiarioHoras >= 4.50) {
      estado = 'NORMAL';
      estadoLabel = 'Normal (4.5h - 5h)';
      badgeCls = 'yellow';
    } else {
      estado = 'BAJO';
      estadoLabel = 'Bajo (< 4.5h)';
      badgeCls = 'red';
    }
  }

  const avancePct = ((tiempoConectadoHoras / tiempoMetaMes) * 100).toFixed(2);
  const avanceDiarioPct = ((tiempoDiarioHoras / metaDiaria) * 100).toFixed(1);
  const promedioDiario = (tiempoConectadoHoras / 12).toFixed(2);

  // Días completados vs pendientes para el convenio
  const completadoPct = 75;
  const pendientePct = 25;

  return {
    tiempoConectadoHoras,
    tiempoMetaMes,
    avancePct,
    tiempoDiarioHoras,
    tiempoDiarioFmt,
    metaDiaria,
    avanceDiarioPct,
    dentroRangoPct,
    rachaDias,
    promedioDiario,
    diasConvenio,
    completadoPct,
    pendientePct,
    estado,
    estadoLabel,
    badgeCls
  };
}

// Registros diarios de conexión para noviembre 2026
function generarRegistrosDiariosConexion(colaborador) {
  return [
    { fecha: '2026-11-17', marcacion: '07:48:52', ingreso: '07:49:15', tiempo: '05:26:15', estado: 'Excelente', horasDec: 5.44 },
    { fecha: '2026-11-16', marcacion: '07:45:26', ingreso: '07:46:21', tiempo: '05:15:34', estado: 'Excelente', horasDec: 5.26 },
    { fecha: '2026-11-13', marcacion: '07:46:34', ingreso: '07:47:00', tiempo: '06:00:00', estado: 'Excelente', horasDec: 6.00 },
    { fecha: '2026-11-12', marcacion: '07:50:10', ingreso: '07:50:35', tiempo: '05:10:20', estado: 'Excelente', horasDec: 5.17 },
    { fecha: '2026-11-11', marcacion: '07:47:15', ingreso: '07:47:40', tiempo: '05:30:00', estado: 'Excelente', horasDec: 5.50 },
    { fecha: '2026-11-10', marcacion: '07:49:00', ingreso: '07:49:25', tiempo: '05:05:40', estado: 'Excelente', horasDec: 5.09 },
    { fecha: '2026-11-09', marcacion: '07:51:10', ingreso: '07:51:30', tiempo: '05:12:15', estado: 'Excelente', horasDec: 5.20 },
    { fecha: '2026-11-06', marcacion: '07:48:20', ingreso: '07:48:45', tiempo: '05:20:00', estado: 'Excelente', horasDec: 5.33 },
    { fecha: '2026-11-05', marcacion: '07:52:00', ingreso: '07:52:25', tiempo: '05:08:30', estado: 'Excelente', horasDec: 5.14 },
    { fecha: '2026-11-04', marcacion: '07:46:00', ingreso: '07:46:20', tiempo: '05:18:45', estado: 'Excelente', horasDec: 5.31 },
    { fecha: '2026-11-03', marcacion: '07:49:30', ingreso: '07:49:50', tiempo: '05:14:10', estado: 'Excelente', horasDec: 5.24 },
    { fecha: '2026-11-02', marcacion: '07:47:40', ingreso: '07:48:05', tiempo: '05:22:30', estado: 'Excelente', horasDec: 5.37 }
  ];
}

// Gráfica SVG de evolución del tiempo de conexión (línea ~5h con fechas en X)
function renderEvolucionLineChartSvg(registros) {
  // Coordenadas calculadas para viewBox="0 0 520 180"
  // Ticks Y: 0h (y=150), 1h (y=125), 2h (y=100), 3h (y=75), 4h (y=50), 5h (y=25)
  const fechasLabels = ['1 Nov', '2 Nov', '3 Nov', '4 Nov', '5 Nov', '8 Nov', '9 Nov', '10 Nov', '11 Nov', '12 Nov', '13 Nov', '16 Nov', '17 Nov'];
  const startX = 60;
  const endX = 490;
  const stepX = (endX - startX) / (fechasLabels.length - 1);

  // Puntos de la curva a lo largo de las 5h (~25 a 30 en Y)
  const yBase = 28;
  const points = [
    { x: startX, y: yBase },
    { x: startX + stepX * 1, y: yBase - 1 },
    { x: startX + stepX * 2, y: yBase + 1 },
    { x: startX + stepX * 3, y: yBase - 2 },
    { x: startX + stepX * 4, y: yBase },
    { x: startX + stepX * 5, y: yBase + 2 },
    { x: startX + stepX * 6, y: yBase - 1 },
    { x: startX + stepX * 7, y: yBase },
    { x: startX + stepX * 8, y: yBase - 3 },
    { x: startX + stepX * 9, y: yBase + 1 },
    { x: startX + stepX * 10, y: yBase - 4 },
    { x: startX + stepX * 11, y: yBase - 2 },
    { x: endX, y: yBase - 1 }
  ];

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`, '');
  const areaD = `${pathD} L ${endX},150 L ${startX},150 Z`;

  return `
    <svg class="line-chart-svg" viewBox="0 0 520 180" preserveAspectRatio="none">
      <defs>
        <linearGradient id="cyanAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.22" />
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0.0" />
        </linearGradient>
      </defs>

      <!-- Líneas horizontales de la cuadrícula -->
      <line x1="50" y1="25" x2="500" y2="25" class="chart-axis-line" stroke-dasharray="3,3" />
      <text x="40" y="29" text-anchor="end" class="chart-axis-text">5h</text>

      <line x1="50" y1="50" x2="500" y2="50" class="chart-axis-line" stroke-dasharray="3,3" />
      <text x="40" y="54" text-anchor="end" class="chart-axis-text">4h</text>

      <line x1="50" y1="75" x2="500" y2="75" class="chart-axis-line" stroke-dasharray="3,3" />
      <text x="40" y="79" text-anchor="end" class="chart-axis-text">3h</text>

      <line x1="50" y1="100" x2="500" y2="100" class="chart-axis-line" stroke-dasharray="3,3" />
      <text x="40" y="104" text-anchor="end" class="chart-axis-text">2h</text>

      <line x1="50" y1="125" x2="500" y2="125" class="chart-axis-line" stroke-dasharray="3,3" />
      <text x="40" y="129" text-anchor="end" class="chart-axis-text">1h</text>

      <line x1="50" y1="150" x2="500" y2="150" class="chart-axis-line" />
      <text x="40" y="154" text-anchor="end" class="chart-axis-text">0h</text>

      <!-- Relleno y línea continua -->
      <path d="${areaD}" class="chart-area-fill" />
      <path d="${pathD}" class="chart-path-line" />

      <!-- Puntos y etiquetas en X -->
      ${points.map((p, i) => `
        <circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#0284c7" stroke="white" stroke-width="1.5" />
        <text x="${p.x}" y="168" text-anchor="middle" class="chart-axis-text">${fechasLabels[i]}</text>
      `).join('')}
    </svg>
  `;
}

// Donut 1: Progreso de cumplimiento de convenio (75% verde, 25% amarillo)
function renderDonutConvenioSvg(diasConvenio, completadoPct = 75, pendientePct = 25) {
  const C = 2 * Math.PI * 60; // 376.99
  const lenCompletado = (completadoPct / 100) * C;
  const lenPendiente = (pendientePct / 100) * C;

  return `
    <div class="donut-with-legend">
      <div class="donut-svg-wrap">
        <svg class="donut-ring-svg" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="60" fill="none" stroke="#e2e8f0" stroke-width="30" />
          <!-- Slice Verde: Completado -->
          <circle cx="100" cy="100" r="60" class="donut-slice-circle" stroke="#16a34a"
            stroke-dasharray="${lenCompletado.toFixed(2)} ${(C - lenCompletado).toFixed(2)}"
            stroke-dashoffset="0" />
          <!-- Slice Amarillo: Pendiente -->
          <circle cx="100" cy="100" r="60" class="donut-slice-circle" stroke="#eab308"
            stroke-dasharray="${lenPendiente.toFixed(2)} ${(C - lenPendiente).toFixed(2)}"
            stroke-dashoffset="${(-lenCompletado).toFixed(2)}" />
          
          <!-- Texto central -->
          <text x="100" y="94" text-anchor="middle" class="donut-center-main">${diasConvenio} días</text>
          <text x="100" y="115" text-anchor="middle" class="donut-center-sub">de convenio</text>

          <!-- Badges de porcentaje sobre el donut -->
          <text x="65" y="48" text-anchor="middle" class="donut-pct-text">75%</text>
          <text x="150" y="162" text-anchor="middle" class="donut-pct-text">25%</text>
        </svg>
      </div>

      <div class="donut-legend-box">
        <div class="donut-legend-item">
          <span class="legend-square green"></span>
          <span>Completado</span>
        </div>
        <div class="donut-legend-item">
          <span class="legend-square yellow"></span>
          <span>Pendiente</span>
        </div>
      </div>
    </div>
  `;
}

// Donut 2: Porcentaje por tipo de asistencia
function renderDonutTipoAsistenciaSvg(diasAsistencia = 84, pctPuntual = 12) {
  const C = 2 * Math.PI * 60; // 376.99
  const lenPuntual = C; // Donut dominante verde (asistencia óptima)

  return `
    <div class="donut-with-legend">
      <div class="donut-svg-wrap">
        <svg class="donut-ring-svg" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="60" fill="none" stroke="#e2e8f0" stroke-width="30" />
          <!-- Anillo verde de puntualidad -->
          <circle cx="100" cy="100" r="60" class="donut-slice-circle" stroke="#16a34a"
            stroke-dasharray="${lenPuntual.toFixed(2)} 0"
            stroke-dashoffset="0" />

          <!-- Texto central -->
          <text x="100" y="94" text-anchor="middle" class="donut-center-main">${diasAsistencia} días</text>
          <text x="100" y="115" text-anchor="middle" class="donut-center-sub">de asistencia</text>

          <!-- Badge porcentaje -->
          <text x="100" y="172" text-anchor="middle" class="donut-pct-text" style="fill:white;font-size:13px">${pctPuntual}%</text>
        </svg>
      </div>

      <div class="donut-legend-box">
        <div class="donut-legend-item">
          <span class="legend-square green"></span>
          <span>Puntual</span>
        </div>
        <div class="donut-legend-item">
          <span class="legend-square orange"></span>
          <span>Tardanza</span>
        </div>
        <div class="donut-legend-item">
          <span class="legend-square red"></span>
          <span>Falta Injustificada</span>
        </div>
        <div class="donut-legend-item">
          <span class="legend-square coral"></span>
          <span>Falta Justificada</span>
        </div>
      </div>
    </div>
  `;
}

function populateDepartments() {
  const opts = '<option value="">Todos los departamentos</option>' +
    departamentos.map(d => `<option value="${escape(d.idDepartamento)}">${escape(d.nombre)}</option>`).join('');
  $('#department').innerHTML = opts;
}

function renderGeneralKPIs(colaboradores) {
  let countExcelente = 0;
  let sumaHoras = 0;

  colaboradores.forEach(c => {
    const m = calcularMetricasConexion(c);
    if (m.estado === 'EXCELENTE') countExcelente++;
    sumaHoras += Number(m.promedioDiario);
  });

  const prom = colaboradores.length > 0 ? (sumaHoras / colaboradores.length).toFixed(1) : '5.2';

  $('#kpiTotalColabs').textContent = colaboradores.length;
  $('#kpiPromedioDiario').textContent = `${prom}h / día`;
  $('#kpiCumplimientoOptimo').textContent = countExcelente;
  $('#kpiRachaPromedio').textContent = '13 días';
}

function render() {
  const colaboradores = obtenerListaColaboradores();
  renderGeneralKPIs(colaboradores);

  const query = norm($('#search').value);
  const dep = $('#department').value;
  const estado = $('#estadoConexionFilter').value;
  const tbody = $('#rows');

  const filtered = colaboradores.filter(c => {
    const matchQuery = norm(`${name(c)} ${c.codigoColaborador ?? ''} ${c.numeroDocumento ?? ''}`).includes(query);
    const matchDep = !dep || c.idDepartamento === dep;
    const m = calcularMetricasConexion(c);
    const matchEstado = !estado || m.estado === estado;
    return matchQuery && matchDep && matchEstado;
  });

  tbody.innerHTML = filtered.map(c => {
    const m = calcularMetricasConexion(c);
    const idVis = getVisibleIdentifier(c);

    return `
      <tr class="tr-clickable" data-ver-detalle="${escape(c.idColaborador)}" title="Ver Dashboard de Tiempo de Conexión de ${escape(name(c))}">
        <td>
          <strong>${escape(name(c))}</strong>
          <small>${escape(idVis)} · ${escape(c.tipoColaborador)}</small>
        </td>
        <td>
          ${escape(label(areas, c.idArea, 'idArea'))}
          <small>${escape(label(departamentos, c.idDepartamento, 'idDepartamento'))}</small>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:16px">🔥</span>
            <strong style="color:var(--orange);font-size:14px">${m.rachaDias} días</strong>
          </div>
          <small>puntualidad consecutiva</small>
        </td>
        <td>
          <div class="conn-progress-container">
            <strong>${m.tiempoDiarioHoras} h / ${m.metaDiaria}h</strong>
            <div class="conn-progress-bg">
              <div class="conn-progress-fill" style="width: ${Math.min(100, m.avanceDiarioPct)}%"></div>
            </div>
            <small>${m.avanceDiarioPct}% de meta diaria (${m.tiempoDiarioFmt})</small>
          </div>
        </td>
        <td>
          <span class="badge ${m.badgeCls}">
            ${escape(m.estadoLabel)}
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

function abrirModalDetalle(idColaborador, page = 1) {
  currentSelectedColabId = idColaborador;
  currentConnPage = page;

  const colabs = obtenerListaColaboradores();
  const person = colabs.find(c => c.idColaborador === idColaborador);
  if (!person) throw new Error('Colaborador no encontrado.');

  const m = calcularMetricasConexion(person);
  const idVis = getVisibleIdentifier(person);
  const registros = generarRegistrosDiariosConexion(person);

  // Paginación
  const totalPages = Math.ceil(registros.length / CONN_PAGE_SIZE) || 1;
  const clampedPage = Math.min(totalPages, Math.max(1, page));
  currentConnPage = clampedPage;
  const startIdx = (clampedPage - 1) * CONN_PAGE_SIZE;
  const pageLogs = registros.slice(startIdx, startIdx + CONN_PAGE_SIZE);

  const tableRowsHtml = pageLogs.map(r => `
    <tr>
      <td>${escape(r.fecha)}</td>
      <td>${escape(r.marcacion)}</td>
      <td>${escape(r.ingreso)}</td>
      <td><strong>${escape(r.tiempo)}</strong></td>
      <td><span class="state-pill-green">${escape(r.estado)}</span></td>
    </tr>
  `).join('');

  const lineChartSvg = renderEvolucionLineChartSvg(registros);
  const donutConvenioSvg = renderDonutConvenioSvg(m.diasConvenio, m.completadoPct, m.pendientePct);
  const donutTipoAsistenciaSvg = renderDonutTipoAsistenciaSvg(m.diasConvenio, 12);

  $('#modalConexionBody').innerHTML = `
    <!-- Encabezado del Dashboard individual -->
    <header class="dash-view-header">
      <div class="dash-view-title-wrap">
        <h1>Tiempo de Conexión</h1>
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
      </div>
    </header>

    <!-- Fila de 4 Tarjetas KPIs de Tiempo de Conexión -->
    <section class="conn-kpi-grid" aria-label="Métricas de tiempo de conexión">
      <!-- 1. Racha de Puntualidad -->
      <div class="conn-kpi-card">
        <div class="conn-kpi-top">
          <div class="conn-kpi-icon-wrap">
            <span style="font-size:16px">🔥</span>
            <span class="conn-kpi-title">Racha de Puntualidad</span>
          </div>
          <button type="button" class="conn-kpi-info-btn" title="Días consecutivos de ingreso puntual">ⓘ</button>
        </div>
        <div class="conn-kpi-val-row" style="align-items:center;margin-top:6px">
          <span style="font-size:36px;line-height:1">🔥</span>
          <div class="conn-kpi-main-val">${m.rachaDias} días</div>
        </div>
      </div>

      <!-- 2. Tiempo de conexión por día -->
      <div class="conn-kpi-card">
        <div class="conn-kpi-top">
          <div class="conn-kpi-icon-wrap">
            <div class="conn-kpi-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span class="conn-kpi-title">Tiempo de conexión por día</span>
          </div>
          <button type="button" class="conn-kpi-info-btn" title="Horas conectadas registradas por jornada">ⓘ</button>
        </div>
        <div class="conn-kpi-val-row">
          <div class="conn-kpi-main-val">
            ${m.tiempoDiarioHoras} h <span class="sub-val">/${m.metaDiaria}h</span>
          </div>
          <div class="conn-kpi-pct">${m.avanceDiarioPct}%</div>
        </div>
        <div class="conn-compare-pill green">
          +${m.avanceDiarioPct}% de meta diaria (${m.tiempoDiarioFmt})
        </div>
      </div>

      <!-- 3. Dentro del rango -->
      <div class="conn-kpi-card">
        <div class="conn-kpi-top">
          <div class="conn-kpi-icon-wrap">
            <div class="conn-kpi-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span class="conn-kpi-title">Dentro del rango</span>
          </div>
          <button type="button" class="conn-kpi-info-btn" title="Cumplimiento del rango horario">ⓘ</button>
        </div>
        <div class="conn-kpi-val-row">
          <div class="conn-kpi-main-val" style="font-size:32px">
            ${m.dentroRangoPct}%
          </div>
        </div>
        <div class="conn-compare-pill green">
          +${m.dentroRangoPct}.00% respecto a ayer
        </div>
      </div>

      <!-- 4. Promedio diario -->
      <div class="conn-kpi-card">
        <div class="conn-kpi-top">
          <div class="conn-kpi-icon-wrap">
            <div class="conn-kpi-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span class="conn-kpi-title">Promedio diario</span>
          </div>
          <button type="button" class="conn-kpi-info-btn" title="Promedio de conexión por jornada">ⓘ</button>
        </div>
        <div class="conn-kpi-val-row">
          <div class="conn-kpi-main-val">
            ${m.promedioDiario} h / día
          </div>
        </div>
        <div class="conn-compare-pill green">
          Jornada base: 5h
        </div>
      </div>
    </section>

    <!-- Fila Media: Evolución y Progreso de Cumplimiento -->
    <div class="dash-two-cols">
      <!-- Evolución del tiempo de conexión -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title">Evolución del tiempo de conexión</h2>
          <p class="dash-card-subtitle">Mira cómo evoluciona tu tiempo de conexión día a día</p>
        </div>
        <div class="chart-container-scroll">
          ${lineChartSvg}
        </div>
      </div>

      <!-- Progreso de cumplimiento de convenio -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title">Progreso de cumplimiento de convenio</h2>
        </div>
        ${donutConvenioSvg}
      </div>
    </div>

    <!-- Fila Inferior: Registro de conexiones y Porcentaje por tipo de asistencia -->
    <div class="dash-two-cols">
      <!-- Registro de conexiones por día -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title">
            <span style="font-size:18px">👤</span> Registro de conexiones por día
          </h2>
        </div>
        <div class="conn-table-wrap">
          <table class="conn-records-tbl">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora de marcación</th>
                <th>Hora de ingreso</th>
                <th>Tiempo de conexión</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>
        </div>
        <!-- Paginación estilo |<< < (1) 2 > >>| -->
        <div class="conn-pagination-row">
          <button type="button" class="btn-page-step" id="btnConnFirst" ${clampedPage === 1 ? 'disabled' : ''} title="Primera página">|‹‹</button>
          <button type="button" class="btn-page-step" id="btnConnPrev" ${clampedPage === 1 ? 'disabled' : ''} title="Página anterior">‹</button>
          <button type="button" class="btn-page-num ${clampedPage === 1 ? 'active' : ''}" data-goto-page="1">1</button>
          <button type="button" class="btn-page-num ${clampedPage === 2 ? 'active' : ''}" data-goto-page="2">2</button>
          <button type="button" class="btn-page-step" id="btnConnNext" ${clampedPage === totalPages ? 'disabled' : ''} title="Página siguiente">›</button>
          <button type="button" class="btn-page-step" id="btnConnLast" ${clampedPage === totalPages ? 'disabled' : ''} title="Última página">››|</button>
        </div>
      </div>

      <!-- Porcentaje por tipo de asistencia -->
      <div class="dash-card">
        <div class="dash-card-header">
          <h2 class="dash-card-title">Porcentaje por tipo de asistencia</h2>
        </div>
        ${donutTipoAsistenciaSvg}
      </div>
    </div>
  `;

  $('#modalDetalleConexion').showModal();
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
        abrirModalDetalle(b.dataset.verDetalle, 1);
        return;
      }

      if (b.id === 'btnConnFirst') {
        abrirModalDetalle(currentSelectedColabId, 1);
        return;
      }

      if (b.id === 'btnConnPrev') {
        if (currentConnPage > 1) abrirModalDetalle(currentSelectedColabId, currentConnPage - 1);
        return;
      }

      if (b.id === 'btnConnNext') {
        abrirModalDetalle(currentSelectedColabId, currentConnPage + 1);
        return;
      }

      if (b.id === 'btnConnLast') {
        abrirModalDetalle(currentSelectedColabId, 2);
        return;
      }

      if (b.dataset.gotoPage) {
        abrirModalDetalle(currentSelectedColabId, Number(b.dataset.gotoPage));
        return;
      }

      return;
    }

    // Clic en fila completa del colaborador
    const row = event.target.closest('tr.tr-clickable');
    if (row && row.dataset.verDetalle) {
      abrirModalDetalle(row.dataset.verDetalle, 1);
    }
  } catch (err) {
    notice(err.message, true);
  }
});

['#search', '#department', '#estadoConexionFilter'].forEach(selector => {
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

function iniciarModulo() {
  try {
    inicializarSelectorFecha();
    populateDepartments();
    render();
  } catch (err) {
    notice(err.message, true);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarModulo);
} else {
  iniciarModulo();
}
})();
