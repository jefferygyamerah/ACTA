import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const files=[];
async function walk(dir){for(const d of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,d.name);if(d.isDirectory())await walk(p);else if(p.endsWith('.js'))files.push(p);}}
for(const d of ['src','public','scripts','tests'])await walk(d);
for(const file of files){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8',windowsHide:true});if(r.status!==0)throw new Error(r.stderr);}
const manifest=JSON.parse(await readFile('MODEL-MANIFEST.json','utf8'));
if(manifest.sdk.version!=='0.18.2')throw new Error('SDK pin changed');
console.log(JSON.stringify({status:'passed',syntaxFiles:files.length,node:process.version}));
