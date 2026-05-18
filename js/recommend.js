/* ─── js/recommend.js ──────────────────────────────────
   renderRecommendations, buildPackingList,
   loadKakaoRecommendations
   ──────────────────────────────────────────────────── */

async function renderRecommendations() {
  const wrap = document.getElementById('recContent');
  if (!state.group) {
    wrap.innerHTML = '<div class="empty-rec"><span>✨</span><p>여행 그룹을 만들면<br>맞춤 추천을 드려요</p></div>';
    return;
  }

  const g = state.group;
  const dest = g.dest || '';
  const allPlaces = state.schedule.flatMap(d => d.places);

  // 섹션들 생성
  let html = '';

  // 1. 준비물 리스트
  html += buildPackingList(g, allPlaces);

  // 2. 추천 장소 / 맛집 (Kakao) — 비동기로 별도 처리
  wrap.innerHTML = html + '<div id="kakaoRecPlaces"><div class="rec-loading-inline">주변 장소 검색 중...</div></div>';

  // 비동기로 Kakao Places 검색
  if (dest) {
    loadKakaoRecommendations(dest);
  } else {
    document.getElementById('kakaoRecPlaces').innerHTML = '';
  }
}

function buildPackingList(group, places) {
  const dest = group.dest || '';
  const adults = group.adults || 1;
  const infants = group.infants || 0;
  const startDate = group.startDate;
  const endDate = group.endDate;

  // 계절 판단
  const month = startDate ? new Date(startDate).getMonth() + 1 : new Date().getMonth() + 1;
  const season = month >= 6 && month <= 8 ? 'summer' : month >= 12 || month <= 2 ? 'winter' : 'other';

  // 목적지 타입 판단
  const isBeach = /해수욕|해변|바다|섬|제주|여수|부산|속초|강릉/.test(dest);
  const isMountain = /산|한라|설악|지리|계곡/.test(dest);

  const items = [
    // 기본 필수품
    '여권/신분증', '현금', '충전기', '상비약',
    '세면도구', '수건',
  ];

  if (season === 'summer') items.push('선크림', '모자', '선글라스', '여름 옷');
  if (season === 'winter') items.push('두꺼운 외투', '핫팩', '장갑', '목도리');
  if (isBeach) items.push('수영복', '래쉬가드', '물안경', '비치타올');
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

async function loadKakaoRecommendations(dest) {
  const container = document.getElementById('kakaoRecPlaces');
  if (!container) return;

  try {
    await ensureKakaoMaps();
    const ps = new kakao.maps.services.Places();

    // 관광지 검색
    const attractions = await new Promise(resolve => {
      ps.keywordSearch(`${dest} 관광지`, (data, status) => {
        resolve(status === kakao.maps.services.Status.OK ? data.slice(0, 4) : []);
      }, { size: 4 });
    });

    // 맛집 검색
    const restaurants = await new Promise(resolve => {
      ps.keywordSearch(`${dest} 맛집`, (data, status) => {
        resolve(status === kakao.maps.services.Status.OK ? data.slice(0, 4) : []);
      }, { size: 4 });
    });

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
        </div>
      </div>`;
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
        </div>
      </div>`;
    }

    container.innerHTML = html || '<div class="empty-rec"><p>주변 추천 장소가 없습니다</p></div>';
  } catch(e) {
    container.innerHTML = '';
  }
}
