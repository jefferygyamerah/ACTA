import { chromium } from 'playwright';
import { mkdir, writeFile, copyFile, readFile } from 'node:fs/promises';
import { mkdtempSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { startServer } from '../src/server.js';
import { sha256, root } from '../src/runtime/assets.js';
import { verifyExport } from '../src/service.js';
const out=path.join(root,'artifacts/evidence/acta');await mkdir(out,{recursive:true});
const directory=mkdtempSync(path.join(root,'.local/e2e-'));
let app=await startServer({port:0,directory,automation:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1600,height:1000},recordVideo:{dir:path.join(directory,'video'),size:{width:1600,height:1000}},acceptDownloads:true});
const page=await context.newPage();page.setDefaultTimeout(30000);
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
const observations=[];const start=Date.now();
let sessionId;
page.on('response',async r=>{if(r.url().endsWith('/api/session'))try{sessionId=(await r.json()).sessionId;}catch{}});
const api=async(route,data)=>{const r=await fetch(app.base+'/api/'+route,{method:data===undefined?'GET':'POST',headers:{'x-acta-session':sessionId,'Content-Type':'application/json'},...(data===undefined?{}:{body:JSON.stringify(data)})});const v=await r.json();if(!r.ok)throw new Error(v.error);return v;};
async function shot(name){await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});observations.push({step:name,at:new Date().toISOString()});if(process.env.ACTA_DEMO==='1'){const holds={'01-solicitud':20,'02-documentos':28,'03-documento-faltante':28,'04-abstencion':20,'05-revision':32,'06-guardado-verificado':22,'07-alteracion-rechazada':16,'08-recarga-persistente':14};await page.waitForTimeout((holds[name]||0)*1000);}}
async function ask(suggestion, code) {
 await page.locator('#'+suggestion).click();await page.locator('#ask').click();
 await page.locator('.busy').waitFor({state:'hidden',timeout:120000});
 if(code){const button=page.locator('.answer').filter({hasText:code}).last().getByRole('button',{name:/Ver respaldo/});await button.click();await page.locator('#source-excerpt').waitFor();}
 else await page.getByRole('heading',{name:'Sin respaldo en la guía'}).waitFor();
}
let receipt;
try {
 await page.goto(app.base+"/legacy");await page.locator('#start-case').click();
 await page.locator('#missing').selectOption('Constancia ficticia de domicilio');
 await page.locator('#note').fill('Revisar la constancia pendiente y remitir al supervisor. Sin activación de cuenta.');
 await shot('01-solicitud');
 await page.locator('#save-facts').click();
 await ask('suggest-doc','DOC-NAT-01');await shot('02-documentos');
 await ask('suggest-missing','EX-DOC-01');await shot('03-documento-faltante');
 await ask('suggest-out',null);await shot('04-abstencion');
 await page.locator('.source-button').first().click();await page.locator('.source-button').last().click();
 await page.locator('#basis-check').check();await page.locator('#confirm-source').click();
 await page.locator('#confirm-document').check();await page.locator('#confirm-route').check();await page.locator('#prepare-contact').click();
 await page.locator('#contact-text').waitFor();assert.match(await page.locator('#contact-text').innerText(),/constancia ficticia de domicilio/);
 const exactText=(await page.locator('#final-text').inputValue())+'\n\nObservación final revisada: conservar el pendiente.  \n';
 await page.locator('#final-text').fill(exactText);await page.locator('#approve').check();await shot('05-revision');
 await page.locator('#save-review').click();await page.locator('#saved-text').waitFor();
 assert.equal(await page.locator('#saved-text').textContent(),exactText);
 await page.locator('#reload-case').click();await page.waitForTimeout(300);assert.equal(await page.locator('#saved-text').textContent(),exactText);
 await page.reload();await page.locator('#saved-text').waitFor();assert.equal(await page.locator('#saved-text').textContent(),exactText);
 const selected=app.service.store.list().find(c=>c.lifecycle==='reviewed'), caseId=selected.id;
 const saved=await api('cases/'+caseId), record=saved.records[0];
 assert.equal(record.finalText,exactText);assert.equal(record.actor,'automation:synthetic-e2e');assert.equal(record.contact.delivery,'not-sent');assert.equal(record.disposition,'Pendiente de documentación');
 const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;const exported=path.join(out,'reviewed-export.json');await download.saveAs(exported);
 const original=JSON.parse(await readFile(exported,'utf8'));assert.deepEqual(original,record);
 await page.locator('#verify-original').click();await page.getByText(/Verificación correcta\./).waitFor();await shot('06-guardado-verificado');
 const tampered=structuredClone(original);tampered.finalText=original.finalText.replace('pendiente','pendientE');assert.notEqual(tampered.finalText,original.finalText);
 await writeFile(path.join(out,'tampered-export.json'),JSON.stringify(tampered,null,2));await page.locator('#verify-file').setInputFiles(path.join(out,'tampered-export.json'));await page.getByText(/Archivo rechazado\./).waitFor();await shot('07-alteracion-rechazada');
 await writeFile(path.join(out,'trusted-public-key.txt'),app.service.key.publica+'\n');
 assert.equal(verifyExport(original,app.service.key.publica).valid,true);assert.equal(verifyExport(tampered,app.service.key.publica).valid,false);
 await page.locator('#new-case').click();await page.locator('#facts').waitFor();const second=app.service.store.list()[0];assert.notEqual(second.id,caseId);assert.equal(second.queries.length,0);assert.equal(second.records?.length||0,0);
 await page.locator('[data-case="'+caseId+'"]').click();await page.locator('#saved-text').waitFor();assert.equal(await page.locator('#saved-text').textContent(),exactText);
 const port=new URL(app.base).port;await app.close();
 const fromNewProcess=JSON.parse(execFileSync(process.execPath,['--input-type=module','-e','import {DatabaseSync} from "node:sqlite"; const db=new DatabaseSync(process.argv[1],{readOnly:true}); console.log(db.prepare("SELECT body FROM records WHERE case_id=?").get(process.argv[2]).body);db.close();',path.join(directory,'acta.sqlite'),caseId],{encoding:'utf8',windowsHide:true}));
 assert.deepEqual(fromNewProcess,record);
 app=await startServer({port:Number(port),directory,automation:true});
 await page.reload();await page.locator('#saved-text').waitFor();assert.equal(await page.locator('#saved-text').textContent(),exactText);await shot('08-recarga-persistente');
 const supported=saved.queries.filter(q=>q.covered);const unsupported=saved.queries.find(q=>!q.covered);
 for(const q of supported){assert.equal(q.evidence.identity.executionMode,'local');assert.equal(q.evidence.native.backendDevice,'gpu');for(const citation of q.citations)assert.equal(app.service.source().text.slice(citation.start,citation.end),citation.excerpt);assert.equal(q.sourceHash,record.sourceHash);}
 for(const binding of record.queryBindings){const q=saved.queries.find(q=>q.queryId===binding.queryId);assert.equal(binding.runId,q.runId);assert.equal(binding.promptSha256,q.evidence.promptSha256);assert.equal(binding.outputSha256,q.evidence.outputSha256);}
 assert.equal(unsupported.code,null);assert.deepEqual(errors,[]);
 receipt={status:'passed',mode:'actual-interface-real-inference',startedAt:new Date(start).toISOString(),endedAt:new Date().toISOString(),sourceCommit:process.env.ACTA_SOURCE_COMMIT||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),sourceStatus:process.env.ACTA_SOURCE_COMMIT?'Source archive; no Git checkout':execFileSync('git',['status','--porcelain'],{encoding:'utf8',windowsHide:true}).trim(),directory,base:app.base,viewport:{width:1600,height:1000},observations,caseId,otherCaseId:second.id,exactTextHash:sha256(exactText),record,queries:saved.queries,persistence:{browserReload:true,serviceRestart:true,independentNodeProcessReload:true,exactBytes:true},export:{originalAccepted:true,modifiedCopyRejected:true,trustedKey:app.service.key.publica},consoleErrors:errors,humanAcceptance:false,independentMachineInstallation:false,networkIsolation:'No enforced offline restriction in this run; local inference verified by QVAC identity.'};
 await writeFile(path.join(out,'workflow.json'),JSON.stringify(receipt,null,2));
 console.log(JSON.stringify({status:'passed',caseId,exactTextHash:receipt.exactTextHash,steps:observations.length,directory}));
} catch(error){await page.screenshot({path:path.join(out,'failure-'+Date.now()+'.png'),fullPage:true});await writeFile(path.join(out,'workflow-failure-'+Date.now()+'.json'),JSON.stringify({status:'failed',error:String(error.stack),observations,errors,directory},null,2));throw error;}
finally{const video=page.video();await context.close();await video.saveAs(path.join(out,'workflow.webm'));await browser.close();await app.close();}
