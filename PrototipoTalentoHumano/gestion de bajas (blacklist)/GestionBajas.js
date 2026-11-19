import { obtenerColaboradores, obtenerNombreArea, obtenerNombreDepartamento } from '../shared/js/colaboradoresStorage.js';
"use strict";

const STORAGE_KEY = "talentoHumanoBajasDemo";
const STORAGE_VERSION_KEY = STORAGE_KEY + "Version";
const STORAGE_VERSION = "4";
const MOTIVES = [
  "ASISTENCIA",
  "COMPORTAMIENTO",
  "DESEMPEÑO"
];
const INFRACTIONS = [
  "AUSENCIA DINAMICAS",
  "FALTA INJUSTIFICADA",
  "TARDANZA",
  "DESCONEXIÓN SIN PERMISO (CRUCE DE HORARIO)",
  "INACTIVIDAD (TIEMPO HABLADO)",
  "ABANDONO DE TRABAJO",
  "DISCRIMINACIÓN",
  "ACOSO LABORAL (COMPROBADO)",
  "ACOSO SEXUAL (COMPROBADO)",
  "FALTA DE RESPETO (INSULTOS, GRITOS Y SIMILARES)",
  "DIVULGAR INFORMACIÓN CONFIDENCIAL QUE PUEDA PERJUDICAR A LA EMPRESA.",
  "ELABORACIÓN O MANEJO DE DOCUMENTOS IMPORTANTES DE LA EMPRESA DESDE UN CORREO PERSONAL",
  "USO INCORRECTO DE INFORMACIÓN DE LOS INTEGRANTES DE LA EMPRESA",
  "TRABAJAR BAJO INFLUENCIA DE ALCOHOL O DROGAS",
  "PERTURBAR EL AMBIENTE LABORAL",
  "ACUMULACIÓN DE FALTAS (3 MEMOS)",
  "DESOBEDECER INSTRUCCIONES EN EL TRABAJO.",
  "NO PRESENTAR LOS AVANCES ACORDADOS A TIEMPO",
  "POSPONER CONSTANTEMENTE LA MISMA ACTIVIDAD",
  "CUMPLIMIENTO DE LOS KPIS",
  "REALIZAR ACTIVIDADES EXTRALABORALES SIN PERMISO",
  "BAJO DESEMPEÑO (EVALUACIÓN DE LÍDERES)"
];
const LEVELS = ["GRAVE", "MUY GRAVE"];
const collaborators = {
  "1004": { name: "Rosmery Estefany Tenorio Nunja", area: "Marketing y Ventas" },
  "982": { name: "Alexis Javier Blas Mendoza", area: "DESARROLLO WEB" },
  "983": { name: "Yeremi Ponce", area: "Backend" },
  "1006": { name: "Alexander Raul Cisneros Jara", area: "Backend" },
  "1020": { name: "Renato Sebastian Rubber Zegarra Lopez", area: "Backend" },
  "963": { name: "Leonardo Gabriel Perez La Rosa", area: "Desarrollo Rápido de Aplicaciones" },
  "1040": { name: "Rodrigo Franceso Corilla Cornejo", area: "Backend" },
  "1013": { name: "Lenning Andree Zacarias Lopez", area: "Backend" },
  "1021": { name: "Jhoel Anderson Gavidia Calderon", area: "Backend" }
};


try {
  const systemColabs = obtenerColaboradores();
  if (Array.isArray(systemColabs)) {
    systemColabs.forEach(c => {
      const code = String(c.codigoColaborador || c.idColaborador);
      const fullName = [c.nombres, c.apellidoPaterno, c.apellidoMaterno].filter(Boolean).join(' ');
      const area = (typeof obtenerNombreArea === 'function' ? obtenerNombreArea(c.idArea) : null) || 
                   (typeof obtenerNombreDepartamento === 'function' ? obtenerNombreDepartamento(c.idDepartamento) : null) || 
                   'General';
      if (!collaborators[code]) {
        collaborators[code] = { name: fullName, area: area };
      }
    });
  }
} catch (e) {
  console.warn('Colaboradores de sistema cargados en modo local:', e);
}

const sampleRecords = [
  {
    key: "demo-1004",
    id: "1004",
    collaborator: collaborators["1004"].name,
    area: collaborators["1004"].area,
    reason: "ASISTENCIA",
    customReason: "",
    infringement: "ABANDONO DE TRABAJO",
    level: "GRAVE",
    documentName: "",
    observation: ""
  },
  {
    key: "demo-982",
    id: "982",
    collaborator: collaborators["982"].name,
    area: collaborators["982"].area,
    reason: "ASISTENCIA",
    customReason: "",
    infringement: "ABANDONO DE TRABAJO",
    level: "GRAVE",
    documentName: "",
    observation: ""
  },
  {
    key: "demo-983",
    id: "983",
    collaborator: collaborators["983"].name,
    area: collaborators["983"].area,
    reason: "ASISTENCIA",
    customReason: "",
    infringement: "ABANDONO DE TRABAJO",
    level: "GRAVE",
    documentName: "",
    observation: ""
  },
  {
    key: "demo-1006",
    id: "1006",
    collaborator: collaborators["1006"].name,
    area: collaborators["1006"].area,
    reason: "ASISTENCIA",
    customReason: "",
    infringement: "ABANDONO DE TRABAJO",
    level: "GRAVE",
    documentName: "",
    observation: ""
  },
  {
    key: "demo-1020",
    id: "1020",
    collaborator: collaborators["1020"].name,
    area: collaborators["1020"].area,
    reason: "ASISTENCIA",
    customReason: "",
    infringement: "ABANDONO DE TRABAJO",
    level: "GRAVE",
    documentName: "",
    observation: ""
  },
  {
    key: "demo-963",
    id: "963",
    collaborator: collaborators["963"].name,
    area: collaborators["963"].area,
    reason: "ASISTENCIA",
    customReason: "",
    infringement: "ABANDONO DE TRABAJO",
    level: "GRAVE",
    documentName: "",
    observation: ""
  },
  {
    key: "demo-1040",
    id: "1040",
    collaborator: collaborators["1040"].name,
    area: collaborators["1040"].area,
    reason: "ASISTENCIA",
    customReason: "",
    infringement: "ABANDONO DE TRABAJO",
    level: "GRAVE",
    documentName: "",
    observation: ""
  },
  {
    key: "demo-1013",
    id: "1013",
    collaborator: collaborators["1013"].name,
    area: collaborators["1013"].area,
    reason: "ASISTENCIA",
    customReason: "",
    infringement: "ABANDONO DE TRABAJO",
    level: "GRAVE",
    documentName: "",
    observation: ""
  },
  {
    key: "demo-1021",
    id: "1021",
    collaborator: collaborators["1021"].name,
    area: collaborators["1021"].area,
    reason: "ASISTENCIA",
    customReason: "",
    infringement: "ABANDONO DE TRABAJO",
    level: "GRAVE",
    documentName: "",
    observation: ""
  }
];

const formDialog = document.getElementById("recordDialog");
const detailsDialog = document.getElementById("detailsDialog");
const recordForm = document.getElementById("recordForm");
const tableBody = document.getElementById("recordsTableBody");
const searchInput = document.getElementById("searchInput");
const reasonFilter = document.getElementById("reasonFilter");
const collaboratorSearchInput = document.getElementById("collaboratorSearch");
const collaboratorSuggestions = document.getElementById("collaboratorSuggestions");
const collaboratorSearchMessage = document.getElementById("collaboratorSearchMessage");
const employeeIdInput = document.getElementById("employeeId");
const employeeNameInput = document.getElementById("employeeName");
const employeeAreaInput = document.getElementById("employeeArea");
const reasonSelect = document.getElementById("reason");
const signedDocumentInput = document.getElementById("signedDocument");
const currentDocument = document.getElementById("currentDocument");
const currentDocumentName = document.getElementById("currentDocumentName");
const infringementSelect = document.getElementById("infringement");
const observationInput = document.getElementById("observation");
const legacyRecordNotice = document.getElementById("legacyRecordNotice");
const toast = document.getElementById("toast");

let records = [];
let editingKey = null;
let selectedDetailsKey = null;
let selectedCollaboratorId = null;
let retainedDocumentName = "";
let toastTimeout = null;

function createKey() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return "record-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
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

function showMessage(message, isError) {
  window.clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.toggle("error-toast", Boolean(isError));
  toast.classList.add("visible");
  toastTimeout = window.setTimeout(function () {
    toast.classList.remove("visible");
  }, 3600);
}

function isValidRecord(record) {
  return record
    && typeof record.key === "string"
    && typeof record.id === "string"
    && typeof record.collaborator === "string"
    && typeof record.area === "string"
    && typeof record.reason === "string"
    && (record.customReason === undefined || typeof record.customReason === "string")
    && typeof record.infringement === "string"
    && typeof record.level === "string"
    && typeof record.documentName === "string";
}

function normalizeStoredRecord(record) {
  const normalizedRecord = Object.assign({}, record);
  normalizedRecord.customReason = normalizedRecord.customReason || "";
  normalizedRecord.legacyReason = normalizedRecord.legacyReason || "";
  normalizedRecord.legacyInfringement = normalizedRecord.legacyInfringement || "";
  normalizedRecord.legacyLevel = normalizedRecord.legacyLevel || "";
  normalizedRecord.observation = normalizedRecord.observation || "";

  if (normalizedRecord.reason && !MOTIVES.includes(normalizedRecord.reason)) {
    normalizedRecord.legacyReason = normalizedRecord.legacyReason || normalizedRecord.reason;
    normalizedRecord.reason = "";
  }
  if (normalizedRecord.infringement && !INFRACTIONS.includes(normalizedRecord.infringement)) {
    normalizedRecord.legacyInfringement = normalizedRecord.legacyInfringement || normalizedRecord.infringement;
    normalizedRecord.infringement = "";
  }
  if (normalizedRecord.level && !LEVELS.includes(normalizedRecord.level)) {
    normalizedRecord.legacyLevel = normalizedRecord.legacyLevel || normalizedRecord.level;
    normalizedRecord.level = "";
  }
  return normalizedRecord;
}

function persistRecords(nextRecords) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
    records = nextRecords;
    renderRecords();
    return true;
  } catch (error) {
    showMessage("No se pudieron guardar los cambios en este navegador. Revisa el espacio disponible o la configuración de almacenamiento.", true);
    return false;
  }
}

function loadRecords() {
  try {
    const storedRecords = window.localStorage.getItem(STORAGE_KEY);
    if (storedRecords === null) {
      const initialRecords = sampleRecords.map(function (record) {
        return Object.assign({}, record);
      });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRecords));
      window.localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
      records = initialRecords;
      return;
    }

    const parsedRecords = JSON.parse(storedRecords);
    if (!Array.isArray(parsedRecords) || !parsedRecords.every(isValidRecord)) {
      throw new Error("El formato de los registros guardados no es válido.");
    }

    records = parsedRecords.map(normalizeStoredRecord);
    const storedKeys = new Set(records.map(function (record) {
      return record.key;
    }));
    sampleRecords.forEach(function (sample) {
      if (!storedKeys.has(sample.key)) {
        records.push(Object.assign({}, sample));
      }
    });

    if (window.localStorage.getItem(STORAGE_VERSION_KEY) !== STORAGE_VERSION
      || JSON.stringify(records) !== JSON.stringify(parsedRecords)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      window.localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
    }
  } catch (error) {
    records = [];
    showMessage("No se pudieron leer o actualizar los registros guardados. Se muestra una lista vacía; los datos almacenados no se han borrado.", true);
  }
}

function renderReasonFilter() {
  const selectedValue = reasonFilter.value;
  reasonFilter.innerHTML = '<option value="">Todos los motivos</option>' + MOTIVES.map(function (reason) {
    return '<option value="' + escapeHtml(reason) + '">' + escapeHtml(reason) + "</option>";
  }).join("");

  if (MOTIVES.indexOf(selectedValue) !== -1) {
    reasonFilter.value = selectedValue;
  }
}

function renderRecords() {
  renderReasonFilter();

  const query = searchInput.value.trim().toLocaleLowerCase("es");
  const selectedReason = reasonFilter.value;
  const filteredRecords = records.filter(function (record) {
    const matchesQuery = !query
      || record.id.toLocaleLowerCase("es").includes(query)
      || record.collaborator.toLocaleLowerCase("es").includes(query);
    const matchesReason = !selectedReason || record.reason === selectedReason;
    return matchesQuery && matchesReason;
  });

  document.getElementById("recordsCount").textContent =
    filteredRecords.length + (filteredRecords.length === 1 ? " registro" : " registros");

  if (filteredRecords.length === 0) {
    const hasFilters = Boolean(query || selectedReason);
    tableBody.innerHTML = '<tr><td class="empty-row" colspan="8">' +
      (hasFilters ? "No hay registros que coincidan con la búsqueda." : "Aún no hay registros. Puedes registrar una nueva baja.") +
      "</td></tr>";
    return;
  }

  tableBody.innerHTML = filteredRecords.map(function (record) {
    return "<tr>"
      + '<td class="id-cell">' + escapeHtml(record.id) + "</td>"
      + '<td class="employee-cell">' + escapeHtml(record.collaborator) + "</td>"
      + "<td>" + escapeHtml(record.area) + "</td>"
      + '<td><span class="reason-badge">' + escapeHtml(record.reason || record.legacyReason || "—") + "</span></td>"
      + "<td>" + escapeHtml(record.infringement || record.legacyInfringement || "—") + "</td>"
      + '<td>' + (record.level || record.legacyLevel
        ? '<span class="level-badge">' + escapeHtml(record.level || record.legacyLevel) + "</span>"
        : "—") + "</td>"
      + "<td>" + (record.documentName
        ? '<span class="document-name" title="' + escapeHtml(record.documentName) + '">' + escapeHtml(record.documentName) + "</span>"
        : '<span class="empty-document">—</span>') + "</td>"
      + '<td><div class="row-actions">'
      + '<button class="action-button" type="button" data-action="view" data-key="' + escapeHtml(record.key) + '">Consultar</button>'
      + "</div></td>"
      + "</tr>";
  }).join("");
}

function setCollaboratorSearchMessage(message, status) {
  collaboratorSearchMessage.textContent = message;
  collaboratorSearchMessage.classList.remove("success", "error");
  if (status) {
    collaboratorSearchMessage.classList.add(status);
  }
}

function setSuggestionsVisible(visible) {
  collaboratorSuggestions.hidden = !visible;
  collaboratorSearchInput.setAttribute("aria-expanded", visible ? "true" : "false");
}

function searchCollaborators(query) {
  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  if (!normalizedQuery) {
    collaboratorSuggestions.innerHTML = "";
    setSuggestionsVisible(false);
    setCollaboratorSearchMessage("", "");
    return;
  }

  const matches = Object.keys(collaborators).filter(function (id) {
    return collaborators[id].name.toLocaleLowerCase("es").includes(normalizedQuery);
  });

  if (matches.length === 0) {
    collaboratorSuggestions.innerHTML = "";
    setSuggestionsVisible(false);
    setCollaboratorSearchMessage("No se encontraron colaboradores con ese nombre.", "error");
    return;
  }

  collaboratorSuggestions.innerHTML = matches.map(function (id) {
    const collaborator = collaborators[id];
    return '<button class="suggestion-option" type="button" role="option" aria-selected="false" data-collaborator-id="'
      + escapeHtml(id) + '"><span>' + escapeHtml(collaborator.name) + '</span><small>ID ' + escapeHtml(id)
      + " · " + escapeHtml(collaborator.area) + "</small></button>";
  }).join("");
  setSuggestionsVisible(true);
  setCollaboratorSearchMessage("Selecciona un colaborador para completar automáticamente el ID y el área.", "");
}

function selectCollaborator(id) {
  const collaborator = Object.prototype.hasOwnProperty.call(collaborators, id)
    ? collaborators[id]
    : null;
  const numericId = Number(id);
  if (!collaborator || !/^\d+$/.test(id) || !Number.isInteger(numericId) || numericId < 0 || numericId > 2000) {
    selectedCollaboratorId = null;
    setCollaboratorSearchMessage("Selecciona un colaborador válido de la lista.", "error");
    return false;
  }

  selectedCollaboratorId = id;
  collaboratorSearchInput.value = collaborator.name;
  employeeNameInput.value = collaborator.name;
  employeeIdInput.value = id;
  employeeAreaInput.value = collaborator.area;
  setSuggestionsVisible(false);
  setCollaboratorSearchMessage("Colaborador seleccionado. ID y área completados automáticamente.", "success");
  return true;
}

function updateCurrentDocumentDisplay() {
  const name = signedDocumentInput.files.length
    ? signedDocumentInput.files[0].name
    : retainedDocumentName;
  currentDocument.hidden = !name;
  currentDocumentName.textContent = name;
}

function resetForm() {
  recordForm.reset();
  editingKey = null;
  selectedCollaboratorId = null;
  retainedDocumentName = "";
  document.getElementById("formDialogTitle").textContent = "Registrar nueva baja";
  reasonSelect.value = "";
  collaboratorSuggestions.innerHTML = "";
  setSuggestionsVisible(false);
  currentDocument.hidden = true;
  legacyRecordNotice.hidden = true;
  legacyRecordNotice.textContent = "";
  setCollaboratorSearchMessage("", "");
}

function openCreateDialog() {
  resetForm();
  formDialog.showModal();
  collaboratorSearchInput.focus();
}

function openEditDialog(key) {
  const record = records.find(function (item) {
    return item.key === key;
  });
  if (!record) {
    showMessage("No se encontró el registro que deseas editar.", true);
    return;
  }

  resetForm();
  editingKey = record.key;
  retainedDocumentName = record.documentName;
  document.getElementById("formDialogTitle").textContent = "Editar registro";
  if (!selectCollaborator(record.id)) {
    collaboratorSearchInput.value = record.collaborator;
    employeeNameInput.value = record.collaborator;
    employeeIdInput.value = record.id;
    employeeAreaInput.value = record.area;
    selectedCollaboratorId = record.id;
  }

  if (MOTIVES.includes(record.reason)) {
    reasonSelect.value = record.reason;
  }
  infringementSelect.value = INFRACTIONS.includes(record.infringement) ? record.infringement : "";
  document.getElementById("level").value = LEVELS.includes(record.level) ? record.level : "";
  observationInput.value = record.observation || "";
  const legacyValues = [
    record.legacyReason && "Motivo anterior: " + record.legacyReason,
    record.legacyInfringement && "Infracción anterior: " + record.legacyInfringement,
    record.legacyLevel && "Nivel anterior: " + record.legacyLevel,
    record.customReason && "Detalle de motivo anterior: " + record.customReason
  ].filter(Boolean);
  legacyRecordNotice.textContent = legacyValues.length
    ? "Este registro conserva valores de catálogos anteriores. Si seleccionas nuevas opciones, los valores originales se mantendrán como referencia: " + legacyValues.join(" · ")
    : "";
  legacyRecordNotice.hidden = !legacyValues.length;
  signedDocumentInput.value = "";
  updateCurrentDocumentDisplay();
  formDialog.showModal();
  collaboratorSearchInput.focus();
}

function openDetailsDialog(key) {
  const record = records.find(function (item) {
    return item.key === key;
  });
  if (!record) {
    showMessage("No se encontró el registro solicitado.", true);
    return;
  }

  selectedDetailsKey = key;
  const fields = [
    ["ID", record.id],
    ["Colaborador", record.collaborator],
    ["Área", record.area],
    ["Motivo", record.reason || "—"],
    ["Infracción", record.infringement || "—"],
    ["Nivel", record.level || "—"],
    ["Documento firmado", record.documentName || "—"],
    ["Observación", record.observation || "—"]
  ];
  if (record.legacyReason) {
    fields.push(["Motivo anterior", record.legacyReason]);
  }
  if (record.customReason) {
    fields.push(["Detalle de motivo anterior", record.customReason]);
  }
  if (record.legacyInfringement) {
    fields.push(["Infracción anterior", record.legacyInfringement]);
  }
  if (record.legacyLevel) {
    fields.push(["Nivel anterior", record.legacyLevel]);
  }

  document.getElementById("recordDetails").innerHTML = fields.map(function (field) {
    return '<div class="detail-item"><dt>' + escapeHtml(field[0]) + "</dt><dd>"
      + escapeHtml(field[1] || "—") + "</dd></div>";
  }).join("");
  detailsDialog.showModal();
}

function closeDetailsDialog() {
  detailsDialog.close();
  selectedDetailsKey = null;
}

document.getElementById("newRecordButton").addEventListener("click", openCreateDialog);
document.getElementById("closeFormButton").addEventListener("click", function () {
  formDialog.close();
});
document.getElementById("cancelFormButton").addEventListener("click", function () {
  formDialog.close();
});
document.getElementById("closeDetailsButton").addEventListener("click", closeDetailsDialog);
document.getElementById("closeDetailsAction").addEventListener("click", closeDetailsDialog);
document.getElementById("editFromDetailsButton").addEventListener("click", function () {
  const key = selectedDetailsKey;
  closeDetailsDialog();
  if (key) {
    openEditDialog(key);
  }
});

collaboratorSearchInput.addEventListener("input", function () {
  selectedCollaboratorId = null;
  employeeNameInput.value = "";
  employeeIdInput.value = "";
  employeeAreaInput.value = "";
  searchCollaborators(collaboratorSearchInput.value);
});
collaboratorSearchInput.addEventListener("keydown", function (event) {
  if (event.key === "ArrowDown" && !collaboratorSuggestions.hidden) {
    const firstSuggestion = collaboratorSuggestions.querySelector(".suggestion-option");
    if (firstSuggestion) {
      event.preventDefault();
      firstSuggestion.focus();
    }
  } else if (event.key === "Enter" && !collaboratorSuggestions.hidden) {
    const firstSuggestion = collaboratorSuggestions.querySelector(".suggestion-option");
    if (firstSuggestion) {
      event.preventDefault();
      selectCollaborator(firstSuggestion.dataset.collaboratorId);
    }
  } else if (event.key === "Escape") {
    setSuggestionsVisible(false);
  }
});
collaboratorSuggestions.addEventListener("click", function (event) {
  const option = event.target.closest("button[data-collaborator-id]");
  if (option && selectCollaborator(option.dataset.collaboratorId)) {
    collaboratorSearchInput.focus();
  }
});
signedDocumentInput.addEventListener("change", updateCurrentDocumentDisplay);
document.getElementById("removeDocumentButton").addEventListener("click", function () {
  retainedDocumentName = "";
  signedDocumentInput.value = "";
  updateCurrentDocumentDisplay();
});
searchInput.addEventListener("input", renderRecords);
reasonFilter.addEventListener("change", renderRecords);

tableBody.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const key = button.dataset.key;
  if (action === "view") {
    openDetailsDialog(key);
  } else if (action === "edit") {
    openEditDialog(key);
  }
});

recordForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const existingRecord = editingKey
    ? records.find(function (record) { return record.key === editingKey; })
    : null;
  const collaborator = selectedCollaboratorId
    ? collaborators[selectedCollaboratorId] || (existingRecord
      ? { name: existingRecord.collaborator, area: existingRecord.area }
      : null)
    : null;
  if (!collaborator) {
    setCollaboratorSearchMessage("Busca y selecciona un colaborador antes de guardar.", "error");
    collaboratorSearchInput.focus();
    return;
  }

  const selectedFile = signedDocumentInput.files.length
    ? signedDocumentInput.files[0].name
    : retainedDocumentName;
  const record = {
    key: editingKey || createKey(),
    id: selectedCollaboratorId,
    collaborator: collaborator.name,
    area: collaborator.area,
    reason: reasonSelect.value,
    customReason: existingRecord ? existingRecord.customReason || "" : "",
    legacyReason: existingRecord ? existingRecord.legacyReason || "" : "",
    infringement: infringementSelect.value,
    legacyInfringement: existingRecord ? existingRecord.legacyInfringement || "" : "",
    level: document.getElementById("level").value,
    legacyLevel: existingRecord ? existingRecord.legacyLevel || "" : "",
    documentName: selectedFile || "",
    observation: observationInput.value.trim()
  };
  const nextRecords = existingRecord
    ? records.map(function (item) { return item.key === editingKey ? record : item; })
    : records.concat(record);

  if (persistRecords(nextRecords)) {
    formDialog.close();
    showMessage(existingRecord ? "Registro actualizado." : "Registro guardado.");
  }
});

formDialog.addEventListener("close", resetForm);
detailsDialog.addEventListener("close", function () {
  selectedDetailsKey = null;
});

loadRecords();
renderRecords();