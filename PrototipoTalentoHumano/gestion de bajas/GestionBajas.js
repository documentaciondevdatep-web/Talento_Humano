import { obtenerColaboradores, obtenerNombreArea, obtenerNombreDepartamento } from '../shared/js/colaboradoresStorage.js';

const STORAGE_KEY = "talentoHumanoBajasDemo";
const STORAGE_VERSION_KEY = STORAGE_KEY + "Version";
const STORAGE_VERSION = "9";

// Áreas oficiales según la estructura organizacional (Organigrama / catalogos.js)
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

const BAJA_MOTIVES = [
  "CULMINACIÓN DE PRÁCTICAS",
  "RENUNCIA VOLUNTARIA",
  "FIN DE CONVENIO",
  "MUTUO ACUERDO",
  "MOTIVOS ACADÉMICOS",
  "MOTIVOS DE SALUD / PERSONALES"
];

const BLACKLIST_MOTIVES = [
  "ASISTENCIA",
  "COMPORTAMIENTO",
  "DESEMPEÑO"
];

// Infracciones organizadas estrictamente por categoría
const INFRACCIONES_POR_MOTIVO = {
  "ASISTENCIA": [
    "AUSENCIA DINÁMICAS",
    "FALTA INJUSTIFICADA",
    "TARDANZA",
    "DESCONEXIÓN SIN PERMISO (CRUCE DE HORARIO)",
    "ABANDONO DE TRABAJO",
    "ACUMULACIÓN DE FALTAS (3 MEMOS)"
  ],
  "COMPORTAMIENTO": [
    "DISCRIMINACIÓN",
    "ACOSO LABORAL (COMPROBADO)",
    "ACOSO SEXUAL (COMPROBADO)",
    "FALTA DE RESPETO (INSULTOS, GRITOS Y SIMILARES)",
    "DIVULGAR INFORMACIÓN CONFIDENCIAL QUE PUEDA PERJUDICAR A LA EMPRESA.",
    "ELABORACIÓN O MANEJO DE DOCUMENTOS IMPORTANTES DE LA EMPRESA DESDE UN CORREO PERSONAL",
    "USO INCORRECTO DE INFORMACIÓN DE LOS INTEGRANTES DE LA EMPRESA",
    "TRABAJAR BAJO INFLUENCIA DE ALCOHOL O DROGAS",
    "PERTURBAR EL AMBIENTE LABORAL",
    "DESOBEDECER INSTRUCCIONES EN EL TRABAJO.",
    "REALIZAR ACTIVIDADES EXTRALABORALES SIN PERMISO"
  ],
  "DESEMPEÑO": [
    "INACTIVIDAD (TIEMPO HABLADO)",
    "NO PRESENTAR LOS AVANCES ACORDADOS A TIEMPO",
    "POSPONER CONSTANTEMENTE LA MISMA ACTIVIDAD",
    "CUMPLIMIENTO DE LOS KPIS",
    "BAJO DESEMPEÑO (EVALUACIÓN DE LÍDERES)"
  ]
};

const INFRACTIONS = [
  ...INFRACCIONES_POR_MOTIVO["ASISTENCIA"],
  ...INFRACCIONES_POR_MOTIVO["COMPORTAMIENTO"],
  ...INFRACCIONES_POR_MOTIVO["DESEMPEÑO"],
  "AUSENCIA DINAMICAS"
];

const LEVELS = ["GRAVE", "MUY GRAVE"];

// Colaboradores de demostración asignados a áreas oficiales
const collaborators = {
  "1004": { name: "Rosmery Estefany Tenorio Nunja", area: "Marketing y Ventas" },
  "982": { name: "Alexis Javier Blas Mendoza", area: "Frontend" },
  "983": { name: "Yeremi Ponce", area: "Backend" },
  "1006": { name: "Alexander Raul Cisneros Jara", area: "Backend" },
  "1020": { name: "Renato Sebastian Rubber Zegarra Lopez", area: "Documentación" },
  "963": { name: "Leonardo Gabriel Perez La Rosa", area: "Desarrollo Rápido de Aplicaciones" },
  "1040": { name: "Rodrigo Franceso Corilla Cornejo", area: "Backend" },
  "1013": { name: "Lenning Andree Zacarias Lopez", area: "Base de Datos" },
  "1021": { name: "Jhoel Anderson Gavidia Calderon", area: "Backend" },
  "1015": { name: "Camila Fernanda Huamán Ríos", area: "Diseño Web" },
  "1028": { name: "Juan Carlos Quispe Silva", area: "Base de Datos" },
  "1035": { name: "Valeria Sofía Morales Castro", area: "Marketing y Ventas" },
  "1042": { name: "Christian Daniel Vega Reyes", area: "Backend" },
  "1050": { name: "Andrea Nicole Mendoza Peña", area: "Reclutamiento" },
  "1051": { name: "Carlos Eduardo Salazar Torres", area: "Capacitación" },
  "1052": { name: "Mariana Lucía Ramos Pinedo", area: "Clima y Cultura" },
  "1055": { name: "Gabriel Alonso Flores Gómez", area: "Diseño Gráfico" },
  "1060": { name: "Valeria Denisse Alarcón Vega", area: "Talento Humano" },
  "1061": { name: "Mateo Sebastián Guerrero Silva", area: "Desarrollo Web" },
  "1062": { name: "Fiorella Patricia Rivas Medina", area: "Comercial" }
};

// Carga opcional de colaboradores del sistema compartido
try {
  const systemColabs = obtenerColaboradores();
  if (Array.isArray(systemColabs)) {
    systemColabs.forEach(function (c) {
      const code = String(c.codigoColaborador || c.idColaborador);
      const fullName = [c.nombres, c.apellidoPaterno, c.apellidoMaterno].filter(Boolean).join(" ");
      const area = (typeof obtenerNombreArea === "function" ? obtenerNombreArea(c.idArea) : null) ||
                   (typeof obtenerNombreDepartamento === "function" ? obtenerNombreDepartamento(c.idDepartamento) : null) ||
                   "General";
      if (!collaborators[code]) {
        collaborators[code] = { name: fullName, area: area };
      }
    });
  }
} catch (e) {
  console.warn("Colaboradores de sistema cargados en modo local:", e);
}

// Registros de demostración para Bajas (practicantes que culminan o se retiran)
const sampleBajasRecords = [
  {
    key: "demo-baja-1015",
    category: "baja",
    id: "1015",
    collaborator: collaborators["1015"].name,
    area: collaborators["1015"].area,
    bajaReason: "CULMINACIÓN DE PRÁCTICAS",
    exitDate: "2026-11-15",
    documentName: "Constancia_Practicas_1015.pdf",
    observation: "Culminó exitosamente las 480 horas reglamentarias del convenio de prácticas en Diseño Web."
  },
  {
    key: "demo-baja-1028",
    category: "baja",
    id: "1028",
    collaborator: collaborators["1028"].name,
    area: collaborators["1028"].area,
    bajaReason: "CULMINACIÓN DE PRÁCTICAS",
    exitDate: "2026-11-10",
    documentName: "Acta_Entrega_1028.pdf",
    observation: "Periodo cumplido a satisfacción en Base de Datos. Evaluaciones aprobadas con felicitación."
  },
  {
    key: "demo-baja-1035",
    category: "baja",
    id: "1035",
    collaborator: collaborators["1035"].name,
    area: collaborators["1035"].area,
    bajaReason: "RENUNCIA VOLUNTARIA",
    exitDate: "2026-11-02",
    documentName: "Carta_Renuncia_1035.pdf",
    observation: "Retiro voluntario formalizado en Marketing y Ventas por cruce de horarios universitarios."
  },
  {
    key: "demo-baja-1042",
    category: "baja",
    id: "1042",
    collaborator: collaborators["1042"].name,
    area: collaborators["1042"].area,
    bajaReason: "FIN DE CONVENIO",
    exitDate: "2026-10-28",
    documentName: "Informe_Final_1042.pdf",
    observation: "Culminación de plazo pactado en el convenio formativo en Backend."
  },
  {
    key: "demo-baja-1050",
    category: "baja",
    id: "1050",
    collaborator: collaborators["1050"].name,
    area: collaborators["1050"].area,
    bajaReason: "CULMINACIÓN DE PRÁCTICAS",
    exitDate: "2026-10-20",
    documentName: "Constancia_Practicas_1050.pdf",
    observation: "Periodo de prácticas preprofesionales en Reclutamiento completado con entrega de cargo."
  },
  {
    key: "demo-baja-1051",
    category: "baja",
    id: "1051",
    collaborator: collaborators["1051"].name,
    area: collaborators["1051"].area,
    bajaReason: "CULMINACIÓN DE PRÁCTICAS",
    exitDate: "2026-10-15",
    documentName: "Constancia_Practicas_1051.pdf",
    observation: "Prácticas culminadas en el área de Capacitación con evaluaciones sobresalientes."
  },
  {
    key: "demo-baja-1052",
    category: "baja",
    id: "1052",
    collaborator: collaborators["1052"].name,
    area: collaborators["1052"].area,
    bajaReason: "FIN DE CONVENIO",
    exitDate: "2026-10-05",
    documentName: "Acta_Fin_Convenio_1052.pdf",
    observation: "Finalización de convenio formativo en Clima y Cultura por término de plazo pactado."
  },
  {
    key: "demo-baja-1060",
    category: "baja",
    id: "1060",
    collaborator: collaborators["1060"].name,
    area: collaborators["1060"].area,
    bajaReason: "CULMINACIÓN DE PRÁCTICAS",
    exitDate: "2026-11-18",
    documentName: "Constancia_Practicas_1060.pdf",
    observation: "Culminación de prácticas preprofesionales en el área de Talento Humano."
  },
  {
    key: "demo-baja-1062",
    category: "baja",
    id: "1062",
    collaborator: collaborators["1062"].name,
    area: collaborators["1062"].area,
    bajaReason: "FIN DE CONVENIO",
    exitDate: "2026-11-12",
    documentName: "Acta_Fin_Convenio_1062.pdf",
    observation: "Término formal del convenio de prácticas en el área Comercial."
  }
];

// Registros de demostración para Blacklist (infracciones o lista negra)
const sampleBlacklistRecords = [
  {
    key: "demo-1004",
    category: "blacklist",
    id: "1004",
    collaborator: collaborators["1004"].name,
    area: collaborators["1004"].area,
    reason: "ASISTENCIA",
    customReason: "",
    infringement: "ABANDONO DE TRABAJO",
    level: "GRAVE",
    date: "2026-11-16",
    documentName: "",
    observation: "Abandono injustificado de funciones en Marketing y Ventas."
  },
  {
    key: "demo-982",
    category: "blacklist",
    id: "982",
    collaborator: collaborators["982"].name,
    area: collaborators["982"].area,
    reason: "ASISTENCIA",
    customReason: "",
    infringement: "ABANDONO DE TRABAJO",
    level: "GRAVE",
    date: "2026-11-14",
    documentName: "",
    observation: "Inasistencia consecutiva sin justificación en Frontend."
  },
  {
    key: "demo-983",
    category: "blacklist",
    id: "983",
    collaborator: collaborators["983"].name,
    area: collaborators["983"].area,
    reason: "COMPORTAMIENTO",
    customReason: "",
    infringement: "FALTA DE RESPETO (INSULTOS, GRITOS Y SIMILARES)",
    level: "GRAVE",
    date: "2026-11-09",
    documentName: "",
    observation: "Incidente reiterado de comunicación indebida en el equipo de Backend."
  },
  {
    key: "demo-1006",
    category: "blacklist",
    id: "1006",
    collaborator: collaborators["1006"].name,
    area: collaborators["1006"].area,
    reason: "DESEMPEÑO",
    customReason: "",
    infringement: "NO PRESENTAR LOS AVANCES ACORDADOS A TIEMPO",
    level: "GRAVE",
    date: "2026-10-30",
    documentName: "",
    observation: "Incumplimiento reiterado en las entregas de Backend."
  },
  {
    key: "demo-1020",
    category: "blacklist",
    id: "1020",
    collaborator: collaborators["1020"].name,
    area: collaborators["1020"].area,
    reason: "ASISTENCIA",
    customReason: "",
    infringement: "FALTA INJUSTIFICADA",
    level: "GRAVE",
    date: "2026-10-25",
    documentName: "",
    observation: "Ausencias reiteradas sin aviso en el área de Documentación."
  },
  {
    key: "demo-963",
    category: "blacklist",
    id: "963",
    collaborator: collaborators["963"].name,
    area: collaborators["963"].area,
    reason: "ASISTENCIA",
    customReason: "",
    infringement: "DESCONEXIÓN SIN PERMISO (CRUCE DE HORARIO)",
    level: "GRAVE",
    date: "2026-10-18",
    documentName: "",
    observation: "Desconexiones sin permiso en Desarrollo Rápido de Aplicaciones."
  },
  {
    key: "demo-1055",
    category: "blacklist",
    id: "1055",
    collaborator: collaborators["1055"].name,
    area: collaborators["1055"].area,
    reason: "COMPORTAMIENTO",
    customReason: "",
    infringement: "PERTURBAR EL AMBIENTE LABORAL",
    level: "MUY GRAVE",
    date: "2026-10-10",
    documentName: "",
    observation: "Falta muy grave por generar discordia en Diseño Gráfico."
  },
  {
    key: "demo-1061",
    category: "blacklist",
    id: "1061",
    collaborator: collaborators["1061"].name,
    area: collaborators["1061"].area,
    reason: "DESEMPEÑO",
    customReason: "",
    infringement: "NO PRESENTAR LOS AVANCES ACORDADOS A TIEMPO",
    level: "GRAVE",
    date: "2026-11-19",
    documentName: "",
    observation: "Incumplimiento reiterado en las entregas del sprint en Desarrollo Web."
  }
];

const sampleRecords = sampleBajasRecords.concat(sampleBlacklistRecords);

// Elementos de la interfaz
const tabButtonBajas = document.getElementById("tabButtonBajas");
const tabButtonBlacklist = document.getElementById("tabButtonBlacklist");
const viewBajas = document.getElementById("viewBajas");
const viewBlacklist = document.getElementById("viewBlacklist");
const badgeBajas = document.getElementById("badgeBajas");
const badgeBlacklist = document.getElementById("badgeBlacklist");
const newRecordButton = document.getElementById("newRecordButton");
const newRecordButtonText = document.getElementById("newRecordButtonText");

// Tabla Bajas
const searchInputBajas = document.getElementById("searchInputBajas");
const areaFilterBajas = document.getElementById("areaFilterBajas");
const reasonFilterBajas = document.getElementById("reasonFilterBajas");
const dateOrderFilterBajas = document.getElementById("dateOrderFilterBajas");
const recordsCountBajas = document.getElementById("recordsCountBajas");
const recordsTableBodyBajas = document.getElementById("recordsTableBodyBajas");

// Tabla Blacklist
const searchInputBlacklist = document.getElementById("searchInputBlacklist");
const areaFilterBlacklist = document.getElementById("areaFilterBlacklist");
const reasonFilterBlacklist = document.getElementById("reasonFilterBlacklist");
const dateOrderFilterBlacklist = document.getElementById("dateOrderFilterBlacklist");
const recordsCountBlacklist = document.getElementById("recordsCountBlacklist");
const recordsTableBodyBlacklist = document.getElementById("recordsTableBodyBlacklist");

// Formulario Modal
const formDialog = document.getElementById("recordDialog");
const detailsDialog = document.getElementById("detailsDialog");
const recordForm = document.getElementById("recordForm");
const recordCategorySelect = document.getElementById("recordCategory");
const formDialogTitle = document.getElementById("formDialogTitle");
const collaboratorSearchInput = document.getElementById("collaboratorSearch");
const collaboratorSuggestions = document.getElementById("collaboratorSuggestions");
const collaboratorSearchMessage = document.getElementById("collaboratorSearchMessage");
const employeeIdInput = document.getElementById("employeeId");
const employeeNameInput = document.getElementById("employeeName");
const employeeAreaInput = document.getElementById("employeeArea");

// Campos específicos de Baja
const bajaFieldsGroup = document.getElementById("bajaFieldsGroup");
const bajaReasonSelect = document.getElementById("bajaReason");
const exitDateInput = document.getElementById("exitDate");

// Campos específicos de Blacklist
const blacklistFieldsGroup = document.getElementById("blacklistFieldsGroup");
const reasonSelect = document.getElementById("reason");
const infringementSelect = document.getElementById("infringement");
const levelSelect = document.getElementById("level");
const blacklistDateInput = document.getElementById("blacklistDate");

// Campos comunes
const signedDocumentInput = document.getElementById("signedDocument");
const currentDocument = document.getElementById("currentDocument");
const currentDocumentName = document.getElementById("currentDocumentName");
const observationInput = document.getElementById("observation");
const legacyRecordNotice = document.getElementById("legacyRecordNotice");
const toast = document.getElementById("toast");

// Estado de la aplicación
let records = [];
let currentTab = "bajas";
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

function formatDateDisplay(dateStr) {
  if (!dateStr) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const parts = dateStr.split("-");
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }
  return dateStr;
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
    && typeof record.area === "string";
}

function normalizeStoredRecord(record) {
  const normalized = Object.assign({}, record);
  normalized.category = normalized.category || (normalized.infringement || normalized.level ? "blacklist" : "baja");
  normalized.observation = normalized.observation || "";
  normalized.documentName = normalized.documentName || "";

  if (normalized.category === "baja") {
    normalized.bajaReason = normalized.bajaReason || normalized.reason || "CULMINACIÓN DE PRÁCTICAS";
    normalized.exitDate = normalized.exitDate || "";
  } else {
    normalized.customReason = normalized.customReason || "";
    normalized.legacyReason = normalized.legacyReason || "";
    normalized.legacyInfringement = normalized.legacyInfringement || "";
    normalized.legacyLevel = normalized.legacyLevel || "";

    if (normalized.reason && !BLACKLIST_MOTIVES.includes(normalized.reason)) {
      normalized.legacyReason = normalized.legacyReason || normalized.reason;
      normalized.reason = "";
    }
    if (normalized.infringement && !INFRACTIONS.includes(normalized.infringement)) {
      normalized.legacyInfringement = normalized.legacyInfringement || normalized.infringement;
      normalized.infringement = "";
    }
    if (normalized.level && !LEVELS.includes(normalized.level)) {
      normalized.legacyLevel = normalized.legacyLevel || normalized.level;
      normalized.level = "";
    }
    normalized.date = normalized.date || "2026-11-01";
  }

  return normalized;
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

    // Asegura que las muestras de ambas categorías estén presentes si no existen
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
    records = sampleRecords.map(function (record) {
      return Object.assign({}, record);
    });
    showMessage("Se cargaron los registros de demostración predeterminados.", false);
  }
}

// Gestión de Pestañas
function setActiveTab(tab) {
  currentTab = tab;
  const isBajas = tab === "bajas";

  tabButtonBajas.classList.toggle("active", isBajas);
  tabButtonBajas.setAttribute("aria-selected", isBajas ? "true" : "false");
  viewBajas.hidden = !isBajas;

  tabButtonBlacklist.classList.toggle("active", !isBajas);
  tabButtonBlacklist.setAttribute("aria-selected", !isBajas ? "true" : "false");
  viewBlacklist.hidden = isBajas;

  newRecordButtonText.textContent = isBajas ? "Registrar nueva baja" : "Registrar en Blacklist";
  updateFormCategoryUI(isBajas ? "baja" : "blacklist");
}

tabButtonBajas.addEventListener("click", function () {
  setActiveTab("bajas");
});

tabButtonBlacklist.addEventListener("click", function () {
  setActiveTab("blacklist");
});

// Renderizado de Filtros de Selección
function renderFiltersOptions() {
  // Filtros de Área (Bajas y Blacklist)
  if (areaFilterBajas) {
    const currentAreaBajas = areaFilterBajas.value;
    areaFilterBajas.innerHTML = '<option value="">Todas las áreas</option>' +
      OFFICIAL_AREAS.map(function (a) {
        return '<option value="' + escapeHtml(a) + '">' + escapeHtml(a) + "</option>";
      }).join("");
    if (OFFICIAL_AREAS.includes(currentAreaBajas)) {
      areaFilterBajas.value = currentAreaBajas;
    }
  }

  if (areaFilterBlacklist) {
    const currentAreaBlacklist = areaFilterBlacklist.value;
    areaFilterBlacklist.innerHTML = '<option value="">Todas las áreas</option>' +
      OFFICIAL_AREAS.map(function (a) {
        return '<option value="' + escapeHtml(a) + '">' + escapeHtml(a) + "</option>";
      }).join("");
    if (OFFICIAL_AREAS.includes(currentAreaBlacklist)) {
      areaFilterBlacklist.value = currentAreaBlacklist;
    }
  }

  // Filtro de Bajas
  const currentBajaValue = reasonFilterBajas.value;
  reasonFilterBajas.innerHTML = '<option value="">Todos los motivos de baja</option>' +
    BAJA_MOTIVES.map(function (m) {
      return '<option value="' + escapeHtml(m) + '">' + escapeHtml(m) + "</option>";
    }).join("");
  if (BAJA_MOTIVES.includes(currentBajaValue)) {
    reasonFilterBajas.value = currentBajaValue;
  }

  // Filtro de Blacklist
  const currentBlacklistValue = reasonFilterBlacklist.value;
  reasonFilterBlacklist.innerHTML = '<option value="">Todos los motivos</option>' +
    BLACKLIST_MOTIVES.map(function (m) {
      return '<option value="' + escapeHtml(m) + '">' + escapeHtml(m) + "</option>";
    }).join("");
  if (BLACKLIST_MOTIVES.includes(currentBlacklistValue)) {
    reasonFilterBlacklist.value = currentBlacklistValue;
  }
}

// Renderizado de Tabla: Bajas
function renderBajasTable() {
  const allBajas = records.filter(function (r) {
    return r.category === "baja";
  });
  badgeBajas.textContent = String(allBajas.length);

  const query = searchInputBajas.value.trim().toLocaleLowerCase("es");
  const selectedReason = reasonFilterBajas.value;
  const selectedArea = areaFilterBajas ? areaFilterBajas.value : "";
  const dateOrder = dateOrderFilterBajas ? dateOrderFilterBajas.value : "recent";

  const filtered = allBajas.filter(function (record) {
    const matchesQuery = !query
      || record.id.toLocaleLowerCase("es").includes(query)
      || record.collaborator.toLocaleLowerCase("es").includes(query)
      || (record.area && record.area.toLocaleLowerCase("es").includes(query));
    const matchesReason = !selectedReason || record.bajaReason === selectedReason;
    const matchesArea = !selectedArea || record.area === selectedArea;
    return matchesQuery && matchesReason && matchesArea;
  });

  // Ordenar por fecha más reciente o más antigua
  filtered.sort(function (a, b) {
    const dateA = a.exitDate || "";
    const dateB = b.exitDate || "";
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateOrder === "oldest" ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
  });

  recordsCountBajas.textContent = filtered.length + (filtered.length === 1 ? " registro" : " registros");

  if (filtered.length === 0) {
    const hasFilters = Boolean(query || selectedReason || selectedArea);
    recordsTableBodyBajas.innerHTML = '<tr><td class="empty-row" colspan="7">' +
      (hasFilters ? "No hay registros de bajas que coincidan con los filtros aplicados." : "Aún no hay practicantes registrados con baja. Haz clic en 'Registrar nueva baja' para agregar uno.") +
      "</td></tr>";
    return;
  }

  recordsTableBodyBajas.innerHTML = filtered.map(function (record) {
    let badgeClass = "baja-badge";
    if (record.bajaReason === "RENUNCIA VOLUNTARIA") {
      badgeClass += " renuncia";
    } else if (record.bajaReason === "FIN DE CONVENIO") {
      badgeClass += " fin-convenio";
    }

    return "<tr>"
      + '<td class="id-cell">' + escapeHtml(record.id) + "</td>"
      + '<td class="employee-cell">' + escapeHtml(record.collaborator) + "</td>"
      + "<td>" + escapeHtml(record.area) + "</td>"
      + '<td><span class="' + badgeClass + '">' + escapeHtml(record.bajaReason || "—") + "</span></td>"
      + "<td>" + escapeHtml(formatDateDisplay(record.exitDate)) + "</td>"
      + "<td>" + (record.documentName
        ? '<span class="document-name" title="' + escapeHtml(record.documentName) + '">' + escapeHtml(record.documentName) + "</span>"
        : '<span class="empty-document">—</span>') + "</td>"
      + '<td><div class="row-actions">'
      + '<button class="action-button" type="button" data-action="view" data-key="' + escapeHtml(record.key) + '">Consultar</button>'
      + "</div></td>"
      + "</tr>";
  }).join("");
}

// Renderizado de Tabla: Blacklist
function renderBlacklistTable() {
  const allBlacklist = records.filter(function (r) {
    return r.category === "blacklist";
  });
  badgeBlacklist.textContent = String(allBlacklist.length);

  const query = searchInputBlacklist.value.trim().toLocaleLowerCase("es");
  const selectedReason = reasonFilterBlacklist.value;
  const selectedArea = areaFilterBlacklist ? areaFilterBlacklist.value : "";
  const dateOrder = dateOrderFilterBlacklist ? dateOrderFilterBlacklist.value : "recent";

  const filtered = allBlacklist.filter(function (record) {
    const matchesQuery = !query
      || record.id.toLocaleLowerCase("es").includes(query)
      || record.collaborator.toLocaleLowerCase("es").includes(query)
      || (record.area && record.area.toLocaleLowerCase("es").includes(query));
    const matchesReason = !selectedReason || record.reason === selectedReason;
    const matchesArea = !selectedArea || record.area === selectedArea;
    return matchesQuery && matchesReason && matchesArea;
  });

  // Ordenar por fecha más reciente o más antigua
  filtered.sort(function (a, b) {
    const dateA = a.date || "";
    const dateB = b.date || "";
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateOrder === "oldest" ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
  });

  recordsCountBlacklist.textContent = filtered.length + (filtered.length === 1 ? " registro" : " registros");

  if (filtered.length === 0) {
    const hasFilters = Boolean(query || selectedReason);
    recordsTableBodyBlacklist.innerHTML = '<tr><td class="empty-row" colspan="9">' +
      (hasFilters ? "No hay registros en Blacklist que coincidan con la búsqueda." : "Aún no hay colaboradores en lista negra. Puedes registrar uno con el botón superior.") +
      "</td></tr>";
    return;
  }

  recordsTableBodyBlacklist.innerHTML = filtered.map(function (record) {
    const levelDisplay = record.level || record.legacyLevel || "";
    const isMuyGrave = levelDisplay === "MUY GRAVE";

    return "<tr>"
      + '<td class="id-cell">' + escapeHtml(record.id) + "</td>"
      + '<td class="employee-cell">' + escapeHtml(record.collaborator) + "</td>"
      + "<td>" + escapeHtml(record.area) + "</td>"
      + '<td><span class="reason-badge">' + escapeHtml(record.reason || record.legacyReason || "—") + "</span></td>"
      + "<td>" + escapeHtml(record.infringement || record.legacyInfringement || "—") + "</td>"
      + "<td>" + (levelDisplay
        ? '<span class="level-badge' + (isMuyGrave ? ' muy-grave' : '') + '">' + escapeHtml(levelDisplay) + "</span>"
        : "—") + "</td>"
      + "<td>" + escapeHtml(formatDateDisplay(record.date)) + "</td>"
      + "<td>" + (record.documentName
        ? '<span class="document-name" title="' + escapeHtml(record.documentName) + '">' + escapeHtml(record.documentName) + "</span>"
        : '<span class="empty-document">—</span>') + "</td>"
      + '<td><div class="row-actions">'
      + '<button class="action-button" type="button" data-action="view" data-key="' + escapeHtml(record.key) + '">Consultar</button>'
      + "</div></td>"
      + "</tr>";
  }).join("");
}

function renderRecords() {
  renderFiltersOptions();
  renderBajasTable();
  renderBlacklistTable();
}

// Búsqueda y Selección de Colaboradores
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
    const colab = collaborators[id];
    return id.toLocaleLowerCase("es").includes(normalizedQuery) ||
           colab.name.toLocaleLowerCase("es").includes(normalizedQuery);
  });

  if (matches.length === 0) {
    collaboratorSuggestions.innerHTML = "";
    setSuggestionsVisible(false);
    setCollaboratorSearchMessage("No se encontraron colaboradores con ese nombre o ID.", "error");
    return;
  }

  collaboratorSuggestions.innerHTML = matches.map(function (id) {
    const collaborator = collaborators[id];
    return '<button class="suggestion-option" type="button" role="option" aria-selected="false" data-collaborator-id="'
      + escapeHtml(id) + '"><span>' + escapeHtml(collaborator.name) + '</span><small>ID ' + escapeHtml(id)
      + " · " + escapeHtml(collaborator.area) + "</small></button>";
  }).join("");
  setSuggestionsVisible(true);
  setCollaboratorSearchMessage("Selecciona un colaborador para autocompletar su ID y área.", "");
}

function selectCollaborator(id) {
  const collaborator = Object.prototype.hasOwnProperty.call(collaborators, id)
    ? collaborators[id]
    : null;
  const numericId = Number(id);
  if (!collaborator || !/^\d+$/.test(id) || !Number.isInteger(numericId) || numericId < 0 || numericId > 9999) {
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

// Adaptación dinámica de campos del modal según categoría
function updateFormCategoryUI(category) {
  const isBaja = category === "baja";
  bajaFieldsGroup.hidden = !isBaja;
  blacklistFieldsGroup.hidden = isBaja;

  // En la pestaña de Bajas solo está la opción de baja; en Blacklist solo la de blacklist
  if (recordCategorySelect) {
    if (isBaja) {
      recordCategorySelect.innerHTML = '<option value="baja" selected>Registrar nueva baja (Baja de practicante)</option>';
      recordCategorySelect.value = "baja";
    } else {
      recordCategorySelect.innerHTML = '<option value="blacklist" selected>Registrar en Blacklist (Infracción disciplinaria)</option>';
      recordCategorySelect.value = "blacklist";
    }
  }

  if (editingKey) {
    formDialogTitle.textContent = isBaja ? "Editar baja de practicante" : "Editar colaborador en Blacklist";
  } else {
    formDialogTitle.textContent = isBaja ? "Registrar nueva baja" : "Registrar en Blacklist";
  }

  const submitBtn = document.getElementById("submitRecordButton");
  if (submitBtn) {
    submitBtn.textContent = isBaja ? "Guardar baja" : "Guardar en Blacklist";
  }

  const searchLabel = document.querySelector("label[for='collaboratorSearch']");
  if (searchLabel) {
    searchLabel.textContent = "Buscar por nombre o ID";
  }
  if (collaboratorSearchInput) {
    collaboratorSearchInput.placeholder = "Buscar por nombre o ID";
  }
}

// Actualización dinámica de opciones de Infracción según Motivo seleccionado
function updateInfringementOptions(reason, selectedValue) {
  if (!infringementSelect) return;

  const options = INFRACCIONES_POR_MOTIVO[reason] || [];

  if (options.length === 0) {
    infringementSelect.innerHTML = '<option value="">Primero selecciona un motivo de infracción</option>';
    infringementSelect.value = "";
    return;
  }

  let html = '<option value="">Seleccionar infracción</option>';
  options.forEach(function (inf) {
    html += '<option value="' + escapeHtml(inf) + '">' + escapeHtml(inf) + '</option>';
  });
  infringementSelect.innerHTML = html;

  if (selectedValue) {
    if (options.includes(selectedValue)) {
      infringementSelect.value = selectedValue;
    } else if (selectedValue === "AUSENCIA DINAMICAS" && options.includes("AUSENCIA DINÁMICAS")) {
      infringementSelect.value = "AUSENCIA DINÁMICAS";
    } else {
      infringementSelect.value = "";
    }
  } else {
    infringementSelect.value = "";
  }
}

function resetForm() {
  recordForm.reset();
  editingKey = null;
  selectedCollaboratorId = null;
  retainedDocumentName = "";
  collaboratorSuggestions.innerHTML = "";
  setSuggestionsVisible(false);
  currentDocument.hidden = true;
  legacyRecordNotice.hidden = true;
  legacyRecordNotice.textContent = "";
  setCollaboratorSearchMessage("", "");

  // Por defecto ajusta a la categoría de la pestaña activa (baja o blacklist)
  const category = currentTab === "bajas" ? "baja" : "blacklist";
  updateFormCategoryUI(category);
  updateInfringementOptions("", "");
  if (blacklistDateInput) blacklistDateInput.value = "";
}

function openCreateDialog() {
  resetForm();
  const category = currentTab === "bajas" ? "baja" : "blacklist";
  updateFormCategoryUI(category);
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
  retainedDocumentName = record.documentName || "";
  const category = record.category || (currentTab === "bajas" ? "baja" : "blacklist");
  updateFormCategoryUI(category);

  if (!selectCollaborator(record.id)) {
    collaboratorSearchInput.value = record.collaborator;
    employeeNameInput.value = record.collaborator;
    employeeIdInput.value = record.id;
    employeeAreaInput.value = record.area;
    selectedCollaboratorId = record.id;
  }

  if (record.category === "baja") {
    bajaReasonSelect.value = BAJA_MOTIVES.includes(record.bajaReason) ? record.bajaReason : "";
    exitDateInput.value = record.exitDate || "";
    if (blacklistDateInput) blacklistDateInput.value = "";
    updateInfringementOptions("", "");
  } else {
    reasonSelect.value = BLACKLIST_MOTIVES.includes(record.reason) ? record.reason : "";
    updateInfringementOptions(reasonSelect.value, record.infringement || record.legacyInfringement || "");
    levelSelect.value = LEVELS.includes(record.level) ? record.level : "";
    if (blacklistDateInput) blacklistDateInput.value = record.date || "";

    const legacyValues = [
      record.legacyReason && "Motivo anterior: " + record.legacyReason,
      record.legacyInfringement && "Infracción anterior: " + record.legacyInfringement,
      record.legacyLevel && "Nivel anterior: " + record.legacyLevel,
      record.customReason && "Detalle anterior: " + record.customReason
    ].filter(Boolean);

    legacyRecordNotice.textContent = legacyValues.length
      ? "Este registro conserva valores de referencia anteriores: " + legacyValues.join(" · ")
      : "";
    legacyRecordNotice.hidden = !legacyValues.length;
  }

  observationInput.value = record.observation || "";
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
  const isBaja = record.category === "baja";

  document.getElementById("detailsEyebrow").textContent = isBaja ? "Detalle de baja de practicante" : "Detalle de registro en Blacklist";
  document.getElementById("detailsDialogTitle").textContent = record.collaborator;

  const fields = [
    ["Categoría", isBaja ? "Baja de practicante" : "Blacklist (Lista Negra)"],
    ["ID", record.id],
    ["Colaborador / Practicante", record.collaborator],
    ["Área", record.area]
  ];

  if (isBaja) {
    fields.push(["Motivo de baja", record.bajaReason || "—"]);
    fields.push(["Fecha efectiva de cese", formatDateDisplay(record.exitDate)]);
  } else {
    fields.push(["Motivo", record.reason || record.legacyReason || "—"]);
    fields.push(["Infracción", record.infringement || record.legacyInfringement || "—"]);
    fields.push(["Nivel", record.level || record.legacyLevel || "—"]);
    fields.push(["Fecha de infracción / registro", formatDateDisplay(record.date)]);
    if (record.legacyReason) {
      fields.push(["Motivo anterior", record.legacyReason]);
    }
    if (record.customReason) {
      fields.push(["Detalle anterior", record.customReason]);
    }
    if (record.legacyInfringement) {
      fields.push(["Infracción anterior", record.legacyInfringement]);
    }
    if (record.legacyLevel) {
      fields.push(["Nivel anterior", record.legacyLevel]);
    }
  }

  fields.push(["Documento firmado / sustento", record.documentName || "—"]);
  fields.push(["Observación", record.observation || "—"]);

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

// Event Listeners
newRecordButton.addEventListener("click", openCreateDialog);
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

recordCategorySelect.addEventListener("change", function () {
  updateFormCategoryUI(recordCategorySelect.value);
});

if (reasonSelect) {
  reasonSelect.addEventListener("change", function () {
    updateInfringementOptions(reasonSelect.value, "");
  });
}

collaboratorSearchInput.addEventListener("input", function () {
  selectedCollaboratorId = null;
  employeeNameInput.value = "";
  employeeIdInput.value = "";
  employeeAreaInput.value = "";
  searchCollaborators(collaboratorSearchInput.value);
});

collaboratorSearchInput.addEventListener("change", function () {
  if (!selectedCollaboratorId) {
    const query = collaboratorSearchInput.value.trim();
    if (query && collaborators[query]) {
      selectCollaborator(query);
    }
  }
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

// Filtros y búsquedas por pestaña
searchInputBajas.addEventListener("input", renderBajasTable);
if (areaFilterBajas) areaFilterBajas.addEventListener("change", renderBajasTable);
reasonFilterBajas.addEventListener("change", renderBajasTable);
if (dateOrderFilterBajas) dateOrderFilterBajas.addEventListener("change", renderBajasTable);

searchInputBlacklist.addEventListener("input", renderBlacklistTable);
if (areaFilterBlacklist) areaFilterBlacklist.addEventListener("change", renderBlacklistTable);
reasonFilterBlacklist.addEventListener("change", renderBlacklistTable);
if (dateOrderFilterBlacklist) dateOrderFilterBlacklist.addEventListener("change", renderBlacklistTable);

// Acciones en las tablas
recordsTableBodyBajas.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const key = button.dataset.key;
  if (action === "view") openDetailsDialog(key);
  else if (action === "edit") openEditDialog(key);
});

recordsTableBodyBlacklist.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const key = button.dataset.key;
  if (action === "view") openDetailsDialog(key);
  else if (action === "edit") openEditDialog(key);
});

// Envío del Formulario
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
    setCollaboratorSearchMessage("Busca y selecciona un practicante o colaborador antes de guardar.", "error");
    collaboratorSearchInput.focus();
    return;
  }

  const category = recordCategorySelect.value;
  const selectedFile = signedDocumentInput.files.length
    ? signedDocumentInput.files[0].name
    : retainedDocumentName;

  let newOrUpdatedRecord = null;

  if (category === "baja") {
    const bajaReason = bajaReasonSelect.value;
    if (!bajaReason) {
      showMessage("Por favor, selecciona un motivo de baja.", true);
      bajaReasonSelect.focus();
      return;
    }

    newOrUpdatedRecord = {
      key: editingKey || createKey(),
      category: "baja",
      id: selectedCollaboratorId,
      collaborator: collaborator.name,
      area: collaborator.area,
      bajaReason: bajaReason,
      exitDate: exitDateInput.value || (existingRecord ? existingRecord.exitDate : ""),
      documentName: selectedFile || "",
      observation: observationInput.value.trim()
    };
  } else {
    newOrUpdatedRecord = {
      key: editingKey || createKey(),
      category: "blacklist",
      id: selectedCollaboratorId,
      collaborator: collaborator.name,
      area: collaborator.area,
      reason: reasonSelect.value,
      customReason: existingRecord ? existingRecord.customReason || "" : "",
      legacyReason: existingRecord ? existingRecord.legacyReason || "" : "",
      infringement: infringementSelect.value,
      legacyInfringement: existingRecord ? existingRecord.legacyInfringement || "" : "",
      level: levelSelect.value,
      legacyLevel: existingRecord ? existingRecord.legacyLevel || "" : "",
      date: (blacklistDateInput && blacklistDateInput.value) || (existingRecord ? existingRecord.date : new Date().toISOString().slice(0, 10)),
      documentName: selectedFile || "",
      observation: observationInput.value.trim()
    };
  }

  const nextRecords = existingRecord
    ? records.map(function (item) { return item.key === editingKey ? newOrUpdatedRecord : item; })
    : records.concat(newOrUpdatedRecord);

  if (persistRecords(nextRecords)) {
    formDialog.close();
    setActiveTab(category);
    showMessage(existingRecord ? "Registro actualizado correctamente." : (category === "baja" ? "Baja registrada con éxito." : "Registro en Blacklist guardado."));
  }
});

formDialog.addEventListener("close", resetForm);
detailsDialog.addEventListener("close", function () {
  selectedDetailsKey = null;
});

// Inicialización
loadRecords();
renderRecords();
setActiveTab("bajas");
updateInfringementOptions("", "");
