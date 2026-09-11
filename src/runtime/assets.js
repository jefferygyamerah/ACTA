import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, stat, realpath } from 'node:fs/promises';
import path from 'node:path';
export const root = path.resolve(import.meta.dirname, '../..');
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export async function hashFile(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}
export async function verifyModel(directory = process.env.ACTA_MODEL_DIR || path.join(root, '.local/models')) {
  const manifest = JSON.parse(await readFile(path.join(root, 'MODEL-MANIFEST.json'), 'utf8'));
  const asset = manifest.models[0];
  const folder = await realpath(directory);
  const file = await realpath(path.join(folder, asset.filename));
  if (path.dirname(file) !== folder) throw new Error('La ruta del modelo sale de su directorio.');
  const info = await stat(file);
  if (info.size !== asset.expectedBytes) throw new Error('Modelo incompleto. Ejecute npm run provision.');
  const actualSha256 = await hashFile(file);
  if (actualSha256 !== asset.sha256) throw new Error('La huella del modelo no coincide.');
  return { ...asset, path: file, actualBytes: info.size, actualSha256, sdk: manifest.sdk };
}
