import test from 'node:test';
import assert from 'node:assert/strict';
import { sourceSnapshot } from '../src/sucursal/procedimiento.js';
import { scopeExclusion } from '../src/sucursal/scope.js';
import { selectProcedure } from '../src/sucursal/selection.js';
test('explicit source exclusions veto a model guess and retain the exact exclusion',async()=>{
 const source=sourceSnapshot();const result=await selectProcedure({infer:async()=>({runId:'labelled-double',outputText:'{"codigo":"ISL-REC-01"}'})},source,'El cliente olvidó su PIN, ¿cómo lo recupero?');
 assert.equal(result.result.covered,false);assert.match(result.evidence.scopeExclusion.excerpt,/PIN/);const span=result.evidence.scopeExclusion;assert.equal(source.text.slice(span.start,span.end),span.excerpt);
});
test('relevance rejection cannot publish canonical but unrelated instructions',async()=>{
 let call=0;const response=await selectProcedure({infer:async()=>++call===1?{runId:'select-double',outputText:'{"codigo":"DOC-NAT-01"}',completionWallMs:1}:{runId:'verify-double',outputText:'{"supported":false}',completionWallMs:1}},sourceSnapshot(),'¿Cómo funciona un servicio que no aparece en la guía?');
 assert.equal(response.result.covered,false);assert.deepEqual(response.result.steps,[]);assert.equal(response.evidence.verification.runId,'verify-double');
});
test('scope rule is disabled when its exact canonical exclusion is absent',()=>{
 const source=sourceSnapshot();const removed={...source,sections:source.sections.map(s=>({...s,text:s.text.replace('No contiene procedimientos de desbloqueo de banca móvil ni recuperación de PIN.','')}))};
 assert.equal(scopeExclusion(removed,'¿Cómo recupero el PIN?'),null);
});
