const API_URL = 'http://localhost:8000/api';

// ─── Auth ─────────────────────────────────────────────────────────────────────
const auth = {
    getToken:    () => localStorage.getItem('lc_token'),
    setToken:    t  => localStorage.setItem('lc_token', t),
    removeToken: ()  => localStorage.removeItem('lc_token'),
    getUser:     ()  => { try { return JSON.parse(localStorage.getItem('lc_user')); } catch { return null; } },
    setUser:     u   => localStorage.setItem('lc_user', JSON.stringify(u)),
    removeUser:  ()  => localStorage.removeItem('lc_user'),
    isLoggedIn:  ()  => !!localStorage.getItem('lc_token'),
};

function requireAuth() {
    if (!auth.isLoggedIn()) {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        return false;
    }
    return true;
}

// ─── API client ───────────────────────────────────────────────────────────────
async function apiRequest(method, endpoint, body = null) {
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    const token = auth.getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(API_URL + endpoint, opts);
    let data = {};
    try { data = await res.json(); } catch (_) {}

    if (res.status === 401) {
        auth.removeToken();
        auth.removeUser();
        window.location.href = 'login.html';
        return;
    }
    if (!res.ok) {
        const err = new Error(data.message || 'Erreur serveur');
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

const apiGet  = ep      => apiRequest('GET',    ep);
const apiPost = (ep, b) => apiRequest('POST',   ep, b);
const apiPut  = (ep, b) => apiRequest('PUT',    ep, b);

// ─── Navigation dynamique ─────────────────────────────────────────────────────
function updateNav() {
    const loggedIn = auth.isLoggedIn();
    const user = auth.getUser();

    document.querySelectorAll('[data-show="guest"]').forEach(el =>
        el.classList.toggle('hidden', loggedIn)
    );
    document.querySelectorAll('[data-show="auth"]').forEach(el =>
        el.classList.toggle('hidden', !loggedIn)
    );
    document.querySelectorAll('[data-username]').forEach(el => {
        if (user) el.textContent = (user.prenom || '') + ' ' + (user.nom || '');
    });
}

function logout() {
    apiPost('/auth/logout').catch(() => {});
    auth.removeToken();
    auth.removeUser();
    window.location.href = 'index.html';
}

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmtPrice(v) {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + ' DH';
}

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function statusBadge(statut) {
    const map = {
        en_attente: ['En attente',  'badge-warning'],
        en_cours:   ['En cours',    'badge-info'],
        terminee:   ['Terminée',    'badge-success'],
        annulee:    ['Annulée',     'badge-danger'],
    };
    const [label, cls] = map[statut] || [statut, 'badge-secondary'];
    return `<span class="badge ${cls}">${label}</span>`;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.remove(), 400);
    }, 3500);
}

// ─── Form helpers ─────────────────────────────────────────────────────────────
function showFieldError(inputId, msg) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.add('input-error');
    const existing = input.parentElement.querySelector('.field-error');
    if (existing) existing.remove();
    const span = document.createElement('span');
    span.className = 'field-error';
    span.textContent = msg;
    input.parentElement.appendChild(span);
}

function clearFieldErrors() {
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.field-error').forEach(el => el.remove());
}

function showApiErrors(errData) {
    if (errData?.errors) {
        Object.entries(errData.errors).forEach(([field, msgs]) => {
            showFieldError(field, Array.isArray(msgs) ? msgs[0] : msgs);
        });
    }
}
