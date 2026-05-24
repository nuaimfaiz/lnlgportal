import { MEMBERS, findMember } from './members.js';

let currentMember = null;

export function getCurrentMember() {
  return currentMember;
}

export function login(username, password) {
  const member = findMember(username, password);
  if (member) {
    currentMember = member;
    sessionStorage.setItem('lnlg_session', JSON.stringify({ user: member.username, timestamp: Date.now() }));
    return true;
  }
  return false;
}

export function logout() {
  currentMember = null;
  sessionStorage.removeItem('lnlg_session');
}

export function restoreSession() {
  const raw = sessionStorage.getItem('lnlg_session');
  if (raw) {
    try {
      const { user } = JSON.parse(raw);
      const member = MEMBERS.find(m => m.username === user);
      if (member) {
        currentMember = member;
        return true;
      }
    } catch(e) {}
  }
  return false;
}
