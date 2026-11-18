/**
 * Gestión de Sanciones y Medidas Disciplinarias - Talento Humano
 * Registro y revocación/borrado de sanciones (asistencia, tiempo hablado, tiempo de conexión, conducta/falta de respeto)
 * con exigencia obligatoria del motivo en cada operación para auditoría institucional.
 */

import {
  obtenerColaboradores,
  obtenerNombreDepartamento,
  obtenerNombreArea,
  obtenerNombreRol
} from "../shared/js/colaboradoresStorage.js";

const STORAGE_KEY_SANCIONES = "th_sanciones_v1";

const DEFAULT_SANCIONES = [
  {
    id: "sanc-2026-001",
    idColaborador: "COL-004", // Dani Cruz Mar
    codigoColaborador: "1104",
    nombreColaborador: "Dani Cruz Mar",
    departamento: "Desarrollo Web",
    area: "Backend",
    tipo: "Amonestación escrita",
    categoria: "Asistencia y faltas",
    documento: "AMON-2026-001",
    fechaIncidencia: "2026-11-09",
    fechaEmision: "2026-11-11",
    motivo: "Primera falta injustificada registrada el 09/11/2026 sin presentación de sustento médico ni justificación laboral dentro del plazo reglamentario de 2 días hábiles.",
    impacto: "Anotación en legajo (Sin extensión)",
    responsable: "Área de Talento Humano - Lic. Patricia Ramos",
    evidencia: "Reporte de asistencia mensual de Noviembre 2026 / Faltas consecutivas",
    estado: "Activa",
    fechaRevocacion: null,
    motivoRevocacion: null,
    revocadoPor: null
  },
  {
    id: "sanc-2026-002",
    idColaborador: "COL-005", // Robin Neri Solis
    codigoColaborador: "1105",
    nombreColaborador: "Robin Neri Solis",
    departamento: "Desarrollo Web",
    area: "Frontend",
    tipo: "1er Memorándum (+1 día convenio)",
    categoria: "Tiempo hablado",
    documento: "MEMO-2026-002",
    fechaIncidencia: "2026-11-12",
    fechaEmision: "2026-11-14",
    motivo: "Reincidencia en permanencia con micrófono silenciado durante jornadas colaborativas de desarrollo frontend sin justificación técnica ni aviso al líder, registrando un déficit severo de horas habladas (solo 0.63h acumuladas).",
    impacto: "+1 día adicional al convenio",
    responsable: "Área de Talento Humano - Coordinación Disciplinaria",
    evidencia: "Métricas de tiempo hablado de canales de voz Discord del 12/11 al 14/11",
    estado: "Activa",
    fechaRevocacion: null,
    motivoRevocacion: null,
    revocadoPor: null
  },
  {
    id: "sanc-2026-003",
    idColaborador: "COL-006", // Ari León Vidal
    codigoColaborador: "1106",
    nombreColaborador: "Ari León Vidal",
    departamento: "Desarrollo Web",
    area: "Base de Datos",
    tipo: "Amonestación escrita",
    categoria: "Tiempo de conexión",
    documento: "AMON-2026-002",
    fechaIncidencia: "2026-11-14",
    fechaEmision: "2026-11-15",
    motivo: "Desconexión intempestiva e injustificada de la plataforma a las 10:45 am acumulando menos de 3.5 horas de jornada en dos días consecutivos sin reporte previo de incidencia técnica ni aviso a Talento Humano.",
    impacto: "Anotación en legajo (Sin extensión)",
    responsable: "Área de Talento Humano - Monitoreo de Permanencia",
    evidencia: "Log de conexiones del sistema de asistencia diaria (marcación incompleta)",
    estado: "Activa",
    fechaRevocacion: null,
    motivoRevocacion: null,
    revocadoPor: null
  },
  {
    id: "sanc-2026-004",
    idColaborador: "COL-002", // Sam Vega Sol
    codigoColaborador: "1102",
    nombreColaborador: "Sam Vega Sol",
    departamento: "Talento Humano",
    area: "Capacitación",
    tipo: "Amonestación escrita",
    categoria: "Conducta y respeto",
    documento: "AMON-2026-003",
    fechaIncidencia: "2026-11-12",
    fechaEmision: "2026-11-13",
    motivo: "Falta de respeto y empleo de tono descomedido hacia un compañero de equipo durante la sesión general de coordinación de capacitación del 12/11/2026, contraviniendo el Código de Convivencia y Respeto Mutuo institucional.",
    impacto: "Anotación en legajo (Sin extensión)",
    responsable: "Jefatura de Talento Humano - Devdatep",
    evidencia: "Acta de incidencia de reunión y manifestación de los integrantes del equipo",
    estado: "Activa",
    fechaRevocacion: null,
    motivoRevocacion: null,
    revocadoPor: null
  },
  {
    id: "sanc-2026-005",
    idColaborador: "COL-001", // Alex Ríos Luna
    codigoColaborador: "1101",
    nombreColaborador: "Alex Ríos Luna",
    departamento: "Talento Humano",
    area: "Reclutamiento",
    tipo: "Amonestación escrita",
    categoria: "Tiempo hablado",
    documento: "AMON-2026-004",
    fechaIncidencia: "2026-11-05",
    fechaEmision: "2026-11-05",
    motivo: "No ingresar a sala de voz ni registrar participación durante la jornada matutina del 05/11/2026.",
    impacto: "Anotación en legajo (Sin extensión)",
    responsable: "Talento Humano - Supervisión",
    evidencia: "Reporte automático de presencia en canal Discord",
    estado: "Revocada",
    fechaRevocacion: "2026-11-06",
    motivoRevocacion: "Se admitió y validó informe técnico de corte intempestivo de fibra óptica del proveedor de internet del colaborador, sustentado con constancia y número de ticket de avería oficial.",
    revocadoPor: "Talento Humano (Reconsideración técnica validada)"
  }
];

/**
 * Persistencia en localStorage
 */
function getSanciones() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SANCIONES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SANCIONES, JSON.stringify(DEFAULT_SANCIONES));
      return [...DEFAULT_SANCIONES];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...DEFAULT_SANCIONES];
  } catch (err) {
    console.error("Error al leer sanciones de localStorage:", err);
    return [...DEFAULT_SANCIONES];
  }
}

function saveSanciones(list) {
  try {
    localStorage.setItem(STORAGE_KEY_SANCIONES, JSON.stringify(list));
  } catch (err) {
    console.error("Error al guardar sanciones en localStorage:", err);
  }
}

// Variables de estado
let currentTab = "activas"; // 'activas' | 'revocadas'
let activeSancionesList = [];
let targetSancionToRevoke = null;

// Elementos del DOM
const elements = {
  tabActivas: document.getElementById("tabActivas"),
  tabRevocadas: document.getElementById("tabRevocadas"),
  viewActivas: document.getElementById("viewActivas"),
  viewRevocadas: document.getElementById("viewRevocadas"),
  badgeTabActivas: document.getElementById("badgeTabActivas"),
  badgeTabRevocadas: document.getElementById("badgeTabRevocadas"),

  // KPIs
  kpiSancionesActivas: document.getElementById("kpiSancionesActivas"),
  kpiAmonestaciones: document.getElementById("kpiAmonestaciones"),
  kpiMemorandums: document.getElementById("kpiMemorandums"),
  kpiBajas: document.getElementById("kpiBajas"),
  kpiSubActivas: document.getElementById("kpiSubActivas"),

  // Status
  status: document.getElementById("status"),

  // Filtros Tab 1
  searchSanciones: document.getElementById("searchSanciones"),
  filterCategoria: document.getElementById("filterCategoria"),
  filterTipo: document.getElementById("filterTipo"),
  btnNuevaSancion: document.getElementById("btnNuevaSancion"),
  rowsActivas: document.getElementById("rowsActivas"),
  emptyActivas: document.getElementById("emptyActivas"),
  footerCountActivas: document.getElementById("footerCountActivas"),

  // Filtros Tab 2
  searchRevocadas: document.getElementById("searchRevocadas"),
  rowsRevocadas: document.getElementById("rowsRevocadas"),
  emptyRevocadas: document.getElementById("emptyRevocadas"),
  footerCountRevocadas: document.getElementById("footerCountRevocadas"),

  // Modal Nueva Sanción
  modalNuevaSancion: document.getElementById("modalNuevaSancion"),
  formNuevaSancion: document.getElementById("formNuevaSancion"),
  sancionColaborador: document.getElementById("sancionColaborador"),
  sancionCategoria: document.getElementById("sancionCategoria"),
  sancionTipo: document.getElementById("sancionTipo"),
  sancionDocumento: document.getElementById("sancionDocumento"),
  sancionFechaIncidencia: document.getElementById("sancionFechaIncidencia"),
  sancionMotivo: document.getElementById("sancionMotivo"),
  sancionImpacto: document.getElementById("sancionImpacto"),
  sancionResponsable: document.getElementById("sancionResponsable"),
  sancionEvidencia: document.getElementById("sancionEvidencia"),
  formNuevaError: document.getElementById("formNuevaError"),
  btnSubmitSancion: document.getElementById("btnSubmitSancion"),

  // Modal Revocar / Borrar Sanción
  modalRevocarSancion: document.getElementById("modalRevocarSancion"),
  formRevocarSancion: document.getElementById("formRevocarSancion"),
  revocarTargetCard: document.getElementById("revocarTargetCard"),
  revocarSancionId: document.getElementById("revocarSancionId"),
  revocarMotivo: document.getElementById("revocarMotivo"),
  revocarAccion: document.getElementById("revocarAccion"),
  formRevocarError: document.getElementById("formRevocarError"),
  btnConfirmRevocar: document.getElementById("btnConfirmRevocar"),

  // Modal Detalle
  modalDetalleSancion: document.getElementById("modalDetalleSancion"),
  detalleContent: document.getElementById("detalleContent")
};

/**
 * Mostrar mensaje toast accesible
 */
function showStatus(message, type = "success") {
  if (!elements.status) return;
  elements.status.className = type;
  elements.status.textContent = message;
  elements.status.style.display = "block";
  setTimeout(() => {
    elements.status.style.display = "none";
  }, 4500);
}

/**
 * Cambio de pestaña
 */
function setTab(tab) {
  currentTab = tab;
  if (tab === "activas") {
    elements.tabActivas.setAttribute("aria-pressed", "true");
    elements.tabRevocadas.setAttribute("aria-pressed", "false");
    elements.viewActivas.hidden = false;
    elements.viewRevocadas.hidden = true;
    renderActivas();
  } else {
    elements.tabActivas.setAttribute("aria-pressed", "false");
    elements.tabRevocadas.setAttribute("aria-pressed", "true");
    elements.viewActivas.hidden = true;
    elements.viewRevocadas.hidden = false;
    renderRevocadas();
  }
}

/**
 * Cargar opciones de colaboradores en el selector de la nueva sanción
 */
function populateColaboradoresSelect() {
  const colabs = obtenerColaboradores();
  elements.sancionColaborador.innerHTML = '<option value="">-- Selecciona un colaborador --</option>';

  colabs.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.idColaborador;
    const dpto = obtenerNombreDepartamento(c.idDepartamento) || "Sin dpto";
    const area = obtenerNombreArea(c.idArea) || "General";
    opt.textContent = `${c.nombres} ${c.apellidoPaterno} ${c.apellidoMaterno} (Cód: ${c.codigoColaborador}) - ${area} [${dpto}]`;
    opt.dataset.codigo = c.codigoColaborador;
    opt.dataset.nombre = `${c.nombres} ${c.apellidoPaterno} ${c.apellidoMaterno}`;
    opt.dataset.departamento = dpto;
    opt.dataset.area = area;
    elements.sancionColaborador.appendChild(opt);
  });
}

/**
 * Renderizar KPIs
 */
function updateKPIs(list) {
  const activas = list.filter(s => s.estado === "Activa");
  const revocadas = list.filter(s => s.estado === "Revocada");

  const amonestaciones = activas.filter(s => s.tipo.includes("Amonestación")).length;
  const memorandums = activas.filter(s => s.tipo.includes("Memorándum")).length;
  const bajas = activas.filter(s => s.tipo.includes("Baja") || s.tipo.includes("Suspensión")).length;

  if (elements.kpiSancionesActivas) elements.kpiSancionesActivas.textContent = `${activas.length} activas`;
  if (elements.kpiAmonestaciones) elements.kpiAmonestaciones.textContent = `${amonestaciones} emitidas`;
  if (elements.kpiMemorandums) elements.kpiMemorandums.textContent = `${memorandums} emitidos`;
  if (elements.kpiBajas) elements.kpiBajas.textContent = `${bajas} en proceso`;

  if (elements.badgeTabActivas) elements.badgeTabActivas.textContent = activas.length;
  if (elements.badgeTabRevocadas) elements.badgeTabRevocadas.textContent = revocadas.length;
}

/**
 * Retorna la clase CSS del pill de tipo de sanción
 */
function getTipoPillClass(tipo) {
  if (tipo.includes("Amonestación")) return "pill-amonestacion";
  if (tipo.includes("Memorándum")) return "pill-memo";
  if (tipo.includes("Suspensión")) return "pill-suspension";
  if (tipo.includes("Baja")) return "pill-baja";
  return "pill-amonestacion";
}

/**
 * Retorna la clase CSS del pill de categoría
 */
function getCategoriaPillClass(cat) {
  if (cat.includes("Asistencia")) return "pill-cat-asistencia";
  if (cat.includes("Tiempo hablado")) return "pill-cat-hablado";
  if (cat.includes("Tiempo de conexión")) return "pill-cat-conexion";
  if (cat.includes("Conducta")) return "pill-cat-conducta";
  if (cat.includes("Rendimiento")) return "pill-cat-rendimiento";
  return "pill-cat-asistencia";
}

/**
 * Renderizar Vista 1: Sanciones Activas
 */
function renderActivas() {
  const list = getSanciones();
  updateKPIs(list);

  const activas = list.filter(s => s.estado === "Activa");
  const query = (elements.searchSanciones.value || "").trim().toLowerCase();
  const catFilter = elements.filterCategoria.value;
  const tipoFilter = elements.filterTipo.value;

  // Filtrado
  const filtered = activas.filter(s => {
    if (catFilter !== "TODOS" && s.categoria !== catFilter) return false;
    if (tipoFilter !== "TODOS" && s.tipo !== tipoFilter) return false;

    if (query) {
      const matchName = (s.nombreColaborador || "").toLowerCase().includes(query);
      const matchCode = (s.codigoColaborador || "").toLowerCase().includes(query);
      const matchDoc = (s.documento || "").toLowerCase().includes(query);
      const matchMotivo = (s.motivo || "").toLowerCase().includes(query);
      const matchArea = (s.area || "").toLowerCase().includes(query);
      if (!matchName && !matchCode && !matchDoc && !matchMotivo && !matchArea) {
        return false;
      }
    }
    return true;
  });

  elements.rowsActivas.innerHTML = "";

  if (filtered.length === 0) {
    elements.emptyActivas.hidden = false;
  } else {
    elements.emptyActivas.hidden = true;

    filtered.forEach(s => {
      const tr = document.createElement("tr");

      const tipoClass = getTipoPillClass(s.tipo);
      const catClass = getCategoriaPillClass(s.categoria);

      tr.innerHTML = `
        <td>
          <div class="colab-name">${escapeHTML(s.nombreColaborador)}</div>
          <div class="colab-sub">Cód: ${escapeHTML(s.codigoColaborador)} · ${escapeHTML(s.area)} (${escapeHTML(s.departamento)})</div>
        </td>
        <td>
          <span class="pill ${tipoClass}">${escapeHTML(s.tipo)}</span>
        </td>
        <td>
          <span class="pill ${catClass}">${escapeHTML(s.categoria)}</span>
        </td>
        <td class="motivo-cell">
          <span class="motivo-tag">${escapeHTML(s.impacto || "Medida formal")}</span>
          <div class="motivo-desc" title="${escapeHTML(s.motivo)}">${escapeHTML(s.motivo)}</div>
        </td>
        <td>
          <span class="pill pill-cat-asistencia" style="font-family:monospace;font-weight:700;">${escapeHTML(s.documento)}</span>
        </td>
        <td>
          <span style="font-variant-numeric:tabular-nums;font-weight:600;">${escapeHTML(s.fechaEmision || s.fechaIncidencia)}</span>
        </td>
        <td>
          <div class="action-buttons">
            <button type="button" class="btn-detail" data-action="view" data-id="${s.id}" title="Ver cédula y expediente disciplinario">
              👁️ Ver detalle
            </button>
            <button type="button" class="btn-danger" data-action="revoke" data-id="${s.id}" title="Revocar o borrar sanción ingresando motivo">
              🗑️ Revocar / Borrar
            </button>
          </div>
        </td>
      `;

      elements.rowsActivas.appendChild(tr);
    });
  }

  elements.footerCountActivas.textContent = `${filtered.length} sanción(es) vigentes en este listado`;
}

/**
 * Renderizar Vista 2: Sanciones Revocadas / Anuladas
 */
function renderRevocadas() {
  const list = getSanciones();
  updateKPIs(list);

  const revocadas = list.filter(s => s.estado === "Revocada");
  const query = (elements.searchRevocadas.value || "").trim().toLowerCase();

  const filtered = revocadas.filter(s => {
    if (!query) return true;
    const matchName = (s.nombreColaborador || "").toLowerCase().includes(query);
    const matchDoc = (s.documento || "").toLowerCase().includes(query);
    const matchMotivo = (s.motivo || "").toLowerCase().includes(query);
    const matchRevMotivo = (s.motivoRevocacion || "").toLowerCase().includes(query);
    return matchName || matchDoc || matchMotivo || matchRevMotivo;
  });

  elements.rowsRevocadas.innerHTML = "";

  if (filtered.length === 0) {
    elements.emptyRevocadas.hidden = false;
  } else {
    elements.emptyRevocadas.hidden = true;

    filtered.forEach(s => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>
          <div class="colab-name">${escapeHTML(s.nombreColaborador)}</div>
          <div class="colab-sub">Cód: ${escapeHTML(s.codigoColaborador)} · ${escapeHTML(s.area)}</div>
        </td>
        <td>
          <span class="pill pill-amonestacion" style="text-decoration:line-through;opacity:0.8;">${escapeHTML(s.tipo)}</span>
          <div class="colab-sub">${escapeHTML(s.documento)}</div>
        </td>
        <td>
          <span class="pill ${getCategoriaPillClass(s.categoria)}">${escapeHTML(s.categoria)}</span>
        </td>
        <td class="motivo-cell">
          <div class="motivo-desc" title="${escapeHTML(s.motivo)}">${escapeHTML(s.motivo)}</div>
        </td>
        <td class="motivo-cell">
          <div class="motivo-revocacion-box">
            <strong>Motivo de anulación:</strong> ${escapeHTML(s.motivoRevocacion || "Sin justificación registrada")}
            <div style="font-size:11px;margin-top:3px;color:#555;">Por: ${escapeHTML(s.revocadoPor || "Talento Humano")}</div>
          </div>
        </td>
        <td>
          <span style="font-variant-numeric:tabular-nums;font-weight:600;">${escapeHTML(s.fechaRevocacion || "-")}</span>
        </td>
        <td>
          <button type="button" class="btn-detail" data-action="view" data-id="${s.id}" title="Ver expediente">
            👁️ Ver histórico
          </button>
        </td>
      `;

      elements.rowsRevocadas.appendChild(tr);
    });
  }

  elements.footerCountRevocadas.textContent = `${filtered.length} registro(s) en auditoría de revocaciones`;
}

/**
 * Abrir modal de Registro de Nueva Sanción
 */
function openModalNueva() {
  elements.formNuevaError.style.display = "none";
  elements.formNuevaError.textContent = "";

  // Reset campos
  elements.sancionColaborador.value = "";
  elements.sancionCategoria.value = "Asistencia y faltas";
  elements.sancionTipo.value = "Amonestación escrita";
  elements.sancionMotivo.value = "";
  elements.sancionImpacto.value = "Anotación en legajo (Sin extensión)";
  elements.sancionEvidencia.value = "";

  const today = new Date().toISOString().slice(0, 10);
  elements.sancionFechaIncidencia.value = today;

  // Sugerir código de documento correlativo
  const list = getSanciones();
  const count = list.length + 1;
  const pad = String(count).padStart(3, "0");
  elements.sancionDocumento.value = `SANC-2026-${pad}`;

  openDialog(elements.modalNuevaSancion);
}

/**
 * Manejador de Submit de Nueva Sanción
 */
function handleNuevaSancionSubmit(e) {
  e.preventDefault();
  elements.formNuevaError.style.display = "none";

  const colabSelect = elements.sancionColaborador;
  const idColaborador = colabSelect.value;
  const selectedOption = colabSelect.selectedOptions[0];

  const categoria = elements.sancionCategoria.value;
  const tipo = elements.sancionTipo.value;
  const documento = elements.sancionDocumento.value.trim();
  const fechaIncidencia = elements.sancionFechaIncidencia.value;
  const motivo = elements.sancionMotivo.value.trim();
  const impacto = elements.sancionImpacto.value;
  const responsable = elements.sancionResponsable.value.trim();
  const evidencia = elements.sancionEvidencia.value.trim();

  // Validaciones
  if (!idColaborador) {
    showFormError(elements.formNuevaError, "Debes seleccionar a un colaborador para aplicar la medida disciplinaria.");
    return;
  }
  if (!documento) {
    showFormError(elements.formNuevaError, "Ingresa un número o código de documento formal (ej. MEMO-2026-005).");
    return;
  }
  if (!fechaIncidencia) {
    showFormError(elements.formNuevaError, "Por favor especifica la fecha en que ocurrió la incidencia.");
    return;
  }

  // VALIDACIÓN ESTRICTA DEL MOTIVO (Exigencia del usuario)
  if (!motivo || motivo.length < 10) {
    showFormError(elements.formNuevaError, "Es obligatorio fundamentar detalladamente el motivo de la sanción (mínimo 10 caracteres).");
    return;
  }

  const nombreColaborador = selectedOption ? selectedOption.dataset.nombre : "Colaborador";
  const codigoColaborador = selectedOption ? selectedOption.dataset.codigo : "0000";
  const departamento = selectedOption ? selectedOption.dataset.departamento : "General";
  const area = selectedOption ? selectedOption.dataset.area : "General";

  const today = new Date().toISOString().slice(0, 10);

  const nueva = {
    id: "sanc-" + Date.now(),
    idColaborador,
    codigoColaborador,
    nombreColaborador,
    departamento,
    area,
    tipo,
    categoria,
    documento,
    fechaIncidencia,
    fechaEmision: today,
    motivo,
    impacto,
    responsable,
    evidencia: evidencia || "Registro interno en plataforma de Talento Humano",
    estado: "Activa",
    fechaRevocacion: null,
    motivoRevocacion: null,
    revocadoPor: null
  };

  const list = getSanciones();
  list.unshift(nueva);
  saveSanciones(list);

  closeDialog(elements.modalNuevaSancion);
  renderActivas();
  showStatus(`Sanción ${documento} registrada con éxito para ${nombreColaborador}.`, "success");
}

/**
 * Abrir modal de Revocación / Borrado de Sanción
 */
function openModalRevocar(id) {
  const list = getSanciones();
  const sancion = list.find(s => s.id === id);
  if (!sancion) return;

  targetSancionToRevoke = sancion;
  elements.revocarSancionId.value = sancion.id;
  elements.revocarMotivo.value = "";
  elements.revocarAccion.value = "REVOCAR";
  elements.formRevocarError.style.display = "none";

  elements.revocarTargetCard.innerHTML = `
    <div style="font-size:11px;font-weight:750;letter-spacing:1px;color:var(--red);margin-bottom:6px;">SANCIÓN SELECCIONADA PARA ANULAR / BORRAR</div>
    <div style="font-size:15px;font-weight:700;color:var(--navy);">${escapeHTML(sancion.nombreColaborador)} <span style="font-size:12px;color:var(--muted);font-weight:normal;">(Cód: ${escapeHTML(sancion.codigoColaborador)} - ${escapeHTML(sancion.area)})</span></div>
    <div style="margin-top:6px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
      <span class="pill ${getTipoPillClass(sancion.tipo)}">${escapeHTML(sancion.tipo)}</span>
      <span class="pill ${getCategoriaPillClass(sancion.categoria)}">${escapeHTML(sancion.categoria)}</span>
      <span style="font-size:12px;font-weight:600;color:var(--muted);">Doc: ${escapeHTML(sancion.documento)}</span>
    </div>
    <div style="margin-top:8px;font-size:12.5px;color:#475467;background:white;padding:8px 12px;border-radius:8px;border:1px solid #fedf89;">
      <strong>Motivo registrado original:</strong> ${escapeHTML(sancion.motivo)}
    </div>
  `;

  openDialog(elements.modalRevocarSancion);
  elements.revocarMotivo.focus();
}

/**
 * Confirmar revocación / borrado de sanción
 */
function handleRevocarSancionSubmit(e) {
  e.preventDefault();
  elements.formRevocarError.style.display = "none";

  const id = elements.revocarSancionId.value;
  const motivoRevocacion = elements.revocarMotivo.value.trim();
  const accion = elements.revocarAccion.value;

  // EXIGENCIA OBLIGATORIA DEL MOTIVO (Requisito explícito del usuario)
  if (!motivoRevocacion || motivoRevocacion.length < 10) {
    showFormError(elements.formRevocarError, "Es estrictamente obligatorio ingresar el motivo y sustento por el cual se revoca o borra la sanción (mínimo 10 caracteres).");
    return;
  }

  let list = getSanciones();
  const index = list.findIndex(s => s.id === id);
  if (index === -1) return;

  const sancion = list[index];
  const today = new Date().toISOString().slice(0, 10);

  if (accion === "REVOCAR") {
    // Anulación con trazabilidad en historial
    list[index] = {
      ...sancion,
      estado: "Revocada",
      fechaRevocacion: today,
      motivoRevocacion: motivoRevocacion,
      revocadoPor: "Talento Humano (Reconsideración fundamentada)"
    };
    saveSanciones(list);
    showStatus(`La sanción ${sancion.documento} ha sido revocada. Motivo registrado en auditoría.`, "info");
  } else {
    // Borrado definitivo del registro
    list.splice(index, 1);
    saveSanciones(list);
    showStatus(`La sanción ${sancion.documento} fue eliminada del padrón. Motivo asentado: "${motivoRevocacion.slice(0, 50)}..."`, "danger");
  }

  closeDialog(elements.modalRevocarSancion);
  if (currentTab === "activas") {
    renderActivas();
  } else {
    renderRevocadas();
  }
}

/**
 * Mostrar Cédula de Notificación / Detalle del Expediente
 */
function openModalDetalle(id) {
  const list = getSanciones();
  const s = list.find(item => item.id === id);
  if (!s) return;

  const isRevocada = s.estado === "Revocada";

  elements.detalleContent.innerHTML = `
    <div class="cedula-header">
      <div>
        <div style="font-size:12px;font-weight:750;letter-spacing:1.5px;color:#1e3a8a;">DEVDATEP CONSULTING · TALENTO HUMANO</div>
        <div style="font-size:18px;font-weight:750;color:var(--navy);margin-top:4px;">Cédula de Medida Disciplinaria N° ${escapeHTML(s.documento)}</div>
      </div>
      <div class="cedula-badge" style="${isRevocada ? 'background:#fee4e2;color:#b42318;' : 'background:#ecfdf3;color:#027a48;'}">
        ${isRevocada ? "ESTADO: REVOCADA / ANULADA" : "ESTADO: ACTIVA / VIGENTE"}
      </div>
    </div>

    <div class="cedula-grid">
      <div>
        <div class="cedula-label">Colaborador Sancionado</div>
        <div class="cedula-value">${escapeHTML(s.nombreColaborador)}</div>
        <div style="font-size:11.5px;color:var(--muted)">Código: ${escapeHTML(s.codigoColaborador)}</div>
      </div>
      <div>
        <div class="cedula-label">Departamento / Área</div>
        <div class="cedula-value">${escapeHTML(s.departamento)}</div>
        <div style="font-size:11.5px;color:var(--muted)">Especialidad: ${escapeHTML(s.area)}</div>
      </div>
      <div>
        <div class="cedula-label">Tipo de Medida</div>
        <div><span class="pill ${getTipoPillClass(s.tipo)}">${escapeHTML(s.tipo)}</span></div>
      </div>
      <div>
        <div class="cedula-label">Origen / Categoría</div>
        <div><span class="pill ${getCategoriaPillClass(s.categoria)}">${escapeHTML(s.categoria)}</span></div>
      </div>
      <div>
        <div class="cedula-label">Fecha de Incidencia</div>
        <div class="cedula-value">${escapeHTML(s.fechaIncidencia)}</div>
      </div>
      <div>
        <div class="cedula-label">Fecha de Emisión de Notificación</div>
        <div class="cedula-value">${escapeHTML(s.fechaEmision || s.fechaIncidencia)}</div>
      </div>
    </div>

    <div>
      <div class="cedula-label">Fundamentación de los Hechos y Motivo Oficial</div>
      <div class="cedula-motivo-box">
        ${escapeHTML(s.motivo)}
      </div>
    </div>

    <div class="cedula-grid">
      <div>
        <div class="cedula-label">Impacto Legal / Convenio</div>
        <div class="cedula-value">${escapeHTML(s.impacto || "Anotación en legajo personal")}</div>
      </div>
      <div>
        <div class="cedula-label">Evidencia y Sustento Adjunto</div>
        <div class="cedula-value" style="font-weight:normal;color:#475467;">${escapeHTML(s.evidencia || "Registro de plataforma")}</div>
      </div>
    </div>

    ${isRevocada ? `
      <div style="background:#fff5f5;border:1px solid #fecaca;border-radius:8px;padding:14px;">
        <div style="font-size:11.5px;font-weight:750;color:#991b1b;margin-bottom:4px;">RESOLUCIÓN DE REVOCACIÓN / ANULACIÓN:</div>
        <div style="font-size:13px;color:#7f1d1d;"><strong>Motivo:</strong> ${escapeHTML(s.motivoRevocacion)}</div>
        <div style="font-size:11.5px;color:#991b1b;margin-top:6px;">Fecha de revocación: ${escapeHTML(s.fechaRevocacion)} · Autorizado por: ${escapeHTML(s.revocadoPor)}</div>
      </div>
    ` : ""}

    <div class="cedula-firma">
      <div>
        <strong>Emitido por:</strong> ${escapeHTML(s.responsable || "Área de Talento Humano")}<br>
        Devdatep Consulting S.A.C.
      </div>
      <div style="text-align:right;">
        <strong>Conformidad legal:</strong> Reglamento Interno de Prácticas<br>
        Ley N° 28518 y D.Leg. N° 713
      </div>
    </div>
  `;

  openDialog(elements.modalDetalleSancion);
}

function showFormError(elem, msg) {
  elem.textContent = msg;
  elem.style.display = "block";
}

function openDialog(dlg) {
  if (typeof dlg.showModal === "function") {
    dlg.showModal();
  } else {
    dlg.setAttribute("open", "");
  }
}

function closeDialog(dlg) {
  if (typeof dlg.close === "function") {
    dlg.close();
  } else {
    dlg.removeAttribute("open");
  }
}

function escapeHTML(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Inicialización
 */
function init() {
  populateColaboradoresSelect();

  // Tabs
  elements.tabActivas.addEventListener("click", () => setTab("activas"));
  elements.tabRevocadas.addEventListener("click", () => setTab("revocadas"));

  // Filtros Tab 1
  elements.searchSanciones.addEventListener("input", renderActivas);
  elements.filterCategoria.addEventListener("change", renderActivas);
  elements.filterTipo.addEventListener("change", renderActivas);

  // Filtros Tab 2
  elements.searchRevocadas.addEventListener("input", renderRevocadas);

  // Botón nueva sanción
  elements.btnNuevaSancion.addEventListener("click", openModalNueva);

  // Submit nueva sanción
  elements.formNuevaSancion.addEventListener("submit", handleNuevaSancionSubmit);

  // Submit revocar / borrar
  elements.formRevocarSancion.addEventListener("submit", handleRevocarSancionSubmit);

  // Delegación de clics en filas (Ver Detalle / Revocar)
  elements.rowsActivas.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === "view") openModalDetalle(id);
    if (action === "revoke") openModalRevocar(id);
  });

  elements.rowsRevocadas.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === "view") openModalDetalle(id);
  });

  // Botones de cierre genéricos
  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => {
      const modalId = btn.dataset.close;
      const modal = document.getElementById(modalId);
      if (modal) closeDialog(modal);
    });
  });

  // Render inicial
  renderActivas();
}

// Arrancar al cargar el DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
