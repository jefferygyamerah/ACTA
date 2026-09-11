import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { CaseService, verifyExport, missingItems } from '../src/service.js';
import { sourceSnapshot, resolveSelection } from '../src/sucursal/procedimiento.js';
import { sha256, root } from '../src/runtime/assets.js';
import { randomUUID } from 'node:crypto';
const fixture = () => {
  const directory=mkdtempSync(path.join(root,'.local/test-'));
  const guidePath=path.join(directory,'guide.md');writeFileSync(guidePath,readFileSync(path.join(root,'fixtures/sucursal/guia-bpl.md')));
  const runtime={infer:async request=>{if(request.responseFormat.json_schema.name==='source_relevance')return {runId:randomUUID(),outputText:'{"supported":true}',completionWallMs:1};const question=JSON.parse(request.history[1].content.replace(/\n\/no_think$/,'')).pregunta;return{runId:randomUUID(),outputText:JSON.stringify({codigo:question.includes('falta')?'EX-DOC-01':question.includes('documentos')?'DOC-NAT-01':null}),promptSha256:sha256(JSON.stringify(request)),outputSha256:sha256(question),mode:'labelled-test-double'};}};
  const service=new CaseService({directory,runtime,guidePath,automation:true});const sid=service.session();let c=service.create(sid);c=service.edit(sid,c.id,{revision:c.revision,facts:c.facts,note:'Nota humana sintética.',missingDocument:missingItems[0]});
  return {service,sid,c,guidePath,directory,runtime};
};
async function ready(f) {for(const question of ['documentos','falta documento'])await f.service.query(f.sid,f.c.id,{revision:f.c.revision,question});f.c=f.service.get(f.sid,f.c.id);f.service.reviewSource(f.sid,f.c.id,{revision:f.c.revision,sourceHash:f.service.source().sourceHash,queryIds:f.c.queries.map(q=>q.queryId)});return f.service.preview(f.sid,f.c.id,{revision:f.c.revision});}
function payload(preview) {return {...preview,approved:true,requestId:randomUUID(),disposition:'Pendiente de documentación'};}
test('canonical source spans are exact; forged or malformed selections fail closed',()=>{const s=sourceSnapshot();for(const section of s.sections)assert.equal(s.text.slice(section.start,section.end),section.text);assert.throws(()=>resolveSelection(s,{outputText:'{"codigo":"INVENTED"}'}));assert.throws(()=>resolveSelection(s,{outputText:'{"codigo":"DOC-NAT-01","text":"invented"}'}));assert.equal(resolveSelection(s,{outputText:'{"codigo":null}'}).covered,false);});
test('exact reviewed bytes persist across database restart; retry is idempotent; export rejects altered bytes and untrusted key',async()=>{
 const f=fixture();try{const p=await ready(f);const data=payload(p);data.finalText+='\n  Espacios preservados.\n';data.finalTextHash=sha256(data.finalText);
 assert.throws(()=>f.service.save(f.sid,f.c.id,{...data,approved:false}));
 const saved=f.service.save(f.sid,f.c.id,data);assert.equal(f.service.save(f.sid,f.c.id,data).recordId,saved.recordId);assert.equal(f.service.store.records(f.c.id).length,1);
 assert.throws(()=>f.service.save(f.sid,f.c.id,{...data,finalText:'changed'}));assert.throws(()=>f.service.edit(f.sid,f.c.id,{revision:f.c.revision,facts:'changed',note:'',missingDocument:''}));
 assert.equal(verifyExport(saved,f.service.key.publica).valid,true);const altered=structuredClone(saved);altered.finalText+='X';assert.equal(verifyExport(altered,f.service.key.publica).valid,false);assert.equal(verifyExport(saved,'00'.repeat(32)).valid,false);
 f.service.close();f.service=new CaseService({directory:f.directory,runtime:f.runtime,guidePath:f.guidePath,automation:true});const sid=f.service.session();const reloaded=f.service.select(sid,f.c.id);assert.equal(reloaded.records[0].finalText,data.finalText);assert.equal(reloaded.disposition,'Pendiente de documentación');assert.equal(verifyExport(reloaded.records[0],f.service.key.publica).valid,true);
 }finally{f.service.close();}
});
test('fact edit and source mutation invalidate previous approval',async()=>{const f=fixture();try{const p=await ready(f);f.service.edit(f.sid,f.c.id,{revision:f.c.revision,facts:'Hechos nuevos sintéticos.',note:'',missingDocument:missingItems[0]});assert.throws(()=>f.service.save(f.sid,f.c.id,payload(p)));const now=f.service.get(f.sid,f.c.id);assert.equal(now.sourceReview,null);assert.equal(now.contact,null);}finally{f.service.close();}
 const g=fixture();try{const p=await ready(g);writeFileSync(g.guidePath,readFileSync(g.guidePath,'utf8')+'\nFuente actualizada.');assert.throws(()=>g.service.save(g.sid,g.c.id,payload(p)));}finally{g.service.close();}});
test('late results are rejected after case switch, cancellation, fact edit, or source update',async()=>{
 for(const change of ['switch','cancel','edit','source']){
 const f=fixture();let resolve;f.runtime.infer=()=>new Promise(r=>resolve=r);
 try{const pending=f.service.query(f.sid,f.c.id,{revision:f.c.revision,question:'documentos'});
 if(change==='switch')f.service.create(f.sid,{title:'Otro caso',facts:'Otro caso sintético.'});
 if(change==='cancel')f.service.cancel(f.sid);
 if(change==='edit')f.service.edit(f.sid,f.c.id,{revision:f.c.revision,facts:'Cambio',note:'',missingDocument:missingItems[0]});
 if(change==='source')writeFileSync(f.guidePath,readFileSync(f.guidePath,'utf8')+'\nCambio de fuente.');
 resolve({runId:'late-test-double',outputText:'{"codigo":null}'});await assert.rejects(pending);assert.equal(f.service.case(f.c.id).queries.length,0);
 }finally{f.service.close();}
 }});
test('case-bound source confirmation, contact constraints and history isolation',async()=>{const f=fixture();try{
 assert.throws(()=>f.service.contact(f.sid,f.c.id,{revision:f.c.revision,route:'anything',confirmedRoute:true,confirmedDocument:true}));
 await ready(f);assert.throws(()=>f.service.reviewSource(f.sid,f.c.id,{revision:f.c.revision,sourceHash:f.service.source().sourceHash,queryIds:['forged']}));
 assert.throws(()=>f.service.contact(f.sid,f.c.id,{revision:f.c.revision,route:'En la sucursal (ruta de demostración)',confirmedRoute:false,confirmedDocument:true}));
 const next=f.service.contact(f.sid,f.c.id,{revision:f.c.revision,route:'En la sucursal (ruta de demostración)',confirmedRoute:true,confirmedDocument:true});assert.equal(next.contact.delivery,'not-sent');assert.equal(next.contact.text.includes('Nota humana'),false);
 const another=f.service.create(f.sid,{title:'Segundo caso',facts:'Datos sintéticos separados.'});assert.deepEqual(another.queries,[]);assert.deepEqual(another.records,[]);assert.throws(()=>f.service.get(f.sid,f.c.id));
 }finally{f.service.close();}});

test('modified durable record is rejected before display as reviewed history',async()=>{const f=fixture();try{const p=await ready(f);const saved=f.service.save(f.sid,f.c.id,payload(p));const corrupt={...saved,finalText:saved.finalText+'X'};f.service.store.db.prepare('UPDATE records SET body=? WHERE id=?').run(JSON.stringify(corrupt),saved.recordId);assert.throws(()=>f.service.get(f.sid,f.c.id),/integridad/);}finally{f.service.close();}});
