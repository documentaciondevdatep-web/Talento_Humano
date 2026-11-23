import { areas, departamentos, roles, subareas } from "../data/catalogos.js";
import {
  colaboradoresDemostracion,
  colaboradoresIniciales,
} from "../data/colaboradores.js";

const CLAVE_ALMACENAMIENTO = "th_colaboradores";
const CLAVE_RESPALDO = "th_colaboradores_backup_modelo_roles_v1";
const ESTADOS_VALIDOS = new Set(["Activo", "Inactivo", "Baja"]);
const TIPOS_COLABORADOR_VALIDOS = new Set(["Trabajador", "Practicante"]);
const EVENTO_ACTUALIZACION = "colaboradoresActualizados";
const CAMPOS_COLABORADOR = [
  "codigoColaborador",
  "fichaTalento",
  "tipoDocumento",
  "numeroDocumento",
  "nombres",
  "apellidoPaterno",
  "apellidoMaterno",
  "tipoColaborador",
  "correo",
  "telefono",
  "idDepartamento",
  "idArea",
  "idSubArea",
  "idRol",
  "foto",
  "fechaIngreso",
  "fechaSalida",
  "estado",
];

function obtenerAlmacenamiento() {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      throw new Error("localStorage no está disponible en este entorno.");
    }

    return window.localStorage;
  } catch (error) {
    throw new Error(`No se pudo acceder a localStorage: ${error.message}`);
  }
}

function copiarColaborador(colaborador) {
  return { ...colaborador };
}

function exigirTexto(datos, propiedad, etiqueta) {
  if (typeof datos[propiedad] !== "string" || datos[propiedad].trim() === "") {
    throw new Error(`El campo ${etiqueta} es obligatorio.`);
  }
}

function normalizarDocumento(numeroDocumento) {
  return numeroDocumento.trim().replace(/\s+/g, "").toLocaleUpperCase();
}

function normalizarCodigoColaborador(codigo) {
  if (typeof codigo === "number" && Number.isSafeInteger(codigo) && codigo >= 0) {
    return String(codigo);
  }
  if (typeof codigo === "string" && /^\d+$/.test(codigo.trim())) {
    return codigo.trim();
  }
  return null;
}

function tieneCodigoColaborador(colaborador) {
  return (
    colaborador.codigoColaborador !== undefined &&
    colaborador.codigoColaborador !== null &&
    colaborador.codigoColaborador !== ""
  );
}

function validarColaborador(colaborador, colaboradoresExistentes = []) {
  if (!colaborador || typeof colaborador !== "object" || Array.isArray(colaborador)) {
    throw new Error("Cada colaborador debe ser un objeto válido.");
  }
  if (Object.prototype.hasOwnProperty.call(colaborador, "idCargo")) {
    throw new Error("El modelo actual no admite idCargo; use idRol.");
  }
  if (typeof colaborador.idColaborador !== "string" || !colaborador.idColaborador.trim()) {
    throw new Error("El identificador del colaborador es obligatorio.");
  }
  if (tieneCodigoColaborador(colaborador)) {
    const codigo = normalizarCodigoColaborador(colaborador.codigoColaborador);
    if (codigo === null) {
      throw new Error("El código del colaborador debe contener solo dígitos.");
    }
    if (
      colaboradoresExistentes.some(
        (existente) =>
          existente.idColaborador !== colaborador.idColaborador &&
          normalizarCodigoColaborador(existente.codigoColaborador) === codigo,
      )
    ) {
      throw new Error(`El código de colaborador ${codigo} ya está registrado.`);
    }
  }

  const rolValido = roles.some((rol) => rol.idRol === colaborador.idRol);
  if (!rolValido) {
    throw new Error("El rol seleccionado no existe.");
  }

  exigirTexto(colaborador, "nombres", "nombres");
  if (colaborador.idRol === "ROL-001") {
    if (
      typeof colaborador.apellidoPaterno !== "string" ||
      typeof colaborador.apellidoMaterno !== "string"
    ) {
      throw new Error("Los apellidos del Gerente General deben ser cadenas, aunque estén vacías.");
    }
  } else {
    exigirTexto(colaborador, "apellidoPaterno", "apellido paterno");
    exigirTexto(colaborador, "apellidoMaterno", "apellido materno");
  }
  exigirTexto(colaborador, "tipoDocumento", "tipo de documento");
  exigirTexto(colaborador, "numeroDocumento", "número de documento");

  if (
    colaboradoresExistentes.some(
      (existente) =>
        existente.idColaborador !== colaborador.idColaborador &&
        typeof existente.numeroDocumento === "string" &&
        normalizarDocumento(existente.numeroDocumento) ===
          normalizarDocumento(colaborador.numeroDocumento),
    )
  ) {
    throw new Error("Ya existe un colaborador con ese número de documento.");
  }

  if (!TIPOS_COLABORADOR_VALIDOS.has(colaborador.tipoColaborador)) {
    throw new Error("El tipo de colaborador debe ser Trabajador o Practicante.");
  }
  if (!ESTADOS_VALIDOS.has(colaborador.estado)) {
    throw new Error("El estado debe ser Activo, Inactivo o Baja.");
  }
  if (typeof colaborador.correo !== "string" || typeof colaborador.telefono !== "string") {
    throw new Error("El correo y el teléfono deben ser cadenas.");
  }
  if (typeof colaborador.fechaIngreso !== "string" || !colaborador.fechaIngreso) {
    throw new Error("La fecha de ingreso es obligatoria.");
  }
  if (colaborador.fechaSalida !== null && typeof colaborador.fechaSalida !== "string") {
    throw new Error("La fecha de salida debe ser una cadena o null.");
  }
  if (
    colaborador.foto !== null &&
    (typeof colaborador.foto !== "string" || /^data:image\//i.test(colaborador.foto))
  ) {
    throw new Error("La fotografía debe ser una ruta o referencia, no una imagen codificada.");
  }

  const { idDepartamento, idArea, idSubArea, idRol } = colaborador;
  const gerenteGeneral = idRol === "ROL-001";
  if (gerenteGeneral && (idDepartamento !== null || idArea !== null || idSubArea !== null)) {
    throw new Error("Gerente General no debe tener departamento, área ni subárea asignados.");
  }

  if (idDepartamento === null) {
    if (idArea !== null || idSubArea !== null) {
      throw new Error("Área y subárea requieren un departamento.");
    }
    if (idRol !== "ROL-001" && idRol !== "ROL-002") {
      throw new Error("Este rol requiere un departamento asignado.");
    }
  } else {
    const departamentoValido = departamentos.some(
      (departamento) => departamento.idDepartamento === idDepartamento,
    );
    if (!departamentoValido) {
      throw new Error("El departamento seleccionado no existe.");
    }
  }

  if (idArea === null) {
    if (idSubArea !== null) {
      throw new Error("La subárea requiere un área asignada.");
    }
    if (idRol === "ROL-005") {
      throw new Error("El rol Colaborador requiere departamento y área.");
    }
  } else {
    const area = areas.find((elemento) => elemento.idArea === idArea);
    if (!area || area.idDepartamento !== idDepartamento) {
      throw new Error("El área seleccionada no pertenece al departamento indicado.");
    }
  }

  if (idSubArea !== null) {
    const subarea = subareas.find((elemento) => elemento.idSubArea === idSubArea);
    if (!subarea || subarea.idArea !== idArea) {
      throw new Error("La subárea seleccionada no pertenece al área indicada.");
    }
  }
}

function validarColeccion(colaboradores) {
  if (!Array.isArray(colaboradores)) {
    throw new Error("Los colaboradores guardados deben estar en un arreglo.");
  }

  const ids = new Set();
  const documentos = new Set();
  const codigos = new Set();
  for (const colaborador of colaboradores) {
    validarColaborador(colaborador);

    if (ids.has(colaborador.idColaborador)) {
      throw new Error(`El identificador ${colaborador.idColaborador} está duplicado.`);
    }
    ids.add(colaborador.idColaborador);

    const documento = normalizarDocumento(colaborador.numeroDocumento);
    if (documentos.has(documento)) {
      throw new Error(`El número de documento ${colaborador.numeroDocumento} está duplicado.`);
    }
    documentos.add(documento);

    if (tieneCodigoColaborador(colaborador)) {
      const codigo = normalizarCodigoColaborador(colaborador.codigoColaborador);
      if (codigos.has(codigo)) {
        throw new Error(`El código de colaborador ${codigo} está duplicado.`);
      }
      codigos.add(codigo);
    }
  }

  return colaboradores;
}

function parsearColaboradores(contenido) {
  let colaboradores;
  try {
    colaboradores = JSON.parse(contenido);
  } catch (error) {
    throw new Error(`Los colaboradores guardados no contienen JSON válido: ${error.message}`);
  }

  if (!Array.isArray(colaboradores)) {
    throw new Error("Los colaboradores guardados deben estar en un arreglo.");
  }
  return colaboradores;
}

function necesitaMigracion(colaboradores) {
  return colaboradores.some((colaborador) => {
    if (!colaborador || typeof colaborador !== "object" || Array.isArray(colaborador)) {
      throw new Error("No se pudo migrar: hay un registro de colaborador inválido.");
    }
    return (
      Object.prototype.hasOwnProperty.call(colaborador, "idCargo") ||
      !Object.prototype.hasOwnProperty.call(colaborador, "idRol") ||
      !Object.prototype.hasOwnProperty.call(colaborador, "idSubArea") ||
      colaborador.idArea === "ARE-011"
    );
  });
}

function mismaUbicacionDeLiderazgo(colaborador, ejemplo) {
  return (
    colaborador.idRol === ejemplo.idRol &&
    colaborador.idDepartamento === ejemplo.idDepartamento &&
    colaborador.idArea === ejemplo.idArea &&
    colaborador.idSubArea === ejemplo.idSubArea
  );
}

function coincidenDatosDemostracion(colaborador, ejemplo) {
  return (
    colaborador.idColaborador === ejemplo.idColaborador &&
    normalizarDocumento(colaborador.numeroDocumento) ===
      normalizarDocumento(ejemplo.numeroDocumento) &&
    colaborador.correo.trim().toLocaleLowerCase() ===
      ejemplo.correo.trim().toLocaleLowerCase()
  );
}

function codigoDemostracionDisponible(codigoSugerido, codigosUsados) {
  let codigo = String(codigoSugerido);
  if (!codigosUsados.has(codigo)) return codigo;

  let siguiente = Number(codigo);
  do {
    siguiente += 1;
    codigo = String(siguiente);
  } while (codigosUsados.has(codigo));
  return codigo;
}

function completarCodigosDemostracion(colaboradores) {
  const fuentesDemostracion = [
    ...colaboradoresIniciales,
    ...colaboradoresDemostracion,
  ];
  const codigosUsados = new Set(
    colaboradores
      .map((colaborador) => normalizarCodigoColaborador(colaborador.codigoColaborador))
      .filter((codigo) => codigo !== null),
  );

  for (const colaborador of colaboradores) {
    if (tieneCodigoColaborador(colaborador)) continue;
    const ejemplo = fuentesDemostracion.find(
      (fuente) =>
        fuente.codigoColaborador &&
        coincidenDatosDemostracion(colaborador, fuente),
    );
    if (!ejemplo) continue;

    const codigo = codigoDemostracionDisponible(
      ejemplo.codigoColaborador,
      codigosUsados,
    );
    colaborador.codigoColaborador = codigo;
    codigosUsados.add(codigo);
  }
}

function contarColaboradoresActivosEnUbicacion(colaboradores, ejemplo) {
  return colaboradores.filter(
    (colaborador) =>
      colaborador.estado === "Activo" &&
      colaborador.idRol === "ROL-005" &&
      colaborador.idArea === ejemplo.idArea &&
      colaborador.idSubArea === (ejemplo.idSubArea ?? null),
  ).length;
}

function incorporarColaboradoresDemostracion(colaboradores) {
  const actualizados = colaboradores.map(copiarColaborador);
  completarCodigosDemostracion(actualizados);
  const codigosUsados = new Set(
    actualizados
      .map((colaborador) => normalizarCodigoColaborador(colaborador.codigoColaborador))
      .filter((codigo) => codigo !== null),
  );

  for (const ejemplo of colaboradoresDemostracion) {
    if (
      ejemplo.idRol === "ROL-005" &&
      contarColaboradoresActivosEnUbicacion(actualizados, ejemplo) >= 3
    ) continue;

    const yaExiste = actualizados.some(
      (colaborador) =>
        colaborador.idColaborador === ejemplo.idColaborador ||
        colaborador.correo.trim().toLocaleLowerCase() ===
          ejemplo.correo.trim().toLocaleLowerCase() ||
        normalizarDocumento(colaborador.numeroDocumento) ===
          normalizarDocumento(ejemplo.numeroDocumento),
    );
    if (yaExiste) continue;

    if (
      (ejemplo.idRol === "ROL-003" || ejemplo.idRol === "ROL-004") &&
      actualizados.some((colaborador) => mismaUbicacionDeLiderazgo(colaborador, ejemplo))
    ) continue;

    const nuevoEjemplo = copiarColaborador(ejemplo);
    if (
      actualizados.some(
        (colaborador) => colaborador.idColaborador === nuevoEjemplo.idColaborador,
      )
    ) {
      nuevoEjemplo.idColaborador = generarIdColaborador(actualizados);
    }

    const documentosExistentes = new Set(
      actualizados.map((colaborador) =>
        normalizarDocumento(colaborador.numeroDocumento),
      ),
    );
    if (documentosExistentes.has(normalizarDocumento(nuevoEjemplo.numeroDocumento))) {
      let numeroDocumento = 99000001;
      while (documentosExistentes.has(String(numeroDocumento))) {
        numeroDocumento += 1;
      }
      nuevoEjemplo.numeroDocumento = String(numeroDocumento);
    }

    nuevoEjemplo.codigoColaborador = codigoDemostracionDisponible(
      nuevoEjemplo.codigoColaborador,
      codigosUsados,
    );
    actualizados.push(nuevoEjemplo);
    codigosUsados.add(nuevoEjemplo.codigoColaborador);
  }

  return actualizados;
}

function migrarColaborador(colaborador) {
  const datosConservados = { ...colaborador };
  delete datosConservados.idCargo;
  const areaAudiovisualAnterior = colaborador.idArea === "ARE-011";
  const rolExistente = roles.some((rol) => rol.idRol === colaborador.idRol);

  return {
    ...datosConservados,
    idArea: areaAudiovisualAnterior ? "ARE-010" : (colaborador.idArea ?? null),
    idSubArea: areaAudiovisualAnterior
      ? "SUB-001"
      : (colaborador.idSubArea ?? null),
    idRol: rolExistente ? colaborador.idRol : "ROL-005",
  };
}

function guardarRespaldo(almacenamiento, contenidoOriginal) {
  let claveRespaldo = CLAVE_RESPALDO;

  try {
    const respaldoExistente = almacenamiento.getItem(claveRespaldo);
    if (respaldoExistente === contenidoOriginal) return;

    if (respaldoExistente !== null) {
      const marcaTiempo = Date.now();
      let consecutivo = 1;
      do {
        claveRespaldo = `${CLAVE_RESPALDO}_${marcaTiempo}_${consecutivo}`;
        consecutivo += 1;
      } while (almacenamiento.getItem(claveRespaldo) !== null);
    }

    almacenamiento.setItem(claveRespaldo, contenidoOriginal);
  } catch (error) {
    throw new Error(`No se pudo crear el respaldo previo a la migración: ${error.message}`);
  }
}

function guardarContenido(almacenamiento, contenido) {
  try {
    almacenamiento.setItem(CLAVE_ALMACENAMIENTO, contenido);
  } catch (error) {
    throw new Error(`No se pudieron guardar los colaboradores: ${error.message}`);
  }
}

function inicializarAlmacenamiento() {
  let almacenamiento = null;
  try {
    almacenamiento = obtenerAlmacenamiento();
  } catch (e) {
    return;
  }
  let contenido = null;
  try {
    contenido = almacenamiento.getItem(CLAVE_ALMACENAMIENTO);
  } catch (error) {}

  if (!contenido) {
    const iniciales = incorporarColaboradoresDemostracion(
      colaboradoresIniciales.map(copiarColaborador),
    );
    try {
      guardarContenido(almacenamiento, JSON.stringify(iniciales));
    } catch (e) {}
    return;
  }

  try {
    const colaboradores = parsearColaboradores(contenido);
    if (!Array.isArray(colaboradores) || colaboradores.length === 0) {
      const iniciales = incorporarColaboradoresDemostracion(
        colaboradoresIniciales.map(copiarColaborador),
      );
      guardarContenido(almacenamiento, JSON.stringify(iniciales));
      return;
    }
    if (!necesitaMigracion(colaboradores)) {
      const actualizados = incorporarColaboradoresDemostracion(colaboradores);
      const contenidoActualizado = JSON.stringify(actualizados);
      if (contenidoActualizado !== contenido) {
        guardarRespaldo(almacenamiento, contenido);
        guardarContenido(almacenamiento, contenidoActualizado);
      }
      return;
    }
  } catch (e) {
    const iniciales = incorporarColaboradoresDemostracion(
      colaboradoresIniciales.map(copiarColaborador),
    );
    try {
      guardarContenido(almacenamiento, JSON.stringify(iniciales));
    } catch (err) {}
  }
}

function leerColaboradores() {
  let almacenamiento = null;
  try {
    almacenamiento = obtenerAlmacenamiento();
  } catch (e) {}

  let contenido = null;
  if (almacenamiento) {
    try {
      contenido = almacenamiento.getItem(CLAVE_ALMACENAMIENTO);
    } catch (error) {
      console.warn(`No se pudieron leer los colaboradores: ${error.message}`);
    }
  }

  if (contenido) {
    try {
      const parsed = parsearColaboradores(contenido);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return validarColeccion(parsed);
      }
    } catch (e) {
      console.warn("Datos de colaboradores no válidos o vacíos, restableciendo catálogo oficial:", e);
    }
  }

  const iniciales = incorporarColaboradoresDemostracion(
    colaboradoresIniciales.map(copiarColaborador),
  );
  if (almacenamiento) {
    try {
      guardarContenido(almacenamiento, JSON.stringify(iniciales));
    } catch (e) {}
  }
  return iniciales;
}

function persistirColaboradores(colaboradores) {
  validarColeccion(colaboradores);

  let contenido;
  try {
    contenido = JSON.stringify(colaboradores);
  } catch (error) {
    throw new Error(`No se pudieron serializar los colaboradores: ${error.message}`);
  }

  guardarContenido(obtenerAlmacenamiento(), contenido);
}

function generarIdColaborador(colaboradores) {
  const idsExistentes = new Set(colaboradores.map((colaborador) => colaborador.idColaborador));
  const mayorId = colaboradores.reduce((mayor, colaborador) => {
    const coincidencia = /^COL-(\d+)$/i.exec(colaborador.idColaborador || "");
    return coincidencia ? Math.max(mayor, Number(coincidencia[1])) : mayor;
  }, 0);

  let siguienteId = mayorId + 1;
  let idColaborador = `COL-${String(siguienteId).padStart(3, "0")}`;
  while (idsExistentes.has(idColaborador)) {
    siguienteId += 1;
    idColaborador = `COL-${String(siguienteId).padStart(3, "0")}`;
  }

  return idColaborador;
}

function seleccionarCampos(datos) {
  return CAMPOS_COLABORADOR.reduce((seleccionados, campo) => {
    if (Object.prototype.hasOwnProperty.call(datos, campo)) {
      seleccionados[campo] = datos[campo];
    }
    return seleccionados;
  }, {});
}

function emitirActualizacion(tipoOperacion, idColaborador, colaboradores) {
  window.dispatchEvent(
    new CustomEvent(EVENTO_ACTUALIZACION, {
      detail: {
        origen: "local",
        tipoOperacion,
        idColaborador,
        colaboradores: colaboradores.map(copiarColaborador),
      },
    }),
  );
}

inicializarAlmacenamiento();

window.addEventListener("storage", (evento) => {
  if (evento.key !== CLAVE_ALMACENAMIENTO && evento.key !== null) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(EVENTO_ACTUALIZACION, {
      detail: {
        origen: "storage",
        tipoOperacion: "sincronizacion",
        idColaborador: null,
        colaboradores:
          evento.newValue === null
            ? null
            : JSON.parse(evento.newValue).map(copiarColaborador),
      },
    }),
  );
});

export function obtenerColaboradores() {
  return leerColaboradores().map(copiarColaborador);
}

export function obtenerColaboradorPorId(idColaborador) {
  const colaborador = leerColaboradores().find(
    (elemento) => elemento.idColaborador === idColaborador,
  );
  return colaborador ? copiarColaborador(colaborador) : null;
}

export function obtenerColaboradoresActivos() {
  return leerColaboradores()
    .filter((colaborador) => colaborador.estado === "Activo")
    .map(copiarColaborador);
}

export function registrarColaborador(datos) {
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    throw new Error("Los datos del colaborador deben ser un objeto.");
  }

  const colaboradores = leerColaboradores();
  const nuevoColaborador = {
    idColaborador: generarIdColaborador(colaboradores),
    ...seleccionarCampos(datos),
    apellidoPaterno: datos.apellidoPaterno ?? "",
    apellidoMaterno: datos.apellidoMaterno ?? "",
    correo: datos.correo ?? "",
    telefono: datos.telefono ?? "",
    idDepartamento: datos.idDepartamento ?? null,
    idArea: datos.idArea ?? null,
    idSubArea: datos.idSubArea ?? null,
    foto: datos.foto ?? null,
    fechaIngreso: datos.fechaIngreso ?? new Date().toISOString().slice(0, 10),
    fechaSalida: datos.fechaSalida ?? null,
    estado: datos.estado ?? "Activo",
  };

  validarColaborador(nuevoColaborador, colaboradores);
  const actualizados = [...colaboradores, nuevoColaborador];
  persistirColaboradores(actualizados);
  emitirActualizacion("registro", nuevoColaborador.idColaborador, actualizados);

  return copiarColaborador(nuevoColaborador);
}

export function actualizarColaborador(idColaborador, cambios) {
  if (!cambios || typeof cambios !== "object" || Array.isArray(cambios)) {
    throw new Error("Los cambios del colaborador deben ser un objeto.");
  }

  const colaboradores = leerColaboradores();
  const indice = colaboradores.findIndex(
    (colaborador) => colaborador.idColaborador === idColaborador,
  );
  if (indice === -1) {
    throw new Error(`No existe el colaborador ${idColaborador}.`);
  }

  const colaboradorActualizado = {
    ...colaboradores[indice],
    ...seleccionarCampos(cambios),
    idColaborador: colaboradores[indice].idColaborador,
  };
  validarColaborador(colaboradorActualizado, colaboradores);

  const actualizados = colaboradores.map((colaborador, posicion) =>
    posicion === indice ? colaboradorActualizado : colaborador,
  );
  persistirColaboradores(actualizados);
  emitirActualizacion("actualizacion", idColaborador, actualizados);

  return copiarColaborador(colaboradorActualizado);
}

export function cambiarEstadoColaborador(idColaborador, nuevoEstado) {
  if (!ESTADOS_VALIDOS.has(nuevoEstado)) {
    throw new Error("El estado debe ser Activo, Inactivo o Baja.");
  }

  const colaboradores = leerColaboradores();
  const indice = colaboradores.findIndex(
    (colaborador) => colaborador.idColaborador === idColaborador,
  );
  if (indice === -1) {
    throw new Error(`No existe el colaborador ${idColaborador}.`);
  }

  const actualizados = colaboradores.map((colaborador, posicion) =>
    posicion === indice ? { ...colaborador, estado: nuevoEstado } : colaborador,
  );
  persistirColaboradores(actualizados);
  emitirActualizacion("cambioEstado", idColaborador, actualizados);

  return copiarColaborador(actualizados[indice]);
}

export function obtenerNombreDepartamento(idDepartamento) {
  return (
    departamentos.find((departamento) => departamento.idDepartamento === idDepartamento)?.nombre ??
    null
  );
}

export function obtenerNombreArea(idArea) {
  return areas.find((area) => area.idArea === idArea)?.nombre ?? null;
}

export function obtenerNombreSubArea(idSubArea) {
  return subareas.find((subarea) => subarea.idSubArea === idSubArea)?.nombre ?? null;
}

export function obtenerNombreRol(idRol) {
  return roles.find((rol) => rol.idRol === idRol)?.nombre ?? null;
}

export function obtenerAreasPorDepartamento(idDepartamento) {
  return areas
    .filter((area) => area.idDepartamento === idDepartamento)
    .map((area) => ({ ...area }));
}

export function obtenerSubAreasPorArea(idArea) {
  return subareas
    .filter((subarea) => subarea.idArea === idArea)
    .map((subarea) => ({ ...subarea }));
}
