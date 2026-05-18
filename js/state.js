/* ─── js/state.js ──────────────────────────────────────
   state 객체, clearSession, loadGroupData
   ──────────────────────────────────────────────────── */

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
    total_people: g.total_people,
    adults: g.adults,
    infants: g.infants,
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
