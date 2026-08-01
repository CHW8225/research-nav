# A+ Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复科研导航网站第二轮遗留问题，并把前台升级成“清爽科研风 + 首页更大气”的 A+ 视觉效果。

**Architecture:** 保持现有静态前台、静态后台、Express API、LowDB JSON 数据库结构不变。所有改动集中在现有 HTML、CSS、jQuery 文件和 Node 内置测试中，通过小范围模板修复、CSS 升级、交互辅助函数和回归测试完成。

**Tech Stack:** Node.js, Express, LowDB, Bootstrap 4, Font Awesome 4.7, jQuery, Node built-in test runner.

## Global Constraints

- 不删除、不重排现有分类和链接。
- 不大改数据库结构。
- 不改现有 API 路径。
- 不做完整品牌设计系统。
- 不做公开部署。
- 不引入新的前端框架或复杂构建链路。
- 图标继续使用本地路径优先。
- 上传 SVG 仍保持禁用。
- 生产环境 `JWT_SECRET` 规则保持第一轮结果。
- 提交时不要混入无关运行时数据、临时文件、未跟踪垃圾文件。

---

## File Structure

- Modify `tests/frontend-security.test.js`
  - 增加前台乱码、重复 `renderIcon`、公告转义和 HTML 静态结构检查。
- Create `tests/admin-ui.test.js`
  - 增加后台乱码、重复 `renderLinkIcon`、原生弹窗移除、关键 UI helper 存在、弹窗模板转义检查。
- Modify `public/index.html`
  - 恢复正常中文文案，微调首页结构，增加 A+ hero 所需 class 和统计展示容器。
- Modify `public/assets/css/style.css`
  - 完成 A+ 首页、搜索、分类、卡片、图标、空状态、响应式视觉升级。
- Modify `public/assets/js/main.js`
  - 清理重复 `renderIcon`，保留本地图标支持，补齐首页统计展示和空状态文案。
- Modify `admin/login.html`
  - 恢复正常中文文案，保留现有登录表单接口和字段。
- Modify `admin/index.html`
  - 恢复正常中文文案，增加 toast 和 confirm 容器。
- Modify `admin/assets/css/admin.css`
  - 完成后台登录页、toast、确认弹窗和基础视觉优化。
- Modify `admin/assets/js/admin.js`
  - 清理重复 `renderLinkIcon`，新增 `escapeAttribute`、`showToast`、`showConfirm`，替换原生 `alert()` / `confirm()`，补齐后台弹窗字段转义。

---

### Task 1: Add regression tests before UI changes

**Files:**
- Modify: `tests/frontend-security.test.js`
- Create: `tests/admin-ui.test.js`

**Interfaces:**
- Consumes: file text from `public/index.html`, `public/assets/js/main.js`, `admin/index.html`, `admin/login.html`, `admin/assets/js/admin.js`
- Produces: regression checks used by Tasks 2-4:
  - `assertNoMojibake(text, label)`
  - `countMatches(text, pattern)`
  - admin UI tests that fail until native dialogs are replaced

- [ ] **Step 1: Add file-text helper checks to `tests/frontend-security.test.js`**

Append these helpers near the top of `tests/frontend-security.test.js`, after the existing `require` lines:

```js
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
```

- [ ] **Step 2: Add front-end static regression tests**

Append these tests to `tests/frontend-security.test.js`:

```js
test('public files do not contain visible mojibake text', () => {
  assertNoMojibake(readProjectFile('public/index.html'), 'public/index.html');
  assertNoMojibake(readProjectFile('public/assets/js/main.js'), 'public/assets/js/main.js');
});

test('front-end has a single icon renderer implementation', () => {
  const source = readProjectFile('public/assets/js/main.js');
  assert.strictEqual(countMatches(source, /function renderIcon\s*\(/g), 1);
});

test('home page contains A+ hero structure', () => {
  const html = readProjectFile('public/index.html');
  assert.ok(html.includes('research-hero'));
  assert.ok(html.includes('site-stats'));
  assert.ok(html.includes('搜索科研工具、网站或关键词'));
});
```

- [ ] **Step 3: Create `tests/admin-ui.test.js`**

Create `tests/admin-ui.test.js` with:

```js
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
```

- [ ] **Step 4: Run tests and verify the new tests fail for the intended reasons**

Run:

```powershell
npm test
```

Expected before implementation:

- At least one failure about mojibake text.
- At least one failure about duplicate icon renderer or missing A+ hero structure.
- At least one failure about native `alert()` / `confirm()` or missing admin containers.

- [ ] **Step 5: Commit the failing regression tests**

Only commit test files:

```powershell
git add -- tests/frontend-security.test.js tests/admin-ui.test.js
git commit -m "test: add A+ polish regression coverage"
```

If committing failing tests feels too disruptive for the branch, skip this commit and keep the tests staged only until Task 4 makes them pass. Do not remove the tests.

---

### Task 2: Implement A+ front-end home page polish

**Files:**
- Modify: `public/index.html`
- Modify: `public/assets/css/style.css`
- Modify: `public/assets/js/main.js`
- Test: `tests/frontend-security.test.js`

**Interfaces:**
- Consumes:
  - Existing APIs loaded by `main.js`: `/api/categories`, `/api/links`, `/api/announcements`
  - Existing globals: `allCategories`, `allLinks`, `currentCategory`, `searchKeyword`
- Produces:
  - `renderIcon(iconUrl)` with one implementation
  - `renderLinkCards(links)` still returning escaped link card HTML
  - DOM elements: `.research-hero`, `.site-stats`, `#totalLinksStat`, `#totalCategoriesStat`

- [ ] **Step 1: Read the current front-end files before editing**

Run:

```powershell
Get-Content public\index.html -Raw
Get-Content public\assets\css\style.css -Raw
Get-Content public\assets\js\main.js -Raw
```

Confirm the current element IDs used by `main.js` remain available after editing:

- `#searchInput`
- `#categoryList`
- `#linksContainer`
- `#announcementContent`

- [ ] **Step 2: Restore readable Chinese and add A+ hero structure in `public/index.html`**

Keep existing script and stylesheet includes. Update the visible body structure so it includes these stable elements:

```html
<section class="research-hero">
  <div class="hero-glow hero-glow-left"></div>
  <div class="hero-glow hero-glow-right"></div>
  <div class="container hero-content">
    <div class="hero-badge">
      <i class="fa fa-flask"></i>
      科研工具导航 · 本地图标缓存
    </div>
    <h1>让科研资源更好找，也更好看</h1>
    <p class="hero-subtitle">整理论文检索、AI 写作、数据分析、绘图制图、期刊投稿等常用科研入口。</p>
    <div class="search-box hero-search">
      <i class="fa fa-search search-icon"></i>
      <input type="text" id="searchInput" class="form-control" placeholder="搜索科研工具、网站或关键词">
    </div>
    <div class="site-stats">
      <div class="stat-pill"><strong id="totalLinksStat">158</strong><span>个工具链接</span></div>
      <div class="stat-pill"><strong id="totalCategoriesStat">23</strong><span>个科研分类</span></div>
      <div class="stat-pill"><strong>本地</strong><span>图标优先加载</span></div>
    </div>
  </div>
</section>
```

Keep the category and link containers:

```html
<section class="category-section">
  <div class="container">
    <div id="categoryList" class="category-list"></div>
  </div>
</section>

<main class="container links-main">
  <div id="linksContainer" class="row"></div>
</main>
```

- [ ] **Step 3: Add A+ front-end CSS**

In `public/assets/css/style.css`, add or replace the relevant visual rules with this foundation:

```css
:root {
  --primary: #2563eb;
  --primary-dark: #1d4ed8;
  --accent: #7c3aed;
  --ink: #0f172a;
  --muted: #64748b;
  --line: #e2e8f0;
  --surface: #ffffff;
  --soft: #f8fafc;
  --shadow-soft: 0 16px 42px rgba(15, 23, 42, 0.08);
  --shadow-card: 0 12px 28px rgba(15, 23, 42, 0.07);
}

body {
  background: linear-gradient(180deg, #f8fbff 0%, #f8fafc 46%, #ffffff 100%);
  color: var(--ink);
}

.research-hero {
  position: relative;
  overflow: hidden;
  padding: 86px 0 56px;
  background:
    radial-gradient(circle at 16% 18%, rgba(96, 165, 250, 0.32), transparent 30%),
    radial-gradient(circle at 84% 10%, rgba(168, 85, 247, 0.24), transparent 28%),
    linear-gradient(135deg, #f8fbff 0%, #eef6ff 54%, #f7f3ff 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 900px;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: var(--primary);
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.12);
}

.research-hero h1 {
  margin: 18px 0 12px;
  font-size: clamp(2.2rem, 5vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.05em;
}

.hero-subtitle {
  max-width: 680px;
  margin: 0 auto 28px;
  color: var(--muted);
  font-size: 1.08rem;
}

.hero-search {
  max-width: 720px;
  margin: 0 auto;
  background: var(--surface);
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 999px;
  box-shadow: 0 20px 45px rgba(30, 64, 175, 0.16);
}

.site-stats {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 22px;
}

.stat-pill {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(226, 232, 240, 0.9);
  color: var(--muted);
}

.stat-pill strong {
  color: var(--primary-dark);
}
```

Then adjust existing category/card rules to match this style:

```css
.category-list .category-item,
.category-pill {
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: #475569;
  transition: all 0.18s ease;
}

.category-list .category-item.active,
.category-pill.active {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.22);
}

.link-card {
  height: 100%;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.link-card:hover {
  transform: translateY(-4px);
  border-color: rgba(37, 99, 235, 0.28);
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.11);
}

.link-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid var(--line);
}

.link-icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.empty-state {
  width: 100%;
  padding: 58px 20px;
  text-align: center;
  color: var(--muted);
}

@media (max-width: 768px) {
  .research-hero {
    padding: 64px 0 42px;
  }

  .hero-search {
    border-radius: 22px;
  }
}
```

If existing selectors differ, adapt the rules to the current names while preserving the intent and the test-required `.research-hero` / `.site-stats` classes.

- [ ] **Step 4: Clean `renderIcon` in `public/assets/js/main.js`**

Keep only one `renderIcon` function. Use this implementation:

```js
function renderIcon(iconUrl) {
  if (!iconUrl) {
    return '<div class="link-icon-wrapper link-icon-placeholder"><i class="fa fa-link"></i></div>';
  }

  const safeIconUrl = escapeHtml(iconUrl);
  return `
    <div class="link-icon-wrapper">
      <img src="${safeIconUrl}" alt="" class="link-icon" loading="lazy" onerror="this.parentElement.classList.add('link-icon-placeholder'); this.remove();">
    </div>
  `;
}
```

Do not leave the older duplicate function in the file.

- [ ] **Step 5: Update front-end stats after data loads**

Add this helper to `public/assets/js/main.js`:

```js
function updateSiteStats() {
  $('#totalLinksStat').text(allLinks.length || 0);
  $('#totalCategoriesStat').text(allCategories.length || 0);
}
```

Call it after both categories and links have loaded. If the current loading flow has separate `loadCategories()` and `loadLinks()`, call `updateSiteStats()` at the end of each function so the numbers settle once both arrays are populated.

- [ ] **Step 6: Verify front-end checks**

Run:

```powershell
node --check public\assets\js\main.js
node --test tests\frontend-security.test.js
```

Expected: both commands pass.

- [ ] **Step 7: Commit front-end polish**

```powershell
git add -- public/index.html public/assets/css/style.css public/assets/js/main.js tests/frontend-security.test.js
git commit -m "polish: refresh public homepage"
```

Before committing, run:

```powershell
git diff --cached --name-only
```

Expected staged files only:

- `public/index.html`
- `public/assets/css/style.css`
- `public/assets/js/main.js`
- `tests/frontend-security.test.js`

---

### Task 3: Restore and polish admin static UI

**Files:**
- Modify: `admin/login.html`
- Modify: `admin/index.html`
- Modify: `admin/assets/css/admin.css`
- Test: `tests/admin-ui.test.js`

**Interfaces:**
- Consumes:
  - Existing login form IDs used by `admin/assets/js/admin.js`
  - Existing admin page containers used by the router in `admin.js`
- Produces:
  - `#adminToastContainer`
  - `#confirmModal`
  - readable Chinese admin and login copy

- [ ] **Step 1: Read admin HTML and CSS before editing**

Run:

```powershell
Get-Content admin\login.html -Raw
Get-Content admin\index.html -Raw
Get-Content admin\assets\css\admin.css -Raw
```

Record existing form and content IDs. Preserve the IDs currently used by `admin/assets/js/admin.js`, including login fields and `#modalBody`.

- [ ] **Step 2: Restore readable Chinese in `admin/login.html`**

Update visible login copy to this meaning while preserving existing IDs and script includes:

```html
<h2>管理员登录</h2>
<p class="login-subtitle">科研导航网站后台管理</p>
<input type="text" id="username" class="form-control" placeholder="用户名" autocomplete="username">
<input type="password" id="password" class="form-control" placeholder="密码" autocomplete="current-password">
<button type="submit" class="btn btn-primary btn-block">登录</button>
```

Use normal readable Chinese for loading and error messages, such as:

```html
<div id="loginError" class="alert alert-danger d-none" role="alert"></div>
```

- [ ] **Step 3: Restore readable Chinese and add containers in `admin/index.html`**

Keep the existing Bootstrap modal for edit forms. Add these containers before `</body>`:

```html
<div id="adminToastContainer" class="admin-toast-container" aria-live="polite" aria-atomic="true"></div>

<div class="modal fade" id="confirmModal" tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content confirm-modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="confirmModalTitle">确认操作</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="关闭">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" id="confirmModalMessage">确定继续吗？</div>
      <div class="modal-footer">
        <button type="button" class="btn btn-light" id="confirmModalCancel">取消</button>
        <button type="button" class="btn btn-danger" id="confirmModalOk">确定</button>
      </div>
    </div>
  </div>
</div>
```

Use readable Chinese for sidebar and table headings:

- 仪表盘
- 分类管理
- 链接管理
- 公告管理
- 修改密码
- 退出登录

- [ ] **Step 4: Add admin polish CSS**

In `admin/assets/css/admin.css`, add:

```css
.login-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 20% 16%, rgba(96, 165, 250, 0.30), transparent 30%),
    radial-gradient(circle at 82% 12%, rgba(124, 58, 237, 0.22), transparent 28%),
    linear-gradient(135deg, #f8fbff 0%, #eef6ff 54%, #f7f3ff 100%);
}

.login-card,
.admin-card,
.content-card {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 16px 42px rgba(15, 23, 42, 0.08);
}

.login-subtitle {
  color: #64748b;
  margin-bottom: 24px;
}

.admin-toast-container {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.admin-toast {
  min-width: 240px;
  max-width: 360px;
  padding: 12px 14px;
  border-radius: 14px;
  color: #0f172a;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.14);
  pointer-events: auto;
}

.admin-toast-success {
  border-left: 4px solid #22c55e;
}

.admin-toast-error {
  border-left: 4px solid #ef4444;
}

.admin-toast-info {
  border-left: 4px solid #2563eb;
}

.confirm-modal-content {
  border: 0;
  border-radius: 18px;
  box-shadow: 0 20px 52px rgba(15, 23, 42, 0.18);
}
```

If existing class names differ, add these classes without removing existing rules that are still used.

- [ ] **Step 5: Verify admin static tests still fail only because JS is not done**

Run:

```powershell
node --test tests\admin-ui.test.js
```

Expected after this task but before Task 4:

- Mojibake and container tests pass.
- Tests for `showToast`, `showConfirm`, native dialogs, duplicate `renderLinkIcon`, or escaping may still fail.

- [ ] **Step 6: Commit admin static UI**

```powershell
git add -- admin/login.html admin/index.html admin/assets/css/admin.css tests/admin-ui.test.js
git commit -m "polish: refresh admin shell"
```

Before committing:

```powershell
git diff --cached --name-only
```

Expected staged files only:

- `admin/login.html`
- `admin/index.html`
- `admin/assets/css/admin.css`
- `tests/admin-ui.test.js`

---

### Task 4: Replace admin native dialogs and harden modal escaping

**Files:**
- Modify: `admin/assets/js/admin.js`
- Test: `tests/admin-ui.test.js`

**Interfaces:**
- Consumes:
  - `#adminToastContainer`
  - `#confirmModal`
  - `#confirmModalTitle`
  - `#confirmModalMessage`
  - `#confirmModalCancel`
  - `#confirmModalOk`
- Produces:
  - `escapeHtml(value)`
  - `escapeAttribute(value)`
  - `showToast(message, type = 'info')`
  - `showConfirm(message, options = {})`
  - one `renderLinkIcon(icon)` implementation

- [ ] **Step 1: Read `admin/assets/js/admin.js` before editing**

Run:

```powershell
Get-Content admin\assets\js\admin.js -Raw
```

Find current native dialogs and duplicate renderer:

```powershell
rg -n "alert\\(|confirm\\(|function renderLinkIcon|showCategoryModal|showLinkModal|showAnnouncementModal" admin\assets\js\admin.js
```

- [ ] **Step 2: Add attribute escaping helper**

Keep the existing `escapeHtml` behavior if present. Add this helper next to it:

```js
function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}
```

Use `escapeAttribute()` for values inserted into HTML attributes, and `escapeHtml()` for text nodes and textarea contents.

- [ ] **Step 3: Add toast helper**

Add this helper near other shared UI helpers:

```js
function showToast(message, type = 'info') {
  const container = $('#adminToastContainer');
  const safeMessage = escapeHtml(message);
  const safeType = ['success', 'error', 'info'].includes(type) ? type : 'info';
  const toast = $(`
    <div class="admin-toast admin-toast-${safeType}" role="status">
      ${safeMessage}
    </div>
  `);

  container.append(toast);
  setTimeout(() => {
    toast.fadeOut(180, function () {
      $(this).remove();
    });
  }, 2600);
}
```

Replace validation and success/failure `alert()` calls with:

```js
showToast('请填写必填项', 'error');
showToast('保存成功', 'success');
showToast('操作失败，请稍后重试', 'error');
```

Use the nearest existing message meaning rather than changing behavior.

- [ ] **Step 4: Add confirm helper**

Add this Promise-based helper:

```js
function showConfirm(message, options = {}) {
  const title = options.title || '确认操作';
  const confirmText = options.confirmText || '确定';
  const cancelText = options.cancelText || '取消';
  const danger = options.danger !== false;

  $('#confirmModalTitle').text(title);
  $('#confirmModalMessage').text(message);
  $('#confirmModalOk').text(confirmText).toggleClass('btn-danger', danger).toggleClass('btn-primary', !danger);
  $('#confirmModalCancel').text(cancelText);

  return new Promise(resolve => {
    $('#confirmModalOk').off('click.confirm').on('click.confirm', () => {
      $('#confirmModal').modal('hide');
      resolve(true);
    });
    $('#confirmModalCancel, #confirmModal .close').off('click.confirm').on('click.confirm', () => {
      $('#confirmModal').modal('hide');
      resolve(false);
    });
    $('#confirmModal').off('hidden.bs.modal.confirm').on('hidden.bs.modal.confirm', () => {
      resolve(false);
    });
    $('#confirmModal').modal('show');
  });
}
```

When replacing `confirm()`, make the caller `async`. Example:

```js
async function deleteCategory(id) {
  const confirmed = await showConfirm('确定要删除这个分类吗？', {
    title: '删除分类',
    confirmText: '删除'
  });
  if (!confirmed) return;

  // keep the existing delete request body here
}
```

Apply the same pattern to:

- logout confirmation
- delete category
- delete link
- delete announcement

- [ ] **Step 5: Clean duplicate `renderLinkIcon`**

Keep only this implementation:

```js
function renderLinkIcon(icon) {
  if (!icon) {
    return '<span class="admin-link-icon-placeholder"><i class="fa fa-link"></i></span>';
  }

  const safeIcon = escapeAttribute(icon);
  return `<img src="${safeIcon}" alt="" class="admin-link-icon" onerror="this.replaceWith(document.createTextNode('🔗'));">`;
}
```

Do not leave an older duplicate function in the file.

- [ ] **Step 6: Harden modal templates**

In `showCategoryModal`, use:

```js
const safeName = escapeAttribute(category.name || '');
const safeIcon = escapeAttribute(category.icon || '');
const safeDescription = escapeHtml(category.description || '');
```

Then use:

```html
value="${safeName}"
value="${safeIcon}"
${safeDescription}
```

In `showLinkModal`, use:

```js
const safeTitle = escapeAttribute(link.title || '');
const safeUrl = escapeAttribute(link.url || '');
const safeIcon = escapeAttribute(link.icon || '');
const safeDescription = escapeHtml(link.description || '');
const safeCategoryId = String(link.categoryId || '');
```

For category option labels, use `escapeHtml(category.name || '')`. For selected values, compare string values:

```js
const selected = String(category.id) === safeCategoryId ? 'selected' : '';
```

In `showAnnouncementModal`, use:

```js
const safeTitle = escapeAttribute(announcement.title || '');
const safeContent = escapeHtml(announcement.content || '');
```

Use `safeContent` inside `<textarea>`.

- [ ] **Step 7: Verify admin JS**

Run:

```powershell
node --check admin\assets\js\admin.js
node --test tests\admin-ui.test.js
```

Expected: both commands pass.

- [ ] **Step 8: Commit admin JS hardening**

```powershell
git add -- admin/assets/js/admin.js tests/admin-ui.test.js
git commit -m "fix: improve admin dialogs and escaping"
```

Before committing:

```powershell
git diff --cached --name-only
```

Expected staged files only:

- `admin/assets/js/admin.js`
- `tests/admin-ui.test.js`

---

### Task 5: Full verification and final cleanup

**Files:**
- Inspect: all modified files
- Do not stage: `server/database/db.json`, `.superpowers-start.out`, `.superpowers-start.err`, `cd`, `dir`, unrelated icon files unless intentionally changed by an implementation task

**Interfaces:**
- Consumes: completed Tasks 1-4
- Produces: verified A+ branch ready for user review

- [ ] **Step 1: Run static JS checks**

Run:

```powershell
node --check server\app.js
node --check public\assets\js\main.js
node --check admin\assets\js\admin.js
```

Expected: all pass with exit code 0.

- [ ] **Step 2: Run full automated tests**

Run:

```powershell
npm test
```

Expected: all tests pass.

- [ ] **Step 3: Run audit**

Run:

```powershell
npm audit --omit=dev --registry=https://registry.npmjs.org
```

Expected: no production vulnerabilities, or document the exact advisory output if npm reports one.

- [ ] **Step 4: Start smoke server on a non-conflicting port**

Use a temporary DB copy so manual checks do not dirty `server/database/db.json`:

```powershell
$tmpDir = New-Item -ItemType Directory -Path (Join-Path $env:TEMP ("research-nav-a-plus-" + [guid]::NewGuid().ToString()))
$tmpDb = Join-Path $tmpDir.FullName 'db.json'
Copy-Item -LiteralPath 'server\database\db.json' -Destination $tmpDb
$env:PORT = '3308'
$env:DB_PATH = $tmpDb
$env:JWT_SECRET = 'test-secret'
$env:NODE_ENV = 'test'
npm start
```

If `npm start` blocks in the terminal, open a second terminal or use the existing local server only for browser viewing. Do not kill unrelated Node processes.

- [ ] **Step 5: Verify key API counts**

In a second PowerShell session while the smoke server is running:

```powershell
$base = 'http://127.0.0.1:3308'
(Invoke-RestMethod "$base/api/health").status
(Invoke-RestMethod "$base/api/categories").Count
(Invoke-RestMethod "$base/api/links").Count
```

Expected:

```text
ok
23
158
```

- [ ] **Step 6: Verify login and password contract on temp DB**

Run:

```powershell
$base = 'http://127.0.0.1:3308'
$login = Invoke-RestMethod "$base/api/auth/login" -Method Post -ContentType 'application/json' -Body '{"username":"admin","password":"admin123"}'
$headers = @{ Authorization = "Bearer $($login.token)" }
(Invoke-RestMethod "$base/api/auth/me" -Headers $headers).username
Invoke-RestMethod "$base/api/auth/password" -Method Put -Headers $headers -ContentType 'application/json' -Body '{"oldPassword":"admin123","newPassword":"admin456"}'
```

Expected:

- username output is `admin`.
- password endpoint returns success.
- Because `DB_PATH` points to a temp copy, the real database is unchanged.

- [ ] **Step 7: Browser visual check**

Open:

```text
http://127.0.0.1:3308
http://127.0.0.1:3308/admin/login.html
```

Confirm:

- 首页是 A+ 风格：更大气 hero、突出搜索、清爽分类和卡片。
- 首页搜索能筛选链接。
- 分类切换能更新卡片。
- 本地图标能显示。
- 后台登录页中文正常。
- 后台登录后删除/退出类操作出现站内确认弹窗。
- 成功/失败提示出现 toast。

- [ ] **Step 8: Check git status and staged files**

Run:

```powershell
git status --short
git diff --check
```

Expected:

- No whitespace errors.
- Only intentional code/test/doc files are modified or committed.
- Do not stage `server/database/db.json` if it only contains click count changes.
- Do not stage `.superpowers-start.out`, `.superpowers-start.err`, `cd`, `dir`.

- [ ] **Step 9: Final commit if any verified changes remain uncommitted**

If Tasks 2-4 already committed all implementation work, skip this step. If verification fixes required small changes, commit only those files:

```powershell
git add -- public/index.html public/assets/css/style.css public/assets/js/main.js admin/login.html admin/index.html admin/assets/css/admin.css admin/assets/js/admin.js tests/frontend-security.test.js tests/admin-ui.test.js
git commit -m "chore: finalize A+ polish verification"
```

- [ ] **Step 10: Report completion**

Final report must include:

- Changed files summary.
- Verification commands and pass/fail results.
- Any untracked or intentionally unstaged files that remain.
- Local URL used for visual check.
