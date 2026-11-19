// Catálogos base del prototipo; los identificadores se usan en colaboradores.js.
export const departamentos = [
  { idDepartamento: "DEP-001", nombre: "Talento Humano" },
  { idDepartamento: "DEP-002", nombre: "Desarrollo Web" },
  { idDepartamento: "DEP-003", nombre: "Comercial" },
];

export const areas = [
  { idArea: "ARE-001", nombre: "Reclutamiento", idDepartamento: "DEP-001" },
  { idArea: "ARE-002", nombre: "Capacitación", idDepartamento: "DEP-001" },
  { idArea: "ARE-003", nombre: "Clima y Cultura", idDepartamento: "DEP-001" },
  { idArea: "ARE-004", nombre: "Backend", idDepartamento: "DEP-002" },
  { idArea: "ARE-005", nombre: "Frontend", idDepartamento: "DEP-002" },
  { idArea: "ARE-006", nombre: "Base de Datos", idDepartamento: "DEP-002" },
  { idArea: "ARE-007", nombre: "Documentación", idDepartamento: "DEP-002" },
  { idArea: "ARE-008", nombre: "Diseño Web", idDepartamento: "DEP-002" },
  {
    idArea: "ARE-009",
    nombre: "Desarrollo Rápido de Aplicaciones",
    idDepartamento: "DEP-002",
  },
  { idArea: "ARE-010", nombre: "Diseño Gráfico", idDepartamento: "DEP-003" },
  {
    idArea: "ARE-012",
    nombre: "Marketing y Ventas",
    idDepartamento: "DEP-003",
  },
];

export const subareas = [
  { idSubArea: "SUB-001", nombre: "Producción Audiovisual", idArea: "ARE-010" },
];

export const roles = [
  { idRol: "ROL-001", nombre: "Gerente General" },
  { idRol: "ROL-002", nombre: "Gerencia" },
  { idRol: "ROL-003", nombre: "Líder" },
  { idRol: "ROL-004", nombre: "Co-líder" },
  { idRol: "ROL-005", nombre: "Colaborador" },
];