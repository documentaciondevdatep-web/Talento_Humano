"use strict";

/**
 * ==========================================================================
 * DEVDATEP CONSULTING - GESTIÓN DE COLABORADORES Y REINGRESOS
 * Compatible con protocolo file:// y entornos web estándar sin dependencias de importación externa.
 * ==========================================================================
 */

const departamentos = [
  { idDepartamento: "DEP-001", nombre: "Talento Humano" },
  { idDepartamento: "DEP-002", nombre: "Desarrollo Web" },
  { idDepartamento: "DEP-003", nombre: "Comercial" }
];

const areas = [
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

const subareas = [
  { idSubArea: "SUB-001", nombre: "Producción Audiovisual", idArea: "ARE-010" }
];

const roles = [
  { idRol: "ROL-001", nombre: "Gerente General" },
  { idRol: "ROL-002", nombre: "Gerencia" },
  { idRol: "ROL-003", nombre: "Líder" },
  { idRol: "ROL-004", nombre: "Co-líder" },
  { idRol: "ROL-005", nombre: "Colaborador" }
];

const COLABORADORES_BASE = [
  { idColaborador: "COL-001", codigoColaborador: "1101", tipoDocumento: "DNI", numeroDocumento: "00000001", nombres: "Alex", apellidoPaterno: "Ponce", apellidoMaterno: "Salas", tipoColaborador: "Trabajador", correo: "alex.ponce@devdatep.com", telefono: "987654321", idDepartamento: "DEP-001", idArea: "ARE-001", idSubArea: null, idRol: "ROL-002", foto: null, fechaIngreso: "2024-01-15", fechaSalida: null, estado: "Activo" },
  { idColaborador: "COL-002", codigoColaborador: "1102", tipoDocumento: "DNI", numeroDocumento: "00000002", nombres: "Sam", apellidoPaterno: "Vargas", apellidoMaterno: "Guerra", tipoColaborador: "Trabajador", correo: "sam.vargas@devdatep.com", telefono: "987654322", idDepartamento: "DEP-002", idArea: "ARE-004", idSubArea: null, idRol: "ROL-003", foto: null, fechaIngreso: "2024-02-01", fechaSalida: null, estado: "Activo" },
  { idColaborador: "COL-003", codigoColaborador: "1103", tipoDocumento: "DNI", numeroDocumento: "00000003", nombres: "Noa", apellidoPaterno: "Reyes", apellidoMaterno: "Luna", tipoColaborador: "Trabajador", correo: "noa.reyes@devdatep.com", telefono: "987654323", idDepartamento: "DEP-002", idArea: "ARE-005", idSubArea: null, idRol: "ROL-004", foto: null, fechaIngreso: "2024-03-01", fechaSalida: null, estado: "Activo" },
  { idColaborador: "COL-005", codigoColaborador: "1105", tipoDocumento: "DNI", numeroDocumento: "00000005", nombres: "Fernando", apellidoPaterno: "Gómez", apellidoMaterno: "Prado", tipoColaborador: "Practicante", correo: "fernando.gomez@devdatep.com", telefono: "987654325", idDepartamento: "DEP-002", idArea: "ARE-004", idSubArea: null, idRol: "ROL-005", foto: null, fechaIngreso: "2023-08-07", fechaSalida: "2023-11-20", estado: "Inactivo" },
  { idColaborador: "COL-006", codigoColaborador: "1108", tipoDocumento: "DNI", numeroDocumento: "00000006", nombres: "Lucía", apellidoPaterno: "Torres", apellidoMaterno: "Benavides", tipoColaborador: "Practicante", correo: "lucia.torres@devdatep.com", telefono: "987654326", idDepartamento: "DEP-001", idArea: "ARE-003", idSubArea: null, idRol: "ROL-005", foto: null, fechaIngreso: "2026-10-20", fechaSalida: null, estado: "Activo" },
  { idColaborador: "COL-010", codigoColaborador: "1109", tipoDocumento: "DNI", numeroDocumento: "00000010", nombres: "Valeria", apellidoPaterno: "Ríos", apellidoMaterno: "Mendoza", tipoColaborador: "Practicante", correo: "valeria.rios@devdatep.com", telefono: "987654330", idDepartamento: "DEP-002", idArea: "ARE-008", idSubArea: null, idRol: "ROL-005", foto: null, fechaIngreso: "2026-11-01", fechaSalida: null, estado: "Activo" }
];

function obtenerColaboradores() {
  const baseOficial = (typeof window !== "undefined" && Array.isArray(window.colaboradores70Oficiales) && window.colaboradores70Oficiales.length >= 65)
    ? window.colaboradores70Oficiales
    : COLABORADORES_BASE;
  try {
    const raw = localStorage.getItem("th_colaboradores");
    if (!raw) {
      localStorage.setItem("th_colaboradores", JSON.stringify(baseOficial));
      return JSON.parse(JSON.stringify(baseOficial));
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length < 65) {
      localStorage.setItem("th_colaboradores", JSON.stringify(baseOficial));
      return JSON.parse(JSON.stringify(baseOficial));
    }
    return parsed;
  } catch (e) {
    console.warn("Error leyendo th_colaboradores:", e);
    return JSON.parse(JSON.stringify(baseOficial));
  }
}

function guardarColaboradores(colaboradores) {
  try {
    localStorage.setItem("th_colaboradores", JSON.stringify(colaboradores));
    window.dispatchEvent(new CustomEvent("colaboradoresActualizados", {
      detail: { origen: "colaboradores", tipoOperacion: "actualizacion" }
    }));
  } catch (e) {
    console.warn("Error guardando th_colaboradores:", e);
  }
}

function actualizarColaborador(idColaborador, cambios) {
  const list = obtenerColaboradores();
  const idx = list.findIndex((c) => c.idColaborador === idColaborador);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...cambios };
    guardarColaboradores(list);
    return list[idx];
  }
  return null;
}

const $ = (s) => document.querySelector(s);
const KEY = "th_expedientes_ingreso_v1";
const CAMPOS_FORMULARIO = [
  "marcaTemporal", "situacionPracticante", "carrera", "institucion", "institucionTipo",
  "rucInstitucion", "direccionInstitucion", "representanteNombre", "representanteDocumento",
  "representanteCargo", "nacimiento", "nacionalidad", "direccion", "finPrueba",
  "inicioPrueba", "finPrevisto", "horarioSemanal"
];

// REQUISITO OFICIAL: Las horas mínimas para el convenio formativo son 330 horas
const HORAS_MINIMAS = 330;
const JORNADA_BASE = { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 };

function horasValidas(value) {
  return Number.isFinite(Number(value)) && Number(value) >= HORAS_MINIMAS;
}

const documents = [
  ["copia", "Copia de DNI o CE"],
  ["recibo", "Recibo de servicios"],
  ["firma", "Firma digital"],
  ["foto", "Foto formal con fondo blanco"]
];

let tab = "review";
let currentId = null;
let previewURL = null;
let isInitialized = false;
let listenersRegistered = false;

const today = () => {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Lima",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());
  } catch (e) {
    return new Date().toISOString().slice(0, 10);
  }
};

const uid = () => crypto.randomUUID();
const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const name = (p) => [p.nombres, p.apellidoPaterno, p.apellidoMaterno].filter(Boolean).join(" ");
const norm = (s) => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const label = (list, id, key) => list.find((x) => x[key] === id)?.nombre ?? "—";
const locationLabel = (p) => [label(areas, p.idArea, "idArea"), p.idSubArea ? label(subareas, p.idSubArea, "idSubArea") : ""].filter(Boolean).join(" / ");

/**
 * Normaliza los estados a los dos únicos estados permitidos en documentación:
 * 'Pendiente' y 'Validado'
 */
function normalizarEstadoRevision(est) {
  if (!est) return "Pendiente";
  const e = String(est).trim().toLowerCase();
  if (e === "validado" || e === "aprobado" || e === "completado") {
    return "Validado";
  }
  return "Pendiente";
}

function read() {
  const raw = localStorage.getItem(KEY);
  if (raw === null) return [];
  try {
    const result = JSON.parse(raw);
    if (Array.isArray(result)) {
      let mod = false;
      result.forEach((e) => {
        const norm = normalizarEstadoRevision(e.estadoRevision);
        if (e.estadoRevision !== norm) {
          e.estadoRevision = norm;
          mod = true;
        }
      });
      if (mod) {
        localStorage.setItem(KEY, JSON.stringify(result));
      }
      return result;
    }
  } catch (e) { }
  return [];
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function notice(message, error = false) {
  const el = $("#status");
  if (!el) return;
  el.textContent = message;
  el.className = error ? "error" : "success";
  setTimeout(() => {
    if (el.textContent === message) el.textContent = "";
  }, 4500);
}

/**
 * Retorna únicamente 'Pendiente' o 'Validado'
 */
function pendingState(e) {
  if (!e) return "Pendiente";
  if (e.estadoRevision) return normalizarEstadoRevision(e.estadoRevision);
  if (documents.every(([key]) => e.documentos?.[key]?.estado === "Aceptado") && horasValidas(e.horasConvenio)) {
    return "Validado";
  }
  return "Pendiente";
}

function tieneObservaciones(e) {
  if (!e || !e.documentos) return false;
  const docs = Object.values(e.documentos);
  return docs.some((d) => d && (d.estado === "Observado" || (typeof d.motivo === "string" && d.motivo.trim().length > 0)));
}

function obtenerObservaciones(e) {
  if (!e || !e.documentos) return [];
  const docs = Object.entries(e.documentos);
  return docs
    .filter(([_, d]) => d && (d.estado === "Observado" || (typeof d.motivo === "string" && d.motivo.trim().length > 0)))
    .map(([k, d]) => {
      const docDef = documents.find(([key]) => key === k);
      const docNom = docDef ? docDef[1] : k;
      return `${docNom}: ${d.motivo || "Corrección requerida"}`;
    });
}

function canReview(e) {
  return e.formularioCompleto && e.finPrueba <= today() && documents.every(([key]) => e.documentos[key]);
}

function fichaFor(p) {
  if (!p) return {};
  const exp = read().find((x) => x.numeroDocumento === p.numeroDocumento || x.idColaborador === p.idColaborador);
  const ft = p.fichaTalento || {};
  return {
    periodos: ft.periodos || (exp ? [{ inicio: exp.inicioPrueba, finPrevisto: exp.finPrevisto || exp.finPrueba, meta: exp.horasConvenio, horarioSemanal: exp.horarioSemanal || JORNADA_BASE }] : []),
    documentos: ft.documentos || exp?.documentos || {},
    inicioPrueba: ft.inicioPrueba || exp?.inicioPrueba,
    finPrueba: ft.finPrueba || exp?.finPrueba,
    finPrevisto: ft.finPrevisto || exp?.finPrevisto,
    horasConvenio: ft.horasConvenio || exp?.horasConvenio,
    marcaTemporal: ft.marcaTemporal || exp?.marcaTemporal || "No registrada",
    institucion: ft.institucion || exp?.institucion,
    representanteNombre: ft.representanteNombre || exp?.representanteNombre,
    ...ft
  };
}

function metadataFor(e) {
  if (!e) return {};
  return {
    marcaTemporal: e.marcaTemporal || "No registrada",
    institucion: e.institucion || "No informada",
    representanteNombre: e.representanteNombre || "No informado",
    horasConvenio: e.horasConvenio || 330,
    codigoProvisional: e.codigoProvisional || `${e.nombres}_${e.apellidoPaterno}.Prueba`
  };
}

function opts(list, key, selected = "", empty = "Seleccionar") {
  return '<option value="">' + empty + "</option>" + list.map((item) => `<option value="${escape(item[key])}" ${item[key] === selected ? "selected" : ""}>${escape(item.nombre)}</option>`).join("");
}

function fechaFinPrevista(inicio, horas, horario = JORNADA_BASE) {
  if (!inicio || !horasValidas(horas) || !horario) return null;
  const date = new Date(inicio + "T12:00:00Z");
  if (Number.isNaN(date.getTime())) return null;
  const semana = Array.from({ length: 7 }, (_, day) => Number(horario[day] ?? 0));
  if (semana.some((h) => !Number.isFinite(h) || h < 0 || h > 24) || semana.reduce((a, b) => a + b, 0) <= 0) return null;
  let restantes = Number(horas);
  for (let i = 0; i < 36600; i++) {
    restantes -= semana[date.getUTCDay()];
    if (restantes <= 0) return date.toISOString().slice(0, 10);
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return null;
}

function datosPracticas(p) {
  const f = p.expedienteId ? p : fichaFor(p);
  const periodo = f.periodos?.at(-1);
  const inicio = periodo?.inicio ?? f.inicioPrueba;
  const horas = periodo?.meta ?? f.horasConvenio;
  const fin = periodo?.fin ?? periodo?.finPrevisto ?? f.finPrevisto ?? fechaFinPrevista(inicio, horas, periodo?.horarioSemanal ?? f.horarioSemanal ?? JORNADA_BASE);
  return { inicio, horas, fin };
}

function celdasPracticas(p) {
  const d = datosPracticas(p);
  return `<td class="practice-value">${escape(d.horas != null ? d.horas + " h" : "No informado")}</td><td class="practice-value">${escape(d.inicio ?? "No informado")}</td><td class="practice-value">${escape(d.fin ?? "Por definir")}${!d.fin ? "<small>Faltan datos de inicio u horas</small>" : ""}</td>`;
}

/**
 * Cálculo de KPIs exacto: Total de expedientes = Pendientes + Validados
 */
function calcularKPIs() {
  const allColab = obtenerColaboradores();
  const allExp = read().filter((e) => canReview(e));

  // Expedientes pendientes de validación
  const pendientes = allExp.filter((e) => pendingState(e) === "Pendiente");

  // Colaboradores con documentación validada (personas únicas)
  const validadosDocs = new Set();
  allColab.forEach((c) => {
    if (c.numeroDocumento) validadosDocs.add(c.numeroDocumento);
  });
  allExp.filter((e) => pendingState(e) === "Validado").forEach((e) => {
    if (e.numeroDocumento) validadosDocs.add(e.numeroDocumento);
  });

  const countPendientes = pendientes.length;
  const countValidados = validadosDocs.size;
  const total = countPendientes + countValidados;

  if ($("#totalCount")) $("#totalCount").textContent = total;
  if ($("#pendingCount")) $("#pendingCount").textContent = countPendientes;
  if ($("#validatedCount")) $("#validatedCount").textContent = countValidados;
}

/**
 * Renderizado de tabla y actualización del contenedor existente sin duplicaciones
 */
function render() {
  const all = obtenerColaboradores();
  const entries = read().filter((e) => canReview(e));

  calcularKPIs();

  const query = norm($("#search") ? $("#search").value : "");
  const dep = $("#department") ? $("#department").value : "";
  const state = $("#stateFilter") ? $("#stateFilter").value : "";

  // Selección de fuente según la pestaña activa:
  // - review (Revisión documental): muestra ÚNICAMENTE expedientes pendientes
  // - active (Colaboradores): muestra personas con documentación validada
  // - reentry (Reingresos): colaboradores no activos
  let source = [];
  if (tab === "review") {
    source = entries.filter((e) => pendingState(e) === "Pendiente");
  } else if (tab === "active") {
    const vistos = new Set();
    const listaValidados = [];

    // Colaboradores de th_colaboradores (todos validados para estar en esta sección)
    all.forEach((c) => {
      vistos.add(c.numeroDocumento);
      listaValidados.push(c);
    });

    // Expedientes validados que aún no figuren en th_colaboradores
    entries.filter((e) => pendingState(e) === "Validado").forEach((e) => {
      if (!vistos.has(e.numeroDocumento)) {
        vistos.add(e.numeroDocumento);
        listaValidados.push({
          ...e,
          idColaborador: e.idColaborador || `COL-${e.expedienteId}`,
          estado: "Validado",
          estadoRevision: "Validado"
        });
      }
    });

    source = listaValidados;
  } else {
    source = all.filter((p) => p.estado !== "Activo");
  }

  const filtered = source.filter((p) => {
    const coincideDep = !dep || p.idDepartamento === dep;
    const est = tab === "review" ? pendingState(p) : tab === "reentry" ? (p.estado || "Inactivo") : "Validado";
    const coincideState = !state || est === state || (state === "Validado" && (est === "Validado" || p.estado === "Activo"));
    const cod = p.codigoColaborador || p.codigoProvisional || "";
    const coincideQuery = norm(name(p) + " " + p.numeroDocumento + " " + cod).includes(query);
    return coincideDep && coincideState && coincideQuery;
  });

  const tbody = $("#rows");
  if (!tbody) return;

  // Actualización limpia del contenedor existente
  tbody.innerHTML = filtered.map((p) => {
    const isReview = tab === "review";
    const codProv = p.codigoProvisional || `${p.nombres}_${p.apellidoPaterno}.Prueba`;
    const codText = p.codigoColaborador ? `Código definitivo ${p.codigoColaborador}` : `Código provisional: ${codProv}`;

    // En documentación, únicamente usamos "Pendiente" y "Validado"
    let badgeText = isReview ? pendingState(p) : "Validado";
    if (tab === "reentry") {
      badgeText = p.estado || "Inactivo";
    }

    const badgeClass = badgeText === "Validado" || badgeText === "Activo" ? "green" : "";

    // Si tiene observaciones pendientes, mostramos el comentario como información adicional
    const hasObs = isReview && tieneObservaciones(p);
    const obsComentarios = hasObs ? obtenerObservaciones(p) : [];
    const obsHTML = hasObs
      ? `<div class="obs-tag" style="font-size:11px;color:#b45309;margin-top:4px;display:flex;align-items:center;gap:3px;" title="${escape(obsComentarios.join(' | '))}">
          <span>⚠️</span> <span>Con observaciones: ${escape(obsComentarios[0] || 'Corrección requerida')}</span>
         </div>`
      : "";

    const detailId = isReview ? p.expedienteId : (p.idColaborador || p.expedienteId);
    const actionLabel = isReview ? "Revisar expediente" : tab === "reentry" ? "Evaluar reingreso" : "Ver ficha";

    return `<tr>
      <td>
        <strong>${escape(name(p))}</strong>
        <small>${escape(codText)}</small>
      </td>
      <td>${escape(p.tipoDocumento || "DNI")} ${escape(p.numeroDocumento)}</td>
      <td>${escape(locationLabel(p))}<small>${escape(label(departamentos, p.idDepartamento, "idDepartamento"))}</small></td>
      ${celdasPracticas(p)}
      <td>
        <span class="badge ${badgeClass}">${escape(badgeText)}</span>
        ${obsHTML}
      </td>
      <td><button type="button" data-detail="${escape(detailId)}">${actionLabel}</button></td>
    </tr>`;
  }).join("");

  const emptyEl = $("#empty");
  if (emptyEl) emptyEl.hidden = filtered.length > 0;

  const countEl = $("#count");
  if (countEl) countEl.textContent = filtered.length + " registros";

  const hintEl = $("#listHint");
  if (hintEl) {
    hintEl.textContent = tab === "review"
      ? "Expedientes de postulantes que terminaron su periodo de prueba. Revisa documentos y conserva su código provisional."
      : tab === "reentry"
      ? "Evalúa el historial antes de iniciar un nuevo período formativo o laboral."
      : "Colaboradores con documentación validada y formalización de convenio.";
  }
}

function changeTab(next) {
  tab = next;
  document.querySelectorAll("[data-tab]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tab === tab)));

  const stateSelect = $("#stateFilter");
  if (stateSelect) {
    if (tab === "review") {
      stateSelect.innerHTML = `
        <option value="">Todos los estados</option>
        <option value="Pendiente">Pendiente</option>
        <option value="Validado">Validado</option>
      `;
    } else if (tab === "active") {
      stateSelect.innerHTML = `
        <option value="">Todos los estados</option>
        <option value="Validado">Validado</option>
        <option value="Activo">Activo</option>
      `;
    } else {
      stateSelect.innerHTML = `
        <option value="">Todos los estados</option>
        <option value="Inactivo">Inactivo</option>
        <option value="Baja">Baja</option>
      `;
    }
    stateSelect.value = "";
  }

  render();
}

function dataList(p) {
  const section = (title, items) => '<section class="form-section"><h3>' + title + "</h3><dl>" + items.map(([k, v]) => "<div><dt>" + k + "</dt><dd>" + escape(v === undefined || v === null || v === "" ? "No informado" : v) + "</dd></div>").join("") + "</dl></section>";

  return (
    section("Datos personales y formulario", [
      ["Fecha de envío del formulario", p.marcaTemporal],
      ["Nombres y apellidos completos", name(p)],
      ["Tipo de documento", p.tipoDocumento],
      ["Número de documento", p.numeroDocumento],
      ["Fecha de nacimiento", p.nacimiento],
      ["Nacionalidad", p.nacionalidad],
      ["Dirección actual", p.direccion],
      ["Correo", p.correo],
      ["Teléfono", p.telefono]
    ]) +
    section("Formación e institución", [
      ["Situación actual como practicante", p.situacionPracticante],
      ["Especialidad o carrera", p.carrera],
      ["Tipo de institución", p.institucionTipo],
      ["Razón social de la institución", p.institucion],
      ["RUC de la institución", p.rucInstitucion],
      ["Dirección de la institución", p.direccionInstitucion]
    ]) +
    section("Representante de la institución", [
      ["Nombre completo del representante", p.representanteNombre],
      ["DNI del representante", p.representanteDocumento],
      ["Cargo del representante", p.representanteCargo]
    ]) +
    section("Asignación y horas declaradas", [
      ["Departamento", label(departamentos, p.idDepartamento, "idDepartamento")],
      ["Área", label(areas, p.idArea, "idArea")],
      ["Subárea", p.idSubArea ? label(subareas, p.idSubArea, "idSubArea") : "No aplica"],
      ["Rol", label(roles, p.idRol, "idRol")],
      ["Inicio de prácticas (ingreso a prueba)", p.inicioPrueba],
      ["Fin del período de prueba", p.finPrueba + " (Culminado)"],
      ["Jornada base", "5 horas diarias · lunes a viernes"],
      ["Fin previsto de prácticas", p.finPrevisto ?? fechaFinPrevista(p.inicioPrueba, p.horasConvenio, p.horarioSemanal ?? JORNADA_BASE) ?? "Por definir"],
      ["Horas requeridas por la institución / acordadas", p.horasConvenio != null ? p.horasConvenio + " h (mínimo 330 h)" : null]
    ])
  );
}

function documentTable(docs, review = false) {
  return `<div class="table-scroll"><table class="docs"><thead><tr><th>Documento</th><th>Estado</th><th>Revisión</th></tr></thead><tbody>${documents.map(([key, title]) => {
    const d = docs?.[key];
    return `<tr><td><strong>${title}</strong><small>${escape(d?.nombre ?? "Sin documento en este expediente")}</small>${d ? `<button type="button" data-preview="${key}" class="subtle">Previsualizar</button>` : ""}</td><td><span class="badge ${d?.estado === "Aceptado" ? "green" : d?.estado === "Observado" ? "red" : ""}">${escape(d?.estado ?? "Sin registro")}</span>${d?.motivo ? `<small>${escape(d.motivo)}</small>` : ""}</td><td>${review ? `<div class="doc-actions"><button type="button" data-document="${key}" data-decision="Aceptado">Aceptar</button><button type="button" data-document="${key}" data-decision="Observado" class="danger">Observar</button></div><input aria-label="Observación: ${title}" id="reason_${key}" placeholder="Describe qué debe corregirse" value="${escape(d?.motivo ?? "")}">` : "—"}</td></tr>`;
  }).join("")}</tbody></table></div>`;
}

function consultarConvenio(idColaborador, idPeriodo) {
  try {
    const raw = localStorage.getItem("th_convenios_v1");
    if (!raw) return null;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return null;
    return list.find((c) => (c.idColaborador === idColaborador || c.idPeriodo === idPeriodo)) || null;
  } catch (e) {
    return null;
  }
}

/**
 * Habilitar preparación de convenio y navegar al módulo de Convenios
 */
function abrirOPrepararConvenio(expedienteId) {
  const entries = read();
  const e = entries.find((x) => x.expedienteId === expedienteId);
  if (!e) throw Error("No se encontró el expediente.");

  let convenios = [];
  try {
    const raw = localStorage.getItem("th_convenios_v1");
    if (raw) convenios = JSON.parse(raw);
    if (!Array.isArray(convenios)) convenios = [];
  } catch (err) { }

  const stableId = e.idColaborador || `COL-${e.expedienteId}`;
  let sol = convenios.find((c) => c.idColaborador === stableId || c.numeroDocumento === e.numeroDocumento);

  if (!sol) {
    const anio = new Date().getFullYear();
    const idSolicitud = `SOL-${anio}-${String(convenios.length + 1).padStart(3, "0")}`;
    const areaNombre = label(areas, e.idArea, "idArea");
    const sitAcademica = e.situacionPracticante || "Estudiante universitario";
    const esProfesional = sitAcademica.toLowerCase().includes("egresad") || sitAcademica.toLowerCase().includes("bachiller");
    const codProvisional = e.codigoProvisional || `${e.nombres}_${e.apellidoPaterno}.Prueba`;

    sol = {
      idSolicitud: idSolicitud,
      idColaborador: stableId,
      codigoColaborador: codProvisional,
      codigoProvisional: codProvisional,
      nombreColaborador: name(e),
      numeroDocumento: e.numeroDocumento,
      tipoDocumento: e.tipoDocumento || "DNI",
      idArea: e.idArea || "ARE-002",
      area: areaNombre || "Capacitación",
      idPeriodo: `PER-${e.expedienteId}`,
      fechaSolicitud: today(),
      estado: "Pendiente de preparación",
      plantilla: esProfesional ? "profesional" : "pre-profesional",
      empresa: {
        razonSocial: "DEVDATEP CONSULTING S.A.C.",
        ruc: "20608512345",
        domicilio: "Av. Manuel Olguín 335, Of. 1202, Santiago de Surco, Lima, Perú",
        actividad: "Servicios de Consultoría Tecnológica, Desarrollo de Software y Sistemas de Información",
        representante: "Christian Alexis Mendoza Portocarrero",
        cargoRep: "Gerente General",
        docRep: "DNI 45892134"
      },
      institucion: {
        razonSocial: e.institucion || "Universidad de Lima",
        ruc: e.rucInstitucion || "20148092282",
        domicilio: e.direccionInstitucion || "Av. Principal 123, Lima",
        representante: e.representanteNombre || "Director(a) de Escuela Profesional",
        cargoRep: e.representanteCargo || "Coordinador(a) de Prácticas Formativas",
        docRep: e.representanteDocumento || "DNI 08234567"
      },
      practicante: {
        nombreCompleto: name(e),
        documento: e.numeroDocumento,
        tipoDocumento: e.tipoDocumento || "DNI",
        nacionalidad: e.nacionalidad || "Peruana",
        nacimiento: e.nacimiento || "2003-05-15",
        sexo: e.sexo || "No especificado",
        domicilio: e.direccion || "Lima, Perú",
        situacionAcademica: sitAcademica,
        especialidad: e.carrera || "Ingeniería de Software"
      },
      condiciones: {
        fechaInicio: e.inicioPrueba || today(),
        fechaFin: e.finPrevisto || fechaFinPrevista(e.inicioPrueba || today(), e.horasConvenio || 330) || today(),
        duracion: "3 meses (66 días hábiles)",
        diasHorario: "Lunes a Viernes de 09:00 a 14:00 (5 horas diarias)",
        horasAcordadas: Number(e.horasConvenio) || 330,
        modalidad: "Remota",
        area: areaNombre,
        puesto: `Practicante ${esProfesional ? "Profesional" : "Pre-Profesional"} de ${areaNombre}`,
        subvencion: "Formativa / Asignación acordada",
        seguroFola: "Póliza RIMAC Seguros N° 4580-2026 / Cobertura FOLA"
      },
      suscripcion: {
        ciudad: "Lima",
        fecha: today()
      },
      version: 1,
      observaciones: [],
      firma: null,
      credenciales: null,
      historial: [
        {
          fecha: today() + " " + new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
          accion: "Solicitud generada",
          detalle: `Expediente documental validado. Se inicia preparación de convenio con código provisional ${codProvisional}.`
        }
      ]
    };

    convenios.push(sol);
    localStorage.setItem("th_convenios_v1", JSON.stringify(convenios));
  }

  localStorage.setItem("th_convenio_activo_id", sol.idSolicitud);

  // Navegar al módulo Convenios de forma segura
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ action: "navigate", hash: "convenios" }, "*");
      try { window.parent.location.hash = "convenios"; } catch (errNav) { }
    } else {
      window.location.href = "../gestion de convenios/GestionConvenios.html?solicitud=" + sol.idSolicitud;
    }
  } catch (eNav) {
    window.location.href = "../gestion de convenios/GestionConvenios.html?solicitud=" + sol.idSolicitud;
  }
}

function openDetail(id) {
  currentId = id;
  const errorEl = $("#detailError");
  if (errorEl) errorEl.textContent = "";

  const e = read().find((x) => x.expedienteId === id);
  const p = obtenerColaboradores().find((x) => x.idColaborador === id || (e && x.numeroDocumento === e.numeroDocumento));

  if (!e && !p) throw Error("El registro ya no está disponible.");

  const titleEl = $("#detailTitle");
  if (titleEl) titleEl.textContent = name(e ?? p);

  const eyebrowEl = $("#detailEyebrow");
  const bodyEl = $("#detailBody");
  if (!bodyEl) return;

  if (tab === "review" || (!p && e)) {
    const codProvisional = e.codigoProvisional || `${e.nombres}_${e.apellidoPaterno}.Prueba`;
    if (eyebrowEl) eyebrowEl.textContent = "REVISIÓN DOCUMENTAL · PERIODO DE PRUEBA CULMINADO";

    const allDocsAceptados = documents.every(([key]) => e.documentos[key]?.estado === "Aceptado");
    const horasOk = horasValidas(e.horasConvenio);
    const est = pendingState(e); // Únicamente "Pendiente" o "Validado"
    const estaValidado = est === "Validado";
    const readyToValidate = allDocsAceptados && horasOk;
    const solExistente = consultarConvenio(e.idColaborador || `COL-${e.expedienteId}`);
    const hasObs = tieneObservaciones(e);
    const obsList = hasObs ? obtenerObservaciones(e) : [];

    const obsBanner = hasObs
      ? `<div class="callout callout-warning" style="background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #f59e0b;padding:12px 14px;border-radius:8px;margin:14px 0;">
          <strong style="color:#b45309;display:flex;align-items:center;gap:6px;">
            <span>⚠️</span> Observaciones por corregir (Estado: Pendiente)
          </strong>
          <ul style="margin:8px 0 0;padding-left:20px;color:#92400e;font-size:12.5px;">
            ${obsList.map((obs) => `<li>${escape(obs)}</li>`).join("")}
          </ul>
        </div>`
      : "";

    bodyEl.innerHTML = `
      <div class="provisional-banner" style="background:#fffbeb;border:1px solid #fde68a;padding:10px 14px;border-radius:8px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div>
          <strong style="color:#92400e;">Código provisional:</strong>
          <span class="badge" style="background:#fef3c7;color:#b45309;font-weight:700;">${escape(codProvisional)}</span>
          <small style="color:#78350f;margin-left:8px;">(Se conserva hasta completar la entrega del convenio firmado)</small>
        </div>
        <div>
          <span class="badge ${estaValidado ? "green" : ""}" style="font-size:12px;">Estado: ${escape(est)}</span>
        </div>
      </div>
      ${obsBanner}
      ${dataList(e)}
      ${!horasOk ? '<p class="error">Las horas acordadas declaradas deben ser de al menos 330 h para continuar.</p>' : ""}
      <h3>Expediente documental recibido</h3>
      ${documentTable(e.documentos, true)}
      <p class="hint">
        La validación documental actualiza el resultado de revisión a <strong>Validado</strong> y traslada al colaborador a la pestaña Colaboradores manteniendo el código provisional <strong>${escape(codProvisional)}</strong>.
      </p>
      <footer class="dialog-actions">
        ${estaValidado
          ? `<button type="button" class="primary" id="btnIrAConveniosDirecto" data-expediente="${escape(e.expedienteId)}">${solExistente ? "Gestionar convenio en Convenios →" : "Preparar convenio →"}</button>`
          : `<button type="button" id="btnAprobarValidacion" class="primary" ${readyToValidate ? "" : "disabled"} title="${readyToValidate ? "Aprobar validación y trasladar a Colaboradores" : "Acepta todos los documentos obligatorios y horas mínimas (330h) para validar"}">Validar expediente documental</button>`
        }
      </footer>
    `;
  } else {
    // Vista de Colaborador formalizado o validado
    const targetColab = p ?? e;
    const f = targetColab.fichaTalento || fichaFor(targetColab);
    const periods = f.periodos ?? [];
    const period = periods.at(-1);
    const conv = consultarConvenio(targetColab.idColaborador, period?.id);
    const esFirmado = conv ? (conv.estado === "Convenio firmado" || conv.estado === "Firmado") : Boolean(period?.firma);
    const estadoConv = esFirmado ? "Convenio firmado" : conv ? conv.estado : "Pendiente de formalización";
    const fechaFirmaConv = conv?.firma?.fechaFirma || period?.firma;
    const codigoDefinitivo = targetColab.codigoColaborador || conv?.codigoColaborador;

    if (eyebrowEl) {
      eyebrowEl.textContent = esFirmado
        ? `${targetColab.idColaborador} · CÓDIGO DEFINITIVO ${codigoDefinitivo || "ASIGNADO"}`
        : `${targetColab.idColaborador} · CÓDIGO PROVISIONAL ${targetColab.codigoProvisional || `${targetColab.nombres}_${targetColab.apellidoPaterno}.Prueba`}`;
    }

    bodyEl.innerHTML = `
      <div class="detail-tabs">
        <button type="button" data-section="general" aria-pressed="true">Datos generales</button>
        <button type="button" data-section="documents" aria-pressed="false">Expediente</button>
        <button type="button" data-section="periods" aria-pressed="false">Convenio e historial</button>
      </div>
      <section data-panel="general">
        ${dataList({ ...targetColab, ...f, horasConvenio: period?.meta ?? f.horasConvenio, inicioPrueba: period?.inicio ?? f.inicioPrueba, finPrevisto: period?.finPrevisto ?? f.finPrevisto })}
        <p><span class="badge green">Documentación Validada</span></p>
      </section>
      <section data-panel="documents" hidden>
        ${documentTable(f.documentos)}
      </section>
      <section data-panel="periods" hidden>
        <div class="agreement-consult-box">
          <h4>Convenio de Prácticas y Formalización</h4>
          <p><strong>Estado del convenio:</strong> <span class="badge ${esFirmado ? "green" : "orange"}">${escape(estadoConv)}</span></p>
          <p><strong>Código del colaborador:</strong> <strong style="color:#065f46;">${escape(codigoDefinitivo || targetColab.codigoProvisional || "Pendiente de firma")}</strong></p>
          <p><strong>Inicio de prácticas:</strong> ${escape(period?.inicio || f.inicioPrueba || "No informado")} · <strong>Fin previsto:</strong> ${escape(period?.finPrevisto || period?.fin || f.finPrevisto || "Por definir")}</p>
          <p><strong>Fecha de suscripción:</strong> ${escape(fechaFirmaConv || "Pendiente de formalización")} ${conv?.idConvenioFirmado ? `· <strong>Registro:</strong> ${escape(conv.idConvenioFirmado)}` : ""}</p>
          ${conv?.credenciales?.correo ? `<p><strong>Credenciales institucionales:</strong> <span style="color:#2563eb;font-weight:600;">${escape(conv.credenciales.correo)}</span></p>` : ""}
          ${conv?.firma?.archivoNombre ? `<p><strong>Documento firmado archivado:</strong> ${escape(conv.firma.archivoNombre)}</p>` : ""}
          <div style="margin-top:14px;">
            <button type="button" class="primary" id="btnIrAConvenios" data-colaborador="${escape(targetColab.idColaborador)}">
              ${esFirmado ? "Ver convenio en Convenios →" : "Generar convenio en Convenios →"}
            </button>
          </div>
        </div>
      </section>
    `;
  }

  const dialog = $("#detailDialog");
  if (dialog && !dialog.open) dialog.showModal();
}

/**
 * Previsualización de documentos adjuntos
 */
async function preview(key) {
  const e = read().find((x) => x.expedienteId === currentId);
  const p = obtenerColaboradores().find((x) => x.idColaborador === currentId || (e && x.numeroDocumento === e.numeroDocumento));
  const doc = (e?.documentos ?? p?.fichaTalento?.documentos)?.[key];

  if (!doc) throw Error("No existe el documento seleccionado.");

  const title = documents.find(([k]) => k === key)?.[1] || "Documento";
  const titleEl = $("#previewTitle");
  if (titleEl) titleEl.textContent = title;

  const previewBody = $("#previewBody");
  if (!previewBody) return;
  previewBody.replaceChildren();

  const src = new URL("../assets/documentos-ejemplo/" + key + ".pdf", location.href).href;
  const tools = document.createElement("div");
  tools.className = "preview-toolbar";
  const note = document.createElement("span");
  note.textContent = doc.demo ? "Documento de ejemplo · datos ficticios de verificación" : doc.nombre;
  const link = document.createElement("a");
  link.href = src;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "Abrir documento ↗";
  tools.append(note, link);
  previewBody.append(tools);

  const view = document.createElement("iframe");
  view.src = src;
  view.title = title;
  view.style.width = "100%";
  view.style.height = "480px";
  previewBody.append(view);

  const previewDlg = $("#previewDialog");
  if (previewDlg) previewDlg.showModal();
}

/**
 * Validar expediente documental conservando código provisional y trasladar a Colaboradores
 */
function aprobarValidacionDocumental() {
  const entries = read();
  const e = entries.find((x) => x.expedienteId === currentId);
  if (!e) throw Error("No se encontró el expediente.");

  if (!canReview(e)) {
    throw Error("El periodo de prueba debe haber culminado y el formulario debe estar completo.");
  }
  if (!horasValidas(e.horasConvenio)) {
    throw Error("Las horas acordadas declaradas deben ser de al menos 330 horas.");
  }
  if (!documents.every(([key]) => e.documentos[key]?.estado === "Aceptado")) {
    throw Error("Debes aceptar los cuatro documentos obligatorios antes de aprobar la validación.");
  }

  // Conserva el código provisional y actualiza estado de revisión a Validado
  e.codigoProvisional = e.codigoProvisional || `${e.nombres}_${e.apellidoPaterno}.Prueba`;
  e.estadoRevision = "Validado";
  save(entries);

  // Trasladar a th_colaboradores para que aparezca en la pestaña Colaboradores
  const colabs = obtenerColaboradores();
  const idColab = e.idColaborador || `COL-${e.expedienteId}`;
  let colab = colabs.find((c) => c.idColaborador === idColab || c.numeroDocumento === e.numeroDocumento);

  const fichaCompleta = {
    marcaTemporal: e.marcaTemporal || today(),
    situacionPracticante: e.situacionPracticante || "Estudiante universitario",
    carrera: e.carrera || "Ingeniería de Sistemas",
    institucion: e.institucion || "Universidad Nacional Mayor de San Marcos",
    institucionTipo: e.institucionTipo || "Universidad",
    rucInstitucion: e.rucInstitucion || "20148092282",
    direccionInstitucion: e.direccionInstitucion || "Av. Carlos Germán Amézaga 375, Lima",
    representanteNombre: e.representanteNombre || "Dr. Walter Arana Mendoza",
    representanteDocumento: e.representanteDocumento || "DNI 08432190",
    representanteCargo: e.representanteCargo || "Director de Escuela Profesional",
    nacimiento: e.nacimiento || "2003-05-18",
    nacionalidad: e.nacionalidad || "Peruana",
    direccion: e.direccion || "Calle Las Begonias 320, San Isidro, Lima",
    correo: e.correo || `${e.nombres.toLowerCase()}.${e.apellidoPaterno.toLowerCase()}@devdatep.com`,
    telefono: e.telefono || "987654320",
    inicioPrueba: e.inicioPrueba,
    finPrueba: e.finPrueba,
    horasConvenio: e.horasConvenio,
    finPrevisto: e.finPrevisto,
    documentos: e.documentos,
    estadoRevision: "Validado",
    periodos: [
      {
        id: `PER-${e.expedienteId}`,
        inicio: e.inicioPrueba,
        finPrevisto: e.finPrevisto || e.finPrueba,
        meta: e.horasConvenio,
        horarioSemanal: e.horarioSemanal || JORNADA_BASE,
        firma: null
      }
    ]
  };

  if (!colab) {
    colabs.push({
      idColaborador: idColab,
      codigoColaborador: null,
      codigoProvisional: e.codigoProvisional,
      tipoDocumento: e.tipoDocumento || "DNI",
      numeroDocumento: e.numeroDocumento,
      nombres: e.nombres,
      apellidoPaterno: e.apellidoPaterno,
      apellidoMaterno: e.apellidoMaterno,
      tipoColaborador: "Practicante",
      correo: e.correo || `${e.nombres.toLowerCase()}.${e.apellidoPaterno.toLowerCase()}@devdatep.com`,
      telefono: e.telefono || "987654320",
      idDepartamento: e.idDepartamento,
      idArea: e.idArea,
      idSubArea: e.idSubArea || null,
      idRol: e.idRol || "ROL-005",
      foto: null,
      fechaIngreso: e.inicioPrueba || today(),
      fechaSalida: null,
      estado: "Activo",
      estadoRevision: "Validado",
      fichaTalento: fichaCompleta
    });
  } else {
    colab.codigoProvisional = e.codigoProvisional;
    colab.estadoRevision = "Validado";
    colab.fichaTalento = { ...(colab.fichaTalento || {}), ...fichaCompleta };
  }
  guardarColaboradores(colabs);

  render();
  notice(`Expediente de ${name(e)} validado con éxito. Se traslada a Colaboradores con código provisional ${e.codigoProvisional}.`);
  changeTab("active");
  openDetail(idColab);
}

/**
 * Registro de Event Listeners único
 */
function registrarEventos() {
  if (listenersRegistered) return;
  listenersRegistered = true;

  // Delegación de eventos en modal de detalle
  $("#detailBody")?.addEventListener("click", async (event) => {
    const b = event.target.closest("button");
    if (!b) return;

    try {
      const errEl = $("#detailError");
      if (errEl) errEl.textContent = "";

      // Abrir o preparar convenio en módulo Convenios
      if (b.id === "btnIrAConveniosDirecto") {
        const expId = b.dataset.expediente;
        $("#detailDialog")?.close();
        abrirOPrepararConvenio(expId);
        return;
      }

      if (b.id === "btnIrAConvenios") {
        const colabId = b.dataset.colaborador;
        $("#detailDialog")?.close();
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ action: "navigate", hash: "convenios" }, "*");
          try { window.parent.location.hash = "convenios"; } catch (errNav) { }
        } else {
          window.location.href = "../gestion de convenios/GestionConvenios.html";
        }
        return;
      }

      // Previsualizar documento adjunto
      if (b.dataset.preview) {
        await preview(b.dataset.preview);
        return;
      }

      // Pestañas de detalle
      if (b.dataset.section) {
        b.parentElement?.querySelectorAll("[data-section]").forEach((tabBtn) => tabBtn.setAttribute("aria-pressed", String(tabBtn === b)));
        document.querySelectorAll("[data-panel]").forEach((panel) => {
          panel.hidden = panel.dataset.panel !== b.dataset.section;
        });
        return;
      }

      // Aceptar u Observar documento
      if (b.dataset.document) {
        const entries = read();
        const e = entries.find((x) => x.expedienteId === currentId);
        if (!e) throw Error("El expediente ya no está disponible.");

        const motivo = ($("#reason_" + b.dataset.document)?.value || "").trim();
        if (b.dataset.decision === "Observado" && !motivo) {
          throw Error("Describe qué información debe corregirse para que el practicante pueda subsanarlo.");
        }

        e.documentos[b.dataset.document] = {
          ...e.documentos[b.dataset.document],
          estado: b.dataset.decision,
          motivo: b.dataset.decision === "Observado" ? motivo : "",
          fechaRevision: today()
        };

        // Si se observó un documento, el estado de revisión se mantiene como "Pendiente"
        if (b.dataset.decision === "Observado") {
          e.estadoRevision = "Pendiente";
        }

        save(entries);
        render();
        openDetail(currentId);
        return;
      }

      // Botón Aprobar Validación Documental
      if (b.id === "btnAprobarValidacion") {
        aprobarValidacionDocumental();
        return;
      }
    } catch (error) {
      const errEl = $("#detailError");
      if (errEl) errEl.textContent = error.message;
    }
  });

  // Eventos de interfaz general
  document.addEventListener("click", (event) => {
    const b = event.target.closest("button");
    if (!b) return;
    try {
      if (b.dataset.close) {
        const dlg = $("#" + b.dataset.close);
        if (dlg) dlg.close();
      }
      if (b.dataset.tab) changeTab(b.dataset.tab);
      if (b.dataset.detail) openDetail(b.dataset.detail);
    } catch (error) {
      notice(error.message, true);
    }
  });

  ["#search", "#department", "#stateFilter"].forEach((selector) => {
    const el = $(selector);
    if (el) {
      el.addEventListener(selector === "#search" ? "input" : "change", () => {
        try { render(); } catch (error) { notice(error.message, true); }
      });
    }
  });

  window.addEventListener("storage", (event) => {
    if ([KEY, "th_colaboradores", "th_convenios_v1"].includes(event.key) || event.key === null) {
      try {
        render();
        const dlg = $("#detailDialog");
        if (dlg && dlg.open && currentId) openDetail(currentId);
      } catch (error) {
        notice(error.message, true);
      }
    }
  });
}

/**
 * Cargar expedientes ficticios de demostración de postulantes que culminaron prueba
 */
function cargarExpedientesDemostracion() {
  const existentes = read();
  const fecha = today();
  const fin = new Date(fecha + "T12:00:00Z");
  fin.setUTCDate(fin.getUTCDate() - 5);
  const finStr = fin.toISOString().slice(0, 10);

  const casos = [
    { clave: "001", nombres: "Camila", apellidoPaterno: "Salazar", apellidoMaterno: "Vega", idDepartamento: "DEP-001", idArea: "ARE-002", horas: 330, estadoRevision: "Pendiente", institucion: "Universidad Nacional Mayor de San Marcos", carrera: "Psicología Organizacional", direccion: "Av. Brasil 1420, Jesús María, Lima" },
    { clave: "002", nombres: "Andrés", apellidoPaterno: "Molina", apellidoMaterno: "Paz", idDepartamento: "DEP-002", idArea: "ARE-004", horas: 350, estadoRevision: "Validado", aceptadoPrevio: true, institucion: "Universidad Nacional Mayor de San Marcos", carrera: "Ingeniería de Sistemas", direccion: "Calle Las Begonias 320, San Isidro, Lima" },
    { clave: "003", nombres: "Renata", apellidoPaterno: "Delgado", apellidoMaterno: "Ruiz", idDepartamento: "DEP-003", idArea: "ARE-010", horas: 330, estadoRevision: "Pendiente", observado: "foto", motivoObservacion: "La fotografía no tiene fondo blanco. Se solicita una nueva imagen formal.", institucionTipo: "Instituto de Educación Superior", institucion: "Toulouse Lautrec", carrera: "Diseño Gráfico Publicitario", direccion: "Av. Javier Prado Este 2450, San Borja, Lima" },
    { clave: "004", nombres: "Sebastián", apellidoPaterno: "Castro", apellidoMaterno: "León", idDepartamento: "DEP-002", idArea: "ARE-005", horas: 340, estadoRevision: "Pendiente", todosAceptados: true, institucion: "Universidad Nacional de Ingeniería", carrera: "Ciencia de la Computación", direccion: "Jr. Huiracocha 1845, Jesús María, Lima" },
    { clave: "005", nombres: "Mateo Ignacio", apellidoPaterno: "Alvarado", apellidoMaterno: "Paredes", idDepartamento: "DEP-002", idArea: "ARE-006", horas: 360, estadoRevision: "Pendiente", docsAceptados: ["copia", "recibo"], institucion: "Universidad Peruana de Ciencias Aplicadas", carrera: "Ingeniería de Software", direccion: "Av. La Marina 1840, San Miguel, Lima", rucInstitucion: "20211617747", direccionInstitucion: "Prolongación Primavera 2390, Monterrico, Lima", representanteNombre: "Mg. Jorge Luis Ramos", representanteDocumento: "DNI 09847120", representanteCargo: "Director de Escuela Profesional" },
    { clave: "006", nombres: "Valeria Sofía", apellidoPaterno: "Quispe", apellidoMaterno: "Morales", idDepartamento: "DEP-001", idArea: "ARE-001", horas: 330, estadoRevision: "Pendiente", observado: "copia", motivoObservacion: "La copia del documento de identidad es ilegible en el reverso. Adjuntar escaneo nítido.", docsAceptados: ["recibo", "firma", "foto"], institucion: "Pontificia Universidad Católica del Perú", carrera: "Psicología Organizacional", direccion: "Calle Berlín 450, Miraflores, Lima", rucInstitucion: "20155945860", direccionInstitucion: "Av. Universitaria 1801, San Miguel, Lima", representanteNombre: "Dra. Patricia Villanueva Casas", representanteDocumento: "DNI 10293847", representanteCargo: "Coordinadora de Prácticas Preprofesionales" },
    { clave: "007", nombres: "Diego Alonso", apellidoPaterno: "Navarro", apellidoMaterno: "Chávez", idDepartamento: "DEP-002", idArea: "ARE-004", horas: 350, estadoRevision: "Pendiente", institucion: "Universidad Nacional de Ingeniería", carrera: "Ingeniería de Sistemas", direccion: "Jr. Huáscar 1240, Jesús María, Lima", rucInstitucion: "20169004359", direccionInstitucion: "Av. Túpac Amaru 210, Rímac, Lima", representanteNombre: "Dr. Carlos Mendoza Silva", representanteDocumento: "DNI 07182934", representanteCargo: "Decano de la Facultad de Ingeniería" },
    { clave: "008", nombres: "Luciana Belén", apellidoPaterno: "Herrera", apellidoMaterno: "Gutiérrez", idDepartamento: "DEP-003", idArea: "ARE-012", horas: 330, estadoRevision: "Pendiente", observado: "recibo", motivoObservacion: "El recibo de servicios públicos tiene más de dos meses de antigüedad; adjuntar recibo del mes en curso.", docsAceptados: ["copia", "firma"], institucion: "Universidad de Lima", carrera: "Marketing y Gestión Comercial", direccion: "Calle Las Dalias 315, Surco, Lima", rucInstitucion: "20131343714", direccionInstitucion: "Av. Javier Prado Este 4600, Santiago de Surco, Lima", representanteNombre: "Lic. Carmen Rosa Medina", representanteDocumento: "DNI 08234719", representanteCargo: "Jefa de Prácticas y Empleabilidad" },
    { clave: "009", nombres: "Gabriel Alejandro", apellidoPaterno: "Espinoza", apellidoMaterno: "Flores", idDepartamento: "DEP-002", idArea: "ARE-007", horas: 340, estadoRevision: "Pendiente", todosAceptados: true, institucion: "Universidad Tecnológica del Perú", carrera: "Ingeniería de Sistemas e Informática", direccion: "Av. Arequipa 2980, San Isidro, Lima", rucInstitucion: "20469951680", direccionInstitucion: "Av. Natalio Sánchez 125, Jesús María, Lima", representanteNombre: "Ing. Roberto Seminario Paz", representanteDocumento: "DNI 09384756", representanteCargo: "Director Académico de Campus" },
    { clave: "010", nombres: "Ariana Marcela", apellidoPaterno: "Cárdenas", apellidoMaterno: "Soto", idDepartamento: "DEP-002", idArea: "ARE-008", horas: 330, estadoRevision: "Pendiente", institucionTipo: "Instituto Superior Tecnológico", institucion: "TECSUP", carrera: "Diseño y Desarrollo de Software", direccion: "Calle Los Cedros 210, Magdalena del Mar, Lima", rucInstitucion: "20138656785", direccionInstitucion: "Av. Cascanueces 2221, Santa Anita, Lima", representanteNombre: "Ing. Miguel Ángel Benites", representanteDocumento: "DNI 08192837", representanteCargo: "Jefe de Departamento de Tecnologías Digitales" },
    { clave: "011", nombres: "Joaquín Ernesto", apellidoPaterno: "Mendoza", apellidoMaterno: "Vidal", idDepartamento: "DEP-002", idArea: "ARE-009", horas: 360, estadoRevision: "Pendiente", observado: "firma", motivoObservacion: "La firma digital no coincide con el trazo del DNI adjunto o carece de nitidez.", docsAceptados: ["copia", "recibo", "foto"], institucion: "Universidad San Ignacio de Loyola", carrera: "Ingeniería de Software", direccion: "Calle Alcanfores 580, Miraflores, Lima", rucInstitucion: "20297868790", direccionInstitucion: "Av. La Fontana 550, La Molina, Lima", representanteNombre: "Dra. Elena Cornejo Tapia", representanteDocumento: "DNI 10492837", representanteCargo: "Decana de Facultad de Ingeniería" },
    { clave: "012", nombres: "Claudia Ximena", apellidoPaterno: "Paredes", apellidoMaterno: "Ramos", idDepartamento: "DEP-001", idArea: "ARE-003", horas: 330, estadoRevision: "Pendiente", docsAceptados: ["copia", "foto"], institucion: "Universidad Nacional Mayor de San Marcos", carrera: "Administración de Recursos Humanos", direccion: "Jr. Capac Yupanqui 980, Lince, Lima", rucInstitucion: "20148092282", direccionInstitucion: "Av. Carlos Germán Amézaga 375, Lima", representanteNombre: "Dr. Walter Arana Mendoza", representanteDocumento: "DNI 08432190", representanteCargo: "Director de Escuela Profesional" },
    { clave: "013", nombres: "Rodrigo Franco", apellidoPaterno: "Bustamante", apellidoMaterno: "Carrillo", idDepartamento: "DEP-003", idArea: "ARE-010", idSubArea: "SUB-001", horas: 350, estadoRevision: "Pendiente", institucion: "Universidad Peruana de Ciencias Aplicadas", carrera: "Comunicación y Producción Audiovisual", direccion: "Av. Benavides 2450, Miraflores, Lima", rucInstitucion: "20211617747", direccionInstitucion: "Prolongación Primavera 2390, Monterrico, Lima", representanteNombre: "Lic. Fernando Solano Díaz", representanteDocumento: "DNI 07382910", representanteCargo: "Director de Carrera Audiovisual" },
    { clave: "014", nombres: "María Fernanda", apellidoPaterno: "Villanueva", apellidoMaterno: "Córdova", idDepartamento: "DEP-002", idArea: "ARE-005", horas: 340, estadoRevision: "Pendiente", docsAceptados: ["copia", "recibo", "firma"], institucion: "Universidad Científica del Sur", carrera: "Ingeniería de Sistemas Empresariales", direccion: "Av. Paseo de la República 5540, Miraflores, Lima", rucInstitucion: "20427386835", direccionInstitucion: "Carretera Panamericana Sur Km 19, Villa El Salvador, Lima", representanteNombre: "Ing. Gonzalo Cáceres Medina", representanteDocumento: "DNI 09283746", representanteCargo: "Director Académico de Ingeniería" },
    { clave: "015", nombres: "Franco Javier", apellidoPaterno: "Tapia", apellidoMaterno: "Benítez", idDepartamento: "DEP-002", idArea: "ARE-004", horas: 350, estadoRevision: "Pendiente", docsAceptados: ["copia"], institucion: "Universidad de Piura", carrera: "Ingeniería Informática", direccion: "Calle Chinchón 890, San Isidro, Lima", rucInstitucion: "20136934869", direccionInstitucion: "Calle Mártir José Olaya 162, Miraflores, Lima", representanteNombre: "Dra. Mónica Saldaña Cruz", representanteDocumento: "DNI 10394857", representanteCargo: "Directora de Estudios" },
    { clave: "016", nombres: "Andrea Nicole", apellidoPaterno: "Zevallos", apellidoMaterno: "Ramos", idDepartamento: "DEP-001", idArea: "ARE-001", horas: 330, estadoRevision: "Pendiente", observado: "foto", motivoObservacion: "La fotografía adjunta no cumple con el fondo blanco reglamentario ni vestimenta formal.", docsAceptados: ["copia", "recibo", "firma"], institucion: "Universidad de San Martín de Porres", carrera: "Gestión de Recursos Humanos", direccion: "Av. La Encalada 650, Surco, Lima", rucInstitucion: "20139940126", direccionInstitucion: "Jr. Las Calandrias 151, Santa Anita, Lima", representanteNombre: "Dr. Daniel Valdivia Ruiz", representanteDocumento: "DNI 08912345", representanteCargo: "Director de Escuela Profesional" }
  ];

  let huboCambios = false;

  for (const caso of casos) {
    const expedienteId = "demo-recepcion-v1-" + caso.clave;
    const numeroDocumento = "TH-DEMO-" + caso.clave;

    let e = existentes.find((x) => x.expedienteId === expedienteId || x.numeroDocumento === numeroDocumento);
    if (!e) {
      const docsObj = Object.fromEntries(
        documents.map(([k, tit]) => {
          let estado = "Pendiente";
          let motivo = "";

          if (caso.aceptadoPrevio || caso.todosAceptados || caso.clave === "004") {
            estado = "Aceptado";
          } else if (caso.observado === k) {
            estado = "Observado";
            motivo = caso.motivoObservacion || "Documento observado. Se solicita corrección y reenvío.";
          } else if (Array.isArray(caso.docsAceptados) && caso.docsAceptados.includes(k)) {
            estado = "Aceptado";
          }

          return [
            k,
            {
              nombre: `${tit} · muestra formal`,
              demo: true,
              estado,
              motivo
            }
          ];
        })
      );

      const codProv = `${caso.nombres}_${caso.apellidoPaterno}.Prueba`;

      existentes.push({
        expedienteId: expedienteId,
        idColaborador: "COL-EXP-" + caso.clave,
        codigoProvisional: codProv,
        codigoColaborador: null,
        nombres: caso.nombres,
        apellidoPaterno: caso.apellidoPaterno,
        apellidoMaterno: caso.apellidoMaterno,
        tipoDocumento: caso.tipoDocumento || "DNI",
        numeroDocumento: numeroDocumento,
        nacimiento: caso.nacimiento || "2003-05-18",
        nacionalidad: caso.nacionalidad || "Peruana",
        direccion: caso.direccion || "Calle Las Begonias 320, San Isidro, Lima",
        correo: caso.correo || `expediente-${caso.clave}@example.test`,
        telefono: caso.telefono || ("9876543" + caso.clave.slice(-2)),
        tipoColaborador: "Practicante",
        situacionPracticante: caso.situacionPracticante || "Estudiante universitario",
        institucionTipo: caso.institucionTipo || "Universidad",
        institucion: caso.institucion || "Universidad Nacional Mayor de San Marcos",
        rucInstitucion: caso.rucInstitucion || "20148092282",
        direccionInstitucion: caso.direccionInstitucion || "Av. Carlos Germán Amézaga 375, Lima",
        representanteNombre: caso.representanteNombre || "Dr. Walter Arana Mendoza",
        representanteDocumento: caso.representanteDocumento || "DNI 08432190",
        representanteCargo: caso.representanteCargo || "Director de Escuela Profesional",
        carrera: caso.carrera || "Ingeniería de Sistemas",
        idDepartamento: caso.idDepartamento,
        idArea: caso.idArea,
        idSubArea: caso.idSubArea || null,
        idRol: "ROL-005",
        inicioPrueba: caso.inicioPrueba || new Date(fin.getTime() - 90 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        finPrueba: finStr,
        fechaIngreso: fecha,
        horasConvenio: caso.horas,
        formularioCompleto: true,
        estadoRevision: caso.aceptadoPrevio ? "Validado" : "Pendiente",
        documentos: docsObj
      });
      huboCambios = true;
    } else {
      // Normalizar registros ya guardados: reemplazar Con observaciones / Por revisar / Por validar por Pendiente
      const norm = normalizarEstadoRevision(e.estadoRevision);
      if (e.estadoRevision !== norm) {
        e.estadoRevision = norm;
        huboCambios = true;
      }
      if (!e.codigoProvisional) {
        e.codigoProvisional = `${e.nombres}_${e.apellidoPaterno}.Prueba`;
        huboCambios = true;
      }
      if (e.finPrueba >= today()) {
        e.finPrueba = finStr;
        huboCambios = true;
      }
      // Actualizar horas acordadas si estuviesen debajo del mínimo
      if (caso.horas >= HORAS_MINIMAS && (!e.horasConvenio || e.horasConvenio < HORAS_MINIMAS)) {
        e.horasConvenio = caso.horas;
        huboCambios = true;
      }
    }
  }

  // Regularizar que Andrés esté en th_colaboradores si está validado
  const colabs = obtenerColaboradores();
  const andresExp = existentes.find((x) => x.expedienteId === "demo-recepcion-v1-002");
  if (andresExp && andresExp.estadoRevision === "Validado") {
    let colabAndres = colabs.find((c) => c.numeroDocumento === andresExp.numeroDocumento);
    if (!colabAndres) {
      colabs.push({
        idColaborador: "COL-EXP-002",
        codigoColaborador: null,
        codigoProvisional: "Andres_Molina.Prueba",
        tipoDocumento: "DNI",
        numeroDocumento: andresExp.numeroDocumento,
        nombres: "Andrés",
        apellidoPaterno: "Molina",
        apellidoMaterno: "Paz",
        tipoColaborador: "Practicante",
        correo: "andres.molina@devdatep.com",
        telefono: "987654320",
        idDepartamento: "DEP-002",
        idArea: "ARE-004",
        idSubArea: null,
        idRol: "ROL-005",
        foto: null,
        fechaIngreso: andresExp.inicioPrueba || today(),
        fechaSalida: null,
        estado: "Activo",
        estadoRevision: "Validado",
        fichaTalento: {
          marcaTemporal: andresExp.marcaTemporal || today(),
          situacionPracticante: "Estudiante universitario",
          carrera: "Ingeniería de Sistemas",
          institucion: "Universidad Nacional Mayor de San Marcos",
          horasConvenio: 350,
          documentos: andresExp.documentos,
          estadoRevision: "Validado",
          periodos: [
            {
              id: "PER-demo-recepcion-v1-002",
              inicio: andresExp.inicioPrueba,
              finPrevisto: andresExp.finPrevisto || andresExp.finPrueba,
              meta: 350,
              horarioSemanal: JORNADA_BASE,
              firma: null
            }
          ]
        }
      });
      guardarColaboradores(colabs);
    }
  }

  if (huboCambios) {
    save(existentes);
  }
}

// Inicialización controlada (ejecución única)
function init() {
  if (isInitialized) return;
  isInitialized = true;

  const depSelect = $("#department");
  if (depSelect) depSelect.innerHTML = opts(departamentos, "idDepartamento", "", "Todos los departamentos");

  cargarExpedientesDemostracion();
  registrarEventos();

  // Soporte para abrir pestaña directamente desde hash (#active, #review, #reentry) o query string (?tab=active)
  const validTabs = ["review", "active", "reentry"];
  const hashTab = (location.hash ? location.hash.slice(1) : "").toLowerCase();
  const queryTab = (new URLSearchParams(location.search).get("tab") || "").toLowerCase();
  const initialTab = validTabs.includes(hashTab) ? hashTab : (validTabs.includes(queryTab) ? queryTab : "review");

  changeTab(initialTab);

  window.addEventListener("hashchange", () => {
    const nextTab = (location.hash ? location.hash.slice(1) : "").toLowerCase();
    if (validTabs.includes(nextTab)) {
      changeTab(nextTab);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
