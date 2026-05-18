/* ─── js/map.js ────────────────────────────────────────
   initMap, getMapCenter, clearMapOverlays, refreshMapMarkers,
   drawRoadRoute, requestLocation, pinColorByType,
   openNavForPlace, openNavApp, ensureKakaoMaps
   ──────────────────────────────────────────────────── */

let mapInstance = null;
let _mapOverlays = [];
let _routePolylines = [];
let _mapLegendOverlay = null;
let myLocOverlay = null;
let _infoOverlay = null;
let _kakaoMapsReady = false;

function ensureKakaoMaps() {
  if (_kakaoMapsReady) return Promise.resolve();
  return new Promise(resolve => {
    kakao.maps.load(() => { _kakaoMapsReady = true; resolve(); });
  });
}

function pinColorByType(type) {
  const colors = { attraction:'#FF6B35', activity:'#FF9500', accommodation:'#3A86FF', restaurant:'#FF6B6B', cafe:'#A98467', transport:'#4ECDC4', shopping:'#C77DFF', other:'#718096' };
  return colors[type] || '#FF6B35';
}

function getMapCenter() {
  for (const day of state.schedule) {
    for (const p of day.places) {
      if (p.lat && p.lng) return new kakao.maps.LatLng(p.lat, p.lng);
    }
  }
  return new kakao.maps.LatLng(36.5, 127.8);
}

async function initMap() {
  await ensureKakaoMaps();
  const container = document.getElementById('kakaoMap');
  if (mapInstance) {
    kakao.maps.event.trigger(mapInstance, 'resize');
    refreshMapMarkers();
    return;
  }
  mapInstance = new kakao.maps.Map(container, {
    center: getMapCenter(),
    level: 7,
  });
  refreshMapMarkers();
  requestLocation();
}

function clearMapOverlays() {
  _mapOverlays.forEach(o => o.setMap(null));
  _mapOverlays = [];
  _routePolylines.forEach(p => p.setMap(null));
  _routePolylines = [];
  if (_infoOverlay) { _infoOverlay.setMap(null); _infoOverlay = null; }
  if (_mapLegendOverlay) { _mapLegendOverlay.setMap(null); _mapLegendOverlay = null; }
}

async function refreshMapMarkers() {
  if (!mapInstance) return;
  clearMapOverlays();

  const activeLayer = document.querySelector('.map-layer-btn.active')?.dataset.layer || 'all';
  const allPlaces = [];

  if (activeLayer === 'all' || activeLayer === 'places') {
    let seq = 0;
    state.schedule.forEach((day, di) => {
      // 작업 3-4: 시간순 정렬
      const sortedPlaces = [...day.places].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
      sortedPlaces.forEach(place => {
        if (!place.lat || !place.lng) return;
        seq++;
        allPlaces.push({ ...place, seq, di });

        const color = pinColorByType(place.type);
        const node = document.createElement('div');
        node.style.cssText = `position:relative;width:40px;height:40px;cursor:pointer`;
        node.innerHTML = `
          <div style="background:${color};color:#fff;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-size:15px;box-shadow:0 2px 10px rgba(0,0,0,.3);border:3px solid #fff">${TYPE_EMOJI[place.type]}</div>
          <div style="position:absolute;top:-6px;right:-6px;background:#222;color:#fff;font-size:10px;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:grid;place-items:center;border:2px solid #fff;padding:0 3px">${seq}</div>`;

        const overlay = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(place.lat, place.lng),
          content: node,
          yAnchor: 0.5,
        });
        overlay.setMap(mapInstance);
        _mapOverlays.push(overlay);

        node.addEventListener('click', () => {
          if (_infoOverlay) { _infoOverlay.setMap(null); _infoOverlay = null; }
          const info = document.createElement('div');
          info.className = 'kmap-popup';
          info.innerHTML = `
            <button class="kmap-popup-close" id="kpClose">✕</button>
            <div class="kmap-popup-title">${escapeHtml(place.name)}</div>
            <div class="kmap-popup-sub">${TYPE_LABEL[place.type]} · Day ${di+1}${place.time ? ' ' + place.time : ''}</div>
            <div class="popup-nav-row">
              <button class="popup-nav-btn" onclick="openNavForPlace(${place.lat},${place.lng},'${encodeURIComponent(place.name)}','kakao')">카카오</button>
              <button class="popup-nav-btn" onclick="openNavForPlace(${place.lat},${place.lng},'${encodeURIComponent(place.name)}','naver')">네이버</button>
              <button class="popup-nav-btn" onclick="openNavForPlace(${place.lat},${place.lng},'${encodeURIComponent(place.name)}','tmap')">T맵</button>
            </div>`;
          _infoOverlay = new kakao.maps.CustomOverlay({
            position: new kakao.maps.LatLng(place.lat, place.lng),
            content: info,
            yAnchor: 1.3,
            zIndex: 10,
          });
          _infoOverlay.setMap(mapInstance);
          setTimeout(() => {
            document.getElementById('kpClose')?.addEventListener('click', () => {
              _infoOverlay?.setMap(null); _infoOverlay = null;
            });
          }, 0);
        });
      });
    });
  }

  // 멤버 레이어: 실시간 위치 공유 기능 준비 중 (현재 미표시)

  // 세그먼트별 다색 경로 + 거리/시간 표시
  if (activeLayer === 'all' || activeLayer === 'route') {
    const daysWithRoute = [];
    state.schedule.forEach((day, di) => {
      const sorted = [...day.places]
        .filter(p => p.lat && p.lng)
        .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
      if (sorted.length > 1) daysWithRoute.push({ places: sorted, di });
    });

    if (daysWithRoute.length > 0) {
      // 모든 세그먼트(인접 장소 쌍) 수집
      const segments = [];
      daysWithRoute.forEach(({ places, di }) => {
        for (let i = 0; i < places.length - 1; i++) {
          segments.push({
            from: places[i], to: places[i + 1],
            fromSeq: i + 1, toSeq: i + 2, di,
            color: SEG_COLORS[segments.length % SEG_COLORS.length],
          });
        }
      });

      // 병렬로 모든 세그먼트 경로 요청
      const results = await Promise.all(
        segments.map(s => drawSegmentRoute(s.from, s.to, s.color, s.fromSeq, s.toSeq))
      );
      segments.forEach((s, i) => {
        s.distance = results[i].distance;
        s.duration = results[i].duration;
      });

      // 하단 정보 바 업데이트
      buildRouteInfoBar(segments, daysWithRoute.length > 1);
    } else {
      buildRouteInfoBar([], false);
    }
  } else {
    buildRouteInfoBar([], false);
  }

  if (allPlaces.length > 0) {
    const bounds = new kakao.maps.LatLngBounds();
    allPlaces.forEach(p => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)));
    mapInstance.setBounds(bounds, 60);
  }
}

// ── 거리 포맷 ─────────────────────────────────────────
function formatDist(m) {
  if (m == null) return '?';
  return m < 1000 ? Math.round(m) + 'm' : (m / 1000).toFixed(1) + 'km';
}

// ── 시간 포맷 ─────────────────────────────────────────
function formatDur(s) {
  if (s == null) return '?';
  const min = Math.round(s / 60);
  if (min < 1) return '1분 미만';
  if (min < 60) return min + '분';
  const h = Math.floor(min / 60), r = min % 60;
  return r ? `${h}시간 ${r}분` : `${h}시간`;
}

// ── 세그먼트 경로 그리기 (두 장소 사이) ───────────────
async function drawSegmentRoute(from, to, color, fromSeq, toSeq) {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
    );
    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) throw new Error('no route');

    const path = route.geometry.coordinates.map(([lng, lat]) => new kakao.maps.LatLng(lat, lng));
    const poly = new kakao.maps.Polyline({
      path,
      strokeWeight: 6,
      strokeColor: color,
      strokeOpacity: 0.9,
      strokeStyle: 'solid',
    });
    poly.setMap(mapInstance);
    _routePolylines.push(poly);

    // 경로 중간 지점에 거리/시간 배지
    if (path.length > 0) {
      const mid = path[Math.floor(path.length / 2)];
      const badge = document.createElement('div');
      badge.style.cssText = [
        'background:#fff',
        `border:2.5px solid ${color}`,
        'border-radius:14px',
        'padding:3px 9px',
        'font-size:11px',
        'font-weight:700',
        'white-space:nowrap',
        'box-shadow:0 2px 8px rgba(0,0,0,.18)',
        'color:#1a1a1a',
        'pointer-events:none',
        'line-height:1.5',
      ].join(';');
      badge.innerHTML = `<span style="color:${color}">⑤</span> ${formatDist(route.distance)} · ${formatDur(route.duration)}`
        .replace('⑤', `<span style="font-size:10px;color:${color};font-weight:800">${fromSeq}→${toSeq}</span>`);
      const ov = new kakao.maps.CustomOverlay({ position: mid, content: badge, yAnchor: 0.5, zIndex: 3 });
      ov.setMap(mapInstance);
      _mapOverlays.push(ov);
    }

    return { distance: route.distance, duration: route.duration };
  } catch {
    // fallback: 점선 직선
    const path = [new kakao.maps.LatLng(from.lat, from.lng), new kakao.maps.LatLng(to.lat, to.lng)];
    const poly = new kakao.maps.Polyline({
      path, strokeWeight: 4, strokeColor: color, strokeOpacity: 0.6, strokeStyle: 'shortdot',
    });
    poly.setMap(mapInstance);
    _routePolylines.push(poly);
    return { distance: null, duration: null };
  }
}

// ── 하단 경로 정보 바 ──────────────────────────────────
function buildRouteInfoBar(segments, multiDay) {
  const bar = document.getElementById('routeInfoBar');
  if (!bar) return;
  // 지도 top 조정 (정보바 높이만큼)
  const adjustMapTop = () => {
    const mapEl = document.getElementById('kakaoMap');
    if (!mapEl) return;
    const barH = bar.offsetHeight || 0;
    mapEl.style.top = (48 + barH) + 'px';
    if (mapInstance) kakao.maps.event.trigger(mapInstance, 'resize');
  };

  if (!segments.length) {
    bar.innerHTML = '';
    adjustMapTop();
    return;
  }

  // Day별 그룹핑
  const byDay = {};
  segments.forEach(s => { (byDay[s.di] = byDay[s.di] || []).push(s); });

  let html = '';
  Object.entries(byDay).forEach(([di, segs]) => {
    if (multiDay) {
      html += `<span class="rinfo-day">Day ${Number(di) + 1}</span>`;
    }
    segs.forEach(s => {
      const from6 = s.from.name.length > 5 ? s.from.name.slice(0, 5) + '…' : s.from.name;
      const to6   = s.to.name.length > 5   ? s.to.name.slice(0, 5)   + '…' : s.to.name;
      html += `
        <div class="rinfo-chip">
          <span class="rinfo-dot" style="background:${s.color}"></span>
          <span class="rinfo-label">${escapeHtml(from6)}→${escapeHtml(to6)}</span>
          <span class="rinfo-val">${formatDist(s.distance)}</span>
          <span class="rinfo-sep">·</span>
          <span class="rinfo-val">${formatDur(s.duration)}</span>
        </div>`;
    });

    // 일별 합계 (세그먼트 2개 이상)
    if (segs.length > 1) {
      const td = segs.reduce((a, s) => a + (s.distance || 0), 0);
      const tt = segs.reduce((a, s) => a + (s.duration  || 0), 0);
      html += `<div class="rinfo-total">합계 ${formatDist(td)} · ${formatDur(tt)}</div>`;
    }
    if (multiDay) html += `<span class="rinfo-divider"></span>`;
  });

  bar.innerHTML = html;
  // 렌더 후 높이 확정되면 지도 top 재조정
  requestAnimationFrame(adjustMapTop);
}

function requestLocation() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    pos => {
      state.userLat = pos.coords.latitude;
      state.userLng = pos.coords.longitude;
      const locEl = document.getElementById('myLocationText');
      if (locEl) locEl.textContent = `위치 확인됨 (${state.userLat.toFixed(4)}, ${state.userLng.toFixed(4)})`;
      if (!mapInstance) return;
      if (myLocOverlay) myLocOverlay.setMap(null);
      const node = document.createElement('div');
      node.style.cssText = `width:16px;height:16px;border-radius:50%;background:#3A86FF;border:3px solid #fff;box-shadow:0 0 0 6px rgba(58,134,255,.25)`;
      myLocOverlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(state.userLat, state.userLng),
        content: node,
        yAnchor: 0.5,
      });
      myLocOverlay.setMap(mapInstance);
    },
    () => { const el = document.getElementById('myLocationText'); if (el) el.textContent = '위치 접근 거부됨'; },
    { enableHighAccuracy: true }
  );
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
