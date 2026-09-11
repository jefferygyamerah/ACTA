import http from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { CaseService, verifyExport, missingItems, fail } from './service.js';
import { ReconciliationService } from './reconciliation/service.js';
import { kindLabels, fieldLabels } from './reconciliation/documents.js';
import { LocalRuntime } from './runtime/index.js';
import { root } from './runtime/assets.js';
export async function startServer({ port = Number(process.env.PORT || 4318), directory = process.env.ACTA_DATA_DIR || path.join(root, '.local/data'), runtime = new LocalRuntime(), automation = process.env.ACTA_AUTOMATION === '1' } = {}) {
  const service = new ReconciliationService({ directory, runtime, automation });
  let base;
  const serverSockets = new Set();
  const socketRequests = new Map();
  const closeGraceMs = 250;
  const closeDrainMs = 150;
  const socketCloseBoundMs = closeGraceMs + closeDrainMs;
  let closePromise;
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const server = http.createServer(async (req, res) => {
    const send = (value, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'none'");
    try {
      if (req.headers.host !== new URL(base).host) fail('Host no autorizado.', 403);
      if (req.headers.origin && req.headers.origin !== base) fail('Origen no autorizado.', 403);
      const url = new URL(req.url, base);
      if (!url.pathname.startsWith('/api/')) {
        const assets = { '/': 'index.html', '/legacy': 'legacy.html', '/reconcile.js': 'reconcile.js', '/reconcile.css': 'reconcile.css', '/app.js': 'app.js', '/style.css': 'style.css', '/brand.css': 'brand.css', '/favicon.svg': 'favicon.svg' };
        const name = assets[url.pathname]; if (!name || req.method !== 'GET') fail('No encontrado.', 404);
        const mime = { html: 'text/html', js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml' }[name.split('.').at(-1)];
        res.writeHead(200, { 'Content-Type': mime + '; charset=utf-8', 'Cache-Control': 'no-store' });
        return res.end(await readFile(path.join(root, 'public', name)));
      }
      if (url.pathname === '/api/health' && req.method === 'GET') return send({ status: 'ok', runtime: runtime.identity ? 'ready' : 'not-loaded', synthetic: true });
      if (url.pathname === '/api/session' && req.method === 'POST') return send({ sessionId: service.session(), automation });
      const sid = req.headers['x-acta-session']; service.context(sid);
      let data = {};
      if (req.method === 'POST') {
        let raw = ''; for await (const chunk of req) { raw += chunk; if (Buffer.byteLength(raw) > 12 * 1024 * 1024) fail('Solicitud demasiado grande.', 413); }
        try { data = raw ? JSON.parse(raw) : {}; } catch { fail('JSON inválido.', 400); }
      }
      if (url.pathname === '/api/bootstrap' && req.method === 'GET') return send({ cases: service.store.list().filter(c => c.workflow !== 'reconciliation').map(c => ({ id: c.id, reference: c.reference, title: c.title, lifecycle: c.lifecycle, disposition: c.disposition })), source: service.source(), missingItems, automation, runtime: runtime.identity ? { sdkVersion: runtime.identity.sdkVersion, model: runtime.identity.asset.filename, loadMs: runtime.identity.loadMs } : null });
      if (url.pathname === '/api/runtime' && req.method === 'POST') return send(await runtime.start());
      if (url.pathname === '/api/cancel' && req.method === 'POST') return send(service.cancel(sid));
      if (url.pathname === '/api/cases' && req.method === 'POST') return send(service.create(sid, data));
      if (url.pathname === '/api/verify' && req.method === 'POST') return send(verifyExport(data, service.key.publica));
      if (url.pathname === '/api/trusted-key' && req.method === 'GET') return send({ publicKey: service.key.publica });
      if (url.pathname === '/api/packet-bootstrap' && req.method === 'GET') return send({cases:service.store.list().filter(c=>c.workflow==='reconciliation').map(c=>({id:c.id,reference:c.reference,title:c.title,phase:c.phase,round:c.rounds.length})),policy:service.policy(),kindLabels,fieldLabels,demo:service.demoInputs(),automation});
      if (url.pathname === '/api/packets' && req.method === 'POST') return send(service.createPacket(sid,data));
      const packetMatch = url.pathname.match(/^\/api\/packets\/([a-f0-9-]+)(?:\/(select|documents|read|manual|review|confirm|preview|save|resume|export|document)(?:\/([a-f0-9-]+))?)?$/);
      if(packetMatch){
        const [,id,action,documentId]=packetMatch;
        if(!action && req.method==='GET')return send(service.getPacket(sid,id));
        if(action==='document'&&documentId&&req.method==='GET'){
          const file=service.documentFile(sid,id,documentId);
          res.writeHead(200,{'Content-Type':file.mime,'Cache-Control':'no-store','Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(file.name)});
          return res.end(file.bytes);
        }
        if(action==='export'&&req.method==='GET'){
          service.packet(sid,id);const records=service.store.records(id),record=records.at(-1);
          if(!record)fail('Guarde la revisión antes de exportar.');
          if(!verifyExport(record,service.key.publica).valid)fail('El registro no supera la verificación.',500);
          return send(record);
        }
        if(req.method!=='POST')fail('Método no permitido.',405);
        if(action==='select'){service.select(sid,id);return send(service.getPacket(sid,id));}
        const methods={documents:'addDocuments',read:'readDocument',manual:'manualDocument',review:'reviewDocument',confirm:'confirmFindings',preview:'previewPacket',save:'savePacket',resume:'resumePacket'};
        if(!methods[action])fail('Ruta inválida.',404);
        return send(await service[methods[action]](sid,id,data));
      }
      const match = url.pathname.match(/^\/api\/cases\/([a-f0-9-]+)(?:\/(select|edit|query|source-review|contact|preview|save|export))?$/);
      if (!match) fail('Ruta inexistente.', 404);
      const [, id, action] = match;
      if(service.case(id).workflow==='reconciliation')fail('Use la ruta de revisión documental para este expediente.',404);
      if (!action && req.method === 'GET') return send(service.get(sid, id));
      if (action === 'export' && req.method === 'GET') {
        service.active(sid, id); const record = service.store.records(id).at(-1); if (!record) fail('Guarde la revisión antes de exportar.');
        if (!verifyExport(record, service.key.publica).valid) fail('El registro guardado no supera la verificación.', 500);
        res.setHeader('Content-Disposition', 'attachment; filename="' + record.reference + '.json"'); return send(record);
      }
      if (req.method !== 'POST') fail('Método no permitido.', 405);
      const methods = { select: 'select', edit: 'edit', query: 'query', 'source-review': 'reviewSource', contact: 'contact', preview: 'preview', save: 'save' };
      if (!methods[action]) fail('Ruta inválida.', 404);
      return send(await service[methods[action]](sid, id, data));
    } catch (error) {
      if (error.evidence) { await mkdir(path.join(directory, 'failures'), { recursive: true }); await writeFile(path.join(directory, 'failures', Date.now() + '.json'), JSON.stringify(error.evidence, null, 2)); }
      send({ error: error.message }, error.status || 500);
    }
  });
  server.on('connection', socket => {
    socketRequests.set(socket, { activeRequests: 0 });
    serverSockets.add(socket);
    const teardown = () => {
      serverSockets.delete(socket);
      socketRequests.delete(socket);
    };
    socket.on('close', teardown);
    socket.on('error', () => {});
  });
  server.on('request', (req, res) => {
    const state = socketRequests.get(req.socket);
    if (state) state.activeRequests += 1;
    const finalize = () => {
      if (state) state.activeRequests = Math.max(0, state.activeRequests - 1);
    };
    res.once('finish', finalize);
    res.once('close', finalize);
  });
  const closeServer = () => new Promise((resolve, reject) => {
    server.close(error => {
      if (error && error.code !== 'ERR_SERVER_NOT_RUNNING') reject(error);
      else resolve();
    });
  });
  const forceCloseSockets = async () => {
    for (const socket of serverSockets) {
      const state = socketRequests.get(socket);
      if (!state || state.activeRequests === 0) {
        if (socket.writable && !socket.destroyed) socket.end();
      }
    }
    await sleep(closeDrainMs);
    for (const socket of serverSockets) {
      if (!socket.destroyed) socket.destroy();
    }
  };
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
  return {
    base,
    server,
    service,
    runtime,
    close: async () => {
      if (!closePromise) {
        closePromise = (async () => {
          const serverClosed = closeServer();
          await sleep(closeGraceMs);
          await forceCloseSockets();
          await sleep(Math.max(25, socketCloseBoundMs));
          await serverClosed;
          await runtime.close();
          service.close();
          return true;
        })();
      }
      return closePromise;
    }
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const app = await startServer(); console.log('ACTA disponible en ' + app.base);
  let stopping = false;
  const stop = async () => { if (stopping) return; stopping = true; await app.close(); process.exit(0); };
  process.on('SIGINT', stop); process.on('SIGTERM', stop);
}
