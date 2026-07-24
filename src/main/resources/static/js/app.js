// Smart EMS SPA Client Application
const API_BASE = '/api';

let currentUser = JSON.parse(localStorage.getItem('ems_user')) || null;
let authToken = localStorage.getItem('ems_token') || null;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    setupNavigation();
    setupThemeToggle();
    setupAuthListeners();
    setupFormListeners();
    setupFilters();
    updateUserUI();

    // Default load dashboard
    loadDashboard();
}

// Global Headers Helper
function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
}

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// Navigation & Tabs
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = item.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-view').forEach(el => el.classList.remove('active'));

    const navEl = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
    const viewEl = document.getElementById(`view-${tabName}`);

    if (navEl) navEl.classList.add('active');
    if (viewEl) viewEl.classList.add('active');

    // Refresh tab content
    if (tabName === 'dashboard') loadDashboard();
    if (tabName === 'employees') loadEmployees();
    if (tabName === 'projects') loadProjects();
    if (tabName === 'tasks') loadTasks();
}

// Theme Toggle
function setupThemeToggle() {
    const btn = document.getElementById('themeToggleBtn');
    btn.addEventListener('click', () => {
        document.body.classList.toggle('theme-light');
        const isLight = document.body.classList.contains('theme-light');
        document.getElementById('themeLabel').innerText = isLight ? 'Light Mode' : 'Dark Mode';
    });
}

// Auth UI Updates
function updateUserUI() {
    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');
    const authBtn = document.getElementById('authActionBtn');

    if (currentUser && authToken) {
        userNameEl.innerText = currentUser.username;
        userRoleEl.innerText = currentUser.role.replace('ROLE_', '');
        authBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Logout`;
        authBtn.onclick = handleLogout;
    } else {
        userNameEl.innerText = 'Not Logged In';
        userRoleEl.innerText = 'GUEST';
        authBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Login`;
        authBtn.onclick = openAuthModal;
    }
}

function openAuthModal() {
    document.getElementById('authModal').classList.add('active');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
}

function switchAuthTab(type) {
    document.getElementById('tabLogin').classList.toggle('active', type === 'login');
    document.getElementById('tabRegister').classList.toggle('active', type === 'register');
    document.getElementById('loginForm').classList.toggle('active', type === 'login');
    document.getElementById('registerForm').classList.toggle('active', type === 'register');
}

function setupAuthListeners() {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) throw new Error('Invalid credentials');
            const data = await res.json();

            authToken = data.token;
            currentUser = { username: data.username, email: data.email, role: data.role, id: data.id };

            localStorage.setItem('ems_token', authToken);
            localStorage.setItem('ems_user', JSON.stringify(currentUser));

            showToast(`Welcome back, ${data.username}!`, 'success');
            closeAuthModal();
            updateUserUI();
            loadDashboard();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const role = document.getElementById('regRole').value;

        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, role })
            });

            if (!res.ok) throw new Error('Registration failed');
            showToast('Account registered successfully! Please log in.', 'success');
            switchAuthTab('login');
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('ems_token');
    localStorage.removeItem('ems_user');
    showToast('Logged out successfully');
    updateUserUI();
    loadDashboard();
}

// API Dashboard Loading
async function loadDashboard() {
    try {
        const endpoint = currentUser && currentUser.role === 'ROLE_ADMIN' ? '/dashboard/admin' : '/dashboard/employee';
        const res = await fetch(`${API_BASE}${endpoint}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Could not load dashboard stats');
        const data = await res.json();

        document.getElementById('statTotalEmployees').innerText = data.totalEmployees || 0;
        document.getElementById('statActiveProjects').innerText = data.activeProjects || 0;
        document.getElementById('statPendingTasks').innerText = data.pendingTasks || 0;
        document.getElementById('statCompletedTasks').innerText = data.completedTasks || 0;

        renderUpcomingDeadlines(data.upcomingDeadlines || data.myTasks || []);
    } catch (err) {
        console.warn(err);
    }
}

function renderUpcomingDeadlines(tasks) {
    const container = document.getElementById('upcomingTasksList');
    if (!tasks || tasks.length === 0) {
        container.innerHTML = `<p class="text-muted">No pending deadlines.</p>`;
        return;
    }

    container.innerHTML = tasks.map(t => `
        <div class="task-item" style="padding: 0.6rem 0; border-bottom: 1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
            <div>
                <strong>${t.title}</strong>
                <br><small class="text-muted">Project: ${t.projectName || 'General'} | Priority: ${t.priority}</small>
            </div>
            <span class="badge badge-${t.priority ? t.priority.toLowerCase() : 'medium'}">${t.status}</span>
        </div>
    `).join('');
}

// Employees Management
async function loadEmployees() {
    const tbody = document.getElementById('employeesTableBody');
    try {
        const res = await fetch(`${API_BASE}/employees`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to load employees');
        const employees = await res.json();

        if (employees.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center">No employees found.</td></tr>`;
            return;
        }

        tbody.innerHTML = employees.map(emp => `
            <tr>
                <td>#${emp.id}</td>
                <td><strong>${emp.firstName} ${emp.lastName}</strong></td>
                <td>${emp.email}</td>
                <td><span class="badge badge-inprogress">${emp.department}</span></td>
                <td>${emp.designation || '-'}</td>
                <td>${emp.phone || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="editEmployee(${emp.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-outline" onclick="deleteEmployee(${emp.id})"><i class="fa-solid fa-trash text-warning"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-warning">${err.message}</td></tr>`;
    }
}

// Projects Management
async function loadProjects() {
    const container = document.getElementById('projectsContainer');
    try {
        const res = await fetch(`${API_BASE}/projects`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to load projects');
        const projects = await res.json();

        if (projects.length === 0) {
            container.innerHTML = `<p class="text-muted">No projects found.</p>`;
            return;
        }

        container.innerHTML = projects.map(p => `
            <div class="project-card">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <h3>${p.name}</h3>
                    <span class="badge badge-${p.priority ? p.priority.toLowerCase() : 'medium'}">${p.priority}</span>
                </div>
                <p class="text-muted" style="font-size:0.85rem;">${p.description || 'No description provided.'}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem;" class="text-muted">
                    <span>Status: <strong>${p.status}</strong></span>
                    <span>Deadline: ${p.deadline || 'N/A'}</span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = `<p class="text-warning">${err.message}</p>`;
    }
}

// Tasks Management
async function loadTasks() {
    const tbody = document.getElementById('tasksTableBody');
    try {
        const res = await fetch(`${API_BASE}/tasks`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to load tasks');
        const tasks = await res.json();

        if (tasks.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center">No tasks found.</td></tr>`;
            return;
        }

        tbody.innerHTML = tasks.map(t => `
            <tr>
                <td>#${t.id}</td>
                <td><strong>${t.title}</strong></td>
                <td>${t.projectName || '-'}</td>
                <td>${t.assignedToName || 'Unassigned'}</td>
                <td><span class="badge badge-${t.priority ? t.priority.toLowerCase() : 'medium'}">${t.priority}</span></td>
                <td><span class="badge badge-${t.status === 'COMPLETED' ? 'completed' : 'inprogress'}">${t.status}</span></td>
                <td>${t.dueDate || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="deleteTask(${t.id})"><i class="fa-solid fa-trash text-warning"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-warning">${err.message}</td></tr>`;
    }
}

// Form Modals
function openEmployeeModal() { document.getElementById('employeeModal').classList.add('active'); }
function closeEmployeeModal() { document.getElementById('employeeModal').classList.remove('active'); }

function openProjectModal() { document.getElementById('projectModal').classList.add('active'); }
function closeProjectModal() { document.getElementById('projectModal').classList.remove('active'); }

async function openTaskModal() {
    document.getElementById('taskModal').classList.add('active');
    // Populate projects dropdown
    const projSelect = document.getElementById('taskProjectId');
    const empSelect = document.getElementById('taskAssignedToId');

    try {
        const resP = await fetch(`${API_BASE}/projects`, { headers: getAuthHeaders() });
        const projects = await resP.json();
        projSelect.innerHTML = '<option value="">Select Project</option>' + projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

        const resE = await fetch(`${API_BASE}/employees`, { headers: getAuthHeaders() });
        const employees = await resE.json();
        empSelect.innerHTML = '<option value="">Select Employee</option>' + employees.map(e => `<option value="${e.id}">${e.firstName} ${e.lastName}</option>`).join('');
    } catch (err) {
        console.warn(err);
    }
}
function closeTaskModal() { document.getElementById('taskModal').classList.remove('active'); }

// Setup Forms
function setupFormListeners() {
    document.getElementById('employeeForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const dto = {
            firstName: document.getElementById('empFirstName').value,
            lastName: document.getElementById('empLastName').value,
            email: document.getElementById('empEmail').value,
            department: document.getElementById('empDepartment').value,
            designation: document.getElementById('empDesignation').value,
            phone: document.getElementById('empPhone').value,
            salary: parseFloat(document.getElementById('empSalary').value) || 0.0
        };

        try {
            const res = await fetch(`${API_BASE}/employees`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(dto)
            });
            if (!res.ok) throw new Error('Failed to save employee');
            showToast('Employee saved successfully!', 'success');
            closeEmployeeModal();
            loadEmployees();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    document.getElementById('projectForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const dto = {
            name: document.getElementById('projName').value,
            description: document.getElementById('projDescription').value,
            priority: document.getElementById('projPriority').value,
            status: document.getElementById('projStatus').value,
            startDate: document.getElementById('projStartDate').value || null,
            deadline: document.getElementById('projDeadline').value || null
        };

        try {
            const res = await fetch(`${API_BASE}/projects`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(dto)
            });
            if (!res.ok) throw new Error('Failed to create project');
            showToast('Project created successfully!', 'success');
            closeProjectModal();
            loadProjects();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    document.getElementById('taskForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const dto = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            projectId: parseInt(document.getElementById('taskProjectId').value),
            assignedToId: parseInt(document.getElementById('taskAssignedToId').value) || null,
            priority: document.getElementById('taskPriority').value,
            status: document.getElementById('taskStatus').value,
            remarks: document.getElementById('taskRemarks').value
        };

        try {
            const res = await fetch(`${API_BASE}/tasks`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(dto)
            });
            if (!res.ok) throw new Error('Failed to assign task');
            showToast('Task created successfully!', 'success');
            closeTaskModal();
            loadTasks();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}

// Delete Handlers
async function deleteEmployee(id) {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
        const res = await fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Could not delete employee');
        showToast('Employee deleted successfully', 'success');
        loadEmployees();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
        const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Could not delete task');
        showToast('Task deleted successfully', 'success');
        loadTasks();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function setupFilters() {
    document.getElementById('refreshDashboardBtn')?.addEventListener('click', loadDashboard);
}
