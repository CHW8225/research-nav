// 全局变量
let categories = [];
let links = [];
let currentCategory = 'all';

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
}

function safeFaIcon(icon, fallback = 'fa-folder') {
    const value = String(icon || '').trim();
    return /^fa-[a-z0-9-]+$/i.test(value) ? value : fallback;
}

function isSafeImagePath(iconUrl) {
    return /^https?:\/\//i.test(iconUrl) ||
        iconUrl.startsWith('/assets/icons/') ||
        iconUrl.startsWith('/uploads/');
}

// 页面加载完成后执行
$(document).ready(function() {
    // 初始化
    init();

    // 绑定事件
    bindEvents();
});

// 初始化函数
function init() {
    // 加载分类和链接
    loadCategories();
    loadLinks();
    loadAnnouncements();
}

// 绑定事件
function bindEvents() {
    // 搜索按钮点击
    $('#searchBtn').on('click', performSearch);

    // 搜索输入框回车
    $('#searchInput').on('keypress', function(e) {
        if (e.which === 13) {
            performSearch();
        }
    });

    // 搜索输入实时建议
    $('#searchInput').on('input', function() {
        const keyword = $(this).val().trim();
        if (keyword.length >= 2) {
            showSearchSuggestions(keyword);
        } else {
            $('#searchSuggestions').removeClass('show');
        }
    });

    // 点击其他地方关闭搜索���议
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.search-box').length) {
            $('#searchSuggestions').removeClass('show');
        }
    });

    // 分类切换
    $(document).on('click', '.category-tab', function(e) {
        e.preventDefault();
        const categoryId = $(this).data('category-id');

        // 更新激活状态
        $('.category-tab').removeClass('active');
        $(this).addClass('active');

        // 显示对应分类的链接
        showLinksByCategory(categoryId);
    });

    // 返回顶部
    $(window).on('scroll', function() {
        if ($(this).scrollTop() > 300) {
            $('#backToTop').addClass('show');
        } else {
            $('#backToTop').removeClass('show');
        }
    });

    $('#backToTop').on('click', function() {
        $('html, body').animate({ scrollTop: 0 }, 500);
    });
}

// 加载分类
function loadCategories() {
    $.ajax({
        url: '/api/categories',
        method: 'GET',
        success: function(data) {
            categories = data;
            renderCategories();
        },
        error: function() {
            showError('加载分类失败');
        }
    });
}

// 渲染分类导航
function renderCategories() {
    const categoryList = $('#categoryList');

    // 添加"全部"选项
    let html = `
        <li class="nav-item">
            <a class="nav-link category-tab active" href="#" data-category-id="all">
                <i class="fa fa-th"></i> 全部
            </a>
        </li>
    `;

    // 添加各个分类
    categories.forEach(category => {
        const icon = safeFaIcon(category.icon);
        html += `
            <li class="nav-item">
                <a class="nav-link category-tab" href="#" data-category-id="${escapeAttribute(category.id)}">
                    <i class="fa ${icon}"></i> ${escapeHtml(category.name)}
                </a>
            </li>
        `;
    });

    categoryList.html(html);
}

// 加载链接
function loadLinks() {
    showLoading();

    $.ajax({
        url: '/api/links',
        method: 'GET',
        success: function(data) {
            links = data;
            renderAllLinks();
        },
        error: function() {
            showError('加载链接失败');
        }
    });
}

// 渲染所有链接
function renderAllLinks() {
    showLinksByCategory('all');
}

// 按分类显示链接
function showLinksByCategory(categoryId) {
    currentCategory = categoryId;

    let filteredLinks = links;

    // 如果不是"全部"，则过滤
    if (categoryId !== 'all') {
        filteredLinks = links.filter(link => link.category_id === parseInt(categoryId));
    }

    // 按分类分组显示
    if (categoryId === 'all') {
        renderLinksByCategory(filteredLinks);
    } else {
        renderLinks(filteredLinks);
    }
}

// 按分类分组渲染链接
function renderLinksByCategory(filteredLinks) {
    const container = $('#linksContainer');
    let html = '';

    // 获取有链接的分类
    const categoriesWithLinks = [...new Set(filteredLinks.map(link => link.category_id))];

    if (categoriesWithLinks.length === 0) {
        container.html('<div class="empty-state"><i class="fa fa-inbox"></i><p>暂无数据</p></div>');
        return;
    }

    // 为每个分类创建一个区块
    categoriesWithLinks.forEach(catId => {
        const category = categories.find(c => c.id === catId);
        if (!category) return;

        const categoryLinks = filteredLinks.filter(link => link.category_id === catId);

        html += `
            <div class="category-section">
                <h3 class="category-title">
                    <i class="fa ${safeFaIcon(category.icon)}"></i> ${escapeHtml(category.name)}
                    <span class="badge bg-primary ms-2">${categoryLinks.length}</span>
                </h3>
                <div class="links-grid">
                    ${renderLinkCards(categoryLinks)}
                </div>
            </div>
        `;
    });

    container.html(html);
}

// 渲染链接列表
function renderLinks(filteredLinks) {
    const container = $('#linksContainer');

    if (filteredLinks.length === 0) {
        container.html('<div class="empty-state"><i class="fa fa-inbox"></i><p>该分类暂无链接</p></div>');
        return;
    }

    container.html(`
        <div class="links-grid">
            ${renderLinkCards(filteredLinks)}
        </div>
    `);
}

// 渲染链接卡片
function renderLinkCards(linkList) {
    return linkList.map(link => {
        const pinnedClass = link.is_pinned === 1 ? 'pinned' : '';
        const iconHtml = renderIcon(link.icon);
        const title = escapeHtml(link.title);
        const description = escapeHtml(link.description || '暂无描述');

        return `
            <div class="link-card ${pinnedClass}" data-link-id="${escapeAttribute(link.id)}">
                ${iconHtml}
                <h5 class="link-title" title="${escapeAttribute(link.title)}">${title}</h5>
                <p class="link-description">${description}</p>
                <div class="link-stats">
                    <i class="fa fa-eye"></i> ${link.clicks || 0}
                </div>
            </div>
        `;
    }).join('');
}

// 渲染图标
function renderIcon(iconUrl) {
    iconUrl = String(iconUrl || '').trim();

    if (!iconUrl) {
        return '<div class="link-icon fa-icon"><i class="fa fa-link"></i></div>';
    }

    if (isSafeImagePath(iconUrl)) {
        return `<img src="${iconUrl}" alt="图标" class="link-icon" onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"%23666\" d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z\"/></svg>'">`;
    }

    // Font Awesome 图标
    if (iconUrl.startsWith('fa-')) {
        const iconClass = iconUrl.startsWith('fa-') ? iconUrl : 'fa-' + iconUrl;
        return `<div class="link-icon fa-icon"><i class="fa ${iconClass}"></i></div>`;
    }

    return '<div class="link-icon fa-icon"><i class="fa fa-link"></i></div>';
}

function renderIcon(iconUrl) {
    iconUrl = String(iconUrl || '').trim();

    if (!iconUrl) {
        return '<div class="link-icon fa-icon"><i class="fa fa-link"></i></div>';
    }

    if (isSafeImagePath(iconUrl)) {
        return `<img src="${escapeAttribute(iconUrl)}" alt="图标" class="link-icon" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><div class="link-icon fa-icon" style="display:none"><i class="fa fa-link"></i></div>`;
    }

    if (iconUrl.startsWith('fa-')) {
        const iconClass = safeFaIcon(iconUrl, 'fa-link');
        return `<div class="link-icon fa-icon"><i class="fa ${iconClass}"></i></div>`;
    }

    return '<div class="link-icon fa-icon"><i class="fa fa-link"></i></div>';
}

// 链接卡片点击事件
$(document).on('click', '.link-card', function() {
    const linkId = $(this).data('link-id');
    const link = links.find(l => l.id === linkId);

    if (link) {
        // 记录点击
        recordClick(linkId);

        // 打开链接
        window.open(link.url, '_blank');
    }
});

// 记录点击
function recordClick(linkId) {
    $.ajax({
        url: `/api/links/${linkId}/click`,
        method: 'POST',
        success: function() {
            // 更新本地点击数
            const link = links.find(l => l.id === linkId);
            if (link) {
                link.clicks = (link.clicks || 0) + 1;
            }
        },
        error: function() {
            // 静默失败，不影响用户体验
        }
    });
}

// 搜索功能
function performSearch() {
    const keyword = $('#searchInput').val().trim().toLowerCase();

    if (!keyword) {
        showLinksByCategory(currentCategory);
        return;
    }

    // 过滤链接
    const filteredLinks = links.filter(link => {
        return link.title.toLowerCase().includes(keyword) ||
               (link.description && link.description.toLowerCase().includes(keyword));
    });

    // 渲染搜索结果
    const container = $('#linksContainer');

    if (filteredLinks.length === 0) {
        container.html('<div class="empty-state"><i class="fa fa-search"></i><p>未找到匹配的结果</p></div>');
        return;
    }

    container.html(`
        <div class="category-section">
            <h3 class="category-title">
                <i class="fa fa-search"></i> 搜索结果
                <span class="badge bg-primary ms-2">${filteredLinks.length}</span>
            </h3>
            <div class="links-grid">
                ${renderLinkCards(filteredLinks)}
            </div>
        </div>
    `);

    // 滚动到结果区域
    $('.links-section')[0].scrollIntoView({ behavior: 'smooth' });
}

// 显示搜索建议
function showSearchSuggestions(keyword) {
    const suggestions = links.filter(link => {
        return link.title.toLowerCase().includes(keyword);
    }).slice(0, 5);

    const container = $('#searchSuggestions');

    if (suggestions.length === 0) {
        container.removeClass('show');
        return;
    }

    let html = suggestions.map(link => `
        <div class="suggestion-item" data-link-id="${escapeAttribute(link.id)}">
            <i class="fa fa-link"></i> ${escapeHtml(link.title)}
        </div>
    `).join('');

    container.html(html).addClass('show');
}

// 搜索建议点击
$(document).on('click', '.suggestion-item', function() {
    const linkId = $(this).data('link-id');
    const link = links.find(l => l.id === linkId);

    if (link) {
        $('#searchInput').val(link.title);
        $('#searchSuggestions').removeClass('show');
        performSearch();
    }
});

// 加载公告
function loadAnnouncements() {
    $.ajax({
        url: '/api/announcements',
        method: 'GET',
        success: function(data) {
            if (data && data.length > 0) {
                // 显示最新公告
                showAnnouncement(data[0]);
            }
        },
        error: function() {
            // 静默失败
        }
    });
}

// 显示公告弹窗
function showAnnouncement(announcement) {
    // 检查是否已显示过
    const shownAnnouncements = JSON.parse(localStorage.getItem('shownAnnouncements') || '[]');

    if (!shownAnnouncements.includes(announcement.id)) {
        $('#announcementContent').html(escapeHtml(announcement.content));
        $('#announcementModal').modal('show');

        // 标记为已显示
        shownAnnouncements.push(announcement.id);
        localStorage.setItem('shownAnnouncements', JSON.stringify(shownAnnouncements));
    }
}

// 显示加载状态
function showLoading() {
    $('#linksContainer').html(`
        <div class="loading">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">加载中...</span>
            </div>
            <p class="mt-3">加载中...</p>
        </div>
    `);
}

// 显示错误信息
function showError(message) {
    $('#linksContainer').html(`
        <div class="empty-state">
            <i class="fa fa-exclamation-circle text-danger"></i>
            <p class="text-danger">${escapeHtml(message)}</p>
        </div>
    `);
}
