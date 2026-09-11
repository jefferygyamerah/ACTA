import { readFileSync } from 'node:fs';
import { verifyExport } from '../src/service.js';
const [file, key]=process.argv.slice(2);
if(!file||!key)throw new Error('Uso: npm run verify -- acta.json trusted-public-key.txt');
const result=verifyExport(JSON.parse(readFileSync(file,'utf8')),readFileSync(key,'utf8'));
console.log(JSON.stringify(result,null,2));if(!result.valid)process.exitCode=1;
