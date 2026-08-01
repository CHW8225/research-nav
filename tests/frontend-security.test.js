const assert = require('assert');
const fs = require('fs');
const path = require('path');
const test = require('node:test');
const vm = require('vm');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

function assertNoMojibake(text, label) {
  const mojibakePattern = /(绉|鍚|鐧|璧勬簮|涔辩爜|闂ㄦ埛|棣栭〉|瀵艰埅)/;
  assert.ok(!mojibakePattern.test(text), `${label} contains mojibake text`);
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

function loadMainJs() {
  const source = fs.readFileSync(path.join(__dirname, '../public/assets/js/main.js'), 'utf8');
  const noopChain = {
    ready() { return this; },
    on() { return this; },
    html() { return this; },
    text() { return this; },
    val() { return ''; },
    trim() { return ''; },
    addClass() { return this; },
    removeClass() { return this; },
    animate() { return this; },
    scrollTop() { return 0; },
    modal() { return this; },
    closest() { return { length: 0 }; }
  };
  const sandbox = {
    console,
    document: {},
    window: { open() {} },
    localStorage: { getItem() { return null; }, setItem() {} },
    $() { return noopChain; }
  };
  sandbox.$.ajax = () => {};
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  return sandbox;
}

test('front-end link card rendering escapes user controlled text', () => {
  const sandbox = loadMainJs();
  const html = sandbox.renderLinkCards([{
    id: 1,
    title: '<img src=x onerror=alert(1)>',
    description: '<script>alert(1)</script>',
    icon: ''
  }]);

  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
});

test('front-end icon renderer supports local icon paths', () => {
  const sandbox = loadMainJs();
  const html = sandbox.renderIcon('/assets/icons/sites/example.svg');

  assert.ok(html.includes('src="/assets/icons/sites/example.svg"'));
  assert.ok(html.includes('class="link-icon"'));
});

test('front-end icon renderer rejects untrusted image sources', () => {
  const sandbox = loadMainJs();

  for (const iconUrl of ['javascript:alert(1)', 'data:image/svg+xml,<svg>', 'https://example.com/icon.svg']) {
    const html = sandbox.renderIcon(iconUrl);
    assert.ok(html.includes('link-icon-placeholder'));
    assert.ok(!html.includes('<img'));
  }
});

test('public files do not contain visible mojibake text', () => {
  assertNoMojibake(readProjectFile('public/index.html'), 'public/index.html');
  assertNoMojibake(readProjectFile('public/assets/js/main.js'), 'public/assets/js/main.js');
});

test('front-end has a single icon renderer implementation', () => {
  const source = readProjectFile('public/assets/js/main.js');
  assert.strictEqual(countMatches(source, /function renderIcon\s*\(/g), 1);
});

test('links container is not a Bootstrap row without column children', () => {
  const html = readProjectFile('public/index.html');
  assert.doesNotMatch(html, /id="linksContainer"[^>]*\bclass="[^"]*\brow\b/);
});

test('home page contains A+ hero structure', () => {
  const html = readProjectFile('public/index.html');
  assert.ok(html.includes('research-hero'));
  assert.ok(html.includes('site-stats'));
  assert.ok(html.includes('搜索科研工具、网站或关键词'));
});
