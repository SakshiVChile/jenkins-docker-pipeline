const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { createServer } = require('../src/app');

let server;
let baseUrl;

before(async () => {
  server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
});

test('GET / returns the home page', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.strictEqual(res.status, 200);
  assert.match(await res.text(), /Deployed by Jenkins/);
});

test('GET /health returns status ok', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { status: 'ok' });
});

test('GET /version returns the build number', async () => {
  const res = await fetch(`${baseUrl}/version`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.app, 'jenkins-docker-pipeline');
  assert.ok(body.build);
});

test('unknown route returns 404', async () => {
  const res = await fetch(`${baseUrl}/nope`);
  assert.strictEqual(res.status, 404);
});
