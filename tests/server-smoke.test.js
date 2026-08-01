const assert = require('assert');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');

const sourceDbPath = path.join(__dirname, '../server/database/db.json');

async function waitForServer(baseUrl, child) {
  const deadline = Date.now() + 8000;
  let lastError;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`server exited early with code ${child.exitCode}`);
    }

    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }

    await new Promise(resolve => setTimeout(resolve, 150));
  }

  throw lastError || new Error('server did not become ready');
}

async function startServer(t) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'research-nav-server-'));
  const tempDbPath = path.join(tempDir, 'db.json');
  fs.copyFileSync(sourceDbPath, tempDbPath);

  const port = 3300 + Math.floor(Math.random() * 1000);
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['server/app.js'], {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      PORT: String(port),
      DB_PATH: tempDbPath,
      JWT_SECRET: 'test-secret',
      NODE_ENV: 'test'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let stderr = '';
  child.stderr.on('data', chunk => { stderr += chunk.toString(); });

  t.after(() => {
    if (child.exitCode === null) child.kill();
  });

  await waitForServer(baseUrl, child).catch(error => {
    throw new Error(`${error.message}\n${stderr}`);
  });

  return { baseUrl, tempDbPath };
}

test('server starts, exposes data, supports login and camelCase password change', async t => {
  const { baseUrl } = await startServer(t);

  const health = await fetch(`${baseUrl}/api/health`);
  assert.strictEqual(health.status, 200);

  const categories = await (await fetch(`${baseUrl}/api/categories`)).json();
  const links = await (await fetch(`${baseUrl}/api/links`)).json();
  assert.strictEqual(categories.length, 23);
  assert.strictEqual(links.length, 158);

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  assert.strictEqual(login.status, 200);
  const loginBody = await login.json();
  assert.ok(loginBody.token);

  const me = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${loginBody.token}` }
  });
  assert.strictEqual(me.status, 200);

  const changePassword = await fetch(`${baseUrl}/api/auth/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${loginBody.token}`
    },
    body: JSON.stringify({ oldPassword: 'admin123', newPassword: 'admin456' })
  });
  assert.strictEqual(changePassword.status, 200);
});

test('icon upload rejects svg files', async t => {
  const { baseUrl } = await startServer(t);

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const { token } = await login.json();

  const form = new FormData();
  form.set('file', new Blob(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], {
    type: 'image/svg+xml'
  }), 'bad.svg');

  const upload = await fetch(`${baseUrl}/api/upload/icon`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });

  assert.notStrictEqual(upload.status, 200);
});
