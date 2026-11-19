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

const colabs = obtenerColaboradoresActivos();
console.log('Colaboradores activos count:', colabs.length);

const camila = colabs.find(c => c.codigoColaborador === '1025' || (c.nombres || '').includes('Camila'));
console.log('Found Camila:', camila ? `${camila.nombres} ${camila.apellidoPaterno} (${camila.codigoColaborador})` : 'none');

const alex = colabs.find(c => c.codigoColaborador === '1101' || (c.nombres || '').includes('Alex'));
console.log('Found Alex:', alex ? `${alex.nombres} ${alex.apellidoPaterno} (${alex.codigoColaborador})` : 'none');

console.log('Storage successfully verified in Node!');
