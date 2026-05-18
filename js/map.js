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

  // 작업 4: Day별 다색 경로 표시
  if (activeLayer === 'all' || activeLayer === 'route') {
    const daysWithRoute = [];
    state.schedule.forEach((day, di) => {
      const sortedPlaces = [...day.places]
        .filter(p => p.lat && p.lng)
        .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
      if (sortedPlaces.length > 1) {
        daysWithRoute.push({ places: sortedPlaces, di });
      }
    });

    if (daysWithRoute.length > 0) {
      // 경로 그리기 (Day별 색상)
      for (const { places, di } of daysWithRoute) {
        const color = ROUTE_COLORS[di % ROUTE_COLORS.length];
        await drawRoadRoute(places, color);
      }

      // 범례 표시
      if (daysWithRoute.length > 1) {
        const legendNode = document.createElement('div');
        legendNode.style.cssText = `background:rgba(255,255,255,.92);border-radius:8px;padding:8px 10px;box-shadow:0 2px 8px rgba(0,0,0,.15);font-size:12px;`;
        legendNode.innerHTML = daysWithRoute.map(({ di }) => {
          const color = ROUTE_COLORS[di % ROUTE_COLORS.length];
          return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px"><span style="width:20px;height:4px;background:${color};border-radius:2px;display:inline-block"></span><span>Day ${di+1}</span></div>`;
        }).join('');

        // 지도 우상단에 범례 표시
        const firstPlace = daysWithRoute[0].places[0];
        _mapLegendOverlay = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(firstPlace.lat, firstPlace.lng),
          content: legendNode,
          yAnchor: 0,
          xAnchor: -0.05,
          zIndex: 5,
        });
        _mapLegendOverlay.setMap(mapInstance);
        _mapOverlays.push(_mapLegendOverlay);
      }
    }
  }

  if (allPlaces.length > 0) {
    const bounds = new kakao.maps.LatLngBounds();
    allPlaces.forEach(p => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)));
    mapInstance.setBounds(bounds, 60);
  }
}

// 작업 4: drawRoadRoute 시그니처 변경 → color 파라미터 추가
async function drawRoadRoute(places, color) {
  const routeColor = color || '#FF6B35';
  // OSRM 무료 도로 라우팅
  const coords = places.map(p => `${p.lng},${p.lat}`).join(';');
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
    );
    const data = await res.json();
    const geojson = data.routes?.[0]?.geometry;
    if (!geojson) throw new Error('no route');

    const path = geojson.coordinates.map(([lng, lat]) => new kakao.maps.LatLng(lat, lng));
    const poly = new kakao.maps.Polyline({
      path,
      strokeWeight: 5,
      strokeColor: routeColor,
      strokeOpacity: 0.85,
      strokeStyle: 'solid',
    });
    poly.setMap(mapInstance);
    _routePolylines.push(poly);
  } catch {
    // fallback: 직선
    const path = places.map(p => new kakao.maps.LatLng(p.lat, p.lng));
    const poly = new kakao.maps.Polyline({
      path,
      strokeWeight: 4,
      strokeColor: routeColor,
      strokeOpacity: 0.6,
      strokeStyle: 'shortdot',
    });
    poly.setMap(mapInstance);
    _routePolylines.push(poly);
  }
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
