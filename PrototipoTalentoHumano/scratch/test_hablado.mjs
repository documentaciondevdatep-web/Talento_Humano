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

const { obtenerColaboradoresActivos } = await import('../shared/js/colaboradoresStorage.js');
const colabs = obtenerColaboradoresActivos();
console.log('Total colabs:', colabs.length);

const camila = colabs.find(c => c.codigoColaborador === '1025' || (c.nombres || '').includes('Camila'));
console.log('Camila:', camila ? `${camila.nombres} ${camila.apellidoPaterno}` : 'not found');

const alex = colabs.find(c => c.codigoColaborador === '1101');
console.log('Alex:', alex ? `${alex.nombres} ${alex.apellidoPaterno}` : 'not found');

console.log('Tiempo Hablado test passed!');
