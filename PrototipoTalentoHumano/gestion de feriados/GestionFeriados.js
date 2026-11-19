/**
 * Gestor de Feriados y Días No Laborables - Talento Humano
 * Cómputo de feriados calendario de ley (filtrados estrictamente de lunes a viernes)
 * y administración (CRUD) de días no laborables decretados por el Gobierno.
 */

const STORAGE_KEY_GOBIERNO = "th_feriados_gobierno_v1";

const DEFAULT_GOBIERNO_FERIADOS = [
  {
    id: "gob-2026-001",
    fecha: "2026-01-02",
    motivo: "Día no laborable con fines turísticos (Puente de Año Nuevo)",
    decreto: "D.S. N° 011-2026-PCM",
    tipo: "No laborable compensable",
    horas: 5,
    ambito: "Nacional (Público y Privado)",
    observaciones: "Puente turístico de inicio de año. Jornada de prácticas de 5 horas exonerada de recuperación."
  },
  {
    id: "gob-2026-002",
    fecha: "2026-07-27",
    motivo: "Día no laborable para el sector público (Puente de Fiestas Patrias)",
    decreto: "D.S. N° 011-2026-PCM",
    tipo: "No laborable compensable",
    horas: 5,
    ambito: "Sector Público (Extensible)",
    observaciones: "Puente festivo previo a los feriados patrios del 28 y 29 de julio."
  },
  {
    id: "gob-2026-003",
    fecha: "2026-11-13",
    motivo: "Día no laborable por Conferencia Extraordinaria Internacional",
    decreto: "D.S. N° 088-2026-PCM",
    tipo: "No laborable extraordinario",
    horas: 5,
    ambito: "Nacional (Público y Privado)",
    observaciones: "Decreto extraordinario para facilitar la movilidad y actividades institucionales durante cumbre oficial."
  }
];

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado"
];

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

/**
 * Algoritmo de Gauss / Butcher para determinar el Domingo de Pascua de cualquier año
 */
function calcularDomingoPascua(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=Marzo, 4=Abril
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/**
 * Genera el listado oficial de feriados nacionales peruanos (D.Leg. 713 y leyes modificatorias)
 */
function getFeriadosCalendario(year) {
  const pascua = calcularDomingoPascua(year);
  
  const juevesSanto = new Date(pascua);
  juevesSanto.setDate(pascua.getDate() - 3);

  const viernesSanto = new Date(pascua);
  viernesSanto.setDate(pascua.getDate() - 2);

  const rawList = [
    { name: "Año Nuevo", date: new Date(year, 0, 1), law: "D.Leg. 713" },
    { name: "Jueves Santo", date: juevesSanto, law: "D.Leg. 713 (Semana Santa)" },
    { name: "Viernes Santo", date: viernesSanto, law: "D.Leg. 713 (Semana Santa)" },
    { name: "Día del Trabajo", date: new Date(year, 4, 1), law: "D.Leg. 713" },
    { name: "Batalla de Arica y Día de la Bandera", date: new Date(year, 5, 7), law: "Ley 31788" },
    { name: "San Pedro y San Pablo", date: new Date(year, 5, 29), law: "D.Leg. 713" },
    { name: "Día de la Fuerza Aérea del Perú", date: new Date(year, 6, 23), law: "Ley 31822" },
    { name: "Fiestas Patrias (Día de la Independencia)", date: new Date(year, 6, 28), law: "D.Leg. 713" },
    { name: "Fiestas Patrias (Glorias de las FF.AA. y PNP)", date: new Date(year, 6, 29), law: "D.Leg. 713" },
    { name: "Batalla de Junín", date: new Date(year, 7, 6), law: "Ley 31530" },
    { name: "Santa Rosa de Lima", date: new Date(year, 7, 30), law: "D.Leg. 713" },
    { name: "Combate de Angamos", date: new Date(year, 9, 8), law: "D.Leg. 713" },
    { name: "Día de Todos los Santos", date: new Date(year, 10, 1), law: "D.Leg. 713" },
    { name: "Inmaculada Concepción", date: new Date(year, 11, 8), law: "D.Leg. 713" },
    { name: "Batalla de Ayacucho", date: new Date(year, 11, 9), law: "Ley 31701" },
    { name: "Navidad", date: new Date(year, 11, 25), law: "D.Leg. 713" }
  ];

  // Ordenar cronológicamente
  rawList.sort((a, b) => a.date - b.date);

  return rawList.map(item => {
    const d = item.date;
    const dayOfWeek = d.getDay(); // 0 = Domingo, 6 = Sábado
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const pad = (n) => String(n).padStart(2, "0");
    const formatted = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    return {
      nombre: item.name,
      baseLegal: item.law,
      fecha: d,
      fechaStr: formatted,
      iso: iso,
      mes: d.getMonth() + 1,
      dia: d.getDate(),
      diaSemana: dayOfWeek,
      diaNombre: DIAS_SEMANA[dayOfWeek],
      isWeekday: isWeekday,
      horas: 5
    };
  });
}

/**
 * Acceso y persistencia de Feriados del Gobierno en localStorage
 */
function getGobiernoFeriados() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GOBIERNO);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_GOBIERNO, JSON.stringify(DEFAULT_GOBIERNO_FERIADOS));
      return [...DEFAULT_GOBIERNO_FERIADOS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...DEFAULT_GOBIERNO_FERIADOS];
  } catch (err) {
    console.error("Error al leer feriados del gobierno:", err);
    return [...DEFAULT_GOBIERNO_FERIADOS];
  }
}

function saveGobiernoFeriados(list) {
  try {
    localStorage.setItem(STORAGE_KEY_GOBIERNO, JSON.stringify(list));
  } catch (err) {
    console.error("Error al guardar feriados del gobierno:", err);
  }
}

// Variables de estado
let currentYear = 2026;
let currentTab = "calendario"; // 'calendario' | 'gobierno'
let pendingDeleteId = null;

// Elementos del DOM
const elements = {
  tabCalendario: document.getElementById("tabCalendario"),
  tabGobierno: document.getElementById("tabGobierno"),
  viewCalendario: document.getElementById("viewCalendario"),
  viewGobierno: document.getElementById("viewGobierno"),
  badgeTabCalendario: document.getElementById("badgeTabCalendario"),
  badgeTabGobierno: document.getElementById("badgeTabGobierno"),
  
  // KPIs
  kpiFeriadosLey: document.getElementById("kpiFeriadosLey"),
  kpiHorasLey: document.getElementById("kpiHorasLey"),
  kpiFeriadosGob: document.getElementById("kpiFeriadosGob"),
  kpiFeriadosFinde: document.getElementById("kpiFeriadosFinde"),
  kpiSubLey: document.getElementById("kpiSubLey"),
  kpiSubGob: document.getElementById("kpiSubGob"),

  // Tab 1: Calendario
  selectYearCalendario: document.getElementById("selectYearCalendario"),
  selectMesCalendario: document.getElementById("selectMesCalendario"),
  toggleFinde: document.getElementById("toggleFinde"),
  rowsCalendario: document.getElementById("rowsCalendario"),
  emptyCalendario: document.getElementById("emptyCalendario"),
  footerCountCalendario: document.getElementById("footerCountCalendario"),
  footerHoursCalendario: document.getElementById("footerHoursCalendario"),

  // Tab 2: Gobierno
  searchGobierno: document.getElementById("searchGobierno"),
  filterTipoGobierno: document.getElementById("filterTipoGobierno"),
  btnNuevoFeriadoGobierno: document.getElementById("btnNuevoFeriadoGobierno"),
  rowsGobierno: document.getElementById("rowsGobierno"),
  emptyGobierno: document.getElementById("emptyGobierno"),
  footerCountGobierno: document.getElementById("footerCountGobierno"),
  footerHoursGobierno: document.getElementById("footerHoursGobierno"),

  // Status toast
  status: document.getElementById("status"),

  // Modal Form Gobierno
  modalFeriadoGobierno: document.getElementById("modalFeriadoGobierno"),
  formFeriadoGobierno: document.getElementById("formFeriadoGobierno"),
  modalFeriadoTitle: document.getElementById("modalFeriadoTitle"),
  modalFeriadoEyebrow: document.getElementById("modalFeriadoEyebrow"),
  feriadoId: document.getElementById("feriadoId"),
  feriadoFecha: document.getElementById("feriadoFecha"),
  feriadoFechaPreview: document.getElementById("feriadoFechaPreview"),
  feriadoMotivo: document.getElementById("feriadoMotivo"),
  feriadoDecreto: document.getElementById("feriadoDecreto"),
  feriadoTipo: document.getElementById("feriadoTipo"),
  feriadoHoras: document.getElementById("feriadoHoras"),
  feriadoAmbito: document.getElementById("feriadoAmbito"),
  feriadoObservaciones: document.getElementById("feriadoObservaciones"),
  formError: document.getElementById("formError"),
  btnSubmitFeriado: document.getElementById("btnSubmitFeriado"),

  // Modal Confirm Delete
  modalConfirmDelete: document.getElementById("modalConfirmDelete"),
  confirmDeleteMessage: document.getElementById("confirmDeleteMessage"),
  btnConfirmDeleteAction: document.getElementById("btnConfirmDeleteAction")
};

/**
 * Notificación accesible
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
 * Cambio de pestañas
 */
function setTab(tab) {
  currentTab = tab;
  if (tab === "calendario") {
    elements.tabCalendario.setAttribute("aria-pressed", "true");
    elements.tabGobierno.setAttribute("aria-pressed", "false");
    elements.viewCalendario.hidden = false;
    elements.viewGobierno.hidden = true;
    renderCalendario();
  } else {
    elements.tabCalendario.setAttribute("aria-pressed", "false");
    elements.tabGobierno.setAttribute("aria-pressed", "true");
    elements.viewCalendario.hidden = true;
    elements.viewGobierno.hidden = false;
    renderGobierno();
  }
}

/**
 * Renderizado de la Vista 1: Feriados Calendario de Ley (Lunes a Viernes)
 */
function renderCalendario() {
  const year = parseInt(elements.selectYearCalendario.value, 10) || 2026;
  const mesFilter = elements.selectMesCalendario.value;
  const showWeekend = elements.toggleFinde.checked;

  const allHolidays = getFeriadosCalendario(year);

  // Filtrado
  const filtered = allHolidays.filter(item => {
    // Si no se marca ver fin de semana, se muestran ESTRICTAMENTE los de Lunes a Viernes
    if (!showWeekend && !item.isWeekday) {
      return false;
    }
    // Filtro por mes
    if (mesFilter !== "TODOS" && item.mes !== parseInt(mesFilter, 10)) {
      return false;
    }
    return true;
  });

  // Estadísticas globales del año seleccionado
  const weekdaysTotal = allHolidays.filter(h => h.isWeekday).length;
  const weekendTotal = allHolidays.filter(h => !h.isWeekday).length;
  const totalHorasLey = weekdaysTotal * 5;

  // Actualizar KPIs
  if (elements.kpiFeriadosLey) elements.kpiFeriadosLey.textContent = `${weekdaysTotal} días`;
  if (elements.kpiHorasLey) elements.kpiHorasLey.textContent = `${totalHorasLey} h`;
  if (elements.kpiFeriadosFinde) elements.kpiFeriadosFinde.textContent = `${weekendTotal} días`;
  if (elements.badgeTabCalendario) elements.badgeTabCalendario.textContent = weekdaysTotal;

  // Renderizar filas
  elements.rowsCalendario.innerHTML = "";

  if (filtered.length === 0) {
    elements.emptyCalendario.hidden = false;
  } else {
    elements.emptyCalendario.hidden = true;

    filtered.forEach(item => {
      const tr = document.createElement("tr");
      if (!item.isWeekday) {
        tr.classList.add("row-weekend");
      }

      // Badge de condición
      let condicionBadge = "";
      let impactoBadge = "";
      if (item.isWeekday) {
        condicionBadge = `<span class="pill pill-green">✓ Aplica a práctica (Lun - Vie)</span>`;
        impactoBadge = `<strong>5h</strong> <span style="color:var(--muted);font-size:11.5px">no laborables computadas</span>`;
      } else {
        condicionBadge = `<span class="pill pill-gray">Fin de semana (Excluido)</span>`;
        impactoBadge = `<span style="color:var(--muted);font-size:11.5px">0h (no hay jornada programada)</span>`;
      }

      const dayClass = item.isWeekday ? "is-weekday" : "is-weekend";

      tr.innerHTML = `
        <td>
          <span class="date-text">${item.fechaStr}</span>
        </td>
        <td>
          <span class="day-badge ${dayClass}">${item.diaNombre}</span>
        </td>
        <td>
          <div class="holiday-name">${item.nombre}</div>
          <div class="holiday-sub">${MESES[item.mes - 1]} ${year}</div>
        </td>
        <td>
          <span class="pill pill-blue">${item.baseLegal}</span>
        </td>
        <td>
          ${impactoBadge}
        </td>
        <td>
          ${condicionBadge}
        </td>
      `;
      elements.rowsCalendario.appendChild(tr);
    });
  }

  // Footer resumen
  const weekdaysFiltered = filtered.filter(h => h.isWeekday).length;
  const hoursFiltered = weekdaysFiltered * 5;
  elements.footerCountCalendario.textContent = `${weekdaysFiltered} feriado(s) de lunes a viernes en este listado`;
  elements.footerHoursCalendario.textContent = `Total computable: ${hoursFiltered} horas de práctica`;
}

/**
 * Renderizado de la Vista 2: Feriados Decretados por el Gobierno
 */
function renderGobierno() {
  const list = getGobiernoFeriados();
  const query = elements.searchGobierno.value.trim().toLowerCase();
  const tipoFilter = elements.filterTipoGobierno.value;

  // Ordenar cronológicamente
  list.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const filtered = list.filter(item => {
    if (tipoFilter !== "TODOS" && item.tipo !== tipoFilter) {
      return false;
    }
    if (query) {
      const matchMotivo = item.motivo.toLowerCase().includes(query);
      const matchDecreto = item.decreto.toLowerCase().includes(query);
      const matchFecha = item.fecha.toLowerCase().includes(query);
      const matchTipo = (item.tipo || "").toLowerCase().includes(query);
      if (!matchMotivo && !matchDecreto && !matchFecha && !matchTipo) {
        return false;
      }
    }
    return true;
  });

  // Actualizar KPIs del Gobierno
  const totalGob = list.length;
  const totalHorasGob = list.reduce((acc, curr) => acc + (Number(curr.horas) || 5), 0);
  if (elements.kpiFeriadosGob) elements.kpiFeriadosGob.textContent = `${totalGob} días`;
  if (elements.badgeTabGobierno) elements.badgeTabGobierno.textContent = totalGob;
  if (elements.kpiSubGob) elements.kpiSubGob.textContent = `${totalHorasGob} h acumuladas`;

  // Renderizar filas
  elements.rowsGobierno.innerHTML = "";

  if (filtered.length === 0) {
    elements.emptyGobierno.hidden = false;
  } else {
    elements.emptyGobierno.hidden = true;

    filtered.forEach(item => {
      const tr = document.createElement("tr");

      // Parse date y day
      const parts = item.fecha.split("-");
      let diaNombre = "-";
      let fechaFormatted = item.fecha;
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        diaNombre = DIAS_SEMANA[d.getDay()] || "-";
        fechaFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }

      // Tipo pill
      let tipoPillClass = "pill-purple";
      if (item.tipo && item.tipo.includes("compensable")) {
        tipoPillClass = "pill-orange";
      } else if (item.tipo && item.tipo.includes("excepcional")) {
        tipoPillClass = "pill-blue";
      }

      tr.innerHTML = `
        <td>
          <span class="date-text">${fechaFormatted}</span>
        </td>
        <td>
          <span class="day-badge is-weekday">${diaNombre}</span>
        </td>
        <td>
          <div class="holiday-name">${escapeHTML(item.motivo)}</div>
          ${item.observaciones ? `<div class="holiday-sub">${escapeHTML(item.observaciones)}</div>` : ""}
        </td>
        <td>
          <span class="pill pill-blue">${escapeHTML(item.decreto)}</span>
        </td>
        <td>
          <span class="pill ${tipoPillClass}">${escapeHTML(item.tipo || "Decretado")}</span>
        </td>
        <td>
          <strong>${item.horas || 5} h</strong>
        </td>
        <td>
          <div class="action-buttons">
            <button type="button" class="btn-edit" data-action="edit" data-id="${item.id}" title="Editar feriado">
              ✏️ Editar
            </button>
            <button type="button" class="btn-danger" data-action="delete" data-id="${item.id}" title="Eliminar feriado">
              🗑️ Eliminar
            </button>
          </div>
        </td>
      `;

      elements.rowsGobierno.appendChild(tr);
    });
  }

  // Footer
  const sumHorasFiltered = filtered.reduce((acc, curr) => acc + (Number(curr.horas) || 5), 0);
  elements.footerCountGobierno.textContent = `${filtered.length} feriado(s) del gobierno registrado(s)`;
  elements.footerHoursGobierno.textContent = `Total: ${sumHorasFiltered} horas computadas`;
}

/**
 * Vista previa del día al seleccionar fecha en el formulario
 */
function updateFechaPreview() {
  const val = elements.feriadoFecha.value;
  if (!val) {
    elements.feriadoFechaPreview.innerHTML = `📅 Selecciona una fecha para verificar el día de la semana`;
    elements.feriadoFechaPreview.style.borderColor = "var(--border)";
    elements.feriadoFechaPreview.style.color = "var(--muted)";
    return;
  }

  const parts = val.split("-");
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const day = d.getDay();
    const dayName = DIAS_SEMANA[day];
    const isWeekday = day >= 1 && day <= 5;

    if (isWeekday) {
      elements.feriadoFechaPreview.innerHTML = `✓ <strong>${dayName}</strong> · Día hábil (Aplica a la jornada de prácticas de lunes a viernes)`;
      elements.feriadoFechaPreview.style.borderColor = "#a6f4c5";
      elements.feriadoFechaPreview.style.color = "#027a48";
    } else {
      elements.feriadoFechaPreview.innerHTML = `⚠️ <strong>${dayName}</strong> · Cae en fin de semana (No hay jornada regular programada)`;
      elements.feriadoFechaPreview.style.borderColor = "#fedf89";
      elements.feriadoFechaPreview.style.color = "#b54708";
    }
  }
}

/**
 * Abrir modal para crear o editar
 */
function openModalGobierno(id = null) {
  elements.formError.style.display = "none";
  elements.formError.textContent = "";

  if (id) {
    const list = getGobiernoFeriados();
    const item = list.find(f => f.id === id);
    if (!item) return;

    elements.feriadoId.value = item.id;
    elements.feriadoFecha.value = item.fecha;
    elements.feriadoMotivo.value = item.motivo;
    elements.feriadoDecreto.value = item.decreto;
    elements.feriadoTipo.value = item.tipo || "No laborable compensable";
    elements.feriadoHoras.value = item.horas || 5;
    elements.feriadoAmbito.value = item.ambito || "Nacional (Público y Privado)";
    elements.feriadoObservaciones.value = item.observaciones || "";

    elements.modalFeriadoTitle.textContent = "Editar feriado decretado por el gobierno";
    elements.modalFeriadoEyebrow.textContent = "ACTUALIZAR REGISTRO";
    elements.btnSubmitFeriado.textContent = "Guardar cambios";
  } else {
    elements.feriadoId.value = "";
    elements.feriadoFecha.value = "";
    elements.feriadoMotivo.value = "";
    elements.feriadoDecreto.value = "";
    elements.feriadoTipo.value = "No laborable compensable";
    elements.feriadoHoras.value = 5;
    elements.feriadoAmbito.value = "Nacional (Público y Privado)";
    elements.feriadoObservaciones.value = "";

    elements.modalFeriadoTitle.textContent = "Registrar feriado decretado por el gobierno";
    elements.modalFeriadoEyebrow.textContent = "GESTIÓN GUBERNAMENTAL";
    elements.btnSubmitFeriado.textContent = "Guardar feriado";
  }

  updateFechaPreview();
  if (typeof elements.modalFeriadoGobierno.showModal === "function") {
    elements.modalFeriadoGobierno.showModal();
  } else {
    elements.modalFeriadoGobierno.setAttribute("open", "");
  }
}

/**
 * Guardar feriado (Crear o Editar)
 */
function handleFormSubmit(e) {
  e.preventDefault();
  elements.formError.style.display = "none";

  const id = elements.feriadoId.value;
  const fecha = elements.feriadoFecha.value.trim();
  const motivo = elements.feriadoMotivo.value.trim();
  const decreto = elements.feriadoDecreto.value.trim();
  const tipo = elements.feriadoTipo.value;
  const horas = parseInt(elements.feriadoHoras.value, 10) || 5;
  const ambito = elements.feriadoAmbito.value;
  const observaciones = elements.feriadoObservaciones.value.trim();

  // Validaciones
  if (!fecha) {
    showFormError("Por favor ingresa la fecha del feriado decretado.");
    return;
  }
  if (!motivo) {
    showFormError("Por favor especifica el motivo o denominación oficial.");
    return;
  }
  if (!decreto) {
    showFormError("Por favor ingresa la norma legal o Decreto Supremo de respaldo.");
    return;
  }

  const list = getGobiernoFeriados();

  if (id) {
    // Editar
    const index = list.findIndex(f => f.id === id);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        fecha,
        motivo,
        decreto,
        tipo,
        horas,
        ambito,
        observaciones
      };
      saveGobiernoFeriados(list);
      showStatus("Feriado del gobierno actualizado exitosamente.", "success");
    }
  } else {
    // Crear nuevo
    const newId = "gob-" + Date.now();
    list.push({
      id: newId,
      fecha,
      motivo,
      decreto,
      tipo,
      horas,
      ambito,
      observaciones
    });
    saveGobiernoFeriados(list);
    showStatus("Nuevo feriado del gobierno registrado exitosamente.", "success");
  }

  closeModal(elements.modalFeriadoGobierno);
  renderGobierno();
}

function showFormError(msg) {
  elements.formError.textContent = msg;
  elements.formError.style.display = "block";
}

/**
 * Confirmar y ejecutar eliminación
 */
function confirmDelete(id) {
  const list = getGobiernoFeriados();
  const item = list.find(f => f.id === id);
  if (!item) return;

  pendingDeleteId = id;
  elements.confirmDeleteMessage.innerHTML = `¿Estás seguro de que deseas eliminar el feriado decretado <strong>"${escapeHTML(item.motivo)}"</strong> (${item.fecha})? Esta acción retirará las horas del cómputo.`;

  if (typeof elements.modalConfirmDelete.showModal === "function") {
    elements.modalConfirmDelete.showModal();
  } else {
    elements.modalConfirmDelete.setAttribute("open", "");
  }
}

function executeDelete() {
  if (!pendingDeleteId) return;
  let list = getGobiernoFeriados();
  list = list.filter(f => f.id !== pendingDeleteId);
  saveGobiernoFeriados(list);
  pendingDeleteId = null;

  closeModal(elements.modalConfirmDelete);
  renderGobierno();
  showStatus("Feriado del gobierno eliminado correctamente.", "info");
}

function closeModal(modal) {
  if (typeof modal.close === "function") {
    modal.close();
  } else {
    modal.removeAttribute("open");
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
 * Inicialización de listeners
 */
function init() {
  // Tabs
  elements.tabCalendario.addEventListener("click", () => setTab("calendario"));
  elements.tabGobierno.addEventListener("click", () => setTab("gobierno"));

  // Filtros Tab 1
  elements.selectYearCalendario.addEventListener("change", renderCalendario);
  elements.selectMesCalendario.addEventListener("change", renderCalendario);
  elements.toggleFinde.addEventListener("change", renderCalendario);

  // Filtros Tab 2
  elements.searchGobierno.addEventListener("input", renderGobierno);
  elements.filterTipoGobierno.addEventListener("change", renderGobierno);
  elements.btnNuevoFeriadoGobierno.addEventListener("click", () => openModalGobierno(null));

  // Formulario Gobierno
  elements.feriadoFecha.addEventListener("input", updateFechaPreview);
  elements.formFeriadoGobierno.addEventListener("submit", handleFormSubmit);

  // Acciones en la tabla de Gobierno (Editar / Eliminar) mediante delegación
  elements.rowsGobierno.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === "edit") {
      openModalGobierno(id);
    } else if (action === "delete") {
      confirmDelete(id);
    }
  });

  // Confirmar eliminación
  elements.btnConfirmDeleteAction.addEventListener("click", executeDelete);

  // Botones de cierre de modal
  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => {
      const modalId = btn.dataset.close;
      const modal = document.getElementById(modalId);
      if (modal) closeModal(modal);
    });
  });

  // Render inicial
  renderCalendario();
  renderGobierno();
}

// Arrancar al cargar el DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
