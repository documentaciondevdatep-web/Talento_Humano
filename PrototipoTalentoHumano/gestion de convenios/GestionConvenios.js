"use strict";

/**
 * ==========================================================================
 * DEVDATEP CONSULTING - GESTIÓN DE CONVENIOS DE PRÁCTICAS
 * Lógica principal del módulo · Prototipo Talento Humano
 * Compatible con protocolo file:// y entornos web estándar sin dependencias de importación externa.
 * ==========================================================================
 */

const CATALOGO_AREAS = [
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

const CATALOGO_DEPARTAMENTOS = [
  { idDepartamento: "DEP-001", nombre: "Talento Humano" },
  { idDepartamento: "DEP-002", nombre: "Desarrollo Web" },
  { idDepartamento: "DEP-003", nombre: "Comercial" }
];

function obtenerColaboradores() {
  try {
    const raw = localStorage.getItem("th_colaboradores");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("No se pudo leer th_colaboradores:", e);
  }
  return [];
}

function guardarColaboradores(colaboradores) {
  try {
    localStorage.setItem("th_colaboradores", JSON.stringify(colaboradores));
    window.dispatchEvent(new CustomEvent("colaboradoresActualizados", {
      detail: { origen: "convenios", tipoOperacion: "actualizacion" }
    }));
  } catch (e) {
    console.warn("No se pudo guardar th_colaboradores:", e);
  }
}

const STORAGE_KEY_CONVENIOS = "th_convenios_v1";

// Datos institucionales base de Devdatep Consulting
const EMPRESA_BASE = {
  razonSocial: "DEVDATEP CONSULTING S.A.C.",
  ruc: "20608512345",
  domicilio: "Av. Manuel Olguín 335, Of. 1202, Santiago de Surco, Lima, Perú",
  actividad: "Servicios de Consultoría Tecnológica, Desarrollo de Software y Sistemas de Información",
  representante: "Christian Alexis Mendoza Portocarrero",
  cargoRep: "Gerente General",
  docRep: "DNI 45892134"
};

/**
 * Datos iniciales ficticios completos para demostración y verificación del flujo
 */
const DEFAULT_CONVENIOS = [
  // 1. Solicitud en "Pendiente de preparación" con código provisional
  {
    idSolicitud: "SOL-2026-001",
    idColaborador: "COL-008",
    codigoColaborador: "Zoe_Mora.Prueba",
    codigoProvisional: "Zoe_Mora.Prueba",
    nombreColaborador: "Zoe Mora Campos",
    numeroDocumento: "00000008",
    tipoDocumento: "DNI",
    idArea: "ARE-005",
    area: "Frontend",
    idPeriodo: "PER-2026-008",
    fechaSolicitud: "2026-11-12",
    estado: "Pendiente de preparación",
    plantilla: "pre-profesional",
    empresa: { ...EMPRESA_BASE },
    institucion: {
      razonSocial: "Universidad Nacional Mayor de San Marcos",
      ruc: "20148092282",
      domicilio: "Av. Carlos Germán Amézaga 375, Lima",
      representante: "Dr. Walter Arana Mendoza",
      cargoRep: "Director de Escuela Profesional de Ingeniería de Sistemas",
      docRep: "DNI 08432190"
    },
    practicante: {
      nombreCompleto: "Zoe Mora Campos",
      documento: "00000008",
      tipoDocumento: "DNI",
      nacionalidad: "Peruana",
      nacimiento: "2003-03-14",
      sexo: "Femenino",
      domicilio: "Calle Los Pinos 420, Dpto 301, San Miguel, Lima",
      situacionAcademica: "Estudiante universitario",
      especialidad: "Ingeniería de Software"
    },
    condiciones: {
      fechaInicio: "2026-11-16",
      fechaFin: "2027-02-26",
      duracion: "3 meses y medio (70 días hábiles)",
      diasHorario: "Lunes a Viernes de 09:00 a 14:00 (5 horas diarias)",
      horasAcordadas: 350,
      modalidad: "Remota",
      area: "Frontend",
      puesto: "Practicante Pre-Profesional de Desarrollo Frontend",
      subvencion: "Formativa / Asignación acordada",
      seguroFola: "Póliza RIMAC Seguros N° 4580-2026 / Cobertura FOLA"
    },
    suscripcion: {
      ciudad: "Lima",
      fecha: "2026-11-18"
    },
    version: 1,
    observaciones: [],
    firma: null,
    credenciales: null,
    historial: [
      {
        fecha: "2026-11-12 09:30",
        accion: "Solicitud generada",
        detalle: "El colaborador completó su periodo de prueba satisfactoriamente. Expediente validado documentalmente; código provisional: Zoe_Mora.Prueba."
      }
    ]
  },

  // 2. Solicitud en "Pendiente de preparación" (en revisión de datos)
  {
    idSolicitud: "SOL-2026-002",
    idColaborador: "COL-012",
    codigoColaborador: "Mateo_Silva.Prueba",
    codigoProvisional: "Mateo_Silva.Prueba",
    nombreColaborador: "Mateo Silva Rivas",
    numeroDocumento: "00000012",
    tipoDocumento: "DNI",
    idArea: "ARE-004",
    area: "Backend",
    idPeriodo: "PER-2026-012",
    fechaSolicitud: "2026-11-08",
    estado: "Pendiente de preparación",
    plantilla: "pre-profesional",
    empresa: { ...EMPRESA_BASE },
    institucion: {
      razonSocial: "Universidad Tecnológica del Perú",
      ruc: "20428797893",
      domicilio: "Av. Arequipa 265, Lima",
      representante: "Ing. Rosa Huamán Pérez",
      cargoRep: "Coordinadora de Prácticas Pre-Profesionales",
      docRep: "DNI 10293847"
    },
    practicante: {
      nombreCompleto: "Mateo Silva Rivas",
      documento: "00000012",
      tipoDocumento: "DNI",
      nacionalidad: "Peruana",
      nacimiento: "2002-09-21",
      sexo: "Masculino",
      domicilio: "Av. Petit Thouars 1420, Lince, Lima",
      situacionAcademica: "Estudiante universitario",
      especialidad: "Ingeniería de Sistemas e Informática"
    },
    condiciones: {
      fechaInicio: "2026-11-10",
      fechaFin: "2027-02-18",
      duracion: "3 meses (66 días hábiles)",
      diasHorario: "Lunes a Viernes de 09:00 a 14:00 (5 horas diarias)",
      horasAcordadas: 330,
      modalidad: "Remota",
      area: "Backend",
      puesto: "Practicante Pre-Profesional de Desarrollo Backend",
      subvencion: "Formativa / Asignación acordada",
      seguroFola: "Póliza RIMAC Seguros N° 4580-2026 / Cobertura FOLA"
    },
    suscripcion: {
      ciudad: "Lima",
      fecha: "2026-11-18"
    },
    version: 1,
    observaciones: [],
    firma: null,
    credenciales: null,
    historial: [
      {
        fecha: "2026-11-08 11:15",
        accion: "Solicitud generada",
        detalle: "Periodo de prueba culminado. Se conserva código provisional Mateo_Silva.Prueba para la preparación de convenio."
      }
    ]
  },

  // 3. Solicitud en "Pendiente de firma" (documento final generado, listo para entrega y credenciales)
  {
    idSolicitud: "SOL-2026-003",
    idColaborador: "COL-009",
    codigoColaborador: "Diego_Ramos.Prueba",
    codigoProvisional: "Diego_Ramos.Prueba",
    nombreColaborador: "Diego Ramos Peralta",
    numeroDocumento: "00000009",
    tipoDocumento: "DNI",
    idArea: "ARE-002",
    area: "Capacitación",
    idPeriodo: "PER-2026-009",
    fechaSolicitud: "2026-11-04",
    estado: "Pendiente de firma",
    plantilla: "profesional",
    empresa: { ...EMPRESA_BASE },
    institucion: {
      razonSocial: "Pontificia Universidad Católica del Perú",
      ruc: "20155945860",
      domicilio: "Av. Universitaria 1801, San Miguel, Lima",
      representante: "Dra. Carmen Benítez Alva",
      cargoRep: "Decana de Facultad de Gestión y Alta Dirección",
      docRep: "DNI 09283741"
    },
    practicante: {
      nombreCompleto: "Diego Ramos Peralta",
      documento: "00000009",
      tipoDocumento: "DNI",
      nacionalidad: "Peruana",
      nacimiento: "2000-11-05",
      sexo: "Masculino",
      domicilio: "Av. Javier Prado Este 3250, San Borja, Lima",
      situacionAcademica: "Bachiller",
      especialidad: "Gestión de Recursos Humanos"
    },
    condiciones: {
      fechaInicio: "2026-11-05",
      fechaFin: "2027-05-14",
      duracion: "6 meses (132 días hábiles)",
      diasHorario: "Lunes a Viernes de 09:00 a 15:00 (6 horas diarias)",
      horasAcordadas: 720,
      modalidad: "Híbrida",
      area: "Capacitación",
      puesto: "Practicante Profesional de Gestión del Aprendizaje y Capacitación",
      subvencion: "Formativa / Asignación acordada",
      seguroFola: "Póliza RIMAC Seguros N° 4580-2026 / Cobertura FOLA"
    },
    suscripcion: {
      ciudad: "Lima",
      fecha: "2026-11-05"
    },
    version: 2,
    observaciones: [],
    firma: null,
    credenciales: null,
    historial: [
      { fecha: "2026-11-04 10:00", accion: "Solicitud generada", detalle: "Fin de prueba satisfactorio." },
      { fecha: "2026-11-06 14:30", accion: "Documento final generado", detalle: "Talento Humano revisó y generó la versión oficial para suscripción tripartita." }
    ]
  },

  // 4. Convenio Firmado y Vigente 1 (con código definitivo y credenciales formalizadas)
  {
    idSolicitud: "SOL-2026-004",
    idConvenioFirmado: "CONV-2026-001",
    idColaborador: "COL-006",
    codigoColaborador: "1108",
    codigoProvisional: "Lucia_Torres.Prueba",
    nombreColaborador: "Lucía Torres Benavides",
    numeroDocumento: "00000006",
    tipoDocumento: "DNI",
    idArea: "ARE-003",
    area: "Clima y Cultura",
    idPeriodo: "PER-2026-006",
    fechaSolicitud: "2026-10-15",
    estado: "Convenio firmado",
    plantilla: "pre-profesional",
    empresa: { ...EMPRESA_BASE },
    institucion: {
      razonSocial: "Universidad Peruana de Ciencias Aplicadas",
      ruc: "20211614741",
      domicilio: "Prolongación Primavera 2390, Monterrico, Santiago de Surco",
      representante: "Mg. Fernando Castro Morales",
      cargoRep: "Director de Carrera de Psicología y DO",
      docRep: "DNI 07123984"
    },
    practicante: {
      nombreCompleto: "Lucía Torres Benavides",
      documento: "00000006",
      tipoDocumento: "DNI",
      nacionalidad: "Peruana",
      nacimiento: "2002-04-18",
      sexo: "Femenino",
      domicilio: "Jr. Monterrey 180, Dpto 502, Chacarilla, Surco",
      situacionAcademica: "Estudiante universitario",
      especialidad: "Psicología Organizacional"
    },
    condiciones: {
      fechaInicio: "2026-10-20",
      fechaFin: "2027-02-15",
      duracion: "4 meses (84 días hábiles)",
      diasHorario: "Lunes a Viernes de 09:00 a 14:00 (5 horas diarias)",
      horasAcordadas: 420,
      modalidad: "Remota",
      area: "Clima y Cultura",
      puesto: "Practicante Pre-Profesional de Clima y Cultura Organizacional",
      subvencion: "Formativa / Asignación acordada",
      seguroFola: "Póliza RIMAC Seguros N° 4580-2026 / Cobertura FOLA"
    },
    suscripcion: {
      ciudad: "Lima",
      fecha: "2026-10-18"
    },
    version: 1,
    observaciones: [],
    firma: {
      fechaFirma: "2026-10-19",
      archivoNombre: "convenio_firmado_lucia_torres.pdf",
      notas: "Copia tripartita registrada y sellada por la universidad."
    },
    credenciales: {
      correo: "lucia.torres@devdatep.com",
      fechaEntrega: "2026-10-19",
      entregado: true
    },
    historial: [
      { fecha: "2026-10-15 08:30", accion: "Solicitud generada", detalle: "Periodo de prueba validado." },
      { fecha: "2026-10-17 11:00", accion: "Documento final generado", detalle: "Talento Humano preparó la versión final." },
      { fecha: "2026-10-19 16:30", accion: "Convenio firmado y formalizado", detalle: "Convenio recibido y entregado. Código definitivo asignado: 1108. Credenciales entregadas: lucia.torres@devdatep.com." }
    ]
  },

  // 5. Convenio Firmado y Vigente 2
  {
    idSolicitud: "SOL-2026-005",
    idConvenioFirmado: "CONV-2026-002",
    idColaborador: "COL-010",
    codigoColaborador: "1109",
    codigoProvisional: "Valeria_Rios.Prueba",
    nombreColaborador: "Valeria Ríos Mendoza",
    numeroDocumento: "00000010",
    tipoDocumento: "DNI",
    idArea: "ARE-008",
    area: "Diseño Web",
    idPeriodo: "PER-2026-010",
    fechaSolicitud: "2026-10-25",
    estado: "Convenio firmado",
    plantilla: "profesional",
    empresa: { ...EMPRESA_BASE },
    institucion: {
      razonSocial: "Toulouse Lautrec S.A.C.",
      ruc: "20131498175",
      domicilio: "Av. Primavera 970, Chacarilla, Surco, Lima",
      representante: "Lic. Miguel Ángel Dávila",
      cargoRep: "Coordinador de Escuela Digital y UX",
      docRep: "DNI 08912345"
    },
    practicante: {
      nombreCompleto: "Valeria Ríos Mendoza",
      documento: "00000010",
      tipoDocumento: "DNI",
      nacionalidad: "Peruana",
      nacimiento: "2001-08-12",
      sexo: "Femenino",
      domicilio: "Calle Grimaldo del Solar 245, Miraflores, Lima",
      situacionAcademica: "Bachiller",
      especialidad: "Diseño y Desarrollo Web"
    },
    condiciones: {
      fechaInicio: "2026-11-01",
      fechaFin: "2027-04-30",
      duracion: "6 meses (126 días hábiles)",
      diasHorario: "Lunes a Viernes de 09:00 a 15:00 (6 horas diarias)",
      horasAcordadas: 750,
      modalidad: "Remota",
      area: "Diseño Web",
      puesto: "Practicante Profesional de Diseño y Maquetación Web",
      subvencion: "Formativa / Asignación acordada",
      seguroFola: "Póliza RIMAC Seguros N° 4580-2026 / Cobertura FOLA"
    },
    suscripcion: {
      ciudad: "Lima",
      fecha: "2026-10-28"
    },
    version: 1,
    observaciones: [],
    firma: {
      fechaFirma: "2026-10-30",
      archivoNombre: "convenio_firmado_valeria_rios.pdf",
      notas: "Convenio profesional formalizado."
    },
    credenciales: {
      correo: "valeria.rios@devdatep.com",
      fechaEntrega: "2026-10-30",
      entregado: true
    },
    historial: [
      { fecha: "2026-10-25 09:00", accion: "Solicitud generada", detalle: "Fin de prueba satisfactorio." },
      { fecha: "2026-10-28 12:00", accion: "Documento final generado", detalle: "Borrador verificado sin observaciones." },
      { fecha: "2026-10-30 15:00", accion: "Convenio firmado y formalizado", detalle: "Convenio suscrito. Código definitivo asignado: 1109. Credenciales otorgadas: valeria.rios@devdatep.com." }
    ]
  },

  // 6. Convenio Firmado y Finalizado (histórico culminado)
  {
    idSolicitud: "SOL-2023-001",
    idConvenioFirmado: "CONV-2023-088",
    idColaborador: "COL-005",
    codigoColaborador: "1105",
    codigoProvisional: "Fernando_Gomez.Prueba",
    nombreColaborador: "Fernando Gómez Prado",
    numeroDocumento: "00000005",
    tipoDocumento: "DNI",
    idArea: "ARE-004",
    area: "Backend",
    idPeriodo: "PER-2023-005",
    fechaSolicitud: "2023-08-01",
    estado: "Convenio firmado",
    plantilla: "pre-profesional",
    empresa: { ...EMPRESA_BASE },
    institucion: {
      razonSocial: "Universidad Nacional de Ingeniería",
      ruc: "20169004359",
      domicilio: "Av. Túpac Amaru 210, Rímac, Lima",
      representante: "Dr. Aurelio Padilla Ríos",
      cargoRep: "Decano de Facultad de Ingeniería de Sistemas",
      docRep: "DNI 06543210"
    },
    practicante: {
      nombreCompleto: "Fernando Gómez Prado",
      documento: "00000005",
      tipoDocumento: "DNI",
      nacionalidad: "Peruana",
      nacimiento: "2001-07-09",
      sexo: "Masculino",
      domicilio: "Av. Habich 450, San Martín de Porres, Lima",
      situacionAcademica: "Egresado",
      especialidad: "Ciencias de la Computación"
    },
    condiciones: {
      fechaInicio: "2023-08-07",
      fechaFin: "2023-11-20",
      duracion: "3 meses y medio",
      diasHorario: "Lunes a Viernes de 09:00 a 14:00 (5 horas diarias)",
      horasAcordadas: 360,
      modalidad: "Remota",
      area: "Backend",
      puesto: "Practicante Pre-Profesional de Desarrollo Backend",
      subvencion: "Formativa / Asignación acordada",
      seguroFola: "Póliza RIMAC Seguros N° 3210-2023 / Cobertura FOLA"
    },
    suscripcion: {
      ciudad: "Lima",
      fecha: "2023-08-03"
    },
    version: 1,
    observaciones: [],
    firma: {
      fechaFirma: "2023-08-05",
      archivoNombre: "convenio_firmado_fernando_gomez.pdf",
      notas: "Convenio culminado satisfactoriamente. Prácticas convalidadas para grado de Bachiller."
    },
    credenciales: {
      correo: "fernando.gomez@devdatep.com",
      fechaEntrega: "2023-08-05",
      entregado: true
    },
    historial: [
      { fecha: "2023-08-01 09:00", accion: "Solicitud generada", detalle: "Fin de prueba satisfactorio." },
      { fecha: "2023-08-05 16:00", accion: "Convenio firmado y formalizado", detalle: "Convenio suscrito. Código definitivo: 1105. Credenciales entregadas." },
      { fecha: "2023-11-20 18:00", accion: "Culminación exitosa", detalle: "Horas formativas cumplidas íntegramente." }
    ]
  }
];

// Estado en memoria de la aplicación
let activeTab = "solicitudes"; // 'solicitudes' | 'firmados'
let solicitudesList = [];
let solicitudEnEdicion = null;
let currentSearchTerm = "";
let currentFilterArea = "";
let currentFilterEstado = "";
let demoSignedFileSelected = null;
let isConveniosInitialized = false;

/**
 * Persistencia en localStorage
 */
function cargarConveniosDesdeStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVENIOS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CONVENIOS, JSON.stringify(DEFAULT_CONVENIOS));
      return JSON.parse(JSON.stringify(DEFAULT_CONVENIOS));
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_CONVENIOS, JSON.stringify(DEFAULT_CONVENIOS));
      return JSON.parse(JSON.stringify(DEFAULT_CONVENIOS));
    }
    // Asegurar que las solicitudes no firmadas muestren siempre su código provisional Nombre_Apellido.Prueba
    parsed.forEach((sol) => {
      if (!esConvenioFirmado(sol)) {
        if (!sol.codigoProvisional || /^\d+$/.test(sol.codigoProvisional) || sol.codigoProvisional.endsWith(".Prueba") === false) {
          const partes = (sol.nombreColaborador || "").split(" ").filter(Boolean);
          sol.codigoProvisional = partes.length >= 2 ? `${partes[0]}_${partes[1]}.Prueba` : `${sol.nombreColaborador}.Prueba`;
        }
      }
    });
    return parsed;
  } catch (error) {
    console.error("Error al leer convenios de localStorage:", error);
    return JSON.parse(JSON.stringify(DEFAULT_CONVENIOS));
  }
}

function guardarConveniosEnStorage(datos) {
  try {
    localStorage.setItem(STORAGE_KEY_CONVENIOS, JSON.stringify(datos));
  } catch (error) {
    console.error("Error al guardar convenios en localStorage:", error);
  }
}

/**
 * Utilidades de formato
 */
function escapeHTML(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizarTexto(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function obtenerFechaHoy() {
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
}

function formatearFechaLegible(fechaISO) {
  if (!fechaISO) return "No registrada";
  try {
    const [y, m, d] = fechaISO.split("-");
    if (!y || !m || !d) return fechaISO;
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "setiembre", "octubre", "noviembre", "diciembre"];
    return `${parseInt(d, 10)} de ${meses[parseInt(m, 10) - 1]} de ${y}`;
  } catch (e) {
    return fechaISO;
  }
}

function mostrarAlerta(mensaje, tipo = "info") {
  const alertEl = document.getElementById("statusAlert");
  if (!alertEl) return;
  alertEl.textContent = mensaje;
  alertEl.className = `status-alert alert-${tipo}`;
  alertEl.hidden = false;
  setTimeout(() => {
    alertEl.hidden = true;
  }, 4500);
}

/**
 * Poblar el selector de áreas
 */
function inicializarFiltroAreas() {
  const select = document.getElementById("filterArea");
  if (!select) return;
  select.innerHTML = '<option value="">Todas las áreas</option>';

  const areasUnicas = new Set();
  CATALOGO_AREAS.forEach((a) => areasUnicas.add(a.nombre));

  Array.from(areasUnicas)
    .sort()
    .forEach((nombreArea) => {
      const opt = document.createElement("option");
      opt.value = nombreArea;
      opt.textContent = nombreArea;
      select.appendChild(opt);
    });
}

function esConvenioFirmado(sol) {
  return sol.estado === "Convenio firmado" || sol.estado === "Firmado";
}

/**
 * Actualizar y calcular KPIs según especificación
 */
function actualizarKPIs() {
  const container = document.getElementById("kpiContainer");
  if (!container) return;
  container.innerHTML = "";

  const totalSolicitudes = solicitudesList.filter((s) => !esConvenioFirmado(s));
  const totalFirmados = solicitudesList.filter((s) => esConvenioFirmado(s));

  // Actualizar badges en las pestañas
  const badgeSol = document.getElementById("badgeSolicitudes");
  const badgeFir = document.getElementById("badgeFirmados");
  if (badgeSol) badgeSol.textContent = totalSolicitudes.length;
  if (badgeFir) badgeFir.textContent = totalFirmados.length;

  if (activeTab === "solicitudes") {
    // KPIs para Solicitudes: Solicitudes en trámite, En preparación, Pendientes de firma
    const enTramite = totalSolicitudes.length;
    const enPreparacion = totalSolicitudes.filter((s) => s.estado === "Pendiente de preparación").length;
    const pendFirma = totalSolicitudes.filter((s) => s.estado === "Pendiente de firma").length;

    const kpiCards = [
      {
        titulo: "Solicitudes en trámite",
        valor: enTramite,
        subtitulo: "Total de expedientes pendientes de suscripción",
        color: "var(--th-primary)"
      },
      {
        titulo: "En preparación",
        valor: enPreparacion,
        subtitulo: "Revisión y corrección de datos por Talento Humano",
        color: "var(--th-warning)"
      },
      {
        titulo: "Pendientes de firma",
        valor: pendFirma,
        subtitulo: "Documento final generado, listo para entrega",
        color: "var(--th-info)"
      }
    ];

    kpiCards.forEach((kpi) => {
      const div = document.createElement("div");
      div.className = "kpi-card";
      div.innerHTML = `
        <span class="kpi-title">${kpi.titulo}</span>
        <strong class="kpi-value" style="color: ${kpi.color}">${kpi.valor}</strong>
        <small class="kpi-subtitle">${kpi.subtitulo}</small>
      `;
      container.appendChild(div);
    });
  } else {
    // KPIs para Convenios Firmados: Total de convenios firmados, Convenios vigentes, Convenios finalizados
    const fechaActual = obtenerFechaHoy();
    const vigentes = totalFirmados.filter((s) => (s.condiciones?.fechaFin || "9999") >= fechaActual).length;
    const finalizados = totalFirmados.filter((s) => (s.condiciones?.fechaFin || "0000") < fechaActual).length;

    const kpiCards = [
      {
        titulo: "Total de convenios firmados",
        valor: totalFirmados.length,
        subtitulo: "Formalizados con código definitivo y credenciales",
        color: "var(--th-success)"
      },
      {
        titulo: "Convenios vigentes",
        valor: vigentes,
        subtitulo: "Prácticas formativas actualmente en curso",
        color: "var(--th-primary)"
      },
      {
        titulo: "Convenios finalizados",
        valor: finalizados,
        subtitulo: "Periodos formativos culminados",
        color: "var(--th-text-muted)"
      }
    ];

    kpiCards.forEach((kpi) => {
      const div = document.createElement("div");
      div.className = "kpi-card";
      div.innerHTML = `
        <span class="kpi-title">${kpi.titulo}</span>
        <strong class="kpi-value" style="color: ${kpi.color}">${kpi.valor}</strong>
        <small class="kpi-subtitle">${kpi.subtitulo}</small>
      `;
      container.appendChild(div);
    });
  }
}

/**
 * Obtener clase y texto para el badge de estado
 */
function obtenerBadgeEstado(estado) {
  switch (estado) {
    case "Pendiente de preparación":
      return { clase: "status-preparacion", texto: "En preparación" };
    case "Pendiente de firma":
      return { clase: "status-firma", texto: "Listo para firma" };
    case "Convenio firmado":
    case "Firmado":
      return { clase: "status-vigente", texto: "Convenio firmado" };
    default:
      return { clase: "status-preparacion", texto: estado };
  }
}

/**
 * Renderizado de la tabla de Solicitudes de Convenio
 */
function renderizarTablaSolicitudes() {
  const tbody = document.getElementById("tbodySolicitudes");
  const emptyEl = document.getElementById("emptySolicitudes");
  if (!tbody) return;
  tbody.innerHTML = "";

  const q = currentSearchTerm.trim().toLowerCase();

  const filtrados = solicitudesList.filter((item) => {
    if (esConvenioFirmado(item)) return false;

    // Filtro búsqueda (nombre, documento, código)
    if (q) {
      const nombre = (item.nombreColaborador || "").toLowerCase();
      const doc = (item.numeroDocumento || "").toLowerCase();
      const codProv = (item.codigoProvisional || item.codigoColaborador || "").toLowerCase();
      if (!nombre.includes(q) && !doc.includes(q) && !codProv.includes(q)) {
        return false;
      }
    }

    // Filtro área
    if (currentFilterArea && item.area !== currentFilterArea) {
      return false;
    }

    // Filtro estado
    if (currentFilterEstado && item.estado !== currentFilterEstado) {
      return false;
    }

    return true;
  });

  if (filtrados.length === 0) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;

  filtrados.forEach((sol) => {
    const tr = document.createElement("tr");

    // Iniciales para avatar
    const iniciales = (sol.nombreColaborador || "TH")
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();

    const badge = obtenerBadgeEstado(sol.estado);
    const codigoProvisional = sol.codigoProvisional || sol.codigoColaborador || `${sol.nombreColaborador.replace(/\s+/g, "_")}.Prueba`;

    tr.innerHTML = `
      <td>
        <div class="user-cell">
          <div class="colab-avatar" aria-hidden="true">${escapeHTML(iniciales)}</div>
          <div>
            <strong>${escapeHTML(sol.nombreColaborador)}</strong>
            <small class="muted-text">${escapeHTML(sol.plantilla === "profesional" ? "Prácticas Profesionales" : "Prácticas Pre-Profesionales")}</small>
          </div>
        </div>
      </td>
      <td>
        <span class="code-pill code-pill-provisional" title="Código provisional mientras dure el trámite">
          ${escapeHTML(codigoProvisional)}
        </span>
      </td>
      <td>
        <span>${escapeHTML(sol.tipoDocumento || "DNI")} ${escapeHTML(sol.numeroDocumento)}</span>
      </td>
      <td>
        <span class="area-tag">${escapeHTML(sol.area || "General")}</span>
      </td>
      <td>
        <span>${escapeHTML(sol.fechaSolicitud || "—")}</span>
      </td>
      <td>
        <span class="status-badge ${badge.clase}">${escapeHTML(badge.texto)}</span>
      </td>
      <td class="text-right">
        <button type="button" class="th-btn th-btn-primary th-btn-sm" data-gestionar="${sol.idSolicitud}" title="Revisar y preparar convenio">
          <span>✏️</span> Gestionar convenio
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Renderizado de la tabla de Convenios Firmados
 */
function renderizarTablaFirmados() {
  const tbody = document.getElementById("tbodyFirmados");
  const emptyEl = document.getElementById("emptyFirmados");
  if (!tbody) return;
  tbody.innerHTML = "";

  const q = currentSearchTerm.trim().toLowerCase();
  const fechaHoy = obtenerFechaHoy();

  const filtrados = solicitudesList.filter((item) => {
    if (!esConvenioFirmado(item)) return false;

    // Filtro búsqueda
    if (q) {
      const nombre = (item.nombreColaborador || "").toLowerCase();
      const doc = (item.numeroDocumento || "").toLowerCase();
      const cod = (item.codigoColaborador || "").toLowerCase();
      if (!nombre.includes(q) && !doc.includes(q) && !cod.includes(q)) {
        return false;
      }
    }

    // Filtro área
    if (currentFilterArea && item.area !== currentFilterArea) {
      return false;
    }

    return true;
  });

  if (filtrados.length === 0) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;

  filtrados.forEach((sol) => {
    const tr = document.createElement("tr");

    const iniciales = (sol.nombreColaborador || "TH")
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();

    const esVigente = (sol.condiciones?.fechaFin || "9999") >= fechaHoy;
    const badgeClase = esVigente ? "status-vigente" : "status-finalizado";
    const badgeTexto = esVigente ? "Vigente" : "Finalizado";

    tr.innerHTML = `
      <td>
        <div class="user-cell">
          <div class="colab-avatar avatar-firmado" aria-hidden="true">${escapeHTML(iniciales)}</div>
          <div>
            <strong>${escapeHTML(sol.nombreColaborador)}</strong>
            <small class="muted-text">${escapeHTML(sol.idConvenioFirmado || "Convenio Formal")}</small>
          </div>
        </div>
      </td>
      <td>
        <strong class="code-pill code-pill-definitive" title="Código definitivo asignado formalmente">
          ${escapeHTML(sol.codigoColaborador)}
        </strong>
      </td>
      <td>
        <span>${escapeHTML(sol.tipoDocumento || "DNI")} ${escapeHTML(sol.numeroDocumento)}</span>
      </td>
      <td>
        <span class="area-tag">${escapeHTML(sol.area || "General")}</span>
      </td>
      <td>${escapeHTML(sol.condiciones?.fechaInicio || "—")}</td>
      <td>${escapeHTML(sol.condiciones?.fechaFin || "—")}</td>
      <td><strong>${escapeHTML(sol.condiciones?.horasAcordadas || 330)} h</strong></td>
      <td>
        <span class="signed-date">✓ ${escapeHTML(sol.firma?.fechaFirma || "Registrada")}</span>
      </td>
      <td>
        <span class="status-badge ${badgeClase}">${escapeHTML(badgeTexto)}</span>
      </td>
      <td class="text-right">
        <button type="button" class="th-btn th-btn-secondary th-btn-sm" data-ver="${sol.idSolicitud}" title="Consultar convenio y credenciales">
          <span>👁️</span> Ver convenio
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Cambiar entre pestañas Horizontales
 */
function cambiarPestana(targetTab) {
  activeTab = targetTab;

  const btnSol = document.getElementById("tabSolicitudes");
  const btnFir = document.getElementById("tabFirmados");
  const viewSol = document.getElementById("viewSolicitudes");
  const viewFir = document.getElementById("viewFirmados");
  const filterEstadoGroup = document.getElementById("filterEstadoGroup");

  if (targetTab === "solicitudes") {
    btnSol.classList.add("active");
    btnSol.setAttribute("aria-pressed", "true");
    btnFir.classList.remove("active");
    btnFir.setAttribute("aria-pressed", "false");

    viewSol.hidden = false;
    viewFir.hidden = true;
    if (filterEstadoGroup) filterEstadoGroup.hidden = false;
  } else {
    btnFir.classList.add("active");
    btnFir.setAttribute("aria-pressed", "true");
    btnSol.classList.remove("active");
    btnSol.setAttribute("aria-pressed", "false");

    viewSol.hidden = true;
    viewFir.hidden = false;
    if (filterEstadoGroup) filterEstadoGroup.hidden = true;
  }

  actualizarKPIs();
  renderizarTablaSolicitudes();
  renderizarTablaFirmados();
}

/**
 * ==========================================================================
 * PANTALLA DE DETALLE INDEPENDIENTE DE LA SOLICITUD
 * ==========================================================================
 */
function abrirDetalleSolicitud(idSolicitud) {
  const sol = solicitudesList.find((s) => s.idSolicitud === idSolicitud);
  if (!sol) {
    mostrarAlerta("No se encontró la solicitud seleccionada.", "error");
    return;
  }

  solicitudEnEdicion = JSON.parse(JSON.stringify(sol));

  document.getElementById("screenListado").hidden = true;
  document.getElementById("screenDetalle").hidden = false;

  // Cabecera del detalle
  document.getElementById("detalleNombreColaborador").textContent = sol.nombreColaborador;

  const badgeCodigo = document.getElementById("detalleCodigoBadge");
  if (esConvenioFirmado(sol)) {
    badgeCodigo.textContent = `Código definitivo: ${sol.codigoColaborador}`;
    badgeCodigo.className = "code-pill code-pill-definitive";
  } else {
    const prov = sol.codigoProvisional || sol.codigoColaborador || `${sol.nombreColaborador.replace(/\s+/g, "_")}.Prueba`;
    badgeCodigo.textContent = `Código provisional: ${prov}`;
    badgeCodigo.className = "code-pill code-pill-provisional";
  }

  document.getElementById("detalleSubinfo").textContent = `${sol.area} · Solicitud recibida: ${sol.fechaSolicitud || "Fecha no registrada"}`;

  const badgeEstado = obtenerBadgeEstado(sol.estado);
  const estadoEl = document.getElementById("detalleEstadoBadge");
  estadoEl.textContent = badgeEstado.texto;
  estadoEl.className = `status-badge ${badgeEstado.clase}`;

  // Selector de Plantilla
  const selectPlantilla = document.getElementById("selectPlantilla");
  if (selectPlantilla) selectPlantilla.value = sol.plantilla || "pre-profesional";

  // Precargar los 5 grupos de información
  cargarFormularioDesdeObjeto(solicitudEnEdicion);

  // Stepper y Alertas
  actualizarStepperYAlertas(solicitudEnEdicion);

  // Historial del convenio
  renderizarHistorialDetalle(solicitudEnEdicion);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function volverAListado() {
  solicitudEnEdicion = null;
  document.getElementById("screenDetalle").hidden = true;
  document.getElementById("screenListado").hidden = false;

  actualizarKPIs();
  renderizarTablaSolicitudes();
  renderizarTablaFirmados();
}

/**
 * Cargar datos del objeto en el formulario de los 5 grupos
 */
function cargarFormularioDesdeObjeto(sol) {
  // 1. Empresa
  const emp = sol.empresa || EMPRESA_BASE;
  document.getElementById("empRazonSocial").value = emp.razonSocial || "";
  document.getElementById("empRuc").value = emp.ruc || "";
  document.getElementById("empActividad").value = emp.actividad || "";
  document.getElementById("empDomicilio").value = emp.domicilio || "";
  document.getElementById("empRepresentante").value = emp.representante || "";
  document.getElementById("empCargoRep").value = emp.cargoRep || "";
  document.getElementById("empDocRep").value = emp.docRep || "";

  // 2. Centro de Formación
  const inst = sol.institucion || {};
  document.getElementById("instRazonSocial").value = inst.razonSocial || "";
  document.getElementById("instRuc").value = inst.ruc || "";
  document.getElementById("instRepresentante").value = inst.representante || "";
  document.getElementById("instDomicilio").value = inst.domicilio || "";
  document.getElementById("instCargoRep").value = inst.cargoRep || "";
  document.getElementById("instDocRep").value = inst.docRep || "";

  // 3. Practicante
  const prac = sol.practicante || {};
  document.getElementById("pracNombreCompleto").value = prac.nombreCompleto || sol.nombreColaborador || "";
  document.getElementById("pracDocumento").value = prac.documento || sol.numeroDocumento || "";
  document.getElementById("pracNacionalidad").value = prac.nacionalidad || "Peruana";
  document.getElementById("pracFechaNacimiento").value = prac.nacimiento || "2003-01-01";
  document.getElementById("pracSexo").value = prac.sexo || "No especificado";
  document.getElementById("pracDomicilio").value = prac.domicilio || "";
  document.getElementById("pracSituacionAcademica").value = prac.situacionAcademica || "Estudiante universitario";
  document.getElementById("pracEspecialidad").value = prac.especialidad || "";

  // 4. Condiciones
  const cond = sol.condiciones || {};
  document.getElementById("condFechaInicio").value = cond.fechaInicio || "";
  document.getElementById("condFechaFin").value = cond.fechaFin || "";
  document.getElementById("condDuracion").value = cond.duracion || "3 meses (66 días hábiles)";
  document.getElementById("condHorasAcordadas").value = cond.horasAcordadas || 330;
  document.getElementById("condDiasHorario").value = cond.diasHorario || "Lunes a Viernes de 09:00 a 14:00 (5 horas diarias)";
  document.getElementById("condModalidad").value = cond.modalidad || "Remota";
  document.getElementById("condArea").value = cond.area || sol.area || "";
  document.getElementById("condPuesto").value = cond.puesto || `Practicante de ${sol.area || "Talento Humano"}`;
  document.getElementById("condSubvencion").value = cond.subvencion || "Formativa / Asignación acordada";
  document.getElementById("condSeguroFola").value = cond.seguroFola || "Póliza RIMAC Seguros N° 4580-2026 / Cobertura FOLA";

  // 5. Suscripción
  const susc = sol.suscripcion || {};
  document.getElementById("suscCiudad").value = susc.ciudad || "Lima";
  document.getElementById("suscFecha").value = susc.fecha || obtenerFechaHoy();

  // Si ya está firmado, deshabilitar edición para que quede FIJO PARA CONSULTA
  const esFijo = esConvenioFirmado(sol);
  const inputs = document.querySelectorAll("#formConvenioDetalle input, #formConvenioDetalle select, #selectPlantilla");
  inputs.forEach((input) => {
    input.disabled = esFijo;
  });
}

/**
 * Volcar los valores del formulario al objeto en edición
 */
function extraerDatosDeFormulario() {
  if (!solicitudEnEdicion) return;

  solicitudEnEdicion.empresa = {
    razonSocial: document.getElementById("empRazonSocial").value.trim(),
    ruc: document.getElementById("empRuc").value.trim(),
    actividad: document.getElementById("empActividad").value.trim(),
    domicilio: document.getElementById("empDomicilio").value.trim(),
    representante: document.getElementById("empRepresentante").value.trim(),
    cargoRep: document.getElementById("empCargoRep").value.trim(),
    docRep: document.getElementById("empDocRep").value.trim()
  };

  solicitudEnEdicion.institucion = {
    razonSocial: document.getElementById("instRazonSocial").value.trim(),
    ruc: document.getElementById("instRuc").value.trim(),
    representante: document.getElementById("instRepresentante").value.trim(),
    domicilio: document.getElementById("instDomicilio").value.trim(),
    cargoRep: document.getElementById("instCargoRep").value.trim(),
    docRep: document.getElementById("instDocRep").value.trim()
  };

  solicitudEnEdicion.practicante = {
    nombreCompleto: document.getElementById("pracNombreCompleto").value.trim(),
    documento: document.getElementById("pracDocumento").value.trim(),
    tipoDocumento: solicitudEnEdicion.tipoDocumento || "DNI",
    nacionalidad: document.getElementById("pracNacionalidad").value.trim(),
    nacimiento: document.getElementById("pracFechaNacimiento").value,
    sexo: document.getElementById("pracSexo").value,
    domicilio: document.getElementById("pracDomicilio").value.trim(),
    situacionAcademica: document.getElementById("pracSituacionAcademica").value,
    especialidad: document.getElementById("pracEspecialidad").value.trim()
  };

  solicitudEnEdicion.nombreColaborador = solicitudEnEdicion.practicante.nombreCompleto;
  solicitudEnEdicion.numeroDocumento = solicitudEnEdicion.practicante.documento;

  const horas = Number(document.getElementById("condHorasAcordadas").value) || 330;
  solicitudEnEdicion.condiciones = {
    fechaInicio: document.getElementById("condFechaInicio").value,
    fechaFin: document.getElementById("condFechaFin").value,
    duracion: document.getElementById("condDuracion").value.trim(),
    horasAcordadas: horas,
    diasHorario: document.getElementById("condDiasHorario").value.trim(),
    modalidad: document.getElementById("condModalidad").value,
    area: document.getElementById("condArea").value.trim(),
    puesto: document.getElementById("condPuesto").value.trim(),
    subvencion: document.getElementById("condSubvencion").value.trim(),
    seguroFola: document.getElementById("condSeguroFola").value.trim()
  };

  solicitudEnEdicion.area = solicitudEnEdicion.condiciones.area;

  solicitudEnEdicion.suscripcion = {
    ciudad: document.getElementById("suscCiudad").value.trim(),
    fecha: document.getElementById("suscFecha").value
  };

  solicitudEnEdicion.plantilla = document.getElementById("selectPlantilla")?.value || "pre-profesional";
}

/**
 * Stepper simplificado y gestión de alertas
 */
function actualizarStepperYAlertas(sol) {
  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const step3 = document.getElementById("step3");

  const line1 = document.getElementById("line1");
  const line2 = document.getElementById("line2");

  [step1, step2, step3].forEach((s) => s?.classList.remove("active", "completed"));
  [line1, line2].forEach((l) => l?.classList.remove("completed"));

  const alertPrep = document.getElementById("alertPreparacion");
  const alertListo = document.getElementById("alertListoFirma");
  const alertFijo = document.getElementById("alertFirmadoFijo");

  if (alertPrep) alertPrep.hidden = true;
  if (alertListo) alertListo.hidden = true;
  if (alertFijo) alertFijo.hidden = true;

  const btnGuardar = document.getElementById("btnGuardarBorrador");
  const btnGenerarDoc = document.getElementById("btnGenerarDocFinal");
  const btnRegFirma = document.getElementById("btnRegistrarFirmaDetalle");

  const estado = sol.estado;

  if (estado === "Pendiente de preparación") {
    step1.classList.add("active");
    if (alertPrep) alertPrep.hidden = false;

    if (btnGuardar) btnGuardar.disabled = false;
    if (btnGenerarDoc) btnGenerarDoc.disabled = false;
    if (btnRegFirma) btnRegFirma.disabled = true;
  } else if (estado === "Pendiente de firma") {
    step1.classList.add("completed");
    line1.classList.add("completed");
    step2.classList.add("active");
    if (alertListo) alertListo.hidden = false;

    if (btnGuardar) btnGuardar.disabled = false;
    if (btnGenerarDoc) btnGenerarDoc.disabled = false;
    if (btnRegFirma) btnRegFirma.disabled = false;
  } else if (esConvenioFirmado(sol)) {
    step1.classList.add("completed");
    line1.classList.add("completed");
    step2.classList.add("completed");
    line2.classList.add("completed");
    step3.classList.add("completed");
    if (alertFijo) alertFijo.hidden = false;

    if (btnGuardar) btnGuardar.disabled = true;
    if (btnGenerarDoc) btnGenerarDoc.disabled = true;
    if (btnRegFirma) btnRegFirma.disabled = true;
  }
}

/**
 * Renderizar la lista de historial y trazabilidad
 */
function renderizarHistorialDetalle(sol) {
  const container = document.getElementById("detalleHistorialList");
  if (!container) return;
  container.innerHTML = "";

  const hist = sol.historial || [];
  if (hist.length === 0) {
    container.innerHTML = '<li><small class="muted-text">Sin registros de auditoría aún.</small></li>';
    return;
  }

  [...hist].reverse().forEach((item) => {
    const li = document.createElement("li");
    li.className = "timeline-item";
    li.innerHTML = `
      <div class="timeline-dot" aria-hidden="true"></div>
      <div class="timeline-content">
        <span class="timeline-date">${escapeHTML(item.fecha)}</span>
        <strong class="timeline-title">${escapeHTML(item.accion)}</strong>
        <p class="timeline-detail">${escapeHTML(item.detalle)}</p>
      </div>
    `;
    container.appendChild(li);
  });
}

/**
 * Acción: Guardar borrador con correcciones de Talento Humano
 */
function guardarBorrador() {
  if (!solicitudEnEdicion) return;

  extraerDatosDeFormulario();

  // Validar horas acordadas mínimas
  if (solicitudEnEdicion.condiciones.horasAcordadas < 330) {
    mostrarAlerta("Las horas acordadas deben ser de al menos 330 h según la normativa.", "warning");
    return;
  }

  solicitudEnEdicion.historial.push({
    fecha: obtenerFechaHoy() + " " + new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
    accion: "Borrador guardado",
    detalle: "Talento Humano revisó y guardó los cambios y condiciones del convenio."
  });

  const idx = solicitudesList.findIndex((s) => s.idSolicitud === solicitudEnEdicion.idSolicitud);
  if (idx !== -1) {
    solicitudesList[idx] = JSON.parse(JSON.stringify(solicitudEnEdicion));
  } else {
    solicitudesList.push(JSON.parse(JSON.stringify(solicitudEnEdicion)));
  }

  guardarConveniosEnStorage(solicitudesList);
  renderizarHistorialDetalle(solicitudEnEdicion);
  mostrarAlerta("Los datos del borrador fueron guardados exitosamente.", "success");
}

/**
 * Acción: Generar documento final para firma
 */
function generarDocumentoFinal() {
  if (!solicitudEnEdicion) return;

  extraerDatosDeFormulario();

  if (!solicitudEnEdicion.condiciones.horasAcordadas || solicitudEnEdicion.condiciones.horasAcordadas < 330) {
    mostrarAlerta("Las horas acordadas deben ser de al menos 330 horas antes de generar el documento final.", "warning");
    return;
  }

  solicitudEnEdicion.estado = "Pendiente de firma";
  solicitudEnEdicion.historial.push({
    fecha: obtenerFechaHoy() + " " + new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
    accion: "Documento final generado",
    detalle: "Talento Humano completó la revisión. Documento oficial validado y listo para formalizar la entrega y firma."
  });

  const idx = solicitudesList.findIndex((s) => s.idSolicitud === solicitudEnEdicion.idSolicitud);
  if (idx !== -1) {
    solicitudesList[idx] = JSON.parse(JSON.stringify(solicitudEnEdicion));
  }

  guardarConveniosEnStorage(solicitudesList);
  actualizarStepperYAlertas(solicitudEnEdicion);
  renderizarHistorialDetalle(solicitudEnEdicion);

  const badgeEstado = obtenerBadgeEstado(solicitudEnEdicion.estado);
  const estadoEl = document.getElementById("detalleEstadoBadge");
  estadoEl.textContent = badgeEstado.texto;
  estadoEl.className = `status-badge ${badgeEstado.clase}`;

  mostrarAlerta("Documento final generado correctamente. El convenio está listo para formalizar su firma.", "success");
}

/**
 * ==========================================================================
 * VISTA PREVIA DEL DOCUMENTO OFICIAL (CON CLÁUSULAS WORD)
 * ==========================================================================
 */
function abrirVistaPreviaDocumento() {
  if (!solicitudEnEdicion) return;

  extraerDatosDeFormulario();

  const sol = solicitudEnEdicion;
  const esProfesional = sol.plantilla === "profesional";

  // Identificador de documento oficial
  document.getElementById("docCodigoConvenio").textContent = sol.idConvenioFirmado || `EXP-${sol.idSolicitud}`;
  document.getElementById("docTituloPrincipal").textContent = esProfesional
    ? "CONVENIO DE PRÁCTICAS PROFESIONALES"
    : "CONVENIO DE PRÁCTICAS PRE-PROFESIONALES";

  // 1. Empresa
  const emp = sol.empresa || EMPRESA_BASE;
  document.getElementById("docEmpRazonSocial").textContent = emp.razonSocial;
  document.getElementById("docEmpRuc").textContent = emp.ruc;
  document.getElementById("docEmpDomicilio").textContent = emp.domicilio;
  document.getElementById("docEmpRep").textContent = emp.representante;
  document.getElementById("docEmpCargo").textContent = emp.cargoRep;
  document.getElementById("docEmpDoc").textContent = emp.docRep;
  document.getElementById("docSigEmpRep").textContent = emp.representante;

  // 2. Centro de Formación
  const inst = sol.institucion || {};
  document.getElementById("docInstRazonSocial").textContent = inst.razonSocial || "CENTRO DE FORMACIÓN";
  document.getElementById("docInstRuc").textContent = inst.ruc || "20XXXXXXXXX";
  document.getElementById("docInstDomicilio").textContent = inst.domicilio || "Domicilio de la institución";
  document.getElementById("docInstRep").textContent = inst.representante || "Representante de la institución";
  document.getElementById("docInstCargo").textContent = inst.cargoRep || "Director(a) / Coordinador(a)";
  document.getElementById("docInstDoc").textContent = inst.docRep || "Documento oficial";
  document.getElementById("docSigInstRep").textContent = inst.representante || "Director(a) de Centro de Formación";
  document.getElementById("docSigInstCargo").textContent = inst.cargoRep || "Prácticas Formativas";

  // 3. Practicante
  const prac = sol.practicante || {};
  document.getElementById("docPracNombre").textContent = prac.nombreCompleto || sol.nombreColaborador;
  document.getElementById("docPracDoc").textContent = `${prac.tipoDocumento || "DNI"} ${prac.documento || sol.numeroDocumento}`;
  document.getElementById("docPracNac").textContent = prac.nacionalidad || "Peruana";
  document.getElementById("docPracDom").textContent = prac.domicilio || "Dirección del practicante";
  document.getElementById("docPracSit").textContent = prac.situacionAcademica || "Estudiante";
  document.getElementById("docPracEsp").textContent = prac.especialidad || "Especialidad formativa";

  document.getElementById("docSigPracNombre").textContent = prac.nombreCompleto || sol.nombreColaborador;
  document.getElementById("docSigPracDoc").textContent = `${prac.tipoDocumento || "DNI"} ${prac.documento || sol.numeroDocumento}`;

  // 4. Cláusulas del Convenio
  const containerClausulas = document.getElementById("docClausesContainer");
  containerClausulas.innerHTML = esProfesional
    ? generarClausulasProfesional(sol)
    : generarClausulasPreProfesional(sol);

  // 5. Suscripción
  const susc = sol.suscripcion || {};
  document.getElementById("docSuscCiudad").textContent = susc.ciudad || "Lima";
  document.getElementById("docSuscFecha").textContent = formatearFechaLegible(susc.fecha || obtenerFechaHoy());

  document.getElementById("modalDocPreview").hidden = false;
}

function cerrarVistaPreviaDocumento() {
  document.getElementById("modalDocPreview").hidden = true;
}

/**
 * Plantilla Word oficial para Prácticas Pre-Profesionales
 */
function generarClausulasPreProfesional(sol) {
  const cond = sol.condiciones || {};
  const area = escapeHTML(cond.area || sol.area || "Tecnología");
  const puesto = escapeHTML(cond.puesto || `Practicante Pre-Profesional de ${area}`);
  const inicio = escapeHTML(formatearFechaLegible(cond.fechaInicio));
  const fin = escapeHTML(formatearFechaLegible(cond.fechaFin));
  const horas = escapeHTML(cond.horasAcordadas || 330);
  const diasHorario = escapeHTML(cond.diasHorario || "Lunes a Viernes de 09:00 a 14:00 (5 horas diarias)");
  const modalidad = escapeHTML(cond.modalidad || "Remota");
  const subvencion = escapeHTML(cond.subvencion || "Formativa acordada");
  const seguro = escapeHTML(cond.seguroFola || "Póliza RIMAC Seguros FOLA");

  return `
    <article class="clause-item">
      <h4>CLÁUSULA PRIMERA: DE LAS BASES LEGALES</h4>
      <p>
        El presente Convenio se celebra de conformidad con la Ley N° 28518, Ley sobre Modalidades Formativas Laborales, su Reglamento aprobado por Decreto Supremo N° 007-2005-TR, y los lineamientos internos de capacitación de <strong>DEVDATEP CONSULTING S.A.C.</strong>
      </p>
    </article>

    <article class="clause-item clause-highlight">
      <h4>CLÁUSULA SEGUNDA: DEL OBJETO Y ACTIVIDADES FORMATIVAS</h4>
      <p>
        Por el presente convenio, <strong>LA EMPRESA</strong> brinda facilidades a <strong>EL PRACTICANTE</strong> para que realice su aprendizaje formativo en el puesto de <strong class="var-highlight">${puesto}</strong>, dentro del área de <strong class="var-highlight">${area}</strong>, bajo la modalidad de prácticas formativas <strong>${modalidad}</strong>.
      </p>
      <p>
        Las actividades de aprendizaje práctico están orientadas al desarrollo de competencias profesionales mediante el entrenamiento guiado, elaboración de entregables técnicos y participación en proyectos supervisados.
      </p>
    </article>

    <article class="clause-item">
      <h4>CLÁUSULA TERCERA: CONDICIONES DE LA JORNADA Y HORAS FORMATIVAS</h4>
      <p>
        Las prácticas se desarrollarán con un compromiso total de <strong>${horas} horas acordadas</strong>, en el horario de <strong>${diasHorario}</strong>, no pudiendo superar las 30 horas semanales ni 6 horas diarias de conformidad con el artículo 44° de la Ley N° 28518.
      </p>
    </article>

    <article class="clause-item">
      <h4>CLÁUSULA CUARTA: PLAZO DE VIGENCIA</h4>
      <p>
        El presente convenio rige a partir del <strong>${inicio}</strong> hasta el <strong>${fin}</strong>, pudiendo prorrogarse previo acuerdo por escrito entre las partes hasta el límite máximo permitido por ley.
      </p>
    </article>

    <article class="clause-item">
      <h4>CLÁUSULA QUINTA: DE LA SUBVENCIÓN Y SEGURO DE SALUD</h4>
      <p>
        <strong>LA EMPRESA</strong> otorga a <strong>EL PRACTICANTE</strong> una subvención económica formativa de carácter <strong>${subvencion}</strong>, la cual no tiene carácter remunerativo ni laboral. Asimismo, LA EMPRESA brinda la cobertura de riesgos de salud y accidentes a través de <strong>${seguro}</strong> de conformidad con la normativa vigente.
      </p>
    </article>

    <article class="clause-item">
      <h4>CLÁUSULA SEXTA: OBLIGACIONES DE EL PRACTICANTE</h4>
      <p>
        EL PRACTICANTE se compromete a: a) Desarrollar con responsabilidad y ética las actividades formativas asignadas; b) Respetar las políticas de seguridad de la información y confidencialidad de LA EMPRESA; c) Cumplir con los horarios pactados y registrar su asistencia.
      </p>
    </article>
  `;
}

/**
 * Plantilla Word oficial para Prácticas Profesionales (Egresados / Bachilleres)
 */
function generarClausulasProfesional(sol) {
  const cond = sol.condiciones || {};
  const area = escapeHTML(cond.area || sol.area || "Tecnología");
  const puesto = escapeHTML(cond.puesto || `Practicante Profesional de ${area}`);
  const inicio = escapeHTML(formatearFechaLegible(cond.fechaInicio));
  const fin = escapeHTML(formatearFechaLegible(cond.fechaFin));
  const horas = escapeHTML(cond.horasAcordadas || 720);
  const diasHorario = escapeHTML(cond.diasHorario || "Lunes a Viernes de 09:00 a 15:00 (6 horas diarias)");
  const modalidad = escapeHTML(cond.modalidad || "Remota");
  const subvencion = escapeHTML(cond.subvencion || "Formativa acordada");
  const seguro = escapeHTML(cond.seguroFola || "Póliza RIMAC Seguros FOLA");

  return `
    <article class="clause-item">
      <h4>CLÁUSULA PRIMERA: DE LAS BASES LEGALES</h4>
      <p>
        El presente Convenio de Prácticas Profesionales se celebra al amparo de la Ley N° 28518 y su Reglamento (D.S. N° 007-2005-TR), con el objeto de consolidar el desempeño profesional de egresados o bachilleres de centros de formación superior.
      </p>
    </article>

    <article class="clause-item clause-highlight">
      <h4>CLÁUSULA SEGUNDA: DEL OBJETO DEL CONVENIO Y ESPECIALIDAD</h4>
      <p>
        <strong>LA EMPRESA</strong> acoge a <strong>EL PRACTICANTE</strong> en calidad de <strong class="var-highlight">${puesto}</strong>, asignándole actividades prácticas avanzadas dentro del área de <strong class="var-highlight">${area}</strong>, bajo la modalidad <strong>${modalidad}</strong>.
      </p>
      <p>
        La práctica profesional persigue brindar experiencia laboral directa, aplicación de metodologías ágiles y consolidación de conocimientos técnicos en entornos reales de producción de software y consultoría tecnológica.
      </p>
    </article>

    <article class="clause-item">
      <h4>CLÁUSULA TERCERA: JORNADA FORMATIVA Y HORARIOS</h4>
      <p>
        El periodo comprende un volumen de <strong>${horas} horas formativas acordadas</strong>, a desarrollarse en el horario de <strong>${diasHorario}</strong>, sin exceder de 8 horas diarias ni 48 horas semanales.
      </p>
    </article>

    <article class="clause-item">
      <h4>CLÁUSULA CUARTA: DURACIÓN DEL CONVENIO</h4>
      <p>
        El plazo de ejecución rige desde el <strong>${inicio}</strong> hasta el <strong>${fin}</strong>, el cual no podrá exceder de doce (12) meses, salvo que el centro de formación profesional determine un plazo mayor.
      </p>
    </article>

    <article class="clause-item">
      <h4>CLÁUSULA QUINTA: ASIGNACIÓN ECONÓMICA Y COBERTURA FOLA</h4>
      <p>
        <strong>LA EMPRESA</strong> abonará puntualmente a EL PRACTICANTE la subvención económica de naturaleza <strong>${subvencion}</strong> y mantendrá vigente la cobertura del seguro médico <strong>${seguro}</strong>.
      </p>
    </article>

    <article class="clause-item">
      <h4>CLÁUSULA SEXTA: CONFIDENCIALIDAD Y PROPIEDAD INTELECTUAL</h4>
      <p>
        Todas las creaciones técnicas, código fuente, documentación y proyectos elaborados durante el desarrollo del convenio constituyen propiedad exclusiva de <strong>DEVDATEP CONSULTING S.A.C.</strong> EL PRACTICANTE se obliga a guardar estricta reserva de la información confidencial.
      </p>
    </article>
  `;
}

/**
 * ==========================================================================
 * MODAL: REGISTRAR ENTREGA DE CONVENIO FIRMADO Y CREDENCIALES
 * ==========================================================================
 */
function abrirModalRegistrarFirma() {
  if (!solicitudEnEdicion) return;

  const sol = solicitudEnEdicion;
  document.getElementById("inputFechaFirma").value = obtenerFechaHoy();
  document.getElementById("inputNotasFirma").value = "";
  document.getElementById("archivoFirmadoSeleccionado").textContent = "";
  demoSignedFileSelected = null;

  // Autogenerar correo corporativo sugerido basado en nombre y apellido
  const correoSugerido = generarCorreoCorporativo(sol.nombreColaborador);
  const inputCorreo = document.getElementById("correoInstitucionalAsignado");
  if (inputCorreo) inputCorreo.value = correoSugerido;

  document.getElementById("modalRegistrarFirma").hidden = false;
}

function cerrarModalRegistrarFirma() {
  document.getElementById("modalRegistrarFirma").hidden = true;
}

function generarCorreoCorporativo(nombreCompleto) {
  const partes = normalizarTexto(nombreCompleto).split(" ").filter(Boolean);
  if (partes.length >= 2) {
    return `${partes[0]}.${partes[1]}@devdatep.com`;
  } else if (partes.length === 1) {
    return `${partes[0]}@devdatep.com`;
  }
  return "practicante@devdatep.com";
}

/**
 * Genera el siguiente código definitivo una sola vez basado en los colaboradores existentes
 */
function generarCodigoDefinitivoUnico() {
  const colaboradores = obtenerColaboradores();
  let maxCode = 1100;

  colaboradores.forEach((colab) => {
    const cod = Number(colab.codigoColaborador);
    if (!isNaN(cod) && cod > maxCode) {
      maxCode = cod;
    }
  });

  // También buscar en los convenios firmados existentes
  solicitudesList.forEach((s) => {
    if (esConvenioFirmado(s)) {
      const cod = Number(s.codigoColaborador);
      if (!isNaN(cod) && cod > maxCode) {
        maxCode = cod;
      }
    }
  });

  return String(maxCode + 1);
}

/**
 * Confirmar entrega de convenio firmado, asignar código definitivo y formalizar credenciales
 */
function confirmarRecepcionFirma(e) {
  e.preventDefault();
  if (!solicitudEnEdicion) return;

  const fechaFirma = document.getElementById("inputFechaFirma").value;
  if (!fechaFirma) {
    mostrarAlerta("Indica la fecha de suscripción formal del convenio.", "warning");
    return;
  }

  const fileInput = document.getElementById("inputArchivoFirmado");
  let archivoNombre = demoSignedFileSelected || "convenio_firmado.pdf";
  if (fileInput.files && fileInput.files.length > 0) {
    archivoNombre = fileInput.files[0].name;
  }

  const notas = document.getElementById("inputNotasFirma").value.trim();
  const correoCorporativo = document.getElementById("correoInstitucionalAsignado").value || generarCorreoCorporativo(solicitudEnEdicion.nombreColaborador);

  // 1. Asignar código definitivo UNA SOLA VEZ
  const nuevoCodigoDefinitivo = generarCodigoDefinitivoUnico();

  // 2. Actualizar la solicitud en edición
  solicitudEnEdicion.estado = "Convenio firmado";
  solicitudEnEdicion.codigoColaborador = nuevoCodigoDefinitivo; // Código definitivo formal
  solicitudEnEdicion.idConvenioFirmado = `CONV-${new Date().getFullYear()}-${String(nuevoCodigoDefinitivo).padStart(4, "0")}`;

  solicitudEnEdicion.firma = {
    fechaFirma: fechaFirma,
    archivoNombre: archivoNombre,
    notas: notas,
    fechaRegistro: obtenerFechaHoy()
  };

  solicitudEnEdicion.credenciales = {
    correo: correoCorporativo,
    fechaEntrega: obtenerFechaHoy(),
    entregado: true
  };

  solicitudEnEdicion.historial.push({
    fecha: obtenerFechaHoy() + " " + new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
    accion: "Convenio firmado y formalizado",
    detalle: `Convenio formalizado. Asignado código definitivo: ${nuevoCodigoDefinitivo}. Credenciales institucionales otorgadas: ${correoCorporativo}.`
  });

  // 3. Actualizar la lista en memoria
  const idx = solicitudesList.findIndex((s) => s.idSolicitud === solicitudEnEdicion.idSolicitud);
  if (idx !== -1) {
    solicitudesList[idx] = JSON.parse(JSON.stringify(solicitudEnEdicion));
  } else {
    solicitudesList.push(JSON.parse(JSON.stringify(solicitudEnEdicion)));
  }

  // 4. Actualizar colaboradores en localStorage (Gestión de Colaboradores y Organigrama)
  sincronizarConColaboradoresStorage(solicitudEnEdicion, nuevoCodigoDefinitivo, correoCorporativo, fechaFirma, archivoNombre);

  // 5. Guardar en storage
  guardarConveniosEnStorage(solicitudesList);

  cerrarModalRegistrarFirma();
  volverAListado();
  cambiarPestana("firmados");

  mostrarAlerta(
    `✓ Convenio formalizado exitosamente. Código definitivo asignado: ${nuevoCodigoDefinitivo}. Credenciales institucionales: ${correoCorporativo}.`,
    "success"
  );
}

/**
 * Sincronizar colaborador con th_colaboradores y th_expedientes_ingreso_v1
 */
function sincronizarConColaboradoresStorage(sol, codigoDefinitivo, correoCorporativo, fechaFirma, archivoNombre) {
  try {
    const colaboradores = obtenerColaboradores();
    let colab = colaboradores.find(
      (c) => c.idColaborador === sol.idColaborador || normalizarTexto(c.numeroDocumento) === normalizarTexto(sol.numeroDocumento)
    );

    if (colab) {
      colab.codigoColaborador = codigoDefinitivo;
      colab.estado = "Activo";
      colab.correo = correoCorporativo;
      if (!colab.fechaIngreso) colab.fechaIngreso = sol.condiciones?.fechaInicio || obtenerFechaHoy();

      colab.fichaTalento = colab.fichaTalento || {};
      colab.fichaTalento.convenioFirmado = {
        idConvenioFirmado: sol.idConvenioFirmado,
        codigoDefinitivo: codigoDefinitivo,
        fechaFirma: fechaFirma,
        archivo: archivoNombre,
        correoCorporativo: correoCorporativo
      };
      if (colab.fichaTalento.periodos && colab.fichaTalento.periodos.length > 0) {
        const lastPeriod = colab.fichaTalento.periodos[colab.fichaTalento.periodos.length - 1];
        lastPeriod.firma = fechaFirma;
        lastPeriod.estadoConvenio = "Convenio firmado";
      }
      guardarColaboradores(colaboradores);
    } else {
      // Registrar nuevo colaborador activo
      const nombresSplit = sol.nombreColaborador.split(" ");
      const nombres = nombresSplit.slice(0, -2).join(" ") || nombresSplit[0];
      const apPaterno = nombresSplit[nombresSplit.length - 2] || "Colaborador";
      const apMaterno = nombresSplit[nombresSplit.length - 1] || "";

      const nuevoColaborador = {
        idColaborador: sol.idColaborador || `COL-${String(colaboradores.length + 1).padStart(3, "0")}`,
        codigoColaborador: codigoDefinitivo,
        tipoDocumento: sol.tipoDocumento || "DNI",
        numeroDocumento: sol.numeroDocumento,
        nombres: nombres,
        apellidoPaterno: apPaterno,
        apellidoMaterno: apMaterno,
        tipoColaborador: "Practicante",
        correo: correoCorporativo,
        telefono: "900000000",
        idDepartamento: sol.idDepartamento || "DEP-002",
        idArea: sol.idArea || "ARE-005",
        idSubArea: null,
        idRol: "ROL-005",
        foto: null,
        fechaIngreso: sol.condiciones?.fechaInicio || obtenerFechaHoy(),
        fechaSalida: null,
        estado: "Activo",
        fichaTalento: {
          expedienteId: sol.idColaborador,
          convenioFirmado: {
            idConvenioFirmado: sol.idConvenioFirmado,
            codigoDefinitivo: codigoDefinitivo,
            fechaFirma: fechaFirma,
            archivo: archivoNombre,
            correoCorporativo: correoCorporativo
          },
          periodos: [
            {
              id: sol.idPeriodo || `PER-${sol.idColaborador}`,
              inicio: sol.condiciones?.fechaInicio || obtenerFechaHoy(),
              meta: sol.condiciones?.horasAcordadas || 330,
              finPrevisto: sol.condiciones?.fechaFin,
              firma: fechaFirma,
              estadoConvenio: "Convenio firmado"
            }
          ]
        }
      };

      colaboradores.push(nuevoColaborador);
      guardarColaboradores(colaboradores);
    }

    // Actualizar expedientes en th_expedientes_ingreso_v1 si aplica
    try {
      const rawExp = localStorage.getItem("th_expedientes_ingreso_v1");
      if (rawExp) {
        const expList = JSON.parse(rawExp);
        if (Array.isArray(expList)) {
          const exp = expList.find(
            (e) => e.numeroDocumento === sol.numeroDocumento || e.expedienteId === sol.idColaborador
          );
          if (exp) {
            exp.aceptadoId = sol.idColaborador;
            exp.codigoColaborador = codigoDefinitivo;
            exp.estadoRevision = "Validado";
            localStorage.setItem("th_expedientes_ingreso_v1", JSON.stringify(expList));
          }
        }
      }
    } catch (eExp) {
      console.warn("No se pudo actualizar th_expedientes_ingreso_v1:", eExp);
    }

  } catch (error) {
    console.warn("Error al sincronizar con almacenamiento de colaboradores:", error);
  }
}

/**
 * ==========================================================================
 * MODAL: CONSULTA Y DETALLE DE CONVENIO FIRMADO (FIJO)
 * ==========================================================================
 */
function abrirDetalleConvenioFirmado(idSolicitud) {
  const sol = solicitudesList.find((s) => s.idSolicitud === idSolicitud);
  if (!sol) return;

  const iniciales = (sol.nombreColaborador || "TH")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  document.getElementById("verFirmadoCodigo").textContent = `CÓDIGO: ${sol.codigoColaborador}`;
  document.getElementById("verFirmadoAvatar").textContent = iniciales;
  document.getElementById("verFirmadoColaborador").textContent = sol.nombreColaborador;
  document.getElementById("verFirmadoArea").textContent = `${sol.area} · ${sol.practicante?.especialidad || "Especialidad formativa"}`;

  const fechaHoy = obtenerFechaHoy();
  const esVigente = (sol.condiciones?.fechaFin || "9999") >= fechaHoy;
  const badgeEstado = document.getElementById("verFirmadoEstadoBadge");
  badgeEstado.textContent = esVigente ? "Convenio Vigente" : "Convenio Finalizado";
  badgeEstado.className = `status-badge ${esVigente ? "status-vigente" : "status-finalizado"}`;

  // Datos de periodo y jornada
  document.getElementById("verFirmadoInicio").textContent = sol.condiciones?.fechaInicio || "—";
  document.getElementById("verFirmadoFin").textContent = sol.condiciones?.fechaFin || "—";
  document.getElementById("verFirmadoHoras").textContent = `${sol.condiciones?.horasAcordadas || 330} horas`;
  document.getElementById("verFirmadoFechaFirma").textContent = sol.firma?.fechaFirma || "—";

  // Credenciales y formalización
  document.getElementById("verFirmadoCodigoDefinitivo").textContent = sol.codigoColaborador;
  document.getElementById("verFirmadoCorreo").textContent = sol.credenciales?.correo || sol.correo || `${normalizarTexto(sol.nombreColaborador).replace(/\s+/g, ".")}@devdatep.com`;
  document.getElementById("verFirmadoFechaCredenciales").textContent = sol.credenciales?.fechaEntrega || sol.firma?.fechaFirma || obtenerFechaHoy();

  // Archivo firmado
  document.getElementById("verFirmadoNombreArchivo").textContent = sol.firma?.archivoNombre || "convenio_firmado.pdf";

  // Historial
  const listEl = document.getElementById("verFirmadoHistorial");
  listEl.innerHTML = "";
  const hist = sol.historial || [];
  [...hist].reverse().forEach((item) => {
    const li = document.createElement("li");
    li.className = "timeline-item";
    li.innerHTML = `
      <div class="timeline-dot" aria-hidden="true"></div>
      <div class="timeline-content">
        <span class="timeline-date">${escapeHTML(item.fecha)}</span>
        <strong class="timeline-title">${escapeHTML(item.accion)}</strong>
        <p class="timeline-detail">${escapeHTML(item.detalle)}</p>
      </div>
    `;
    listEl.appendChild(li);
  });

  // Botón para ver cláusulas oficiales completas
  const btnClausulas = document.getElementById("btnVerClausulasFirmadas");
  btnClausulas.onclick = () => {
    solicitudEnEdicion = JSON.parse(JSON.stringify(sol));
    abrirVistaPreviaDocumento();
  };

  document.getElementById("modalVerConvenioFirmado").hidden = false;
}

function cerrarDetalleConvenioFirmado() {
  document.getElementById("modalVerConvenioFirmado").hidden = true;
}

/**
 * ==========================================================================
 * INICIALIZACIÓN Y EVENT LISTENERS
 * ==========================================================================
 */
function init() {
  if (isConveniosInitialized) return;
  isConveniosInitialized = true;

  // Cargar datos desde localStorage o precargar iniciales
  solicitudesList = cargarConveniosDesdeStorage();

  // Sincronizar filtros con el DOM actual
  const searchInput = document.getElementById("searchInput");
  const filterArea = document.getElementById("filterArea");
  const filterEstado = document.getElementById("filterEstado");

  if (searchInput) currentSearchTerm = searchInput.value || "";
  if (filterArea) currentFilterArea = filterArea.value || "";
  if (filterEstado) currentFilterEstado = filterEstado.value || "";

  // Inicializar componentes
  inicializarFiltroAreas();
  actualizarKPIs();
  renderizarTablaSolicitudes();
  renderizarTablaFirmados();

  // Pestañas Horizontales
  document.getElementById("tabSolicitudes")?.addEventListener("click", () => cambiarPestana("solicitudes"));
  document.getElementById("tabFirmados")?.addEventListener("click", () => cambiarPestana("firmados"));

  // Buscador y Filtros
  searchInput?.addEventListener("input", (e) => {
    currentSearchTerm = e.target.value;
    renderizarTablaSolicitudes();
    renderizarTablaFirmados();
  });

  filterArea?.addEventListener("change", (e) => {
    currentFilterArea = e.target.value;
    renderizarTablaSolicitudes();
    renderizarTablaFirmados();
  });

  filterEstado?.addEventListener("change", (e) => {
    currentFilterEstado = e.target.value;
    renderizarTablaSolicitudes();
  });

  // Botón Recargar Datos
  document.getElementById("btnRecargarDatos")?.addEventListener("click", () => {
    solicitudesList = cargarConveniosDesdeStorage();
    actualizarKPIs();
    renderizarTablaSolicitudes();
    renderizarTablaFirmados();
    mostrarAlerta("Datos de convenios actualizados correctamente.", "info");
  });

  // Delegación de eventos en tablas (Gestionar y Ver)
  document.getElementById("tbodySolicitudes")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-gestionar]");
    if (btn) {
      abrirDetalleSolicitud(btn.dataset.gestionar);
    }
  });

  document.getElementById("tbodyFirmados")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-ver]");
    if (btn) {
      abrirDetalleConvenioFirmado(btn.dataset.ver);
    }
  });

  // Eventos de la Pantalla de Detalle
  document.getElementById("btnVolverSolicitudes")?.addEventListener("click", volverAListado);
  document.getElementById("btnGuardarBorrador")?.addEventListener("click", guardarBorrador);
  document.getElementById("btnGenerarDocFinal")?.addEventListener("click", generarDocumentoFinal);
  document.getElementById("btnIconoOjoPrevia")?.addEventListener("click", () => abrirVistaPreviaDocumento());
  document.getElementById("btnVistaPreviaDoc")?.addEventListener("click", () => abrirVistaPreviaDocumento());
  document.getElementById("btnRegistrarFirmaDetalle")?.addEventListener("click", abrirModalRegistrarFirma);

  // Selector de Plantilla
  document.getElementById("selectPlantilla")?.addEventListener("change", (e) => {
    if (solicitudEnEdicion) {
      solicitudEnEdicion.plantilla = e.target.value;
      const esPreProf = e.target.value === "pre-profesional";
      const puestoInput = document.getElementById("condPuesto");
      if (puestoInput) {
        puestoInput.value = `Practicante ${esPreProf ? "Pre-Profesional" : "Profesional"} de ${solicitudEnEdicion.area || "Talento Humano"}`;
      }
      mostrarAlerta(
        `Plantilla seleccionada: '${e.target.selectedOptions[0].text}'. Cláusulas actualizadas.`,
        "info"
      );
    }
  });

  // Eventos Modal Vista Previa Documento
  document.getElementById("btnClosePreview")?.addEventListener("click", cerrarVistaPreviaDocumento);
  document.getElementById("btnCerrarPreviewBottom")?.addEventListener("click", cerrarVistaPreviaDocumento);
  document.getElementById("btnPrintConvenio")?.addEventListener("click", () => {
    window.print();
  });

  // Eventos Modal Registro de Firma
  document.getElementById("btnCloseModalFirma")?.addEventListener("click", cerrarModalRegistrarFirma);
  document.getElementById("btnCancelarFirma")?.addEventListener("click", cerrarModalRegistrarFirma);
  document.getElementById("formRegistrarFirma")?.addEventListener("submit", confirmarRecepcionFirma);

  document.getElementById("btnUsarArchivoDemo")?.addEventListener("click", () => {
    demoSignedFileSelected = "firma.pdf";
    document.getElementById("archivoFirmadoSeleccionado").textContent = "✓ Archivo de muestra seleccionado: firma.pdf";
  });

  // Eventos Modal Ver Convenio Firmado
  document.getElementById("btnCloseVerFirmado")?.addEventListener("click", cerrarDetalleConvenioFirmado);
  document.getElementById("btnCloseVerFirmadoBottom")?.addEventListener("click", cerrarDetalleConvenioFirmado);
  document.getElementById("btnDescargarArchivoFirmado")?.addEventListener("click", () => {
    mostrarAlerta("Abriendo archivo firmado formal (firma.pdf)...", "info");
    window.open("../assets/documentos-ejemplo/firma.pdf", "_blank");
  });

  // Sincronización en tiempo real mediante evento storage
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY_CONVENIOS || e.key === "th_colaboradores" || e.key === null) {
      solicitudesList = cargarConveniosDesdeStorage();
      actualizarKPIs();
      renderizarTablaSolicitudes();
      renderizarTablaFirmados();
    }
  });

  // Revisar si se pasó una solicitud por parámetro URL o por localStorage al navegar desde Colaboradores
  const urlParam = new URLSearchParams(window.location.search).get("solicitud");
  const storedId = localStorage.getItem("th_convenio_activo_id");
  const targetId = urlParam || storedId;
  if (targetId) {
    localStorage.removeItem("th_convenio_activo_id");
    if (solicitudesList.some((s) => s.idSolicitud === targetId)) {
      abrirDetalleSolicitud(targetId);
    }
  }
}

// Arrancar inmediatamente si el DOM ya está listo, o escuchar evento si aún está cargando
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
