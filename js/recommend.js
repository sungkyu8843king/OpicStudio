/* ─── js/recommend.js ──────────────────────────────────
   renderRecommendations, loadFullAIRecommendations,
   renderRecSections, toggleAISuggest, togglePackingItem
   ──────────────────────────────────────────────────── */

let _recCache = null;  // { key, data }

async function renderRecommendations() {
  const wrap = document.getElementById('recContent');
  if (!state.group) {
    wrap.innerHTML = `
      <div class="empty-rec">
        <span>✨</span>
        <p>여행 그룹을 만들면<br>AI 맞춤 추천을 드려요</p>
      </div>`;
    return;
  }
  if (!state.group.dest) {
    wrap.innerHTML = `
      <div class="empty-rec">
        <span>📍</span>
        <p>그룹 설정에서 여행지를 입력하면<br>AI 맞춤 추천을 드려요</p>
      </div>`;
    return;
  }
  await loadFullAIRecommendations();
}

// ── AI 전체 추천 로드 ──────────────────────────────────
async function loadFullAIRecommendations(forceRefresh) {
  const wrap = document.getElementById('recContent');
  const g    = state.group;
  const nights = g.startDate && g.endDate
    ? Math.max(0, daysBetween(g.startDate, g.endDate) - 1) : 0;

  // 캐시 키: 여행지 + 기간 + 인원 + 일정 + 경비
  const scheduleKey = state.schedule.flatMap(d => (d.places || []).map(p => p.name)).join('|');
  const expenseKey  = state.expenses.map(e => e.name).sort().join('|');
  const cacheKey    = [g.dest, nights, g.adults || 0, g.infants || 0, scheduleKey, expenseKey].join('__');

  if (!forceRefresh && _recCache?.key === cacheKey) {
    renderRecSections(_recCache.data);
    return;
  }

  // 로딩 UI
  wrap.innerHTML = `
    <div class="rec-ai-loading">
      <div class="rec-ai-spinner"></div>
      <p>AI가 <strong>${escapeHtml(g.dest)}</strong> 여행을 분석 중...</p>
      <span>준비물 · 추천 장소 · 여행 꿀팁을 생성하고 있어요</span>
    </div>`;

  try {
    const res = await fetch('/api/recommend-full', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trip: {
          dest:      g.dest,
          nights,
          startDate: g.startDate || null,
          adults:    g.adults    || 0,
          infants:   g.infants   || 0,
        },
        schedule: state.schedule.map(d => ({
          label:  d.label,
          places: (d.places || []).map(p => ({ name: p.name })),
        })),
        expenses: state.expenses.map(e => ({
          name: e.name, amount: e.amount, category: e.category,
        })),
      }),
    });

    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'AI 응답 오류');

    _recCache = { key: cacheKey, data };
    renderRecSections(data);

  } catch (e) {
    wrap.innerHTML = `
      <div class="rec-error">
        <span>😵</span>
        <p>추천 정보를 불러오지 못했습니다</p>
        <button class="btn btn-outline sm" onclick="loadFullAIRecommendations(true)">↻ 다시 시도</button>
      </div>`;
    console.error('[recommend-full]', e);
  }
}

// ── AI 추천 결과 렌더링 ────────────────────────────────
function renderRecSections(data) {
  const wrap = document.getElementById('recContent');
  const g    = state.group;
  const nights = g.startDate && g.endDate
    ? Math.max(0, daysBetween(g.startDate, g.endDate) - 1) : 0;
  const total  = (g.adults || 0) + (g.infants || 0);

  let html = '';

  // ── 헤더 ────────────────────────────────────────────
  html += `
    <div class="rec-hero">
      <div class="rec-hero-left">
        <div class="rec-hero-dest">📍 ${escapeHtml(g.dest)}</div>
        <div class="rec-hero-info">${nights > 0 ? `${nights}박 ${nights + 1}일` : '당일치기'}${total > 0 ? ` · ${total}명` : ''}</div>
      </div>
      <button class="rec-refresh-main" onclick="loadFullAIRecommendations(true)" title="AI 다시 분석">↻ 새로 분석</button>
    </div>`;

  // ── 1. AI 맞춤 준비물 ──────────────────────────────
  if (data.packing?.length) {
    html += `
      <div class="rec-section">
        <div class="rec-section-title">🎒 AI 맞춤 준비물</div>
        <div class="packing-grid">
          ${data.packing.map((it, i) => `
            <label class="packing-item" id="pk-${i}" title="${escapeHtml(it.reason || '')}">
              <input type="checkbox" class="packing-check" onchange="togglePackingItem(${i})">
              <span class="packing-emoji">${it.emoji || '✅'}</span>
              <span class="packing-text">${escapeHtml(it.item)}</span>
            </label>`).join('')}
        </div>
      </div>`;
  }

  // ── 2. 추천 장소 ───────────────────────────────────
  if (data.places?.length) {
    const catMeta = {
      restaurant: { label: '맛집',  bg: '#fff7ed', badge: '#f97316' },
      attraction: { label: '관광지', bg: '#eff6ff', badge: '#3b82f6' },
      activity:   { label: '체험',  bg: '#f0fdf4', badge: '#22c55e' },
      cafe:       { label: '카페',  bg: '#fdf4ff', badge: '#a855f7' },
      shopping:   { label: '쇼핑',  bg: '#fef2f2', badge: '#ef4444' },
    };

    html += `
      <div class="rec-section">
        <div class="rec-section-title">📍 AI 추천 장소</div>
        <div class="rec-place-grid">
          ${data.places.map(p => {
            const cat  = p.category || 'attraction';
            const meta = catMeta[cat] || catMeta.attraction;
            const mapUrl = `https://map.kakao.com/?q=${encodeURIComponent(g.dest + ' ' + p.name)}`;
            return `
            <div class="rec-place-card" style="--card-bg:${meta.bg}">
              <div class="rec-place-card-top">
                <span class="rec-place-card-emoji">${p.emoji || '📍'}</span>
                <div class="rec-place-card-info">
                  <span class="rec-place-card-name">${escapeHtml(p.name)}</span>
                  <span class="rec-place-card-badge" style="background:${meta.badge}">${meta.label}</span>
                </div>
              </div>
              <div class="rec-place-card-desc">${escapeHtml(p.desc || '')}</div>
              ${p.tip ? `<div class="rec-place-card-tip">💡 ${escapeHtml(p.tip)}</div>` : ''}
              <div class="rec-place-card-btns">
                <button class="rec-place-map-btn" onclick="window.open('${mapUrl}','_blank')">🗺️ 지도</button>
                <button class="rec-place-add-btn" onclick="openAddFromRecModal('${p.name.replace(/'/g,"\\'").replace(/"/g,'&quot;')}','${(p.emoji||'📍')}','${p.category||'attraction'}')">📅 일정 추가</button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  // ── 3. 여행 꿀팁 ──────────────────────────────────
  if (data.tips?.length) {
    html += `
      <div class="rec-section">
        <div class="rec-section-title">💡 여행 꿀팁</div>
        <ul class="rec-tips-list">
          ${data.tips.map(t => `
            <li class="rec-tip-item">
              <span class="rec-tip-emoji">${t.emoji || '💡'}</span>
              <span>${escapeHtml(t.tip)}</span>
            </li>`).join('')}
        </ul>
      </div>`;
  }

  // ── 4. 혹시 이것도 챙기셨나요? ───────────────────
  if (data.missing?.length) {
    html += `
      <div class="rec-section">
        <div class="rec-section-header">
          <div class="rec-section-title">🤖 혹시 이것도 챙기셨나요?</div>
          <button class="rec-refresh-btn" onclick="loadFullAIRecommendations(true)" title="다시 분석">↻</button>
        </div>
        <ul class="ai-suggest-list">
          ${data.missing.map((s, i) => `
            <li class="ai-suggest-item" id="ais-${i}">
              <label class="ai-suggest-label">
                <input type="checkbox" class="ai-suggest-check" onchange="toggleAISuggest(${i})">
                <span class="ai-suggest-emoji">${s.emoji || '✅'}</span>
                <div class="ai-suggest-text">
                  <span class="ai-suggest-name">${escapeHtml(s.item)}</span>
                  <span class="ai-suggest-reason">${escapeHtml(s.reason)}</span>
                </div>
              </label>
            </li>`).join('')}
        </ul>
      </div>`;
  } else if (state.expenses.length === 0) {
    html += `
      <div class="rec-section">
        <div class="rec-section-title">🤖 혹시 이것도 챙기셨나요?</div>
        <p class="ai-suggest-empty">경비를 추가하면 AI가 빠진 물건을 찾아드려요 💡</p>
      </div>`;
  }

  wrap.innerHTML = html;
}

function toggleAISuggest(idx) {
  const item = document.getElementById(`ais-${idx}`);
  if (item) item.classList.toggle('ai-suggest-done');
}

function togglePackingItem(idx) {
  const label = document.getElementById(`pk-${idx}`);
  if (label) label.classList.toggle('packing-done');
}

// ── 추천 장소 → 일정 추가 ─────────────────────────────
function openAddFromRecModal(name, emoji, category) {
  if (!state.group) { showToast('먼저 그룹을 만드세요', 'error'); return; }
  if (!state.schedule?.length) { showToast('일정 탭에서 여행 날짜를 먼저 설정하세요', 'error'); return; }

  document.getElementById('afr-place-name').textContent = `${emoji} ${name}`;
  window._afrPending = { name, category };

  const dayList = document.getElementById('afr-day-list');
  dayList.innerHTML = state.schedule.map((d, i) => {
    const places = d.places || [];
    const sub = places.length > 0
      ? places.slice(0, 2).map(p => p.name).join(', ') + (places.length > 2 ? ' 외…' : '')
      : '일정 없음';
    return `
      <button class="afr-day-btn" onclick="confirmAddFromRec(${i})">
        <div class="afr-day-badge">Day ${i + 1}</div>
        <div class="afr-day-info">
          <span class="afr-day-date">${formatDate(d.date)}</span>
          <span class="afr-day-places">${escapeHtml(sub)}</span>
        </div>
        <span class="afr-day-arrow">→</span>
      </button>`;
  }).join('');

  openModal('add-from-rec');
}

async function confirmAddFromRec(dayIdx) {
  const pending = window._afrPending;
  if (!pending || !state.group) return;

  // AI category → DB type 매핑 (1:1 대응)
  const typeMap = { restaurant:'restaurant', attraction:'attraction', activity:'activity', cafe:'cafe', shopping:'shopping' };
  const placeType = typeMap[pending.category] || 'attraction';

  const { error } = await sb.from('trip_places').insert({
    group_id:  state.group.id,
    day_index: dayIdx,
    name:      pending.name,
    type:      placeType,
    time:      suggestNextTime(),
    address:   null,
    note:      null,
    lat:       null,
    lng:       null,
  });

  if (error) { showToast('추가 실패: ' + error.message, 'error'); return; }

  state.currentDay = dayIdx;
  await loadGroupData(state.group.id);
  closeModal('add-from-rec');
  renderSchedule();
  showToast(`📅 Day${dayIdx + 1}에 "${pending.name}" 추가됨!`, 'success');

  // 일정 탭으로 이동
  document.querySelector('.tab-btn[data-tab="schedule"]')?.click();
  window._afrPending = null;
}
