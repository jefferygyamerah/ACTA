import assert from 'node:assert/strict';
import{mkdtemp,readFile,writeFile,mkdir}from'node:fs/promises';import path from'node:path';import{execFileSync}from'node:child_process';
import{chromium}from'playwright';import{startServer}from'../src/server.js';import{verifyExport}from'../src/service.js';import{sha256,root}from'../src/runtime/assets.js';
const evidenceDir=path.resolve(process.env.ACTA_RECONCILIATION_EVIDENCE||'artifacts/evidence/reconciliation/workflow');
await mkdir(evidenceDir,{recursive:true});const directory=await mkdtemp(path.join(root,'.local/reconciliation-e2e-'));
const receipt={startedAt:new Date().toISOString(),scope:'Real Edge UI, native synthetic PDFs, local QVAC, automated review mechanics. No bank employee acceptance or productivity measurement.',directory,stages:[],readings:[],network:[],errors:[],sourceHead:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),dirty:execFileSync('git',['status','--short'],{encoding:'utf8'})};
let app,browser,context,page,videoPath;
const save=async()=>writeFile(path.join(evidenceDir,'workflow.json'),JSON.stringify(receipt,null,2));
const stage=async(name,fn)=>{const started=performance.now();try{await fn();receipt.stages.push({name,status:'passed',ms:performance.now()-started});console.log('PASS '+name);}catch(e){receipt.stages.push({name,status:'failed',error:e.stack});throw e;}finally{await save();}};
async function click(selector){await page.locator(selector).click();await page.locator('.busy').waitFor({state:'hidden',timeout:120000});}
async function snapshot(name){await page.screenshot({path:path.join(evidenceDir,name+'.png'),fullPage:true});}
const current=()=>app.service.case(receipt.caseId);
const demo=JSON.parse(await readFile('fixtures/reconciliation/demo.json','utf8'));
const annotations=[
{kind:'application',fields:{holder:2,identityNumber:3,address:4,issuedAt:5}},
{kind:'identity',fields:{holder:2,identityNumber:3,expiresAt:4}},
{kind:'address',fields:{holder:2,address:3,issuedAt:4}},
{kind:'address',fields:{holder:2,address:3,issuedAt:4}},
{kind:'income',fields:{holder:3,incomeSource:4,issuedAt:5}}
];
async function readAndReview(index){
 const input=[...demo.initial,...demo.response][index],name=input.name.replace('.txt','.pdf');
 let d=current().documents.find(d=>d.name===name);
 await click('[data-doc="'+d.id+'"]');await click('[data-action="read"]');
 d=current().documents.find(doc=>doc.name===name);
 assert.ok(d.extraction,'Real model extraction must succeed: '+name);
 const expected={kind:annotations[index].kind,facts:Object.entries(annotations[index].fields).map(([field,line])=>{
 const text=input.text.split('\n')[line-1],actual=d.lines.find(l=>l.text===text);assert.ok(actual,'Original annotated line exists in PDF: '+text);
 return{field,line:actual.id,value:text.split(': ').slice(1).join(': ')};
 })};
 const actual=d.extraction,corrections=[];
 if(actual.kind!==expected.kind)corrections.push({field:'kind',before:actual.kind,after:expected.kind});
 for(const field of ['holder','identityNumber','address','issuedAt','expiresAt','incomeSource']){
 const before=actual.facts.find(f=>f.field===field),after=expected.facts.find(f=>f.field===field);
 if((before?.value||'')!==(after?.value||'')||(before?.line||0)!==(after?.line||0))corrections.push({field,before:before?{value:before.value,line:before.line}:null,after:after||null});
 }
 receipt.readings.push({name,documentId:d.id,runId:actual.runId,modelCorrectBeforeReview:!corrections.length,modelCorrectBeforeReviewScope:'policy-filtered expected required fields, not raw perfect extraction',corrections,outOfScopeFacts:actual.outOfScopeFacts,evidence:actual.evidence,expected});
 if(corrections.length){
 await page.locator('#document-kind').selectOption(expected.kind);
 for(const field of ['holder','identityNumber','address','issuedAt','expiresAt','incomeSource']){
 const f=expected.facts.find(f=>f.field===field);
 await page.locator('[data-field="'+field+'"] .fact-line').fill(String(f?.line||0));
 await page.locator('#v-'+field).fill(f?.value||'');
 }
 }
 await page.locator('#document-confirmed').check();await click('[data-action="confirm-document"]');
 assert.ok(current().documents.find(x=>x.id===d.id).review);await save();
}
async function manualReview(index,caseId){
 const input=demo.initial[index],name=input.name.replace('.txt','.pdf');
 const bcase=()=>app.service.case(caseId);
 let d=bcase().documents.find(d=>d.name===name);
 await click('[data-doc="'+d.id+'"]');await click('[data-action="manual"]');
 d=bcase().documents.find(doc=>doc.name===name);
 assert.ok(d.extraction&&d.extraction.evidence?.executionMode==='manual','Manual reading must exist: '+name);
 const facts=Object.entries(annotations[index].fields).map(([field,line])=>{
 const text=input.text.split('\n')[line-1],actual=d.lines.find(l=>l.text===text);assert.ok(actual,'Original annotated line exists in PDF: '+text);
 return{field,line:actual.id,value:text.split(': ').slice(1).join(': ')};
 });
 await page.locator('#document-kind').selectOption(annotations[index].kind);
 for(const field of ['holder','identityNumber','address','issuedAt','expiresAt','incomeSource']){
 const f=facts.find(f=>f.field===field);
 await page.locator('[data-field="'+field+'"] .fact-line').fill(String(f?.line||0));
 await page.locator('#v-'+field).fill(f?.value||'');
 }
 await page.locator('#document-confirmed').check();await click('[data-action="confirm-document"]');
 assert.ok(bcase().documents.find(x=>x.id===d.id).review);await save();return d.id;
}
async function approveFindings(){
 await click('.steps [data-step="findings"]');
 for(const article of await page.locator('.finding').all()){
  await article.locator('summary').click();await article.locator('input[type=checkbox]').check();
 }
 await snapshot('findings-visit-'+(current().rounds.length+1));await click('[data-action="confirm-findings"]');
}
async function saveRecord(note){
 await page.locator('#note').fill(note);await click('[data-action="preview"]');
 const text=await page.locator('#final-preview').innerText();
 await page.locator('#approve').check();await click('[data-action="save"]');
 const r=app.service.store.records(receipt.caseId).at(-1);assert.equal(r.finalText,text);return r;
}
try{
 app=await startServer({port:0,directory,automation:true});receipt.base=app.base;
 browser=await chromium.launch({channel:'msedge',headless:true,slowMo:65});
 context=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:path.join(evidenceDir,'raw-video'),size:{width:1440,height:1000}}});page=await context.newPage();
 page.on('pageerror',e=>receipt.errors.push(String(e)));page.on('request',r=>receipt.network.push({method:r.method(),url:r.url()}));
 await stage('clear audience and synthetic PDF intake',async()=>{
 await page.goto(app.base);await page.locator('[data-action="demo"]').waitFor();await snapshot('opening-desktop');
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await snapshot('opening-mobile');await page.setViewportSize({width:1440,height:1000});
 await click('[data-action="demo"]');receipt.caseId=await page.evaluate(()=>localStorage.getItem('acta-packet'));
 assert.equal(current().documents.length,3);assert.ok(current().documents.every(d=>d.mime==='application/pdf'&&!d.review));await snapshot('intake');
 });
 await stage('real local extraction and explicit source review',async()=>{for(let i=0;i<3;i++)await readAndReview(i);await snapshot('reviewed-document');});
 let first,second,originalId,identityReviewHash;
 await stage('one pending request excludes already valid identity',async()=>{
 await approveFindings();first=await saveRecord('Visita 1: aclarar domicilio y aportar respaldo de ingresos. Conservar identificación revisada.');
 assert.deepEqual(first.analysis.requests,['domicilio','ingresos']);assert.doesNotMatch(first.requestText,/identificación/i);assert.equal(current().phase,'waiting-response');
 originalId=current().documents.find(d=>d.review.kind==='identity').id;identityReviewHash=sha256(JSON.stringify(current().documents.find(d=>d.id===originalId).review));
 await snapshot('first-saved');});
 await stage('same-case response, exact duplicate, explicit replacement',async()=>{
 await page.locator('#resume-date').fill(demo.responseAsOf||demo.asOf);
 await click('[data-action="resume"]');
 await page.locator('#files').setInputFiles(path.join(root,'fixtures/reconciliation/pdf/02-identificacion.pdf'));await click('[data-action="upload"]');
 assert.equal(current().documents.length,3);assert.match(await page.locator('.error-message').innerText(),/idéntico/);
 const oldAddress=current().documents.find(d=>d.review.kind==='address').id;
 await page.locator('#files').setInputFiles(path.join(root,'fixtures/reconciliation/pdf/04-domicilio-corregido.pdf'));
 await page.locator('#replace').selectOption(oldAddress);await click('[data-action="upload"]');
 await page.locator('#files').setInputFiles(path.join(root,'fixtures/reconciliation/pdf/05-carta-laboral.pdf'));await click('[data-action="upload"]');
 assert.equal(current().documents.length,5);assert.ok(current().documents.find(d=>d.id===oldAddress).supersededBy);assert.equal(current().id,receipt.caseId);
 await readAndReview(3);await readAndReview(4);
 assert.equal(sha256(JSON.stringify(current().documents.find(d=>d.id===originalId).review)),identityReviewHash);
 });
 await stage('resolved changes and supervisor-ready reviewed record',async()=>{
 await approveFindings();
 await stage('unsaved note isolation across cases',async()=>{
 await page.locator('#note').waitFor();
 const savedNote='Visita 1: aclarar domicilio y aportar respaldo de ingresos. Conservar identificación revisada.';
 assert.equal(await page.locator('#note').inputValue(),savedNote);
 const draft='Borrador sin guardar de la visita 2. No debe cruzar de expediente.';
 await page.locator('#note').fill(draft);await click('[data-action="preview"]');await click('[data-action="edit-note"]');
 assert.equal(await page.locator('#note').inputValue(),draft);
 await page.locator('#note').fill('');await click('[data-action="preview"]');await click('[data-action="edit-note"]');
 assert.equal(await page.locator('#note').inputValue(),'');
 await page.locator('#note').fill(draft);await click('[data-action="preview"]');await click('[data-action="edit-note"]');
 assert.equal(await page.locator('#note').inputValue(),draft);
 await click('[data-action="home"]');await click('[data-action="demo"]');
 const bid=await page.evaluate(()=>localStorage.getItem('acta-packet'));
 assert.ok(bid&&bid!==receipt.caseId,'Case B must be a separate case');
 const bcase=()=>app.service.case(bid);
 assert.equal(bcase().documents.length,3);
 const manualIds=[];for(let i=0;i<3;i++)manualIds.push(await manualReview(i,bid));
 await click('.steps [data-step="findings"]');
 const articles=await page.locator('.finding').all();
 assert.equal(articles.length,4,'Case B must show 4 findings after its 3 documents are reviewed');
 for(const article of articles){await article.locator('summary').click();await article.locator('input[type=checkbox]').check();}
 await click('[data-action="confirm-findings"]');
 await page.locator('#note').waitFor();
 assert.equal(await page.locator('#note').inputValue(),'');
 await snapshot('note-isolation-case-b');
 await click('[data-case="'+receipt.caseId+'"]');
 await page.locator('.steps [data-step="record"]').click();await page.locator('#note').waitFor();
 assert.equal(await page.locator('#note').inputValue(),savedNote);
 await snapshot('note-isolation');
 receipt.noteIsolation={caseB:bid,caseBSetup:'Manual synthetic setup: 3 initial PDFs read and confirmed through manual UI readings, 4 findings confirmed through UI checkboxes. Case B was not saved and is excluded from model accuracy metrics.',caseBDocuments:manualIds,draftDidNotCrossCases:true,clearedNoteStayedEmpty:true,persistedNoteRestored:true};
 await save();
 });
 second=await saveRecord('Visita 2: comprobante corregido y carta laboral revisados. Continúa el supervisor.');
 assert.equal(second.analysis.ready,true);assert.deepEqual(second.analysis.delta.filter(d=>d.resolved).map(d=>d.id),['domicilio','ingresos']);
 assert.equal(current().phase,'supervisor-ready');assert.equal(current().rounds.length,2);await snapshot('second-saved');
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await snapshot('saved-mobile');await page.setViewportSize({width:1440,height:1000});
 });
 await stage('browser reload, signed export and tamper rejection',async()=>{
 await page.reload();await page.locator('[data-action="export"]').waitFor();assert.match(await page.locator('.records-text').first().innerText(),/Visita 2/);
 const dl=page.waitForEvent('download');await click('[data-action="export"]');const download=await dl;await download.saveAs(path.join(evidenceDir,'reviewed-export.json'));
 const r=JSON.parse(await readFile(path.join(evidenceDir,'reviewed-export.json'),'utf8'));assert.deepEqual(r,second);assert.equal(verifyExport(r,app.service.key.publica).valid,true);
 const bad=structuredClone(r);bad.finalText+='CORRUPTED';assert.equal(verifyExport(bad,app.service.key.publica).valid,false);
 await writeFile(path.join(evidenceDir,'trusted-public-key.txt'),app.service.key.publica+'\n');
 receipt.export={valid:true,tamperedRejected:true,recordId:r.recordId,finalTextHash:r.finalTextHash};await click('[data-action="verify"]');
 });
 await stage('service restart and independent process preserve both records and original bytes',async()=>{
 const expectedDocument=await readFile(path.join(root,'fixtures/reconciliation/pdf/02-identificacion.pdf'));
 assert.deepEqual(app.service.documentFile(app.service.sessionForUnused||[...app.service.sessions.keys()].at(-1),receipt.caseId,originalId).bytes,expectedDocument);
 const port=new URL(app.base).port;await app.close();app=null;
 app=await startServer({port:Number(port),directory,automation:true});await page.reload();await page.locator('[data-action="export"]').waitFor();
 assert.deepEqual(app.service.store.records(receipt.caseId),[first,second]);
 const child=execFileSync(process.execPath,['--input-type=module','-e','import{DatabaseSync}from"node:sqlite";const db=new DatabaseSync(process.argv[1]);console.log(JSON.stringify(db.prepare("SELECT body FROM records ORDER BY rowid").all().map(r=>JSON.parse(r.body))));db.close();',path.join(directory,'acta.sqlite')],{encoding:'utf8'});assert.deepEqual(JSON.parse(child),[first,second]);
 receipt.persistence={recordCount:2,originalIdentityBytesPreserved:true,separateProcessExactRecords:true};await snapshot('restarted');
 });
 await stage('unreadable scan fails without creating a document',async()=>{
 await click('[data-action="home"]');await click('[data-action="blank"]');
 const scratch=await page.evaluate(()=>localStorage.getItem('acta-packet'));
 await page.locator('#files').setInputFiles(path.join(root,'fixtures/reconciliation/pdf/06-escaneo-sin-texto.pdf'));await click('[data-action="upload"]');
 assert.match(await page.locator('.error-message').innerText(),/no contiene texto legible/i);assert.equal(app.service.case(scratch).documents.length,0);
 await snapshot('scan-rejected');await click('[data-case="'+receipt.caseId+'"]');
 });
 receipt.model={documents:receipt.readings.length,correctBeforeReview:receipt.readings.filter(r=>r.modelCorrectBeforeReview).length,correctBeforeReviewScope:'modelCorrectBeforeReview refers to policy-filtered expected required fields, not raw perfect extraction',reviewCorrections:receipt.readings.reduce((n,r)=>n+r.corrections.length,0),rawOutOfScopeProposals:receipt.readings.reduce((n,r)=>n+r.outOfScopeFacts.length,0)};
 assert.equal(receipt.errors.length,0);receipt.externalBrowserRequests=receipt.network.filter(r=>!r.url.startsWith(receipt.base+'/'));assert.deepEqual(receipt.externalBrowserRequests,[]);
 receipt.networkScope='Browser request log only. This is not OS-enforced isolation or evidence about all native processes.';
 receipt.status='passed';receipt.endedAt=new Date().toISOString();
}catch(e){receipt.status='failed';receipt.error=e.stack;console.error(e);if(page)await snapshot('failure').catch(()=>{});process.exitCode=1;}
finally{
 if(page)videoPath=await page.video()?.path();if(context)await context.close();if(browser)await browser.close();if(app)await app.close();
 if(videoPath)receipt.videoPath=videoPath;
 const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','src','public','scripts','fixtures','package.json','package-lock.json'],{encoding:'utf8'}).trim().split(/\r?\n/);
 receipt.sourceFiles=[];for(const f of files)receipt.sourceFiles.push({path:f,sha256:sha256(await readFile(f))});
 await save();console.log(JSON.stringify({status:receipt.status,stages:receipt.stages.length,model:receipt.model,directory,evidenceDir}));
}
