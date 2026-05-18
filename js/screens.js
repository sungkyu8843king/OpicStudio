/* ─── js/screens.js ────────────────────────────────────
   showScreen, loadMyTrips, renderTripsScreen, enterTrip
   ──────────────────────────────────────────────────── */

// ── 화면 전환 ──────────────────────────────────────────
function showScreen(id) {
  ['screenLogin', 'screenTrips', 'app'].forEach(s => {
    document.getElementById(s)?.classList.toggle('hidden', s !== id);
  });
}

// ── Tab 전환 ──────────────────────────────────────────
function switchTab(tab) {
  state.currentTab = tab;
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
    b.setAttribute('aria-selected', b.dataset.tab === tab ? 'true' : 'false');
  });
  document.getElementById('tab-' + tab).classList.add('active');

  if (tab === 'map') initMap();
  if (tab === 'recommend') {
    renderRecommendations();
  }
  if (tab === 'expense') renderExpenses();
  if (tab === 'schedule') renderSchedule();
}

// ── 내 여행 목록 ───────────────────────────────────────
async function loadMyTrips() {
  const kakaoUser = JSON.parse(localStorage.getItem(TM_KAKAO_KEY) || 'null');
  if (!kakaoUser) return;

  // 프로필 표시
  const profileEl = document.getElementById('tripsProfile');
  if (profileEl) {
    profileEl.innerHTML = kakaoUser.profileImage
      ? `<img src="${kakaoUser.profileImage}" class="trips-avatar"><span class="trips-username">${escapeHtml(kakaoUser.nickname)}</span>`
      : `<div class="trips-avatar-text">${escapeHtml(kakaoUser.nickname.slice(0,1))}</div><span class="trips-username">${escapeHtml(kakaoUser.nickname)}</span>`;
  }

  const { data: memberships } = await sb
    .from('trip_members')
    .select('id, group_id, name, trip_groups(*)')
    .eq('kakao_id', kakaoUser.id)
    .order('created_at', { ascending: false });

  renderTripsScreen(memberships || []);
  showScreen('screenTrips');
}

function renderTripsScreen(memberships) {
  const list = document.getElementById('tripsList');
  if (!memberships.length) {
    list.innerHTML = `<div class="trips-empty"><span>✈️</span><p>아직 여행이 없어요<br>새 여행을 만들어보세요!</p></div>`;
    return;
  }

  list.innerHTML = memberships.map(m => {
    const g = m.trip_groups;
    if (!g) return '';
    const emoji = Object.entries(EMOJIS_BY_DEST).find(([k]) => g.dest?.includes(k))?.[1] || '🗺️';
    const dateStr = g.start_date
      ? `${g.start_date.slice(5).replace('-','/')}${g.end_date ? ' ~ ' + g.end_date.slice(5).replace('-','/') : ''}`
      : '날짜 미설정';
    return `
      <div class="trip-card" onclick="enterTrip('${g.id}','${m.id}')">
        <div class="trip-card-emoji">${emoji}</div>
        <div class="trip-card-info">
          <div class="trip-card-name">${escapeHtml(g.name)}</div>
          <div class="trip-card-meta">${g.dest ? escapeHtml(g.dest) + ' · ' : ''}${dateStr}</div>
        </div>
        <div class="trip-card-arrow">›</div>
      </div>`;
  }).join('');
}

async function enterTrip(groupId, memberId) {
  localStorage.setItem(TM_GROUP_KEY, groupId);
  localStorage.setItem(TM_MEMBER_KEY, memberId);
  showToast('불러오는 중...', '');
  const ok = await loadGroupData(groupId);
  if (!ok) { showToast('불러오기 실패', 'error'); return; }
  subscribeRealtime(groupId);
  renderGroupTab();
  renderSchedule();
  renderExpenses();
  renderRecommendations();
  showScreen('app');
}

// ── 초대 링크 invite 처리 (중복 참여 방지) ──────────────
async function handleInviteCode(code) {
  const kakaoUser = JSON.parse(localStorage.getItem(TM_KAKAO_KEY) || 'null');
  if (!code) return;

  const { data: grp } = await sb.from('trip_groups').select('*').eq('code', code).single();
  if (!grp) return;

  if (kakaoUser) {
    // kakao_id로 이미 멤버인지 확인
    const { data: existingMember } = await sb
      .from('trip_members')
      .select('*')
      .eq('group_id', grp.id)
      .eq('kakao_id', kakaoUser.id)
      .maybeSingle();

    if (existingMember) {
      // 이미 멤버 → 바로 입장
      await enterTrip(grp.id, existingMember.id);
      return;
    }
  }

  // 신규 → join 모달 열기
  document.getElementById('jgCode').value = code;
  if (kakaoUser) {
    document.getElementById('jgMyName').value = kakaoUser.nickname;
    renderKakaoModalStrip('jgKakaoStrip', kakaoUser);
  }
  openModal('join-group');
}
