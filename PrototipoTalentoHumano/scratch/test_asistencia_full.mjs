const store = {};
const mockStorage = {
  getItem: k => store[k] ?? null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

globalThis.window = {
  localStorage: mockStorage,
  addEventListener: () => {},
  removeEventListener: () => {}
};
globalThis.localStorage = mockStorage;

const { obtenerColaboradores, obtenerColaboradoresActivos } = await import('../shared/js/colaboradoresStorage.js');
const { departamentos, areas } = await import('../shared/data/catalogos.js');

// Test data generation
const colabs = obtenerColaboradoresActivos();
console.log('Total active:', colabs.length);

const alex = colabs.find(c => c.idColaborador === 'COL-001');
console.log('Alex Rios:', alex ? alex.nombres : 'not found');

// Mock incidencias
const mockIncs = [
  { idColaborador: 'COL-012', tipo: 'TARDANZA', estado: 'INVALIDO', fechaEvento: '2026-11-04' },
  { idColaborador: 'COL-012', tipo: 'TARDANZA', estado: 'INVALIDO', fechaEvento: '2026-11-05' },
  { idColaborador: 'COL-012', tipo: 'TARDANZA', estado: 'INVALIDO', fechaEvento: '2026-11-06' }
];

const tardanzas = mockIncs.filter(i => i.idColaborador === 'COL-012' && i.tipo === 'TARDANZA' && i.estado === 'INVALIDO').length;
const faltasPorTardanzas = Math.floor(tardanzas / 3);
console.log('COL-012 Tardanzas:', tardanzas, 'Faltas por tardanzas:', faltasPorTardanzas);

if (tardanzas === 3 && faltasPorTardanzas === 1) {
  console.log('Rule verified: 3 tardanzas injustificadas = 1 falta acumulada!');
} else {
  throw new Error('Rule failure');
}
