import { obtenerColaboradores, obtenerColaboradoresActivos } from '../shared/js/colaboradoresStorage.js';

// Setup minimal localStorage mock if needed
if (typeof globalThis.localStorage === 'undefined') {
  const store = {};
  globalThis.localStorage = {
    getItem: k => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

const colabs = obtenerColaboradoresActivos();
console.log('Colaboradores activos count:', colabs.length);

const camila = colabs.find(c => c.codigoColaborador === '1025' || (c.nombres || '').includes('Camila'));
console.log('Found Camila:', camila ? `${camila.nombres} ${camila.apellidoPaterno} (${camila.codigoColaborador})` : 'none');

const alex = colabs.find(c => c.codigoColaborador === '1101' || (c.nombres || '').includes('Alex'));
console.log('Found Alex:', alex ? `${alex.nombres} ${alex.apellidoPaterno} (${alex.codigoColaborador})` : 'none');

const luis = colabs.find(c => c.codigoColaborador === '1026' || (c.nombres || '').includes('Luis'));
console.log('Found Luis:', luis ? `${luis.nombres} ${luis.apellidoPaterno} (${luis.codigoColaborador})` : 'none');
