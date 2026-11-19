// Test November 2026 calendar days
function generateCalDays(logsByDate) {
  // Nov 1 2026 is Sunday (index 6 if Lun=0 .. Dom=6)
  const days = [];
  // 6 empty cells before Sunday 1
  for (let i = 0; i < 6; i++) {
    days.push({ num: '', cls: 'empty' });
  }

  // Days 1 to 30
  for (let d = 1; d <= 30; d++) {
    const dayOfWeek = (6 + (d - 1)) % 7; // 0=Lun, 1=Mar, 2=Mié, 3=Jue, 4=Vie, 5=Sáb, 6=Dom
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const dateStr = `2026-11-${String(d).padStart(2, '0')}`;

    let cls = 'future';
    if (isWeekend) {
      cls = 'weekend';
    } else if (d === 17) {
      cls = 'today';
    } else if (d < 17) {
      const log = logsByDate[dateStr];
      if (log) {
        if (log.estado === 'Puntual') cls = 'punctual';
        else if (log.estado === 'Tardanza') cls = 'tardanza';
        else if (log.estado === 'Falta') cls = 'falta';
      } else {
        cls = 'punctual';
      }
    } else {
      cls = 'future';
    }

    days.push({ num: d, cls, dateStr });
  }
  return days;
}

const res = generateCalDays({ '2026-11-04': { estado: 'Tardanza' } });
console.log('Total cells:', res.length);
console.log('First 10 cells:', res.slice(0, 10));
console.log('Cell 17:', res.find(c => c.num === 17));
