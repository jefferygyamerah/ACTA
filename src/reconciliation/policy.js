import path from 'node:path';
import {root,sha256} from '../runtime/assets.js';
import {sourceSnapshot} from '../sucursal/procedimiento.js';
export const policyPath=path.join(root,'fixtures/reconciliation/policy.md');
export function reviewPolicy(file=policyPath){return {...sourceSnapshot(file),documentId:'ACTA-REVISION-SINTETICA'};}
const normalize=s=>String(s??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLocaleLowerCase('es').replace(/[.,;:#]/g,' ').replace(/\s+/g,' ').trim();
const MESES={enero:1,febrero:2,marzo:3,abril:4,mayo:5,junio:6,julio:7,agosto:8,septiembre:9,setiembre:9,octubre:10,noviembre:11,diciembre:12};
function dateValue(value){
 const raw=String(value??'').trim();let s;
 if(/^\d{4}-\d{2}-\d{2}$/.test(raw))s=raw;
 else if(/^\d{2}\/\d{2}\/\d{4}$/.test(raw)){const[d,mo,y]=raw.split('/');s=y+'-'+mo+'-'+d;}
 else{
  const m=normalize(raw).match(/^([0-9]{1,2}) de ([a-z]+)(?: de ([0-9]{4}))?$/);
  if(!m||!m[3])return null;
  const mes=MESES[m[2]];if(!mes)return null;
  s=m[3]+'-'+String(mes).padStart(2,'0')+'-'+m[1].padStart(2,'0');
 }
 if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return null;
 const n=Date.parse(s+'T00:00:00Z');return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===s?n:null;
}
export function policyCitation(policy,id){
 const section=policy.sections.find(x=>x.id===id);if(!section)throw new Error('Falta la regla sintética '+id);
 return {sourceDocumentId:policy.documentId,sourceVersion:policy.version,sourceHash:policy.sourceHash,sectionId:id,start:section.start,end:section.end,excerpt:policy.text.slice(section.start,section.end)};
}
export function reconcile(c,policy){
 const active=c.documents.filter(d=>!d.supersededBy);
 const pending=active.filter(d=>!d.review);
 const reviewed=active.filter(d=>d.review);
 const byKind=kind=>reviewed.filter(d=>d.review.kind===kind);
 const fact=(d,field)=>d.review.facts.find(f=>f.field===field);
 const refs=[];
 const finding=(id,title,status,reason,action,documents,rule)=>({id,title,status,reason,action,documents:documents.map(d=>({id:d.id,name:d.name})),evidence:documents.flatMap(d=>d.review?.facts||[]),policy:policyCitation(policy,rule)});
 const apps=byKind('application'),app=apps[0];
 const incomplete=missing=>finding('perfil','Perfil de la solicitud','review',missing,'Revisar la solicitud antes de pedir documentos.',apps,'REV-PER-01');
 if(apps.length!==1||!app||['holder','identityNumber','address'].some(f=>!fact(app,f))){
   refs.push(incomplete(apps.length>1?'Hay más de una solicitud activa; indique cuál sustituye a la anterior.':'La solicitud no tiene titular, identificación y domicilio revisados.'));
 }else refs.push(finding('perfil','Perfil de la solicitud','satisfied','Titular, identificación y domicilio declarados están revisados.','Conservar esta solicitud.',[app],'REV-PER-01'));
 const asOf=dateValue(c.asOf);if(asOf===null)throw new Error('Fecha de revisión inválida.');
 for(const spec of [
  {id:'identidad',title:'Identificación',kind:'identity',fields:['holder','identityNumber','expiresAt'],rule:'REV-ID-01',missing:'No hay una identificación revisada en el expediente.'},
  {id:'domicilio',title:'Domicilio',kind:'address',fields:['holder','address','issuedAt'],rule:'REV-DOM-01',missing:'No hay un comprobante de domicilio revisado en el expediente.'},
  {id:'ingresos',title:'Respaldo de ingresos',kind:'income',fields:['holder','incomeSource','issuedAt'],rule:'REV-ING-01',missing:'No hay carta laboral ni declaración de origen de fondos revisada.'}
 ]){
  const docs=byKind(spec.kind);
  if(pending.length){refs.push(finding(spec.id,spec.title,'review','Hay documentos cuya lectura aún no está confirmada.','Completar la revisión interna; no pedir el documento todavía.',docs,spec.rule));continue;}
  if(!docs.length){refs.push(finding(spec.id,spec.title,'missing',spec.missing,'Aportar '+(spec.kind==='income'?'una carta laboral o una declaración de origen de fondos con titular, fuente y fecha.':spec.kind==='address'?'un comprobante de domicilio con titular, dirección y fecha.':'una identificación con titular, identificador y vencimiento.'),[],spec.rule));continue;}
  if(refs[0].status!=='satisfied'){refs.push(finding(spec.id,spec.title,'review','Primero debe revisarse el perfil declarado.','Aclarar la solicitud.',docs,spec.rule));continue;}
  if(docs.length>1){refs.push(finding(spec.id,spec.title,'review','Hay varios respaldos activos para este requisito.','Indicar qué documento sustituye al anterior o revisar cuál corresponde.',docs,spec.rule));continue;}
  const d=docs[0],absent=spec.fields.filter(f=>!fact(d,f));
  if(absent.length){refs.push(finding(spec.id,spec.title,'review','La lectura no contiene todos los datos necesarios: '+absent.join(', ')+'.','Revisar el documento y corregir la lectura; no asumir un faltante.',[d],spec.rule));continue;}
  const reasons=[],actions=[];
  if(normalize(fact(d,'holder').value)!==normalize(fact(app,'holder').value)){reasons.push('El titular del documento no coincide con la solicitud.');actions.push('Aclarar el titular o aportar un respaldo a nombre de la persona solicitante.');}
  if(spec.kind==='identity'&&normalize(fact(d,'identityNumber').value)!==normalize(fact(app,'identityNumber').value)){reasons.push('El identificador no coincide con el indicado en la solicitud.');actions.push('Aclarar la diferencia de identificación.');}
  if(spec.kind==='address'&&normalize(fact(d,'address').value)!==normalize(fact(app,'address').value)){reasons.push('El domicilio del comprobante no coincide con el domicilio declarado.');actions.push('Aclarar la diferencia o aportar un comprobante del domicilio declarado.');}
  const dateField=spec.kind==='identity'?'expiresAt':'issuedAt',date=dateValue(fact(d,dateField).value);
  if(date===null){refs.push(finding(spec.id,spec.title,'review','La fecha no puede interpretarse con certeza.','Revisar la fecha; no inferirla.',[d],spec.rule));continue;}
  if(spec.kind==='identity'&&date<asOf){reasons.push('La identificación está vencida en la fecha de revisión.');actions.push('Aportar una identificación vigente.');}
  if(spec.kind!=='identity'&&date>asOf){refs.push(finding(spec.id,spec.title,'review','El documento muestra una fecha futura.','Revisar la fecha y el documento.',[d],spec.rule));continue;}
  if(spec.kind!=='identity'&&(asOf-date)/86400000>90){reasons.push('El respaldo supera los 90 días permitidos por la guía sintética.');actions.push('Aportar un respaldo vigente de '+(spec.kind==='address'?'domicilio.':'ingresos.'));}
  const positivo={identity:'La identificación coincide con la solicitud y está vigente en la fecha de revisión.',address:'El comprobante de domicilio coincide con el domicilio declarado y se encuentra vigente.',income:'El respaldo de ingresos coincide con el titular declarado y se encuentra vigente.'};
 refs.push(finding(spec.id,spec.title,reasons.length?'conflict':'satisfied',reasons.length?reasons.join(' '):positivo[spec.kind],actions.join(' ')||'Conservar el documento; no volver a solicitarlo.',[app,d],spec.rule));
 }
 const requests=refs.filter(f=>['missing','conflict'].includes(f.status));
 const internal=refs.filter(f=>f.status==='review');
 const previous=c.rounds?.at(-1)?.findings||[];
 const delta=refs.map(f=>{const before=previous.find(x=>x.id===f.id);return {id:f.id,title:f.title,before:before?.status||null,after:f.status,changed:!!before&&before.status!==f.status,resolved:!!before&&before.status!=='satisfied'&&f.status==='satisfied'};});
 const result={revision:c.revision,sourceHash:policy.sourceHash,sourceVersion:policy.version,asOf:c.asOf,findings:refs,requests:requests.map(f=>f.id),internalReview:internal.map(f=>f.id),unreviewedDocuments:pending.map(d=>d.id),ready:internal.length===0&&requests.length===0,delta};
 result.analysisHash=sha256(JSON.stringify(result));return result;
}
export function customerRequest(analysis){
 if(analysis.internalReview.length||analysis.unreviewedDocuments.length)throw Object.assign(new Error('Complete la revisión interna antes de preparar la solicitud.'),{status:409});
 const pending=analysis.findings.filter(f=>analysis.requests.includes(f.id));
 return pending.length?'Para continuar con la revisión de su solicitud, necesitamos aclarar lo siguiente:\n\n'+pending.map((f,i)=>(i+1)+'. '+f.title+': '+f.action).join('\n')+'\n\nConservamos los documentos que ya fueron revisados. Esta solicitud no constituye aprobación de cuenta.':'No se requieren nuevos documentos según la revisión de esta guía sintética. El expediente está listo para revisión del supervisor.';
}
