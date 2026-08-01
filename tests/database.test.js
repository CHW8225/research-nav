const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');

test('database config initializes LowDB JSON data from DB_PATH', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'research-nav-db-'));
  const tempDbPath = path.join(tempDir, 'db.json');

  process.env.DB_PATH = tempDbPath;
  delete require.cache[require.resolve('../server/config/database')];

  const { db, dbPath, initDatabase } = require('../server/config/database');
  initDatabase();

  assert.strictEqual(dbPath, tempDbPath);
  assert.deepStrictEqual(db.data, {
    users: [],
    categories: [],
    links: [],
    announcements: []
  });
  assert.ok(fs.existsSync(tempDbPath));
});
