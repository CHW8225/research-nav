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

function getModal(selector) {
    return bootstrap.Modal.getOrCreateInstance($(selector)[0]);
}

function showToast(message, type = 'info') {
    const container = $('#adminToastContainer');
    const safeMessage = escapeHtml(message);
    const safeType = ['success', 'error', 'info'].includes(type) ? type : 'info';
    const toast = $(
        `<div class="admin-toast admin-toast-${safeType}" role="status">${safeMessage}</div>`
    );

    container.append(toast);
    setTimeout(() => {
        toast.fadeOut(180, function() {
            $(this).remove();
        });
    }, 2600);
}

function showConfirm(message, options = {}) {
    const title = options.title || '确认操作';
    const confirmText = options.confirmText || '确定';
    const cancelText = options.cancelText || '取消';
    const danger = options.danger !== false;
    const modal = $('#confirmModal');

    $('#confirmModalTitle').text(title);
    $('#confirmModalMessage').text(message);
    $('#confirmModalOk').text(confirmText).toggleClass('btn-danger', danger).toggleClass('btn-primary', !danger);
    $('#confirmModalCancel').text(cancelText);

    return new Promise(resolve => {
        let settled = false;
        const finish = confirmed => {
            if (!settled) {
                settled = true;
                resolve(confirmed);
            }
        };

        $('#confirmModalOk').off('click.confirm').on('click.confirm', () => {
            getModal('#confirmModal').hide();
            finish(true);
        });
        $('#confirmModalCancel, #confirmModal .btn-close').off('click.confirm').on('click.confirm', () => {
            getModal('#confirmModal').hide();
            finish(false);
        });
        modal.off('hidden.bs.modal.confirm').on('hidden.bs.modal.confirm', () => finish(false));
        getModal('#confirmModal').show();
    });
}

function safeFaIcon(icon, fallback = 'fa-link') {
    const value = String(icon || '').trim();
    return /^fa-[a-z0-9-]+$/i.test(value) ? value : fallback;
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
                showToast('操作失败，请稍后重试', 'error');
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
    $('#logoutBtn').on('click', async function(e) {
        e.preventDefault();
        const confirmed = await showConfirm('确定要退出登录吗？', { danger: false });
        if (!confirmed) return;

        removeToken();
        window.location.href = '/admin/login.html';
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
            showToast('操作失败，请稍后重试', 'error');
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
    const category = id ? categories.find(c => c.id === id) : {};
    const safeName = escapeAttribute(category.name || '');
    const safeIcon = escapeAttribute(category.icon || '');

    const html = `
        <form id="categoryForm">
            <div class="mb-3">
                <label class="form-label">分类名称 <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="categoryName" value="${safeName}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">图标</label>
                <input type="text" class="form-control" id="categoryIcon" value="${safeIcon}" placeholder="例如: fa-folder">
                <div class="form-text">Font Awesome 图标类名</div>
            </div>
            <div class="mb-3">
                <label class="form-label">排序</label>
                <input type="number" class="form-control" id="categorySort" value="${category ? category.sort_order : 0}">
                <div class="form-text">数字越小越靠前</div>
            </div>
        </form>
    `;

    $('#modalTitle').text(id ? '编辑分类' : '添加分类');
    $('#modalBody').html(html);
    $('#modalConfirmBtn').off('click').on('click', function() {
        saveCategory(id);
    });
    getModal('#commonModal').show();
}

// 保存分类
function saveCategory(id) {
    const data = {
        name: $('#categoryName').val().trim(),
        icon: $('#categoryIcon').val().trim(),
        sort_order: parseInt($('#categorySort').val()) || 0
    };

    if (!data.name) {
        showToast('请填写必填项', 'error');
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
            showToast('保存成功', 'success');
            getModal('#commonModal').hide();
            loadCategories();
        },
        error: function(xhr) {
            showToast(xhr.responseJSON?.error || '操作失败，请稍后重试', 'error');
        }
    });
}

// 删除分类
async function deleteCategory(id) {
    const confirmed = await showConfirm('确定要删除这个分类吗？', {
        title: '确认操作',
        confirmText: '删除'
    });
    if (!confirmed) return;

    authenticatedAjax({
        url: `${API_BASE}/categories/${id}`,
        method: 'DELETE',
        success: function() {
            showToast('保存成功', 'success');
            loadCategories();
        },
        error: function(xhr) {
            showToast(xhr.responseJSON?.error || '操作失败，请稍后重试', 'error');
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
            showToast('操作失败，请稍后重试', 'error');
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
        return '<span class="admin-link-icon-placeholder"><i class="fa fa-link"></i></span>';
    }

    const safeIcon = escapeAttribute(icon);
    return `<img src="${safeIcon}" alt="" class="admin-link-icon" onerror="this.replaceWith(document.createTextNode('🔆'));">`;
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
    const link = id ? links.find(l => l.id === id) : {};
    const safeTitle = escapeAttribute(link.title || '');
    const safeUrl = escapeAttribute(link.url || '');
    const safeIcon = escapeAttribute(link.icon || '');
    const safeDescription = escapeHtml(link.description || '');
    const safeCategoryId = String(link.categoryId || link.category_id || '');

    const html = `
        <form id="linkForm">
            <div class="mb-3">
                <label class="form-label">标题 <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="linkTitle" value="${safeTitle}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">URL <span class="text-danger">*</span></label>
                <input type="url" class="form-control" id="linkUrl" value="${safeUrl}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">描述</label>
                <textarea class="form-control" id="linkDescription" rows="3">${safeDescription}</textarea>
            </div>
            <div class="mb-3">
                <label class="form-label">分类 <span class="text-danger">*</span></label>
                <select class="form-select" id="linkCategory" required>
                    <option value="">请选择分类</option>
                    ${categories.map(category => {
                        const selected = String(category.id) === safeCategoryId ? 'selected' : '';
                        return `<option value="${escapeAttribute(category.id)}" ${selected}>${escapeHtml(category.name || '')}</option>`;
                    }).join('')}
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">图标URL</label>
                <input type="text" class="form-control" id="linkIcon" value="${safeIcon}" placeholder="https://...">
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

    $('#modalTitle').text(id ? '编辑链接' : '添加链接');
    $('#modalBody').html(html);
    $('#modalConfirmBtn').off('click').on('click', function() {
        saveLink(id);
    });
    getModal('#commonModal').show();
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
        showToast('请填写必填项', 'error');
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
            showToast('保存成功', 'success');
            getModal('#commonModal').hide();
            loadLinks();
            loadDashboard();
        },
        error: function(xhr) {
            showToast(xhr.responseJSON?.error || '操作失败，请稍后重试', 'error');
        }
    });
}

// 删除链接
async function deleteLink(id) {
    const confirmed = await showConfirm('确定要删除这个链接吗？', {
        title: '确认操作',
        confirmText: '删除'
    });
    if (!confirmed) return;

    authenticatedAjax({
        url: `${API_BASE}/links/${id}`,
        method: 'DELETE',
        success: function() {
            showToast('保存成功', 'success');
            loadLinks();
            loadDashboard();
        },
        error: function(xhr) {
            showToast(xhr.responseJSON?.error || '操作失败，请稍后重试', 'error');
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
            showToast('操作失败，请稍后重试', 'error');
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
    const announcement = id ? announcements.find(a => a.id === id) : {};
    const safeTitle = escapeAttribute(announcement.title || '');
    const safeContent = escapeHtml(announcement.content || '');

    const html = `
        <form id="announcementForm">
            <div class="mb-3">
                <label class="form-label">标题 <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="announcementTitle" value="${safeTitle}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">内容</label>
                <textarea class="form-control" id="announcementContent" rows="5">${safeContent}</textarea>
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

    $('#modalTitle').text(id ? '编辑公告' : '添加公告');
    $('#modalBody').html(html);
    $('#modalConfirmBtn').off('click').on('click', function() {
        saveAnnouncement(id);
    });
    getModal('#commonModal').show();
}

// 保存公告
function saveAnnouncement(id) {
    const data = {
        title: $('#announcementTitle').val().trim(),
        content: $('#announcementContent').val().trim(),
        is_active: $('#announcementActive').is(':checked') ? 1 : 0
    };

    if (!data.title) {
        showToast('请填写必填项', 'error');
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
            showToast('保存成功', 'success');
            getModal('#commonModal').hide();
            loadAnnouncements();
        },
        error: function(xhr) {
            showToast(xhr.responseJSON?.error || '操作失败，请稍后重试', 'error');
        }
    });
}

// 删除公告
async function deleteAnnouncement(id) {
    const confirmed = await showConfirm('确定要删除这个公告吗？', {
        title: '确认操作',
        confirmText: '删除'
    });
    if (!confirmed) return;

    authenticatedAjax({
        url: `${API_BASE}/announcements/${id}`,
        method: 'DELETE',
        success: function() {
            showToast('保存成功', 'success');
            loadAnnouncements();
        },
        error: function(xhr) {
            showToast(xhr.responseJSON?.error || '操作失败，请稍后重试', 'error');
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
    getModal('#commonModal').show();
}

// 修改密码
function changePassword() {
    const oldPassword = $('#oldPassword').val();
    const newPassword = $('#newPassword').val();
    const confirmPassword = $('#confirmPassword').val();

    if (!oldPassword || !newPassword || !confirmPassword) {
        showToast('请填写必填项', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast('两次输入的新密码不一致', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showToast('新密码长度至少6位', 'error');
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
            showToast('保存成功', 'success');
            getModal('#commonModal').hide();
            setTimeout(function() {
                removeToken();
                window.location.href = '/admin/login.html';
            }, 1500);
        },
        error: function(xhr) {
            showToast(xhr.responseJSON?.error || '操作失败，请稍后重试', 'error');
        }
    });
}
