// 全局变量
let categories = [];
let links = [];
let announcements = [];
let currentPage = 'dashboard';
let currentLinkPage = 1;
const linksPerPage = 10;

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

function safeFaIcon(icon, fallback = 'fa-link') {
    const value = String(icon || '').trim();
    return /^fa-[a-z0-9-]+$/i.test(value) ? value : fallback;
}

function isSafeImagePath(iconUrl) {
    return /^https?:\/\//i.test(iconUrl) ||
        iconUrl.startsWith('/assets/icons/') ||
        iconUrl.startsWith('/uploads/');
}

// API 基础 URL
const API_BASE = '/api';

// 获取认证 token
function getToken() {
    return localStorage.getItem('adminToken');
}

// 设置认证 token
function setToken(token) {
    localStorage.setItem('adminToken', token);
}

// 移除认证 token
function removeToken() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
}

// 发送认证的 AJAX 请求
function authenticatedAjax(options) {
    const token = getToken();
    if (!token) {
        window.location.href = '/admin/login.html';
        return;
    }

    options.headers = options.headers || {};
    options.headers['Authorization'] = 'Bearer ' + token;

    return $.ajax(options);
}

// 页面��载完成后执行
$(document).ready(function() {
    // 检查登录状态
    checkLogin();

    // 绑定事件
    bindEvents();

    // 加载数据
    loadData();
});

// 检查登录状态
function checkLogin() {
    const token = getToken();
    if (!token) {
        window.location.href = '/admin/login.html';
        return;
    }

    // 验证 token
    authenticatedAjax({
        url: `${API_BASE}/auth/me`,
        method: 'GET',
        success: function(response) {
            if (response.role !== 'admin') {
                alert('您没有管理员权限');
                window.location.href = '/admin/login.html';
                return;
            }

            // 显示用户名
            $('#currentUser').text(response.username);
        },
        error: function() {
            removeToken();
            window.location.href = '/admin/login.html';
        }
    });
}

// 绑定事件
function bindEvents() {
    // 侧边栏导航
    $('.sidebar .nav-link[data-page]').on('click', function(e) {
        e.preventDefault();
        const page = $(this).data('page');
        showPage(page);
    });

    // 退出登录
    $('#logoutBtn').on('click', function(e) {
        e.preventDefault();
        if (confirm('确定要退出登录吗？')) {
            removeToken();
            window.location.href = '/admin/login.html';
        }
    });

    // 修改密码
    $('#changePasswordBtn').on('click', function(e) {
        e.preventDefault();
        showChangePasswordModal();
    });

    // 刷新按钮
    $('#refreshBtn').on('click', function() {
        loadData();
    });

    // 添加分类
    $('#addCategoryBtn').on('click', function() {
        showCategoryModal();
    });

    // 添加链接
    $('#addLinkBtn').on('click', function() {
        showLinkModal();
    });

    // 添加公告
    $('#addAnnouncementBtn').on('click', function() {
        showAnnouncementModal();
    });

    // 分类筛选
    $('#categoryFilter').on('change', function() {
        currentLinkPage = 1;
        renderLinksTable();
    });
}

// 加载数据
function loadData() {
    loadDashboard();
    loadCategories();
    loadLinks();
    loadAnnouncements();
}

// 显示页面
function showPage(page) {
    currentPage = page;

    // 更新侧边栏激活状态
    $('.sidebar .nav-link').removeClass('active');
    $(`.sidebar .nav-link[data-page="${page}"]`).addClass('active');

    // 隐藏所有页面
    $('.page-content').addClass('d-none');

    // 显示对应页面
    $(`#${page}Page`).removeClass('d-none');

    // 更新页面标题
    const titles = {
        'dashboard': '仪表盘',
        'categories': '分类管理',
        'links': '链接管理',
        'announcements': '公告管理'
    };
    $('#pageTitle').text(titles[page] || '后台管理');
}

// 加载仪表盘数据
function loadDashboard() {
    authenticatedAjax({
        url: `${API_BASE}/categories`,
        method: 'GET',
        success: function(data) {
            $('#totalCategories').text(data.length);
        }
    });

    authenticatedAjax({
        url: `${API_BASE}/links`,
        method: 'GET',
        success: function(data) {
            $('#totalLinks').text(data.length);
            $('#pinnedLinks').text(data.filter(l => l.is_pinned === 1).length);

            const totalClicks = data.reduce((sum, link) => sum + (link.clicks || 0), 0);
            $('#totalClicks').text(totalClicks);
        }
    });
}

// 加载分类
function loadCategories() {
    authenticatedAjax({
        url: `${API_BASE}/categories`,
        method: 'GET',
        success: function(data) {
            categories = data;
            renderCategoriesTable();
            updateCategoryFilter();
        },
        error: function() {
            showAlert('加载分类失败', 'danger');
        }
    });
}

// 渲染分类表格
function renderCategoriesTable() {
    const tbody = $('#categoriesTableBody');
    let html = '';

    categories.forEach(category => {
        const linkCount = links.filter(l => l.category_id === category.id).length;

        html += `
            <tr>
                <td>${category.id}</td>
                <td>${category.icon ? `<i class="fa ${safeFaIcon(category.icon, 'fa-folder')}"></i>` : '-'}</td>
                <td>${escapeHtml(category.name)}</td>
                <td>${category.sort_order}</td>
                <td><span class="badge bg-primary">${linkCount}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline-primary" onclick="showCategoryModal(${category.id})">
                            <i class="fa fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${category.id})">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.html(html || '<tr><td colspan="6" class="text-center">暂无数据</td></tr>');
}

// 更新分类筛选下拉框
function updateCategoryFilter() {
    const select = $('#categoryFilter');
    let html = '<option value="">所有分类</option>';

    categories.forEach(category => {
        html += `<option value="${category.id}">${category.name}</option>`;
    });

    select.html(html);
}

// 显示分类模态框
function showCategoryModal(id = null) {
    const category = id ? categories.find(c => c.id === id) : null;

    const html = `
        <form id="categoryForm">
            <div class="mb-3">
                <label class="form-label">分类名称 <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="categoryName" value="${category ? category.name : ''}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">图标</label>
                <input type="text" class="form-control" id="categoryIcon" value="${category ? category.icon || '' : ''}" placeholder="例如: fa-folder">
                <div class="form-text">Font Awesome 图标类名</div>
            </div>
            <div class="mb-3">
                <label class="form-label">排序</label>
                <input type="number" class="form-control" id="categorySort" value="${category ? category.sort_order : 0}">
                <div class="form-text">数字越小越靠前</div>
            </div>
        </form>
    `;

    $('#modalTitle').text(category ? '编辑分类' : '添加分类');
    $('#modalBody').html(html);
    $('#modalConfirmBtn').off('click').on('click', function() {
        saveCategory(id);
    });
    $('#commonModal').modal('show');
}

// 保存分类
function saveCategory(id) {
    const data = {
        name: $('#categoryName').val().trim(),
        icon: $('#categoryIcon').val().trim(),
        sort_order: parseInt($('#categorySort').val()) || 0
    };

    if (!data.name) {
        alert('请输入分类名称');
        return;
    }

    const url = id ? `${API_BASE}/categories/${id}` : `${API_BASE}/categories`;
    const method = id ? 'PUT' : 'POST';

    authenticatedAjax({
        url: url,
        method: method,
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function() {
            showAlert(id ? '分类更新成功' : '分类添加成功', 'success');
            $('#commonModal').modal('hide');
            loadCategories();
        },
        error: function(xhr) {
            showAlert(xhr.responseJSON?.error || '操作失败', 'danger');
        }
    });
}

// 删除分类
function deleteCategory(id) {
    if (!confirm('确定要删除这个分类吗？')) return;

    authenticatedAjax({
        url: `${API_BASE}/categories/${id}`,
        method: 'DELETE',
        success: function() {
            showAlert('分类删除成功', 'success');
            loadCategories();
        },
        error: function(xhr) {
            showAlert(xhr.responseJSON?.error || '删除失败', 'danger');
        }
    });
}

// 加载链接
function loadLinks() {
    authenticatedAjax({
        url: `${API_BASE}/links`,
        method: 'GET',
        success: function(data) {
            links = data;
            renderLinksTable();
        },
        error: function() {
            showAlert('加载链接失败', 'danger');
        }
    });
}

// 渲染链接表格
function renderLinksTable() {
    const categoryFilter = $('#categoryFilter').val();
    let filteredLinks = links;

    if (categoryFilter) {
        filteredLinks = links.filter(l => l.category_id === parseInt(categoryFilter));
    }

    // 分页
    const totalPages = Math.ceil(filteredLinks.length / linksPerPage);
    const startIndex = (currentLinkPage - 1) * linksPerPage;
    const endIndex = startIndex + linksPerPage;
    const pageLinks = filteredLinks.slice(startIndex, endIndex);

    const tbody = $('#linksTableBody');
    let html = '';

    pageLinks.forEach(link => {
        const category = categories.find(c => c.id === link.category_id);
        const iconHtml = renderLinkIcon(link.icon);

        html += `
            <tr>
                <td>${link.id}</td>
                <td>${iconHtml}</td>
                <td>
                    <div class="text-truncate-custom" title="${escapeAttribute(link.title)}">${escapeHtml(link.title)}</div>
                </td>
                <td>${category ? escapeHtml(category.name) : '-'}</td>
                <td><span class="badge bg-info">${link.clicks || 0}</span></td>
                <td>${link.is_pinned === 1 ? '<i class="fa fa-check text-success"></i>' : '<i class="fa fa-times text-muted"></i>'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline-primary" onclick="showLinkModal(${link.id})">
                            <i class="fa fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteLink(${link.id})">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.html(html || '<tr><td colspan="7" class="text-center">暂无数据</td></tr>');

    // 渲染分页
    renderPagination(totalPages);
}

// 渲染链接图标
function renderLinkIcon(icon) {
    if (!icon) {
        return '<i class="fa fa-link text-muted"></i>';
    }

    if (icon.startsWith('http')) {
        return `<img src="${icon}" class="table-icon" onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"%23666\" d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z\"/></svg>'">`;
    }

    return `<i class="fa ${icon} text-primary"></i>`;
}

function renderLinkIcon(icon) {
    icon = String(icon || '').trim();

    if (!icon) {
        return '<i class="fa fa-link text-muted"></i>';
    }

    if (isSafeImagePath(icon)) {
        return `<img src="${escapeAttribute(icon)}" class="table-icon" onerror="this.style.display='none';">`;
    }

    return `<i class="fa ${safeFaIcon(icon)} text-primary"></i>`;
}

// 渲染分页
function renderPagination(totalPages) {
    const nav = $('#linksPagination');
    let html = '';

    if (totalPages > 1) {
        html = '<nav><ul class="pagination justify-content-center">';

        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li class="page-item ${i === currentLinkPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changeLinkPage(${i})">${i}</a>
                </li>
            `;
        }

        html += '</ul></nav>';
    }

    nav.html(html);
}

// 切换链接页面
function changeLinkPage(page) {
    currentLinkPage = page;
    renderLinksTable();
}

// 显示链接模态框
function showLinkModal(id = null) {
    const link = id ? links.find(l => l.id === id) : null;

    const html = `
        <form id="linkForm">
            <div class="mb-3">
                <label class="form-label">标题 <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="linkTitle" value="${link ? link.title : ''}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">URL <span class="text-danger">*</span></label>
                <input type="url" class="form-control" id="linkUrl" value="${link ? link.url : ''}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">描述</label>
                <textarea class="form-control" id="linkDescription" rows="3">${link ? link.description || '' : ''}</textarea>
            </div>
            <div class="mb-3">
                <label class="form-label">分类 <span class="text-danger">*</span></label>
                <select class="form-select" id="linkCategory" required>
                    <option value="">请选择分类</option>
                    ${categories.map(cat => `<option value="${cat.id}" ${link && link.category_id === cat.id ? 'selected' : ''}>${cat.name}</option>`).join('')}
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">图标URL</label>
                <input type="text" class="form-control" id="linkIcon" value="${link ? link.icon || '' : ''}" placeholder="https://...">
            </div>
            <div class="mb-3">
                <label class="form-label">排序</label>
                <input type="number" class="form-control" id="linkSort" value="${link ? link.sort_order : 0}">
            </div>
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="linkPinned" ${link && link.is_pinned === 1 ? 'checked' : ''}>
                    <label class="form-check-label" for="linkPinned">
                        置顶显示
                    </label>
                </div>
            </div>
        </form>
    `;

    $('#modalTitle').text(link ? '编辑链接' : '添加链接');
    $('#modalBody').html(html);
    $('#modalConfirmBtn').off('click').on('click', function() {
        saveLink(id);
    });
    $('#commonModal').modal('show');
}

// 保存链接
function saveLink(id) {
    const data = {
        title: $('#linkTitle').val().trim(),
        url: $('#linkUrl').val().trim(),
        description: $('#linkDescription').val().trim(),
        icon: $('#linkIcon').val().trim(),
        category_id: parseInt($('#linkCategory').val()),
        sort_order: parseInt($('#linkSort').val()) || 0,
        is_pinned: $('#linkPinned').is(':checked') ? 1 : 0
    };

    if (!data.title || !data.url || !data.category_id) {
        alert('请填写必填项');
        return;
    }

    const url = id ? `${API_BASE}/links/${id}` : `${API_BASE}/links`;
    const method = id ? 'PUT' : 'POST';

    authenticatedAjax({
        url: url,
        method: method,
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function() {
            showAlert(id ? '链接更新成功' : '链接添加成功', 'success');
            $('#commonModal').modal('hide');
            loadLinks();
            loadDashboard();
        },
        error: function(xhr) {
            showAlert(xhr.responseJSON?.error || '操作失败', 'danger');
        }
    });
}

// 删除链接
function deleteLink(id) {
    if (!confirm('确定要删除这个链接吗？')) return;

    authenticatedAjax({
        url: `${API_BASE}/links/${id}`,
        method: 'DELETE',
        success: function() {
            showAlert('链接删除成功', 'success');
            loadLinks();
            loadDashboard();
        },
        error: function(xhr) {
            showAlert(xhr.responseJSON?.error || '删除失败', 'danger');
        }
    });
}

// 加载公告
function loadAnnouncements() {
    authenticatedAjax({
        url: `${API_BASE}/announcements`,
        method: 'GET',
        success: function(data) {
            announcements = data;
            renderAnnouncementsTable();
        },
        error: function() {
            showAlert('加载公告失败', 'danger');
        }
    });
}

// 渲染公告表格
function renderAnnouncementsTable() {
    const tbody = $('#announcementsTableBody');
    let html = '';

    announcements.forEach(announcement => {
        const statusBadge = announcement.is_active === 1
            ? '<span class="badge bg-success">启用</span>'
            : '<span class="badge bg-secondary">禁用</span>';

        const createdAt = new Date(announcement.created_at).toLocaleString('zh-CN');

        html += `
            <tr>
                <td>${announcement.id}</td>
                <td>${escapeHtml(announcement.title)}</td>
                <td>
                    <div class="text-truncate-custom">${escapeHtml(announcement.content.substring(0, 50))}...</div>
                </td>
                <td>${statusBadge}</td>
                <td>${createdAt}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline-primary" onclick="showAnnouncementModal(${announcement.id})">
                            <i class="fa fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteAnnouncement(${announcement.id})">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.html(html || '<tr><td colspan="6" class="text-center">暂无数据</td></tr>');
}

// 显示公告模态框
function showAnnouncementModal(id = null) {
    const announcement = id ? announcements.find(a => a.id === id) : null;

    const html = `
        <form id="announcementForm">
            <div class="mb-3">
                <label class="form-label">标题 <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="announcementTitle" value="${announcement ? announcement.title : ''}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">内容</label>
                <textarea class="form-control" id="announcementContent" rows="5">${announcement ? announcement.content || '' : ''}</textarea>
            </div>
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="announcementActive" ${announcement && announcement.is_active === 1 ? 'checked' : ''}>
                    <label class="form-check-label" for="announcementActive">
                        启用公告
                    </label>
                </div>
            </div>
        </form>
    `;

    $('#modalTitle').text(announcement ? '编辑公告' : '添加公告');
    $('#modalBody').html(html);
    $('#modalConfirmBtn').off('click').on('click', function() {
        saveAnnouncement(id);
    });
    $('#commonModal').modal('show');
}

// 保存公告
function saveAnnouncement(id) {
    const data = {
        title: $('#announcementTitle').val().trim(),
        content: $('#announcementContent').val().trim(),
        is_active: $('#announcementActive').is(':checked') ? 1 : 0
    };

    if (!data.title) {
        alert('请输入公告标题');
        return;
    }

    const url = id ? `${API_BASE}/announcements/${id}` : `${API_BASE}/announcements`;
    const method = id ? 'PUT' : 'POST';

    authenticatedAjax({
        url: url,
        method: method,
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function() {
            showAlert(id ? '公告更新成功' : '公告添加成功', 'success');
            $('#commonModal').modal('hide');
            loadAnnouncements();
        },
        error: function(xhr) {
            showAlert(xhr.responseJSON?.error || '操作失败', 'danger');
        }
    });
}

// 删除公告
function deleteAnnouncement(id) {
    if (!confirm('确定要删除这个公告吗？')) return;

    authenticatedAjax({
        url: `${API_BASE}/announcements/${id}`,
        method: 'DELETE',
        success: function() {
            showAlert('公告删除成功', 'success');
            loadAnnouncements();
        },
        error: function(xhr) {
            showAlert(xhr.responseJSON?.error || '删除失败', 'danger');
        }
    });
}

// 显示修改密码模态框
function showChangePasswordModal() {
    const html = `
        <form id="passwordForm">
            <div class="mb-3">
                <label class="form-label">旧密码 <span class="text-danger">*</span></label>
                <input type="password" class="form-control" id="oldPassword" required>
            </div>
            <div class="mb-3">
                <label class="form-label">新密码 <span class="text-danger">*</span></label>
                <input type="password" class="form-control" id="newPassword" required minlength="6">
                <div class="form-text">密码长度至少6位</div>
            </div>
            <div class="mb-3">
                <label class="form-label">确认新密码 <span class="text-danger">*</span></label>
                <input type="password" class="form-control" id="confirmPassword" required minlength="6">
            </div>
        </form>
    `;

    $('#modalTitle').text('修改密码');
    $('#modalBody').html(html);
    $('#modalConfirmBtn').off('click').on('click', function() {
        changePassword();
    });
    $('#commonModal').modal('show');
}

// 修改密码
function changePassword() {
    const oldPassword = $('#oldPassword').val();
    const newPassword = $('#newPassword').val();
    const confirmPassword = $('#confirmPassword').val();

    if (!oldPassword || !newPassword || !confirmPassword) {
        alert('请填写所有字段');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('两次输入的新密码不一致');
        return;
    }

    if (newPassword.length < 6) {
        alert('新密码长度至少6位');
        return;
    }

    authenticatedAjax({
        url: `${API_BASE}/auth/password`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({
            oldPassword: oldPassword,
            newPassword: newPassword
        }),
        success: function() {
            showAlert('密码修改成功，请重新登录', 'success');
            $('#commonModal').modal('hide');
            setTimeout(function() {
                removeToken();
                window.location.href = '/admin/login.html';
            }, 1500);
        },
        error: function(xhr) {
            showAlert(xhr.responseJSON?.error || '修改失败', 'danger');
        }
    });
}

// 显示提示消息
function showAlert(message, type = 'success') {
    // 这里可以添加 Toast 或 Alert 显示逻辑
    alert(message);
}
