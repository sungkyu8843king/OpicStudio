/* ─── js/recommend.js ──────────────────────────────────
   renderRecommendations, buildPackingList,
   loadKakaoRecommendations, loadAISuggestions
   ──────────────────────────────────────────────────── */

async function renderRecommendations() {
  const wrap = document.getElementById('recContent');
  if (!state.group) {
    wrap.innerHTML = '<div class="empty-rec"><span>✨</span><p>여행 그룹을 만들면<br>맞춤 추천을 드려요</p></div>';
    return;
  }

  const g = state.group;
  const dest = g.dest || '';

  // 1. 기본 준비물 체크리스트
  let html = buildPackingList(g, state.schedule.flatMap(d => d.places));

  // 2. AI 빠진 물건 체크 섹션 (경비 기반)
  html += buildAISuggestSection();

  // 3. Kakao 추천 장소 (비동기)
  wrap.innerHTML = html + `<div id="kakaoRecPlaces"><div class="rec-loading-inline">📍 주변 장소 검색 중...</div></div>`;

  // AI 제안 로드 (경비가 있을 때만)
  if (state.expenses.length > 0) {
    loadAISuggestions();
  } else {
    document.getElementById('aiSuggestBody')?.closest('.rec-section')
      && (document.getElementById('aiSuggestBody').innerHTML =
        '<p class="ai-suggest-empty">경비를 추가하면 AI가 빠진 물건을 찾아드려요 💡</p>');
  }

  // Kakao 추천 장소
  if (dest) loadKakaoRecommendations(dest);
  else document.getElementById('kakaoRecPlaces').innerHTML = '';
}

// ── AI 제안 섹션 골격 ──────────────────────────────────
function buildAISuggestSection() {
  return `
    <div class="rec-section" id="aiSuggestSection">
      <div class="rec-section-header">
        <div class="rec-section-title">🤖 혹시 이것도 챙기셨나요?</div>
        <button class="rec-refresh-btn" onclick="loadAISuggestions(true)" title="다시 분석">↻</button>
      </div>
      <div id="aiSuggestBody">
        <div class="rec-loading-inline">AI 분석 중...</div>
      </div>
    </div>`;
}

// ── Claude AI 제안 로드 ────────────────────────────────
async function loadAISuggestions(forceRefresh) {
  const body = document.getElementById('aiSuggestBody');
  if (!body) return;

  // 캐시: 같은 경비 목록이면 재호출 안 함
  const cacheKey = state.expenses.map(e => e.name).sort().join('|');
  if (!forceRefresh && window._aiSuggestCache?.key === cacheKey) {
    body.innerHTML = window._aiSuggestCache.html;
    return;
  }

  body.innerHTML = '<div class="rec-loading-inline">🤖 경비 목록 분석 중...</div>';

  try {
    const g = state.group;
    const nights = g.startDate && g.endDate ? Math.max(0, daysBetween(g.startDate, g.endDate) - 1) : 0;

    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expenses: state.expenses.map(e => ({
          name: e.name,
          amount: e.amount,
          category: e.category,
        })),
        trip: {
          dest:    g.dest,
          nights,
          adults:  g.adults,
          infants: g.infants,
        },
      }),
    });

    const data = await res.json();
    if (!data.ok || !data.suggestions?.length) {
      body.innerHTML = '<p class="ai-suggest-empty">현재 경비 목록 기준으로 특별히 빠진 항목이 없어 보여요 👍</p>';
      return;
    }

    const html = `
      <ul class="ai-suggest-list">
        ${data.suggestions.map((s, i) => `
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
      </ul>`;

    body.innerHTML = html;
    window._aiSuggestCache = { key: cacheKey, html };

  } catch (e) {
    body.innerHTML = '<p class="ai-suggest-empty">AI 분석에 실패했습니다. 잠시 후 다시 시도해보세요.</p>';
    console.error('[AI suggest]', e);
  }
}

function toggleAISuggest(idx) {
  const item = document.getElementById(`ais-${idx}`);
  if (item) item.classList.toggle('ai-suggest-done');
}

// ── 기본 준비물 체크리스트 ─────────────────────────────
function buildPackingList(group, places) {
  const dest = group.dest || '';
  const infants = group.infants || 0;
  const startDate = group.startDate;
  const endDate = group.endDate;

  const month = startDate ? new Date(startDate).getMonth() + 1 : new Date().getMonth() + 1;
  const season = month >= 6 && month <= 8 ? 'summer' : month >= 12 || month <= 2 ? 'winter' : 'other';
  const isBeach    = /해수욕|해변|바다|섬|제주|여수|부산|속초|강릉/.test(dest);
  const isMountain = /산|한라|설악|지리|계곡/.test(dest);

  const items = ['여권/신분증', '현금', '충전기', '상비약', '세면도구', '수건'];
  if (season === 'summer') items.push('선크림', '모자', '선글라스', '여름 옷');
  if (season === 'winter') items.push('두꺼운 외투', '핫팩', '장갑', '목도리');
  if (isBeach)    items.push('수영복', '래쉬가드', '물안경', '비치타올');
  if (isMountain) items.push('등산화', '등산 스틱', '우비', '간식');
  if (infants > 0) items.push('기저귀', '분유/이유식', '유모차', '아기 옷 여벌');

  const nights = startDate && endDate ? Math.max(0, daysBetween(startDate, endDate) - 1) : 0;
  if (nights > 0) items.push(`속옷 ${nights+1}벌`, `양말 ${nights+1}켤레`);

  return `
    <div class="rec-section">
      <div class="rec-section-title">🎒 준비물 체크리스트</div>
      <div class="packing-grid">
        ${items.map(item => `
          <label class="packing-item">
            <input type="checkbox" class="packing-check">
            <span>${item}</span>
          </label>`).join('')}
      </div>
    </div>`;
}

// ── Kakao 추천 장소/맛집 ───────────────────────────────
async function loadKakaoRecommendations(dest) {
  const container = document.getElementById('kakaoRecPlaces');
  if (!container) return;
  try {
    await ensureKakaoMaps();
    const ps = new kakao.maps.services.Places();

    const [attractions, restaurants] = await Promise.all([
      new Promise(resolve => {
        ps.keywordSearch(`${dest} 관광지`, (data, status) =>
          resolve(status === kakao.maps.services.Status.OK ? data.slice(0, 4) : []), { size: 4 });
      }),
      new Promise(resolve => {
        ps.keywordSearch(`${dest} 맛집`, (data, status) =>
          resolve(status === kakao.maps.services.Status.OK ? data.slice(0, 4) : []), { size: 4 });
      }),
    ]);

    let html = '';
    if (attractions.length) {
      html += `<div class="rec-section">
        <div class="rec-section-title">🏛️ 추천 관광지</div>
        <div class="rec-place-list">
          ${attractions.map(p => `
            <div class="rec-place-item" onclick="window.open('${p.place_url}','_blank')">
              <div class="rec-place-name">${escapeHtml(p.place_name)}</div>
              <div class="rec-place-addr">${escapeHtml(p.road_address_name || p.address_name || '')}</div>
            </div>`).join('')}
        </div></div>`;
    }
    if (restaurants.length) {
      html += `<div class="rec-section">
        <div class="rec-section-title">🍽️ 추천 맛집</div>
        <div class="rec-place-list">
          ${restaurants.map(p => `
            <div class="rec-place-item" onclick="window.open('${p.place_url}','_blank')">
              <div class="rec-place-name">${escapeHtml(p.place_name)}</div>
              <div class="rec-place-addr">${escapeHtml(p.road_address_name || p.address_name || '')}</div>
              ${p.phone ? `<div class="rec-place-phone">${p.phone}</div>` : ''}
            </div>`).join('')}
        </div></div>`;
    }
    container.innerHTML = html || '';
  } catch(e) {
    container.innerHTML = '';
  }
}
