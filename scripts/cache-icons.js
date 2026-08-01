const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const dbPath = process.env.DB_PATH || path.join(projectRoot, 'server/database/db.json');
const iconDir = path.join(projectRoot, 'public/assets/icons/sites');
const publicIconPrefix = '/assets/icons/sites';

const fallbackColors = [
  '#2563eb',
  '#7c3aed',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#4f46e5',
  '#0f766e'
];

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 48) || 'site';
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

function getExtension(response, url) {
  const contentType = response.headers.get('content-type') || '';
  const pathname = new URL(url).pathname.toLowerCase();
  const fromPath = path.extname(pathname).replace('.', '');

  if (contentType.includes('png')) return 'png';
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpg';
  if (contentType.includes('webp')) return 'webp';
  if (contentType.includes('gif')) return 'gif';
  if (contentType.includes('x-icon') || contentType.includes('image/vnd.microsoft.icon')) return 'ico';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'ico'].includes(fromPath)) {
    return fromPath === 'jpeg' ? 'jpg' : fromPath;
  }

  return 'png';
}

function fallbackSvg(link, outputBase) {
  const initial = [...String(link.title || '?').trim()][0] || '?';
  const color = fallbackColors[link.id % fallbackColors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="${color}"/>
  <text x="64" y="74" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" font-weight="700" fill="#fff">${escapeXml(initial.toUpperCase())}</text>
</svg>
`;
  const filePath = `${outputBase}.svg`;
  fs.writeFileSync(filePath, svg, 'utf8');
  return `${publicIconPrefix}/${path.basename(filePath)}`;
}

async function downloadIcon(url, outputBase) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 research-nav icon cache'
    },
    signal: AbortSignal.timeout(2500)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/')) {
    throw new Error(`not an image: ${contentType}`);
  }

  if (contentType.includes('svg')) {
    throw new Error('skip remote svg');
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 32) {
    throw new Error('image too small');
  }

  const extension = getExtension(response, url);
  const filePath = `${outputBase}.${extension}`;
  fs.writeFileSync(filePath, buffer);
  return `${publicIconPrefix}/${path.basename(filePath)}`;
}

function candidateUrls(link) {
  const candidates = [];
  const icon = String(link.icon || '').trim();
  const hostname = getHostname(link.url);

  if (/^https?:\/\//i.test(icon)) {
    candidates.push(icon);
  }

  if (hostname) {
    candidates.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`);
    candidates.push(`https://icons.duckduckgo.com/ip3/${hostname}.ico`);

    try {
      const origin = new URL(link.url).origin;
      candidates.push(`${origin}/favicon.ico`);
    } catch {
      // ignore invalid URLs
    }
  }

  return [...new Set(candidates)];
}

async function processLink(link) {
  const outputBase = path.join(iconDir, `link-${String(link.id).padStart(3, '0')}-${slugify(link.title)}`);

  if (String(link.icon || '').startsWith(publicIconPrefix)) {
    return { status: 'skipped', icon: link.icon };
  }

  for (const url of candidateUrls(link)) {
    try {
      const icon = await downloadIcon(url, outputBase);
      return { status: 'downloaded', icon };
    } catch {
      // Try the next candidate.
    }
  }

  return { status: 'generated', icon: fallbackSvg(link, outputBase) };
}

async function cacheIcons() {
  fs.mkdirSync(iconDir, { recursive: true });

  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  let downloaded = 0;
  let generated = 0;
  let skipped = 0;
  const batchSize = 16;

  for (let index = 0; index < data.links.length; index += batchSize) {
    const batch = data.links.slice(index, index + batchSize);
    const results = await Promise.all(batch.map(processLink));

    results.forEach((result, batchIndex) => {
      const link = batch[batchIndex];
      link.icon = result.icon;
      if (result.status === 'downloaded') downloaded++;
      if (result.status === 'generated') generated++;
      if (result.status === 'skipped') skipped++;
    });

    console.log(`已处理 ${Math.min(index + batch.length, data.links.length)}/${data.links.length}`);
  }

  for (const category of data.categories) {
    if (category.icon === 'fa-robot') category.icon = 'fa-flask';
    if (category.icon === 'fa-brain') category.icon = 'fa-bolt';
    if (category.icon === 'fa-microchip') category.icon = 'fa-cogs';
  }

  fs.writeFileSync(dbPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

  console.log(`图标缓存完成：下载 ${downloaded} 个，生成占位 ${generated} 个，跳过 ${skipped} 个。`);
}

cacheIcons().catch(error => {
  console.error('图标缓存失败:', error);
  process.exit(1);
});
