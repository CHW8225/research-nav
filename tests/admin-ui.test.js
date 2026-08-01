const assert = require('assert');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

function assertNoMojibake(text, label) {
  const mojibakePattern = /(绉|鍚|鐧|璧勬簮|涔辩爜|闂ㄦ埛|棣栭〉|瀵艰埅|绠＄悊)/;
  assert.ok(!mojibakePattern.test(text), `${label} contains mojibake text`);
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

test('admin static files do not contain visible mojibake text', () => {
  assertNoMojibake(readProjectFile('admin/index.html'), 'admin/index.html');
  assertNoMojibake(readProjectFile('admin/login.html'), 'admin/login.html');
  assertNoMojibake(readProjectFile('admin/assets/js/admin.js'), 'admin/assets/js/admin.js');
});

test('admin script uses custom toast and confirm helpers instead of native dialogs', () => {
  const source = readProjectFile('admin/assets/js/admin.js');
  assert.ok(source.includes('function showToast('));
  assert.ok(source.includes('function showConfirm('));
  assert.strictEqual(countMatches(source, /\balert\s*\(/g), 0);
  assert.strictEqual(countMatches(source, /\bconfirm\s*\(/g), 0);
});

test('admin has a single link icon renderer implementation', () => {
  const source = readProjectFile('admin/assets/js/admin.js');
  assert.strictEqual(countMatches(source, /function renderLinkIcon\s*\(/g), 1);
});

test('admin modal templates escape attribute and textarea values', () => {
  const source = readProjectFile('admin/assets/js/admin.js');
  assert.ok(source.includes('function escapeAttribute('));
  assert.ok(source.includes('escapeAttribute(category.name'));
  assert.ok(source.includes('escapeAttribute(link.title'));
  assert.ok(source.includes('escapeHtml(link.description'));
  assert.ok(source.includes('escapeAttribute(announcement.title'));
  assert.ok(source.includes('escapeHtml(announcement.content'));
});

test('admin page contains toast and confirm containers', () => {
  const html = readProjectFile('admin/index.html');
  assert.ok(html.includes('adminToastContainer'));
  assert.ok(html.includes('confirmModal'));
});
