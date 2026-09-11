import { mkdir, rename, stat } from 'node:fs/promises';
import { createWriteStream, readFileSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import path from 'node:path';
import { root, verifyModel, hashFile } from '../src/runtime/assets.js';
const dir = path.resolve(process.env.ACTA_MODEL_DIR || path.join(root, '.local/models'));
await mkdir(dir, { recursive: true });
try { console.log(JSON.stringify(await verifyModel(dir), null, 2)); }
catch {
  const asset = JSON.parse(readFileSync(path.join(root, 'MODEL-MANIFEST.json'))).models[0];
  const target = path.join(dir, asset.filename);
  try { await stat(target); throw new Error('Existe un modelo que no pasa verificación; conserve o retire ese archivo antes de descargar.'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const response = await fetch(asset.url, { signal: AbortSignal.timeout(600000) });
  if (!response.ok) throw new Error(`Descarga HTTP ${response.status}`);
  await pipeline(Readable.fromWeb(response.body), createWriteStream(target + '.partial', { flags: 'wx' }));
  if (await hashFile(target + '.partial') !== asset.sha256) throw new Error('Descarga inválida; se conserva .partial para diagnóstico.');
  await rename(target + '.partial', target);
  console.log(JSON.stringify(await verifyModel(dir), null, 2));
}
