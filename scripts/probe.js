import { mkdir, writeFile } from 'node:fs/promises';
import { LocalRuntime } from '../src/runtime/index.js';
import { sourceSnapshot, selectionRequest, resolveSelection } from '../src/sucursal/procedimiento.js';
const runtime = new LocalRuntime();
const questions = process.argv.slice(2).length ? process.argv.slice(2) : ['Una persona adulta panameña quiere abrir una cuenta. ¿Qué documentos debe presentar?', 'Falta la constancia de domicilio. ¿Cómo seguimos con la solicitud?', '¿Qué tasa tiene un préstamo hipotecario?'];
await mkdir('artifacts/evidence/acta', { recursive: true });
const results = [];
try {
  const source = sourceSnapshot();
  for (const question of questions) {
    const evidence = await runtime.infer(selectionRequest(source, question));
    const result = resolveSelection(source, evidence); results.push({ question, result, evidence });
    console.log(JSON.stringify({ question, code: result.code, covered: result.covered, native: evidence.native, loadMs: evidence.identity.loadMs }));
  }
  await writeFile('artifacts/evidence/acta/runtime-probe.json', JSON.stringify({ status: 'passed', results }, null, 2));
} catch (error) { await writeFile('artifacts/evidence/acta/runtime-failure-' + Date.now() + '.json', JSON.stringify({ status: 'failed', error: String(error.stack), evidence: error.evidence }, null, 2)); throw error; }
finally { await runtime.close(); }
