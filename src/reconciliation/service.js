import {randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {CaseService,fail} from '../service.js';
import {sellar,huella} from '../core/sello.js';
import {root,sha256} from '../runtime/assets.js';
import {importDocument,extractDocument,validateExtraction} from './documents.js';
import {reviewPolicy,policyPath,reconcile,customerRequest,policyCitation} from './policy.js';
const dateOK=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
const exactly=(a,b)=>Array.isArray(a)&&a.length===new Set(a).size&&huella([...a].sort())===huella([...b].sort());
const localIsoDate=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const immutable=a=>{if(a&&typeof a==='object')for(const v of Object.values(a))immutable(v);return Object.freeze(a);};
export class ReconciliationService extends CaseService{
 constructor(options){super(options);this.reviewPolicyPath=options.reviewPolicyPath||policyPath;}
 policy(){return reviewPolicy(this.reviewPolicyPath);}
 packet(sid,id){const c=this.active(sid,id);if(c.workflow!=='reconciliation')fail('Este expediente no corresponde a revisión documental.');return c;}
 packetEditable(sid,id,revision){this.packet(sid,id);return this.editable(sid,id,revision);}
 createPacket(sid,{title='Apertura de cuenta · expediente ficticio',asOf=localIsoDate(new Date())}={}){
  if(!dateOK(asOf))fail('Fecha de revisión inválida.',400);
  const created=super.create(sid,{title,facts:'Revisión documental de una solicitud sintética.'});delete created.records;
  Object.assign(created,{workflow:'reconciliation',asOf,phase:'collecting',documents:[],rounds:[],events:[],note:'',sourceReview:null});
  this.store.put(created);return this.getPacket(sid,created.id);
 }
 getPacket(sid,id){
  const c=this.packet(sid,id),saved=super.get(sid,id);
  if(c.lifecycle==='reviewed'){
   const analysis=immutable(structuredClone(saved.records[saved.records.length-1].analysis));
   return {...saved,analysis,documents:c.documents.map(({originalBase64,...d})=>d)};
  }
  return {...saved,analysis:reconcile(c,this.policy()),documents:c.documents.map(({originalBase64,...d})=>d)};
 }
 async addDocuments(sid,id,{revision,documents}){
  const before=this.packetEditable(sid,id,revision),generation=this.context(sid).generation;
  if(!Array.isArray(documents)||!documents.length||documents.length>8||before.documents.length+documents.length>24)fail('Adjunte entre 1 y 8 archivos, hasta 24 por expediente.',400);
  const parsed=[];
  for(const input of documents){
   if(input.replacesId&&!before.documents.some(d=>d.id===input.replacesId&&!d.supersededBy))fail('El documento a sustituir no pertenece a este expediente o ya fue sustituido.');
   parsed.push({document:await importDocument(input),replacesId:input.replacesId||null});
  }
  const c=this.packetEditable(sid,id,revision);if(this.context(sid).generation!==generation)fail('La selección cambió durante la lectura.');
  const added=[],duplicates=[];
  for(const item of parsed){
   const duplicate=c.documents.find(d=>d.bytesHash===item.document.bytesHash);
   if(duplicate){duplicates.push({name:item.document.name,existingId:duplicate.id});continue;}
   if(item.replacesId&&c.documents.find(d=>d.id===item.replacesId).supersededBy)fail('Dos archivos no pueden sustituir el mismo documento en una carga.');
   const d={...item.document,receivedInRound:c.rounds.length+1,replacesId:item.replacesId};
   if(item.replacesId)c.documents.find(x=>x.id===item.replacesId).supersededBy=d.id;
   c.documents.push(d);added.push(d.id);
  }
  if(added.length){c.revision++;c.sourceReview=null;this.context(sid).generation++;}
  c.events.push({type:'documents-received',at:new Date().toISOString(),round:c.rounds.length+1,added,duplicates});
  this.store.put(c);return {...this.getPacket(sid,id),intake:{added,duplicates}};
 }
 async readDocument(sid,id,{revision,documentId}){
  const c=this.packetEditable(sid,id,revision),d=c.documents.find(x=>x.id===documentId&&!x.supersededBy);
  if(!d)fail('Documento inexistente o sustituido.');
  if(d.review)fail('La lectura ya fue confirmada. Aporte una sustitución si el documento cambia.');
  const generation=this.context(sid).generation,sourceHash=this.policy().sourceHash;
  const result=await extractDocument(this.runtime,d);
  const after=this.packetEditable(sid,id,revision);
  if(generation!==this.context(sid).generation||this.policy().sourceHash!==sourceHash)fail('Lectura descartada: cambió el expediente o la guía.');
  const target=after.documents.find(x=>x.id===documentId&&!x.supersededBy);
  if(!target||target.textHash!==d.textHash)fail('El documento cambió durante la lectura.');
  target.extraction=result;target.review=null;after.revision++;after.sourceReview=null;this.store.put(after);
  return this.getPacket(sid,id);
 }
 manualDocument(sid,id,{revision,documentId}){
  const c=this.packetEditable(sid,id,revision),d=c.documents.find(x=>x.id===documentId&&!x.supersededBy);
  if(!d||d.review)fail("Seleccione un documento pendiente de revisión.");
  d.extraction={kind:"other",facts:[],runId:randomUUID(),proposedAt:new Date().toISOString(),evidence:{executionMode:"manual",promptSha256:null,outputSha256:null}};
  c.revision++;c.sourceReview=null;this.context(sid).generation++;this.store.put(c);return this.getPacket(sid,id);
 }
 reviewDocument(sid,id,{revision,documentId,textHash,runId,kind,facts,confirmed}){
  const c=this.packetEditable(sid,id,revision),d=c.documents.find(x=>x.id===documentId&&!x.supersededBy);
  if(!d||textHash!==d.textHash||!d.extraction||runId!==d.extraction.runId||confirmed!==true)fail('Revise la lectura vigente y su documento antes de confirmar.');
  const reviewed=validateExtraction(d,{kind,facts});
  d.review={...reviewed,documentId:d.id,textHash:d.textHash,bytesHash:d.bytesHash,runId,reviewedAt:new Date().toISOString(),actor:this.automation?'automation:synthetic-e2e':'colaborador-local-no-autenticado'};
  c.revision++;c.sourceReview=null;this.context(sid).generation++;this.store.put(c);return this.getPacket(sid,id);
 }
 confirmFindings(sid,id,{revision,analysisHash,sourceHash,reviewedIds}){
  const c=this.packetEditable(sid,id,revision),analysis=reconcile(c,this.policy());
  if(analysis.unreviewedDocuments.length||analysis.internalReview.length)fail('Complete las lecturas y revisiones internas pendientes.');
  if(analysisHash!==analysis.analysisHash||sourceHash!==analysis.sourceHash||!exactly(reviewedIds,analysis.findings.map(f=>f.id)))fail('Revise los hallazgos y la guía de esta revisión.');
  c.sourceReview={revision,analysisHash,sourceHash,reviewedIds,confirmedAt:new Date().toISOString()};this.store.put(c);return this.getPacket(sid,id);
 }
 basis(sid,id,revision){
  const c=this.packetEditable(sid,id,revision),policy=this.policy(),analysis=reconcile(c,policy),r=c.sourceReview;
  if(!r||r.revision!==c.revision||r.analysisHash!==analysis.analysisHash||r.sourceHash!==policy.sourceHash)fail('Los hallazgos o su respaldo cambiaron. Revise de nuevo antes de guardar.');
  return {c,analysis,policy};
 }
 previewPacket(sid,id,{revision,note=''}){
  if(typeof note!=='string'||note.length>2000)fail('Nota demasiado larga.',400);
  const {c,analysis,policy}=this.basis(sid,id,revision),request=customerRequest(analysis);
  const finalText=[c.reference+' · '+c.title,'REVISIÓN DOCUMENTAL · DATOS SINTÉTICOS','Revisión '+(c.rounds.length+1)+' · fecha '+c.asOf,'',
   analysis.ready?'RESULTADO: LISTO PARA REVISIÓN DEL SUPERVISOR':'RESULTADO: PENDIENTE DE RESPUESTA DEL CLIENTE','',
   'Documentos que se conservan',...analysis.findings.filter(f=>f.status==='satisfied').map(f=>'- '+f.title+': '+f.reason),'',
   'Pendientes y motivos',...(analysis.requests.length?analysis.findings.filter(f=>analysis.requests.includes(f.id)).map(f=>'- '+f.title+': '+f.reason+' ['+f.policy.sectionId+']'):['Sin pendientes documentales en esta revisión.']),'',
   'Texto preparado (sin envío)',request,'','Nota del colaborador',note||'Sin nota adicional.','',
   'Guía revisada: '+policy.documentId+' · versión '+policy.version,
   'Documentos fuente: '+c.documents.filter(d=>!d.supersededBy).map(d=>d.name).join('; '),
   'La revisión documental no abre una cuenta ni actualiza el CORE.'].join('\n');
  return {finalText,finalTextHash:sha256(finalText),requestText:request,note,revision,analysisHash:analysis.analysisHash,sourceHash:policy.sourceHash,ready:analysis.ready};
 }
 savePacket(sid,id,data){
  this.packet(sid,id);if(typeof data.requestId!=='string'||data.requestId.length<8||data.requestId.length>100)fail('Falta la clave de guardado.',400);
  const requestHash=huella({caseId:id,...data}),prior=this.store.retry(data.requestId);
  if(prior){if(prior.request_hash!==requestHash)fail('La clave de guardado ya se usó con otro contenido.');return JSON.parse(prior.body);}
  const {c,analysis,policy}=this.basis(sid,id,data.revision),preview=this.previewPacket(sid,id,data);
  if(data.approved!==true||data.analysisHash!==analysis.analysisHash||data.sourceHash!==policy.sourceHash||data.finalText!==preview.finalText||data.finalTextHash!==preview.finalTextHash)fail('Apruebe el texto exacto y vigente de esta revisión.');
  const disposition=analysis.ready?'Listo para revisión del supervisor':'Pendiente de respuesta del cliente';
  const documents=c.documents.map(d=>({id:d.id,name:d.name,bytesHash:d.bytesHash,textHash:d.textHash,receivedAt:d.receivedAt,receivedInRound:d.receivedInRound,replacesId:d.replacesId,supersededBy:d.supersededBy||null,review:d.review}));
  const record=sellar({schema:'acta-reviewed-record-v1',workflow:'reconciliation',recordId:randomUUID(),caseId:id,reference:c.reference,synthetic:true,reviewRevision:c.revision,round:c.rounds.length+1,
   sourceDocumentId:policy.documentId,sourceVersion:policy.version,sourceHash:policy.sourceHash,sources:[...analysis.findings.map(f=>f.policy),policyCitation(policy,'REV-SUB-01'),policyCitation(policy,'REV-RET-01')],
   queryBindings:c.documents.filter(d=>d.review).map(d=>({documentId:d.id,runId:d.review.runId,mode:d.extraction.evidence.executionMode||"local-model",promptSha256:d.extraction.evidence.promptSha256,outputSha256:d.extraction.evidence.outputSha256})),
   analysis,documentEvidence:documents,finalText:data.finalText,finalTextHash:data.finalTextHash,requestText:preview.requestText,contact:{state:'prepared',delivery:'not-sent',text:preview.requestText},disposition,
   approvedAt:new Date().toISOString(),actor:this.automation?'automation:synthetic-e2e':'colaborador-local-no-autenticado',
   acceptanceScope:this.automation?'Automated review mechanics; no human acceptance.':'Explicit local review; identity not authenticated.'},this.key);
  c.rounds.push({round:record.round,recordId:record.recordId,approvedAt:record.approvedAt,findings:analysis.findings,disposition});
  c.lifecycle='reviewed';c.phase=analysis.ready?'supervisor-ready':'waiting-response';c.disposition=disposition;c.note=data.note||'';
  this.store.save(c,record,data.requestId,requestHash);return record;
 }
 resumePacket(sid,id,{revision,asOf}){
  const c=this.packet(sid,id);
  if(c.revision!==revision||c.lifecycle!=='reviewed'||c.phase!=='waiting-response')fail('Este expediente no está esperando una respuesta.');
  const effective=asOf===undefined?localIsoDate(new Date()):asOf;
  if(!dateOK(effective))fail('Fecha inválida.',400);
  if(effective<c.asOf)fail('La fecha de reanudación no puede ser anterior a la revisión guardada.',400);
  c.revision++;c.lifecycle='draft';c.phase='collecting-response';c.sourceReview=null;c.asOf=effective;this.context(sid).generation++;
  c.events.push({type:'review-resumed',at:new Date().toISOString(),round:c.rounds.length+1,asOf:effective});
  this.store.put(c);return this.getPacket(sid,id);
 }
 documentFile(sid,id,documentId){
  const c=this.packet(sid,id),doc=c.documents.find(d=>d.id===documentId);if(!doc)fail('Documento inexistente.',404);
  const bytes=Buffer.from(doc.originalBase64,'base64');if(sha256(bytes)!==doc.bytesHash)fail('El documento almacenado cambió.',500);return {bytes,mime:doc.mime,name:doc.name};
 }
 demoInputs(){const demo=JSON.parse(readFileSync(path.join(root,'fixtures/reconciliation/demo.json'),'utf8'));for(const group of ['initial','response'])demo[group]=demo[group].map(d=>{const name=d.name.replace(/\.txt$/,'.pdf');return {name,base64:readFileSync(path.join(root,'fixtures/reconciliation/pdf',name)).toString('base64'),...(d.replacesName?{replacesName:d.replacesName.replace(/\.txt$/,'.pdf')}:{})};});return demo;}
}