import { readFile, writeFile } from 'node:fs/promises';
import { LocalRuntime } from '../src/runtime/index.js';
import { sourceSnapshot, selectionRequest, resolveSelection } from '../src/sucursal/procedimiento.js';
import { selectProcedure } from '../src/sucursal/selection.js';
import { execFileSync } from 'node:child_process';
import { sha256 } from '../src/runtime/assets.js';
const runtime=new LocalRuntime(), source=sourceSnapshot();
const raw=await readFile('fixtures/evaluation-plain.json','utf8');
const baseline=JSON.parse(await readFile('fixtures/sucursal/casos.json','utf8')).map(x=>({id:x.id,question:x.consulta,expected:x.espera.codigo,group:'upstream'}));
const cases=[...baseline,...JSON.parse(raw)], results=[];
try {for(const item of cases){const {result,evidence}=await selectProcedure(runtime,source,item.question);const pass=result.code===item.expected;results.push({...item,actual:result.code,pass,result,evidence});console.log(JSON.stringify({id:item.id,expected:item.expected,actual:result.code,pass}));}
 const report={sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),fixtureSha256:sha256(raw),sourceHash:source.sourceHash,total:results.length,correct:results.filter(x=>x.pass).length,results,scope:'Real local model selection; published text resolved verbatim from canonical guide. No bank-policy or time-saving claim.'};await writeFile('artifacts/evidence/acta/evaluation.json',JSON.stringify(report,null,2));console.log(JSON.stringify({correct:report.correct,total:report.total}));}
finally{await runtime.close();}
