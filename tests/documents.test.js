import test from 'node:test';
import assert from 'node:assert/strict';
import {importDocument,validateExtraction,extractDocument} from '../src/reconciliation/documents.js';

test('document intake retains original bytes and canonical page/line evidence',async()=>{
 const text='DOCUMENTO FICTICIO\r\nTitular: Ada Prueba\r\nDomicilio: Calle Uno 5\r\n';
 const d=await importDocument({name:'ejemplo.txt',text});
 assert.equal(Buffer.from(d.originalBase64,'base64').toString(),text);
 const x=validateExtraction(d,{kind:'address',facts:[{field:'holder',value:'Ada Prueba',line:2},{field:'address',value:'Calle Uno 5',line:3}]});
 for(const f of x.facts)assert.equal(d.text.slice(f.source.start,f.source.end),f.value);
 assert.equal(x.facts[1].quote,'Domicilio: Calle Uno 5');
 assert.throws(()=>validateExtraction(d,{kind:'address',facts:[{field:'address',value:'Calle Inventada',line:3}]}));
 assert.throws(()=>validateExtraction(d,{kind:'address',facts:[{field:'holder',value:'Ada Prueba',line:3}]}));
 assert.throws(()=>validateExtraction(d,{kind:'identity',facts:[{field:'holder',value:'Ada Prueba',line:2},{field:'holder',value:'Ada Prueba',line:2}]}));
});
test('unreadable, unbounded and unsupported documents fail explicitly',async()=>{
 await assert.rejects(importDocument({name:'foto.jpg',text:'not an image'}));
 await assert.rejects(importDocument({name:'bad.pdf',base64:Buffer.from('not a PDF').toString('base64')}));
 await assert.rejects(importDocument({name:'empty.txt',text:' '}));
 await assert.rejects(importDocument({name:'large.txt',text:'x'.repeat(24001)}));
});
test('extraction is a proposal with runtime identity and rejects unsupported values',async()=>{
 const d=await importDocument({name:'nota.txt',text:'DOCUMENTO FICTICIO\nTitular: Ada Prueba'});
 let request;
 const runtime={infer:async r=>{request=r;return{runId:'labelled-test-double',outputText:JSON.stringify({kind:'identity',holder:{value:'Ada Prueba',line:2},identityNumber:null,address:null,issuedAt:null,expiresAt:null,incomeSource:null})};}};
 const x=await extractDocument(runtime,d);assert.equal(x.runId,'labelled-test-double');assert.equal(x.facts[0].value,'Ada Prueba');assert.equal(d.review,null);assert.equal(request.maxTokens,720);
 runtime.infer=async()=>({outputText:'{"kind":"identity","facts":[{"field":"holder","value":"Persona inventada","line":2}]}'});
 await assert.rejects(extractDocument(runtime,d));
});
