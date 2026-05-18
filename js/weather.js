/* ─── js/weather.js ──────────────────────────────────
   loadWeather, renderWeather
   ──────────────────────────────────────────────────── */

// WMO 날씨 코드 → 이모지 + 설명
function _wmoEmoji(code) {
  if (code === 0)                       return { emoji: '☀️', label: '맑음' };
  if (code >= 1  && code <= 3)          return { emoji: '⛅', label: '구름' };
  if (code >= 45 && code <= 48)         return { emoji: '🌫️', label: '안개' };
  if (code >= 51 && code <= 67)         return { emoji: '🌧️', label: '비' };
  if (code >= 71 && code <= 77)         return { emoji: '❄️', label: '눈' };
  if (code >= 80 && code <= 82)         return { emoji: '🌦️', label: '소나기' };
  if (code >= 95 && code <= 99)         return { emoji: '⛈️', label: '천둥' };
  return { emoji: '🌡️', label: '알수없음' };
}

// 날씨 섹션 렌더링 (daily: Open-Meteo daily 객체)
function renderWeather(daily, startDate, endDate) {
  const section = document.getElementById('weatherSection');
  if (!section) return;

  const dates    = daily.time || [];
  const maxTemps = daily.temperature_2m_max || [];
  const minTemps = daily.temperature_2m_min || [];
  const precips  = daily.precipitation_sum || [];
  const codes    = daily.weathercode || [];

  // 여행 날짜 범위 필터
  let filtered = dates.map((d, i) => ({
    date: d,
    max:  maxTemps[i],
    min:  minTemps[i],
    precip: precips[i],
    code:   codes[i],
  }));

  if (startDate && endDate) {
    filtered = filtered.filter(d => d.date >= startDate && d.date <= endDate);
  }
  if (!filtered.length) {
    filtered = dates.slice(0, 5).map((d, i) => ({
      date: d, max: maxTemps[i], min: minTemps[i], precip: precips[i], code: codes[i],
    }));
  }

  const days = ['일','월','화','수','목','금','토'];
  const items = filtered.map(d => {
    const dt     = new Date(d.date);
    const dayStr = `${dt.getMonth()+1}/${dt.getDate()} (${days[dt.getDay()]})`;
    const { emoji, label } = _wmoEmoji(d.code ?? 0);
    const maxStr = d.max != null ? `${Math.round(d.max)}°` : '--';
    const minStr = d.min != null ? `${Math.round(d.min)}°` : '--';
    const prStr  = d.precip != null && d.precip > 0 ? `💧 ${d.precip.toFixed(1)}mm` : '';
    return `
      <div class="weather-day">
        <div class="weather-day-date">${dayStr}</div>
        <div class="weather-day-emoji">${emoji}</div>
        <div class="weather-day-label">${label}</div>
        <div class="weather-day-temps"><span class="wt-max">${maxStr}</span><span class="wt-min">${minStr}</span></div>
        ${prStr ? `<div class="weather-day-precip">${prStr}</div>` : ''}
      </div>`;
  }).join('');

  section.innerHTML = `
    <div class="card weather-card">
      <div class="card-header">
        <h3>☁️ 날씨 예보</h3>
        <button class="btn btn-sm btn-outline" onclick="loadWeather(true)">↻ 갱신</button>
      </div>
      <div class="weather-scroll">${items}</div>
    </div>`;
}

// 날씨 로드
async function loadWeather(forceRefresh) {
  const section = document.getElementById('weatherSection');
  if (!section) return;
  if (!state.group?.dest) { section.innerHTML = ''; return; }

  const dest = state.group.dest;
  const now  = Date.now();

  // 30분 캐시
  if (!forceRefresh && window._weatherCache
    && window._weatherCache.dest === dest
    && now - window._weatherCache.ts < 30 * 60 * 1000) {
    const { data, startDate, endDate } = window._weatherCache;
    renderWeather(data, startDate, endDate);
    return;
  }

  section.innerHTML = `
    <div class="card weather-card">
      <div class="weather-loading"><div class="spinner"></div><p>날씨 정보 불러오는 중...</p></div>
    </div>`;

  try {
    await ensureKakaoMaps();
    const ps = new kakao.maps.services.Places();
    const places = await new Promise(resolve => {
      ps.keywordSearch(dest, (data, status) =>
        resolve(status === kakao.maps.services.Status.OK ? data : []),
        { size: 1 }
      );
    });

    if (!places.length) {
      section.innerHTML = '';
      return;
    }

    const lat = parseFloat(places[0].y);
    const lng = parseFloat(places[0].x);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Asia%2FSeoul&forecast_days=14`;
    const res  = await fetch(url);
    if (!res.ok) throw new Error('날씨 API 오류');
    const json = await res.json();

    const startDate = state.group.startDate || null;
    const endDate   = state.group.endDate   || null;

    window._weatherCache = { dest, data: json.daily, startDate, endDate, ts: Date.now() };
    renderWeather(json.daily, startDate, endDate);

  } catch (e) {
    console.error('[weather]', e);
    section.innerHTML = '';
  }
}
