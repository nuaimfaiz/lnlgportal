import { getCurrentMember } from './auth.js';

let statsChart = null;

export function renderDashboard() {
  const member = getCurrentMember();
  if (!member) return;

  const p = member.profile;
  const stats = member.stats;

  // Sidebar – includes leaderboard position and crescent blessing
  const sidebarHtml = `
    <div class="avatar-circle"><i class="fas ${p.avatarIcon}"></i></div>
    <h2 class="member-name">${p.fullName}</h2>
    <p style="text-align:center;"><i class="fas fa-tag"></i> ${p.role} · ${p.highestRank}</p>
    <div class="leaderboard-badge" style="margin: 0.5rem 0;">
      <i class="fas fa-trophy"></i> Squad Rank #${member.squadLeaderboardPosition}
    </div>
    <div class="stat-widget">
      <div class="widget-title"><i class="fas fa-star-of-life"></i> CRESCENT BLESSING</div>
      <p>${member.crescentBlessing} <i class="fas fa-moon"></i></p>
    </div>
    <div class="stat-widget">
      <div class="widget-title"><i class="fas fa-chart-simple"></i> CORE STATS</div>
      ${Object.entries(stats).map(([key, val]) => `
        <div class="progress-item">
          <div class="flex-between" style="display:flex; justify-content:space-between;"><span>${key}</span><span>${val}%</span></div>
          <div class="progress-bar-bg"><div class="progress-fill" style="width: ${val}%;"></div></div>
        </div>
      `).join('')}
    </div>
    <div class="stat-widget">
      <div class="widget-title"><i class="fas fa-medal"></i> ACHIEVEMENTS</div>
      <div>${member.achievements.map(a => `<span class="badge">${a}</span>`).join('')}</div>
    </div>
    <button id="logoutBtnSidebar" class="logout-sidebar"><i class="fas fa-door-open"></i> EXIT PORTAL</button>
  `;

  document.getElementById('sidebar').innerHTML = sidebarHtml;
  document.getElementById('logoutBtnSidebar').addEventListener('click', () => window.dispatchEvent(new Event('logout')));

  // Main content – includes tournaments, profile details, etc.
  const mainHtml = `
    <div class="grid-2col">
      <div class="stat-widget">
        <div class="widget-title"><i class="fas fa-bullhorn"></i> ACTIVE DIRECTIVE</div>
        <div style="background:#0b0e1a; border-radius:1rem; padding:0.8rem;">${member.activeMission}</div>
        <div class="widget-title" style="margin-top: 1rem;"><i class="fas fa-chart-line"></i> RANK PROGRESS</div>
        <div class="progress-item"><div class="flex-between"><span>Progress to next rank</span><span>${member.progressToNextRank}%</span></div><div class="progress-bar-bg"><div class="progress-fill" style="width: ${member.progressToNextRank}%;"></div></div></div>
        <div class="flex-between"><span><i class="fas fa-coins"></i> Lunar Credits</span><span>${p.lunarCredits.toLocaleString()} LC</span></div>
        <div class="flex-between"><span><i class="fas fa-rocket"></i> Missions</span><span>${p.missionsComplete}</span></div>
      </div>
      <div class="stat-widget">
        <div class="widget-title"><i class="fas fa-chart-pie"></i> LUNAR POWER MATRIX</div>
        <canvas id="radarCanvas" width="300" height="200" style="max-width:100%;"></canvas>
      </div>
    </div>

    <div class="grid-2col">
      <div class="stat-widget">
        <div class="widget-title"><i class="fas fa-trophy"></i> TOURNAMENTS & EVENTS WON</div>
        ${member.tournamentsWon && member.tournamentsWon.length ? 
          `<ul class="tournament-list">${member.tournamentsWon.map(t => `<li><i class="fas fa-crown gold-text"></i> ${t}</li>`).join('')}</ul>` : 
          `<p>No tournaments yet</p>`}
      </div>
      <div class="stat-widget">
        <div class="widget-title"><i class="fas fa-id-card"></i> MEMBER PROFILE</div>
        <div class="profile-detail"><strong>Full Name:</strong> ${p.fullName}</div>
        <div class="profile-detail"><strong>Role:</strong> ${p.role}</div>
        <div class="profile-detail"><strong>Highest Rank:</strong> ${p.highestRank}</div>
        <div class="profile-detail"><strong>Favourite Heroes:</strong> <span>${p.favoriteHeroes.map(h => `<span class="favourite-tag">${h}</span>`).join('')}</span></div>
        <div class="profile-detail"><strong>Favourite Lanes:</strong> <span>${p.favoriteLanes.map(l => `<span class="favourite-tag">${l}</span>`).join('')}</span></div>
        <div class="profile-detail"><strong>Private Profile:</strong> <a href="${p.privateProfileLink}" target="_blank" class="private-link">${p.privateProfileLink !== "#" ? p.privateProfileLink : "Not shared"}</a></div>
      </div>
    </div>

    <div class="grid-2col">
      <div class="stat-widget">
        <div class="widget-title"><i class="fas fa-dna"></i> SPECIAL ABILITIES</div>
        <div>${member.specialties.map(s => `<span class="badge"><i class="fas fa-bolt"></i> ${s}</span>`).join('')}</div>
        <div class="widget-title" style="margin-top:1rem;"><i class="fas fa-history"></i> RECENT EXPLOITS</div>
        <ul style="list-style:none;">${member.recentActions.map(act => `<li><i class="fas fa-caret-right gold-text"></i> ${act}</li>`).join('')}</ul>
      </div>
      <div class="stat-widget">
        <div class="widget-title"><i class="fas fa-quote-right"></i> LEGENDARY TENET</div>
        <p style="font-style:italic;">“${p.quote}”</p>
        <hr style="border-color:#332d1a;">
        <div class="flex-between"><span>Reputation</span><span class="gold-text">${p.reputation}</span></div>
        <div class="flex-between"><span>Induction</span><span>${p.joined}</span></div>
        <div class="flex-between"><span><i class="fas fa-wolf-pack-battalion"></i> Wolf Symbol</span><span>🐺🌙</span></div>
      </div>
    </div>
  `;

  document.getElementById('mainContent').innerHTML = mainHtml;

  // Radar chart (same as before)
  const ctx = document.getElementById('radarCanvas').getContext('2d');
  if (statsChart) statsChart.destroy();
  statsChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Agility', 'Strategy', 'Lunar Potency', 'Resilience'],
      datasets: [{
        label: `${p.fullName} · Combat Profile`,
        data: [stats.agility, stats.strategy, stats.lunarPotency, stats.resilience],
        backgroundColor: 'rgba(212, 175, 55, 0.25)',
        borderColor: '#e5b80b',
        borderWidth: 2,
        pointBackgroundColor: '#f7d44a',
        pointBorderColor: '#0a0c14'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 20, backdropColor: 'transparent', color: '#ccc' }, grid: { color: '#444654' } } }
    }
  });
}
