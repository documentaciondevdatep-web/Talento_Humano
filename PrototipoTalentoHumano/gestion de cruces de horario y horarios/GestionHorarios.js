"use strict";

const STATUS_MAP = {
  pending: { label: "PENDIENTE", className: "status-pending" },
  validated: { label: "VALIDADO", className: "status-validated" }
};


const STORAGE_KEY_CRUCES = "th_cruces_horarios_v2";
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

const defaultRecords = [
  {
    id: 971,
    employeeId: 971,
    name: "Nayoli Pérez",
    department: "Administración",
    day: "Martes",
    type: "completo",
    entryTime: "Todo el día",
    exitTime: "Todo el día",
    dueHours: "Todo el día",
    fromDate: "2026-02-02",
    toDate: "2026-06-30",
    workEntry: "Todo el día",
    workExit: "Todo el día",
    classStart: "Todo el día",
    classEnd: "Todo el día",
    status: "pending",
    evidenceAvailable: true,
    evidenceName: "Horario_Univ_Ana.png",
    observation: "Registro de demostración para cruce de día completo."
  },
  {
    id: 971,
    employeeId: 971,
    name: "Nayoli Pérez",
    department: "Administración",
    day: "Viernes",
    type: "completo",
    entryTime: "Todo el día",
    exitTime: "Todo el día",
    dueHours: "Todo el día",
    fromDate: "2026-02-02",
    toDate: "2026-06-30",
    workEntry: "Todo el día",
    workExit: "Todo el día",
    classStart: "Todo el día",
    classEnd: "Todo el día",
    status: "pending",
    evidenceAvailable: true,
    evidenceName: "Horario_Univ_Ana.png",
    observation: "Registro de demostración para cruce de día completo."
  },
  {
    id: 979,
    employeeId: 979,
    name: "Luciana Sicos",
    department: "Operaciones",
    day: "Jueves",
    type: "horas",
    entryTime: "10:00",
    exitTime: "13:00",
    dueHours: "2h",
    fromDate: "2026-02-03",
    toDate: "2026-06-28",
    workEntry: "10:00",
    workExit: "13:00",
    classStart: "10:00",
    classEnd: "13:00",
    status: "validated",
    evidenceAvailable: true,
    evidenceName: "Horario_Uni_Miguel.jpg",
    observation: "Cruce por horario específico. Evidencia de demostración."
  },
  {
    id: 980,
    employeeId: 980,
    name: "Niurka Palacios",
    department: "Marketing",
    day: "Lunes",
    type: "horas",
    entryTime: "10:00",
    exitTime: "13:00",
    dueHours: "2h",
    fromDate: "2026-02-04",
    toDate: "2026-07-01",
    workEntry: "10:00",
    workExit: "13:00",
    classStart: "10:00",
    classEnd: "13:00",
    status: "pending",
    evidenceAvailable: false,
    evidenceName: "",
    observation: "Horario pendiente de revisión por Talento Humano."
  },
  {
    id: 980,
    employeeId: 980,
    name: "Niurka Palacios",
    department: "Marketing",
    day: "Martes",
    type: "completo",
    entryTime: "Todo el día",
    exitTime: "Todo el día",
    dueHours: "Todo el día",
    fromDate: "2026-02-04",
    toDate: "2026-07-01",
    workEntry: "Todo el día",
    workExit: "Todo el día",
    classStart: "Todo el día",
    classEnd: "Todo el día",
    status: "pending",
    evidenceAvailable: false,
    evidenceName: "",
    observation: "Horario pendiente de revisión por Talento Humano."
  },
  {
    id: 981,
    employeeId: 981,
    name: "Luis Camus",
    department: "Soporte",
    day: "Jueves",
    type: "completo",
    entryTime: "Todo el día",
    exitTime: "Todo el día",
    dueHours: "Todo el día",
    fromDate: "2026-02-05",
    toDate: "2026-06-29",
    workEntry: "Todo el día",
    workExit: "Todo el día",
    classStart: "Todo el día",
    classEnd: "Todo el día",
    status: "pending",
    evidenceAvailable: true,
    evidenceName: "Horario_Soporte_Diego.pdf",
    observation: "Registro de demostración para cruce de día completo."
  },
  {
    id: 988,
    employeeId: 988,
    name: "Luis Roman",
    department: "Compras",
    day: "Lunes",
    type: "horas",
    entryTime: "08:00",
    exitTime: "13:00",
    dueHours: "1h",
    fromDate: "2026-02-06",
    toDate: "2026-07-02",
    workEntry: "08:00",
    workExit: "13:00",
    classStart: "08:00",
    classEnd: "13:00",
    status: "validated",
    evidenceAvailable: true,
    evidenceName: "Horario_Universidad_Valeria.png",
    observation: "Cruce por horario específico. Registro previamente validado."
  },
  {
    id: 988,
    employeeId: 988,
    name: "Luis Roman",
    department: "Compras",
    day: "Miércoles",
    type: "horas",
    entryTime: "10:00",
    exitTime: "13:00",
    dueHours: "2h",
    fromDate: "2026-02-06",
    toDate: "2026-07-02",
    workEntry: "10:00",
    workExit: "13:00",
    classStart: "10:00",
    classEnd: "13:00",
    status: "validated",
    evidenceAvailable: true,
    evidenceName: "Horario_Universidad_Valeria.png",
    observation: "Cruce por horario específico. Registro previamente validado."
  },
  {
    id: 992,
    employeeId: 992,
    name: "Naudy_Noa.992",
    department: "Administración",
    day: "Martes",
    type: "horas",
    entryTime: "08:00",
    exitTime: "12:00",
    dueHours: "1h",
    fromDate: "2026-02-09",
    toDate: "2026-07-02",
    workEntry: "08:00",
    workExit: "12:00",
    classStart: "08:00",
    classEnd: "12:00",
    status: "pending",
    evidenceAvailable: true,
    evidenceName: "Horario_Jorge_Lunes.png",
    observation: "Registro de demostración para revisión de horario."
  },
  {
    id: 996,
    employeeId: 996,
    name: "Diego_Aguirre.996",
    department: "Finanzas",
    day: "Jueves",
    type: "completo",
    entryTime: "Todo el día",
    exitTime: "Todo el día",
    dueHours: "Todo el día",
    fromDate: "2026-02-12",
    toDate: "2026-06-25",
    workEntry: "Todo el día",
    workExit: "Todo el día",
    classStart: "Todo el día",
    classEnd: "Todo el día",
    status: "review",
    evidenceAvailable: false,
    evidenceName: "",
    observation: "Horario pendiente de revisión por Talento Humano."
  },
  {
    id: 1012,
    employeeId: 1012,
    name: "Angelo Cervantes",
    department: "Tecnología",
    day: "Lunes",
    type: "horas",
    entryTime: "08:00",
    exitTime: "11:00",
    dueHours: "2h",
    fromDate: "2026-02-17",
    toDate: "2026-06-30",
    workEntry: "08:00",
    workExit: "11:00",
    classStart: "08:00",
    classEnd: "11:00",
    status: "validated",
    evidenceAvailable: true,
    evidenceName: "Horario_Eduardo_Martes.jpg",
    observation: "Cruce por horario específico. Registro previamente validado."
  },
  {
    id: 1038,
    employeeId: 1038,
    name: "Susan Díaz",
    department: "Tecnología",
    day: "Miércoles",
    type: "horas",
    entryTime: "10:00",
    exitTime: "13:00",
    dueHours: "2h",
    fromDate: "2026-02-17",
    toDate: "2026-06-30",
    workEntry: "10:00",
    workExit: "13:00",
    classStart: "10:00",
    classEnd: "13:00",
    status: "validated",
    evidenceAvailable: true,
    evidenceName: "Horario_Susan_Martes.jpg",
    observation: "Registro de demostración asociado al ID de referencia."
  }
];

const records = getStoredRecords(defaultRecords);

const searchInput = document.getElementById("searchInput");
const departmentFilter = document.getElementById("departmentFilter");
const dayFilter = document.getElementById("dayFilter");
const statusFilter = document.getElementById("statusFilter");
const recordsTableBody = document.getElementById("recordsTableBody");
const recordsCount = document.getElementById("recordsCount");
const detailsDialog = document.getElementById("detailsDialog");
const recordDetails = document.getElementById("recordDetails");
const evidencePreview = document.getElementById("evidencePreview");
const evidenceText = document.getElementById("evidenceText");
const evidenceMeta = document.getElementById("evidenceMeta");
const evidenceStatus = document.getElementById("evidenceStatus");
const detailsDialogTitle = document.getElementById("detailsDialogTitle");
const validateButton = document.getElementById("validateButton");
const pendingReviewButton = document.getElementById("pendingReviewButton");
const closeDetailsButton = document.getElementById("closeDetailsButton");
const closeDetailsAction = document.getElementById("closeDetailsAction");
const toast = document.getElementById("toast");

let currentRecordKey = null;
let toastTimer = null;

function getRecordKey(record) {
  return String(record.id) + "-" + record.day.toLowerCase();
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
  if (!dateValue) {
    return "-";
  }

  const parsedDate = new Date(dateValue + "T00:00:00");
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

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
  }, 2600);
}

function getFilteredRecords() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const departmentValue = departmentFilter.value;
  const dayValue = dayFilter.value;
  const statusValue = statusFilter.value;

  return records.filter(function (record) {
    const matchesSearch =
      !searchTerm ||
      String(record.id).toLowerCase().includes(searchTerm) ||
      record.name.toLowerCase().includes(searchTerm) ||
      String(record.employeeId).toLowerCase().includes(searchTerm);

    const matchesDepartment = !departmentValue || record.department === departmentValue;
    const matchesDay = !dayValue || record.day === dayValue;
    const matchesStatus = !statusValue || record.status === statusValue;

    return matchesSearch && matchesDepartment && matchesDay && matchesStatus;
  });
}

function populateFilters() {
  const departments = Array.from(new Set(records.map(function (record) {
    return record.department;
  }))).sort();

  const days = Array.from(new Set(records.map(function (record) {
    return record.day;
  }))).sort();

  const statuses = Object.keys(STATUS_MAP);

  departmentFilter.innerHTML = '<option value="">Todos los departamentos</option>' + departments.map(function (department) {
    return '<option value="' + escapeHtml(department) + '">' + escapeHtml(department) + '</option>';
  }).join("");

  dayFilter.innerHTML = '<option value="">Todos los días</option>' + days.map(function (day) {
    return '<option value="' + escapeHtml(day) + '">' + escapeHtml(day) + '</option>';
  }).join("");

  statusFilter.innerHTML = '<option value="">Todos los estados</option>' + statuses.map(function (key) {
    return '<option value="' + escapeHtml(key) + '">' + escapeHtml(STATUS_MAP[key].label) + '</option>';
  }).join("");
}

function renderRecords() {
  const filteredRecords = getFilteredRecords();
  recordsCount.textContent = filteredRecords.length + " registro" + (filteredRecords.length === 1 ? "" : "s");

  if (!filteredRecords.length) {
    recordsTableBody.innerHTML = `
      <tr>
        <td colspan="10" class="empty-state">
          <div class="empty-table">No hay cruces que coincidan con los filtros aplicados.</div>
        </td>
      </tr>
    `;
    return;
  }

  recordsTableBody.innerHTML = filteredRecords.map(function (record) {
    const status = formatStatus(record.status);
    const dayType = record.type === "completo" ? "Día completo" : "Por horas";
    const dayTypeClass = record.type === "completo" ? "full" : "hours";

    return `
      <tr>
        <td>${escapeHtml(record.id)}</td>
        <td class="employee-name">${escapeHtml(record.name)}</td>
        <td>
          <div class="day-cell">
            <span>${escapeHtml(record.day)}</span>
            <span class="day-type-tag ${dayTypeClass}">${escapeHtml(dayType)}</span>
          </div>
        </td>
        <td>${escapeHtml(record.entryTime)}</td>
        <td>${escapeHtml(record.exitTime)}</td>
        <td>${escapeHtml(record.dueHours)}</td>
        <td>${escapeHtml(formatDate(record.fromDate))}</td>
        <td>${escapeHtml(formatDate(record.toDate))}</td>
        <td><span class="status-badge ${status.className}">${status.label}</span></td>
        <td>
          <div class="table-actions">
            <button class="small-button primary" type="button" data-action="details" data-key="${escapeHtml(getRecordKey(record))}">Consultar</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function buildEvidencePreview(record) {
  if (!record.evidenceAvailable) {
    evidenceStatus.textContent = "Sin evidencia";
    evidenceStatus.classList.remove("available");
    evidencePreview.classList.add("evidence-placeholder");
    evidencePreview.innerHTML = `
      <div class="placeholder-icon" aria-hidden="true">🗂️</div>
      <p id="evidenceText">No se adjuntó evidencia para este registro.</p>
    `;
    evidenceMeta.textContent = "Talento Humano debe revisar la información académica antes de validar el cruce.";
    return;
  }

  evidenceStatus.textContent = "Evidencia disponible";
  evidenceStatus.classList.add("available");

  const svgData = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 460">
      <defs>
        <linearGradient id="bg" x1="0" x2="1">
          <stop offset="0%" stop-color="#f4f6ff"/>
          <stop offset="100%" stop-color="#eaf0ff"/>
        </linearGradient>
      </defs>
      <rect width="720" height="460" fill="url(#bg)"/>
      <rect x="42" y="40" width="636" height="380" rx="18" fill="#ffffff" stroke="#dfe7ff"/>
      <rect x="74" y="76" width="220" height="34" rx="8" fill="#4658d8" opacity="0.12"/>
      <text x="96" y="100" font-size="22" font-family="Segoe UI, Arial" fill="#1b2540" font-weight="700">Horario académico</text>
      <rect x="74" y="128" width="560" height="50" rx="10" fill="#f3f7ff"/>
      <text x="96" y="160" font-size="18" font-family="Segoe UI, Arial" fill="#1b2540">${escapeHtml(record.name)}</text>
      <text x="420" y="160" font-size="16" font-family="Segoe UI, Arial" fill="#7587a8">${escapeHtml(record.department)}</text>
      <rect x="74" y="196" width="132" height="120" rx="12" fill="#eef1ff"/>
      <rect x="218" y="196" width="132" height="120" rx="12" fill="#f5f7ff"/>
      <rect x="362" y="196" width="132" height="120" rx="12" fill="#eef1ff"/>
      <rect x="506" y="196" width="128" height="120" rx="12" fill="#f5f7ff"/>
      <text x="92" y="232" font-size="16" font-family="Segoe UI, Arial" fill="#4658d8" font-weight="700">LUN</text>
      <text x="236" y="232" font-size="16" font-family="Segoe UI, Arial" fill="#4658d8" font-weight="700">MAR</text>
      <text x="381" y="232" font-size="16" font-family="Segoe UI, Arial" fill="#4658d8" font-weight="700">MIE</text>
      <text x="521" y="232" font-size="16" font-family="Segoe UI, Arial" fill="#4658d8" font-weight="700">JUE</text>
      <text x="100" y="288" font-size="22" font-family="Segoe UI, Arial" fill="#1b2540">07:00</text>
      <text x="244" y="288" font-size="22" font-family="Segoe UI, Arial" fill="#1b2540">08:00</text>
      <text x="385" y="288" font-size="22" font-family="Segoe UI, Arial" fill="#1b2540">13:00</text>
      <text x="530" y="288" font-size="22" font-family="Segoe UI, Arial" fill="#1b2540">15:00</text>
      <text x="90" y="392" font-size="16" font-family="Segoe UI, Arial" fill="#7587a8">${escapeHtml(record.day)} · ${escapeHtml(record.type === "completo" ? "día completo" : "horario parcial")}</text>
    </svg>
  `;

  evidencePreview.classList.remove("evidence-placeholder");
  evidencePreview.innerHTML = `<img alt="Evidencia del horario académico" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}" />`;
  evidenceText.textContent = record.evidenceName || "Archivo de evidencia disponible";
  evidenceMeta.textContent = "Se conserva la evidencia documentada por el colaborador para revisión de Talento Humano.";
}

function openRecordDetails(recordKey) {
  const record = records.find(function (item) {
    return getRecordKey(item) === recordKey;
  });

  if (!record) {
    return;
  }

  currentRecordKey = recordKey;
  detailsDialogTitle.textContent = record.name;

  const status = formatStatus(record.status);
  const fullDayText = record.type === "completo" ? "Cruce de jornada completa" : "Cruce por horario específico";

  recordDetails.innerHTML = `
    <div>
      <dt>ID del colaborador</dt>
      <dd>${escapeHtml(record.employeeId)}</dd>
    </div>
    <div>
      <dt>Nombre completo</dt>
      <dd>${escapeHtml(record.name)}</dd>
    </div>
    <div>
      <dt>Departamento o área</dt>
      <dd>${escapeHtml(record.department)}</dd>
    </div>
    <div>
      <dt>Día del cruce</dt>
      <dd>${escapeHtml(record.day)}</dd>
    </div>
    <div>
      <dt>Hora de inicio de clases</dt>
      <dd>${escapeHtml(record.classStart)}</dd>
    </div>
    <div>
      <dt>Hora de fin de clases</dt>
      <dd>${escapeHtml(record.classEnd)}</dd>
    </div>
    <div>
      <dt>Hora de ingreso laboral</dt>
      <dd>${escapeHtml(record.workEntry)}</dd>
    </div>
    <div>
      <dt>Hora de salida laboral</dt>
      <dd>${escapeHtml(record.workExit)}</dd>
    </div>
    <div>
      <dt>Horas que deben</dt>
      <dd>${escapeHtml(record.dueHours)}</dd>
    </div>
    <div>
      <dt>Fecha desde</dt>
      <dd>${escapeHtml(formatDate(record.fromDate))}</dd>
    </div>
    <div>
      <dt>Fecha hasta</dt>
      <dd>${escapeHtml(formatDate(record.toDate))}</dd>
    </div>
    <div>
      <dt>Estado</dt>
      <dd>
        <span class="status-badge ${status.className}">${status.label}</span>
        <span class="detail-highlight">${escapeHtml(fullDayText)}</span>
      </dd>
    </div>
    <div style="grid-column: 1 / -1;">
      <dt>Observación</dt>
      <dd>${escapeHtml(record.observation || "Sin observaciones registradas.")}</dd>
    </div>
  `;

  buildEvidencePreview(record);
  detailsDialog.showModal();
}

function updateStatus(newStatus) {
  const record = records.find(function (item) {
    return getRecordKey(item) === currentRecordKey;
  });

  if (!record) {
    return;
  }

  record.status = newStatus;
  persistRecords(records);
  renderRecords();
  const statusInfo = formatStatus(newStatus);
  showToast("Estado actualizado a " + statusInfo.label);
  openRecordDetails(getRecordKey(record));
}

searchInput.addEventListener("input", renderRecords);
departmentFilter.addEventListener("change", renderRecords);
dayFilter.addEventListener("change", renderRecords);
statusFilter.addEventListener("change", renderRecords);

recordsTableBody.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action='details']");
  if (!button) {
    return;
  }

  const recordKey = button.getAttribute("data-key");
  openRecordDetails(recordKey);
});

validateButton.addEventListener("click", function () {
  updateStatus("validated");
});

pendingReviewButton.addEventListener("click", function () {
  updateStatus("pending");
});

closeDetailsButton.addEventListener("click", function () {
  detailsDialog.close();
});

closeDetailsAction.addEventListener("click", function () {
  detailsDialog.close();
});

detailsDialog.addEventListener("cancel", function (event) {
  event.preventDefault();
  detailsDialog.close();
});

populateFilters();
renderRecords();
