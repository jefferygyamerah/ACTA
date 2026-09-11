import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { root, sha256 } from '../src/runtime/assets.js';
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();
const base=mkdtempSync(path.join(root,'.local/clean-')), checkout=path.join(base,'source');mkdirSync(checkout);
const zip=path.join(base,'source.zip');
execFileSync('git',['archive','--format=zip','--output='+zip,commit],{windowsHide:true});
execFileSync('tar',['-xf',zip,'-C',checkout],{windowsHide:true});
mkdirSync(path.join(checkout,'.local'),{recursive:true});
const steps=[];
function run(command,args,env={}){
 const result=spawnSync(command,args,{cwd:checkout,encoding:'utf8',windowsHide:true,env:{...process.env,...env},maxBuffer:10*1024*1024});
 steps.push({command:[command,...args].join(' '),exitCode:result.status,stdout:result.stdout,stderr:result.stderr,error:result.error?String(result.error):null});
 if(result.status!==0)throw new Error('Clean setup failed: '+steps.at(-1).command+'\n'+result.stderr+'\n'+result.stdout);
}
try{
 run('powershell.exe',['-NoProfile','-Command','npm.cmd ci --no-audit --no-fund']);
 run(process.execPath,['scripts/check.js']);
 run(process.execPath,['--test','tests/core.test.js','tests/relevance.test.js']);
 run(process.execPath,['scripts/provision.js'],{ACTA_MODEL_DIR:path.join(root,'.local/models')});
 run(process.execPath,['scripts/e2e.js'],{ACTA_MODEL_DIR:path.join(root,'.local/models'),ACTA_SOURCE_COMMIT:commit});
 const workflow=JSON.parse(readFileSync(path.join(checkout,'artifacts/evidence/acta/workflow.json'),'utf8'));
 if(workflow.status!=='passed')throw new Error('Clean workflow failed.');
 const receipt={status:'passed',scope:'Fresh locked dependencies and actual browser + real QVAC workflow from source archive on same machine; verified provisioned model bytes reused.',sourceCommit:commit,checkout,archiveSha256:sha256(readFileSync(zip)),node:process.version,steps,workflow};
 writeFileSync(path.join(root,'artifacts/evidence/acta/clean-setup.json'),JSON.stringify(receipt,null,2));console.log(JSON.stringify({status:'passed',sourceCommit:commit,checkout,steps:steps.length}));
}catch(error){writeFileSync(path.join(root,'artifacts/evidence/acta/clean-setup-failure-'+Date.now()+'.json'),JSON.stringify({status:'failed',sourceCommit:commit,steps,error:String(error.stack)},null,2));throw error;}
