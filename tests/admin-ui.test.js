const assert = require('assert');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

function assertNoMojibake(text, label) {
  const mojibakePattern = /(绉|鍚|鐧|璧勬簮|涔辩爜|闂ㄦ埛|棣栭〉|瀵艰埅|绠＄悊|鍛樼櫥|褰|绯荤粺|閫€)/;
  assert.ok(!mojibakePattern.test(text), `${label} contains mojibake text`);
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

test('admin static HTML does not contain visible mojibake text', () => {
  assertNoMojibake(readProjectFile('admin/index.html'), 'admin/index.html');
  assertNoMojibake(readProjectFile('admin/login.html'), 'admin/login.html');
});

test('admin login and shell contain readable Chinese copy', () => {
  const login = readProjectFile('admin/login.html');
  const index = readProjectFile('admin/index.html');

  ['管理员登录', '科研导航网站后台管理', '用户名', '密码', '登录'].forEach((copy) => {
    assert.ok(login.includes(copy), `admin/login.html is missing ${copy}`);
  });

  ['仪表盘', '分类管理', '链接管理', '公告管理', '修改密码', '退出登录', '确认操作', '关闭', '确定继续吗？', '取消', '确定'].forEach((copy) => {
    assert.ok(index.includes(copy), `admin/index.html is missing ${copy}`);
  });
});

test('admin script uses custom toast and confirm helpers instead of native dialogs', () => {
  const source = readProjectFile('admin/assets/js/admin.js');
  assert.ok(source.includes('function showToast('));
  assert.ok(source.includes('function showConfirm('));
  assert.ok(source.includes('bootstrap.Modal'));
  assert.strictEqual(countMatches(source, /\balert\s*\(/g), 0);
  assert.strictEqual(countMatches(source, /\bconfirm\s*\(/g), 0);
  assert.strictEqual(countMatches(source, /\bshowAlert\s*\(/g), 0);
});

test('admin has a single link icon renderer implementation', () => {
  const source = readProjectFile('admin/assets/js/admin.js');
  assert.strictEqual(countMatches(source, /function renderLinkIcon\s*\(/g), 1);
});

test('admin modal templates escape attribute and textarea values', () => {
  const source = readProjectFile('admin/assets/js/admin.js');
  assert.ok(source.includes('function escapeAttribute('));
  assert.ok(source.includes("replace(/`/g, '&#96;')"));
  assert.ok(source.includes('escapeAttribute(category.name'));
  assert.ok(source.includes('escapeAttribute(category.icon'));
  assert.ok(source.includes('safeCategorySortOrder'));
  assert.ok(source.includes('escapeAttribute(link.title'));
  assert.ok(source.includes('escapeHtml(link.description'));
  assert.ok(source.includes('escapeAttribute(announcement.title'));
  assert.ok(source.includes('escapeHtml(announcement.content'));
});

test('admin toast messages preserve operation context', () => {
  const source = readProjectFile('admin/assets/js/admin.js');

  [
    '分类保存成功',
    '分类删除成功',
    '链接保存成功',
    '链接删除成功',
    '公告保存成功',
    '公告删除成功',
    '密码修改成功，请重新登录',
    '加载数据失败',
    '删除失败，请稍后重试',
    '修改密码失败，请检查原密码'
  ].forEach((message) => {
    assert.ok(source.includes(message), `admin.js is missing ${message}`);
  });
});

test('admin page contains toast and Bootstrap 5 confirm containers', () => {
  const html = readProjectFile('admin/index.html');
  assert.ok(html.includes('adminToastContainer'));
  assert.ok(html.includes('confirmModal'));
  assert.match(
    html,
    /id="confirmModal"[\s\S]*?<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="关闭">/
  );
});
