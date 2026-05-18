/* ═══════════════════════════════════════════════════════
   트립메이트 – 단체 여행 일정 관리 앱 (Supabase 연동)
   ═══════════════════════════════════════════════════════ */

// ── Supabase ─────────────────────────────────────────
const SUPABASE_URL = 'https://nmvfffzpkqyzztiobwtt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_22PPW0eCY3Tvy3vZVZYKFw_yCb8cI2f';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const TM_GROUP_KEY  = 'tm_group_id';
const TM_MEMBER_KEY = 'tm_member_id';
const TM_KAKAO_KEY  = 'tm_kakao_user';

// ── 상수 ─────────────────────────────────────────────
const EMOJIS_BY_DEST = {
  제주: '🏝️', 부산: '🌊', 서울: '🏙️', 경주: '🏛️',
  강릉: '🌊', 속초: '🏔️', 여수: '🦀', 전주: '🍱',
  대전: '🌳', 수원: '🏯', 인천: '✈️', 광주: '🌸',
};
const TYPE_EMOJI = {
  attraction: '🏛️', accommodation: '🏨', restaurant: '🍽️',
  cafe: '☕', transport: '🚌', shopping: '🛍️', other: '📍',
};
const TYPE_LABEL = {
  attraction: '관광지', accommodation: '숙소', restaurant: '식당',
  cafe: '카페', transport: '교통', shopping: '쇼핑', other: '기타',
};
const CAT_EMOJI = {
  food: '🍽️', transport: '🚌', accommodation: '🏨',
  activity: '🎭', shopping: '🛍️', other: '📝',
};
const CAT_LABEL = {
  food: '식비', transport: '교통', accommodation: '숙소',
  activity: '액티비티', shopping: '쇼핑', other: '기타',
};

// ── 한국 주요 장소 검색 DB ─────────────────────────────
const PLACE_DB = [
  { name: '성산일출봉', addr: '제주 서귀포시 성산읍', lat: 33.4582, lng: 126.9414 },
  { name: '한라산 국립공원', addr: '제주 제주시 한라산로 806', lat: 33.3617, lng: 126.5292 },
  { name: '제주 동문시장', addr: '제주 제주시 관덕로14길', lat: 33.5107, lng: 126.5219 },
  { name: '협재해수욕장', addr: '제주 제주시 한림읍 협재리', lat: 33.3944, lng: 126.2395 },
  { name: '만장굴', addr: '제주 제주시 구좌읍 만장굴길', lat: 33.5283, lng: 126.7712 },
  { name: '우도', addr: '제주 제주시 우도면', lat: 33.5056, lng: 126.9538 },
  { name: '해운대해수욕장', addr: '부산 해운대구 해운대해변로 264', lat: 35.1587, lng: 129.1603 },
  { name: '광안리해수욕장', addr: '부산 수영구 광안해변로 219', lat: 35.1531, lng: 129.1183 },
  { name: '감천문화마을', addr: '부산 사하구 감내2로 203', lat: 35.0975, lng: 129.0106 },
  { name: '자갈치시장', addr: '부산 중구 자갈치해안로 52', lat: 35.0965, lng: 129.0303 },
  { name: '경복궁', addr: '서울 종로구 사직로 161', lat: 37.5796, lng: 126.9770 },
  { name: '남산서울타워', addr: '서울 용산구 남산공원길 105', lat: 37.5512, lng: 126.9882 },
  { name: '명동', addr: '서울 중구 명동길', lat: 37.5636, lng: 126.9869 },
  { name: '홍대입구', addr: '서울 마포구 와우산로', lat: 37.5573, lng: 126.9245 },
  { name: '인사동', addr: '서울 종로구 인사동길', lat: 37.5744, lng: 126.9854 },
  { name: '불국사', addr: '경북 경주시 불국로 385', lat: 35.7900, lng: 129.3317 },
  { name: '첨성대', addr: '경북 경주시 인왕동 839-1', lat: 35.8349, lng: 129.2191 },
  { name: '경주 동궁과 월지', addr: '경북 경주시 원화로 102', lat: 35.8336, lng: 129.2254 },
  { name: '안목해변 카페거리', addr: '강원 강릉시 창해로', lat: 37.7885, lng: 128.9432 },
  { name: '설악산 국립공원', addr: '강원 속초시 설악산로 833', lat: 38.1197, lng: 128.4657 },
  { name: '여수 돌산공원', addr: '전남 여수시 돌산읍 돌산로 3600', lat: 34.7405, lng: 127.7356 },
  { name: '전주 한옥마을', addr: '전북 전주시 완산구 기린대로 99', lat: 35.8153, lng: 127.1534 },
  { name: '수원화성', addr: '경기 수원시 팔달구 행궁로 11', lat: 37.2849, lng: 127.0148 },
];

// ── 맛집/카페 Mock 데이터 ─────────────────────────────
const RESTAURANTS = [
  { id: 'r1', name: '고수레 흑돼지', cat: 'korean', emoji: '🐷', rating: 4.7, dist: '0.3km', open: true, desc: '제주 흑돼지 직화구이 전문', price: '₩15,000~', lat: 33.4600, lng: 126.9420 },
  { id: 'r2', name: '봄날 카페', cat: 'cafe', emoji: '☕', rating: 4.5, dist: '0.5km', open: true, desc: '바다 전망 수제 음료', price: '₩6,000~', lat: 33.4610, lng: 126.9430 },
  { id: 'r3', name: '해녀의 부엌', cat: 'korean', emoji: '🦑', rating: 4.8, dist: '0.8km', open: false, desc: '해산물 성게비빔밥, 전복죽', price: '₩12,000~', lat: 33.4570, lng: 126.9400 },
  { id: 'r4', name: '이탈리아 테라스', cat: 'western', emoji: '🍝', rating: 4.4, dist: '1.1km', open: true, desc: '파스타·피자 오션뷰 레스토랑', price: '₩18,000~', lat: 33.4590, lng: 126.9450 },
  { id: 'r5', name: '라멘 코지', cat: 'japanese', emoji: '🍜', rating: 4.6, dist: '1.3km', open: true, desc: '돈코츠 라멘 · 사케', price: '₩12,000~', lat: 33.4580, lng: 126.9460 },
  { id: 'r6', name: '딤섬 하우스', cat: 'chinese', emoji: '🥟', rating: 4.3, dist: '1.6km', open: true, desc: '홍콩식 딤섬 · 짜장면', price: '₩10,000~', lat: 33.4560, lng: 126.9410 },
  { id: 'r7', name: '떡볶이집 맛나', cat: 'snack', emoji: '🌶️', rating: 4.2, dist: '0.2km', open: true, desc: '매운 떡볶이·순대·튀김', price: '₩5,000~', lat: 33.4595, lng: 126.9405 },
  { id: 'r8', name: '블루웨이브 카페', cat: 'cafe', emoji: '🌊', rating: 4.9, dist: '0.7km', open: true, desc: '스페셜티 커피·수제 케이크', price: '₩7,000~', lat: 33.4615, lng: 126.9415 },
  { id: 'r9', name: '용두암 횟집', cat: 'korean', emoji: '🐟', rating: 4.5, dist: '2.1km', open: false, desc: '활어회·갈치조림 전문', price: '₩20,000~', lat: 33.4545, lng: 126.9395 },
  { id: 'r10', name: '버거박스', cat: 'western', emoji: '🍔', rating: 4.1, dist: '0.9km', open: true, desc: '수제 버거·감자튀김', price: '₩9,000~', lat: 33.4605, lng: 126.9425 },
  { id: 'r11', name: '스시 하나비', cat: 'japanese', emoji: '🍣', rating: 4.7, dist: '1.8km', open: true, desc: '오마카세·니기리 스시', price: '₩35,000~', lat: 33.4575, lng: 126.9445 },
  { id: 'r12', name: '국수 한 그릇', cat: 'snack', emoji: '🍜', rating: 4.4, dist: '0.4km', open: true, desc: '제주 고기국수·빙떡', price: '₩8,000~', lat: 33.4588, lng: 126.9408 },
];

// ── 앱 상태 ────────────────────────────────────────────
let state = {
  group: null,
  schedule: [],
  expenses: [],
  splitMode: 'person',
  currentDay: 0,
  currentTab: 'group',
  userLat: null,
  userLng: null,
  localCat: 'all',
  expenseCat: 'all',
  pendingPlace: null,
};

// ── 세션 관리 ─────────────────────────────────────────
function clearSession() {
  localStorage.removeItem(TM_GROUP_KEY);
  localStorage.removeItem(TM_MEMBER_KEY);
  state.group = null;
  state.schedule = [];
  state.expenses = [];
}

async function loadGroupData(groupId) {
  const [gRes, mRes, pRes, eRes] = await Promise.all([
    sb.from('trip_groups').select('*').eq('id', groupId).single(),
    sb.from('trip_members').select('*').eq('group_id', groupId).order('created_at'),
    sb.from('trip_places').select('*').eq('group_id', groupId).order('day_index').order('created_at'),
    sb.from('trip_expenses').select('*').eq('group_id', groupId).order('created_at'),
  ]);

  if (gRes.error || !gRes.data) { clearSession(); return false; }

  const g = gRes.data;
  const myId = localStorage.getItem(TM_MEMBER_KEY);

  state.group = {
    id: g.id,
    name: g.name,
    dest: g.dest,
    startDate: g.start_date,
    endDate: g.end_date,
    code: g.code,
    households: g.households,
    members: (mRes.data || []).map(m => ({
      id: m.id,
      name: m.name,
      isMe: m.id === myId,
      lastSeen: m.is_online ? '온라인' : '',
    })),
  };

  // 일정 배열 재구성
  const totalDays = g.start_date && g.end_date ? daysBetween(g.start_date, g.end_date) : 1;
  state.schedule = [];
  for (let i = 0; i < totalDays; i++) {
    const date = g.start_date ? addDays(g.start_date, i) : new Date().toISOString().slice(0, 10);
    state.schedule.push({
      date,
      places: (pRes.data || [])
        .filter(p => p.day_index === i)
        .map(p => ({
          id: p.id,
          name: p.name,
          type: p.type || 'other',
          time: p.time || '',
          address: p.address || '',
          note: p.note || '',
          lat: p.lat,
          lng: p.lng,
        })),
    });
  }

  state.expenses = (eRes.data || []).map(e => ({
    id: e.id,
    name: e.name,
    amount: Number(e.amount),
    category: e.category || 'other',
    payer: e.payer || '',
    date: e.date || '',
    note: e.note || '',
    receipt: e.receipt_url || null,
  }));

  return true;
}

// ── 유틸 ──────────────────────────────────────────────
function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function formatKRW(n) {
  if (!n || isNaN(n)) return '₩0';
  return '₩' + Number(n).toLocaleString('ko-KR');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDateFull(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth()+1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

function daysBetween(start, end) {
  if (!start || !end) return 0;
  const ms = new Date(end) - new Date(start);
  return Math.max(0, Math.floor(ms / 86400000)) + 1;
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function destEmoji(dest) {
  if (!dest) return '✈️';
  for (const [k, v] of Object.entries(EMOJIS_BY_DEST)) {
    if (dest.includes(k)) return v;
  }
  return '✈️';
}

function avatarColor(name) {
  const colors = ['#FF6B35','#3A86FF','#27AE60','#E74C3C','#9B59B6','#F39C12','#1ABC9C'];
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(hash) % colors.length];
}

// ── Toast ─────────────────────────────────────────────
function showToast(msg, type = '') {
  const wrap = document.getElementById('toastWrap');
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 2700);
}

// ── Modal ─────────────────────────────────────────────
function openModal(id) {
  document.getElementById('modal-' + id).classList.remove('hidden');
  document.getElementById('modal-' + id).classList.add('open');
}
function closeModal(id) {
  document.getElementById('modal-' + id).classList.add('hidden');
  document.getElementById('modal-' + id).classList.remove('open');
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
  if (tab === 'local') {
    renderRestaurants();
    requestLocation();
  }
  if (tab === 'expense') renderExpenses();
  if (tab === 'schedule') renderSchedule();
}

// ══════════════════════════════════════════════════════
//  그룹 탭
// ══════════════════════════════════════════════════════
function renderGroupTab() {
  const noGroup = document.getElementById('noGroupState');
  const groupState = document.getElementById('groupState');
  const leaveBtn = document.getElementById('leaveGroupBtn');

  if (!state.group) {
    noGroup.classList.remove('hidden');
    groupState.classList.add('hidden');
    leaveBtn.style.display = 'none';
    document.getElementById('appBarTitle').textContent = '트립메이트';
    return;
  }

  noGroup.classList.add('hidden');
  groupState.classList.remove('hidden');
  leaveBtn.style.display = '';

  const g = state.group;
  document.getElementById('appBarTitle').textContent = g.name;
  document.getElementById('groupEmojiWrap').textContent = destEmoji(g.dest);
  document.getElementById('groupNameText').textContent = g.name;
  document.getElementById('groupDestText').textContent = g.dest || '목적지 미설정';
  document.getElementById('inviteCodeDisplay').textContent = g.code;

  if (g.startDate && g.endDate) {
    const n = daysBetween(g.startDate, g.endDate);
    document.getElementById('groupDatesText').textContent =
      `${formatDate(g.startDate)} ~ ${formatDate(g.endDate)} (${n}일)`;
  } else {
    document.getElementById('groupDatesText').textContent = '날짜 미설정';
  }

  const ml = document.getElementById('memberList');
  ml.innerHTML = '';
  document.getElementById('memberBadge').textContent = g.members.length;
  g.members.forEach(m => {
    const li = document.createElement('li');
    li.className = 'member-item';
    const bg = avatarColor(m.name);
    li.innerHTML = `
      <div class="member-avatar" style="background:${bg}">${m.name.slice(0, 1)}</div>
      <span class="member-name">${m.name}</span>
      ${m.isMe ? '<span class="member-me">나</span>' : ''}
      <span class="member-loc">${m.lastSeen || ''}</span>
    `;
    ml.appendChild(li);
  });

  const infoBlock = document.getElementById('tripInfoBlock');
  const nights = g.startDate && g.endDate ? daysBetween(g.startDate, g.endDate) - 1 : 0;
  infoBlock.innerHTML = `
    <div class="info-row"><span class="info-icon">📍</span><div><span class="info-label">여행지</span><div class="info-value">${g.dest || '미설정'}</div></div></div>
    <div class="info-row"><span class="info-icon">📅</span><div><span class="info-label">일정</span><div class="info-value">${g.startDate ? `${formatDateFull(g.startDate)} ~ ${formatDateFull(g.endDate)} (${nights}박 ${nights+1}일)` : '미설정'}</div></div></div>
    <div class="info-row"><span class="info-icon">👥</span><div><span class="info-label">멤버</span><div class="info-value">${g.members.length}명${g.households > 1 ? ` / ${g.households}가구` : ''}</div></div></div>
    <div class="info-row"><span class="info-icon">💰</span><div><span class="info-label">총 경비</span><div class="info-value">${formatKRW(state.expenses.reduce((s,e) => s + Number(e.amount), 0))}</div></div></div>
  `;
}

async function createGroup() {
  const name = document.getElementById('cgName').value.trim();
  const dest = document.getElementById('cgDest').value.trim();
  const startDate = document.getElementById('cgStart').value;
  const endDate = document.getElementById('cgEnd').value;
  const myName = document.getElementById('cgMyName').value.trim();

  if (!name) { showToast('그룹 이름을 입력하세요', 'error'); return; }
  if (!myName) { showToast('내 이름을 입력하세요', 'error'); return; }
  if (startDate && endDate && endDate < startDate) {
    showToast('귀환일이 출발일보다 빠릅니다', 'error'); return;
  }

  showToast('그룹 만드는 중...', '');

  const { data: grp, error: grpErr } = await sb.from('trip_groups').insert({
    name, dest: dest || null,
    start_date: startDate || null, end_date: endDate || null,
    code: genCode(), households: 1,
  }).select().single();

  if (grpErr) { showToast('오류: ' + grpErr.message, 'error'); return; }

  const { data: member, error: mErr } = await sb.from('trip_members').insert({
    group_id: grp.id, name: myName, is_online: true,
  }).select().single();

  if (mErr) { showToast('오류: ' + mErr.message, 'error'); return; }

  localStorage.setItem(TM_GROUP_KEY, grp.id);
  localStorage.setItem(TM_MEMBER_KEY, member.id);

  await loadGroupData(grp.id);
  closeModal('create-group');
  showToast('그룹이 만들어졌습니다! 🎉', 'success');
  renderGroupTab();
  renderSchedule();
  subscribeRealtime(grp.id);
}

async function joinGroup() {
  const code = document.getElementById('jgCode').value.trim().toUpperCase();
  const myName = document.getElementById('jgMyName').value.trim();

  if (code.length !== 6) { showToast('6자리 코드를 입력하세요', 'error'); return; }
  if (!myName) { showToast('내 이름을 입력하세요', 'error'); return; }

  showToast('그룹 찾는 중...', '');

  const { data: grp, error } = await sb.from('trip_groups').select('*').eq('code', code).single();

  if (error || !grp) { showToast('코드를 찾을 수 없습니다', 'error'); return; }

  const { data: member, error: mErr } = await sb.from('trip_members').insert({
    group_id: grp.id, name: myName, is_online: true,
  }).select().single();

  if (mErr) { showToast('오류: ' + mErr.message, 'error'); return; }

  localStorage.setItem(TM_GROUP_KEY, grp.id);
  localStorage.setItem(TM_MEMBER_KEY, member.id);

  await loadGroupData(grp.id);
  closeModal('join-group');
  showToast(`${myName}님, 그룹에 합류했습니다! 🎉`, 'success');
  renderGroupTab();
  renderSchedule();
  subscribeRealtime(grp.id);
}

async function editTrip() {
  if (!state.group) return;
  const name = document.getElementById('etName').value.trim();
  const dest = document.getElementById('etDest').value.trim();
  const startDate = document.getElementById('etStart').value;
  const endDate = document.getElementById('etEnd').value;
  const households = parseInt(document.getElementById('etHouseholds').value) || 1;

  if (!name) { showToast('그룹 이름을 입력하세요', 'error'); return; }

  const { error } = await sb.from('trip_groups').update({
    name, dest: dest || null,
    start_date: startDate || null, end_date: endDate || null,
    households: Math.max(1, households),
  }).eq('id', state.group.id);

  if (error) { showToast('저장 실패', 'error'); return; }

  await loadGroupData(state.group.id);
  closeModal('edit-trip');
  showToast('저장되었습니다', 'success');
  renderGroupTab();
  renderSchedule();
}

async function leaveGroup() {
  if (!confirm('그룹에서 나가시겠습니까?')) return;

  const myId = localStorage.getItem(TM_MEMBER_KEY);
  if (myId) await sb.from('trip_members').delete().eq('id', myId);

  if (realtimeSub) { realtimeSub.unsubscribe(); realtimeSub = null; }
  clearSession();
  renderGroupTab();
  renderSchedule();
  renderExpenses();
  showToast('그룹을 떠났습니다');
}

// ══════════════════════════════════════════════════════
//  카카오 로그인 (OAuth authorization code flow)
// ══════════════════════════════════════════════════════
const KAKAO_APP_KEY  = '1ed552a04cbafec60a1206e37ee1bdeb';
const KAKAO_REST_KEY = '7ace39f51d1cf293ddcd0e88da29ea5c';
const KAKAO_REDIRECT = location.origin + location.pathname.replace(/\/$/, '');

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let _destTimer = null;
let _kakaoMapsReady = false;
function ensureKakaoMaps() {
  if (_kakaoMapsReady) return Promise.resolve();
  return new Promise(resolve => {
    kakao.maps.load(() => { _kakaoMapsReady = true; resolve(); });
  });
}

function searchKakaoPlaces(query) {
  if (!query) return Promise.resolve([]);
  return ensureKakaoMaps().then(() => new Promise(resolve => {
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(query, (data, status) => {
      if (status === kakao.maps.services.Status.OK) resolve(data.slice(0, 6));
      else resolve([]);
    }, { size: 6 });
  }));
}

function bindDestInput(inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const box = document.getElementById(suggestionsId);
  if (!input || !box) return;
  input.addEventListener('input', () => {
    clearTimeout(_destTimer);
    const q = input.value.trim();
    if (q.length < 1) { box.classList.add('hidden'); return; }
    _destTimer = setTimeout(async () => {
      const places = await searchKakaoPlaces(q);
      if (!places.length) { box.classList.add('hidden'); return; }
      box.innerHTML = places.map(p => `
        <div class="place-suggestion-item" data-name="${escapeHtml(p.place_name)}">
          <span class="ps-name">${escapeHtml(p.place_name)}</span>
          <span class="ps-addr">${escapeHtml(p.road_address_name || p.address_name || '')}</span>
        </div>`).join('');
      box.classList.remove('hidden');
      box.querySelectorAll('.place-suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          input.value = item.dataset.name;
          box.classList.add('hidden');
        });
      });
    }, 300);
  });
  input.addEventListener('blur', () => setTimeout(() => box.classList.add('hidden'), 200));
}

async function getOrLoginKakao(intent) {
  const cached = localStorage.getItem(TM_KAKAO_KEY);
  if (cached) return JSON.parse(cached);

  localStorage.setItem('tm_kakao_intent', JSON.stringify(intent || {}));
  // Kakao JS SDK authorize (response_type=code)
  if (window.Kakao?.isInitialized()) {
    Kakao.Auth.authorize({
      redirectUri: KAKAO_REDIRECT,
      scope: 'profile_nickname,profile_image',
    });
  } else {
    const qs = new URLSearchParams({
      client_id: KAKAO_APP_KEY,
      redirect_uri: KAKAO_REDIRECT,
      response_type: 'code',
      scope: 'profile_nickname profile_image',
    });
    location.href = `https://kauth.kakao.com/oauth/authorize?${qs}`;
  }
  return null;
}

async function handleKakaoCallback() {
  const urlParams = new URLSearchParams(location.search);
  const authCode = urlParams.get('code');
  if (!authCode) return;

  // URL에서 code 파라미터 제거 (뒤로가기 재실행 방지)
  const cleanUrl = new URL(location.href);
  cleanUrl.searchParams.delete('code');
  cleanUrl.searchParams.delete('error');
  history.replaceState(null, '', cleanUrl.toString());

  try {
    showToast('카카오 로그인 중...', '');

    // 인가코드 → 액세스 토큰 교환
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_APP_KEY,
        redirect_uri: KAKAO_REDIRECT,
        code: authCode,
      }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      showToast('카카오 토큰 오류: ' + (tokenData.error_description || tokenData.error), 'error');
      return;
    }

    const accessToken = tokenData.access_token;
    if (window.Kakao?.isInitialized()) Kakao.Auth.setAccessToken(accessToken);

    // 사용자 프로필 조회
    const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await profileRes.json();
    const user = {
      id: String(data.id),
      nickname: data.kakao_account?.profile?.nickname || '여행자',
      profileImage: data.kakao_account?.profile?.profile_image_url || null,
      accessToken,
    };
    localStorage.setItem(TM_KAKAO_KEY, JSON.stringify(user));
    renderKakaoProfileBanner(user);

    // 저장된 intent 복원
    const intentStr = localStorage.getItem('tm_kakao_intent');
    localStorage.removeItem('tm_kakao_intent');
    const intent = intentStr ? JSON.parse(intentStr) : {};

    if (intent.action === 'create') {
      document.getElementById('cgMyName').value = user.nickname;
      renderKakaoModalStrip('cgKakaoStrip', user);
      openModal('create-group');
    } else if (intent.action === 'join') {
      if (intent.inviteCode) document.getElementById('jgCode').value = intent.inviteCode;
      document.getElementById('jgMyName').value = user.nickname;
      renderKakaoModalStrip('jgKakaoStrip', user);
      openModal('join-group');
    }
    showToast(`안녕하세요, ${user.nickname}님 👋`, 'success');
  } catch(e) {
    showToast('카카오 로그인 처리 중 오류가 발생했습니다', 'error');
    console.error(e);
  }
}

function kakaoLogout() {
  if (window.Kakao?.isInitialized() && Kakao.Auth.getAccessToken()) {
    Kakao.Auth.logout();
  }
  localStorage.removeItem(TM_KAKAO_KEY);
  localStorage.removeItem('tm_kakao_intent');
  renderKakaoProfileBanner(null);
  showToast('카카오 로그아웃 됐습니다');
}

function renderKakaoProfileBanner(user) {
  const el = document.getElementById('kakaoProfileBanner');
  if (!el) return;
  if (!user) { el.classList.add('hidden'); return; }
  const av = user.profileImage
    ? `<img class="kakao-avatar" src="${user.profileImage}" alt="">`
    : `<span class="kakao-avatar-fallback">😊</span>`;
  el.innerHTML = `
    ${av}
    <div class="kakao-profile-info">
      <div class="kakao-profile-hello">카카오 계정</div>
      <div class="kakao-profile-name">${user.nickname}</div>
    </div>
    <button class="kakao-logout-btn" onclick="kakaoLogout()">로그아웃</button>
  `;
  el.classList.remove('hidden');
}

function renderKakaoModalStrip(stripId, user) {
  const el = document.getElementById(stripId);
  if (!el || !user) return;
  const av = user.profileImage
    ? `<img class="km-avatar" src="${user.profileImage}" alt="">`
    : `<span class="km-avatar">😊</span>`;
  el.innerHTML = `
    <div class="kakao-user-row">
      ${av}
      <span class="km-name">${user.nickname}</span>
      <span class="km-badge">카카오 로그인</span>
    </div>
  `;
}

function shareGroup() {
  if (!state.group) { showToast('먼저 그룹을 만드세요'); return; }
  const url = `${location.origin}${location.pathname}?invite=${state.group.code}`;
  if (navigator.share) {
    navigator.share({ title: state.group.name, text: `트립메이트 초대 코드: ${state.group.code}`, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => showToast('링크가 복사되었습니다 📋', 'success')).catch(() => showToast('코드: ' + state.group.code));
  }
}

function kakaoShare() {
  if (!state.group) return;
  const code = state.group.code;
  const url = `${location.origin}${location.pathname}?invite=${code}`;

  if (window.Kakao && Kakao.isInitialized()) {
    const dateStr = state.group.start_date
      ? `${formatDate(state.group.start_date)} ~ ${formatDate(state.group.end_date)}`
      : '일정 미정';
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `${state.group.name} 여행에 초대합니다! ✈️`,
        description: `초대 코드: ${code}  ·  ${state.group.dest || ''}  ${dateStr}`,
        imageUrl: 'https://tripmate-seven-wine.vercel.app/assets/tripmate-icon-512.png',
        link: { mobileWebUrl: url, webUrl: url }
      },
      buttons: [{ title: '여행 참여하기', link: { mobileWebUrl: url, webUrl: url } }]
    });
  } else {
    navigator.clipboard.writeText(url).then(() => {
      showToast('초대 링크가 복사됐습니다 📋', 'success');
    }).catch(() => {
      showToast(`초대 코드: ${code}`, 'success');
    });
  }
}

// ══════════════════════════════════════════════════════
//  일정 탭
// ══════════════════════════════════════════════════════
function renderSchedule() {
  const rangeLabel = document.getElementById('tripRangeLabel');
  const dayTabBar = document.getElementById('dayTabBar');
  const timelineWrap = document.getElementById('timelineWrap');

  if (!state.group) {
    rangeLabel.textContent = '그룹을 먼저 만드세요';
    dayTabBar.innerHTML = '';
    timelineWrap.innerHTML = '<div class="empty-schedule"><span>📅</span><p>그룹을 먼저 만들어주세요</p></div>';
    return;
  }

  const g = state.group;
  if (g.startDate && g.endDate) {
    const n = daysBetween(g.startDate, g.endDate);
    rangeLabel.textContent = `${formatDate(g.startDate)} ~ ${formatDate(g.endDate)} (${n}일)`;
  } else {
    rangeLabel.textContent = '날짜를 설정하세요';
  }

  dayTabBar.innerHTML = '';
  state.schedule.forEach((day, i) => {
    const btn = document.createElement('button');
    btn.className = 'day-tab' + (i === state.currentDay ? ' active' : '');
    const d = new Date(day.date);
    const weekdays = ['일','월','화','수','목','금','토'];
    btn.innerHTML = `
      <span class="day-num">Day ${i+1}</span>
      <span class="day-date">${d.getMonth()+1}/${d.getDate()}</span>
      <span class="day-count">${weekdays[d.getDay()]} · ${day.places.length}곳</span>
    `;
    btn.onclick = () => { state.currentDay = i; renderSchedule(); };
    dayTabBar.appendChild(btn);
  });

  const day = state.schedule[state.currentDay];
  if (!day || day.places.length === 0) {
    timelineWrap.innerHTML = '<div class="empty-schedule"><span>📅</span><p>+ 장소 버튼으로 일정을 추가하세요</p></div>';
    return;
  }

  const sorted = [...day.places].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  timelineWrap.innerHTML = '';
  const timeline = document.createElement('div');
  timeline.className = 'timeline';

  sorted.forEach(place => {
    const card = document.createElement('div');
    card.className = 'place-card';
    card.innerHTML = `
      <div class="place-pin type-${place.type}">${TYPE_EMOJI[place.type] || '📍'}</div>
      <div class="place-info">
        <div class="place-info-top">
          <span class="place-name">${place.name}</span>
          <span class="place-time">${place.time || ''}</span>
        </div>
        ${place.address ? `<div class="place-address">📍 ${place.address}</div>` : ''}
        ${place.note ? `<div class="place-note">${place.note}</div>` : ''}
        <div class="place-nav-row">
          <button class="nav-btn" onclick="openNavForPlace(${place.lat || 0},${place.lng || 0},'${encodeURIComponent(place.name)}','kakao')">🗺️카카오</button>
          <button class="nav-btn" onclick="openNavForPlace(${place.lat || 0},${place.lng || 0},'${encodeURIComponent(place.name)}','naver')">🌿네이버</button>
          <button class="nav-btn" onclick="openNavForPlace(${place.lat || 0},${place.lng || 0},'${encodeURIComponent(place.name)}','tmap')">🚗T맵</button>
          <button class="place-del-btn" onclick="deletePlace('${place.id}')">🗑</button>
        </div>
      </div>
    `;
    timeline.appendChild(card);
  });

  timelineWrap.appendChild(timeline);
}

function openAddPlaceModal() {
  if (!state.group) { showToast('먼저 그룹을 만드세요', 'error'); return; }

  const daySelect = document.getElementById('apDay');
  daySelect.innerHTML = '';
  state.schedule.forEach((day, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `Day ${i+1} (${formatDate(day.date)})`;
    if (i === state.currentDay) opt.selected = true;
    daySelect.appendChild(opt);
  });

  document.getElementById('apName').value = '';
  document.getElementById('apAddress').value = '';
  document.getElementById('apNote').value = '';
  document.getElementById('apCoords').classList.add('hidden');
  document.getElementById('placeSearchResults').classList.add('hidden');
  document.getElementById('apTime').value = '09:00';
  state.pendingPlace = null;

  openModal('add-place');
}

function searchPlace() {
  const query = document.getElementById('apAddress').value.trim();
  if (!query) return;

  const results = PLACE_DB.filter(p =>
    p.name.includes(query) || p.addr.includes(query)
  ).slice(0, 5);

  const container = document.getElementById('placeSearchResults');
  container.innerHTML = '';
  container.classList.remove('hidden');

  if (results.length === 0) {
    container.innerHTML = '<div class="search-result-item"><strong>검색 결과 없음</strong><span>직접 좌표를 입력하거나 이름만 추가하세요</span></div>';
    return;
  }

  results.forEach(p => {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    item.innerHTML = `<strong>${p.name}</strong><span>${p.addr}</span>`;
    item.onclick = () => {
      document.getElementById('apAddress').value = p.addr;
      document.getElementById('apName').value = document.getElementById('apName').value || p.name;
      state.pendingPlace = { lat: p.lat, lng: p.lng, address: p.addr };
      const coords = document.getElementById('apCoords');
      coords.textContent = `📍 ${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`;
      coords.classList.remove('hidden');
      container.classList.add('hidden');
    };
    container.appendChild(item);
  });
}

async function addPlace() {
  const name = document.getElementById('apName').value.trim();
  if (!name) { showToast('장소 이름을 입력하세요', 'error'); return; }

  const dayIdx = parseInt(document.getElementById('apDay').value);

  const { error } = await sb.from('trip_places').insert({
    group_id: state.group.id,
    day_index: dayIdx,
    name,
    type: document.getElementById('apType').value,
    time: document.getElementById('apTime').value || null,
    address: document.getElementById('apAddress').value.trim() || null,
    note: document.getElementById('apNote').value.trim() || null,
    lat: state.pendingPlace?.lat || null,
    lng: state.pendingPlace?.lng || null,
  });

  if (error) { showToast('추가 실패: ' + error.message, 'error'); return; }

  state.currentDay = dayIdx;
  await loadGroupData(state.group.id);
  closeModal('add-place');
  showToast(`${name} 추가됨 ✅`, 'success');
  renderSchedule();
  if (mapInstance) refreshMapMarkers();
}

async function deletePlace(placeId) {
  const { error } = await sb.from('trip_places').delete().eq('id', placeId);
  if (error) { showToast('삭제 실패', 'error'); return; }

  await loadGroupData(state.group.id);
  renderSchedule();
  if (mapInstance) refreshMapMarkers();
  showToast('삭제되었습니다');
}

// ── 지도 앱 딥링크 ─────────────────────────────────────
function openNavForPlace(lat, lng, encodedName, app) {
  openNavApp(app, lat, lng, decodeURIComponent(encodedName));
}

function openNavApp(app, lat, lng, name) {
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  let url = '';
  if (app === 'kakao') {
    url = lat ? `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`
              : `https://map.kakao.com/`;
  } else if (app === 'naver') {
    url = lat ? `https://map.naver.com/index.nhn?lat=${lat}&lng=${lng}&title=${encodeURIComponent(name)}&zoom=16`
              : `https://map.naver.com/`;
  } else if (app === 'tmap') {
    url = isMobile && lat ? `tmap://route?goalname=${encodeURIComponent(name)}&goaly=${lat}&goalx=${lng}`
                          : `https://www.tmap.co.kr/`;
  }
  window.open(url, '_blank');
}

// ══════════════════════════════════════════════════════
//  지도 탭 (Leaflet)
// ══════════════════════════════════════════════════════
let mapInstance = null;
let mapMarkersLayer = null;
let routeLayer = null;
let myLocMarker = null;

function initMap() {
  if (mapInstance) {
    setTimeout(() => mapInstance.invalidateSize(), 100);
    refreshMapMarkers();
    return;
  }

  mapInstance = L.map('leafletMap', {
    center: getMapCenter(),
    zoom: 12,
    zoomControl: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(mapInstance);

  mapMarkersLayer = L.layerGroup().addTo(mapInstance);
  routeLayer = L.layerGroup().addTo(mapInstance);

  refreshMapMarkers();
  requestLocation();
}

function getMapCenter() {
  for (const day of state.schedule) {
    for (const p of day.places) {
      if (p.lat && p.lng) return [p.lat, p.lng];
    }
  }
  return [36.5, 127.8];
}

function refreshMapMarkers() {
  if (!mapInstance) return;
  mapMarkersLayer.clearLayers();
  routeLayer.clearLayers();

  const activeLayer = document.querySelector('.map-layer-btn.active')?.dataset.layer || 'all';
  const coordPairs = [];

  if (activeLayer === 'all' || activeLayer === 'places') {
    state.schedule.forEach((day, di) => {
      day.places.forEach(place => {
        if (!place.lat || !place.lng) return;
        coordPairs.push([place.lat, place.lng]);

        const icon = L.divIcon({
          html: `<div style="background:${pinColorByType(place.type)};color:#fff;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,.3);border:3px solid #fff">${TYPE_EMOJI[place.type]}</div>`,
          iconSize: [36, 36],
          className: '',
        });

        L.marker([place.lat, place.lng], { icon })
          .bindPopup(`
            <span class="popup-title">${place.name}</span>
            <span class="popup-sub">${TYPE_LABEL[place.type]} · Day ${di+1} ${place.time || ''}</span>
            <div class="popup-nav-row">
              <button class="popup-nav-btn" onclick="openNavForPlace(${place.lat},${place.lng},'${encodeURIComponent(place.name)}','kakao')">카카오</button>
              <button class="popup-nav-btn" onclick="openNavForPlace(${place.lat},${place.lng},'${encodeURIComponent(place.name)}','naver')">네이버</button>
              <button class="popup-nav-btn" onclick="openNavForPlace(${place.lat},${place.lng},'${encodeURIComponent(place.name)}','tmap')">T맵</button>
            </div>
          `, { maxWidth: 220 })
          .addTo(mapMarkersLayer);
      });
    });
  }

  if ((activeLayer === 'all' || activeLayer === 'route') && coordPairs.length > 1) {
    L.polyline(coordPairs, { color: '#FF6B35', weight: 3, opacity: .7, dashArray: '8,6' })
      .addTo(routeLayer);
  }

  if ((activeLayer === 'all' || activeLayer === 'members') && state.group) {
    state.group.members.forEach((m, i) => {
      const base = coordPairs[0] || [36.5, 127.8];
      const jitter = (seed) => (((seed * 9301 + 49297) % 233280) / 233280 - 0.5) * 0.02;
      const lat = base[0] + jitter(i * 17);
      const lng = base[1] + jitter(i * 31);
      const color = avatarColor(m.name);
      const icon = L.divIcon({
        html: `<div style="background:${color};color:#fff;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:700;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)">${m.name.slice(0,1)}</div>`,
        iconSize: [32, 32],
        className: '',
      });
      L.marker([lat, lng], { icon })
        .bindPopup(`<span class="popup-title">${m.name}</span><span class="popup-sub">${m.isMe ? '나' : '멤버'}</span>`)
        .addTo(mapMarkersLayer);
    });
  }

  if (coordPairs.length > 0) {
    mapInstance.fitBounds(coordPairs.length === 1 ? L.latLng(coordPairs[0]).toBounds(1000) : coordPairs, { padding: [40, 40] });
  }
}

function pinColorByType(type) {
  const colors = { attraction:'#FF6B35', accommodation:'#3A86FF', restaurant:'#FF6B6B', cafe:'#A98467', transport:'#4ECDC4', shopping:'#C77DFF', other:'#718096' };
  return colors[type] || '#FF6B35';
}

function requestLocation() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    pos => {
      state.userLat = pos.coords.latitude;
      state.userLng = pos.coords.longitude;
      document.getElementById('myLocationText').textContent =
        `위치 확인됨 (${state.userLat.toFixed(4)}, ${state.userLng.toFixed(4)})`;

      if (mapInstance) {
        if (myLocMarker) myLocMarker.remove();
        const icon = L.divIcon({
          html: `<div style="background:#3A86FF;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 6px rgba(58,134,255,.2)"></div>`,
          iconSize: [16, 16],
          className: '',
        });
        myLocMarker = L.marker([state.userLat, state.userLng], { icon })
          .bindPopup('<span class="popup-title">내 위치</span>')
          .addTo(mapInstance);
      }
    },
    () => {
      document.getElementById('myLocationText').textContent = '위치 접근 거부됨';
    },
    { enableHighAccuracy: true }
  );
}

// ══════════════════════════════════════════════════════
//  경비 탭
// ══════════════════════════════════════════════════════
function renderExpenses() {
  const total = state.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const memberCount = state.group?.members.length || 1;
  const houseCount = state.group?.households || 1;

  document.getElementById('expenseTotalDisplay').textContent = formatKRW(total);

  const isHousehold = state.splitMode === 'household';
  const divisor = isHousehold ? houseCount : memberCount;
  const perAmount = divisor > 0 ? Math.ceil(total / divisor) : 0;

  document.getElementById('splitLabel').textContent = isHousehold ? '가구당' : '1인당';
  document.getElementById('expensePerDisplay').textContent = formatKRW(perAmount);
  document.getElementById('splitDesc').textContent = isHousehold
    ? `${houseCount}가구 기준`
    : `${memberCount}명 기준`;

  const list = document.getElementById('expenseList');
  const filtered = state.expenseCat === 'all'
    ? state.expenses
    : state.expenses.filter(e => e.category === state.expenseCat);

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-expense"><span>💰</span><p>경비를 추가해보세요</p></div>';
    return;
  }

  list.innerHTML = '';
  [...filtered].reverse().forEach(exp => {
    const perPerson = divisor > 0 ? Math.ceil(Number(exp.amount) / divisor) : 0;
    const item = document.createElement('div');
    item.className = 'expense-item';
    item.innerHTML = `
      <div class="expense-cat-icon">${CAT_EMOJI[exp.category] || '📝'}</div>
      <div class="expense-details">
        <div class="expense-name">${exp.name}</div>
        <div class="expense-meta">${CAT_LABEL[exp.category] || '기타'} · ${exp.payer || '미지정'} · ${exp.date || ''}</div>
      </div>
      ${exp.receipt ? `<img class="expense-receipt-thumb" src="${exp.receipt}" alt="영수증">` : ''}
      <div class="expense-right">
        <div class="expense-amount">${formatKRW(exp.amount)}</div>
        <div class="expense-per">${isHousehold ? '가구당' : '1인당'} ${formatKRW(perPerson)}</div>
      </div>
      <button class="expense-del-btn" onclick="deleteExpense('${exp.id}')">🗑</button>
    `;
    list.appendChild(item);
  });
}

function openAddExpenseModal() {
  if (!state.group) { showToast('먼저 그룹을 만드세요', 'error'); return; }

  document.getElementById('aeName').value = '';
  document.getElementById('aeAmount').value = '';
  document.getElementById('aeNote').value = '';
  document.getElementById('receiptFileName').textContent = '';
  document.getElementById('receiptThumb').innerHTML = '';
  document.getElementById('receiptThumb').classList.add('hidden');
  document.getElementById('aeDate').value = new Date().toISOString().slice(0,10);

  const payerSelect = document.getElementById('aePayer');
  payerSelect.innerHTML = '<option value="">선택 안 함</option>';
  state.group.members.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.name;
    opt.textContent = m.name + (m.isMe ? ' (나)' : '');
    if (m.isMe) opt.selected = true;
    payerSelect.appendChild(opt);
  });

  openModal('add-expense');
}

async function addExpense() {
  const name = document.getElementById('aeName').value.trim();
  const amount = parseFloat(document.getElementById('aeAmount').value);

  if (!name) { showToast('항목명을 입력하세요', 'error'); return; }
  if (!amount || amount <= 0) { showToast('금액을 입력하세요', 'error'); return; }

  const insertData = {
    group_id: state.group.id,
    name, amount,
    category: document.getElementById('aeCat').value,
    payer: document.getElementById('aePayer').value || null,
    date: document.getElementById('aeDate').value || null,
    note: document.getElementById('aeNote').value.trim() || null,
    receipt_url: null,
  };

  const fileInput = document.getElementById('aeReceipt');
  if (fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      insertData.receipt_url = e.target.result;
      const { error } = await sb.from('trip_expenses').insert(insertData);
      if (error) { showToast('추가 실패', 'error'); return; }
      await loadGroupData(state.group.id);
      closeModal('add-expense');
      showToast(`${name} 추가됨 ✅`, 'success');
      renderExpenses();
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    const { error } = await sb.from('trip_expenses').insert(insertData);
    if (error) { showToast('추가 실패', 'error'); return; }
    await loadGroupData(state.group.id);
    closeModal('add-expense');
    showToast(`${name} 추가됨 ✅`, 'success');
    renderExpenses();
  }
}

async function deleteExpense(id) {
  const { error } = await sb.from('trip_expenses').delete().eq('id', id);
  if (error) { showToast('삭제 실패', 'error'); return; }

  await loadGroupData(state.group.id);
  renderExpenses();
  showToast('삭제되었습니다');
}

// ══════════════════════════════════════════════════════
//  맛집 탭
// ══════════════════════════════════════════════════════
function renderRestaurants() {
  const list = document.getElementById('restaurantList');
  const filtered = state.localCat === 'all'
    ? RESTAURANTS
    : RESTAURANTS.filter(r => r.cat === state.localCat);

  list.innerHTML = '';
  filtered.forEach(r => {
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.innerHTML = `
      <div class="rest-emoji">${r.emoji}</div>
      <div class="rest-info">
        <div class="rest-name">${r.name}</div>
        <div class="rest-cat">${catKo(r.cat)} · ${r.price}</div>
        <div class="rest-meta">
          <span class="rest-rating">★ ${r.rating}</span>
          <span>·</span>
          <span>${r.dist}</span>
          <span>·</span>
          <span class="${r.open ? 'rest-open' : 'rest-closed'}">${r.open ? '영업 중' : '영업 종료'}</span>
        </div>
        <div class="rest-desc">${r.desc}</div>
      </div>
      <div class="rest-actions">
        <button class="rest-map-btn" onclick="openNavForPlace(${r.lat},${r.lng},'${encodeURIComponent(r.name)}','kakao')">지도</button>
        <button class="rest-add-btn" onclick="addRestaurantToSchedule('${r.id}')">일정+</button>
      </div>
    `;
    list.appendChild(card);
  });

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-expense"><span>🍽️</span><p>해당 카테고리 맛집이 없습니다</p></div>';
  }
}

function catKo(cat) {
  const map = { korean:'한식', cafe:'카페', western:'양식', japanese:'일식', chinese:'중식', snack:'분식' };
  return map[cat] || cat;
}

function addRestaurantToSchedule(id) {
  if (!state.group) { showToast('먼저 그룹을 만드세요', 'error'); return; }
  const r = RESTAURANTS.find(x => x.id === id);
  if (!r) return;

  document.getElementById('apName').value = r.name;
  document.getElementById('apType').value = r.cat === 'cafe' ? 'cafe' : 'restaurant';
  document.getElementById('apAddress').value = r.desc;
  state.pendingPlace = { lat: r.lat, lng: r.lng, address: r.desc };

  const daySelect = document.getElementById('apDay');
  daySelect.innerHTML = '';
  state.schedule.forEach((day, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `Day ${i+1} (${formatDate(day.date)})`;
    if (i === state.currentDay) opt.selected = true;
    daySelect.appendChild(opt);
  });

  const coords = document.getElementById('apCoords');
  coords.textContent = `📍 ${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}`;
  coords.classList.remove('hidden');
  document.getElementById('placeSearchResults').classList.add('hidden');

  openModal('add-place');
}

// ══════════════════════════════════════════════════════
//  Realtime 구독
// ══════════════════════════════════════════════════════
let realtimeSub = null;

function subscribeRealtime(groupId) {
  if (realtimeSub) realtimeSub.unsubscribe();

  realtimeSub = sb.channel('tm-' + groupId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_members', filter: `group_id=eq.${groupId}` }, async () => {
      await loadGroupData(groupId);
      renderGroupTab();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_places', filter: `group_id=eq.${groupId}` }, async () => {
      await loadGroupData(groupId);
      renderSchedule();
      if (mapInstance) refreshMapMarkers();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_expenses', filter: `group_id=eq.${groupId}` }, async () => {
      await loadGroupData(groupId);
      renderExpenses();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_groups', filter: `id=eq.${groupId}` }, async () => {
      await loadGroupData(groupId);
      renderGroupTab();
      renderSchedule();
    })
    .subscribe();
}

// ══════════════════════════════════════════════════════
//  이벤트 바인딩
// ══════════════════════════════════════════════════════
function bindEvents() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll('.modal-close, [data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.close || btn.closest('.modal-backdrop').id.replace('modal-', '');
      closeModal(id);
    });
  });
  document.querySelectorAll('.modal-backdrop').forEach(bd => {
    bd.addEventListener('click', e => {
      if (e.target === bd) closeModal(bd.id.replace('modal-', ''));
    });
  });

  // 그룹 탭
  document.getElementById('createGroupBtn').addEventListener('click', async () => {
    const user = await getOrLoginKakao({ action: 'create' });
    if (!user) return;
    document.getElementById('cgMyName').value = user.nickname;
    renderKakaoModalStrip('cgKakaoStrip', user);
    openModal('create-group');
  });
  document.getElementById('joinGroupBtn').addEventListener('click', async () => {
    const user = await getOrLoginKakao({ action: 'join' });
    if (!user) return;
    document.getElementById('jgMyName').value = user.nickname;
    renderKakaoModalStrip('jgKakaoStrip', user);
    openModal('join-group');
  });
  document.getElementById('confirmCreateGroup').addEventListener('click', createGroup);
  document.getElementById('confirmJoinGroup').addEventListener('click', joinGroup);
  document.getElementById('editTripBtn').addEventListener('click', () => {
    if (!state.group) return;
    document.getElementById('etName').value = state.group.name;
    document.getElementById('etDest').value = state.group.dest || '';
    document.getElementById('etStart').value = state.group.startDate || '';
    document.getElementById('etEnd').value = state.group.endDate || '';
    document.getElementById('etHouseholds').value = state.group.households || 1;
    openModal('edit-trip');
  });
  document.getElementById('confirmEditTrip').addEventListener('click', editTrip);
  document.getElementById('leaveGroupBtn').addEventListener('click', leaveGroup);
  document.getElementById('shareGroupBtn').addEventListener('click', shareGroup);
  document.getElementById('kakaoShareBtn').addEventListener('click', kakaoShare);
  document.getElementById('copyLinkBtn').addEventListener('click', shareGroup);
  document.getElementById('copyCodeBtn').addEventListener('click', () => {
    if (!state.group) return;
    navigator.clipboard.writeText(state.group.code)
      .then(() => showToast('코드 복사됨 📋', 'success'))
      .catch(() => showToast('코드: ' + state.group.code));
  });
  document.getElementById('addMemberBtn').addEventListener('click', () => openModal('join-group'));

  // 일정 탭
  document.getElementById('addPlaceBtn').addEventListener('click', openAddPlaceModal);
  document.getElementById('searchPlaceBtn').addEventListener('click', searchPlace);
  document.getElementById('apAddress').addEventListener('keydown', e => { if (e.key === 'Enter') searchPlace(); });
  document.getElementById('confirmAddPlace').addEventListener('click', addPlace);

  // 지도 탭
  document.querySelectorAll('.map-layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.map-layer-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      refreshMapMarkers();
    });
  });
  document.getElementById('myLocBtn').addEventListener('click', () => {
    requestLocation();
    if (mapInstance && state.userLat) mapInstance.setView([state.userLat, state.userLng], 15);
  });
  document.getElementById('openNavBtn').addEventListener('click', () => {
    document.getElementById('navSheet').classList.remove('hidden');
  });
  document.getElementById('closeNavSheet').addEventListener('click', () => {
    document.getElementById('navSheet').classList.add('hidden');
  });
  document.querySelectorAll('.nav-app-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const app = btn.dataset.app;
      const lat = state.userLat || state.schedule[0]?.places[0]?.lat;
      const lng = state.userLng || state.schedule[0]?.places[0]?.lng;
      openNavApp(app, lat, lng, state.group?.dest || '목적지');
      document.getElementById('navSheet').classList.add('hidden');
    });
  });

  // 경비 탭
  document.getElementById('addExpenseBtn').addEventListener('click', openAddExpenseModal);
  document.getElementById('confirmAddExpense').addEventListener('click', addExpense);
  document.querySelectorAll('.split-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.split-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.splitMode = btn.dataset.split;
      renderExpenses();
    });
  });
  document.querySelectorAll('[data-ecat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-ecat]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.expenseCat = btn.dataset.ecat;
      renderExpenses();
    });
  });

  document.getElementById('receiptPickBtn').addEventListener('click', () => {
    document.getElementById('aeReceipt').click();
  });
  document.getElementById('aeReceipt').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    document.getElementById('receiptFileName').textContent = file.name;
    const reader = new FileReader();
    reader.onload = ev => {
      const thumb = document.getElementById('receiptThumb');
      thumb.innerHTML = `<img src="${ev.target.result}" alt="영수증 미리보기">`;
      thumb.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  // 맛집 탭
  document.querySelectorAll('[data-lcat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-lcat]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.localCat = btn.dataset.lcat;
      renderRestaurants();
    });
  });
  document.getElementById('refreshLocationBtn').addEventListener('click', requestLocation);

  // 여행지 자동완성
  bindDestInput('cgDest', 'cgDestSuggestions');
  bindDestInput('etDest', 'etDestSuggestions');

  // URL 파라미터 (초대 링크: ?invite=XXXXXX)
  const urlParams = new URLSearchParams(location.search);
  const inviteFromUrl = urlParams.get('invite');
  if (inviteFromUrl) {
    const code = inviteFromUrl.toUpperCase();
    document.getElementById('jgCode').value = code;
    if (!state.group) {
      (async () => {
        const user = await getOrLoginKakao({ action: 'join', inviteCode: code });
        if (!user) return;
        document.getElementById('jgMyName').value = user.nickname;
        renderKakaoModalStrip('jgKakaoStrip', user);
        openModal('join-group');
      })();
    }
  }
}

// ══════════════════════════════════════════════════════
//  앱 초기화
// ══════════════════════════════════════════════════════
async function init() {
  if (window.Kakao && !Kakao.isInitialized()) {
    Kakao.init(KAKAO_APP_KEY);
  }

  // 카카오 OAuth 리다이렉트 복귀 처리 (access_token이 URL 해시에 있을 때)
  await handleKakaoCallback();

  // 이전 세션 Kakao 유저 정보 복원
  const cachedKakao = localStorage.getItem(TM_KAKAO_KEY);
  if (cachedKakao) {
    const u = JSON.parse(cachedKakao);
    renderKakaoProfileBanner(u);
    if (u.accessToken && window.Kakao?.isInitialized()) Kakao.Auth.setAccessToken(u.accessToken);
  }

  bindEvents();

  const groupId = localStorage.getItem(TM_GROUP_KEY);
  if (groupId) {
    showToast('데이터 불러오는 중...', '');
    const ok = await loadGroupData(groupId);
    if (ok) {
      subscribeRealtime(groupId);
    }
  }

  renderGroupTab();
  renderSchedule();
  renderExpenses();
  renderRestaurants();
}

document.addEventListener('DOMContentLoaded', init);
