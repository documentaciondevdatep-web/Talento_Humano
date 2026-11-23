"use strict";

const STATUS_MAP = {
  pending: { label: "PENDIENTE", className: "status-pending" },
  approved: { label: "APROBADO", className: "status-approved" },
  validated: { label: "APROBADO", className: "status-approved" },
  rejected: { label: "RECHAZADO", className: "status-rejected" },
  review: { label: "EN REVISIÓN", className: "status-review" }
};

// Áreas oficiales según la estructura organizacional
const OFFICIAL_AREAS = [
  "Talento Humano",
  "Desarrollo Web",
  "Comercial",
  "Reclutamiento",
  "Capacitación",
  "Clima y Cultura",
  "Backend",
  "Frontend",
  "Base de Datos",
  "Documentación",
  "Diseño Web",
  "Desarrollo Rápido de Aplicaciones",
  "Diseño Gráfico",
  "Marketing y Ventas"
];

const STORAGE_KEY_CRUCES = "th_cruces_horarios_v10";

function getStoredRecords(initial) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CRUCES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEY_CRUCES, JSON.stringify(initial));
  } catch (e) {
    console.warn("Storage no disponible o error al leer:", e);
  }
  return initial;
}

function persistRecords(list) {
  try {
    localStorage.setItem(STORAGE_KEY_CRUCES, JSON.stringify(list));
  } catch (e) {
    console.error("Error al persistir cruces:", e);
  }
}

// Horarios de la cuadrícula: De 7:00 am a 1:00 pm (bloques de 30 minutos)
const SCHEDULE_HOURS = [
  { value: "07:00", label: "07:00 am" },
  { value: "07:30", label: "07:30 am" },
  { value: "08:00", label: "08:00 am" },
  { value: "08:30", label: "08:30 am" },
  { value: "09:00", label: "09:00 am" },
  { value: "09:30", label: "09:30 am" },
  { value: "10:00", label: "10:00 am" },
  { value: "10:30", label: "10:30 am" },
  { value: "11:00", label: "11:00 am" },
  { value: "11:30", label: "11:30 am" },
  { value: "12:00", label: "12:00 pm" },
  { value: "12:30", label: "12:30 pm" },
  { value: "13:00", label: "01:00 pm" }
];

const SCHEDULE_DAYS = [
  { key: "Lun", label: "Lunes" },
  { key: "Mar", label: "Martes" },
  { key: "Mié", label: "Miércoles" },
  { key: "Jue", label: "Jueves" },
  { key: "Vie", label: "Viernes" }
];

// Datos ficticios demostrativos estructurados con las áreas oficiales
const defaultRecords = [
  {
    id: 1042,
    employeeId: 1042,
    name: "Camila Morales",
    department: "Talento Humano", // Área/Departamento oficial
    day: "Martes",
    type: "completo",
    entryTime: "Todo el día",
    exitTime: "Todo el día",
    dueHours: "Todo el día",
    fromDate: "2025-02-02",
    toDate: "2025-06-30",
    workEntry: "Todo el día",
    workExit: "Todo el día",
    classStart: "Todo el día",
    classEnd: "Todo el día",
    status: "pending",
    evidenceAvailable: true,
    evidenceType: "pdf",
    evidenceName: "Horario_Academico_Camila.pdf",
    observation: "Registro de demostración: cruce de jornada completa (8:00 am a 11:00 am y 11:00 am a 1:00 pm).",
    selectedSlots: {
      "Mar": ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00"],
      "Jue": ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00"]
    }
  },
  {
    id: 1055,
    employeeId: 1055,
    name: "Rodrigo Valenzuela",
    department: "Desarrollo Web", // Área/Departamento oficial
    day: "Miércoles",
    type: "horas",
    entryTime: "09:00 am",
    exitTime: "11:30 am",
    dueHours: "2.5h",
    fromDate: "2025-02-03",
    toDate: "2025-06-28",
    workEntry: "09:00 am",
    workExit: "11:30 am",
    classStart: "09:00 am",
    classEnd: "11:30 am",
    status: "validated",
    evidenceAvailable: true,
    evidenceType: "image",
    evidenceName: "Horario_Rodrigo_Valenzuela.jpg",
    observation: "Cruce específico de media mañana verificado y aprobado por Talento Humano.",
    selectedSlots: {
      "Mié": ["09:00", "09:30", "10:00", "10:30", "11:00"]
    }
  },
  {
    id: 1061,
    employeeId: 1061,
    name: "Valeria Barrientos",
    department: "Comercial", // Área/Departamento oficial
    day: "Lunes",
    type: "horas",
    entryTime: "10:00 am",
    exitTime: "01:00 pm",
    dueHours: "3h",
    fromDate: "2025-02-04",
    toDate: "2025-07-01",
    workEntry: "10:00 am",
    workExit: "01:00 pm",
    classStart: "10:00 am",
    classEnd: "01:00 pm",
    status: "pending",
    evidenceAvailable: false,
    evidenceType: "",
    evidenceName: "",
    observation: "Horario pendiente de revisión por Talento Humano (colaboradora aún no adjunta constancia).",
    selectedSlots: {}
  },
  {
    id: 1073,
    employeeId: 1073,
    name: "Mateo Quintana",
    department: "Backend", // Área oficial
    day: "Viernes",
    type: "completo",
    entryTime: "Todo el día",
    exitTime: "Todo el día",
    dueHours: "Todo el día",
    fromDate: "2025-02-05",
    toDate: "2025-06-29",
    workEntry: "Todo el día",
    workExit: "Todo el día",
    classStart: "Todo el día",
    classEnd: "Todo el día",
    status: "pending",
    evidenceAvailable: true,
    evidenceType: "pdf",
    evidenceName: "Constancia_Horario_Mateo.pdf",
    observation: "Cruce de jornada completa acreditado con constancia de estudios universitarios.",
    selectedSlots: {
      "Vie": ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00"]
    }
  },
  {
    id: 1084,
    employeeId: 1084,
    name: "Daniela Carranza",
    department: "Reclutamiento", // Área oficial
    day: "Lunes",
    type: "horas",
    entryTime: "07:30 am",
    exitTime: "10:00 am",
    dueHours: "2.5h",
    fromDate: "2025-02-06",
    toDate: "2025-07-02",
    workEntry: "07:30 am",
    workExit: "10:00 am",
    classStart: "07:30 am",
    classEnd: "10:00 am",
    status: "validated",
    evidenceAvailable: true,
    evidenceType: "image",
    evidenceName: "Horario_Daniela_Reclutamiento.png",
    observation: "Cruce de primera hora convalidado con horario oficial de clases.",
    selectedSlots: {
      "Lun": ["07:30", "08:00", "08:30", "09:00", "09:30"]
    }
  },
  {
    id: 1090,
    employeeId: 1090,
    name: "Sebastián Mendoza",
    department: "Frontend", // Área oficial
    day: "Jueves",
    type: "horas",
    entryTime: "10:00 am",
    exitTime: "01:00 pm",
    dueHours: "3h",
    fromDate: "2025-02-09",
    toDate: "2025-07-02",
    workEntry: "10:00 am",
    workExit: "01:00 pm",
    classStart: "10:00 am",
    classEnd: "01:00 pm",
    status: "pending",
    evidenceAvailable: true,
    evidenceType: "pdf",
    evidenceName: "Horario_Sebastian_Frontend.pdf",
    observation: "Registro de demostración: pendiente de confirmación de compensación horaria.",
    selectedSlots: {
      "Jue": ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00"]
    }
  },
  {
    id: 1102,
    employeeId: 1102,
    name: "Andrea Paredes",
    department: "Diseño Web", // Área oficial
    day: "Martes",
    type: "horas",
    entryTime: "07:00 am",
    exitTime: "09:30 am",
    dueHours: "2.5h",
    fromDate: "2025-02-17",
    toDate: "2025-06-30",
    workEntry: "07:00 am",
    workExit: "09:30 am",
    classStart: "07:00 am",
    classEnd: "09:30 am",
    status: "validated",
    evidenceAvailable: true,
    evidenceType: "image",
    evidenceName: "Horario_Andrea_DisenoWeb.png",
    observation: "Cruce matutino para clases de ingeniería de diseño aprobado.",
    selectedSlots: {
      "Mar": ["07:00", "07:30", "08:00", "08:30", "09:00"]
    }
  },
  {
    id: 1115,
    employeeId: 1115,
    name: "Lucas Benítez",
    department: "Capacitación", // Área oficial
    day: "Miércoles",
    type: "horas",
    entryTime: "08:30 am",
    exitTime: "11:00 am",
    dueHours: "2.5h",
    fromDate: "2025-02-18",
    toDate: "2025-06-30",
    workEntry: "08:30 am",
    workExit: "11:00 am",
    classStart: "08:30 am",
    classEnd: "11:00 am",
    status: "pending",
    evidenceAvailable: true,
    evidenceType: "image",
    evidenceName: "Horario_Lucas_Capacitacion.png",
    observation: "Cruce verificado con carnet universitario y rol de exámenes.",
    selectedSlots: {
      "Mié": ["08:30", "09:00", "09:30", "10:00", "10:30"]
    }
  },
  {
    id: 1120,
    employeeId: 1120,
    name: "Nicole Salazar",
    department: "Diseño Gráfico", // Área oficial
    day: "Lunes",
    type: "horas",
    entryTime: "09:30 am",
    exitTime: "12:30 pm",
    dueHours: "3h",
    fromDate: "2025-02-19",
    toDate: "2025-07-01",
    workEntry: "09:30 am",
    workExit: "12:30 pm",
    classStart: "09:30 am",
    classEnd: "12:30 pm",
    status: "validated",
    evidenceAvailable: true,
    evidenceType: "image",
    evidenceName: "Horario_Nicole_DisenoGrafico.png",
    observation: "Aprobado por jefatura para asistencia a talleres de animación.",
    selectedSlots: {
      "Lun": ["09:30", "10:00", "10:30", "11:00", "11:30", "12:00"]
    }
  },
  {
    id: 1134,
    employeeId: 1134,
    name: "Diego Santillán",
    department: "Desarrollo Rápido de Aplicaciones", // Área oficial
    day: "Jueves",
    type: "horas",
    entryTime: "08:00 am",
    exitTime: "11:00 am",
    dueHours: "3h",
    fromDate: "2025-02-20",
    toDate: "2025-06-28",
    workEntry: "08:00 am",
    workExit: "11:00 am",
    classStart: "08:00 am",
    classEnd: "11:00 am",
    status: "pending",
    evidenceAvailable: true,
    evidenceType: "pdf",
    evidenceName: "Horario_Diego_DRA.pdf",
    observation: "Cruce en proceso de validación por coincidencia con entrega de sprint.",
    selectedSlots: {
      "Jue": ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30"]
    }
  },
  {
    id: 1142,
    employeeId: 1142,
    name: "Jimena Castañeda",
    department: "Documentación", // Área oficial
    day: "Viernes",
    type: "horas",
    entryTime: "07:30 am",
    exitTime: "10:30 am",
    dueHours: "3h",
    fromDate: "2025-02-21",
    toDate: "2025-06-29",
    workEntry: "07:30 am",
    workExit: "10:30 am",
    classStart: "07:30 am",
    classEnd: "10:30 am",
    status: "validated",
    evidenceAvailable: true,
    evidenceType: "pdf",
    evidenceName: "Horario_Jimena_Doc.pdf",
    observation: "Horario académico validado y registrado en el portal institucional.",
    selectedSlots: {
      "Vie": ["07:30", "08:00", "08:30", "09:00", "09:30", "10:00"]
    }
  }
];

const records = getStoredRecords(defaultRecords);

// Navegación por pestañas: Pendientes e Historial
const tabButtonPending = document.getElementById("tabButtonPending");
const tabButtonHistory = document.getElementById("tabButtonHistory");
const badgePending = document.getElementById("badgePending");
const badgeHistory = document.getElementById("badgeHistory");
const recordsHeading = document.getElementById("recordsHeading");
const thStatusCol = document.getElementById("thStatusCol");
const colStatus = document.getElementById("colStatus");

// Elementos del DOM (Filtros y tabla)
const searchInput = document.getElementById("searchInput");
const departmentFilter = document.getElementById("departmentFilter");
const dayFilter = document.getElementById("dayFilter");
const historyStatusFilter = document.getElementById("historyStatusFilter");
const historyStatusFilterLabel = document.getElementById("historyStatusFilterLabel");
const recordsTableBody = document.getElementById("recordsTableBody");
const recordsCount = document.getElementById("recordsCount");
const toast = document.getElementById("toast");

// Dialog y sus componentes
const detailsDialog = document.getElementById("detailsDialog");
const detailsDialogTitle = document.getElementById("detailsDialogTitle");
const closeDetailsButton = document.getElementById("closeDetailsButton");
const closeDetailsAction = document.getElementById("closeDetailsAction");
const dialogActionsLeft = document.getElementById("dialogActionsLeft");
const dialogActionsRight = document.getElementById("dialogActionsRight");
const recordDetails = document.getElementById("recordDetails");
const recordObservationInput = document.getElementById("recordObservationInput");
const saveObservationButton = document.getElementById("saveObservationButton");
const observationActions = document.getElementById("observationActions");

const evidenceStatus = document.getElementById("evidenceStatus");
const scheduleDaysPill = document.getElementById("scheduleDaysPill");
const selectedDaysSummaryText = document.getElementById("selectedDaysSummaryText");
const scheduleGridTable = document.getElementById("scheduleGridTable");
const scheduleGridBody = document.getElementById("scheduleGridBody");
const scheduleHoursRangeText = document.getElementById("scheduleHoursRangeText");
const editScheduleBtn = document.getElementById("editScheduleBtn");
const scheduleEditNotice = document.getElementById("scheduleEditNotice");

// Elementos de Evidencia y Adjuntos
const evidencePreview = document.getElementById("evidencePreview");
const openEvidenceFullBtn = document.getElementById("openEvidenceFullBtn");
const addEvidenceBtn = document.getElementById("addEvidenceBtn");
const removeEvidenceBtn = document.getElementById("removeEvidenceBtn");
const evidenceFileInput = document.getElementById("evidenceFileInput");

// Botones de evaluación dentro del modal (Aprobar y Rechazar)
const approveButton = document.getElementById("approveButton");
const rejectButton = document.getElementById("rejectButton");
const revertPendingButton = document.getElementById("revertPendingButton");

// Lightbox
const evidenceLightboxDialog = document.getElementById("evidenceLightboxDialog");
const lightboxEvidenceContainer = document.getElementById("lightboxEvidenceContainer");
const closeLightboxButton = document.getElementById("closeLightboxButton");
const closeLightboxAction = document.getElementById("closeLightboxAction");

let currentRecordKey = null;
let toastTimer = null;
let isScheduleEditing = false; // Control de modo solo lectura / edición
let currentScheduleTab = "pending"; // Pestaña activa: "pending" o "history"

function setScheduleActiveTab(tab) {
  currentScheduleTab = tab;
  const isPending = tab === "pending";

  if (tabButtonPending) {
    tabButtonPending.classList.toggle("active", isPending);
    tabButtonPending.setAttribute("aria-selected", isPending ? "true" : "false");
  }
  if (tabButtonHistory) {
    tabButtonHistory.classList.toggle("active", !isPending);
    tabButtonHistory.setAttribute("aria-selected", !isPending ? "true" : "false");
  }

  if (recordsHeading) {
    recordsHeading.textContent = isPending ? "Cruces pendientes" : "Historial de cruces (Aprobados y Rechazados)";
  }

  if (thStatusCol) thStatusCol.style.display = isPending ? "none" : "";
  if (colStatus) colStatus.style.display = isPending ? "none" : "";

  // Mostrar filtro de estado únicamente en la pestaña Historial
  if (historyStatusFilterLabel) {
    historyStatusFilterLabel.style.display = isPending ? "none" : "";
  }
  if (isPending && historyStatusFilter) {
    historyStatusFilter.value = "";
  }

  renderRecords();
}

function getRecordKey(record) {
  return String(record.id) + "-" + record.day.toLowerCase();
}

function getCurrentRecord() {
  return records.find(function (item) {
    return getRecordKey(item) === currentRecordKey;
  });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (character) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });
}

function formatStatus(statusKey) {
  const statusInfo = STATUS_MAP[statusKey] || STATUS_MAP.pending;
  return { label: statusInfo.label, className: statusInfo.className };
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const parsedDate = new Date(dateValue + "T00:00:00");
  if (Number.isNaN(parsedDate.getTime())) return dateValue;

  return parsedDate.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(function () {
    toast.classList.remove("visible");
  }, 2800);
}

// ========================================================
// LÓGICA DE CÁLCULO DE HORAS Y RANGOS
// ========================================================
function add30Minutes(timeStr) {
  const parts = timeStr.split(":").map(Number);
  const totalMins = parts[0] * 60 + parts[1] + 30;
  const newH = Math.floor(totalMins / 60);
  const newM = totalMins % 60;
  return String(newH).padStart(2, "0") + ":" + String(newM).padStart(2, "0");
}

function formatDaySlotsToRange(slots) {
  if (!slots || !slots.length) return "";
  const sorted = [...slots].sort();

  const ranges = [];
  let rangeStart = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    if (add30Minutes(prev) === curr) {
      prev = curr;
    } else {
      ranges.push(`de ${rangeStart} a ${add30Minutes(prev)}`);
      rangeStart = curr;
      prev = curr;
    }
  }
  ranges.push(`de ${rangeStart} a ${add30Minutes(prev)}`);
  return ranges.join(" y ");
}

function getSelectedDaysWithSlots(selectedSlots) {
  if (!selectedSlots) return [];
  return Object.keys(selectedSlots).filter(function (dayKey) {
    return Array.isArray(selectedSlots[dayKey]) && selectedSlots[dayKey].length > 0;
  });
}

function formatAllScheduleSummary(selectedSlots) {
  const days = getSelectedDaysWithSlots(selectedSlots);
  if (!days.length) {
    return "Ningún bloque seleccionado en el horario";
  }

  const summaries = [];
  days.forEach(function (dayKey) {
    const range = formatDaySlotsToRange(selectedSlots[dayKey]);
    const dayObj = SCHEDULE_DAYS.find(function (d) { return d.key === dayKey; });
    const dayLabel = dayObj ? dayObj.label : dayKey;
    summaries.push(`${dayLabel} (${range})`);
  });

  return summaries.join(" • ");
}

// ========================================================
// RENDERIZADO DE LA GRILLA SEMANAL (7:00 am a 1:00 pm)
// ========================================================
function renderScheduleGrid(record) {
  if (!record.selectedSlots) {
    record.selectedSlots = {};
  }

  const activeDays = getSelectedDaysWithSlots(record.selectedSlots);
  const selectedCount = activeDays.length;

  selectedDaysSummaryText.textContent = `${selectedCount} / 2 días seleccionados`;
  if (selectedCount >= 2) {
    scheduleDaysPill.classList.add("limit-reached");
  } else {
    scheduleDaysPill.classList.remove("limit-reached");
  }

  scheduleHoursRangeText.textContent = formatAllScheduleSummary(record.selectedSlots);

  // Renderizar filas de la tabla de 7:00 am a 1:00 pm
  let html = "";
  SCHEDULE_HOURS.forEach(function (item) {
    const hour = item.value;
    const hourLabel = item.label;

    html += `<tr>`;
    html += `<td class="time-cell">${hourLabel}</td>`;

    SCHEDULE_DAYS.forEach(function (day) {
      const daySlots = record.selectedSlots[day.key] || [];
      const isSelected = daySlots.includes(hour);

      html += `<td>
        <button
          type="button"
          class="slot-block ${isSelected ? 'selected' : ''}"
          data-day="${day.key}"
          data-hour="${hour}"
          title="${day.label} ${hourLabel} ${isSelected ? '(Seleccionado)' : ''}"
          aria-label="${day.label} a las ${hourLabel}"
          aria-pressed="${isSelected ? 'true' : 'false'}"
        ></button>
      </td>`;
    });

    html += `</tr>`;
  });

  scheduleGridBody.innerHTML = html;
}

// Actualizar visibilidad de botones de adjuntar evidencia según el modo
function updateEvidenceEditButtons(record) {
  if (!isScheduleEditing) {
    if (addEvidenceBtn) addEvidenceBtn.style.display = "none";
    if (removeEvidenceBtn) removeEvidenceBtn.style.display = "none";
    return;
  }

  if (addEvidenceBtn) {
    addEvidenceBtn.style.display = "inline-flex";
    addEvidenceBtn.innerHTML = (record && record.evidenceAvailable)
      ? `<span aria-hidden="true">🔄</span> Cambiar archivo`
      : `<span aria-hidden="true">➕</span> Adjuntar archivo`;
  }

  if (removeEvidenceBtn) {
    removeEvidenceBtn.style.display = (record && record.evidenceAvailable) ? "inline-flex" : "none";
  }
}

// Alternar modo de edición / solo lectura
function toggleScheduleEditMode() {
  if (currentScheduleTab === "history") {
    showToast("ℹ️ Los cruces del historial no pueden ser modificados.");
    return;
  }

  const record = getCurrentRecord();
  if (!record) return;

  if (!isScheduleEditing) {
    isScheduleEditing = true;
    editScheduleBtn.innerHTML = `<span aria-hidden="true">💾</span> Guardar horario`;
    editScheduleBtn.className = "small-button primary edit-schedule-btn";
    scheduleGridTable.classList.remove("readonly-mode");
    scheduleGridTable.classList.add("editing-mode");
    scheduleEditNotice.style.display = "flex";
    updateEvidenceEditButtons(record);
    showToast("Modo edición activado: ahora puedes marcar cuadraditos o adjuntar evidencia.");
  } else {
    isScheduleEditing = false;
    persistRecords(records);
    renderScheduleGrid(record);
    editScheduleBtn.innerHTML = `<span aria-hidden="true">✏️</span> Modificar`;
    editScheduleBtn.className = "small-button secondary edit-schedule-btn";
    scheduleGridTable.classList.remove("editing-mode");
    scheduleGridTable.classList.add("readonly-mode");
    scheduleEditNotice.style.display = "none";
    updateEvidenceEditButtons(record);
    showToast("✓ Horario y evidencia guardados con éxito.");
  }
}

// Alternar selección de un bloque horario (solo permitido en modo edición)
function toggleScheduleSlot(dayKey, hour) {
  if (currentScheduleTab === "history") {
    showToast("ℹ️ Los cruces del historial no pueden ser modificados.");
    return;
  }

  if (!isScheduleEditing) {
    showToast("ℹ️ El horario está en modo solo lectura. Haz clic en 'Modificar' para editar los bloques.");
    return;
  }

  const record = getCurrentRecord();
  if (!record) return;

  if (!record.selectedSlots) {
    record.selectedSlots = {};
  }

  const daySlots = record.selectedSlots[dayKey] || [];
  const isSelected = daySlots.includes(hour);

  if (!isSelected) {
    const activeDays = getSelectedDaysWithSlots(record.selectedSlots);

    if (!activeDays.includes(dayKey) && activeDays.length >= 2) {
      const activeLabels = activeDays.map(function (d) {
        const found = SCHEDULE_DAYS.find(function (item) { return item.key === d; });
        return found ? found.label : d;
      });

      showToast(`⚠️ Máximo 2 días permitidos: Este colaborador ya tiene cruces en ${activeLabels.join(" y ")}. Deselecciona un día antes de elegir otro.`);
      return;
    }

    if (!record.selectedSlots[dayKey]) {
      record.selectedSlots[dayKey] = [];
    }
    record.selectedSlots[dayKey].push(hour);
    record.selectedSlots[dayKey].sort();
  } else {
    record.selectedSlots[dayKey] = daySlots.filter(function (h) { return h !== hour; });
    if (record.selectedSlots[dayKey].length === 0) {
      delete record.selectedSlots[dayKey];
    }
  }

  persistRecords(records);
  renderScheduleGrid(record);
  updateDayFieldDisplay(record);
}

// Actualizar en tiempo real el campo "Día del cruce" del panel izquierdo
function updateDayFieldDisplay(record) {
  const dayValueElement = document.getElementById("detailCruceDayValue");
  if (!dayValueElement) return;

  const activeDays = getSelectedDaysWithSlots(record.selectedSlots);
  if (activeDays.length > 0) {
    const labels = activeDays.map(function (k) {
      const d = SCHEDULE_DAYS.find(function (item) { return item.key === k; });
      return d ? d.label : k;
    });
    dayValueElement.textContent = labels.join(", ");
  } else {
    dayValueElement.textContent = record.day || "Sin definir";
  }
}

// ========================================================
// EVIDENCIA UNIVERSITARIA (PDF / IMAGEN) Y PREVISUALIZACIÓN
// ========================================================
function generateAcademicScheduleSVG(record) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 440" width="100%" height="100%">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#f2f5fd"/>
        </linearGradient>
        <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="115%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#1b2540" flood-opacity="0.08"/>
        </filter>
      </defs>

      <rect width="720" height="440" rx="16" fill="url(#bgGrad)"/>
      <rect x="24" y="24" width="672" height="392" rx="14" fill="#ffffff" stroke="#e2e8f4" stroke-width="1.5" filter="url(#cardShadow)"/>

      <text x="56" y="68" font-size="20" font-family="Segoe UI, Arial" fill="#4658d8" font-weight="800" letter-spacing="1">evidencia</text>
      <rect x="56" y="86" width="190" height="28" rx="7" fill="#4658d8" opacity="0.12"/>
      <text x="70" y="105" font-size="14" font-family="Segoe UI, Arial" fill="#1b2540" font-weight="700">Horario académico</text>

      <rect x="56" y="128" width="608" height="46" rx="9" fill="#f4f7fe"/>
      <text x="74" y="157" font-size="16" font-family="Segoe UI, Arial" fill="#1b2540" font-weight="700">${escapeHtml(record.name)}</text>
      <text x="440" y="157" font-size="14" font-family="Segoe UI, Arial" fill="#4658d8" font-weight="700">Área: ${escapeHtml(record.department)}</text>

      <g transform="translate(56, 192)">
        <rect x="0" y="0" width="140" height="120" rx="10" fill="#eef2ff" stroke="#dde5fc"/>
        <text x="20" y="34" font-size="14" font-family="Segoe UI, Arial" fill="#3546bd" font-weight="800">LUN</text>
        <text x="20" y="80" font-size="20" font-family="Segoe UI, Arial" fill="#1b2540" font-weight="700">07:00 am</text>
        <text x="20" y="102" font-size="11" font-family="Segoe UI, Arial" fill="#7587a8">Clase matutina</text>

        <rect x="156" y="0" width="140" height="120" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
        <text x="176" y="34" font-size="14" font-family="Segoe UI, Arial" fill="#3546bd" font-weight="800">MAR</text>
        <text x="176" y="80" font-size="20" font-family="Segoe UI, Arial" fill="#1b2540" font-weight="700">08:00 am</text>
        <text x="176" y="102" font-size="11" font-family="Segoe UI, Arial" fill="#7587a8">Teoría general</text>

        <rect x="312" y="0" width="140" height="120" rx="10" fill="#eef2ff" stroke="#dde5fc"/>
        <text x="332" y="34" font-size="14" font-family="Segoe UI, Arial" fill="#3546bd" font-weight="800">MIE</text>
        <text x="332" y="80" font-size="20" font-family="Segoe UI, Arial" fill="#1b2540" font-weight="700">11:00 am</text>
        <text x="332" y="102" font-size="11" font-family="Segoe UI, Arial" fill="#7587a8">Laboratorio</text>

        <rect x="468" y="0" width="140" height="120" rx="10" fill="#f8fafc" stroke="#e2e8f0"/>
        <text x="488" y="34" font-size="14" font-family="Segoe UI, Arial" fill="#3546bd" font-weight="800">JUE</text>
        <text x="488" y="80" font-size="20" font-family="Segoe UI, Arial" fill="#1b2540" font-weight="700">01:00 pm</text>
        <text x="488" y="102" font-size="11" font-family="Segoe UI, Arial" fill="#7587a8">Taller práctico</text>
      </g>

      <text x="58" y="356" font-size="13" font-family="Segoe UI, Arial" fill="#6d788d">
        ${escapeHtml(record.day)} • ${escapeHtml(record.type === "completo" ? "Cruce de jornada completa acreditado" : "Horario parcial acreditado")}
      </text>
      <text x="58" y="380" font-size="11" font-family="Segoe UI, Arial" fill="#94a3b8">
        Rango visual registrado: 07:00 am a 01:00 pm • Validación certificada para Talento Humano
      </text>
    </svg>
  `;
}

function isPdfEvidence(record) {
  if (!record || !record.evidenceAvailable) return false;
  if (record.evidenceType === "pdf") return true;
  return Boolean(record.evidenceName && record.evidenceName.toLowerCase().endsWith(".pdf"));
}

function buildEvidencePreview(record) {
  if (!record || !record.evidenceAvailable) {
    evidenceStatus.textContent = "SIN EVIDENCIA DISPONIBLE";
    evidenceStatus.className = "evidence-status not-available";
    if (openEvidenceFullBtn) openEvidenceFullBtn.style.display = "none";

    evidencePreview.innerHTML = `
      <div class="evidence-no-data">
        <div class="no-data-icon" aria-hidden="true">📋</div>
        <h5>Sin evidencia disponible</h5>
        <p>El colaborador no cuenta con documento probatorio ni horario universitario adjunto para este período.</p>
      </div>
    `;
    evidencePreview.style.cursor = "default";
    evidencePreview.title = "";
    return;
  }

  evidenceStatus.textContent = "EVIDENCIA DISPONIBLE";
  evidenceStatus.className = "evidence-status available";
  if (openEvidenceFullBtn) openEvidenceFullBtn.style.display = "none";

  const isHistoryTab = currentScheduleTab === "history";

  if (isPdfEvidence(record)) {
    // Si está en historial, no se muestra botón modificar
    const modifyButtonHtml = isHistoryTab
      ? ""
      : `<button type="button" class="pdf-quick-modify-btn" id="pdfCardQuickModifyBtn" title="Modificar evidencia (sacar o cambiar por otro PDF o imagen)">
          <span aria-hidden="true">✏️</span> Modificar
        </button>`;

    // Renderizado de tarjeta de Evidencia en PDF
    evidencePreview.innerHTML = `
      <div class="evidence-pdf-card" role="button" tabindex="0">
        <div class="pdf-icon-wrapper" aria-hidden="true">
          <span class="pdf-badge">PDF</span>
          <span class="pdf-big-icon">📄</span>
        </div>
        <div class="pdf-info">
          <h5 class="pdf-filename">${escapeHtml(record.evidenceName || "Horario_Universitario.pdf")}</h5>
          <p class="pdf-subtext">Constancia y horario universitario oficial de ${escapeHtml(record.name)}</p>
          <div class="pdf-meta-tags">
            <span class="pdf-tag">Acreditado</span>
            <span class="pdf-tag">Documento PDF</span>
          </div>
        </div>
        <div class="pdf-card-actions">
          ${modifyButtonHtml}
          <span class="pdf-action-link">Ver PDF ↗</span>
        </div>
      </div>
    `;
    evidencePreview.style.cursor = "pointer";
    evidencePreview.title = "Haz clic para ver el PDF en tamaño completo";

    const pdfCardQuickModifyBtn = document.getElementById("pdfCardQuickModifyBtn");
    if (pdfCardQuickModifyBtn) {
      pdfCardQuickModifyBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        openLightboxEvidence(true);
      });
    }
  } else {
    // Renderizado de imagen / SVG de horario
    const imageSrc = record.evidenceData || ("data:image/svg+xml;charset=utf-8," + encodeURIComponent(generateAcademicScheduleSVG(record)));
    evidencePreview.innerHTML = `<img alt="Evidencia del horario universitario de ${escapeHtml(record.name)}" src="${imageSrc}" />`;
    evidencePreview.style.cursor = "pointer";
    evidencePreview.title = "Haz clic para ver la imagen en tamaño completo";
  }
}

function openLightboxEvidence(openWithModify = false) {
  const record = getCurrentRecord();
  if (!record || !record.evidenceAvailable) return;

  const isHistoryTab = currentScheduleTab === "history";

  if (isPdfEvidence(record)) {
    // Vista completa para PDF
    const modifySectionHtml = isHistoryTab ? "" : `
      <button type="button" id="lightboxModifyPdfBtn" class="button button-primary" style="font-size: 0.84rem; height: 38px; display: inline-flex; align-items: center; gap: 6px;">
        <span aria-hidden="true">✏️</span> Modificar
      </button>
    `;

    const modifyPanelHtml = isHistoryTab ? "" : `
      <div id="lightboxModifyPanel" style="display: ${openWithModify ? 'block' : 'none'}; margin-top: 16px; padding: 16px; background: #f8fafc; border: 1px dashed #94a3b8; border-radius: 12px; text-align: center;">
        <p style="margin: 0 0 12px; font-size: 0.86rem; font-weight: 700; color: #1e293b;">
          Opciones de modificación de evidencia:
        </p>
        <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
          <button type="button" id="lightboxChangeFileBtn" class="button button-primary" style="font-size: 0.82rem; height: 36px; display: inline-flex; align-items: center; gap: 6px;">
            <span aria-hidden="true">📁</span> Poner otro PDF o imagen
          </button>
          <button type="button" id="lightboxRemovePdfBtn" class="button button-secondary" style="font-size: 0.82rem; height: 36px; display: inline-flex; align-items: center; gap: 6px; color: #dc2626; border-color: #fca5a5; background: #ffffff;">
            <span aria-hidden="true">🗑️</span> Sacar PDF
          </button>
        </div>
      </div>
    `;

    lightboxEvidenceContainer.innerHTML = `
      <div style="width: 100%; max-width: 620px; padding: 26px; text-align: center; background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
        <div style="font-size: 3.8rem; margin-bottom: 6px;">📄</div>
        <div style="display: inline-block; background: #dc2626; color: #fff; font-size: 0.72rem; font-weight: 800; padding: 3px 10px; border-radius: 6px; margin-bottom: 12px; letter-spacing: 0.05em;">DOCUMENTO PDF OFICIAL</div>
        <h4 style="margin: 0 0 6px; font-size: 1.2rem; color: #1e293b;">${escapeHtml(record.evidenceName || "Horario_Academico.pdf")}</h4>
        <p style="margin: 0 0 18px; font-size: 0.88rem; color: #64748b;">Comprobante de horario universitario presentado por ${escapeHtml(record.name)} · Área: ${escapeHtml(record.department)}</p>
        
        <div style="padding: 14px 18px; background: #f8fafc; border-radius: 10px; border: 1px dashed #cbd5e1; font-size: 0.82rem; color: #475569; margin-bottom: 20px; text-align: left; line-height: 1.6;">
          <p style="margin: 0 0 6px;"><strong>✓ Estado de revisión:</strong> Documento acreditado y registrado en Talento Humano.</p>
          <p style="margin: 0 0 6px;"><strong>✓ Periodo académico:</strong> ${escapeHtml(formatDate(record.fromDate))} al ${escapeHtml(formatDate(record.toDate))}</p>
          <p style="margin: 0;"><strong>✓ Validación:</strong> Cumple con las horas y franjas declaradas para el cruce de horario laboral.</p>
        </div>
        
        <div style="display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 4px;">
          <a href="data:application/pdf;base64,JVBERi0xLjc=" download="${escapeHtml(record.evidenceName || "Horario.pdf")}" class="button button-secondary" style="text-decoration: none; font-size: 0.84rem; height: 38px; display: inline-flex; align-items: center; gap: 6px;">
            <span aria-hidden="true">⬇️</span> Descargar PDF
          </a>
          ${modifySectionHtml}
        </div>

        ${modifyPanelHtml}
      </div>
    `;

    const modifyBtn = document.getElementById("lightboxModifyPdfBtn");
    const modifyPanel = document.getElementById("lightboxModifyPanel");
    const changeFileBtn = document.getElementById("lightboxChangeFileBtn");
    const removePdfBtn = document.getElementById("lightboxRemovePdfBtn");

    if (modifyBtn && modifyPanel) {
      modifyBtn.addEventListener("click", function () {
        const isHidden = modifyPanel.style.display === "none";
        modifyPanel.style.display = isHidden ? "block" : "none";
        if (isHidden) {
          modifyBtn.innerHTML = '<span aria-hidden="true">✖</span> Ocultar opciones';
        } else {
          modifyBtn.innerHTML = '<span aria-hidden="true">✏️</span> Modificar';
        }
      });
    }

    if (changeFileBtn && evidenceFileInput) {
      changeFileBtn.addEventListener("click", function () {
        evidenceFileInput.click();
      });
    }

    if (removePdfBtn) {
      removePdfBtn.addEventListener("click", function () {
        const rec = getCurrentRecord();
        if (!rec) return;
        rec.evidenceAvailable = false;
        rec.evidenceName = "";
        rec.evidenceData = "";
        rec.evidenceType = "";
        persistRecords(records);
        buildEvidencePreview(rec);
        updateEvidenceEditButtons(rec);
        evidenceLightboxDialog.close();
        showToast("✓ Se retiró el archivo PDF. Ahora el colaborador figura sin evidencia disponible.");
      });
    }
  } else {
    // Vista completa para Imagen / SVG
    const imageSrc = record.evidenceData || ("data:image/svg+xml;charset=utf-8," + encodeURIComponent(generateAcademicScheduleSVG(record)));
    const imageActionsHtml = isHistoryTab ? "" : `
      <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 4px;">
        <button type="button" id="lightboxChangeImgBtn" class="button button-primary" style="font-size: 0.82rem; height: 36px; display: inline-flex; align-items: center; gap: 6px;">
          <span aria-hidden="true">📁</span> Poner otro PDF o imagen
        </button>
        <button type="button" id="lightboxRemoveImgBtn" class="button button-secondary" style="font-size: 0.82rem; height: 36px; display: inline-flex; align-items: center; gap: 6px; color: #dc2626; border-color: #fca5a5; background: #ffffff;">
          <span aria-hidden="true">🗑️</span> Sacar evidencia
        </button>
      </div>
    `;

    lightboxEvidenceContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%;">
        <img alt="Vista completa de evidencia de ${escapeHtml(record.name)}" src="${imageSrc}" style="max-width: 100%; height: auto; border-radius: 8px;" />
        ${imageActionsHtml}
      </div>
    `;

    const changeImgBtn = document.getElementById("lightboxChangeImgBtn");
    const removeImgBtn = document.getElementById("lightboxRemoveImgBtn");

    if (changeImgBtn && evidenceFileInput) {
      changeImgBtn.addEventListener("click", function () {
        evidenceFileInput.click();
      });
    }

    if (removeImgBtn) {
      removeImgBtn.addEventListener("click", function () {
        const rec = getCurrentRecord();
        if (!rec) return;
        rec.evidenceAvailable = false;
        rec.evidenceName = "";
        rec.evidenceData = "";
        rec.evidenceType = "";
        persistRecords(records);
        buildEvidencePreview(rec);
        updateEvidenceEditButtons(rec);
        evidenceLightboxDialog.close();
        showToast("✓ Se retiró la imagen de evidencia. Ahora figura sin evidencia disponible.");
      });
    }
  }

  evidenceLightboxDialog.showModal();
}

// ========================================================
// DETALLES DEL REGISTRO (VISTA EVALUAR / CONSULTAR)
// ========================================================
function openRecordDetails(recordKey) {
  const record = records.find(function (item) {
    return getRecordKey(item) === recordKey;
  });

  if (!record) return;

  currentRecordKey = recordKey;
  const isHistory = currentScheduleTab === "history";
  const eyebrow = detailsDialog.querySelector(".eyebrow");
  if (eyebrow) {
    eyebrow.textContent = isHistory ? "CONSULTA DE CRUCE" : "EVALUACIÓN DE CRUCE";
  }
  detailsDialogTitle.textContent = record.name;

  // Si está en la pestaña Historial: vista de solo lectura estricta con un solo botón (la "X")
  if (isHistory) {
    if (dialogActionsLeft) dialogActionsLeft.style.display = "none";
    if (dialogActionsRight) dialogActionsRight.style.display = "none";
    if (closeDetailsAction) closeDetailsAction.style.display = "none";
    if (approveButton) approveButton.style.display = "none";
    if (rejectButton) rejectButton.style.display = "none";
    if (revertPendingButton) revertPendingButton.style.display = "none";
    if (editScheduleBtn) editScheduleBtn.style.display = "none";
    if (addEvidenceBtn) addEvidenceBtn.style.display = "none";
    if (removeEvidenceBtn) removeEvidenceBtn.style.display = "none";
    if (observationActions) observationActions.style.display = "none";
    recordObservationInput.readOnly = true;
    recordObservationInput.placeholder = "Sin observación registrada.";
  } else {
    // Pestaña Pendientes ("Evaluar"): permite evaluar con Aprobar, Rechazar, editar horario y observación
    if (dialogActionsLeft) dialogActionsLeft.style.display = "flex";
    if (dialogActionsRight) dialogActionsRight.style.display = "flex";
    if (closeDetailsAction) closeDetailsAction.style.display = "inline-flex";
    if (approveButton) approveButton.style.display = "inline-flex";
    if (rejectButton) rejectButton.style.display = "inline-flex";
    if (revertPendingButton) revertPendingButton.style.display = "none";
    if (editScheduleBtn) editScheduleBtn.style.display = "inline-flex";
    if (observationActions) observationActions.style.display = "flex";
    recordObservationInput.readOnly = false;
    recordObservationInput.placeholder = "Registrar o editar observación...";
  }

  isScheduleEditing = false;
  editScheduleBtn.innerHTML = `<span aria-hidden="true">✏️</span> Modificar`;
  editScheduleBtn.className = "small-button secondary edit-schedule-btn";
  scheduleGridTable.classList.remove("editing-mode");
  scheduleGridTable.classList.add("readonly-mode");
  scheduleEditNotice.style.display = "none";

  const status = formatStatus(record.status);
  const fullDayText = record.type === "completo" ? "CRUCE DE JORNADA COMPLETA" : "CRUCE POR HORAS";

  const activeDays = getSelectedDaysWithSlots(record.selectedSlots);
  let cruceDaysText = record.day;
  if (activeDays.length > 0) {
    const labels = activeDays.map(function (k) {
      const d = SCHEDULE_DAYS.find(function (item) { return item.key === k; });
      return d ? d.label : k;
    });
    cruceDaysText = labels.join(", ");
  }

  // Renderizar campos: ID, Nombre, Área, Día, Desde, Hasta, Estado
  recordDetails.innerHTML = `
    <div class="field-card">
      <div class="field-label">ID DEL COLABORADOR</div>
      <div class="field-value">${escapeHtml(record.employeeId)}</div>
    </div>
    <div class="field-card">
      <div class="field-label">NOMBRE COMPLETO</div>
      <div class="field-value">${escapeHtml(record.name)}</div>
    </div>
    <div class="field-card">
      <div class="field-label">ÁREA / DEPARTAMENTO</div>
      <div class="field-value">${escapeHtml(record.department)}</div>
    </div>
    <div class="field-card">
      <div class="field-label">DÍA DEL CRUCE</div>
      <div class="field-value" id="detailCruceDayValue">${escapeHtml(cruceDaysText)}</div>
    </div>
    <div class="field-card">
      <div class="field-label">FECHA DESDE</div>
      <div class="field-value">${escapeHtml(formatDate(record.fromDate))}</div>
    </div>
    <div class="field-card">
      <div class="field-label">FECHA HASTA</div>
      <div class="field-value">${escapeHtml(formatDate(record.toDate))}</div>
    </div>
    <div class="field-card full-width">
      <div class="field-label">ESTADO</div>
      <div class="field-value" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span class="status-badge ${status.className}">${status.label}</span>
        <span class="detail-highlight">${escapeHtml(fullDayText)}</span>
      </div>
    </div>
  `;

  recordObservationInput.value = record.observation || "";

  renderScheduleGrid(record);
  buildEvidencePreview(record);
  if (!isHistory) {
    updateEvidenceEditButtons(record);
  }

  detailsDialog.showModal();
}

function updateStatus(newStatus) {
  const record = getCurrentRecord();
  if (!record) return;

  const currentObs = recordObservationInput.value.trim();
  record.observation = currentObs;

  record.status = newStatus;
  persistRecords(records);
  renderRecords();

  const statusInfo = formatStatus(newStatus);
  if (newStatus === "approved") {
    showToast("✓ Cruce aprobado con éxito.");
  } else if (newStatus === "rejected") {
    showToast("✕ Cruce rechazado.");
  } else {
    showToast("Estado actualizado a " + statusInfo.label);
  }

  detailsDialog.close();
}

function saveObservation() {
  const record = getCurrentRecord();
  if (!record) return;

  record.observation = recordObservationInput.value.trim();
  persistRecords(records);
  showToast("Observación registrada con éxito.");
}

// ========================================================
// FILTROS Y TABLA PRINCIPAL (PENDIENTES E HISTORIAL)
// ========================================================
function getFilteredRecords() {
  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const areaValue = departmentFilter ? departmentFilter.value : "";
  const dayValue = dayFilter ? dayFilter.value : "";
  const historyStatusValue = (currentScheduleTab === "history" && historyStatusFilter) ? historyStatusFilter.value : "";

  return records.filter(function (record) {
    const isPending = record.status === "pending";
    if (currentScheduleTab === "pending" && !isPending) {
      return false;
    }
    if (currentScheduleTab === "history") {
      if (isPending) return false;
      if (historyStatusValue) {
        if (historyStatusValue === "approved") {
          if (record.status !== "approved" && record.status !== "validated") return false;
        } else if (historyStatusValue === "rejected") {
          if (record.status !== "rejected") return false;
        }
      }
    }

    const matchesSearch =
      !searchTerm ||
      String(record.id).toLowerCase().includes(searchTerm) ||
      record.name.toLowerCase().includes(searchTerm) ||
      String(record.employeeId).toLowerCase().includes(searchTerm) ||
      record.department.toLowerCase().includes(searchTerm);

    const matchesArea = !areaValue || record.department === areaValue;
    const matchesDay = !dayValue || record.day === dayValue;

    return matchesSearch && matchesArea && matchesDay;
  });
}

function populateFilters() {
  // Combinar áreas oficiales y registros
  const areasList = Array.from(new Set(OFFICIAL_AREAS.concat(records.map(function (r) { return r.department; })))).sort();
  const days = Array.from(new Set(records.map(function (record) { return record.day; }))).sort();

  if (departmentFilter) {
    departmentFilter.innerHTML = '<option value="">Todas las áreas</option>' + areasList.map(function (area) {
      return '<option value="' + escapeHtml(area) + '">' + escapeHtml(area) + '</option>';
    }).join("");
  }

  if (dayFilter) {
    dayFilter.innerHTML = '<option value="">Todos los días</option>' + days.map(function (day) {
      return '<option value="' + escapeHtml(day) + '">' + escapeHtml(day) + '</option>';
    }).join("");
  }
}

function renderRecords() {
  // Actualizar conteos de badges de las pestañas
  const pendingCount = records.filter(function (r) { return r.status === "pending"; }).length;
  const historyCount = records.filter(function (r) { return r.status !== "pending"; }).length;
  if (badgePending) badgePending.textContent = pendingCount;
  if (badgeHistory) badgeHistory.textContent = historyCount;

  const isPendingTab = currentScheduleTab === "pending";
  if (thStatusCol) thStatusCol.style.display = isPendingTab ? "none" : "";
  if (colStatus) colStatus.style.display = isPendingTab ? "none" : "";

  const filteredRecords = getFilteredRecords();
  recordsCount.textContent = filteredRecords.length + " registro" + (filteredRecords.length === 1 ? "" : "s");

  const totalCols = isPendingTab ? 8 : 9;

  if (!filteredRecords.length) {
    let emptyMsg = "No hay cruces pendientes de evaluación.";
    if (!isPendingTab) {
      const historyStatusValue = historyStatusFilter ? historyStatusFilter.value : "";
      if (historyStatusValue === "approved") {
        emptyMsg = "No hay cruces aprobados en el historial.";
      } else if (historyStatusValue === "rejected") {
        emptyMsg = "No hay cruces rechazados en el historial.";
      } else {
        emptyMsg = "No hay cruces registrados en el historial.";
      }
    }

    recordsTableBody.innerHTML = `
      <tr>
        <td colspan="${totalCols}" class="empty-state">
          <div class="empty-table">${emptyMsg}</div>
        </td>
      </tr>
    `;
    return;
  }

  recordsTableBody.innerHTML = filteredRecords.map(function (record) {
    const status = formatStatus(record.status);
    const dayType = record.type === "completo" ? "Día completo" : "Por horas";
    const dayTypeClass = record.type === "completo" ? "full" : "hours";

    const statusTd = isPendingTab
      ? ""
      : `<td><span class="status-badge ${status.className}">${status.label}</span></td>`;

    const actionBtn = isPendingTab
      ? `<button class="small-button primary" type="button" data-action="details" data-key="${escapeHtml(getRecordKey(record))}"><span aria-hidden="true">⚖️</span> Evaluar</button>`
      : `<button class="small-button secondary" type="button" data-action="details" data-key="${escapeHtml(getRecordKey(record))}">Consultar</button>`;

    return `
      <tr>
        <td>${escapeHtml(record.id)}</td>
        <td class="employee-name">${escapeHtml(record.name)}</td>
        <td><span class="area-badge">${escapeHtml(record.department)}</span></td>
        <td>
          <div class="day-cell">
            <span>${escapeHtml(record.day)}</span>
            <span class="day-type-tag ${dayTypeClass}">${escapeHtml(dayType)}</span>
          </div>
        </td>
        <td>${escapeHtml(record.entryTime)}</td>
        <td>${escapeHtml(record.exitTime)}</td>
        <td>${escapeHtml(record.dueHours)}</td>
        ${statusTd}
        <td>
          <div class="table-actions">
            ${actionBtn}
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// ========================================================
// LISTENERS Y EVENTOS
// ========================================================
if (searchInput) searchInput.addEventListener("input", renderRecords);
if (departmentFilter) departmentFilter.addEventListener("change", renderRecords);
if (dayFilter) dayFilter.addEventListener("change", renderRecords);
if (historyStatusFilter) historyStatusFilter.addEventListener("change", renderRecords);

if (tabButtonPending) {
  tabButtonPending.addEventListener("click", function () {
    setScheduleActiveTab("pending");
  });
}
if (tabButtonHistory) {
  tabButtonHistory.addEventListener("click", function () {
    setScheduleActiveTab("history");
  });
}

recordsTableBody.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action='details']");
  if (!button) return;

  const recordKey = button.getAttribute("data-key");
  openRecordDetails(recordKey);
});

editScheduleBtn.addEventListener("click", toggleScheduleEditMode);

scheduleGridBody.addEventListener("click", function (event) {
  const block = event.target.closest(".slot-block");
  if (!block) return;

  const day = block.getAttribute("data-day");
  const hour = block.getAttribute("data-hour");
  if (day && hour) {
    toggleScheduleSlot(day, hour);
  }
});

// Eventos para adjuntar y remover evidencia en modo edición
if (addEvidenceBtn && evidenceFileInput) {
  addEvidenceBtn.addEventListener("click", function () {
    evidenceFileInput.click();
  });
}

if (evidenceFileInput) {
  evidenceFileInput.addEventListener("change", function () {
    const file = evidenceFileInput.files && evidenceFileInput.files[0];
    if (!file) return;

    const record = getCurrentRecord();
    if (!record) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    record.evidenceAvailable = true;
    record.evidenceName = file.name;
    record.evidenceType = isPdf ? "pdf" : "image";

    if (!isPdf) {
      const reader = new FileReader();
      reader.onload = function (e) {
        record.evidenceData = e.target.result;
        persistRecords(records);
        buildEvidencePreview(record);
        updateEvidenceEditButtons(record);
        if (evidenceLightboxDialog && evidenceLightboxDialog.open) {
          openLightboxEvidence(false);
        }
        showToast("✓ Imagen adjuntada: " + file.name);
      };
      reader.readAsDataURL(file);
    } else {
      record.evidenceData = "";
      persistRecords(records);
      buildEvidencePreview(record);
      updateEvidenceEditButtons(record);
      if (evidenceLightboxDialog && evidenceLightboxDialog.open) {
        openLightboxEvidence(false);
      }
      showToast("✓ PDF adjuntado: " + file.name);
    }
    evidenceFileInput.value = "";
  });
}

if (removeEvidenceBtn) {
  removeEvidenceBtn.addEventListener("click", function () {
    const record = getCurrentRecord();
    if (!record) return;

    record.evidenceAvailable = false;
    record.evidenceName = "";
    record.evidenceData = "";
    record.evidenceType = "";
    persistRecords(records);
    buildEvidencePreview(record);
    updateEvidenceEditButtons(record);
    showToast("Evidencia removida.");
  });
}

if (saveObservationButton) saveObservationButton.addEventListener("click", saveObservation);
if (approveButton) {
  approveButton.addEventListener("click", function () {
    updateStatus("approved");
  });
}
if (rejectButton) {
  rejectButton.addEventListener("click", function () {
    updateStatus("rejected");
  });
}
if (revertPendingButton) {
  revertPendingButton.addEventListener("click", function () {
    updateStatus("pending");
  });
}

if (closeDetailsButton) {
  closeDetailsButton.addEventListener("click", function () {
    detailsDialog.close();
  });
}
if (closeDetailsAction) {
  closeDetailsAction.addEventListener("click", function () {
    detailsDialog.close();
  });
}
if (detailsDialog) {
  detailsDialog.addEventListener("cancel", function (event) {
    event.preventDefault();
    detailsDialog.close();
  });
}

if (openEvidenceFullBtn) {
  openEvidenceFullBtn.addEventListener("click", function () {
    openLightboxEvidence();
  });
}
if (evidencePreview) {
  evidencePreview.addEventListener("click", function () {
    const record = getCurrentRecord();
    if (record && record.evidenceAvailable) {
      openLightboxEvidence();
    }
  });
}
if (closeLightboxButton) {
  closeLightboxButton.addEventListener("click", function () {
    evidenceLightboxDialog.close();
  });
}
if (closeLightboxAction) {
  closeLightboxAction.addEventListener("click", function () {
    evidenceLightboxDialog.close();
  });
}
if (evidenceLightboxDialog) {
  evidenceLightboxDialog.addEventListener("cancel", function (event) {
    event.preventDefault();
    evidenceLightboxDialog.close();
  });
}

// Inicializar
populateFilters();
renderRecords();
