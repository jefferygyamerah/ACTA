import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { sha256 } from '../src/runtime/assets.js';
const commit='942b94307265f383ac941141a6a503e69ebcd079';
const mapping=[
 ['src/sucursal/guia.js','adapt','src/sucursal/guia.js'],
 ['src/sucursal/procedimiento.js','adapt','src/sucursal/procedimiento.js'],
 ['src/core/sello.js','reuse','src/core/sello.js'],
 ['fixtures/sucursal/guia-bpl.md','reuse','fixtures/sucursal/guia-bpl.md'],
 ['fixtures/sucursal/casos.json','reuse','fixtures/sucursal/casos.json'],
 ['LICENSE','reuse','third-party/VIGIA-LICENSE'],
 ...['src/sucursal/http.js','src/sucursal/expediente.js','src/core/eventos.js','src/core/rendimiento.js','app/sucursal.html','app/verificar.html','app/verificar.js'].map(p=>[p,'omit',null]),
 ['src/core/runtime.js','adapt','src/runtime/worker.js']
];
const files=[];
for(const [file,decision,target] of mapping){const bytes=execFileSync('git',['-C','.local/donors/vigia','show',commit+':'+file]);files.push({sourceRepository:'cpu-16/vigia',sourceCommit:commit,path:file,sha256:sha256(bytes),decision,target,...(target?{targetSha256:sha256(await readFile(target))}:{})});}
const notare=process.argv[2],ncommit='974eecd7cac8a1527e68e890e50cf6907a5198b1';
if(!notare)throw new Error('Pass the read-only Notare checkout path for inventory.');
for(const file of ['packages/runtime/bare-entry.ts','packages/runtime/shared-runtime.ts','packages/runtime/worker.ts','MODEL-MANIFEST.json','LICENSE']){const bytes=execFileSync('git',['-C',notare,'show',ncommit+':'+file]);files.push({sourceRepository:'jefferygyamerah/notare',sourceCommit:ncommit,path:file,sha256:sha256(bytes),decision:'adapt',reason:'Worker boundary, native metrics or compatible text-model manifest; no clinical schemas.'});}
await writeFile('third-party/donor-inventory.json',JSON.stringify({inspectedAt:new Date().toISOString(),license:'MIT; notices retained',decisionsDocument:'NOTICE.md',runtimeDependencies:['@qvac/sdk@0.18.2','@qvac/llm-llamacpp@0.45.0'],files},null,2));
console.log(JSON.stringify({inventoried:files.length}));
