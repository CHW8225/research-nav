const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');

test('server database modules do not require ESM-only lowdb at startup', () => {
  const databaseSource = fs.readFileSync(
    path.join(__dirname, '../server/config/database.js'),
    'utf8'
  );
  const importSource = fs.readFileSync(path.join(__dirname, '../server/import-data.js'), 'utf8');
  const initSource = fs.readFileSync(path.join(__dirname, '../server/init-db.js'), 'utf8');

  assert.ok(!databaseSource.includes("require('lowdb')"));
  assert.ok(!databaseSource.includes("require('lowdb/node')"));
  assert.ok(!importSource.includes("require('lowdb')"));
  assert.ok(!importSource.includes("require('lowdb/node')"));
  assert.ok(!initSource.includes("require('lowdb')"));
  assert.ok(!initSource.includes("require('lowdb/node')"));
});

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
