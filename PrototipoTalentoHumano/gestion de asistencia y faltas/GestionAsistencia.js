import {
  obtenerColaboradores,
  obtenerColaboradoresActivos
} from '../shared/js/colaboradoresStorage.js';
import { departamentos, areas, subareas, roles } from '../shared/data/catalogos.js';

const $ = s => document.querySelector(s);
const KEY_ASISTENCIAS = 'th_asistencias_faltas_v1';
const PLAZO_MAXIMO_DIAS = 2;
const MAX_TARDANZAS_PERMITIDAS = 9;
const MAX_FALTAS_PERMITIDAS = 3;
const TARDANZAS_POR_FALTA = 3;

let currentTab = 'control'; // 'control' o 'incidencias'
let currentRecordColabId = null;
let dashCurrentPage = 1;
const DASH_PAGE_SIZE = 6;

const todayStr = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Lima',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).format(new Date());

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
  el.textContent = message;
  el.className = isError ? 'error' : 'success';
}

function readData() {
  const raw = localStorage.getItem(KEY_ASISTENCIAS);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveData(data) {
  localStorage.setItem(KEY_ASISTENCIAS, JSON.stringify(data));
}

function calcularDiasTranscurridos(fechaStr) {
  if (!fechaStr) return 0;
  const [y, m, d] = fechaStr.split('-').map(Number);
  const evento = new Date(y, m - 1, d);
  const [ty, tm, td] = todayStr().split('-').map(Number);
  const hoy = new Date(ty, tm - 1, td);
  const diffTime = hoy - evento;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

function obtenerIconoArchivo(tipo, nombre) {
  if (!nombre) return '';
  if (tipo && tipo.startsWith('image/')) return '🖼️';
  if (tipo && tipo.startsWith('video/')) return '🎥';
  return '📄';
}

function formatFechaDisplay(fechaStr) {
  if (!fechaStr) return '—';
  const parts = fechaStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return fechaStr;
}

// Cálculo del récord disciplinario por colaborador
function calcularRecordColaborador(colaborador, incidencias) {
  const incs = incidencias.filter(i => i.idColaborador === colaborador.idColaborador);

  const metaHoras = colaborador.fichaTalento?.periodos?.at(-1)?.meta ?? 330;
  const diasTotalesConvenio = Math.ceil(metaHoras / 5);

  const tardanzasInjustificadas = incs.filter(i => i.tipo === 'TARDANZA' && i.estado === 'INVALIDO').length;
  const tardanzasJustificadas = incs.filter(i => i.tipo === 'TARDANZA' && i.estado === 'VALIDO').length;
  const tardanzasPendientes = incs.filter(i => i.tipo === 'TARDANZA' && i.estado === 'PENDIENTE').length;

  const faltasDirectasInjustificadas = incs.filter(i => i.tipo === 'FALTA' && i.estado === 'INVALIDO').length;
  const faltasJustificadas = incs.filter(i => i.tipo === 'FALTA' && i.estado === 'VALIDO').length;
  const faltasPendientes = incs.filter(i => i.tipo === 'FALTA' && i.estado === 'PENDIENTE').length;

  // Regla clave: 3 tardanzas injustificadas = +1 falta injustificada
  const faltasPorTardanzas = Math.floor(tardanzasInjustificadas / TARDANZAS_POR_FALTA);
  const faltasTotales = faltasDirectasInjustificadas + faltasPorTardanzas;

  // Tardanzas hacia la próxima falta (ej. 2 de 3)
  const tardanzasResiduo = tardanzasInjustificadas % TARDANZAS_POR_FALTA;

  // Cupo dinámico de tardanzas tolerables antes del retiro:
  // Si ya tiene faltas directas, el margen de tardanzas se reduce: (3 - faltas directas) * 3
  const maxTardanzasPermitidas = Math.max(0, (MAX_FALTAS_PERMITIDAS - faltasDirectasInjustificadas) * TARDANZAS_POR_FALTA);

  let subtituloTardanzas = 'Sin tardanzas';
  if (faltasDirectasInjustificadas >= MAX_FALTAS_PERMITIDAS) {
    subtituloTardanzas = '<span style="color:var(--red);font-weight:650">Cupo agotado (Causal de baja)</span>';
  } else if (faltasDirectasInjustificadas > 0) {
    subtituloTardanzas = `<span style="color:var(--orange);font-weight:600">Tope reducido por ${faltasDirectasInjustificadas} falta(s) previa(s)</span>`;
  } else if (tardanzasResiduo > 0) {
    subtituloTardanzas = `<span style="color:var(--orange)">${tardanzasResiduo} de 3 para sumar 1 falta</span>`;
  } else if (tardanzasInjustificadas > 0) {
    subtituloTardanzas = 'Convertidas a falta(s)';
  }

  // Asistencias cumplidas simuladas (días hábiles aproximados según avance menos faltas injustificadas)
  const baseAsistidas = 38;
  const asistenciasCumplidas = Math.min(diasTotalesConvenio, Math.max(0, baseAsistidas - faltasDirectasInjustificadas));
  const porcentajeAsistencia = Math.round((asistenciasCumplidas / diasTotalesConvenio) * 100);

  let estadoRiesgo = 'Normal';
  let nivelClase = 'green';
  let enCausalBaja = false;

  if (faltasTotales >= MAX_FALTAS_PERMITIDAS) {
    estadoRiesgo = 'Causal de baja (3 faltas acumuladas)';
    nivelClase = 'red';
    enCausalBaja = true;
  } else if (faltasTotales === 2) {
    estadoRiesgo = 'Riesgo crítico (2 de 3 faltas)';
    nivelClase = 'orange';
  } else if (faltasTotales === 1) {
    estadoRiesgo = 'Advertencia (1 de 3 faltas)';
    nivelClase = 'yellow';
  }

  return {
    metaHoras,
    diasTotalesConvenio,
    asistenciasCumplidas,
    porcentajeAsistencia,
    tardanzasInjustificadas,
    tardanzasJustificadas,
    tardanzasPendientes,
    tardanzasResiduo,
    maxTardanzasPermitidas,
    subtituloTardanzas,
    faltasDirectasInjustificadas,
    faltasPorTardanzas,
    faltasTotales,
    faltasJustificadas,
    faltasPendientes,
    estadoRiesgo,
    nivelClase,
    enCausalBaja,
    totalIncidencias: incs.length
  };
}

function populateDepartments() {
  const opts = '<option value="">Todos los departamentos</option>' +
    departamentos.map(d => `<option value="${escape(d.idDepartamento)}">${escape(d.nombre)}</option>`).join('');
  $('#department').innerHTML = opts;
}

function populateCollaboratorsDropdown() {
  const activos = obtenerColaboradoresActivos();
  const options = '<option value="">Selecciona un colaborador...</option>' +
    activos.map(p => {
      const idVis = getVisibleIdentifier(p);
      const areaNombre = label(areas, p.idArea, 'idArea');
      return `<option value="${escape(p.idColaborador)}">${escape(name(p))} (${escape(idVis)}) - ${escape(areaNombre)}</option>`;
    }).join('');
  $('#nuevaColaborador').innerHTML = options;
}

function cargarAsistenciasDemostracion() {
  const existentes = readData();
  if (existentes.length > 0) return;

  const colabs = obtenerColaboradores();
  const valeria = colabs.find(c => (c.nombres || '').includes('Valeria') || c.codigoColaborador === '1023') ?? colabs[0];
  const diego = colabs.find(c => (c.nombres || '').includes('Diego') || c.codigoColaborador === '1024') ?? colabs[1];
  const camila = colabs.find(c => (c.nombres || '').includes('Camila') || c.codigoColaborador === '1025') ?? colabs[2];
  const luis = colabs.find(c => (c.nombres || '').includes('Luis') || c.codigoColaborador === '1026') ?? colabs[3];
  const sam = colabs.find(c => c.idColaborador === 'COL-002') ?? colabs[4];
  const alex = colabs.find(c => c.idColaborador === 'COL-001') ?? colabs[5];

  const calcDate = daysAgo => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  };

  const demoRecords = [
    {
      id: 101,
      idColaborador: valeria?.idColaborador ?? 'COL-010',
      colaboradorNombre: valeria ? name(valeria) : 'Valeria Mendoza Castro',
      colaboradorVisible: valeria ? getVisibleIdentifier(valeria) : 'Valeria_Mendoza.1023',
      idDepartamento: valeria?.idDepartamento ?? 'DEP-002',
      idArea: valeria?.idArea ?? 'ARE-004',
      tipo: 'FALTA',
      fechaEvento: calcDate(1), // 1 día transcurrido
      evidencia: 'Boleta médica de clínica con diagnóstico y sello de atención.',
      archivoNombre: 'boleta_medica_valeria.pdf',
      archivoTipo: 'application/pdf',
      archivoUrl: '../assets/documentos-ejemplo/recibo.pdf',
      estado: 'PENDIENTE',
      bloqueado: false,
      resolucionMotivo: null
    },
    {
      id: 102,
      idColaborador: diego?.idColaborador ?? 'COL-011',
      colaboradorNombre: diego ? name(diego) : 'Diego Paredes Ramos',
      colaboradorVisible: diego ? getVisibleIdentifier(diego) : 'Diego_Paredes.1024',
      idDepartamento: diego?.idDepartamento ?? 'DEP-002',
      idArea: diego?.idArea ?? 'ARE-005',
      tipo: 'TARDANZA',
      fechaEvento: calcDate(0), // hoy
      evidencia: 'Video de corte de suministro eléctrico y reporte técnico de avería en la zona.',
      archivoNombre: 'reporte_averia_corte.pdf',
      archivoTipo: 'application/pdf',
      archivoUrl: '../assets/documentos-ejemplo/copia.pdf',
      estado: 'PENDIENTE',
      bloqueado: false,
      resolucionMotivo: null
    },
    {
      id: 103,
      idColaborador: camila?.idColaborador ?? 'COL-012',
      colaboradorNombre: camila ? name(camila) : 'Camila Rojas Peña',
      colaboradorVisible: camila ? getVisibleIdentifier(camila) : 'Camila_Rojas.1025',
      idDepartamento: camila?.idDepartamento ?? 'DEP-002',
      idArea: camila?.idArea ?? 'ARE-006',
      tipo: 'TARDANZA',
      fechaEvento: calcDate(1),
      evidencia: 'Retraso por congestión vehicular sin documento probatorio.',
      archivoNombre: null,
      archivoTipo: null,
      archivoUrl: null,
      estado: 'INVALIDO',
      bloqueado: true,
      resolucionMotivo: 'Tardanza injustificada registrada.'
    },
    {
      id: 104,
      idColaborador: camila?.idColaborador ?? 'COL-012',
      colaboradorNombre: camila ? name(camila) : 'Camila Rojas Peña',
      colaboradorVisible: camila ? getVisibleIdentifier(camila) : 'Camila_Rojas.1025',
      idDepartamento: camila?.idDepartamento ?? 'DEP-002',
      idArea: camila?.idArea ?? 'ARE-006',
      tipo: 'TARDANZA',
      fechaEvento: calcDate(3),
      evidencia: 'Sin sustento.',
      archivoNombre: null,
      archivoTipo: null,
      archivoUrl: null,
      estado: 'INVALIDO',
      bloqueado: true,
      resolucionMotivo: 'Tardanza injustificada.'
    },
    {
      id: 105,
      idColaborador: camila?.idColaborador ?? 'COL-012',
      colaboradorNombre: camila ? name(camila) : 'Camila Rojas Peña',
      colaboradorVisible: camila ? getVisibleIdentifier(camila) : 'Camila_Rojas.1025',
      idDepartamento: camila?.idDepartamento ?? 'DEP-002',
      idArea: camila?.idArea ?? 'ARE-006',
      tipo: 'TARDANZA',
      fechaEvento: calcDate(5),
      evidencia: 'Llegada 25 minutos tarde sin aviso.',
      archivoNombre: null,
      archivoTipo: null,
      archivoUrl: null,
      estado: 'INVALIDO',
      bloqueado: true,
      resolucionMotivo: 'Acumula 3ra tardanza injustificada (equivale a 1 falta).'
    },
    {
      id: 106,
      idColaborador: luis?.idColaborador ?? 'COL-013',
      colaboradorNombre: luis ? name(luis) : 'Luis Fernando Torres',
      colaboradorVisible: luis ? getVisibleIdentifier(luis) : 'Luis_Fernando.1026',
      idDepartamento: luis?.idDepartamento ?? 'DEP-002',
      idArea: luis?.idArea ?? 'ARE-004',
      tipo: 'FALTA',
      fechaEvento: calcDate(4), // plazo vencido > 2d
      evidencia: 'No presentó justificación médica dentro del plazo máximo de 2 días.',
      archivoNombre: null,
      archivoTipo: null,
      archivoUrl: null,
      estado: 'INVALIDO',
      bloqueado: true,
      resolucionMotivo: 'Superó el plazo máximo permitido de 2 días calendario.'
    },
    {
      id: 107,
      idColaborador: luis?.idColaborador ?? 'COL-013',
      colaboradorNombre: luis ? name(luis) : 'Luis Fernando Torres',
      colaboradorVisible: luis ? getVisibleIdentifier(luis) : 'Luis_Fernando.1026',
      idDepartamento: luis?.idDepartamento ?? 'DEP-002',
      idArea: luis?.idArea ?? 'ARE-004',
      tipo: 'FALTA',
      fechaEvento: calcDate(7),
      evidencia: 'Ausencia injustificada sin reporte previo.',
      archivoNombre: null,
      archivoTipo: null,
      archivoUrl: null,
      estado: 'INVALIDO',
      bloqueado: true,
      resolucionMotivo: 'Segunda falta injustificada.'
    },
    {
      id: 108,
      idColaborador: luis?.idColaborador ?? 'COL-013',
      colaboradorNombre: luis ? name(luis) : 'Luis Fernando Torres',
      colaboradorVisible: luis ? getVisibleIdentifier(luis) : 'Luis_Fernando.1026',
      idDepartamento: luis?.idDepartamento ?? 'DEP-002',
      idArea: luis?.idArea ?? 'ARE-004',
      tipo: 'FALTA',
      fechaEvento: calcDate(10),
      evidencia: 'Tercera ausencia injustificada no justificada.',
      archivoNombre: null,
      archivoTipo: null,
      archivoUrl: null,
      estado: 'INVALIDO',
      bloqueado: true,
      resolucionMotivo: 'Tercera falta injustificada: incurre en causal de baja de la empresa.'
    },
    {
      id: 109,
      idColaborador: sam?.idColaborador ?? 'COL-002',
      colaboradorNombre: sam ? name(sam) : 'Sam Vega Sol',
      colaboradorVisible: sam ? getVisibleIdentifier(sam) : 'Sam_Vega.1102',
      idDepartamento: sam?.idDepartamento ?? 'DEP-001',
      idArea: sam?.idArea ?? 'ARE-002',
      tipo: 'FALTA',
      fechaEvento: calcDate(2),
      evidencia: 'Certificado de descanso médico emitido por EsSalud.',
      archivoNombre: 'descanso_medico_sam.pdf',
      archivoTipo: 'application/pdf',
      archivoUrl: '../assets/documentos-ejemplo/firma.pdf',
      estado: 'VALIDO',
      bloqueado: true,
      resolucionMotivo: 'Justificante médico revisado y validado dentro del plazo.'
    }
  ];

  saveData(demoRecords);
}

function renderKPIs(colaboradores, incidencias) {
  let countRiesgo = 0;
  let countBaja = 0;

  colaboradores.forEach(c => {
    const record = calcularRecordColaborador(c, incidencias);
    if (record.enCausalBaja) countBaja++;
    else if (record.faltasTotales > 0) countRiesgo++;
  });

  const pendingIncidencias = incidencias.filter(i => i.estado === 'PENDIENTE').length;

  $('#kpiActivos').textContent = colaboradores.length;
  $('#kpiRiesgo').textContent = countRiesgo;
  $('#kpiBajas').textContent = countBaja;
  $('#kpiPendientes').textContent = pendingIncidencias;
}

function render() {
  const incidencias = readData();
  const colaboradores = obtenerColaboradoresActivos();

  renderKPIs(colaboradores, incidencias);

  const query = norm($('#search').value);
  const dep = $('#department').value;
  const thead = $('#tableHead');
  const tbody = $('#rows');

  if (currentTab === 'control') {
    $('#listHint').textContent = 'Control de asistencia por colaborador: asistencias cumplidas, tardanzas (máx. 9, 3 = 1 falta) y faltas acumuladas (máx. 3 = causal de baja).';
    $('#tipoFilterContainer').hidden = true;
    $('#estadoFilterContainer').hidden = false;
    const estado = $('#estadoFilter').value;

    thead.innerHTML = `
      <tr>
        <th>Colaborador</th>
        <th>Ubicación</th>
        <th>Asistencias cumplidas</th>
        <th>Tardanzas injustificadas</th>
        <th>Faltas acumuladas</th>
        <th>Estado de permanencia</th>
        <th>Acción</th>
      </tr>
    `;

    const filtered = colaboradores.filter(c => {
      const matchQuery = norm(`${name(c)} ${c.codigoColaborador ?? ''} ${c.numeroDocumento ?? ''}`).includes(query);
      const matchDep = !dep || c.idDepartamento === dep;
      const record = calcularRecordColaborador(c, incidencias);

      let matchEstado = true;
      if (estado === 'NORMAL') matchEstado = record.faltasTotales === 0;
      else if (estado === 'ADVERTENCIA') matchEstado = record.faltasTotales === 1;
      else if (estado === 'RIESGO') matchEstado = record.faltasTotales === 2;
      else if (estado === 'BAJA') matchEstado = record.faltasTotales >= 3;

      return matchQuery && matchDep && matchEstado;
    });

    tbody.innerHTML = filtered.map(c => {
      const record = calcularRecordColaborador(c, incidencias);
      const idVis = getVisibleIdentifier(c);

      return `
        <tr class="tr-clickable" data-ver-record="${escape(c.idColaborador)}" title="Ver Dashboard de Asistencia de ${escape(name(c))}">
          <td>
            <strong>${escape(name(c))}</strong>
            <small>${escape(idVis)} · ${escape(c.tipoColaborador)}</small>
          </td>
          <td>
            ${escape(label(areas, c.idArea, 'idArea'))}
            <small>${escape(label(departamentos, c.idDepartamento, 'idDepartamento'))}</small>
          </td>
          <td>
            <div class="attendance-progress-container">
              <strong>${record.asistenciasCumplidas} / ${record.diasTotalesConvenio} días</strong>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill ${record.porcentajeAsistencia < 50 ? 'warning' : ''}" style="width: ${record.porcentajeAsistencia}%"></div>
              </div>
              <small>${record.porcentajeAsistencia}% completado (${record.metaHoras} h)</small>
            </div>
          </td>
          <td>
            <strong>${record.tardanzasInjustificadas} / ${record.maxTardanzasPermitidas} permitidas</strong>
            <small>${record.subtituloTardanzas}</small>
          </td>
          <td>
            <strong style="color:${record.faltasTotales >= 3 ? 'var(--red)' : record.faltasTotales === 2 ? 'var(--orange)' : record.faltasTotales === 1 ? 'var(--yellow)' : 'var(--navy)'};font-size:15px">
              ${record.faltasTotales} / ${MAX_FALTAS_PERMITIDAS} faltas
            </strong>
            <small>Directas: ${record.faltasDirectasInjustificadas} · Por tardanzas: +${record.faltasPorTardanzas}</small>
          </td>
          <td>
            <span class="badge ${record.nivelClase}">
              ${escape(record.estadoRiesgo)}
            </span>
            ${record.enCausalBaja ? '<small style="color:var(--red);font-weight:700">⚠️ Requiere inicio de desvinculación</small>' : ''}
          </td>
          <td>
            <button class="subtle" data-ver-record="${escape(c.idColaborador)}">Ver detalle / Dashboard</button>
          </td>
        </tr>
      `;
    }).join('');

    $('#empty').hidden = filtered.length > 0;
    $('#count').textContent = `${filtered.length} colaboradores en control`;

  } else if (currentTab === 'incidencias') {
    $('#listHint').textContent = 'Bandeja de incidencias reportadas (faltas y tardanzas). Plazo de 2 días para validar evidencias; si superan 2 días quedan automáticamente inválidas.';
    $('#tipoFilterContainer').hidden = false;
    $('#estadoFilterContainer').hidden = false;
    const tipo = $('#tipoFilter').value;
    const estado = $('#estadoFilter').value;

    thead.innerHTML = `
      <tr>
        <th>Colaborador</th>
        <th>Ubicación</th>
        <th>Tipo</th>
        <th>Fecha evento</th>
        <th>Días transcurridos</th>
        <th>Evidencia / Sustento</th>
        <th>Estado</th>
        <th>Acciones de Talento</th>
      </tr>
    `;

    const filtered = incidencias.filter(item => {
      const matchQuery = norm(`${item.colaboradorNombre} ${item.colaboradorVisible} ${item.evidencia} ${item.archivoNombre || ''}`).includes(query);
      const matchDep = !dep || item.idDepartamento === dep;
      const matchTipo = !tipo || item.tipo === tipo;
      const matchEstado = !estado || item.estado === estado;
      return matchQuery && matchDep && matchTipo && matchEstado;
    });

    tbody.innerHTML = filtered.map(item => {
      const dias = calcularDiasTranscurridos(item.fechaEvento);
      const plazoVencido = dias > PLAZO_MAXIMO_DIAS;

      let semaforoHTML = '<span class="badge amber">Pendiente</span>';
      if (item.estado === 'VALIDO') {
        semaforoHTML = '<span class="badge green">Justificado (Válido)</span>';
      } else if (item.estado === 'INVALIDO') {
        semaforoHTML = '<span class="badge red">Injustificado (Inválido)</span>';
      }

      const icono = obtenerIconoArchivo(item.archivoTipo, item.archivoNombre);
      const chipArchivoHTML = item.archivoNombre
        ? `<div><button type="button" class="attachment-chip" data-view-file="${escape(item.id)}" title="Previsualizar archivo adjunto">${icono} ${escape(item.archivoNombre)}</button></div>`
        : '<div style="font-size:10px;color:var(--muted);margin-top:4px">Sin archivo adjunto</div>';

      return `
        <tr>
          <td>
            <strong>${escape(item.colaboradorNombre)}</strong>
            <small>${escape(item.colaboradorVisible)} · ID ${escape(item.id)}</small>
          </td>
          <td>
            ${escape(label(areas, item.idArea, 'idArea'))}
            <small>${escape(label(departamentos, item.idDepartamento, 'idDepartamento'))}</small>
          </td>
          <td>
            <span class="badge ${item.tipo === 'FALTA' ? 'red' : 'amber'}">${escape(item.tipo)}</span>
          </td>
          <td>
            <strong>${escape(formatFechaDisplay(item.fechaEvento))}</strong>
          </td>
          <td>
            <strong>${dias} día(s)</strong>
            ${plazoVencido ? '<small style="color:var(--red);font-weight:700">Plazo vencido (> 2d)</small>' : '<small style="color:var(--green)">Dentro del plazo</small>'}
          </td>
          <td>
            <div>${escape(item.evidencia)}</div>
            ${chipArchivoHTML}
          </td>
          <td>
            ${semaforoHTML}
            ${item.resolucionMotivo ? `<small>${escape(item.resolucionMotivo)}</small>` : ''}
          </td>
          <td>
            <div class="action-group">
              ${!item.bloqueado ? `
                <button class="btn-green" data-action="VALIDO" data-id="${escape(item.id)}" title="Marcar como Justificado Válido (no penaliza)">Válido</button>
                <button class="btn-red" data-action="INVALIDO" data-id="${escape(item.id)}" title="Marcar como Injustificado Inválido (suma al récord)">Inválido</button>
              ` : `
                <span class="badge gray">Cerrado</span>
              `}
              <button class="subtle" type="button" data-solicitar-evidencia="${escape(item.id)}" title="Solicitar nueva evidencia al colaborador">Solicitar nueva evidencia</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    $('#empty').hidden = filtered.length > 0;
    $('#count').textContent = `${filtered.length} incidencias registradas`;
  }
}

function changeTab(next) {
  currentTab = next;
  document.querySelectorAll('[data-tab]').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.tab === currentTab));
  });

  const estadoSelect = $('#estadoFilter');
  const lblText = $('#lblEstadoFilterText');
  if (currentTab === 'control') {
    if (lblText) lblText.textContent = 'Estado de permanencia';
    estadoSelect.innerHTML = `
      <option value="">Todos los estados</option>
      <option value="NORMAL">Normal (0 faltas)</option>
      <option value="ADVERTENCIA">Advertencia (1 falta)</option>
      <option value="RIESGO">Riesgo crítico (2 faltas)</option>
      <option value="BAJA">Causal de baja (3+ faltas)</option>
    `;
  } else {
    if (lblText) lblText.textContent = 'Estado de validación';
    estadoSelect.innerHTML = `
      <option value="">Todos los estados</option>
      <option value="PENDIENTE">Pendientes</option>
      <option value="VALIDO">Válidos (Justificados)</option>
      <option value="INVALIDO">Inválidos (Injustificados)</option>
    `;
  }

  render();
}

function cambiarEstadoIncidencia(id, nuevoEstado) {
  const records = readData();
  const item = records.find(i => i.id === Number(id));
  if (!item || item.bloqueado) return;

  item.estado = nuevoEstado;
  item.bloqueado = true;
  item.resolucionMotivo = nuevoEstado === 'VALIDO'
    ? 'Justificación aprobada: no suma a las penalizaciones de faltas.'
    : 'Evaluado como injustificado: suma al récord de tardanzas/faltas acumuladas.';

  saveData(records);
  notice(`Incidencia ${item.id} marcada como ${nuevoEstado === 'VALIDO' ? 'Justificada Válida (Verde)' : 'Injustificada Inválida (Rojo)'}.`);
  render();
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

function generarLogsNoviembre(person, incidencias) {
  const colabIncs = incidencias.filter(i => i.idColaborador === person.idColaborador);

  const baseDias = [
    { fecha: '2026-11-02', marcado: '07:51:43', ingreso: '07:52:12', salida: '13:04:39' },
    { fecha: '2026-11-03', marcado: '07:52:39', ingreso: '07:52:52', salida: '13:01:00' },
    { fecha: '2026-11-04', marcado: '07:48:31', ingreso: '07:48:56', salida: '13:01:35' },
    { fecha: '2026-11-05', marcado: '07:51:30', ingreso: '07:51:54', salida: '13:01:04' },
    { fecha: '2026-11-06', marcado: '07:53:15', ingreso: '07:53:40', salida: '13:02:11' },
    { fecha: '2026-11-09', marcado: '07:49:10', ingreso: '07:49:32', salida: '13:01:50' },
    { fecha: '2026-11-10', marcado: '07:50:44', ingreso: '07:51:05', salida: '13:03:22' },
    { fecha: '2026-11-11', marcado: '07:52:18', ingreso: '07:52:45', salida: '13:00:58' },
    { fecha: '2026-11-12', marcado: '07:47:50', ingreso: '07:48:15', salida: '13:02:30' },
    { fecha: '2026-11-13', marcado: '07:51:02', ingreso: '07:51:25', salida: '13:01:15' },
    { fecha: '2026-11-16', marcado: '07:53:40', ingreso: '07:54:02', salida: '13:02:40' },
    { fecha: '2026-11-17', marcado: '07:50:12', ingreso: '07:50:35', salida: '13:00:10' }
  ];

  return baseDias.map(dia => {
    const inc = colabIncs.find(i => i.fechaEvento === dia.fecha);
    if (inc) {
      if (inc.tipo === 'TARDANZA') {
        return {
          fecha: dia.fecha,
          estado: 'Tardanza',
          marcado: '08:24:15',
          ingreso: '08:24:40',
          salida: '13:02:15',
          incidencia: inc
        };
      }
      if (inc.tipo === 'FALTA') {
        return {
          fecha: dia.fecha,
          estado: 'Falta',
          marcado: '—',
          ingreso: '—',
          salida: '—',
          incidencia: inc
        };
      }
    }
    return {
      fecha: dia.fecha,
      estado: 'Puntual',
      marcado: dia.marcado,
      ingreso: dia.ingreso,
      salida: dia.salida,
      incidencia: null
    };
  });
}

function renderDonutSvg(totalPuntuales, totalTardanzas, faltasInj, faltasJust, totalSinMarcar) {
  const total = totalPuntuales + totalTardanzas + faltasInj + faltasJust + totalSinMarcar || 1;
  const C = 2 * Math.PI * 60; // 376.99
  const items = [
    { count: totalPuntuales, color: '#16a34a' },
    { count: totalTardanzas, color: '#f59e0b' },
    { count: faltasInj, color: '#dc2626' },
    { count: faltasJust, color: '#f87171' },
    { count: totalSinMarcar, color: '#64748b' }
  ];

  let offset = 0;
  const slicesHtml = items.map(item => {
    if (item.count <= 0) return '';
    const fraction = item.count / total;
    const len = fraction * C;
    const dash = `${len.toFixed(2)} ${(C - len).toFixed(2)}`;
    const currentOffset = offset;
    offset += len;
    return `<circle cx="100" cy="100" r="60" class="donut-slice" stroke="${item.color}" stroke-dasharray="${dash}" stroke-dashoffset="${(-currentOffset).toFixed(2)}" />`;
  }).join('');

  const pctPuntual = Math.round((totalPuntuales / total) * 100);

  return `
    <div class="donut-container">
      <svg class="donut-svg" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="60" class="donut-ring-bg" />
        ${slicesHtml}
        <text x="100" y="93" text-anchor="middle" class="donut-center-sub">TOTAL</text>
        <text x="100" y="122" text-anchor="middle" class="donut-center-num">${totalPuntuales + totalTardanzas}</text>
      </svg>
      <div class="donut-badge-pct">${pctPuntual}%</div>
    </div>
  `;
}

function renderCalendarioNoviembre(logs) {
  const mapLogs = {};
  logs.forEach(l => { mapLogs[l.fecha] = l; });

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
      cls = 'today';
    } else if (d < 17) {
      const log = mapLogs[dateStr];
      if (log) {
        if (log.estado === 'Puntual') cls = 'punctual';
        else if (log.estado === 'Tardanza') cls = 'tardanza';
        else if (log.estado === 'Falta') cls = 'falta';
      } else {
        cls = 'punctual';
      }
    }

    cellsHtml += `<div class="cal-day-cell ${cls}">${d}</div>`;
  }

  return cellsHtml;
}

function abrirRecordDetalle(idColaborador, page = 1) {
  currentRecordColabId = idColaborador;
  dashCurrentPage = page;

  const colabs = obtenerColaboradores();
  const person = colabs.find(c => c.idColaborador === idColaborador);
  if (!person) throw new Error('Colaborador no encontrado.');

  populateDashColabDropdown(idColaborador);

  const incidencias = readData();
  const incs = incidencias.filter(i => i.idColaborador === idColaborador);
  const record = calcularRecordColaborador(person, incidencias);
  const idVis = getVisibleIdentifier(person);

  const logs = generarLogsNoviembre(person, incidencias);

  const totalPuntuales = logs.filter(l => l.estado === 'Puntual').length;
  const totalTardanzas = logs.filter(l => l.estado === 'Tardanza').length;
  const totalFaltas = logs.filter(l => l.estado === 'Falta').length;
  const totalAsistencias = totalPuntuales + totalTardanzas;
  const totalSinMarcar = 0;

  const faltasInjustificadas = record.faltasDirectasInjustificadas;
  const faltasJustificadas = record.faltasJustificadas;

  let rankingPos = 19;
  if (person.codigoColaborador === '1101') rankingPos = 3;
  else if (person.codigoColaborador === '1102') rankingPos = 7;
  else if (person.codigoColaborador === '1023') rankingPos = 5;
  else if (person.codigoColaborador === '1024') rankingPos = 12;
  else if (person.codigoColaborador === '1025') rankingPos = 19;
  else if (person.codigoColaborador === '1026') rankingPos = 38;
  else {
    const codeNum = parseInt(person.codigoColaborador, 10);
    rankingPos = !isNaN(codeNum) ? (codeNum % 25) + 1 : 15;
  }

  const rachaDias = (totalFaltas > 0 || totalTardanzas > 0) ? 0 : 12;
  let porcentajeDesempeno = '57.14';
  if (person.codigoColaborador === '1025') {
    porcentajeDesempeno = '57.14';
  } else if (totalFaltas > 0) {
    porcentajeDesempeno = ((totalPuntuales / 12) * 50).toFixed(2);
  } else if (totalTardanzas > 0) {
    porcentajeDesempeno = '57.14';
  } else {
    porcentajeDesempeno = '91.67';
  }

  // Paginación de la tabla
  const totalPages = Math.ceil(logs.length / DASH_PAGE_SIZE) || 1;
  const clampedPage = Math.min(totalPages, Math.max(1, page));
  dashCurrentPage = clampedPage;
  const startIdx = (clampedPage - 1) * DASH_PAGE_SIZE;
  const pageLogs = logs.slice(startIdx, startIdx + DASH_PAGE_SIZE);

  const tableRowsHtml = pageLogs.map(l => {
    let pillCls = 'puntual';
    if (l.estado === 'Tardanza') pillCls = 'tardanza';
    else if (l.estado === 'Falta') pillCls = 'falta';

    return `
      <tr>
        <td>${escape(l.fecha)}</td>
        <td><span class="state-pill ${pillCls}">${escape(l.estado)}</span></td>
        <td>${escape(l.marcado)}</td>
        <td>${escape(l.ingreso)}</td>
        <td>${escape(l.salida)}</td>
      </tr>
    `;
  }).join('');

  const calendarDaysHtml = renderCalendarioNoviembre(logs);
  const donutHtml = renderDonutSvg(totalPuntuales, totalTardanzas, faltasInjustificadas, faltasJustificadas, totalSinMarcar);

  let bannerHTML = '';
  if (record.enCausalBaja) {
    bannerHTML = `
      <div class="alert-banner red" style="margin-bottom:14px">
        <strong>⚠️ ATENCIÓN: CAUSAL DE BAJA POR 3 FALTAS ACUMULADAS</strong>
        <span>Este practicante ha superado el límite disciplinario permitido (${record.faltasTotales} faltas acumuladas). Procede registrar su desvinculación en el módulo de Bajas (Blacklist).</span>
      </div>
    `;
  } else if (record.faltasTotales === 2) {
    bannerHTML = `
      <div class="alert-banner yellow" style="margin-bottom:14px">
        <strong>⚠️ RIESGO CRÍTICO: 2 DE 3 FALTAS ACUMULADAS</strong>
        <span>El colaborador se encuentra a una falta o tardanzas adicionales de ser retirado de la empresa.</span>
      </div>
    `;
  } else {
    bannerHTML = `
      <div class="alert-banner green" style="margin-bottom:14px">
        <strong>SITUACIÓN DISCIPLINARIA: ${escape(record.estadoRiesgo.toUpperCase())}</strong>
        <span>Cumplimiento regular de asistencias y jornadas acordadas del convenio.</span>
      </div>
    `;
  }

  $('#recordDetalleBody').innerHTML = `
    <!-- Encabezado del Dashboard individual -->
    <header class="dash-view-header">
      <div class="dash-view-title-wrap">
        <h1>Dashboard Asistencia</h1>
        <p>Monitorea tu asistencia para mejorar tu puntualidad. · <strong>${escape(name(person))}</strong> (${escape(idVis)})</p>
      </div>
      <div class="dash-filter-pills">
        <div class="dash-pill-btn" title="Periodo de consulta">
          <span>📅</span>
          <span>Periodo: <strong>Mensual</strong></span>
          <span class="dash-pill-arrow">▾</span>
        </div>
        <div class="dash-pill-btn" title="Rango de fechas">
          <span>📅</span>
          <span>Rango: <strong>01/11/2026 - 30/11/2026</strong></span>
          <span class="dash-pill-arrow">▾</span>
        </div>
        <button type="button" class="dash-pill-clear" id="btnDashResetFilters">
          ✕ Limpiar filtros
        </button>
      </div>
    </header>

    <!-- Fila de 5 Tarjetas KPIs -->
    <section class="dash-kpi-grid" aria-label="Métricas de asistencia mensual">
      <div class="dash-kpi-item">
        <div class="dash-kpi-top">
          <div class="dash-kpi-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div class="dash-kpi-value">${totalAsistencias}</div>
        </div>
        <div class="dash-kpi-label">Total Asistencias</div>
      </div>

      <div class="dash-kpi-item">
        <div class="dash-kpi-top">
          <div class="dash-kpi-icon" style="color:#16a34a;background:#ecfdf5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div class="dash-kpi-value">${totalPuntuales}</div>
        </div>
        <div class="dash-kpi-sparkline">
          <svg viewBox="0 0 140 34" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sparkGreenGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#22c55e" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#22c55e" stop-opacity="0.0"/>
              </linearGradient>
            </defs>
            <path d="M0,28 Q45,26 80,14 T140,5" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M0,28 Q45,26 80,14 T140,5 L140,34 L0,34 Z" fill="url(#sparkGreenGlow)"/>
          </svg>
        </div>
        <div class="dash-kpi-label">Total Puntuales</div>
      </div>

      <div class="dash-kpi-item">
        <div class="dash-kpi-top">
          <div class="dash-kpi-icon" style="color:#ca8a04;background:#fefce8">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="dash-kpi-value">${totalTardanzas}</div>
        </div>
        <div class="dash-kpi-sparkline">
          <svg viewBox="0 0 140 34" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sparkYellowGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#eab308" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#eab308" stop-opacity="0.0"/>
              </linearGradient>
            </defs>
            <path d="M0,26 Q40,24 80,18 T140,12" fill="none" stroke="#eab308" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M0,26 Q40,24 80,18 T140,12 L140,34 L0,34 Z" fill="url(#sparkYellowGlow)"/>
          </svg>
        </div>
        <div class="dash-kpi-label">Total Tardanzas</div>
      </div>

      <div class="dash-kpi-item">
        <div class="dash-kpi-top">
          <div class="dash-kpi-icon" style="color:#dc2626;background:#fef2f2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <div class="dash-kpi-value">${totalFaltas}</div>
        </div>
        <div class="dash-kpi-sparkline">
          <svg viewBox="0 0 140 34" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sparkRedGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#ef4444" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#ef4444" stop-opacity="0.0"/>
              </linearGradient>
            </defs>
            <path d="M0,14 Q40,18 80,24 T140,28" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M0,14 Q40,18 80,24 T140,28 L140,34 L0,34 Z" fill="url(#sparkRedGlow)"/>
          </svg>
        </div>
        <div class="dash-kpi-label">Total Faltas</div>
      </div>

      <div class="dash-kpi-item">
        <div class="dash-kpi-top">
          <div class="dash-kpi-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 8 14"/></svg>
          </div>
          <div class="dash-kpi-value">${totalSinMarcar}</div>
        </div>
        <div class="dash-kpi-sparkline">
          <svg viewBox="0 0 140 34" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sparkSlateGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#64748b" stop-opacity="0.2"/>
                <stop offset="100%" stop-color="#64748b" stop-opacity="0.0"/>
              </linearGradient>
            </defs>
            <path d="M0,14 Q40,18 80,24 T140,28" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M0,14 Q40,18 80,24 T140,28 L140,34 L0,34 Z" fill="url(#sparkSlateGlow)"/>
          </svg>
        </div>
        <div class="dash-kpi-label">Total Sin Marcar</div>
      </div>
    </section>

    <!-- Fila 1: Calendario de asistencia y Mi Desempeño -->
    <div class="dash-two-cols">
      <!-- Calendario de asistencia -->
      <div class="dash-card">
        <div class="dash-card-title">
          <span style="font-size:18px">📅</span> Calendario de asistencia
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
          ${calendarDaysHtml}
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

      <!-- Mi Desempeño -->
      <div class="dash-card">
        <div class="dash-card-title">
          <span style="font-size:18px">📊</span> Mi Desempeño
        </div>
        <div class="perf-subgrid">
          <div class="perf-item">
            <div class="perf-item-text">
              <span>Top del ranking</span>
              <strong>N° ${rankingPos}</strong>
            </div>
            <div class="perf-item-icon">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L13.5 5.5L17.5 6L14.5 9L15.5 13L12 11L8.5 13L9.5 9L6.5 6L10.5 5.5L12 2Z" fill="#3b82f6"/>
                <rect x="2" y="14" width="6" height="8" rx="1.5" fill="#93c5fd"/>
                <rect x="9" y="10" width="6" height="12" rx="1.5" fill="#3b82f6"/>
                <rect x="16" y="16" width="6" height="6" rx="1.5" fill="#bfdbfe"/>
              </svg>
            </div>
          </div>
          <div class="perf-item">
            <div class="perf-item-text">
              <span>Racha de días consecutivos</span>
              <strong>${rachaDias} días</strong>
            </div>
            <div class="perf-item-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <circle cx="12" cy="12" r="5"/>
                <circle cx="12" cy="12" r="2" fill="#1e293b"/>
                <path d="M19 5L14 10"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="perf-progress-wrap">
          <div class="perf-progress-bar-bg">
            <div class="perf-progress-bar-fill" style="width: ${porcentajeDesempeno}%">
              ${porcentajeDesempeno}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fila 2: Registro de Asistencia y Distribución de asistencia -->
    <div class="dash-two-cols">
      <!-- Registro de Asistencia -->
      <div class="dash-card">
        <div class="dash-card-title">
          <span style="font-size:18px">📅</span> Registro de Asistencia
        </div>
        <div class="dash-table-wrap">
          <table class="dash-records-tbl">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Marcado</th>
                <th>Ingreso</th>
                <th>Salida</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>
        </div>
        <div class="dash-pagination">
          <button type="button" class="btn-dash-page" id="btnDashPagePrev" ${clampedPage <= 1 ? 'disabled' : ''}>
            ‹ ANTERIOR
          </button>
          <span class="page-label">PÁGINA ${clampedPage} DE ${totalPages}</span>
          <button type="button" class="btn-dash-page next active" id="btnDashPageNext" ${clampedPage >= totalPages ? 'disabled' : ''}>
            SIGUIENTE ›
          </button>
        </div>
      </div>

      <!-- Distribución de asistencia -->
      <div class="dash-card">
        <div class="dash-card-title">
          <span style="font-size:18px">🕒</span> Distribución de asistencia
        </div>
        <div class="dist-body">
          ${donutHtml}
          <div class="dist-legend-list">
            <div class="dist-legend-item">
              <div class="dist-item-label">
                <span class="dist-dot green"></span>
                <span>Puntualidad</span>
              </div>
              <div class="dist-item-val">
                <span>${totalPuntuales}</span>
                <span>👤</span>
              </div>
            </div>
            <div class="dist-legend-item">
              <div class="dist-item-label">
                <span class="dist-dot orange"></span>
                <span>Tardanzas</span>
              </div>
              <div class="dist-item-val">
                <span>${totalTardanzas}</span>
                <span>👤</span>
              </div>
            </div>
            <div class="dist-legend-item">
              <div class="dist-item-label">
                <span class="dist-dot red"></span>
                <span>Faltas Injustificadas</span>
              </div>
              <div class="dist-item-val">
                <span>${faltasInjustificadas}</span>
                <span>👤</span>
              </div>
            </div>
            <div class="dist-legend-item">
              <div class="dist-item-label">
                <span class="dist-dot coral"></span>
                <span>Faltas Justificadas</span>
              </div>
              <div class="dist-item-val">
                <span>${faltasJustificadas}</span>
                <span>👤</span>
              </div>
            </div>
            <div class="dist-legend-item">
              <div class="dist-item-label">
                <span class="dist-dot blue"></span>
                <span>Sin Marcar</span>
              </div>
              <div class="dist-item-val">
                <span>${totalSinMarcar}</span>
                <span>👤</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de Evaluación Disciplinaria de Talento Humano -->
    <section class="dash-th-eval-card" aria-label="Control disciplinario institucional">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <h3 style="margin:0;font-size:16px;color:#080832">Control y récord disciplinario · Talento Humano</h3>
        <span class="badge ${record.nivelClase}" style="font-size:11px;padding:6px 12px">${escape(record.estadoRiesgo)}</span>
      </div>

      ${bannerHTML}

      <div class="record-summary-grid">
        <div class="record-summary-card">
          <span>Convenio de prácticas</span>
          <strong>${record.asistenciasCumplidas} / ${record.diasTotalesConvenio} días</strong>
          <small>${record.porcentajeAsistencia}% avance (${record.metaHoras} h)</small>
        </div>
        <div class="record-summary-card">
          <span>Tardanzas permitidas</span>
          <strong>${record.tardanzasInjustificadas} / ${record.maxTardanzasPermitidas} máx</strong>
          <small>${record.subtituloTardanzas}</small>
        </div>
        <div class="record-summary-card">
          <span>Faltas acumuladas</span>
          <strong style="color:${record.faltasTotales >= 3 ? 'var(--red)' : record.faltasTotales === 2 ? 'var(--orange)' : 'var(--navy)'}">
            ${record.faltasTotales} / ${MAX_FALTAS_PERMITIDAS} faltas
          </strong>
          <small>${record.faltasDirectasInjustificadas} directas + ${record.faltasPorTardanzas} por tardanzas</small>
        </div>
      </div>

      <h4 style="margin:16px 0 10px;font-size:13px;color:#080832">Incidencias y evidencias archivadas</h4>
      ${incs.length > 0 ? `
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Sustento / Evidencia</th>
                <th>Estado de validación</th>
                <th>Evidencia</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              ${incs.map(i => `
                <tr>
                  <td><strong>${escape(formatFechaDisplay(i.fechaEvento))}</strong></td>
                  <td><span class="badge ${i.tipo === 'FALTA' ? 'red' : 'amber'}">${escape(i.tipo)}</span></td>
                  <td>${escape(i.evidencia)}</td>
                  <td>
                    <span class="badge ${i.estado === 'VALIDO' ? 'green' : i.estado === 'INVALIDO' ? 'red' : 'amber'}">
                      ${escape(i.estado === 'VALIDO' ? 'Justificado Válido' : i.estado === 'INVALIDO' ? 'Injustificado Inválido' : 'Pendiente')}
                    </span>
                    ${i.resolucionMotivo ? `<small>${escape(i.resolucionMotivo)}</small>` : ''}
                  </td>
                  <td>
                    ${i.archivoNombre ? `<button type="button" class="attachment-chip" data-view-file="${escape(i.id)}">${obtenerIconoArchivo(i.archivoTipo, i.archivoNombre)} ${escape(i.archivoNombre)}</button>` : '<span style="font-size:11px;color:var(--muted)">Sin adjunto</span>'}
                  </td>
                  <td>
                    <button class="subtle" type="button" data-solicitar-evidencia="${escape(i.id)}" style="font-size:11px;padding:5px 10px">Solicitar nueva evidencia</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : '<p class="hint" style="margin:8px 0 0">Sin incidencias ni faltas registradas. El colaborador mantiene récord disciplinario limpio.</p>'}
    </section>
  `;

  $('#modalRecordDetalle').showModal();
}

function calcularDiasModal() {
  const fechaInput = $('#nuevaFecha').value;
  const lblDias = $('#lblDiasCalculados');
  const lblEstado = $('#lblEstadoPlazo');

  if (!fechaInput) {
    lblDias.textContent = '0 día(s)';
    lblEstado.textContent = 'Selecciona una fecha válida.';
    lblEstado.style.color = 'var(--muted)';
    return;
  }

  const dias = calcularDiasTranscurridos(fechaInput);

  if (dias < 0) {
    lblDias.textContent = `${dias} días (Fecha futura)`;
    lblEstado.textContent = '⚠️ La fecha no puede ser posterior a hoy.';
    lblEstado.style.color = 'var(--red)';
    return;
  }

  lblDias.textContent = `${dias} día(s) transcurrido(s)`;

  if (dias <= PLAZO_MAXIMO_DIAS) {
    lblEstado.textContent = '✅ Dentro del plazo permitido (Máximo 2 días). Se registrará como PENDIENTE.';
    lblEstado.style.color = 'var(--green)';
  } else {
    lblEstado.textContent = '❌ Supera el plazo de 2 días. Se marcará automáticamente como INJUSTIFICADO (INVÁLIDO).';
    lblEstado.style.color = 'var(--red)';
  }
}

function abrirModalNuevaIncidencia() {
  populateCollaboratorsDropdown();
  $('#nuevaFecha').value = todayStr();
  $('#nuevaEvidencia').value = '';
  $('#nuevaArchivo').value = '';
  $('#nuevaArchivoInfo').textContent = 'Ningún archivo seleccionado';
  $('#nuevaArchivoInfo').style.color = '';
  $('#nuevaError').textContent = '';
  calcularDiasModal();
  $('#modalNuevaIncidencia').showModal();
}

function guardarNuevaIncidencia(formData) {
  const idColaborador = formData.get('idColaborador');
  const tipo = formData.get('tipo');
  const fecha = formData.get('fecha');
  const evidencia = formData.get('evidencia')?.trim() || 'Sin descripción adicional.';

  if (!idColaborador) throw new Error('Por favor selecciona un colaborador.');
  if (!fecha) throw new Error('Por favor selecciona la fecha del evento.');

  const dias = calcularDiasTranscurridos(fecha);
  if (dias < 0) throw new Error('La fecha del evento no puede ser futura.');

  const colabs = obtenerColaboradores();
  const person = colabs.find(p => p.idColaborador === idColaborador);
  if (!person) throw new Error('No se encontró el colaborador seleccionado.');

  const fileInput = $('#nuevaArchivo');
  let archivoNombre = null;
  let archivoTipo = null;
  let archivoUrl = null;

  if (fileInput.files && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    archivoNombre = file.name;
    archivoTipo = file.type;
    archivoUrl = URL.createObjectURL(file);
  }

  let estadoInicial = 'PENDIENTE';
  let bloqueadoInicial = false;
  let resolucionMotivo = null;

  if (dias > PLAZO_MAXIMO_DIAS) {
    estadoInicial = 'INVALIDO';
    bloqueadoInicial = true;
    resolucionMotivo = 'Registro automático: supera el plazo de justificación de 2 días.';
  }

  const records = readData();
  const nuevoRegistro = {
    id: Date.now(),
    idColaborador: person.idColaborador,
    colaboradorNombre: name(person),
    colaboradorVisible: getVisibleIdentifier(person),
    idDepartamento: person.idDepartamento,
    idArea: person.idArea,
    tipo,
    fechaEvento: fecha,
    evidencia,
    archivoNombre,
    archivoTipo,
    archivoUrl,
    estado: estadoInicial,
    bloqueado: bloqueadoInicial,
    resolucionMotivo
  };

  records.unshift(nuevoRegistro);
  saveData(records);

  $('#modalNuevaIncidencia').close();
  notice(`Incidencia registrada para ${nuevoRegistro.colaboradorNombre} (${nuevoRegistro.tipo} - ${estadoInicial === 'INVALIDO' ? 'Inválido por superar 2 días' : 'Pendiente de revisión'}).`);
  render();
}

function verAdjunto(id) {
  const records = readData();
  const item = records.find(i => i.id === Number(id));
  if (!item || !item.archivoNombre) return;

  const cuerpo = $('#visorCuerpo');
  $('#visorTitulo').textContent = `Evidencia: ${item.archivoNombre}`;

  if (item.archivoUrl) {
    if (item.archivoTipo && item.archivoTipo.startsWith('image/')) {
      cuerpo.innerHTML = `<img src="${item.archivoUrl}" alt="Evidencia" style="max-width:100%;max-height:400px;border-radius:8px;border:1px solid var(--border)">`;
    } else if (item.archivoTipo && item.archivoTipo.startsWith('video/')) {
      cuerpo.innerHTML = `<video src="${item.archivoUrl}" controls style="max-width:100%;max-height:400px;border-radius:8px"></video>`;
    } else if (item.archivoTipo === 'application/pdf') {
      cuerpo.innerHTML = `
        <iframe src="${item.archivoUrl}" style="width:100%;height:380px;border:1px solid var(--border);border-radius:8px"></iframe>
        <div style="margin-top:10px">
          <a href="${item.archivoUrl}" target="_blank" rel="noopener" class="primary" style="display:inline-block;padding:8px 14px;border-radius:8px;text-decoration:none;color:white">Abrir PDF en pestaña nueva ↗</a>
        </div>
      `;
    } else {
      cuerpo.innerHTML = `
        <p style="margin-bottom:12px">Documento adjunto: <strong>${escape(item.archivoNombre)}</strong></p>
        <a href="${item.archivoUrl}" download="${escape(item.archivoNombre)}" class="primary" style="display:inline-block;padding:8px 14px;border-radius:8px;text-decoration:none;color:white">Descargar documento</a>
      `;
    }
  } else {
    cuerpo.innerHTML = `
      <div style="padding:24px;background:#f8fafc;border-radius:10px;border:1px solid var(--border)">
        <p style="font-size:18px;margin-bottom:8px">${obtenerIconoArchivo(item.archivoTipo, item.archivoNombre)} <strong>${escape(item.archivoNombre)}</strong></p>
        <p style="font-size:12px;color:var(--muted)">Archivo de evidencia registrado en el sistema para <strong>${escape(item.colaboradorNombre)}</strong>.</p>
      </div>
    `;
  }

  $('#modalVisor').showModal();
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

      if (b.id === 'btnDashPagePrev') {
        if (dashCurrentPage > 1) {
          abrirRecordDetalle(currentRecordColabId, dashCurrentPage - 1);
        }
        return;
      }

      if (b.id === 'btnDashPageNext') {
        abrirRecordDetalle(currentRecordColabId, dashCurrentPage + 1);
        return;
      }

      if (b.id === 'btnDashResetFilters') {
        notice('Filtros del dashboard de asistencia restablecidos al mes de Noviembre 2026.');
        abrirRecordDetalle(currentRecordColabId, 1);
        return;
      }

      if (b.dataset.tab) {
        changeTab(b.dataset.tab);
        return;
      }

      if (b.dataset.verRecord) {
        abrirRecordDetalle(b.dataset.verRecord, 1);
        return;
      }

      if (b.id === 'btnNuevaIncidencia') {
        abrirModalNuevaIncidencia();
        return;
      }

      if (b.id === 'btnExaminarArchivo') {
        $('#nuevaArchivo').click();
        return;
      }

      if (b.dataset.viewFile) {
        verAdjunto(b.dataset.viewFile);
        return;
      }

      if (b.dataset.solicitarEvidencia) {
        // Puesto sin funcionalidad activa por el momento, conforme a lo solicitado
        return;
      }

      if (b.dataset.action && b.dataset.id) {
        cambiarEstadoIncidencia(b.dataset.id, b.dataset.action);
        return;
      }
      return;
    }

    // Clic en fila completa del colaborador
    const row = event.target.closest('tr.tr-clickable');
    if (row && row.dataset.verRecord) {
      abrirRecordDetalle(row.dataset.verRecord, 1);
    }
  } catch (err) {
    notice(err.message, true);
  }
});

$('#dashColabSelect')?.addEventListener('change', event => {
  if (event.target.value) {
    abrirRecordDetalle(event.target.value, 1);
  }
});

$('#nuevaArchivo').addEventListener('change', event => {
  const input = event.target;
  const label = $('#nuevaArchivoInfo');
  if (input.files && input.files.length > 0) {
    label.textContent = input.files[0].name;
    label.style.color = 'var(--primary)';
    label.style.fontWeight = '600';
  } else {
    label.textContent = 'Ningún archivo seleccionado';
    label.style.color = '';
    label.style.fontWeight = '';
  }
});

$('#nuevaFecha').addEventListener('change', calcularDiasModal);

$('#formNuevaIncidencia').addEventListener('submit', event => {
  event.preventDefault();
  try {
    $('#nuevaError').textContent = '';
    guardarNuevaIncidencia(new FormData(event.target));
  } catch (err) {
    $('#nuevaError').textContent = err.message;
  }
});

['#search', '#department', '#tipoFilter', '#estadoFilter'].forEach(selector => {
  $(selector).addEventListener(selector === '#search' ? 'input' : 'change', () => {
    try { render(); } catch (err) { notice(err.message, true); }
  });
});

window.addEventListener('storage', event => {
  if (event.key === KEY_ASISTENCIAS || event.key === 'th_colaboradores' || event.key === null) {
    render();
  }
});

try {
  populateDepartments();
  cargarAsistenciasDemostracion();
  changeTab('control');
} catch (err) {
  notice(err.message, true);
}
