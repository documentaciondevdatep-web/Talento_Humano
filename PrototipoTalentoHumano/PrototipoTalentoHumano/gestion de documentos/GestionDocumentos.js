/**
 * MÓDULO: GESTIÓN DE DOCUMENTOS
 * Sistema de Talento Humano - Prototipo
 */

const RECORDS_KEY = "gestionDocumentos_registros";
const HISTORY_KEY = "gestionDocumentos_historial";
const VERSION_KEY = "gestionDocumentos_version";
const CURRENT_VERSION = "v4_history_grouped_and_edit";

// Cinco tipos de documentos requeridos
const DOCUMENT_TYPES = [
  "Certificado de prácticas preprofesionales",
  "Carta de recomendación",
  "Carta de respuesta",
  "Carta de aceptación",
  "Constancia de prácticas preprofesionales"
];

// Generador de fechas relativas para garantizar que los colaboradores próximos a culminar
// tengan un máximo de 5 días restantes a menos en cualquier momento
function formatOffsetDate(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatPastOffsetDate(monthsOffset) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Datos ficticios iniciales de demostración
// Conserva a Nayeli Pérez con ID "971", área "Administración" y colaboradores existentes
// Todos los colaboradores próximos a culminar tienen un máximo de 5 días restantes a menos
const demoCollaborators = [
  {
    id: "1101",
    name: "Alex Ríos Luna",
    area: "Reclutamiento",
    startDate: formatPastOffsetDate(6),
    endDate: formatOffsetDate(1), // 1 día restante (Completo - figurará en Historial)
    observations: "Sin incidencias disciplinarias registradas. Desempeño destacado en convocatorias de talento. Documentación de prácticas completa.",
    documents: {
      "Certificado de prácticas preprofesionales": { status: "Generado", date: formatOffsetDate(-3), customNote: "" },
      "Carta de recomendación": { status: "Generado", date: formatOffsetDate(-3), customNote: "" },
      "Carta de respuesta": { status: "Generado", date: formatOffsetDate(-8), customNote: "" },
      "Carta de aceptación": { status: "Generado", date: formatOffsetDate(-15), customNote: "" },
      "Constancia de prácticas preprofesionales": { status: "Generado", date: formatOffsetDate(-2), customNote: "" }
    }
  },
  {
    id: "971",
    name: "Nayeli Pérez",
    area: "Administración",
    startDate: formatPastOffsetDate(6),
    endDate: formatOffsetDate(2), // 2 días restantes (En proceso)
    observations: "Sin memorándums ni sanciones en su expediente. Cumplimiento del 98% en asistencia y puntualidad. Desempeño favorable en soporte administrativo.",
    documents: {
      "Certificado de prácticas preprofesionales": { status: "Pendiente", date: null, customNote: "" },
      "Carta de recomendación": { status: "Pendiente", date: null, customNote: "" },
      "Carta de respuesta": { status: "Generado", date: formatOffsetDate(-5), customNote: "" },
      "Carta de aceptación": { status: "Generado", date: formatOffsetDate(-12), customNote: "" },
      "Constancia de prácticas preprofesionales": { status: "Pendiente", date: null, customNote: "" }
    }
  },
  {
    id: "1102",
    name: "Sam Vega Sol",
    area: "Capacitación",
    startDate: formatPastOffsetDate(5),
    endDate: formatOffsetDate(3), // 3 días restantes (Pendiente)
    observations: "1 tardanza justificada en el registro mensual. Sin sanciones ni memorándums. Responsable en el diseño de sesiones formativas.",
    documents: {
      "Certificado de prácticas preprofesionales": { status: "Pendiente", date: null, customNote: "" },
      "Carta de recomendación": { status: "Pendiente", date: null, customNote: "" },
      "Carta de respuesta": { status: "Pendiente", date: null, customNote: "" },
      "Carta de aceptación": { status: "Pendiente", date: null, customNote: "" },
      "Constancia de prácticas preprofesionales": { status: "Pendiente", date: null, customNote: "" }
    }
  },
  {
    id: "1103",
    name: "Noa Paz Rey",
    area: "Clima y Cultura",
    startDate: formatPastOffsetDate(6),
    endDate: formatOffsetDate(4), // 4 días restantes (En proceso)
    observations: "Sin antecedentes disciplinarios. Participación activa en actividades de integración y monitoreo de clima organizacional.",
    documents: {
      "Certificado de prácticas preprofesionales": { status: "Pendiente", date: null, customNote: "" },
      "Carta de recomendación": { status: "Pendiente", date: null, customNote: "" },
      "Carta de respuesta": { status: "Generado", date: formatOffsetDate(-7), customNote: "" },
      "Carta de aceptación": { status: "Generado", date: formatOffsetDate(-16), customNote: "" },
      "Constancia de prácticas preprofesionales": { status: "Pendiente", date: null, customNote: "" }
    }
  },
  {
    id: "1104",
    name: "Dani Cruz Mar",
    area: "Backend",
    startDate: formatPastOffsetDate(5),
    endDate: formatOffsetDate(5), // 5 días restantes (Pendiente)
    observations: "Sin llamadas de atención. Entregables técnicos de arquitectura y base de datos concluidos a conformidad del líder de equipo.",
    documents: {
      "Certificado de prácticas preprofesionales": { status: "Pendiente", date: null, customNote: "" },
      "Carta de recomendación": { status: "Pendiente", date: null, customNote: "" },
      "Carta de respuesta": { status: "Pendiente", date: null, customNote: "" },
      "Carta de aceptación": { status: "Pendiente", date: null, customNote: "" },
      "Constancia de prácticas preprofesionales": { status: "Pendiente", date: null, customNote: "" }
    }
  },
  {
    id: "1105",
    name: "Robin Neri Solís",
    area: "Frontend",
    startDate: formatPastOffsetDate(5),
    endDate: formatOffsetDate(5), // 5 días restantes (En proceso)
    observations: "Asistencia al 99%. Sin amonestaciones registradas. Prototipos de interfaces visuales entregados con buena calidad técnica.",
    documents: {
      "Certificado de prácticas preprofesionales": { status: "Pendiente", date: null, customNote: "" },
      "Carta de recomendación": { status: "Pendiente", date: null, customNote: "" },
      "Carta de respuesta": { status: "Pendiente", date: null, customNote: "" },
      "Carta de aceptación": { status: "Generado", date: formatOffsetDate(-9), customNote: "" },
      "Constancia de prácticas preprofesionales": { status: "Pendiente", date: null, customNote: "" }
    }
  }
];

// Variables de estado
let activeTab = "collaborators";
let selectedCollaboratorId = null;

// Selectores y utilidades
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[character]));

const normalize = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.error("No se pudo leer el almacenamiento del módulo:", error);
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("No se pudo guardar el almacenamiento del módulo:", error);
  }
}

/**
 * Inicialización y migración si existían datos con esquema previo o versión desactualizada
 */
function initializeData() {
  const version = localStorage.getItem(VERSION_KEY);
  const currentRecords = readJson(RECORDS_KEY, null);

  if (version !== CURRENT_VERSION || !currentRecords || !Array.isArray(currentRecords) || !currentRecords.length || !currentRecords[0].documents) {
    writeJson(RECORDS_KEY, demoCollaborators);
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  }
}

function getCollaborators() {
  return readJson(RECORDS_KEY, demoCollaborators);
}

function saveCollaborators(data) {
  writeJson(RECORDS_KEY, data);
}

/**
 * Determina el estado documental global del colaborador
 */
function getDocumentalStatus(collab) {
  if (!collab || !collab.documents) return "Pendiente";
  const statuses = DOCUMENT_TYPES.map((type) => collab.documents[type]?.status || "Pendiente");
  const generatedCount = statuses.filter((st) => st === "Generado").length;
  if (generatedCount === DOCUMENT_TYPES.length) return "Completo";
  if (generatedCount > 0) return "En proceso";
  return "Pendiente";
}

/**
 * Calcula los días restantes para la fecha de culminación
 */
function calculateDaysRemaining(endDateStr) {
  if (!endDateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDateStr + "T00:00:00");
  const diffTime = end - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Inserta badge para estado documental
 */
function statusBadge(status) {
  let cls = "badge";
  if (status === "Completo" || status === "Generado") cls = "badge green";
  else if (status === "En proceso") cls = "badge blue";
  return `<span class="${cls}">${escapeHtml(status)}</span>`;
}

/**
 * Inserta pill para días restantes (resalta como urgente los de 5 días o menos)
 */
function daysPill(days) {
  if (days <= 0) {
    return `<span class="days-pill urgent">Culminado (0 días)</span>`;
  }
  if (days === 1) {
    return `<span class="days-pill urgent">1 día restante</span>`;
  }
  if (days <= 5) {
    return `<span class="days-pill urgent">${days} días restantes</span>`;
  }
  return `<span class="days-pill warning">${days} días restantes</span>`;
}

/**
 * Carga opciones dinámicas de filtros
 */
function populateFilters() {
  const collabs = getCollaborators();
  const areas = [...new Set(collabs.map((c) => c.area).filter(Boolean))].sort();

  // Filtros de colaboradores
  const areaSelect = $("#areaFilter");
  const currentArea = areaSelect.value;
  areaSelect.innerHTML = '<option value="">Todas las áreas</option>' + areas.map((area) =>
    `<option value="${escapeHtml(area)}" ${area === currentArea ? "selected" : ""}>${escapeHtml(area)}</option>`
  ).join("");

  // Filtros de historial
  const historyTypeSelect = $("#historyTypeFilter");
  const currentHistoryType = historyTypeSelect.value;
  historyTypeSelect.innerHTML = '<option value="">Todos los tipos</option>' + DOCUMENT_TYPES.map((type) =>
    `<option value="${escapeHtml(type)}" ${type === currentHistoryType ? "selected" : ""}>${escapeHtml(type)}</option>`
  ).join("");

  const historyAreaSelect = $("#historyAreaFilter");
  const currentHistoryArea = historyAreaSelect.value;
  historyAreaSelect.innerHTML = '<option value="">Todas las áreas</option>' + areas.map((area) =>
    `<option value="${escapeHtml(area)}" ${area === currentHistoryArea ? "selected" : ""}>${escapeHtml(area)}</option>`
  ).join("");
}

/**
 * Actualiza los indicadores estadísticos
 */
function updateStats() {
  const collabs = getCollaborators();
  let pendingCount = 0;
  let generatedCount = 0;
  let completedCollabs = 0;
  let activeCollabs = 0;

  collabs.forEach((collab) => {
    const docStatus = getDocumentalStatus(collab);
    if (docStatus === "Completo") {
      completedCollabs++;
    } else {
      activeCollabs++;
    }

    DOCUMENT_TYPES.forEach((type) => {
      const doc = collab.documents?.[type];
      if (doc && doc.status === "Generado") {
        generatedCount++;
      } else {
        pendingCount++;
      }
    });
  });

  // Los colaboradores próximos a culminar en la tabla activa son los pendientes y en proceso
  $("#totalCollaboratorsCount").textContent = activeCollabs;
  $("#pendingDocsCount").textContent = pendingCount;
  $("#generatedDocsCount").textContent = generatedCount;
  $("#completedCollaboratorsCount").textContent = completedCollabs;
}

/**
 * Filtra los colaboradores de la pestaña principal
 * REGLA 1: Solo mostrar los que figuran como "En proceso" y "Pendiente"
 */
function getFilteredCollaborators() {
  const query = normalize($("#searchInput").value);
  const area = $("#areaFilter").value;
  const status = $("#statusFilter").value;
  const proximity = $("#proximityFilter").value;

  const collabs = getCollaborators();

  return collabs.filter((collab) => {
    const docStatus = getDocumentalStatus(collab);
    const days = calculateDaysRemaining(collab.endDate);

    // REGLA: Excluir a los completados de esta tabla activa
    if (docStatus === "Completo") return false;

    if (query && !normalize(`${collab.id} ${collab.name}`).includes(query)) return false;
    if (area && collab.area !== area) return false;
    if (status && docStatus !== status) return false;
    if (proximity) {
      const maxDays = parseInt(proximity, 10);
      if (days > maxDays) return false;
    }
    return true;
  }).sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
}

/**
 * Obtiene los colaboradores que tienen al menos un documento generado para la pestaña Historial
 */
function getCollaboratorsWithGeneratedDocs() {
  const collabs = getCollaborators();
  return collabs.filter((collab) => {
    return Object.values(collab.documents || {}).some((doc) => doc.status === "Generado");
  });
}

/**
 * Filtra el historial de documentos agrupado por colaborador
 */
function getFilteredHistoryCollaborators() {
  const query = normalize($("#historySearchInput").value);
  const type = $("#historyTypeFilter").value;
  const area = $("#historyAreaFilter").value;
  const date = $("#historyDateFilter").value;

  const collabs = getCollaboratorsWithGeneratedDocs();

  return collabs.filter((collab) => {
    if (query && !normalize(`${collab.id} ${collab.name}`).includes(query)) return false;
    if (area && collab.area !== area) return false;

    // Filtro por tipo de documento: debe tener generado ese tipo
    if (type) {
      const doc = collab.documents?.[type];
      if (!doc || doc.status !== "Generado") return false;
    }

    // Filtro por fecha: al menos un documento generado debe coincidir con la fecha
    if (date) {
      const hasDate = Object.values(collab.documents || {}).some(
        (doc) => doc.status === "Generado" && doc.date === date
      );
      if (!hasDate) return false;
    }

    return true;
  }).sort((a, b) => {
    const getLatestDate = (c) => {
      const dates = Object.values(c.documents || {})
        .filter((d) => d.status === "Generado" && d.date)
        .map((d) => d.date);
      return dates.length ? dates.sort().reverse()[0] : "";
    };
    return getLatestDate(b).localeCompare(getLatestDate(a));
  });
}

/**
 * Renderiza la vista activa (Colaboradores o Historial)
 */
function render() {
  updateStats();

  const isHistory = activeTab === "history";
  $("#collaboratorsView").hidden = isHistory;
  $("#historyView").hidden = !isHistory;

  if (isHistory) {
    renderHistoryTable();
  } else {
    renderCollaboratorsTable();
  }
}

/**
 * Renderizado de la tabla principal de colaboradores (Solo Pendientes y En proceso)
 */
function renderCollaboratorsTable() {
  const filtered = getFilteredCollaborators();
  const tbody = $("#collaboratorRows");

  if (filtered.length === 0) {
    tbody.innerHTML = "";
    $("#emptyCollaborators").hidden = false;
    $("#collaboratorRecordCount").textContent = "0 colaboradores encontrados";
    return;
  }

  $("#emptyCollaborators").hidden = true;
  tbody.innerHTML = filtered.map((collab) => {
    const days = calculateDaysRemaining(collab.endDate);
    const status = getDocumentalStatus(collab);

    return `
      <tr>
        <td><strong>${escapeHtml(collab.id)}</strong></td>
        <td>${escapeHtml(collab.name)}</td>
        <td>${escapeHtml(collab.area)}</td>
        <td>${escapeHtml(collab.endDate)}</td>
        <td>${daysPill(days)}</td>
        <td>${statusBadge(status)}</td>
        <td>
          <button type="button" class="secondary" data-consultar="${escapeHtml(collab.id)}">
            CONSULTAR
          </button>
        </td>
      </tr>
    `;
  }).join("");

  $("#collaboratorRecordCount").textContent = `${filtered.length} ${filtered.length === 1 ? "colaborador" : "colaboradores"}`;
}

/**
 * Renderizado de la tabla de historial agrupada por colaborador
 * REGLA 2: Muestra en la misma tabla los documentos que se hayan generado para cada colaborador
 */
function renderHistoryTable() {
  const collabs = getFilteredHistoryCollaborators();
  const tbody = $("#historyRows");

  if (collabs.length === 0) {
    tbody.innerHTML = "";
    $("#emptyHistory").hidden = false;
    $("#historyRecordCount").textContent = "0 colaboradores con documentos generados";
    return;
  }

  $("#emptyHistory").hidden = true;
  tbody.innerHTML = collabs.map((collab) => {
    const status = getDocumentalStatus(collab);
    const generatedDocs = Object.entries(collab.documents || {})
      .filter(([_, doc]) => doc.status === "Generado");
    const count = generatedDocs.length;
    const namesList = generatedDocs.map(([type]) => escapeHtml(type)).join(", ");

    const latestDate = generatedDocs
      .map(([_, d]) => d.date)
      .filter(Boolean)
      .sort()
      .reverse()[0] || "No registrada";

    return `
      <tr>
        <td><strong>${escapeHtml(collab.id)}</strong></td>
        <td>${escapeHtml(collab.name)}</td>
        <td>${escapeHtml(collab.area)}</td>
        <td>
          <span class="doc-count-badge">${count} de 5 generados</span>
          <div style="font-size:11px;color:var(--muted);margin-top:4px;max-width:320px;line-height:1.4;">${namesList}</div>
        </td>
        <td>${escapeHtml(latestDate)}</td>
        <td>${statusBadge(status)}</td>
        <td>
          <button type="button" class="secondary" data-consultar-history-collab="${escapeHtml(collab.id)}">
            CONSULTAR
          </button>
        </td>
      </tr>
    `;
  }).join("");

  $("#historyRecordCount").textContent = `${collabs.length} ${collabs.length === 1 ? "colaborador con documentos" : "colaboradores con documentos"}`;
}

/**
 * Cambio de pestaña
 */
function changeTab(nextTab) {
  activeTab = nextTab;
  document.querySelectorAll(".tabs button").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.tab === nextTab));
  });
  render();
}

/**
 * Modal de consulta de colaborador (Pestaña Colaboradores próximos a culminar)
 */
function openCollaboratorDetail(id) {
  selectedCollaboratorId = id;
  const collabs = getCollaborators();
  const collab = collabs.find((c) => c.id === id);
  if (!collab) return;

  $("#detailEyebrow").textContent = `CONSULTA DE COLABORADOR · ID: ${collab.id}`;
  $("#detailTitle").textContent = collab.name;
  renderDetailContent(collab);
  $("#detailDialog").showModal();
}

function renderDetailContent(collab, alertMessage = null, alertType = "info") {
  const days = calculateDaysRemaining(collab.endDate);
  const status = getDocumentalStatus(collab);

  let alertHtml = "";
  if (alertMessage) {
    alertHtml = `
      <div class="alert-box ${alertType}">
        <span>${escapeHtml(alertMessage)}</span>
      </div>
    `;
  }

  const docsHtml = DOCUMENT_TYPES.map((type) => {
    const doc = collab.documents?.[type];
    const isGenerated = doc && doc.status === "Generado";
    const dateText = isGenerated ? `Generado el: ${doc.date}` : "Pendiente de generación";

    return `
      <article class="doc-row-card ${isGenerated ? "completed" : ""}">
        <div class="doc-left">
          <input 
            type="checkbox" 
            class="doc-checkbox" 
            data-doctype="${escapeHtml(type)}" 
            ${isGenerated ? "disabled title='Documento ya generado'" : ""}
            aria-label="Seleccionar ${escapeHtml(type)}"
          >
          <div class="doc-info">
            <span class="doc-title">${escapeHtml(type)}</span>
            <span class="doc-meta">${dateText}</span>
          </div>
        </div>
        <div class="doc-right">
          ${isGenerated ? '<span class="badge green">Generado</span>' : '<span class="badge">Pendiente</span>'}
          <button 
            type="button" 
            class="secondary doc-preview-action" 
            data-preview-collab="${escapeHtml(collab.id)}" 
            data-preview-doctype="${escapeHtml(type)}"
          >
            ${isGenerated ? "Consultar" : "Previsualizar"}
          </button>
        </div>
      </article>
    `;
  }).join("");

  $("#detailBody").innerHTML = `
    <div class="collab-overview-card">
      <dl class="info-grid">
        <div><dt>ID</dt><dd>${escapeHtml(collab.id)}</dd></div>
        <div><dt>Nombre completo</dt><dd>${escapeHtml(collab.name)}</dd></div>
        <div><dt>Área</dt><dd>${escapeHtml(collab.area)}</dd></div>
        <div><dt>Fecha de inicio</dt><dd>${escapeHtml(collab.startDate || "No registrada")}</dd></div>
        <div><dt>Fecha de culminación</dt><dd>${escapeHtml(collab.endDate)}</dd></div>
        <div><dt>Días restantes</dt><dd>${daysPill(days)}</dd></div>
        <div><dt>Estado documental</dt><dd>${statusBadge(status)}</dd></div>
      </dl>
    </div>

    ${alertHtml}

    <div class="docs-section">
      <div class="docs-section-header">
        <div>
          <h3>Documentos de prácticas del colaborador</h3>
          <small style="color:var(--muted)">Seleccione los documentos pendientes a generar o consulte su previsualización.</small>
        </div>
        <div class="docs-quick-actions">
          <button type="button" class="text-btn" id="selectAllPending">Seleccionar pendientes</button>
          <button type="button" class="text-btn" id="deselectAll">Deseleccionar</button>
        </div>
      </div>

      <div class="docs-list">
        ${docsHtml}
      </div>
    </div>

    <footer class="dialog-actions">
      <button type="button" id="closeDetailBottom">Cerrar</button>
      <button type="button" class="primary" id="generateSelectedDocsBtn">
        GENERAR DOCUMENTOS
      </button>
    </footer>
  `;

  // Asignar eventos de acciones internas
  $("#selectAllPending").addEventListener("click", () => {
    document.querySelectorAll(".doc-checkbox:not(:disabled)").forEach((cb) => {
      cb.checked = true;
    });
  });

  $("#deselectAll").addEventListener("click", () => {
    document.querySelectorAll(".doc-checkbox").forEach((cb) => {
      cb.checked = false;
    });
  });

  $("#closeDetailBottom").addEventListener("click", () => {
    $("#detailDialog").close();
  });

  $("#generateSelectedDocsBtn").addEventListener("click", () => {
    generateSelectedDocuments(collab.id);
  });

  document.querySelectorAll(".doc-preview-action").forEach((btn) => {
    btn.addEventListener("click", () => {
      const collabId = btn.dataset.previewCollab;
      const docType = btn.dataset.previewDoctype;
      openDocumentPreview(collabId, docType);
    });
  });
}

/**
 * Modal de consulta de historial (Resumen de documentos generados por colaborador)
 */
function openHistoryCollaboratorDetail(collabId) {
  const collabs = getCollaborators();
  const collab = collabs.find((c) => c.id === collabId);
  if (!collab) return;

  const generatedDocs = Object.entries(collab.documents || {})
    .filter(([_, doc]) => doc.status === "Generado");

  $("#historyDetailEyebrow").textContent = `HISTORIAL DOCUMENTAL GENERADO · ID: ${collab.id}`;
  $("#historyDetailTitle").textContent = `${collab.name} (${collab.area})`;

  const docsCardsHtml = generatedDocs.map(([type, doc]) => {
    return `
      <article class="history-doc-card">
        <div>
          <div class="history-doc-title">${escapeHtml(type)}</div>
          <div class="history-doc-meta">
            <span>Fecha de emisión: <strong>${escapeHtml(doc.date || "Fecha actual")}</strong></span>
            ${doc.customNote ? ` · <span style="color:#4b5563">Nota: ${escapeHtml(doc.customNote)}</span>` : ""}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <span class="badge green">Generado</span>
          <button 
            type="button" 
            class="secondary history-doc-preview-btn" 
            data-collab="${escapeHtml(collab.id)}" 
            data-doctype="${escapeHtml(type)}"
          >
            Ver documento
          </button>
        </div>
      </article>
    `;
  }).join("");

  const pendingDocs = Object.entries(collab.documents || {})
    .filter(([_, doc]) => doc.status !== "Generado");

  const pendingNotice = pendingDocs.length > 0
    ? `<div class="alert-box info" style="margin-top:16px;">
        <span><strong>Documentos aún pendientes (${pendingDocs.length}):</strong> ${pendingDocs.map(([t]) => escapeHtml(t)).join(", ")}</span>
       </div>`
    : `<div class="alert-box success" style="margin-top:16px;">
        <span><strong>Trámite completado:</strong> Todos los 5 documentos correspondientes han sido generados.</span>
       </div>`;

  $("#historyDetailBody").innerHTML = `
    <div class="history-summary-box">
      <dl class="info-grid">
        <div><dt>ID</dt><dd>${escapeHtml(collab.id)}</dd></div>
        <div><dt>Colaborador</dt><dd>${escapeHtml(collab.name)}</dd></div>
        <div><dt>Área</dt><dd>${escapeHtml(collab.area)}</dd></div>
        <div><dt>Estado documental</dt><dd>${statusBadge(getDocumentalStatus(collab))}</dd></div>
        <div><dt>Fecha de inicio</dt><dd>${escapeHtml(collab.startDate || "No registrada")}</dd></div>
        <div><dt>Fecha de culminación</dt><dd>${escapeHtml(collab.endDate)}</dd></div>
        <div><dt>Documentos generados</dt><dd><span class="doc-count-badge">${generatedDocs.length} de 5 emitidos</span></dd></div>
      </dl>
    </div>

    <h3 style="font-size:15px;margin:18px 0 10px;">Resumen de documentos generados</h3>
    <div class="history-docs-grid">
      ${docsCardsHtml}
    </div>

    ${pendingNotice}

    <footer class="dialog-actions">
      <button type="button" id="closeHistoryDetailBtn">Cerrar</button>
    </footer>
  `;

  $("#closeHistoryDetailBtn").addEventListener("click", () => {
    $("#historyDetailDialog").close();
  });

  document.querySelectorAll(".history-doc-preview-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      openDocumentPreview(btn.dataset.collab, btn.dataset.doctype);
    });
  });

  $("#historyDetailDialog").showModal();
}

/**
 * Generación de documentos seleccionados
 */
function generateSelectedDocuments(collabId) {
  const selectedTypes = [];
  document.querySelectorAll(".doc-checkbox:checked:not(:disabled)").forEach((cb) => {
    selectedTypes.push(cb.dataset.doctype);
  });

  const collabs = getCollaborators();
  const collabIndex = collabs.findIndex((c) => c.id === collabId);
  if (collabIndex < 0) return;

  const collab = collabs[collabIndex];

  if (selectedTypes.length === 0) {
    renderDetailContent(collab, "Debe seleccionar al menos un documento pendiente para generar.", "warning");
    return;
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  selectedTypes.forEach((docType) => {
    if (!collab.documents[docType]) {
      collab.documents[docType] = { status: "Generado", date: todayStr, customNote: "" };
    } else {
      collab.documents[docType].status = "Generado";
      collab.documents[docType].date = todayStr;
    }
  });

  collabs[collabIndex] = collab;
  saveCollaborators(collabs);

  // Actualizar tabla e indicadores
  render();

  const msg = selectedTypes.length === 1
    ? `Se ha generado correctamente el documento: "${selectedTypes[0]}".`
    : `Se han generado correctamente ${selectedTypes.length} documentos.`;
  renderDetailContent(collab, msg, "success");
}

/**
 * Contenido redactado de demostración según el tipo de documento
 */
function getDocumentContent(docType, collab) {
  const startDate = collab.startDate || "fecha de ingreso institucional";
  const endDate = collab.endDate;
  const doc = collab.documents?.[docType];
  const customNote = doc?.customNote;
  const customNoteHtml = customNote
    ? `<div style="margin-top:14px;padding:12px 16px;background:#f0f7ff;border-left:3px solid #2867c7;border-radius:6px;font-size:12px;color:#1e3a8a;">
         <strong>Nota institucional registrada:</strong> ${escapeHtml(customNote)}
       </div>`
    : "";

  switch (docType) {
    case "Certificado de prácticas preprofesionales":
      return `
        <p>Por medio del presente documento, la Dirección de Talento Humano certifica que:</p>
        <p style="text-align:center;font-size:16px;"><strong>${escapeHtml(collab.name.toUpperCase())}</strong><br><span style="font-size:13px;color:#555;">Identificado(a) con código institucional ID: ${escapeHtml(collab.id)}</span></p>
        <p>Ha completado satisfactoriamente sus <strong>Prácticas Preprofesionales</strong> en el área de <strong>${escapeHtml(collab.area)}</strong>, durante el periodo comprendido desde el <strong>${escapeHtml(startDate)}</strong> hasta el <strong>${escapeHtml(endDate)}</strong>, habiendo cumplido con las actividades formativas, funciones y metas asignadas de acuerdo con el plan de prácticas establecido.</p>
        <p>Durante su permanencia, demostró idoneidad, iniciativa y sentido de responsabilidad en el ejercicio de sus labores.</p>
        <p>Se expide el presente certificado para los fines pertinentes que el/la interesado(a) estime conveniente.</p>
        ${customNoteHtml}
      `;

    case "Carta de recomendación":
      return `
        <div class="recommendation-box">
          <h5>Apartado de Observaciones y Antecedentes del Colaborador</h5>
          <p><strong>Registro de incidencias y desempeño:</strong> ${escapeHtml(collab.observations || "Sin memorándums ni observaciones disciplinarias registradas en su expediente.")}</p>
          <div class="review-disclaimer">
            <strong>Aviso de revisión institucional:</strong> Este documento requiere la revisión previa y validación de los parámetros institucionales por parte del responsable de Talento Humano. El sistema no establece de forma automática si un colaborador es recomendable o no. La decisión final queda a cargo del responsable correspondiente.
          </div>
        </div>
        <p>A quien corresponda:</p>
        <p>Por medio de la presente, pongo en su conocimiento que <strong>${escapeHtml(collab.name)}</strong>, identificado(a) con ID <strong>${escapeHtml(collab.id)}</strong>, se desempeñó como practicante preprofesional en el área de <strong>${escapeHtml(collab.area)}</strong> de nuestra organización desde el <strong>${escapeHtml(startDate)}</strong> hasta el <strong>${escapeHtml(endDate)}</strong>.</p>
        <p>Durante dicho periodo, evidenció compromiso profesional, solvencia ética y capacidad de trabajo en equipo en el cumplimiento de sus responsabilidades asignadas.</p>
        <p>En virtud de los antecedentes y el desempeño observado en su expediente, y sujeto a la conformidad del área de Talento Humano, se suscribe la presente carta como testimonio de su formación práctica.</p>
        ${customNoteHtml}
      `;

    case "Carta de respuesta":
      return `
        <p>Señores representantes de la Institución Educativa Superior / Universidad de procedencia:</p>
        <p>Nos dirigimos a ustedes en respuesta a la solicitud de prácticas preprofesionales remitida en favor del/de la estudiante <strong>${escapeHtml(collab.name)}</strong> (ID Colaborador: <strong>${escapeHtml(collab.id)}</strong>).</p>
        <p>Al respecto, confirmamos que el/la citado(a) estudiante ha sido acogido(a) y ha desarrollado su proceso formativo en el área de <strong>${escapeHtml(collab.area)}</strong>, abarcando el periodo previsto desde el <strong>${escapeHtml(startDate)}</strong> hasta su culminación el <strong>${escapeHtml(endDate)}</strong>, en el marco de las normativas de formación laboral vigentes.</p>
        <p>Agradecemos la confianza depositada en nuestra entidad para el fortalecimiento de las competencias de sus futuros egresados.</p>
        ${customNoteHtml}
      `;

    case "Carta de aceptación":
      return `
        <p>Estimado(a) <strong>${escapeHtml(collab.name)}</strong> (ID: <strong>${escapeHtml(collab.id)}</strong>):</p>
        <p>Es grato comunicarle que, luego de culminar el proceso de selección y evaluación correspondiente, ha sido <strong>ACEPTADO(A)</strong> para realizar sus prácticas preprofesionales en el área de <strong>${escapeHtml(collab.area)}</strong> de nuestra organización.</p>
        <p>El periodo formativo inicia formalmente el día <strong>${escapeHtml(startDate)}</strong> y está programado para culminar el <strong>${escapeHtml(endDate)}</strong>, sujeto al plan formativo y reglamento interno de la institución.</p>
        <p>Le damos una cordial bienvenida a nuestro equipo de trabajo y le deseamos el mayor de los éxitos en su etapa de consolidación profesional.</p>
        ${customNoteHtml}
      `;

    case "Constancia de prácticas preprofesionales":
      return `
        <p>A solicitud de la parte interesada, la Jefatura de Talento Humano:</p>
        <h4 style="text-align:center;font-size:15px;margin:15px 0;">HACE CONSTAR:</h4>
        <p>Que <strong>${escapeHtml(collab.name)}</strong>, identificado(a) con código <strong>${escapeHtml(collab.id)}</strong>, se encuentra registrado(a) desarrollando sus prácticas preprofesionales en el área de <strong>${escapeHtml(collab.area)}</strong>, cubriendo el periodo del <strong>${escapeHtml(startDate)}</strong> al <strong>${escapeHtml(endDate)}</strong>.</p>
        <p>Se deja constancia de que viene cumpliendo las directrices, horario y asignaciones de acuerdo a los términos del convenio respectivo.</p>
        <p>Se expide la presente constancia para los trámites académicos o administrativos que correspondan.</p>
        ${customNoteHtml}
      `;

    default:
      return `<p>Representación de demostración para el documento ${escapeHtml(docType)} del colaborador ${escapeHtml(collab.name)}.</p>${customNoteHtml}`;
  }
}

/**
 * Previsualización de un documento
 * Incluye el botón EDITAR para desplegar el formulario de modificaciones
 */
function openDocumentPreview(collabId, docType, successMsg = null) {
  const collabs = getCollaborators();
  const collab = collabs.find((c) => c.id === collabId);
  if (!collab) return;

  const docState = collab.documents?.[docType];
  const isGenerated = (docState && docState.status === "Generado");
  const genDate = docState?.date || new Date().toISOString().slice(0, 10);

  $("#previewEyebrow").textContent = "REPRESENTACIÓN PRELIMINAR · DEMOSTRACIÓN";
  $("#previewTitle").textContent = docType;

  const alertBanner = successMsg
    ? `<div class="alert-box success"><span>${escapeHtml(successMsg)}</span></div>`
    : "";

  const previewBody = $("#previewBody");
  previewBody.innerHTML = `
    ${alertBanner}
    <div class="preview-container">
      <div class="preview-paper">
        <div class="preview-banner">
          PROTOTIPO DE DEMOSTRACIÓN · SISTEMA DE TALENTO HUMANO (NO CONSTITUYE DOCUMENTO OFICIAL DEFINITIVO)
        </div>

        <header class="preview-paper-header">
          <div>
            <h4>ORGANIZACIÓN INSTITUCIONAL</h4>
            <span>DIRECCIÓN DE TALENTO HUMANO</span>
          </div>
          <div>
            <span><strong>Fecha:</strong> ${escapeHtml(genDate)}</span>
          </div>
        </header>

        <h3>${escapeHtml(docType)}</h3>

        <div class="preview-paper-content">
          ${getDocumentContent(docType, collab)}
        </div>

        <footer class="preview-paper-footer">
          <div>
            <span><strong>Estado en sistema:</strong> ${isGenerated ? "Completado / Generado" : "Borrador preliminar pendiente"}</span><br>
            <span><strong>Colaborador:</strong> ${escapeHtml(collab.name)} (ID: ${escapeHtml(collab.id)})</span>
          </div>
          <div class="preview-signature">
            <span>Responsable de Talento Humano</span><br>
            <small style="color:#64748b">Firma y Sello de Validación</small>
          </div>
        </footer>
      </div>
    </div>

    <footer class="dialog-actions">
      <button type="button" id="previewBackBtn">VOLVER</button>
      <button type="button" class="secondary" id="previewEditBtn">
        EDITAR
      </button>
      ${!isGenerated ? `
        <button type="button" class="primary" id="previewGenerateSingleBtn">
          GENERAR DOCUMENTO
        </button>
      ` : `
        <span class="badge green" style="align-self:center;padding:8px 12px;">Documento ya generado (${escapeHtml(genDate)})</span>
      `}
    </footer>
  `;

  $("#previewBackBtn").addEventListener("click", () => {
    $("#previewDialog").close();
  });

  // Botón EDITAR: abre el formulario de modificación de datos
  $("#previewEditBtn").addEventListener("click", () => {
    renderEditForm(collabId, docType);
  });

  const genBtn = $("#previewGenerateSingleBtn");
  if (genBtn) {
    genBtn.addEventListener("click", () => {
      generateSingleFromPreview(collabId, docType);
    });
  }

  $("#previewDialog").showModal();
}

/**
 * REGLA 3: Formulario de modificaciones de todos los posibles campos
 * Se activa desde el botón EDITAR en la previsualización
 */
function renderEditForm(collabId, docType) {
  const collabs = getCollaborators();
  const collab = collabs.find((c) => c.id === collabId);
  if (!collab) return;

  const doc = collab.documents?.[docType];
  const docDate = doc?.date || new Date().toISOString().slice(0, 10);

  $("#previewEyebrow").textContent = "MODIFICACIÓN DE DATOS Y PARÁMETROS";
  $("#previewTitle").textContent = `Editar: ${docType}`;

  const previewBody = $("#previewBody");
  previewBody.innerHTML = `
    <div class="edit-form-container">
      <div class="edit-form-header">
        <h4>Formulario de modificación de datos</h4>
        <p>Edite las fechas, área, antecedentes u observaciones del documento. Al guardar, las modificaciones se registrarán de inmediato en el expediente del colaborador.</p>
      </div>

      <div id="editFormAlert" class="alert-box" hidden></div>

      <form id="editDocumentForm" class="edit-form-grid">
        <div class="form-group">
          <label for="editDocDate">Fecha de emisión del documento</label>
          <input type="date" id="editDocDate" value="${escapeHtml(docDate)}" required>
        </div>

        <div class="form-group">
          <label for="editArea">Área asignada</label>
          <input type="text" id="editArea" value="${escapeHtml(collab.area)}" required>
        </div>

        <div class="form-group">
          <label for="editStartDate">Fecha de inicio de prácticas</label>
          <input type="date" id="editStartDate" value="${escapeHtml(collab.startDate || "")}">
        </div>

        <div class="form-group">
          <label for="editEndDate">Fecha de culminación de prácticas</label>
          <input type="date" id="editEndDate" value="${escapeHtml(collab.endDate)}" required>
        </div>

        <div class="form-group full">
          <label for="editObservations">Observaciones y antecedentes del expediente</label>
          <textarea id="editObservations" rows="3" placeholder="Registro de incidencias, méritos o memorándums...">${escapeHtml(collab.observations || "")}</textarea>
          <small style="color:var(--muted)">Impacta en la Carta de recomendación y en la revisión de antecedentes.</small>
        </div>

        <div class="form-group full">
          <label for="editCustomNote">Nota complementaria o indicación para este documento</label>
          <textarea id="editCustomNote" rows="2" placeholder="Texto adicional, adenda o especificación propia de este documento...">${escapeHtml(doc?.customNote || "")}</textarea>
        </div>
      </form>
    </div>

    <footer class="dialog-actions">
      <button type="button" id="cancelEditBtn">Cancelar</button>
      <button type="button" class="primary" id="saveEditBtn">
        Guardar cambios
      </button>
    </footer>
  `;

  $("#cancelEditBtn").addEventListener("click", () => {
    openDocumentPreview(collabId, docType);
  });

  $("#saveEditBtn").addEventListener("click", () => {
    saveDocumentModifications(collabId, docType);
  });
}

/**
 * Guarda las modificaciones realizadas en el formulario
 */
function saveDocumentModifications(collabId, docType) {
  const collabs = getCollaborators();
  const index = collabs.findIndex((c) => c.id === collabId);
  if (index < 0) return;

  const docDate = $("#editDocDate").value;
  const area = $("#editArea").value.trim();
  const startDate = $("#editStartDate").value;
  const endDate = $("#editEndDate").value;
  const observations = $("#editObservations").value.trim();
  const customNote = $("#editCustomNote").value.trim();

  if (!area || !endDate) {
    const alertEl = $("#editFormAlert");
    alertEl.className = "alert-box warning";
    alertEl.textContent = "Por favor, complete los campos obligatorios (Área y Fecha de culminación).";
    alertEl.hidden = false;
    return;
  }

  const collab = collabs[index];
  collab.area = area;
  collab.startDate = startDate;
  collab.endDate = endDate;
  collab.observations = observations;

  if (!collab.documents[docType]) {
    collab.documents[docType] = { status: "Pendiente", date: docDate, customNote };
  } else {
    collab.documents[docType].date = docDate;
    collab.documents[docType].customNote = customNote;
  }

  collabs[index] = collab;
  saveCollaborators(collabs);

  // Actualizar tabla y filtros
  populateFilters();
  render();

  // Si el modal de detalle del colaborador está abierto en segundo plano, refrescarlo
  if ($("#detailDialog").open && selectedCollaboratorId === collabId) {
    renderDetailContent(collab, "Datos modificados y actualizados en el expediente.", "success");
  }

  // Volver a la previsualización mostrando el mensaje de éxito
  openDocumentPreview(collabId, docType, "¡Modificaciones guardadas y aplicadas exitosamente!");
}

/**
 * Genera un documento individual desde la propia previsualización
 */
function generateSingleFromPreview(collabId, docType) {
  const collabs = getCollaborators();
  const collabIndex = collabs.findIndex((c) => c.id === collabId);
  if (collabIndex < 0) return;

  const collab = collabs[collabIndex];
  const todayStr = new Date().toISOString().slice(0, 10);

  if (!collab.documents[docType]) {
    collab.documents[docType] = { status: "Generado", date: todayStr, customNote: "" };
  } else {
    collab.documents[docType].status = "Generado";
    collab.documents[docType].date = todayStr;
  }

  collabs[collabIndex] = collab;
  saveCollaborators(collabs);

  render();

  if ($("#detailDialog").open && selectedCollaboratorId === collabId) {
    renderDetailContent(collab, `Se generó correctamente el documento: "${docType}".`, "success");
  }

  openDocumentPreview(collabId, docType, `Se generó exitosamente el documento: "${docType}".`);
}

/**
 * Event Listeners generales
 */
function setupEventListeners() {
  // Pestañas
  document.querySelectorAll(".tabs button").forEach((btn) => {
    btn.addEventListener("click", () => changeTab(btn.dataset.tab));
  });

  // Filtros de colaboradores
  ["searchInput", "areaFilter", "statusFilter", "proximityFilter"].forEach((id) => {
    const el = $(`#${id}`);
    if (el) el.addEventListener(id === "searchInput" ? "input" : "change", renderCollaboratorsTable);
  });

  $("#clearFilters").addEventListener("click", () => {
    $("#searchInput").value = "";
    $("#areaFilter").value = "";
    $("#statusFilter").value = "";
    $("#proximityFilter").value = "";
    renderCollaboratorsTable();
  });

  // Filtros de historial
  ["historySearchInput", "historyTypeFilter", "historyAreaFilter", "historyDateFilter"].forEach((id) => {
    const el = $(`#${id}`);
    if (el) el.addEventListener(id === "historySearchInput" ? "input" : "change", renderHistoryTable);
  });

  $("#clearHistoryFilters").addEventListener("click", () => {
    $("#historySearchInput").value = "";
    $("#historyTypeFilter").value = "";
    $("#historyAreaFilter").value = "";
    $("#historyDateFilter").value = "";
    renderHistoryTable();
  });

  // Clicks en tabla de colaboradores (Acción CONSULTAR)
  $("#collaboratorRows").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-consultar]");
    if (btn) {
      openCollaboratorDetail(btn.dataset.consultar);
    }
  });

  // Clicks en tabla de historial (Acción CONSULTAR agrupado por colaborador)
  $("#historyRows").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-consultar-history-collab]");
    if (btn) {
      openHistoryCollaboratorDetail(btn.dataset.consultarHistoryCollab);
    }
  });

  // Cierres de modales
  $("#closeDetail").addEventListener("click", () => $("#detailDialog").close());
  $("#closeHistoryDetail").addEventListener("click", () => $("#historyDetailDialog").close());
  $("#closePreview").addEventListener("click", () => $("#previewDialog").close());
}

// Arranque del módulo
initializeData();
populateFilters();
setupEventListeners();
render();
