const assert = require('assert');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

test('link and category icons are local or Font Awesome 4 compatible', () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../server/database/db.json'), 'utf8'));
  const emptyLinkIcons = data.links.filter(link => !(link.icon || '').trim());
  const nonLocalLinkIcons = data.links.filter(link => {
    const icon = (link.icon || '').trim();
    return icon && !icon.startsWith('/assets/icons/sites/');
  });
  const unsupportedCategoryIcons = data.categories.filter(category =>
    ['fa-robot', 'fa-brain', 'fa-microchip'].includes(category.icon)
  );

  assert.strictEqual(emptyLinkIcons.length, 0);
  assert.strictEqual(nonLocalLinkIcons.length, 0);
  assert.strictEqual(unsupportedCategoryIcons.length, 0);
});
