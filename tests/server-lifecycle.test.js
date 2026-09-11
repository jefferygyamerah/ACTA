import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { once } from 'node:events';
import { startServer } from '../src/server.js';
import { root } from '../src/runtime/assets.js';

test('server lifecycle close is bounded, idempotent and releases port', async () => {
  const makeDirectory = () => mkdtempSync(path.join(root, '.local/server-lifecycle-'));
  let runtimeCloseCalls = 0;
  const labelledRuntime = {
    identity: { sdkVersion: 'labelled-shutdown-test', asset: { filename: 'labelled-shutdown-test.bin' }, loadMs: 0 },
    close: async () => { runtimeCloseCalls += 1; },
  };

  const app = await startServer({
    port: 0,
    directory: makeDirectory(),
    runtime: labelledRuntime,
  });
  const { port } = new URL(app.base);

  const health = await fetch(app.base + '/api/health');
  assert.equal(health.status, 200);

  const stalledSocket = net.createConnection({ host: '127.0.0.1', port });
  await once(stalledSocket, 'connect');
  stalledSocket.write(
    `POST /api/session HTTP/1.1\r\n` +
    `Host: 127.0.0.1:${port}\r\n` +
    'Content-Length: 64\r\n' +
    'Connection: keep-alive\r\n' +
    '\r\n' +
    '{"id":'
  );

  const closeTimeoutMs = 900;
  const closeStart = Date.now();
  await Promise.race([
    Promise.all([app.close(), app.close()]),
    new Promise((_, reject) => setTimeout(() => reject(new Error('close exceeded bounded window')), closeTimeoutMs)),
  ]);

  assert.equal(runtimeCloseCalls, 1);
  assert.ok(Date.now() - closeStart < closeTimeoutMs);

  const reusedRuntime = {
    identity: { sdkVersion: 'labelled-shutdown-test-rebind', asset: { filename: 'labelled-shutdown-test-rebind.bin' }, loadMs: 0 },
    close: async () => {},
  };
  const restarted = await startServer({
    port,
    directory: makeDirectory(),
    runtime: reusedRuntime,
  });
  await restarted.close();

  await app.close();
  stalledSocket.destroy();
});
