import test from 'node:test';
import assert from 'node:assert/strict';
import{mkdtempSync,readFileSync,writeFileSync}from'node:fs';
import path from'node:path';import{randomUUID}from'node:crypto';
import{ReconciliationService}from'../src/reconciliation/service.js';
import{verifyExport}from'../src/service.js';
import{factFields}from'../src/reconciliation/documents.js';
import{reconcile,reviewPolicy}from'../src/reconciliation/policy.js';
import{root,sha256}from'../src/runtime/assets.js';
const demo=JSON.parse(readFileSync(path.join(root,'fixtures/reconciliation/demo.json'),'utf8'));
demo.asOf=demo.asOf||'2026-09-10';
const expected=[
{kind:'application',fields:{holder:2,identityNumber:3,address:4,issuedAt:5}},
{kind:'identity',fields:{holder:2,identityNumber:3,expiresAt:4}},
{kind:'address',fields:{holder:2,address:3,issuedAt:4}},
{kind:'address',fields:{holder:2,address:3,issuedAt:4}},
{kind:'income',fields:{holder:3,incomeSource:4,issuedAt:5}}
];
const inputs=[...demo.initial,...demo.response];
const buildModelOutput=(record)=>({kind:record.kind,...Object.fromEntries(factFields.map(field=>{const f=record.facts.find(item=>item.field===field);return [field,f?{line:f.line,value:f.value}:null];}))});
const outputs=inputs.map((input,i)=>({kind:expected[i].kind,facts:Object.entries(expected[i].fields).map(([field,line])=>({field,line,value:input.text.split('\n')[line-1].split(': ').slice(1).join(': ')}))}));
function fixture(){
 const directory=mkdtempSync(path.join(root,'.local/reconcile-test-')),reviewPolicyPath=path.join(directory,'policy.md');
 writeFileSync(reviewPolicyPath,readFileSync(path.join(root,'fixtures/reconciliation/policy.md')));
 const runtime={infer:async request=>{
  const text=JSON.parse(request.history[1].content.replace(/\n\/no_think$/,'')).document.map(l=>l.text).join('\n');
  const index=inputs.findIndex(d=>d.text===text);assert.ok(index>=0,'labelled fixture runtime received known document');
  const outputText=JSON.stringify(buildModelOutput(outputs[index]));return{runId:randomUUID(),outputText,promptSha256:sha256(JSON.stringify(request)),outputSha256:sha256(outputText),mode:'labelled-test-double'};
 }};
 const service=new ReconciliationService({directory,runtime,reviewPolicyPath,automation:true}),sid=service.session(),c=service.createPacket(sid,demo);
 return{service,sid,c,directory,reviewPolicyPath,runtime};
}
async function ingest(f,documents){
 f.c=await f.service.addDocuments(f.sid,f.c.id,{revision:f.c.revision,documents});
 for(const id of f.c.intake.added){
  f.c=await f.service.readDocument(f.sid,f.c.id,{revision:f.c.revision,documentId:id});const d=f.c.documents.find(d=>d.id===id);
  f.c=f.service.reviewDocument(f.sid,f.c.id,{revision:f.c.revision,documentId:id,textHash:d.textHash,runId:d.extraction.runId,...d.extraction,confirmed:true});
 }
 return f.c;
}
function preview(f){
 const a=f.c.analysis;f.c=f.service.confirmFindings(f.sid,f.c.id,{revision:f.c.revision,analysisHash:a.analysisHash,sourceHash:a.sourceHash,reviewedIds:a.findings.map(f=>f.id)});
 return f.service.previewPacket(f.sid,f.c.id,{revision:f.c.revision,note:'Verificación sintética.\nSin envío.'});
}
function save(f,p=preview(f)){
 const data={...p,approved:true,requestId:randomUUID()};
 const r=f.service.savePacket(f.sid,f.c.id,data);f.c=f.service.getPacket(f.sid,f.c.id);return{record:r,data};
}
const policyFixture=()=>reviewPolicy(path.join(root,'fixtures/reconciliation/policy.md'));
const reviewedDoc=(id,name,kind,facts)=>({id,name,review:{kind,facts:Object.entries(facts).map(([field,value])=>({field,value}))}});
function evaluateReconciliation(documents,asOf='2026-09-10'){return reconcile({asOf,documents,rounds:[]},policyFixture());}

test('two visits preserve valid ID, resolve exactly two gaps, and retain signed history across restart',async()=>{
 const f=fixture();try{
 await ingest(f,demo.initial);
 assert.deepEqual(f.c.analysis.requests,['domicilio','ingresos']);assert.deepEqual(f.c.analysis.internalReview,[]);
 const p=preview(f);assert.match(p.requestText,/Domicilio/);assert.match(p.requestText,/Respaldo de ingresos/);assert.doesNotMatch(p.requestText,/identificación/i);
 const first=save(f,p);assert.equal(f.c.phase,'waiting-response');assert.equal(f.service.savePacket(f.sid,f.c.id,first.data).recordId,first.record.recordId);
 assert.throws(()=>f.service.savePacket(f.sid,f.c.id,{...first.data,finalText:'forged'}));
 const firstId=f.c.documents.find(d=>d.review.kind==='identity').id;
 f.c=f.service.resumePacket(f.sid,f.c.id,{revision:f.c.revision,asOf:f.c.asOf});
 const oldAddress=f.c.documents.find(d=>d.review.kind==='address').id;
 await ingest(f,demo.response.map(d=>({...d,replacesId:d.replacesName?f.c.documents.find(x=>x.name===d.replacesName&&!x.supersededBy)?.id:undefined})));
 assert.equal(f.c.analysis.ready,true);
 assert.deepEqual(f.c.analysis.delta.filter(d=>d.resolved).map(d=>d.id),['domicilio','ingresos']);
 assert.equal(f.c.documents.find(d=>d.id===firstId).receivedInRound,1);
 const second=save(f);assert.equal(f.c.phase,'supervisor-ready');assert.equal(f.c.records.length,2);
 const savedAnalysis=second.record.analysis;
 assert.deepEqual(f.service.getPacket(f.sid,f.c.id).analysis,savedAnalysis);
 assert.deepEqual(savedAnalysis.delta.filter(d=>d.resolved).map(d=>d.id),['domicilio','ingresos']);
 assert.throws(()=>f.service.resumePacket(f.sid,f.c.id,{revision:f.c.revision}));
 assert.equal(verifyExport(second.record,f.service.key.publica).valid,true);
 const altered=structuredClone(second.record);altered.documentEvidence[0].name+='forged';assert.equal(verifyExport(altered,f.service.key.publica).valid,false);
 const expectedBytes=f.service.documentFile(f.sid,f.c.id,firstId).bytes;
 f.service.close();f.service=new ReconciliationService({directory:f.directory,runtime:f.runtime,reviewPolicyPath:f.reviewPolicyPath,automation:true});f.sid=f.service.session();f.service.select(f.sid,f.c.id);
 const reload=f.service.getPacket(f.sid,f.c.id);assert.deepEqual(reload.records,[first.record,second.record]);
 assert.deepEqual(f.service.documentFile(f.sid,f.c.id,firstId).bytes,expectedBytes);
 assert.deepEqual(reload.analysis,savedAnalysis);
 writeFileSync(f.reviewPolicyPath,readFileSync(f.reviewPolicyPath,'utf8')+'\nCambio posterior de guía.');
 const current=f.service.getPacket(f.sid,f.c.id);
 assert.deepEqual(current.analysis,savedAnalysis);
 assert.deepEqual(current.analysis.delta.filter(d=>d.resolved).map(d=>d.id),['domicilio','ingresos']);
 }finally{f.service.close();}
});

test('unreviewed documents and omitted facts require internal review, never automatic customer requests',async()=>{
 const f=fixture();try{
 f.c=await f.service.addDocuments(f.sid,f.c.id,{revision:f.c.revision,documents:demo.initial});
 assert.equal(f.c.analysis.unreviewedDocuments.length,3);assert.deepEqual(f.c.analysis.requests,[]);
 assert.throws(()=>preview(f));
 assert.throws(()=>f.service.confirmFindings(f.sid,f.c.id,{revision:f.c.revision,analysisHash:f.c.analysis.analysisHash,sourceHash:f.c.analysis.sourceHash,reviewedIds:f.c.analysis.findings.map(f=>f.id)}));
 const d=f.c.documents[0];
 assert.throws(()=>f.service.reviewDocument(f.sid,f.c.id,{revision:f.c.revision,documentId:d.id,textHash:d.textHash,kind:'application',facts:[],confirmed:true}));
 f.c=await f.service.readDocument(f.sid,f.c.id,{revision:f.c.revision,documentId:d.id});const proposal=f.c.documents[0];
 assert.throws(()=>f.service.reviewDocument(f.sid,f.c.id,{revision:f.c.revision,documentId:d.id,textHash:d.textHash,runId:proposal.extraction.runId,kind:'application',facts:[{field:'holder',line:2,value:'Invented name'}],confirmed:true}));
 }finally{f.service.close();}
});

test('duplicates do not replace good documents or create extra requests; replacement requires case ownership',async()=>{
 const f=fixture();try{await ingest(f,demo.initial);const revision=f.c.revision;
 const duplicate=await f.service.addDocuments(f.sid,f.c.id,{revision,documents:[demo.initial[1]]});
 assert.equal(duplicate.revision,revision);assert.equal(duplicate.documents.length,3);assert.equal(duplicate.intake.duplicates.length,1);
 await assert.rejects(f.service.addDocuments(f.sid,f.c.id,{revision,documents:[{...demo.response[0],replacesId:randomUUID()}]}));
 assert.equal(f.service.getPacket(f.sid,f.c.id).documents.length,3);
 }finally{f.service.close();}
});

test('source changes, stale revisions and altered exact text invalidate approval',async()=>{
 for(const mutation of ['policy','revision','text']){
 const f=fixture();try{await ingest(f,demo.initial);const p=preview(f);
 if(mutation==='policy')writeFileSync(f.reviewPolicyPath,readFileSync(f.reviewPolicyPath,'utf8')+'\nCambio de guía.');
 if(mutation==='revision')await f.service.addDocuments(f.sid,f.c.id,{revision:f.c.revision,documents:[demo.response[1]]});
 if(mutation==='text'){p.finalText+='\nAñadido';p.finalTextHash=sha256(p.finalText);}
 assert.throws(()=>f.service.savePacket(f.sid,f.c.id,{...p,approved:true,requestId:randomUUID()}));
 assert.equal(f.service.store.records(f.c.id).length,0);
 }finally{f.service.close();}
 }
});

test('late extraction is discarded after switching case, cancelling, or changing the policy',async()=>{
 for(const mutation of ['switch','cancel','policy']){
 const f=fixture();let resolve;try{
 f.c=await f.service.addDocuments(f.sid,f.c.id,{revision:f.c.revision,documents:[demo.initial[0]]});
 f.runtime.infer=()=>new Promise(r=>resolve=r);
 const pending=f.service.readDocument(f.sid,f.c.id,{revision:f.c.revision,documentId:f.c.documents[0].id});
 if(mutation==='switch')f.service.createPacket(f.sid,demo);
 if(mutation==='cancel')f.service.cancel(f.sid);
 if(mutation==='policy')writeFileSync(f.reviewPolicyPath,readFileSync(f.reviewPolicyPath,'utf8')+'\nCambio.');
 resolve({runId:'late-test-double',outputText:JSON.stringify(buildModelOutput(outputs[0]))});await assert.rejects(pending);
 assert.equal(f.service.case(f.c.id).documents[0].extraction,null);
 }finally{f.service.close();}
 }
});

test('manual review remains available after inference failure and stays explicitly tagged',async()=>{
 const f=fixture();try{
 f.runtime.infer=()=>{throw new Error('Modelo local no disponible para esta corrida');};
 f.c=await f.service.addDocuments(f.sid,f.c.id,{revision:f.c.revision,documents:[demo.initial[0]]});
 const docId=f.c.intake.added[0];
 await assert.rejects(()=>f.service.readDocument(f.sid,f.c.id,{revision:f.c.revision,documentId:docId}));
 f.c=await f.service.manualDocument(f.sid,f.c.id,{revision:f.c.revision,documentId:docId});
 const d=f.c.documents.find(x=>x.id===docId);
 f.c=await f.service.reviewDocument(f.sid,f.c.id,{revision:f.c.revision,documentId:d.id,textHash:d.textHash,runId:d.extraction.runId,kind:'application',facts:[
 {field:'holder',line:2,value:'Lucía Torres'},
 {field:'identityNumber',line:3,value:'FICTICIO-CED-A203'},
 {field:'address',line:4,value:'Calle Los Robles 14, Panamá'},
 {field:'issuedAt',line:5,value:'2026-09-10'}
 ],confirmed:true});
 assert.equal(d.id===f.c.documents.find(x=>x.id===d.id).id,true);
 assert.equal(f.c.documents.find(x=>x.id===d.id).extraction.evidence.executionMode,'manual');
 }finally{f.service.close();}
});

const localToday=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const demoApp=()=>reviewedDoc('app','01-solicitud','application',{holder:'Lucía Torres',identityNumber:'FICTICIO-CED-A203',address:'Calle Los Robles 14, Panamá',issuedAt:'2026-09-10'});
const fullSet=(idDate,addrDate,incDate)=>[
 demoApp(),
 reviewedDoc('id','02-identificacion','identity',{holder:'Lucía Torres',identityNumber:'FICTICIO-CED-A203',expiresAt:idDate}),
 reviewedDoc('address','03-comprobante-domicilio','address',{holder:'Lucía Torres',address:'Calle Los Robles 14, Panamá',issuedAt:addrDate}),
 reviewedDoc('income','05-carta-laboral','income',{holder:'Lucía Torres',incomeSource:'Salario en Taller Ejemplo, S.A.',issuedAt:incDate})
];

test('satisfied findings carry meaningful positive Spanish reasons',()=>{
 const r=evaluateReconciliation(fullSet('20 de abril de 2028','9 de septiembre de 2026','9 de septiembre de 2026'));
 for(const id of ['perfil','identidad','domicilio','ingresos']){
  const f=r.findings.find(x=>x.id===id);
  assert.equal(f.status,'satisfied');
  assert.ok(f.reason.trim().length>20,'razón positiva para '+id);
  assert.match(f.reason,/coincide|revisados|vigente/);
 }
});

test('policy reads Spanish month dates with accents and setiembre, and rejects impossible days',()=>{
 const ok=evaluateReconciliation(fullSet('20 de Abril de 2028','9 DE SETIEMBRE DE 2026','09 de septiembre de 2026'));
 for(const id of ['identidad','domicilio','ingresos'])assert.equal(ok.findings.find(x=>x.id===id).status,'satisfied');
 for(const bad of ['31 de febrero de 2026','31 de abril de 2026','9 de inventado']){
  const r=evaluateReconciliation([demoApp(),reviewedDoc('id','02-identificacion','identity',{holder:'Lucía Torres',identityNumber:'FICTICIO-CED-A203',expiresAt:bad})]);
  const f=r.findings.find(x=>x.id==='identidad');
  assert.equal(f.status,'review');assert.match(f.reason,/no puede interpretarse/);
 }
});

test('advancing the date expires the old identity while the saved analysis stays unchanged',async()=>{
 const f=fixture();try{
  await ingest(f,demo.initial);
  const p=preview(f);const first=save(f,p);
  const savedAnalysis=first.record.analysis;
  assert.equal(savedAnalysis.findings.find(x=>x.id==='identidad').status,'satisfied');
  f.c=f.service.resumePacket(f.sid,f.c.id,{revision:f.c.revision,asOf:'2031-06-01'});
  const now=f.c.analysis.findings.find(x=>x.id==='identidad');
  assert.equal(now.status,'conflict');assert.match(now.reason,/vencid/);
  const after=f.service.getPacket(f.sid,f.c.id);
  assert.equal(after.records[0].recordId,first.record.recordId);
  assert.deepEqual(after.records[0].analysis,savedAnalysis);
 }finally{f.service.close();}
});

test('saved analysis snapshot survives get, restart, and current policy edits',async()=>{
 const f=fixture();try{
  await ingest(f,demo.initial);const first=save(f);
  const saved=first.record.analysis;
  let got=f.service.getPacket(f.sid,f.c.id);
  assert.deepEqual(got.analysis,saved);assert.ok(Array.isArray(got.analysis.delta));
  f.service.close();
  f.service=new ReconciliationService({directory:f.directory,runtime:f.runtime,reviewPolicyPath:f.reviewPolicyPath,automation:true});
  f.sid=f.service.session();f.service.select(f.sid,f.c.id);
  got=f.service.getPacket(f.sid,f.c.id);
  assert.deepEqual(got.analysis,saved);
  writeFileSync(f.reviewPolicyPath,readFileSync(f.reviewPolicyPath,'utf8')+'\nCambio posterior de guía.');
  got=f.service.getPacket(f.sid,f.c.id);
  assert.deepEqual(got.analysis,saved);
  assert.equal(got.analysis.findings.find(x=>x.id==='identidad').status,'satisfied');
 }finally{f.service.close();}
});

test('resume defaults to the local calendar date and rejects dates before the saved review',async()=>{
 const RealDate=Date;
 class MockDate extends RealDate{constructor(...args){args.length?super(...args):super('2026-09-10T12:00:00');}}
 const f=fixture();globalThis.Date=MockDate;
 try{
  const fresh=f.service.createPacket(f.sid,{});
  assert.equal(fresh.asOf,'2026-09-10');
  f.c=fresh;
  await ingest(f,demo.initial);const first=save(f);
  assert.equal(f.c.asOf,'2026-09-10');
  assert.throws(()=>f.service.resumePacket(f.sid,f.c.id,{revision:f.c.revision,asOf:'2000-01-01'}));
  f.c=f.service.resumePacket(f.sid,f.c.id,{revision:f.c.revision});
  assert.equal(f.c.asOf,'2026-09-10');
  const ev=f.c.events.find(e=>e.type==='review-resumed');
  assert.equal(ev.asOf,'2026-09-10');
 }finally{globalThis.Date=RealDate;f.service.close();}
});

test('policy keeps concurrent conflict reasons for a single requirement',()=>{
 const result=evaluateReconciliation([
 reviewedDoc('app','01-solicitud','application',{holder:'Lucía Torres',identityNumber:'FICTICIO-CED-A203',address:'Calle Los Robles 14, Panamá',issuedAt:'2026-09-10'}),
 reviewedDoc('id','02-identificacion','identity',{holder:'Ana Torres',identityNumber:'FICTICIO-OTRA-001',expiresAt:'2024-01-01'}),
 reviewedDoc('address','03-comprobante-domicilio','address',{holder:'Lucía Torres',address:'Calle Los Robles 14, Panamá',issuedAt:'2026-09-10'}),
 reviewedDoc('income','05-carta-laboral','income',{holder:'Lucía Torres',incomeSource:'Salario en Taller Ejemplo, S.A.',issuedAt:'2026-09-09'})
 ]);
 const finding=result.findings.find(item=>item.id==='identidad');
 assert.equal(finding.status,'conflict');
 assert.match(finding.reason,/titular/);
 assert.match(finding.reason,/identificador/);
 assert.match(finding.reason,/vencid/);
});

test('future and unparseable dates stay in internal review',()=>{
 const base=[
 reviewedDoc('app','01-solicitud','application',{holder:'Lucía Torres',identityNumber:'FICTICIO-CED-A203',address:'Calle Los Robles 14, Panamá',issuedAt:'2026-09-10'}),
 reviewedDoc('id','02-identificacion','identity',{holder:'Lucía Torres',identityNumber:'FICTICIO-CED-A203',expiresAt:'2028-04-20'}),
 reviewedDoc('income','05-carta-laboral','income',{holder:'Lucía Torres',incomeSource:'Salario en Taller Ejemplo, S.A.',issuedAt:'2026-09-09'})
 ];
 const withFuture=evaluateReconciliation([...base,reviewedDoc('address','03-comprobante-domicilio','address',{holder:'Lucía Torres',address:'Calle Los Robles 14, Panamá',issuedAt:'2026-09-20'})]);
 const future=withFuture.findings.find(item=>item.id==='domicilio');assert.equal(future.status,'review');assert.match(future.reason,/fecha futura/);
 const withBadDate=evaluateReconciliation([...base,reviewedDoc('address','03-comprobante-domicilio','address',{holder:'Lucía Torres',address:'Calle Los Robles 14, Panamá',issuedAt:'fecha extraña'})]);
 const bad=withBadDate.findings.find(item=>item.id==='domicilio');assert.equal(bad.status,'review');assert.match(bad.reason,/no puede interpretarse/);
});

test('policy accepts alternative income evidence wording when required fields are present',()=>{
 for(const source of ['Salario en Taller Ejemplo, S.A.','Declaración de origen de fondos: freelance']){
 const result=evaluateReconciliation([
 reviewedDoc('app','01-solicitud','application',{holder:'Lucía Torres',identityNumber:'FICTICIO-CED-A203',address:'Calle Los Robles 14, Panamá',issuedAt:'2026-09-10'}),
 reviewedDoc('id','02-identificacion','identity',{holder:'Lucía Torres',identityNumber:'FICTICIO-CED-A203',expiresAt:'2028-04-20'}),
 reviewedDoc('address','03-comprobante-domicilio','address',{holder:'Lucía Torres',address:'Calle Los Robles 14, Panamá',issuedAt:'2026-09-09'}),
 reviewedDoc('income',`05-carta-laboral-${source}`,'income',{holder:'Lucía Torres',incomeSource:source,issuedAt:'2026-09-09'})
 ]);
 assert.equal(result.findings.find(item=>item.id==='ingresos').status,'satisfied');
 assert.equal(result.findings.find(item=>item.id==='ingresos').action,'Conservar el documento; no volver a solicitarlo.');
 }
});
