import { areas, departamentos, subareas } from "../shared/data/catalogos.js";
import {
  obtenerColaboradorPorId,
  obtenerColaboradoresActivos,
  obtenerNombreArea,
  obtenerNombreDepartamento,
  obtenerNombreRol,
  obtenerNombreSubArea,
} from "../shared/js/colaboradoresStorage.js";

const chart = document.querySelector("#orgChart");
const viewport = document.querySelector("#chartViewport");
const searchInput = document.querySelector("#searchInput");
const departmentFilter = document.querySelector("#departmentFilter");
const resultsSummary = document.querySelector("#resultsSummary");
const liveStatus = document.querySelector("#liveStatus");
const zoomValue = document.querySelector("#zoomValue");
const detailDialog = document.querySelector("#detailDialog");
const dialogContent = document.querySelector("#dialogContent");
const toggleAllSectionsButton = document.querySelector("#toggleAllSectionsButton");
const exportDialog = document.querySelector("#exportDialog");
const exportForm = document.querySelector("#exportForm");
const startExportButton = document.querySelector("#startExportButton");

const clasesDepartamento = {
  "DEP-001": "department--people",
  "DEP-002": "department--development",
  "DEP-003": "department--commercial",
};

const expansion = {
  departments: new Set(),
  areas: new Set(),
  subareas: new Set(),
  areaCollaborators: new Set(),
  subareaCollaborators: new Set(),
};

let zoom = 1;
let autoFit = true;
const chartSizer = document.createElement("div");
chartSizer.className = "chart-sizer";
viewport.insertBefore(chartSizer, chart);
chartSizer.append(chart);
if (window.self !== window.top) document.body.classList.add("embedded");
let upperLeadershipExpanded = false;
let searchExpansion = createEmptyExpansion();
let suppressedSearchExpansion = new Set();
let lastQuery = "";

function createEmptyExpansion() {
  return {
    departments: new Set(),
    areas: new Set(),
    subareas: new Set(),
    areaCollaborators: new Set(),
    subareaCollaborators: new Set(),
    upperLeadership: false,
  };
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function getFullName(person) {
  return [person.nombres, person.apellidoPaterno, person.apellidoMaterno]
    .filter(Boolean)
    .join(" ");
}

function getVisibleIdentifier(person) {
  const firstName = String(person.nombres ?? "").trim().split(/\s+/)[0] ?? "";
  const paternalSurname = String(person.apellidoPaterno ?? "").trim();
  const name = [firstName, paternalSurname].filter(Boolean).join("_");
  const code = String(person.codigoColaborador ?? "").trim();
  return `${name}.${/^\d+$/.test(code) ? code : "Código pendiente"}`;
}

function createAvatar(person, interactive) {
  const avatar = createElement("span", "person-avatar");
  const name = getFullName(person);

  if (person.foto) {
    const image = document.createElement("img");
    image.src = person.foto;
    image.alt = `Fotografía de ${name}`;
    image.loading = interactive ? "lazy" : "eager";
    image.addEventListener(
      "error",
      () => {
        const placeholder = createElement("span", "avatar-placeholder");
        placeholder.setAttribute("role", "img");
        placeholder.setAttribute("aria-label", `Fotografía no disponible: ${name}`);
        image.replaceWith(placeholder);
      },
      { once: true },
    );
    avatar.append(image);
  } else {
    avatar.classList.add("avatar-placeholder");
    avatar.setAttribute("role", "img");
    avatar.setAttribute("aria-label", `Fotografía no disponible: ${name}`);
  }

  return avatar;
}

function createPersonCard(person, interactive) {
  const card = createElement(interactive ? "button" : "div", "person-card");
  if (interactive) {
    card.type = "button";
    card.setAttribute(
      "aria-label",
      `Ver detalles de ${getFullName(person)}, ${obtenerNombreRol(person.idRol) ?? "Rol no asignado"}`,
    );
  }
  card.dataset.colaboradorId = person.idColaborador;
  card.dataset.rolId = person.idRol;
  card.append(createAvatar(person, interactive));

  const copy = createElement("div", "person-copy");
  const name = createElement("span", "person-name", getVisibleIdentifier(person));
  const role = createElement(
    "span",
    "person-role",
    obtenerNombreRol(person.idRol) ?? "Rol no asignado",
  );
  copy.append(name, role);
  card.append(copy);
  return card;
}

function createUnassignedCard(idRole) {
  const roleName = obtenerNombreRol(idRole) ?? "Rol";
  const card = createElement("div", "person-card person-card--empty");
  card.setAttribute("aria-label", `${roleName} sin asignar`);
  const avatar = createElement("span", "person-avatar avatar-placeholder");
  avatar.setAttribute("role", "img");
  avatar.setAttribute("aria-label", "Sin asignar");
  const copy = createElement("div", "person-copy");
  copy.append(
    createElement("span", "person-name", "Sin asignar"),
    createElement("span", "person-role", roleName),
  );
  card.append(avatar, copy);
  return card;
}

function createPersonList(persons, interactive, emptyMessage = "Sin colaboradores activos") {
  const list = createElement("div", "people-list");
  if (persons.length === 0) {
    list.append(createElement("p", "empty-area", emptyMessage));
    return list;
  }
  persons.forEach((person) => list.append(createPersonCard(person, interactive)));
  return list;
}

function createRoleSlot(label, idRole, persons, interactive) {
  const slot = createElement("div", "role-card");
  slot.append(createElement("span", "role-card__label", label));
  if (persons.length) {
    slot.append(createPersonList(persons, interactive));
  } else {
    slot.append(createUnassignedCard(idRole));
  }
  return slot;
}

function createRoleStack(active, nodeType, id, interactive) {
  const stack = createElement(
    "div",
    nodeType === "department" ? "role-stack role-stack--department" : "role-stack",
  );
  const leaders = getNodeLeaders(active, nodeType, id);
  stack.append(
    createRoleSlot("Líder", "ROL-003", leaders.filter((person) => person.idRol === "ROL-003"), interactive),
    createRoleSlot("Co-líder", "ROL-004", leaders.filter((person) => person.idRol === "ROL-004"), interactive),
  );
  return stack;
}

function getNodeLeaders(active, nodeType, id) {
  return active.filter((person) => {
    if (person.idRol !== "ROL-003" && person.idRol !== "ROL-004") return false;
    if (nodeType === "department") {
      return (
        person.idDepartamento === id &&
        person.idArea == null &&
        person.idSubArea == null
      );
    }
    if (nodeType === "area") {
      return person.idArea === id && person.idSubArea == null;
    }
    return person.idSubArea === id;
  });
}

function getCollaborators(active, nodeType, id) {
  return active.filter((person) => {
    if (person.idRol !== "ROL-005") return false;
    return nodeType === "subarea"
      ? person.idSubArea === id
      : person.idArea === id && person.idSubArea == null;
  });
}

function countUnique(persons) {
  return new Set(persons.map((person) => person.idColaborador)).size;
}

function createExecutiveBranch(active, interactive) {
  const branch = createElement("section", "executive-branch");
  branch.setAttribute("aria-label", "Gerencia");
  const managerCard = createElement("section", "executive-card executive-card--main");
  managerCard.append(createElement("h2", "executive-label", "GERENTE GENERAL"));
  const managers = active.filter((person) => person.idRol === "ROL-001");
  managerCard.append(
    managers.length
      ? createPersonList(managers, interactive)
      : createElement("p", "management-note", "Sin asignar"),
  );

  const supportCard = createElement("section", "executive-card executive-card--support");
  supportCard.append(createElement("h2", "executive-label", "GERENCIA"));
  const management = active.filter((person) => person.idRol === "ROL-002");
  supportCard.append(
    management.length
      ? createPersonList(management, interactive)
      : createElement("p", "management-note", "Sin asignar"),
  );

  branch.append(managerCard, supportCard);
  return branch;
}

function nodeExpansionKey(nodeType, id) {
  return `${nodeType}:${id}`;
}

function isExpanded(group, id) {
  if (expansion[group].has(id)) return true;
  return (
    searchExpansion[group].has(id) &&
    !suppressedSearchExpansion.has(nodeExpansionKey(group, id))
  );
}

function createNodeHeading({
  nodeType,
  id,
  title,
  count,
  level,
  interactive,
  expanded,
  controlsId,
}) {
  const headingClass =
    nodeType === "department"
      ? "department-heading"
      : nodeType === "area"
        ? "area-heading"
        : "subarea-heading";
  const heading = createElement(
    interactive ? "button" : "div",
    `node-heading node-heading--${nodeType} ${headingClass}`,
  );
  if (interactive) {
    heading.type = "button";
    heading.dataset.nodeToggle = nodeType;
    heading.dataset.nodeId = id;
    heading.id = `${nodeType}-toggle-${id}`;
    heading.setAttribute("aria-expanded", String(expanded));
    heading.setAttribute("aria-controls", controlsId);
  }
  heading.append(
    createElement(`h${level}`, "node-title", title),
    createElement("span", "node-count", String(count)),
  );
  if (interactive) heading.append(createElement("span", "node-chevron", "⌄"));
  return heading;
}

function createCollaboratorToggle(nodeType, id, expanded, controlsId) {
  const toggle = createElement(
    "button",
    "collaborators-toggle",
    expanded ? "Ocultar colaboradores" : "Mostrar colaboradores",
  );
  toggle.type = "button";
  toggle.dataset.collaboratorsToggle = nodeType;
  toggle.dataset.nodeId = id;
  toggle.setAttribute("aria-expanded", String(expanded));
  toggle.setAttribute("aria-controls", controlsId);
  return toggle;
}

function createNodePeoplePanel({
  nodeType,
  id,
  active,
  visibleIds,
  query,
  interactive,
  expanded,
  collaboratorsExpanded,
}) {
  const panel = createElement("section", `node-people node-people--${nodeType}`);
  panel.id = `${nodeType}-people-${id}`;
  panel.hidden = !expanded;
  panel.setAttribute("aria-label", `Liderazgo de ${nodeType}`);
  panel.append(createRoleStack(active, nodeType, id, interactive));

  if (nodeType === "area" || nodeType === "subarea") {
    const collaboratorPanelId = `collaborators-panel-${nodeType}-${id}`;
    if (interactive) {
      panel.append(
        createCollaboratorToggle(
          nodeType,
          id,
          collaboratorsExpanded,
          collaboratorPanelId,
        ),
      );
    }

    const collaboratorPanel = createElement("div", "collaborators-panel");
    collaboratorPanel.id = collaboratorPanelId;
    collaboratorPanel.hidden = !collaboratorsExpanded;
    const collaborators = getCollaborators(active, nodeType, id).filter(
      (person) => !query || visibleIds.has(person.idColaborador),
    );
    collaboratorPanel.append(createPersonList(collaborators, interactive));
    panel.append(collaboratorPanel);
  }
  return panel;
}

function createSubarea({
  subarea,
  active,
  visibleIds,
  query,
  interactive,
  includePeople,
}) {
  const box = createElement("section", "sub-area");
  box.dataset.subareaId = subarea.idSubArea;
  box.dataset.areaId = subarea.idArea;
  const title = obtenerNombreSubArea(subarea.idSubArea) ?? subarea.nombre;
  const collaborators = getCollaborators(active, "subarea", subarea.idSubArea);
  const panelId = `subarea-people-${subarea.idSubArea}`;
  const expanded = includePeople && interactive && isExpanded("subareas", subarea.idSubArea);
  const collaboratorsExpanded =
    includePeople &&
    interactive &&
    isExpanded("subareaCollaborators", subarea.idSubArea);

  box.append(
    createNodeHeading({
      nodeType: "subarea",
      id: subarea.idSubArea,
      title,
      count: countUnique(active.filter((person) => person.idSubArea === subarea.idSubArea)),
      level: 4,
      interactive,
      expanded,
      controlsId: panelId,
    }),
  );

  if (includePeople) {
    box.append(
      createNodePeoplePanel({
        nodeType: "subarea",
        id: subarea.idSubArea,
        active,
        visibleIds,
        query,
        interactive,
        expanded:
          interactive
            ? expanded
            : true,
        collaboratorsExpanded:
          interactive
            ? collaboratorsExpanded
            : true,
      }),
    );
  }
  return box;
}

function createArea({
  area,
  active,
  visibleIds,
  query,
  interactive,
  includePeople,
  includeAreaPeople,
  subareaIds,
}) {
  const box = createElement("section", "area-box");
  box.dataset.areaId = area.idArea;
  const title = obtenerNombreArea(area.idArea) ?? area.nombre;
  const collaborators = getCollaborators(active, "area", area.idArea);
  const panelId = `area-people-${area.idArea}`;
  const expanded = includePeople && interactive && isExpanded("areas", area.idArea);
  const collaboratorsExpanded =
    includePeople &&
    interactive &&
    isExpanded("areaCollaborators", area.idArea);

  box.append(
    createNodeHeading({
      nodeType: "area",
      id: area.idArea,
      title,
      count: countUnique(active.filter((person) => person.idArea === area.idArea)),
      level: 3,
      interactive,
      expanded,
      controlsId: panelId,
    }),
  );

  if (includePeople && includeAreaPeople) {
    box.append(
      createNodePeoplePanel({
        nodeType: "area",
        id: area.idArea,
        active,
        visibleIds,
        query,
        interactive,
        expanded: interactive ? expanded : true,
        collaboratorsExpanded: interactive ? collaboratorsExpanded : true,
      }),
    );
  }

  const childSubareas = subareas.filter(
    (subarea) =>
      subarea.idArea === area.idArea &&
      (!subareaIds || subareaIds.includes(subarea.idSubArea)),
  );
  if (childSubareas.length) {
    const subareaList = createElement("div", "sub-area-list");
    childSubareas.forEach((subarea) =>
      subareaList.append(
        createSubarea({
          subarea,
          active,
          visibleIds,
          query,
          interactive,
          includePeople,
        }),
      ),
    );
    box.append(subareaList);
  }
  return box;
}

function createDepartment({
  department,
  active,
  visibleIds,
  query,
  interactive,
  includePeople,
  areasForDepartment,
  includeDepartmentLeadership,
  includeAreaPeople,
  subareaIds,
}) {
  const column = createElement(
    "div",
    `department-column ${clasesDepartamento[department.idDepartamento] ?? "department--default"}`,
  );
  column.dataset.departamentoId = department.idDepartamento;
  const departmentActive = active.filter(
    (person) => person.idDepartamento === department.idDepartamento,
  );
  const departmentPeopleId = `department-people-${department.idDepartamento}`;
  const departmentExpanded =
    includePeople &&
    interactive &&
    isExpanded("departments", department.idDepartamento);
  const card = createElement("section", "department-card");

  card.append(
    createNodeHeading({
      nodeType: "department",
      id: department.idDepartamento,
      title:
        obtenerNombreDepartamento(department.idDepartamento) ?? department.nombre,
      count: countUnique(departmentActive),
      level: 2,
      interactive,
      expanded: departmentExpanded,
      controlsId: departmentPeopleId,
    }),
  );

  if (includePeople && includeDepartmentLeadership) {
    const leadership = createElement("section", "department-people");
    leadership.id = departmentPeopleId;
    leadership.hidden = interactive && !departmentExpanded;
    leadership.setAttribute("aria-label", "Liderazgo departamental");
    leadership.append(
      createRoleStack(departmentActive, "department", department.idDepartamento, interactive),
    );
    card.append(leadership);
  }

  const departmentStem = createElement("div", "department-stem");
  departmentStem.setAttribute("aria-hidden", "true");
  card.append(departmentStem);

  const areaList = createElement("div", "area-list");
  areaList.style.setProperty("--area-count", String(areasForDepartment.length));
  areasForDepartment.forEach((area) =>
    areaList.append(
      createArea({
        area,
        active,
        visibleIds,
        query,
        interactive,
        includePeople,
        includeAreaPeople,
        subareaIds,
      }),
    ),
  );
  card.append(areaList);
  column.append(card);
  return column;
}

function createRootHeading(interactive, upperExpanded) {
  const root = createElement("section", "org-root-node");
  root.append(
    createElement("span", "org-root-eyebrow", "ORGANIZACIÓN"),
    createElement("h1", "org-root-title", "Devdatep Consulting"),
  );
  if (interactive) {
    const button = createElement(
      "button",
      "upper-leadership-toggle",
      upperExpanded ? "Ocultar Gerencia" : "Mostrar liderazgo superior",
    );
    button.type = "button";
    button.dataset.upperLeadershipToggle = "true";
    button.setAttribute("aria-expanded", String(upperExpanded));
    button.setAttribute("aria-controls", "executiveBranch");
    root.append(button);
  }
  return root;
}

function alignHorizontalConnectors(container, railSelector, childSelector) {
  container.querySelectorAll(railSelector).forEach((rail) => {
    const children = [...rail.querySelectorAll(`:scope > ${childSelector}`)];
    if (!children.length) return;
    const railRect = rail.getBoundingClientRect();
    const firstRect = children[0].getBoundingClientRect();
    const lastRect = children[children.length - 1].getBoundingClientRect();
    const scale = rail.offsetWidth ? railRect.width / rail.offsetWidth : 1;
    const firstCenter = (firstRect.left + firstRect.width / 2 - railRect.left) / scale;
    const lastCenter = (lastRect.left + lastRect.width / 2 - railRect.left) / scale;
    rail.style.setProperty("--rail-start", `${firstCenter}px`);
    rail.style.setProperty("--rail-end", `${rail.offsetWidth - lastCenter}px`);
    rail.classList.toggle("has-multiple-nodes", children.length > 1);
  });
}

function renderChart(container, {
  active,
  visible,
  query,
  departmentId,
  includePeople = true,
  interactive = true,
  includeUpperLeadership = false,
  departmentIds = null,
  areaIds = null,
  includeDepartmentLeadership = true,
  includeAreaPeople = true,
  subareaIds = null,
}) {
  container.replaceChildren();
  const visibleIds = new Set(visible.map((person) => person.idColaborador));
  const upperExpanded =
    interactive &&
    (upperLeadershipExpanded ||
      (searchExpansion.upperLeadership &&
        !suppressedSearchExpansion.has("upperLeadership")));
  const rootBranch = createElement("div", "org-root-branch");
  rootBranch.append(createRootHeading(interactive, upperExpanded));
  container.append(rootBranch);

  const showUpperLeadership =
    includePeople &&
    (interactive
      ? upperExpanded
      : includeUpperLeadership);
  if (includePeople && interactive) {
    const executiveBranch = createExecutiveBranch(active, interactive);
    executiveBranch.id = "executiveBranch";
    executiveBranch.hidden = !showUpperLeadership;
    container.append(executiveBranch);
  } else if (showUpperLeadership) {
    const executiveBranch = createExecutiveBranch(active, interactive);
    executiveBranch.id = "executiveBranch";
    container.append(executiveBranch);
  }

  const stem = createElement("div", "org-root-stem");
  stem.setAttribute("aria-hidden", "true");
  container.append(stem);

  const selectedDepartments = departamentos.filter(
    (department) =>
      (!departmentId || department.idDepartamento === departmentId) &&
      (!departmentIds || departmentIds.includes(department.idDepartamento)),
  );
  const departmentGrid = createElement(
    "div",
    `departments-grid${selectedDepartments.length === 1 ? " departments-grid--single" : ""}`,
  );
  selectedDepartments.forEach((department) => {
    const departmentAreas = areas.filter(
      (area) =>
        area.idDepartamento === department.idDepartamento &&
        (!areaIds || areaIds.includes(area.idArea)),
    );
    departmentGrid.append(
      createDepartment({
        department,
        active,
        visibleIds,
        query,
        interactive,
        includePeople,
        areasForDepartment: departmentAreas,
        includeDepartmentLeadership,
        includeAreaPeople,
        subareaIds,
      }),
    );
  });
  container.append(departmentGrid);

  if (container.isConnected) {
    alignHorizontalConnectors(container, ".departments-grid", ".department-column");
    alignHorizontalConnectors(container, ".area-list", ".area-box");
  }
}

function createSearchExpansion(results, query) {
  const expanded = createEmptyExpansion();
  if (!query) return expanded;

  results.forEach((person) => {
    if (person.idRol === "ROL-001" || person.idRol === "ROL-002") {
      expanded.upperLeadership = true;
    } else if (person.idRol === "ROL-003" || person.idRol === "ROL-004") {
      if (person.idSubArea) expanded.subareas.add(person.idSubArea);
      else if (person.idArea) expanded.areas.add(person.idArea);
      else if (person.idDepartamento) expanded.departments.add(person.idDepartamento);
    } else if (person.idRol === "ROL-005") {
      if (person.idSubArea) {
        expanded.subareas.add(person.idSubArea);
        expanded.subareaCollaborators.add(person.idSubArea);
      } else if (person.idArea) {
        expanded.areas.add(person.idArea);
        expanded.areaCollaborators.add(person.idArea);
      }
    }
  });
  return expanded;
}

function matchesSearch(person, query) {
  if (!query) return true;
  const text = normalizeText(
    [
      person.nombres,
      person.apellidoPaterno,
      person.apellidoMaterno,
      getVisibleIdentifier(person),
      obtenerNombreRol(person.idRol),
      obtenerNombreDepartamento(person.idDepartamento),
      obtenerNombreArea(person.idArea),
      obtenerNombreSubArea(person.idSubArea),
    ].join(" "),
  );
  return text.includes(query);
}

function updateResultsSummary(results, scope, query) {
  resultsSummary.replaceChildren();
  resultsSummary.append(
    createElement("strong", "", String(results.length)),
    document.createTextNode(
      query
        ? ` resultados de ${scope.length} colaboradores activos`
        : ` colaboradores activos`,
    ),
  );
}

function updateToggleAllLabel() {
  const allExpanded =
    upperLeadershipExpanded &&
    [...departamentos].every((department) =>
      expansion.departments.has(department.idDepartamento),
    ) &&
    [...areas].every((area) => expansion.areas.has(area.idArea)) &&
    [...subareas].every((subarea) => expansion.subareas.has(subarea.idSubArea)) &&
    [...areas].every((area) =>
      expansion.areaCollaborators.has(area.idArea),
    ) &&
    [...subareas].every((subarea) =>
      expansion.subareaCollaborators.has(subarea.idSubArea),
    );
  toggleAllSectionsButton.textContent = allExpanded ? "Ocultar" : "Mostrar todo";
  toggleAllSectionsButton.setAttribute("aria-expanded", String(allExpanded));
}

function renderOrganigrama() {
  const active = obtenerColaboradoresActivos();
  const departmentId = departmentFilter.value;
  const query = normalizeText(searchInput.value);
  if (query !== lastQuery) {
    suppressedSearchExpansion.clear();
    lastQuery = query;
  }

  const departmentScope = active.filter(
    (person) => !departmentId || person.idDepartamento === departmentId,
  );
  const visible = departmentScope.filter((person) => matchesSearch(person, query));
  searchExpansion = createSearchExpansion(visible, query);
  updateResultsSummary(visible, departmentScope, query);
  renderChart(chart, {
    active,
    visible,
    query,
    departmentId,
    includePeople: true,
    interactive: true,
  });
  updateZoomLayout();
  updateToggleAllLabel();
}

function setExpanded(group, id, expanded) {
  if (expanded) expansion[group].add(id);
  else expansion[group].delete(id);
}

function toggleExpansion(group, id) {
  const currentlyExpanded =
    expansion[group].has(id) ||
    (searchExpansion[group].has(id) &&
      !suppressedSearchExpansion.has(nodeExpansionKey(group, id)));
  setExpanded(group, id, !currentlyExpanded);
  if (searchExpansion[group].has(id)) {
    const key = nodeExpansionKey(group, id);
    if (expansion[group].has(id)) suppressedSearchExpansion.delete(key);
    else suppressedSearchExpansion.add(key);
  }
  renderOrganigrama();
}

function toggleUpperLeadership() {
  const searchOpen =
    searchExpansion.upperLeadership &&
    !suppressedSearchExpansion.has("upperLeadership");
  const currentlyExpanded = upperLeadershipExpanded || searchOpen;
  upperLeadershipExpanded = !currentlyExpanded;
  if (searchExpansion.upperLeadership) {
    if (upperLeadershipExpanded) suppressedSearchExpansion.delete("upperLeadership");
    else suppressedSearchExpansion.add("upperLeadership");
  }
  renderOrganigrama();
}

function fillAllExpansion(expanded) {
  const update = (set, values, key) => {
    set.clear();
    if (expanded) values.forEach((value) => set.add(value[key]));
  };
  update(expansion.departments, departamentos, "idDepartamento");
  update(expansion.areas, areas, "idArea");
  update(expansion.subareas, subareas, "idSubArea");
  update(expansion.areaCollaborators, areas, "idArea");
  update(expansion.subareaCollaborators, subareas, "idSubArea");
  upperLeadershipExpanded = expanded;
}

function toggleAllSections() {
  const currentlyAllExpanded =
    toggleAllSectionsButton.getAttribute("aria-expanded") === "true";
  fillAllExpansion(!currentlyAllExpanded);
  searchInput.value = "";
  departmentFilter.value = "";
  suppressedSearchExpansion.clear();
  renderOrganigrama();
  viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2);
}

function updateZoomLayout() {
  chart.style.transform = 'none';
  chart.style.marginRight = '0';
  chart.style.marginBottom = '0';
  alignHorizontalConnectors(chart, '.departments-grid', '.department-column');
  alignHorizontalConnectors(chart, '.area-list', '.area-box');
  const width = chart.offsetWidth;
  const height = chart.offsetHeight;
  if (autoFit && width && height) {
    zoom = Math.min(1, Math.max(0.05, Math.min((viewport.clientWidth - 24) / width, (viewport.clientHeight - 24) / height)));
  }
  chartSizer.style.width = Math.ceil(width * zoom) + 'px';
  chartSizer.style.height = Math.ceil(height * zoom) + 'px';
  chart.style.transform = 'scale(' + zoom + ')';
  zoomValue.value = Math.round(zoom * 100) + '%';
  zoomValue.textContent = zoomValue.value;
}

function setZoom(nextZoom) {
  autoFit = false;
  zoom = Math.min(1.5, Math.max(0.05, Math.round(nextZoom * 100) / 100));
  updateZoomLayout();
}

function fitToScreen() {
  autoFit = true;
  updateZoomLayout();
  viewport.scrollTo({ top: 0, left: 0 });
}

function resetView() {
  setZoom(1);
  viewport.scrollTo({ top: 0, left: 0 });
}

function addDetail(list, label, value) {
  if (!value) return;
  const row = createElement("div", "detail-row");
  row.append(createElement("dt", "", label), createElement("dd", "", value));
  list.append(row);
}

function showDetails(id) {
  const person = obtenerColaboradorPorId(id);
  if (!person || person.estado !== "Activo") {
    renderOrganigrama();
    setStatus("Los datos cambiaron; se actualizó el organigrama.");
    return;
  }

  dialogContent.replaceChildren();
  const personBlock = createElement("div", "dialog-person");
  personBlock.append(createAvatar(person, true));
  const identity = createElement("div");
  const fullName = createElement("h2", "", getFullName(person));
  fullName.id = "dialogName";
  identity.append(
    fullName,
    createElement("p", "", obtenerNombreRol(person.idRol) ?? "Rol no asignado"),
  );
  personBlock.append(identity);

  const details = createElement("dl", "detail-list");
  addDetail(details, "Código", person.codigoColaborador ? `Código ${person.codigoColaborador}` : "Código pendiente");
  addDetail(details, "Departamento", obtenerNombreDepartamento(person.idDepartamento));
  addDetail(details, "Área", obtenerNombreArea(person.idArea));
  addDetail(details, "Subárea", obtenerNombreSubArea(person.idSubArea));
  addDetail(details, "Rol", obtenerNombreRol(person.idRol));
  addDetail(details, "Tipo", person.tipoColaborador);
  addDetail(details, "Correo", person.correo);
  addDetail(details, "Teléfono", person.telefono);

  dialogContent.append(personBlock, details);
  detailDialog.showModal();
}

function setStatus(message, isError = false) {
  liveStatus.textContent = message;
  if (isError) liveStatus.dataset.state = "error";
  else delete liveStatus.dataset.state;
}

function localDateStamp() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function createAllExpandedState() {
  return {
    departments: new Set(departamentos.map((department) => department.idDepartamento)),
    areas: new Set(areas.map((area) => area.idArea)),
    subareas: new Set(subareas.map((subarea) => subarea.idSubArea)),
    areaCollaborators: new Set(areas.map((area) => area.idArea)),
    subareaCollaborators: new Set(subareas.map((subarea) => subarea.idSubArea)),
  };
}

function createExportDiagram(
  type,
  departmentIds,
  includeUpperLeadership,
  areaIds = null,
  includeDepartmentLeadership = true,
  subareaIds = null,
  includeAreaPeople = true,
) {
  const active = obtenerColaboradoresActivos();
  const exportChart = createElement("div", "org-chart org-chart--export");
  exportChart.dataset.exportType = type;
  exportChart.style.position = "fixed";
  exportChart.style.left = "-100000px";
  exportChart.style.top = "0";
  exportChart.style.width = "max-content";
  exportChart.style.minWidth = "0";
  exportChart.style.zoom = "1";
  renderChart(exportChart, {
    active,
    visible: active,
    query: "",
    departmentId: "",
    includePeople: type === "complete",
    interactive: false,
    includeUpperLeadership,
    departmentIds,
    areaIds,
    includeDepartmentLeadership,
    includeAreaPeople,
    subareaIds,
  });
  document.body.append(exportChart);
  alignHorizontalConnectors(exportChart, ".departments-grid", ".department-column");
  alignHorizontalConnectors(exportChart, ".area-list", ".area-box");
  return exportChart;
}

function calculateCaptureScale(width, height) {
  const maxDimension = 15000;
  const maxPixels = 48_000_000;
  return Math.min(
    2,
    maxDimension / width,
    maxDimension / height,
    Math.sqrt(maxPixels / (width * height)),
  );
}

function waitForImages(container) {
  const images = [...container.querySelectorAll("img")];
  return Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    }),
  );
}

async function createExportCanvas(exportChart) {
  await new Promise((resolve) => requestAnimationFrame(resolve));
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  await waitForImages(exportChart);

  const bounds = exportChart.getBoundingClientRect();
  const width = Math.ceil(Math.max(bounds.width, exportChart.scrollWidth));
  const height = Math.ceil(Math.max(bounds.height, exportChart.scrollHeight));
  if (!width || !height) {
    throw new Error("No se pudo determinar el tamaño del organigrama para exportar.");
  }

  const scale = calculateCaptureScale(width, height);
  const canvas = await window.html2canvas(exportChart, {
    backgroundColor: "#f4f7fb",
    scale,
    useCORS: true,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
  });
  return { canvas, width, height };
}

function downloadCanvas(canvas, type) {
  const link = document.createElement("a");
  const typeName = type === "basic" ? "Basico" : "Completo";
  link.href = canvas.toDataURL("image/png");
  link.download = `Organigrama_${typeName}_Devdatep_${localDateStamp()}.png`;
  document.body.append(link);
  link.click();
  link.remove();
}

async function exportPng(type) {
  if (!window.html2canvas) {
    setStatus("No se pudo exportar PNG porque html2canvas no está disponible.", true);
    return;
  }

  const exportChart = createExportDiagram(
    type,
    null,
    type === "complete",
  );
  try {
    const { canvas } = await createExportCanvas(exportChart);
    downloadCanvas(canvas, type);
    setStatus(
      `Organigrama ${type === "basic" ? "básico" : "completo"} exportado en PNG.`,
    );
  } catch (error) {
    console.error("Error al exportar PNG:", error);
    setStatus(`No se pudo exportar el PNG: ${error.message}`, true);
  } finally {
    exportChart.remove();
  }
}

function addCanvasToPdf(pdf, canvas, captureScale) {
  const pageWidth = 420;
  const pageHeight = 297;
  const margin = 8;
  const imageWidthMm = (canvas.width / captureScale) * (25.4 / 96);
  const imageHeightMm = (canvas.height / captureScale) * (25.4 / 96);
  const scale = Math.min(
    (pageWidth - margin * 2) / imageWidthMm,
    (pageHeight - margin * 2) / imageHeightMm,
  );
  const width = imageWidthMm * scale;
  const height = imageHeightMm * scale;
  const x = (pageWidth - width) / 2;
  const y = (pageHeight - height) / 2;
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, y, width, height, undefined, "FAST");
}

async function exportPdf(type) {
  if (!window.jspdf || !window.html2canvas) {
    setStatus("No se pudo exportar PDF porque las librerías requeridas no están disponibles.", true);
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a3",
    compress: true,
  });
  const selectedDepartments = [...departamentos];
  const pages =
    type === "basic"
      ? selectedDepartments.map((department) => ({
          department,
          areaIds: null,
          includeUpperLeadership: false,
          includeDepartmentLeadership: false,
        }))
      : selectedDepartments.flatMap((department) => {
          const departmentAreas = areas.filter(
            (area) => area.idDepartamento === department.idDepartamento,
          );
          const departmentPages = [];
          departmentAreas.forEach((area, index) => {
            const childSubareas = subareas.filter(
              (subarea) => subarea.idArea === area.idArea,
            );
            departmentPages.push({
              department,
              areaIds: [area.idArea],
              subareaIds: childSubareas.length ? [] : null,
              includeAreaPeople: true,
              includeUpperLeadership: false,
              includeDepartmentLeadership: index === 0,
            });
            childSubareas.forEach((subarea) => {
              departmentPages.push({
                department,
                areaIds: [area.idArea],
                subareaIds: [subarea.idSubArea],
                includeAreaPeople: false,
                includeUpperLeadership: false,
                includeDepartmentLeadership: false,
              });
            });
          });
          return departmentPages;
        });
  let pageCount = 0;

  try {
    for (const page of pages) {
      if (pageCount) pdf.addPage("a3", "landscape");
      const exportChart = createExportDiagram(
        type,
        [page.department.idDepartamento],
        type === "complete" && pageCount === 0,
        page.areaIds,
        page.includeDepartmentLeadership,
        page.subareaIds,
        page.includeAreaPeople,
      );
      try {
        const { canvas, width, height } = await createExportCanvas(exportChart);
        const captureScale = canvas.width / width;
        addCanvasToPdf(pdf, canvas, captureScale);
      } finally {
        exportChart.remove();
      }
      pageCount += 1;
    }

    const typeName = type === "basic" ? "Basico" : "Completo";
    pdf.save(`Organigrama_${typeName}_Devdatep_${localDateStamp()}.pdf`);
    setStatus(
      `Organigrama ${type === "basic" ? "básico" : "completo"} exportado en PDF A3 (${pageCount} páginas).`,
    );
  } catch (error) {
    console.error("Error al exportar PDF:", error);
    setStatus(`No se pudo exportar el PDF: ${error.message}`, true);
  }
}

function populateDepartmentFilter() {
  departamentos.forEach((department) => {
    const option = document.createElement("option");
    option.value = department.idDepartamento;
    option.textContent =
      obtenerNombreDepartamento(department.idDepartamento) ?? department.nombre;
    departmentFilter.append(option);
  });
}

populateDepartmentFilter();
searchInput.addEventListener("input", renderOrganigrama);
departmentFilter.addEventListener("change", () => {
  renderOrganigrama();
  viewport.scrollLeft = 0;
  viewport.scrollTop = 0;
});
toggleAllSectionsButton.addEventListener("click", toggleAllSections);

document.querySelector("#zoomInButton").addEventListener("click", () => {
  setZoom(zoom + 0.1);
});
document.querySelector("#zoomOutButton").addEventListener("click", () => {
  setZoom(zoom - 0.1);
});
document.querySelector("#resetViewButton").addEventListener("click", resetView);
document.querySelector("#closeDialogButton").addEventListener("click", () => {
  detailDialog.close();
});

document.querySelector("#openExportDialogButton").addEventListener("click", () => {
  exportDialog.showModal();
});
document.querySelector("#closeExportDialogButton").addEventListener("click", () => {
  exportDialog.close();
});
document.querySelector("#cancelExportButton").addEventListener("click", () => {
  exportDialog.close();
});
exportForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const type = exportForm.elements.namedItem("exportType").value;
  const format = exportForm.elements.namedItem("exportFormat").value;
  exportDialog.close();
  startExportButton.disabled = true;
  try {
    if (format === "png") await exportPng(type);
    else await exportPdf(type);
  } finally {
    startExportButton.disabled = false;
  }
});

chart.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const upperToggle = target.closest("[data-upper-leadership-toggle]");
  if (upperToggle) {
    toggleUpperLeadership();
    return;
  }

  const collaboratorToggle = target.closest("[data-collaborators-toggle]");
  if (collaboratorToggle) {
    const nodeType = collaboratorToggle.dataset.collaboratorsToggle;
    const group =
      nodeType === "subarea"
        ? "subareaCollaborators"
        : "areaCollaborators";
    toggleExpansion(group, collaboratorToggle.dataset.nodeId);
    return;
  }

  const nodeToggle = target.closest("[data-node-toggle]");
  if (nodeToggle) {
    const nodeType = nodeToggle.dataset.nodeToggle;
    const group =
      nodeType === "department"
        ? "departments"
        : nodeType === "subarea"
          ? "subareas"
          : "areas";
    toggleExpansion(group, nodeToggle.dataset.nodeId);
    return;
  }

  const personCard = target.closest("[data-colaborador-id]");
  if (personCard) showDetails(personCard.dataset.colaboradorId);
});

viewport.addEventListener(
  "wheel",
  (event) => {
    if (event.ctrlKey) {
      event.preventDefault();
      setZoom(zoom + (event.deltaY < 0 ? 0.1 : -0.1));
    }
  },
  { passive: false },
);

window.addEventListener("colaboradoresActualizados", () => {
  renderOrganigrama();
  setStatus("Organigrama sincronizado con los colaboradores.");
});

window.addEventListener("storage", (event) => {
  if (event.key === "th_colaboradores" || event.key === null) {
    renderOrganigrama();
    setStatus("Organigrama sincronizado con los colaboradores.");
  }
});

setZoom(1);
renderOrganigrama();
requestAnimationFrame(() => {
  viewport.scrollLeft = Math.max(0, (chart.scrollWidth - viewport.clientWidth) / 2);
});
