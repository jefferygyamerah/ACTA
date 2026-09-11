import { fork } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { root } from './assets.js';
import path from 'node:path';
export class LocalRuntime {
  constructor() { this.child = null; this.identity = null; this.pending = null; this.stderr = ''; }
  async start() {
    if (this.identity) return this.identity;
    if (this.starting) return this.starting;
    this.starting = new Promise((resolve, reject) => {
      const child = this.child = fork(path.join(import.meta.dirname, 'worker.js'), [], { cwd: root, windowsHide: true, stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
      child.stderr.on('data', b => { this.stderr = (this.stderr + b).slice(-16000); });
      const timer = setTimeout(() => { reject(new Error(`QVAC startup timeout. ${this.stderr}`)); this.close(); }, 90000);
      child.on('message', msg => {
        if (msg.type === 'ready') { clearTimeout(timer); this.identity = msg.identity; resolve(msg.identity); }
        if (msg.type === 'failure' && !msg.runId) { clearTimeout(timer); reject(Object.assign(new Error(msg.evidence.error), { evidence: msg.evidence })); }
        if (this.pending && msg.runId === this.pending.runId) { const p = this.pending; this.pending = null; clearTimeout(p.timer); msg.type === 'result' ? p.resolve(msg.evidence) : p.reject(Object.assign(new Error('Falló la inferencia local.'), { evidence: msg.evidence })); }
      });
      child.on('error', err => { clearTimeout(timer); reject(err); });
      child.on('exit', code => { clearTimeout(timer); this.identity = null; this.starting = null; if (this.pending) { clearTimeout(this.pending.timer); this.pending.reject(new Error(`QVAC terminó (${code}). ${this.stderr}`)); this.pending = null; } reject(new Error(`QVAC worker terminó (${code}). ${this.stderr}`)); });
      child.send({ type: 'init' });
    });
    return this.starting;
  }
  async infer(request) {
    await this.start();
    if (this.pending) throw Object.assign(new Error('La IA local está atendiendo otra consulta. Inténtelo de nuevo.'), { status: 409 });
    return new Promise((resolve, reject) => {
      const runId = randomUUID();
      const timer = setTimeout(() => { this.pending = null; reject(new Error('Se agotó el tiempo de consulta.')); this.close(); }, 90000);
      this.pending = { runId, resolve, reject, timer };
      this.child.send({ type: 'query', runId, ...request });
    });
  }
  async close() {
    const child = this.child; if (!child) return;
    this.child = null; this.identity = null; this.starting = null;
    if (child.connected) child.send({ type: 'stop' });
    await new Promise(resolve => { const timer = setTimeout(() => { child.kill(); resolve(); }, 5000); child.once('exit', () => { clearTimeout(timer); resolve(); }); });
  }
}
