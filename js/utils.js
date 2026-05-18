/* ─── js/utils.js ──────────────────────────────────────
   showToast, openModal, closeModal, formatDate, formatKRW,
   daysBetween, destEmoji, genCode, avatarColor, escapeHtml,
   kakaoCategToType, suggestNextTime, formatDateFull, addDays
   ──────────────────────────────────────────────────── */

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

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function kakaoCategToType(cat) {
  if (!cat) return 'other';
  if (cat.includes('숙박') || cat.includes('호텔') || cat.includes('펜션') || cat.includes('게스트하우스')) return 'accommodation';
  if (cat.includes('카페') || cat.includes('커피')) return 'cafe';
  if (cat.includes('음식점') || cat.includes('식당') || cat.includes('맛집') || cat.includes('레스토랑')) return 'restaurant';
  if (cat.includes('교통') || cat.includes('지하철') || cat.includes('버스') || cat.includes('공항') || cat.includes('기차') || cat.includes('항구') || cat.includes('터미널')) return 'transport';
  if (cat.includes('쇼핑') || cat.includes('마트') || cat.includes('백화점') || cat.includes('편의점') || cat.includes('면세')) return 'shopping';
  if (cat.includes('테마파크') || cat.includes('놀이') || cat.includes('액티비티') || cat.includes('스포츠') || cat.includes('레저') || cat.includes('오락') || cat.includes('볼링') || cat.includes('노래') || cat.includes('게임')) return 'activity';
  if (cat.includes('관광') || cat.includes('명소') || cat.includes('문화') || cat.includes('역사') || cat.includes('공원') || cat.includes('수목원') || cat.includes('박물관') || cat.includes('미술관')) return 'attraction';
  return 'other';
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

function suggestNextTime() {
  const dayIdx = state.currentDay ?? 0;
  const places = state.schedule[dayIdx]?.places ?? [];
  const times = places
    .map(p => p.time)
    .filter(t => t && /^\d{2}:\d{2}$/.test(t))
    .map(t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; });

  if (times.length === 0) return '09:00';

  const lastMin = Math.max(...times);
  const nextMin = lastMin + 120;
  const h = Math.floor(nextMin / 60) % 24;
  const m = nextMin % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
