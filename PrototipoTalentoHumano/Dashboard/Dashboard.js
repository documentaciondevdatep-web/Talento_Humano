"use strict";

/**
 * ==========================================================================
 * DEVDATEP CONSULTING - DASHBOARD TALENTO HUMANO
 * Personalización dinámica por colaborador / cuenta de usuario.
 * ==========================================================================
 */

const modules = [
  {
    id: "organigrama",
    name: "Organigrama",
    description: "Estructura, equipos y liderazgo corporativo.",
    path: "Organigrama/Organigrama.html",
    group: "organizacion",
    icon: "◎"
  },
  {
    id: "colaboradores",
    name: "Colaboradores y reingresos",
    description: "Expedientes, revisión documental y postulantes.",
    path: "gestion de colaboradores y reingresos/GestionColaboradores.html",
    group: "organizacion",
    icon: "♙"
  },
  {
    id: "asistencia",
    name: "Asistencia y faltas",
    description: "Seguimiento diario de asistencia, tardanzas y justificaciones.",
    path: "gestion de asistencia y faltas/GestionAsistencia.html",
    group: "asistencia",
    icon: "✓"
  },
  {
    id: "conexion",
    name: "Tiempo de conexión",
    description: "Registro de conexiones, desconexiones y permanencia.",
    path: "gestion de tiempo de conexion/GestionConexion.html",
    group: "asistencia",
    icon: "◷"
  },
  {
    id: "hablado",
    name: "Tiempo hablado",
    description: "Seguimiento de participación y tiempo hablado en reuniones.",
    path: "gestion de tiempo hablado/GestionTiempoHablado.html",
    group: "asistencia",
    icon: "◌"
  },
  {
    id: "horarios",
    name: "Horarios y cruces",
    description: "Organización de turnos semanales y prevención de cruces.",
    path: "gestion de cruces de horario y horarios/GestionHorarios.html",
    group: "asistencia",
    icon: "▦"
  },
  {
    id: "feriados",
    name: "Feriados",
    description: "Calendario oficial de días no laborables y festivos.",
    path: "gestion de feriados/GestionFeriados.html",
    group: "asistencia",
    icon: "◇"
  },
  {
    id: "convenios",
    name: "Convenios",
    description: "Formalización, suscripción y seguimiento de convenios de prácticas.",
    path: "gestion de convenios/GestionConvenios.html",
    group: "documentos",
    icon: "▤"
  },
  {
    id: "documentos",
    name: "Documentos",
    description: "Certificados, constancias laborales y cartas.",
    path: "gestion de documentos/GestionDocumentos.html",
    group: "documentos",
    icon: "▱"
  },
  {
    id: "sanciones",
    name: "Sanciones",
    description: "Registro, tipificación y seguimiento de medidas disciplinarias.",
    path: "gestion de sanciones/GestionSanciones.html",
    group: "cierre",
    icon: "!"
  },
  {
    id: "bajas",
    name: "Bajas (Blacklist)",
    description: "Registro de desvinculaciones y evaluación de antecedentes.",
    path: "gestion de bajas (blacklist)/GestionBajas.html",
    group: "cierre",
    icon: "⊖"
  },
  {
    id: "accesos",
    name: "Accesos (cierre)",
    description: "Verificación del retiro y revocación de accesos digitales.",
    path: "gestion de accesos (cierre)/GestionAccesos.html",
    group: "cierre",
    icon: "⊞"
  }
];

const collaboratorModules = new Set([
  "colaboradores", "asistencia", "conexion", "hablado", "horarios", "sanciones", "bajas"
]);
modules.forEach((module) => {
  module.group = collaboratorModules.has(module.id) ? "personas" : module.id;
});

const groups = [
  {
    id: "organigrama",
    name: "Organigrama",
    description: "Estructura jerárquica, equipos y roles de liderazgo.",
    icon: "◎",
    moduleId: "organigrama"
  },
  {
    id: "personas",
    name: "Gestión de colaboradores",
    description: "Expedientes, revisión documental, asistencia, horarios y sanciones.",
    icon: "♙"
  },
  {
    id: "feriados",
    name: "Feriados",
    description: "Calendario de días no laborables y festividades oficiales.",
    icon: "◇",
    moduleId: "feriados"
  },
  {
    id: "convenios",
    name: "Convenios",
    description: "Gestión, emisión y firma de convenios de prácticas preprofesionales.",
    icon: "▤",
    moduleId: "convenios"
  },
  {
    id: "documentos",
    name: "Documentos",
    description: "Emisión de constancias de prácticas, cartas de presentación y certificados.",
    icon: "▱",
    moduleId: "documentos"
  },
  {
    id: "accesos",
    name: "Accesos (cierre)",
    description: "Protocolo de revocación y cierre de cuentas institucionales.",
    icon: "⊞",
    moduleId: "accesos"
  }
];

// Datos fijos del colaborador (Líder de Área en Talento Humano)
const USUARIO_FIJO = {
  nombres: "Mariana Lucía",
  apellidos: "Paredes Silva",
  nombreCompleto: "Mariana Lucía Paredes Silva",
  rol: "LÍDER DE ÁREA",
  departamento: "Talento Humano",
  area: "Talento Humano",
  correo: "mariana.paredes@devdatep.com",
  avatarColor: "#0284c7"
};

function getInitials(nombres, apellidos) {
  const n = (nombres || "").trim().split(" ")[0] || "";
  const a = (apellidos || "").trim().split(" ")[0] || "";
  return ((n[0] || "") + (a[0] || "")).toUpperCase() || "TH";
}

function actualizarUIUsuario(user) {
  const initials = getInitials(user.nombres, user.apellidos);
  const color = user.avatarColor || "#0284c7";

  // Topbar
  const headerName = document.querySelector("#headerUserName");
  if (headerName) headerName.textContent = user.nombreCompleto;

  const headerRole = document.querySelector("#headerUserRole");
  if (headerRole) headerRole.textContent = user.rol;

  const headerAvatar = document.querySelector("#headerAvatar");
  if (headerAvatar) {
    headerAvatar.textContent = initials;
    headerAvatar.style.background = color;
  }

  const headerArea = document.querySelector("#headerAreaBadge");
  if (headerArea) headerArea.textContent = (user.area || "Talento Humano").toUpperCase();

  // Sidebar
  const sidebarName = document.querySelector("#sidebarUserName");
  if (sidebarName) sidebarName.textContent = user.nombres;

  const sidebarRole = document.querySelector("#sidebarUserRole");
  if (sidebarRole) sidebarRole.textContent = user.rol;

  const sidebarAvatar = document.querySelector("#sidebarAvatar");
  if (sidebarAvatar) {
    sidebarAvatar.textContent = initials;
    sidebarAvatar.style.background = color;
  }

  const sidebarArea = document.querySelector("#sidebarAreaPill");
  if (sidebarArea) sidebarArea.textContent = (user.area || "Talento Humano").toUpperCase();

  // Banner personalizado de bienvenida
  const bannerName = document.querySelector("#bannerUserName");
  if (bannerName) bannerName.textContent = user.nombreCompleto;

  const bannerArea = document.querySelector("#bannerUserArea");
  if (bannerArea) bannerArea.textContent = user.area || "Talento Humano";
}

// Elementos DOM principales
const home = document.querySelector("#home");
const workspace = document.querySelector("#workspace");
const sidebar = document.querySelector("#sidebar");
const frame = document.querySelector("#moduleFrame");
const catalog = document.querySelector("#catalog");
const nav = document.querySelector("#navigation");

function renderCards() {
  catalog.replaceChildren();

  for (const group of groups) {
    const link = document.createElement("a");
    link.className = "general-card " + group.id;
    link.href = group.moduleId ? "#" + group.moduleId : "#bloque-" + group.id;

    link.innerHTML = `
      <span class="module-icon" aria-hidden="true">${group.icon}</span>
      <span class="card-copy">
        <strong>${group.name}</strong>
        <span>${group.description}</span>
      </span>
      <span class="card-arrow" aria-hidden="true">→</span>
    `;
    catalog.append(link);
  }
}

// Construcción de la navegación lateral
for (const group of groups) {
  if (group.moduleId) {
    const link = document.createElement("a");
    link.className = "nav-direct";
    link.href = "#" + group.moduleId;
    link.textContent = group.name;
    link.dataset.module = group.moduleId;
    nav.append(link);
    continue;
  }
  const details = document.createElement("details");
  details.dataset.group = group.id;
  const summary = document.createElement("summary");
  summary.textContent = group.name;
  details.append(summary);

  for (const module of modules.filter((item) => item.group === group.id)) {
    const link = document.createElement("a");
    link.href = "#" + module.id;
    link.textContent = module.name;
    link.dataset.module = module.id;
    details.append(link);
  }
  nav.append(details);
}

// Enrutamiento basado en hash
function route() {
  const rawHash = location.hash.slice(1);
  let id = rawHash;
  let targetTab = "";

  // Si se presiona el botón 'Ver Colaboradores' del banner, navega a la pestaña de colaboradores validados
  if (rawHash === "colaboradores-validados" || rawHash === "colaboradores-activos") {
    id = "colaboradores";
    targetTab = "active";
  }

  const module = modules.find((m) => m.id === id);
  const group = groups.find((g) => "bloque-" + g.id === id);

  if (id && id !== "inicio" && !module && !group) {
    location.replace("#inicio");
    return;
  }

  const opened = Boolean(module || group);
  const selection = module || group;

  home.hidden = opened;
  workspace.hidden = !opened;
  sidebar.hidden = !opened;

  document.body.classList.toggle("module-open", opened);
  document.body.classList.remove("nav-open");
  const menuBtn = document.querySelector("#menuToggle");
  if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");

  const breadcrumb = document.querySelector("#breadcrumb");
  if (breadcrumb) breadcrumb.textContent = opened ? selection.name : "Inicio";

  document.title = opened ? selection.name + " | Talento Humano" : "Inicio | Talento Humano";

  nav.querySelectorAll("a").forEach((a) => {
    if (a.dataset.module === id) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  const overview = document.querySelector("#groupOverview");
  overview.hidden = !group;
  frame.hidden = !module;
  const directLink = document.querySelector("#directLink");
  if (directLink) directLink.hidden = !module;

  if (group) {
    frame.removeAttribute("src");
    const parentGroup = nav.querySelector('[data-group="' + group.id + '"]');
    if (parentGroup) parentGroup.open = true;

    document.querySelector("#moduleTitle").textContent = group.name;
    overview.replaceChildren();

    const description = document.createElement("p");
    description.textContent = "Selecciona una opción para continuar:";
    overview.append(description);

    for (const item of modules.filter((m) => m.group === group.id)) {
      const link = document.createElement("a");
      link.className = "group-option";
      link.href = "#" + item.id;
      link.textContent = item.name + " →";
      overview.append(link);
    }
    document.querySelector("#moduleTitle").focus();
  } else if (module) {
    const parentGroup = nav.querySelector('[data-group="' + module.group + '"]');
    if (parentGroup) parentGroup.open = true;

    document.querySelector("#moduleTitle").textContent = module.name;
    let url = "../" + module.path;
    if (module.id === "colaboradores" && targetTab) {
      url += "#" + targetTab;
    } else if (module.id === "organigrama") {
      url += "?v=20261117-vertical-2";
    }
    directLink.href = url;
    frame.title = module.name;

    // Si el iframe ya está cargado en el mismo archivo, forzar el cambio de pestaña en la ventana interna
    if (frame.src && frame.src.includes(module.path)) {
      if (module.id === "colaboradores" && targetTab) {
        try {
          frame.contentWindow?.location.replace(url);
        } catch (e) {
          frame.src = url;
        }
      }
    } else {
      frame.src = url;
    }
    document.querySelector("#moduleTitle").focus();
  } else {
    frame.removeAttribute("src");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// Eventos de barra de navegación móvil
const menuToggle = document.querySelector("#menuToggle");
if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.body.classList.remove("nav-open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }
});

window.addEventListener("hashchange", route);

// Inicialización
function initDashboard() {
  try {
    localStorage.removeItem("th_usuario_activo");
  } catch (e) {}
  actualizarUIUsuario(USUARIO_FIJO);
  renderCards();
  route();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboard);
} else {
  initDashboard();
}
