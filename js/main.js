import { login, logout, restoreSession, getCurrentMember } from './auth.js';
import { renderDashboard } from './dashboard.js';

const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

function showLogin() {
  loginView.style.display = 'block';
  dashboardView.style.display = 'none';
  loginError.style.display = 'none';
  loginForm.reset();
}

function showDashboard() {
  loginView.style.display = 'none';
  dashboardView.style.display = 'block';
  renderDashboard();
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!username || !password) {
    loginError.textContent = 'Please enter both callsign and access code.';
    loginError.style.display = 'block';
    return;
  }
  const success = login(username, password);
  if (success) {
    showDashboard();
  } else {
    loginError.textContent = 'Access Denied — Invalid credentials. Check the demo hint.';
    loginError.style.display = 'block';
  }
}

function handleLogout() {
  logout();
  showLogin();
}

function init() {
  loginForm.addEventListener('submit', handleLogin);
  window.addEventListener('logout', handleLogout);
  if (restoreSession() && getCurrentMember()) {
    showDashboard();
  } else {
    showLogin();
  }
  generateStars();
}

function generateStars() {
  const starfield = document.getElementById('starfield');
  for (let i = 0; i < 180; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    const size = Math.random() * 2.5 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 3}s`;
    star.style.animationDuration = `${Math.random() * 2 + 1}s`;
    starfield.appendChild(star);
  }
}

init();
