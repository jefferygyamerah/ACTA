import { spawnSync, execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();
for(const [id,args] of [['build',['scripts/check.js']],['core',['--test','--test-reporter=tap','tests/core.test.js','tests/relevance.test.js']]]){
 const result=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true});
 const receipt={id,sourceCommit,command:'node '+args.join(' '),exitCode:result.status,status:result.status===0?'passed':'failed',node:process.version,stdout:result.stdout,stderr:result.stderr,at:new Date().toISOString()};
 writeFileSync('artifacts/evidence/acta/'+id+'.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify({id,status:receipt.status,exitCode:result.status}));if(result.status!==0)process.exitCode=1;
}
