function calcTardanzas(faltasDirectas) {
  const MAX_FALTAS = 3;
  const TARDANZAS_POR_FALTA = 3;
  const maxTardanzasPermitidas = Math.max(0, (MAX_FALTAS - faltasDirectas) * TARDANZAS_POR_FALTA);

  let subtitulo = 'Sin tardanzas';
  if (faltasDirectas >= MAX_FALTAS) {
    subtitulo = 'Cupo agotado (Causal de baja)';
  } else if (faltasDirectas > 0) {
    subtitulo = `Tope reducido por ${faltasDirectas} falta(s) previa(s)`;
  }
  return { maxTardanzasPermitidas, subtitulo };
}

console.log('0 faltas:', calcTardanzas(0));
console.log('1 falta (caso Dani):', calcTardanzas(1));
console.log('2 faltas:', calcTardanzas(2));
console.log('3 faltas:', calcTardanzas(3));

if (calcTardanzas(1).maxTardanzasPermitidas !== 6) throw new Error('Failed for 1 falta');
if (calcTardanzas(0).maxTardanzasPermitidas !== 9) throw new Error('Failed for 0 faltas');
if (calcTardanzas(2).maxTardanzasPermitidas !== 3) throw new Error('Failed for 2 faltas');
if (calcTardanzas(3).maxTardanzasPermitidas !== 0) throw new Error('Failed for 3 faltas');

console.log('All dynamic tardanzas calculations verified successfully!');
