const assert = require('assert');
const fs = require('fs');
const path = require('path');
const test = require('node:test');
const vm = require('vm');

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
