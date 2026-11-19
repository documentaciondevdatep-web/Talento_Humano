// Test math and SVG calculations for Dashboard Asistencia
const C = 2 * Math.PI * 60; // ~376.99
console.log('Circumference:', C);

function calcDonutSlices(punctual, tardanzas, faltasInj, faltasJust, sinMarcar) {
  const total = punctual + tardanzas + faltasInj + faltasJust + sinMarcar || 1;
  const items = [
    { label: 'Puntualidad', count: punctual, color: '#16a34a' },
    { label: 'Tardanzas', count: tardanzas, color: '#f59e0b' },
    { label: 'Faltas Injustificadas', count: faltasInj, color: '#dc2626' },
    { label: 'Faltas Justificadas', count: faltasJust, color: '#f87171' },
    { label: 'Sin Marcar', count: sinMarcar, color: '#64748b' }
  ];

  let currentOffset = 0;
  return items.map(item => {
    const fraction = item.count / total;
    const strokeLength = fraction * C;
    const strokeDash = `${strokeLength.toFixed(2)} ${(C - strokeLength).toFixed(2)}`;
    const offset = (-currentOffset).toFixed(2);
    currentOffset += strokeLength;
    return {
      ...item,
      strokeDash,
      offset,
      fraction
    };
  });
}

console.log(calcDonutSlices(12, 0, 0, 0, 0));
console.log(calcDonutSlices(9, 3, 0, 0, 0));
