const modules = [
  {
    "id": "organigrama",
    "name": "Organigrama",
    "description": "Estructura, equipos y liderazgo.",
    "path": "Organigrama/Organigrama.html",
    "group": "organizacion",
    "icon": "◎"
  },
  {
    "id": "colaboradores",
    "name": "Colaboradores y reingresos",
    "description": "Personas, información y nuevas etapas.",
    "path": "gestion de colaboradores y reingresos/GestionColaboradores.html",
    "group": "organizacion",
    "icon": "♙"
  },
  {
    "id": "asistencia",
    "name": "Asistencia y faltas",
    "description": "Seguimiento de asistencia y justificaciones.",
    "path": "gestion de asistencia y faltas/GestionAsistencia.html",
    "group": "asistencia",
    "icon": "✓"
  },
  {
    "id": "conexion",
    "name": "Tiempo de conexión",
    "description": "Consulta de tiempos de conexión.",
    "path": "gestion de tiempo de conexion/GestionConexion.html",
    "group": "asistencia",
    "icon": "◷"
  },
  {
    "id": "hablado",
    "name": "Tiempo hablado",
    "description": "Seguimiento del tiempo de participación.",
    "path": "gestion de tiempo hablado/GestionTiempoHablado.html",
    "group": "asistencia",
    "icon": "◌"
  },
  {
    "id": "horarios",
    "name": "Horarios y cruces",
    "description": "Organización de turnos y coincidencias.",
    "path": "gestion de cruces de horario y horarios/GestionHorarios.html",
    "group": "asistencia",
    "icon": "▦"
  },
  {
    "id": "feriados",
    "name": "Feriados",
    "description": "Calendario de días no laborables.",
    "path": "gestion de feriados/GestionFeriados.html",
    "group": "asistencia",
    "icon": "◇"
  },
  {
    "id": "convenios",
    "name": "Convenios",
    "description": "Seguimiento de convenios de prácticas.",
    "path": "gestion de convenios/GestionConvenios.html",
    "group": "documentos",
    "icon": "▤"
  },
  {
    "id": "documentos",
    "name": "Documentos",
    "description": "Certificados, constancias y cartas.",
    "path": "gestion de documentos/GestionDocumentos.html",
    "group": "documentos",
    "icon": "▱"
  },
  {
    "id": "sanciones",
    "name": "Sanciones",
    "description": "Registro y seguimiento de medidas.",
    "path": "gestion de sanciones/GestionSanciones.html",
    "group": "cierre",
    "icon": "!"
  },
  {
    "id": "bajas",
    "name": "Bajas (Blacklist)",
    "description": "Registro y consulta de desvinculaciones.",
    "path": "gestion de bajas (blacklist)/GestionBajas.html",
    "group": "cierre",
    "icon": "⊖"
  },
  {
    "id": "accesos",
    "name": "Accesos (cierre)",
    "description": "Seguimiento del cierre de accesos.",
    "path": "gestion de accesos (cierre)/GestionAccesos.html",
    "group": "cierre",
    "icon": "⊞"
  }
];
// Las vistas mantienen sus archivos independientes; esta agrupación organiza la navegación.
const collaboratorModules=new Set(['colaboradores','asistencia','conexion','hablado','horarios','sanciones','bajas']);
modules.forEach(module=>{module.group=collaboratorModules.has(module.id)?'personas':module.id;});
const groups=[
 {id:'organigrama',name:'Organigrama',description:'Estructura, equipos y liderazgo.',icon:'◎',moduleId:'organigrama'},
 {id:'personas',name:'Gestión de colaboradores',description:'Colaboradores, asistencia, horarios, tiempos, sanciones y bajas.',icon:'♙'},
 {id:'feriados',name:'Feriados',description:'Calendario de días no laborables.',icon:'◇',moduleId:'feriados'},
 {id:'convenios',name:'Convenios',description:'Seguimiento de convenios de prácticas.',icon:'▤',moduleId:'convenios'},
 {id:'documentos',name:'Documentos',description:'Certificados, constancias y cartas.',icon:'▱',moduleId:'documentos'},
 {id:'accesos',name:'Accesos (cierre)',description:'Seguimiento del cierre de accesos.',icon:'⊞',moduleId:'accesos'}
];
const home=document.querySelector('#home'),workspace=document.querySelector('#workspace'),sidebar=document.querySelector('#sidebar'),frame=document.querySelector('#moduleFrame');
const catalog=document.querySelector('#catalog'),nav=document.querySelector('#navigation');
function renderCards(){
 catalog.replaceChildren();

 for(const group of groups){
 const link=document.createElement('a');link.className='module-card general-card '+group.id;link.href=group.moduleId?'#'+group.moduleId:'#bloque-'+group.id;
 link.innerHTML='<span class="module-icon" aria-hidden="true">'+group.icon+'</span><span class="card-copy"><strong>'+group.name+'</strong><span>'+group.description+'</span></span><span class="card-arrow" aria-hidden="true">↗</span>';
 catalog.append(link);
 }
}
for(const group of groups){
 if(group.moduleId){const link=document.createElement('a');link.className='nav-direct';link.href='#'+group.moduleId;link.textContent=group.name;link.dataset.module=group.moduleId;nav.append(link);continue;}
 const details=document.createElement('details');details.dataset.group=group.id;
 const summary=document.createElement('summary');summary.textContent=group.name;details.append(summary);
 for(const module of modules.filter(item=>item.group===group.id)){const link=document.createElement('a');link.href='#'+module.id;link.textContent=module.name;link.dataset.module=module.id;details.append(link);}
 nav.append(details);
}
function route(){
 const id=location.hash.slice(1);const module=modules.find(m=>m.id===id);const group=groups.find(g=>'bloque-'+g.id===id);
 if(id&&id!=='inicio'&&!module&&!group){location.replace('#inicio');return;}
 const opened=Boolean(module||group);const selection=module||group;home.hidden=opened;workspace.hidden=!opened;sidebar.hidden=!opened;document.body.classList.toggle('module-open',opened);document.body.classList.remove('nav-open');document.querySelector('#menuToggle').setAttribute('aria-expanded','false');
 document.querySelector('#breadcrumb').textContent=opened?selection.name:'Inicio';document.title=opened?selection.name+' | Talento Humano':'Talento Humano';
 nav.querySelectorAll('a').forEach(a=>{if(a.dataset.module===id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 const overview=document.querySelector('#groupOverview');overview.hidden=!group;frame.hidden=!module;document.querySelector('#directLink').hidden=!module;
 if(group){frame.removeAttribute('src');nav.querySelector('[data-group="'+group.id+'"]').open=true;document.querySelector('#moduleTitle').textContent=group.name;overview.replaceChildren();const description=document.createElement('p');description.textContent='Selecciona una opción para continuar.';overview.append(description);for(const item of modules.filter(m=>m.group===group.id)){const link=document.createElement('a');link.className='group-option';link.href='#'+item.id;link.textContent=item.name+' →';overview.append(link);}document.querySelector('#moduleTitle').focus();}
 else if(module){const parentGroup=nav.querySelector('[data-group="'+module.group+'"]');if(parentGroup)parentGroup.open=true;document.querySelector('#moduleTitle').textContent=module.name;document.querySelector('#directLink').href='../'+module.path;frame.title=module.name;frame.src='../'+module.path+(module.id==='organigrama'?'?v=20261117-vertical-2':'');document.querySelector('#moduleTitle').focus();}
 else{frame.removeAttribute('src');document.querySelector('#homeTitle').focus();}
}

document.querySelector('#menuToggle').addEventListener('click',()=>{const open=document.body.classList.toggle('nav-open');document.querySelector('#menuToggle').setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){document.body.classList.remove('nav-open');document.querySelector('#menuToggle').setAttribute('aria-expanded','false');}});
window.addEventListener('hashchange',route);renderCards();route();
