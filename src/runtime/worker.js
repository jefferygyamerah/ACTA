// ACTA worker. QVAC loading/metrics pattern adapted from Notare, see NOTICE.md.
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { verifyModel, root, sha256 } from './assets.js';
const require = createRequire(import.meta.url);
let sdk, modelId, identity;
async function version(name) {
  let dir = path.dirname(require.resolve(name));
  for (let i = 0; i < 8; i++, dir = path.dirname(dir)) {
    try { const pkg = JSON.parse(await readFile(path.join(dir, 'package.json'), 'utf8')); if (pkg.name === name) return pkg.version; } catch {}
  }
  throw new Error(`No se pudo identificar ${name}`);
}
async function initialize() {
  const asset = await verifyModel();
  const sdkVersion = await version('@qvac/sdk'), addonVersion = await version('@qvac/llm-llamacpp');
  if (sdkVersion !== asset.sdk.version || addonVersion !== asset.sdk.addonVersion) throw new Error('Versión de QVAC incompatible con el manifiesto.');
  const dir = path.join(root, '.local/runtime', String(process.pid));
  await mkdir(dir, { recursive: true });
  const config = path.join(dir, 'qvac.config.json');
  await writeFile(config, JSON.stringify({ cacheDirectory: path.dirname(asset.path), loggerLevel: 'off', loggerConsoleOutput: false, rpcInitTimeoutMs: 45000 }));
  process.env.QVAC_CONFIG_PATH = config;
  process.env.QVAC_WORKER_PATH = path.join(import.meta.dirname, 'bare-entry.js');
  process.env.QVAC_RPC_INIT_TIMEOUT_MS = '45000';
  sdk = await import('@qvac/sdk');
  sdk.profiler.enable({ mode: 'verbose', includeResourceGauges: true });
  const started = performance.now();
  modelId = await sdk.loadModel({ modelSrc: asset.path, modelType: asset.modelType, modelConfig: asset.loadConfig });
  const loadMs = performance.now() - started;
  const info = await sdk.getLoadedModelInfo({ modelId });
  if (info.isDelegated) throw new Error('Se rechazó inferencia delegada.');
  identity = { sdkVersion, addonVersion, node: process.version, platform: process.platform, arch: process.arch, processId: process.pid,
    workerEntry: process.env.QVAC_WORKER_PATH, executionMode: 'local', asset, modelId, loadMs, loadedModelInfo: info,
    loadState: 'cold model load; OS file cache not cleared', loadMeasurement: 'performance.now around await loadModel, including worker startup' };
  return identity;
}
async function stop() { try { if (modelId) await sdk.unloadModel({ modelId, clearStorage: false, autoClose: false }); await sdk?.close(); } finally { process.exit(0); } }
process.on('message', async job => {
  if (job.type === 'stop') return stop();
  const startedAt = new Date().toISOString();
  try {
    if (job.type === 'init') return process.send({ type: 'ready', identity: await initialize() });
    const start = performance.now(); let first = null, deltas = 0, done = false;
    const predict = Number.isInteger(job.maxTokens) ? Math.min(1536, Math.max(32, job.maxTokens)) : 96;
    const generationParams = { temp: 0, seed: 42, predict, reasoning_budget: 0 };
    const request = { modelId, stream: true, kvCache: false, history: job.history, responseFormat: job.responseFormat, generationParams };
    const run = sdk.completion(request);
    for await (const event of run.events) {
      if (event.type === 'contentDelta' && event.text) { first ??= performance.now() - start; deltas++; }
      if (event.type === 'completionDone') done = true;
    }
    const final = await run.final;
    if (!final.contentText?.trim() || !done) throw new Error('QVAC no completó una respuesta válida.');
    const evidence = { runId: job.runId, status: 'succeeded', startedAt, endedAt: new Date().toISOString(), identity, request,
      promptSha256: sha256(JSON.stringify(job.history)), outputText: final.contentText, outputSha256: sha256(final.contentText),
      native: final.stats, stopReason: final.stopReason ?? null, completionDoneObserved: done, finalPromiseResolved: true,
      completionWallMs: performance.now() - start, firstContentMs: first, contentDeltas: deltas,
      cacheState: 'warm model; kvCache false', metricsMethod: 'native SDK counters and decode tokens/s; application timings use performance.now; no token estimates' };
    process.send({ type: 'result', runId: job.runId, evidence });
  } catch (error) { process.send({ type: 'failure', runId: job.runId, evidence: { status: 'failed', startedAt, endedAt: new Date().toISOString(), error: String(error.stack || error), identity, request: job } }); }
});
process.on('disconnect', stop);
