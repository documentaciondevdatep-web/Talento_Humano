import {colaboradoresIniciales,colaboradoresDemostracion} from '../shared/data/colaboradores.js';
import {departamentos,areas,subareas,roles} from '../shared/data/catalogos.js';
import {obtenerColaboradores,registrarColaborador,actualizarColaborador} from '../shared/js/colaboradoresStorage.js';
const $=s=>document.querySelector(s);
const KEY='th_expedientes_ingreso_v1';
const CAMPOS_FORMULARIO=["marcaTemporal","situacionPracticante","carrera","institucion","institucionTipo","rucInstitucion","direccionInstitucion","representanteNombre","representanteDocumento","representanteCargo","nacimiento","nacionalidad","direccion","finPrueba"];
CAMPOS_FORMULARIO.push('inicioPrueba','finPrevisto','horarioSemanal');
const HORAS_MINIMAS=320;
const JORNADA_BASE={1:5,2:5,3:5,4:5,5:5};
function horasValidas(value){return Number.isFinite(Number(value)) && Number(value)>=HORAS_MINIMAS;}
const documents=[['copia','Copia de DNI o CE'],['recibo','Recibo de servicios'],['firma','Firma digital'],['foto','Foto formal con fondo blanco']];
let tab='review',currentId=null,previewURL=null;
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const uid=()=>crypto.randomUUID();
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const name=p=>[p.nombres,p.apellidoPaterno,p.apellidoMaterno].filter(Boolean).join(' ');
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const label=(list,id,key)=>list.find(x=>x[key]===id)?.nombre??'—';
const locationLabel=p=>[label(areas,p.idArea,'idArea'),p.idSubArea?label(subareas,p.idSubArea,'idSubArea'):''].filter(Boolean).join(' / ');
function read(){const raw=localStorage.getItem(KEY);if(raw===null)return [];const result=JSON.parse(raw);if(!Array.isArray(result))throw Error('El almacenamiento de expedientes no es válido.');return result;}
function save(data){localStorage.setItem(KEY,JSON.stringify(data));}
function notice(message,error=false){$('#status').textContent=message;$('#status').className=error?'error':'success';}
function pendingState(e){return Object.values(e.documentos).some(d=>d.estado==='Observado')?'Con observaciones':'Por revisar';}
function canReview(e){return e.formularioCompleto&&e.finPrueba<today()&&documents.every(([key])=>e.documentos[key]);}
function validateAcceptance(e){if(!e.inicioPrueba||e.inicioPrueba>e.finPrueba)throw Error('Falta la fecha válida de ingreso a prueba en el formulario recibido.');if(!horasValidas(e.horasConvenio))throw Error('Las horas acordadas declaradas deben ser al menos 320 h. Solicita corregir el formulario.');if(e.aceptadoId)throw Error('Este expediente ya fue aceptado; conserva su ID existente.');if(!canReview(e))throw Error('La prueba debe haber terminado y el formulario debe estar completo.');if(!documents.every(([key])=>e.documentos[key]?.estado==='Aceptado'))throw Error('Acepta todos los documentos obligatorios antes de incorporar al colaborador.');}
const dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open('th_documentos',1);req.onupgradeneeded=()=>req.result.createObjectStore('archivos');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(Error('No se pudo abrir el almacenamiento de documentos.'));});
async function fileStore(mode,key,value){const db=await dbPromise;return new Promise((resolve,reject)=>{const tx=db.transaction('archivos',mode);const store=tx.objectStore('archivos');const req=mode==='readonly'?store.get(key):store.put(value,key);tx.oncomplete=()=>resolve(req.result);tx.onerror=()=>reject(Error('No se pudo conservar el archivo. Revisa el espacio disponible.'));tx.onabort=()=>reject(Error('Se canceló el guardado del archivo.'));});}
dbPromise.catch(error=>notice(error.message,true));
function opts(list,key,selected='',empty='Seleccionar'){return '<option value="">'+empty+'</option>'+list.map(item=>`<option value="${escape(item[key])}" ${item[key]===selected?'selected':''}>${escape(item.nombre)}</option>`).join('');}
$('#department').innerHTML=opts(departamentos,'idDepartamento','','Todos los departamentos');
function fechaFinPrevista(inicio,horas,horario=JORNADA_BASE){
 if(!inicio||!horasValidas(horas)||!horario)return null;
 const date=new Date(inicio+'T12:00:00Z');
 if(Number.isNaN(date.getTime()))return null;
 const semana=Array.from({length:7},(_,day)=>Number(horario[day]??0));
 if(semana.some(h=>!Number.isFinite(h)||h<0||h>24)||semana.reduce((a,b)=>a+b,0)<=0)return null;
 let restantes=Number(horas);
 for(let i=0;i<36600;i++){restantes-=semana[date.getUTCDay()];if(restantes<=0)return date.toISOString().slice(0,10);date.setUTCDate(date.getUTCDate()+1);}
 return null;
}
function aumentarHorasAcordadas(periodo,nuevoTotal,motivo){
 const anterior=Number(periodo.meta),nuevo=Number(nuevoTotal);
 if(!horasValidas(nuevo)||!Number.isFinite(anterior)||nuevo<=anterior)throw Error('El nuevo total debe superar las horas acordadas actuales y ser al menos 320 h.');
 if(!String(motivo??'').trim())throw Error('Indica el motivo de la ampliación solicitada.');
 const fin=fechaFinPrevista(periodo.inicio,nuevo,periodo.horarioSemanal??JORNADA_BASE);
 if(!fin)throw Error('Faltan el inicio o un horario válido para recalcular la fecha de fin.');
 periodo.horasDeclaradasOriginales??=anterior;
 periodo.ajustesHoras=[...(periodo.ajustesHoras??[]),{anterior,nuevo,motivo:String(motivo).trim(),fecha:today(),finAnterior:periodo.finPrevisto??fechaFinPrevista(periodo.inicio,anterior,periodo.horarioSemanal??JORNADA_BASE),finNuevo:fin}];
 periodo.meta=nuevo;periodo.finPrevisto=fin;
}
function historialHoras(periodo){return '<h3>Historial de ampliaciones</h3>'+((periodo.ajustesHoras??[]).map(a=>'<article class="history"><strong>'+escape(a.anterior)+' h → '+escape(a.nuevo)+' h</strong><p>'+escape(a.fecha)+' · '+escape(a.motivo)+'</p><p>Fin estimado: '+escape(a.finNuevo)+'</p></article>').join('')||'<p class="hint">Sin ampliaciones. Se mantienen las horas declaradas en el formulario.</p>');}
function datosPracticas(p){
 const f=p.expedienteId?p:fichaFor(p),periodo=f.periodos?.at(-1);
 const inicio=periodo?.inicio??f.inicioPrueba;
 const horas=periodo?.meta??f.horasConvenio;
 const fin=periodo?.fin??periodo?.finPrevisto??f.finPrevisto??fechaFinPrevista(inicio,horas,periodo?.horarioSemanal??f.horarioSemanal??JORNADA_BASE);
 return {inicio,horas,fin};
}
function celdasPracticas(p){const d=datosPracticas(p);return '<td class="practice-value">'+escape(d.horas!=null?d.horas+' h':'No informado')+'</td><td class="practice-value">'+escape(d.inicio??'No informado')+'</td><td class="practice-value">'+escape(d.fin??'Por definir')+(!d.fin?'<small>Faltan datos de inicio u horas</small>':'')+'</td>';}
function render(){
 const all=obtenerColaboradores(),entries=read().filter(e=>!e.aceptadoId&&canReview(e));
 $('#pendingCount').textContent=entries.filter(e=>pendingState(e)==='Por revisar').length;$('#observedCount').textContent=entries.filter(e=>pendingState(e)==='Con observaciones').length;$('#activeCount').textContent=all.filter(p=>p.estado==='Activo').length;
 const query=norm($('#search').value),dep=$('#department').value,state=$('#stateFilter').value;
 const source=tab==='review'?entries:tab==='reentry'?all.filter(p=>p.estado!=='Activo'):all;
 const filtered=source.filter(p=>(!dep||p.idDepartamento===dep)&&(!state||(tab==='review'?pendingState(p):p.estado)===state)&&norm(name(p)+' '+p.numeroDocumento+' '+(p.codigoColaborador??'')).includes(query));
 $('#rows').innerHTML=filtered.map(p=>`<tr><td><strong>${escape(name(p))}</strong><small>${escape(p.codigoColaborador?'Código '+p.codigoColaborador: (p.demo?'Demostración · ID pendiente':'ID pendiente de aceptación'))}</small></td><td>${escape(p.tipoDocumento)} ${escape(p.numeroDocumento)}</td><td>${escape(locationLabel(p))}<small>${escape(label(departamentos,p.idDepartamento,'idDepartamento'))}</small></td>${celdasPracticas(p)}<td><span class="badge ${p.estado==='Activo'?'green':''}">${escape(tab==='review'?pendingState(p):p.estado)}</span></td><td><button data-detail="${escape(tab==='review'?p.expedienteId:p.idColaborador)}">${tab==='review'?'Revisar expediente':tab==='reentry'?'Evaluar reingreso':'Ver ficha'}</button></td></tr>`).join('');
 $('#empty').hidden=filtered.length>0;$('#count').textContent=filtered.length+' registros';
 $('#listHint').textContent=tab==='review'?'Expedientes recibidos después del período de prueba.':tab==='reentry'?'Evalúa el historial antes de iniciar un nuevo período. Las bajas requieren revisión de su causal.':'Datos compartidos con el Organigrama. Solo los activos se muestran allí.';
}
function changeTab(next){tab=next;document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tab)));$('#stateFilter').innerHTML='<option value="">Todos los estados</option>'+(tab==='review'?['Por revisar','Con observaciones']:['Activo','Inactivo','Baja']).map(s=>`<option>${s}</option>`).join('');render();}
function dataList(p){
 const section=(title,items)=>'<section class="form-section"><h3>'+title+'</h3><dl>'+items.map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+escape(v===undefined||v===null||v===''?'No informado':v)+'</dd></div>').join('')+'</dl></section>';
 return section('Datos personales y formulario',[
 ['Fecha de envío del formulario',p.marcaTemporal],['Nombres y apellidos completos',name(p)],['Tipo de documento',p.tipoDocumento],['Número de documento',p.numeroDocumento],['Fecha de nacimiento',p.nacimiento],['Nacionalidad',p.nacionalidad],['Dirección actual',p.direccion],['Correo',p.correo],['Teléfono',p.telefono]
 ])+section('Formación e institución',[
 ['Situación actual como practicante',p.situacionPracticante],['Especialidad o carrera',p.carrera],['Tipo de institución',p.institucionTipo],['Razón social de la institución',p.institucion],['RUC de la institución',p.rucInstitucion],['Dirección de la institución',p.direccionInstitucion]
 ])+section('Representante de la institución',[
 ['Nombre completo del representante',p.representanteNombre],['DNI del representante',p.representanteDocumento],['Cargo del representante',p.representanteCargo]
 ])+section('Asignación y horas declaradas',[
 ['Departamento',label(departamentos,p.idDepartamento,'idDepartamento')],['Área',label(areas,p.idArea,'idArea')],['Subárea',p.idSubArea?label(subareas,p.idSubArea,'idSubArea'):'No aplica'],['Rol',label(roles,p.idRol,'idRol')],['Inicio de prácticas (ingreso a prueba)',p.inicioPrueba],['Fin del período de prueba',p.finPrueba],['Jornada base','5 horas diarias · lunes a viernes'],['Fin previsto de prácticas',p.finPrevisto??fechaFinPrevista(p.inicioPrueba,p.horasConvenio,p.horarioSemanal??JORNADA_BASE)??'Por definir: faltan datos de inicio u horas'],['Horas requeridas por la institución / acordadas',p.horasConvenio!=null?p.horasConvenio+' h (mínimo 320 h)':null]
 ]);
}
function documentTable(docs,review=false){return `<div class="table-scroll"><table class="docs"><thead><tr><th>Documento</th><th>Estado</th><th>Revisión</th></tr></thead><tbody>${documents.map(([key,title])=>{const d=docs?.[key];return `<tr><td><strong>${title}</strong><small>${escape(d?.nombre??'Sin documento en este expediente')}</small>${d?`<button data-preview="${key}" class="subtle">Previsualizar</button>`:''}</td><td><span class="badge ${d?.estado==='Aceptado'?'green':d?.estado==='Observado'?'red':''}">${escape(d?.estado??'Sin registro')}</span>${d?.motivo?`<small>${escape(d.motivo)}</small>`:''}</td><td>${review?`<div class="doc-actions"><button data-document="${key}" data-decision="Aceptado">Aceptar</button><button data-document="${key}" data-decision="Observado" class="danger">Observar</button></div><input aria-label="Observación: ${title}" id="reason_${key}" placeholder="Describe qué debe corregirse" value="${escape(d?.motivo??'')}">`:'—'}</td></tr>`;}).join('')}</tbody></table></div>`;}
function metadataFor(e){const inicio=e.inicioPrueba,horas=e.horasConvenio,horario=e.horarioSemanal??{...JORNADA_BASE};const fin=e.finPrevisto??fechaFinPrevista(inicio,horas,horario);return {...Object.fromEntries(CAMPOS_FORMULARIO.map(key=>[key,e[key]])),expedienteId:e.expedienteId,documentos:e.documentos,finPrevisto:fin,periodos:[{id:uid(),inicio,finPrevisto:fin,horarioSemanal:horario,meta:horas,horasDeclaradasOriginales:horas,ajustesHoras:[],horas:{},reingreso:false}],evaluaciones:[]};}
const documentosDemostracion = new Set(
 [...colaboradoresIniciales,...colaboradoresDemostracion].map(p=>p.numeroDocumento+'|'+p.correo)
);
function fichaDemostracion(p){
 if(!documentosDemostracion.has(p.numeroDocumento+'|'+p.correo))return {};
 const inicio=p.fechaIngreso;
 const meta=330;
 const finPrevisto=fechaFinPrevista(inicio,meta);
 return {
  demo:true,inicioPrueba:inicio,
  periodos:[{
   id:p.idColaborador+'-periodo-demo',inicio,meta,finPrevisto,
   horarioSemanal:{...JORNADA_BASE},horasDeclaradasOriginales:meta,ajustesHoras:[],
   horas:{},fin:p.fechaSalida??null
  }]
 };
}
function fichaFor(p){const e=read().find(e=>e.aceptadoId===p.idColaborador||e.expedienteId===p.fichaTalento?.expedienteId);const f={...(p.fichaTalento??(e?metadataFor(e):fichaDemostracion(p)))};if(e){for(const key of CAMPOS_FORMULARIO)if(f[key]==null&&e[key]!=null)f[key]=e[key];}if(f.inicioPrueba&&f.periodos?.length){f.periodos=f.periodos.map((period,i)=>i===0&&!period.reingreso?{...period,inicio:f.inicioPrueba}:period);}return f;}
function openDetail(id){currentId=id;$('#detailError').textContent='';const e=read().find(x=>x.expedienteId===id&&!x.aceptadoId);const p=obtenerColaboradores().find(x=>x.idColaborador===id);if(!e&&!p)throw Error('El registro ya no está disponible.');$('#detailTitle').textContent=name(e??p);$('#detailEyebrow').textContent=e?'REVISIÓN DOCUMENTAL':`${p.idColaborador} · CÓDIGO ${p.codigoColaborador??'PENDIENTE'}`;
 if(e){const ready=horasValidas(e.horasConvenio)&&documents.every(([key])=>e.documentos[key]?.estado==='Aceptado');$('#detailBody').innerHTML=dataList(e)+`${!horasValidas(e.horasConvenio)?'<p class="error">Las horas acordadas deben ser al menos 320 h. Se requiere corregir el formulario antes de aceptar.</p>':''}<h3>Expediente documental</h3>${documentTable(e.documentos,true)}<p class="hint">${e.demo?'Expediente ficticio de demostración. ':''}Aceptar incorpora a esta persona como activa y actualiza el Organigrama.</p><footer class="dialog-actions"><button id="acceptEntry" class="primary" ${ready?'':'disabled'}>Aceptar colaborador y generar ID</button></footer>`;
 }else{const f=fichaFor(p),periods=f.periodos??[],period=periods.at(-1);$('#detailBody').innerHTML=`<div class="detail-tabs"><button data-section="general" aria-pressed="true">Datos generales</button><button data-section="documents" aria-pressed="false">Expediente</button><button data-section="periods" aria-pressed="false">Convenio e historial</button></div><section data-panel="general">${dataList({...p,...f,horasConvenio:period?.meta,inicioPrueba:period?.inicio??f.inicioPrueba,finPrevisto:period?.finPrevisto??f.finPrevisto,idDepartamento:p.idDepartamento,idArea:p.idArea,idSubArea:p.idSubArea,idRol:p.idRol})}<p><span class="badge">${escape(p.estado)}</span></p></section><section data-panel="documents" hidden>${documentTable(f.documentos)}</section><section data-panel="periods" hidden>${f.demo?'<p class="hint">Período y horas de demostración.</p>':''}${period?`<div class="period-summary"><div><small>Horas acordadas vigentes</small><strong>${escape(period.meta)} h</strong></div><div><small>Horas declaradas en el formulario</small><strong>${escape(period.horasDeclaradasOriginales??period.meta)} h</strong></div></div><p>Inicio: ${escape(period.inicio)} · Firma: ${escape(period.firma??'Pendiente')} · Estado: ${period.fin?'Finalizado':'En curso'}</p>${!period.fin&&p.estado==='Activo'?`<form id="agreementForm" class="form-grid"><label>Fecha de firma<input name="firma" type="date" required value="${escape(period.firma??'')}" max="${today()}"></label><label>Fin formal del convenio<input name="finFormal" type="date" required value="${escape(period.finFormal??'')}"></label><label>Vigencia de accesos<input name="vigencia" type="date" required value="${escape(period.vigencia??'')}"></label><button class="primary">Guardar convenio</button></form><h3>Editar horas acordadas</h3><p class="hint">Amplía el total cuando el colaborador lo solicite a Talento Humano. Se conserva lo declarado en el formulario y se recalcula el fin estimado desde el ingreso a prueba.</p><form id="adjustHoursForm" class="form-grid"><label>Nuevo total de horas acordadas<input name="nuevoTotal" type="number" min="${Number(period.meta)+1}" step="1" required placeholder="Más de ${escape(period.meta)} h"></label><label>Motivo de la ampliación<textarea name="motivo" required placeholder="Solicitud del colaborador y motivo"></textarea></label><button class="primary">Guardar ampliación</button></form><p class="hint">Fin estimado vigente: ${escape(period.finPrevisto??fechaFinPrevista(period.inicio,period.meta,period.horarioSemanal??JORNADA_BASE)??'Por definir')}. La fecha formal del convenio se conserva.</p>`:''}${historialHoras(period)}`:'<p class="hint">Este registro compartido todavía no tiene un convenio documentado en esta vista.</p>'}<h3>Historial de períodos</h3>${periods.map((x,i)=>`<article class="history"><strong>Período ${i+1}${x.reingreso?' · Reingreso':''}</strong><p>${escape(x.inicio)} → ${escape(x.fin??'En curso')} · ${escape(x.motivo??'Aceptación documental')}</p><p>${escape(x.observaciones??'')}</p></article>`).join('')||'<p>Sin períodos registrados.</p>'}${(f.evaluaciones??[]).map(x=>`<article class="history"><strong>Evaluación: ${escape(x.decision)}</strong><p>${escape(x.fecha)} · ${escape(x.motivo)}</p></article>`).join('')}</section>${p.estado!=='Activo'?`<section class="reentry"><h3>Evaluación de reingreso</h3><p class="hint">${p.estado==='Baja'?'La causal de baja debe revisarse antes de autorizar un reingreso. La aprobación está bloqueada en esta vista.':'Se conserva el ID y el código del colaborador; se abre un nuevo período.'}</p><form id="reentryForm" class="form-grid"><label>Decisión<select name="decision"><option>Rechazado</option>${p.estado==='Baja'?'':'<option>Aprobado</option>'}</select></label><label>Inicio del nuevo período<input type="date" name="inicio"></label><label>Horas acordadas<input type="number" name="meta" min="320" max="10000" step="1"></label><label>Motivo de la decisión<textarea name="motivo" required></textarea></label><button class="primary">Guardar evaluación</button></form></section>`:''}`;
 }
 if(!$('#detailDialog').open)$('#detailDialog').showModal();
}
async function preview(key){
 const e=read().find(x=>x.expedienteId===currentId),p=obtenerColaboradores().find(x=>x.idColaborador===currentId);
 const doc=(e?.documentos??(p?fichaFor(p).documentos:null))?.[key];
 if(!doc)throw Error('No existe el documento.');
 const title=documents.find(([k])=>k===key)?.[1];if(!title)throw Error('Tipo de documento no reconocido.');
 $('#previewTitle').textContent=title;$('#previewBody').replaceChildren();
 if(previewURL)URL.revokeObjectURL(previewURL);previewURL=null;
 let src,type;
 if(doc.demo){src=new URL('../assets/documentos-ejemplo/'+key+'.pdf',location.href).href;type='application/pdf';}
 else {const blob=await fileStore('readonly',doc.archivoId);if(!blob)throw Error('El archivo no está disponible en este navegador.');previewURL=URL.createObjectURL(blob);src=previewURL;type=blob.type;}
 const tools=document.createElement('div');tools.className='preview-toolbar';
 const note=document.createElement('span');note.textContent=doc.demo?'Documento PDF de ejemplo · datos ficticios':doc.nombre;
 const link=document.createElement('a');link.href=src;link.target='_blank';link.rel='noopener';link.textContent='Abrir documento ↗';tools.append(note,link);$('#previewBody').append(tools);
 const view=document.createElement(type==='application/pdf'?'iframe':'img');view.src=src;if(view.tagName==='IFRAME')view.title=title;else view.alt=title;
 $('#previewBody').append(view);$('#previewDialog').showModal();
}
function accept(){const entries=read(),e=entries.find(x=>x.expedienteId===currentId);if(!e)throw Error('No se encontró el expediente.');validateAcceptance(e);const people=obtenerColaboradores();const existing=people.find(p=>norm(p.numeroDocumento.replace(/\s/g,''))===norm(e.numeroDocumento.replace(/\s/g,'')));if(existing&&existing.fichaTalento?.expedienteId!==e.expedienteId)throw Error('Este documento ya pertenece a un colaborador. Usa Reingresos.');let person=existing;
 if(!person){const maxCode=people.reduce((max,p)=>Math.max(max,Number(p.codigoColaborador)||0),1000);const metadata=metadataFor(e);person=registrarColaborador({...e,codigoColaborador:String(maxCode+1),estado:'Activo',fechaIngreso:e.inicioPrueba,foto:null,fichaTalento:metadata});}
 if(!person.fichaTalento)throw Error('No se guardó el expediente compartido. Recarga la página antes de continuar.');
 save(entries.map(x=>x.expedienteId===e.expedienteId?{...x,aceptadoId:person.idColaborador}:x));$('#detailDialog').close();render();notice(`Colaborador aceptado. ID ${person.idColaborador}, código ${person.codigoColaborador}. El Organigrama se actualiza automáticamente.`);
}
function mutatePerson(callback){const p=obtenerColaboradores().find(x=>x.idColaborador===currentId);if(!p)throw Error('No existe el colaborador.');const ficha=structuredClone(fichaFor(p));const changes=callback(p,ficha)??{};actualizarColaborador(p.idColaborador,{...changes,fichaTalento:ficha});render();openDetail(p.idColaborador);}
$('#detailBody').addEventListener('click',async event=>{const b=event.target.closest('button');if(!b)return;try{$('#detailError').textContent='';if(b.dataset.preview){await preview(b.dataset.preview);return;}if(b.dataset.section){b.parentElement?.querySelectorAll('[data-section]').forEach(tab=>tab.setAttribute('aria-pressed',String(tab===b)));document.querySelectorAll('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==b.dataset.section);return;}if(b.dataset.document){const entries=read(),e=entries.find(x=>x.expedienteId===currentId);if(!e||e.aceptadoId)throw Error('El expediente ya no está pendiente.');const motivo=$('#reason_'+b.dataset.document).value.trim();if(b.dataset.decision==='Observado'&&!motivo)throw Error('Describe la observación para que el practicante pueda corregir el documento.');e.documentos[b.dataset.document]={...e.documentos[b.dataset.document],estado:b.dataset.decision,motivo:b.dataset.decision==='Observado'?motivo:'',fechaRevision:today()};save(entries);render();openDetail(currentId);return;}if(b.id==='acceptEntry'){b.disabled=true;try{if(navigator.locks)await navigator.locks.request('th-aceptacion-colaborador',accept);else accept();}finally{b.disabled=false;}}}catch(error){$('#detailError').textContent=error.message;}});
$('#detailBody').addEventListener('submit',event=>{event.preventDefault();const f=event.target,v=Object.fromEntries(new FormData(f));try{
 mutatePerson((p,meta)=>{const period=meta.periodos?.at(-1);if(f.id==='reentryForm'){if(p.estado==='Activo')throw Error('La persona ya está activa.');if(!v.motivo.trim())throw Error('Indica el motivo de la evaluación.');if(v.decision==='Aprobado'){if(p.estado==='Baja')throw Error('No se permite reingresar una baja sin revisar su causal.');if(!v.inicio||v.inicio>today()||!isWeekday(v.inicio)||!horasValidas(v.meta))throw Error('Indica inicio laborable no futuro y al menos 320 horas acordadas.');if(period&&!period.fin)throw Error('El período anterior debe estar finalizado.');if(period?.fin&&v.inicio<=period.fin)throw Error('El reingreso debe ser posterior al cierre anterior.');meta.periodos=[...(meta.periodos??[]),{id:uid(),inicio:v.inicio,horarioSemanal:{...JORNADA_BASE},meta:Number(v.meta),horasDeclaradasOriginales:Number(v.meta),ajustesHoras:[],horas:{},reingreso:true}];}meta.evaluaciones=[...(meta.evaluaciones??[]),{decision:v.decision,motivo:v.motivo,fecha:today()}];return v.decision==='Aprobado'?{estado:'Activo',fechaIngreso:v.inicio,fechaSalida:null}:{};}
 if(!period||period.fin||p.estado!=='Activo')throw Error('No hay un período activo editable.');
 if(f.id==='agreementForm'){if(v.firma<period.inicio||v.firma>today()||!isWeekday(v.firma))throw Error('La firma debe ser un día laborable entre el inicio y hoy.');if(v.finFormal<v.firma||v.vigencia<v.finFormal)throw Error('Revisa la secuencia: firma, fin formal y vigencia de accesos.');Object.assign(period,v);}
 if(f.id==='adjustHoursForm')aumentarHorasAcordadas(period,v.nuevoTotal,v.motivo);
 });notice('Cambios guardados.');if(f.id!=='reentryForm')document.querySelector('[data-section="periods"]')?.click();
 }catch(error){$('#detailError').textContent=error.message;}});
function isWeekday(date){const day=new Date(date+'T12:00:00Z').getUTCDay();return day>0&&day<6;}
$('#previewDialog').addEventListener('close',()=>{if(previewURL)URL.revokeObjectURL(previewURL);previewURL=null;$('#previewBody').replaceChildren();});
document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;try{if(b.dataset.close)$('#'+b.dataset.close).close();if(b.dataset.tab)changeTab(b.dataset.tab);if(b.dataset.detail)openDetail(b.dataset.detail);}catch(error){notice(error.message,true);}});
['#search','#department','#stateFilter'].forEach(selector=>$(selector).addEventListener(selector==='#search'?'input':'change',()=>{try{render();}catch(error){notice(error.message,true);}}));
window.addEventListener('storage',event=>{if([KEY,'th_colaboradores'].includes(event.key)||event.key===null){try{render();if($('#detailDialog').open)openDetail(currentId);}catch(error){notice(error.message,true);}}});
// Expedientes ficticios recibidos: independientes del prototipo de la otra área.
// Identificadores estables permiten conservar las revisiones y aceptaciones al recargar.
function cargarExpedientesDemostracion(){
 const existentes=read();
 const colaboradores=obtenerColaboradores();
 const fecha=today();
 const fin=new Date(fecha+'T12:00:00Z');fin.setUTCDate(fin.getUTCDate()-5);
 const casos=[
  {clave:'001',nombres:'Camila',apellidoPaterno:'Salazar',apellidoMaterno:'Vega',idDepartamento:'DEP-001',idArea:'ARE-002',idSubArea:null,institucionTipo:'Universidad'},
  {clave:'002',nombres:'Andrés',apellidoPaterno:'Molina',apellidoMaterno:'Paz',idDepartamento:'DEP-002',idArea:'ARE-004',idSubArea:null,institucionTipo:'Instituto'},
  {clave:'003',nombres:'Renata',apellidoPaterno:'Delgado',apellidoMaterno:'Ruiz',idDepartamento:'DEP-003',idArea:'ARE-010',idSubArea:'SUB-001',institucionTipo:'Instituto',observado:'foto'},
  {clave:'004',nombres:'Sebastián',apellidoPaterno:'Castro',apellidoMaterno:'León',idDepartamento:'DEP-002',idArea:'ARE-005',idSubArea:null,institucionTipo:'Universidad'}
 ];
 let agregados=0;
 for(const caso of casos){
  const expedienteId='demo-recepcion-v1-'+caso.clave;
  const numeroDocumento='TH-DEMO-'+caso.clave;
  if(existentes.some(e=>e.expedienteId===expedienteId||e.numeroDocumento===numeroDocumento)||colaboradores.some(p=>p.numeroDocumento===numeroDocumento||p.fichaTalento?.expedienteId===expedienteId))continue;
  const documentos=Object.fromEntries(documents.map(([key,titulo])=>[key,{
   nombre:titulo+' · muestra ficticia',demo:true,
   estado:caso.observado?(key===caso.observado?'Observado':'Aceptado'):'Pendiente',
   motivo:key===caso.observado?'La fotografía de ejemplo no tiene fondo blanco. Se solicita una nueva imagen.':''
  }]));
  existentes.push({expedienteId,demo:true,nombres:caso.nombres,apellidoPaterno:caso.apellidoPaterno,apellidoMaterno:caso.apellidoMaterno,
   tipoDocumento:'DNI',numeroDocumento,nacimiento:'2003-06-15',nacionalidad:'Peruana',direccion:'Domicilio ficticio de demostración',
   correo:'expediente-'+caso.clave+'@example.test',telefono:'900000000',tipoColaborador:'Practicante',
   institucionTipo:caso.institucionTipo,institucion:'Institución ficticia de demostración',
   idDepartamento:caso.idDepartamento,idArea:caso.idArea,idSubArea:caso.idSubArea,idRol:'ROL-005',
   finPrueba:fin.toISOString().slice(0,10),fechaIngreso:fecha,horasConvenio:330,formularioCompleto:true,documentos});
  agregados++;
 }
 let enriquecidos=false;
 for(const e of existentes){
  if(!e.demo||!(/^demo-recepcion-v1-/.test(e.expedienteId)||e.expedienteId==='demo-valeria-01'))continue;
  const inicioDemo=new Date(e.finPrueba+'T12:00:00Z');inicioDemo.setUTCDate(inicioDemo.getUTCDate()-4);
  const defaults={inicioPrueba:inicioDemo.toISOString().slice(0,10),marcaTemporal:e.fechaIngreso+' 09:00 (America/Lima)',situacionPracticante:'Estudiante en prácticas preprofesionales',carrera:e.idDepartamento==='DEP-002'?'Desarrollo de software':e.idDepartamento==='DEP-003'?'Comunicación audiovisual':'Administración y Recursos Humanos',rucInstitucion:'RUC-DEMO-001',direccionInstitucion:'Av. Institución de Ejemplo 123, Lima (ficticia)',representanteNombre:'Patricia Ejemplo Torres',representanteDocumento:'DNI-DEMO-001',representanteCargo:'Coordinadora de prácticas (ejemplo)'};
  for(const [key,value]of Object.entries(defaults)){if(e[key]===undefined){e[key]=value;enriquecidos=true;}}
 }
 if(agregados||enriquecidos)save(existentes);
}
try{cargarExpedientesDemostracion();changeTab('review');}catch(error){notice(error.message,true);}
