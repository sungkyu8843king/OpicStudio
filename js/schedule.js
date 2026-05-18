/* ─── js/schedule.js ───────────────────────────────────
   renderSchedule, openAddPlaceModal, searchPlace,
   addPlace, deletePlace, openEditPlaceModal, editPlace
   ──────────────────────────────────────────────────── */

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

  // 작업 3-4: 시간순 정렬
  const sorted = [...day.places].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
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
          <button class="place-edit-btn" onclick="openEditPlaceModal('${place.id}')">✏️</button>
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
  document.getElementById('apTime').value = suggestNextTime();
  state.pendingPlace = null;

  openModal('add-place');
}

async function searchPlace() {
  const query = document.getElementById('apAddress').value.trim();
  if (!query) return;

  const container = document.getElementById('placeSearchResults');
  container.innerHTML = '<div class="search-result-item"><span>검색 중...</span></div>';
  container.classList.remove('hidden');

  try {
    await ensureKakaoMaps();
    const places = await new Promise(resolve => {
      const ps = new kakao.maps.services.Places();
      ps.keywordSearch(query, (data, status) => {
        resolve(status === kakao.maps.services.Status.OK ? data.slice(0, 5) : []);
      });
    });

    container.innerHTML = '';
    if (places.length === 0) {
      container.innerHTML = '<div class="search-result-item"><strong>검색 결과 없음</strong><span>이름만 입력하고 추가하세요</span></div>';
      return;
    }

    places.forEach(p => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = `<strong>${escapeHtml(p.place_name)}</strong><span>${escapeHtml(p.road_address_name || p.address_name || '')}</span>`;
      item.onclick = () => {
        const addr = p.road_address_name || p.address_name || '';
        document.getElementById('apAddress').value = addr;
        document.getElementById('apName').value = p.place_name;
        document.getElementById('apType').value = kakaoCategToType(p.category_name);
        const lat = parseFloat(p.y), lng = parseFloat(p.x);
        state.pendingPlace = { lat, lng, address: addr };
        const coords = document.getElementById('apCoords');
        coords.textContent = `📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        coords.classList.remove('hidden');
        container.classList.add('hidden');
      };
      container.appendChild(item);
    });
  } catch {
    container.innerHTML = '<div class="search-result-item"><strong>검색 오류</strong><span>잠시 후 다시 시도하세요</span></div>';
  }
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
  // 작업 3-3: confirm 추가
  const place = state.schedule.flatMap(d => d.places).find(p => p.id === placeId);
  if (!confirm(`"${place?.name || '이 장소'}"를 삭제하시겠습니까?`)) return;

  const { error } = await sb.from('trip_places').delete().eq('id', placeId);
  if (error) { showToast('삭제 실패', 'error'); return; }

  await loadGroupData(state.group.id);
  renderSchedule();
  if (mapInstance) refreshMapMarkers();
  showToast('삭제되었습니다');
}

// ── 작업 3-2: 장소 수정 모달 ──────────────────────────
function openEditPlaceModal(placeId) {
  const place = state.schedule.flatMap(d => d.places).find(p => p.id === placeId);
  if (!place) return;
  document.getElementById('epId').value = place.id;
  document.getElementById('epName').value = place.name;
  document.getElementById('epType').value = place.type || 'other';
  document.getElementById('epTime').value = place.time || '';
  document.getElementById('epNote').value = place.note || '';
  // epDay select 채우기
  const daySelect = document.getElementById('epDay');
  daySelect.innerHTML = '';
  const dayIdx = state.schedule.findIndex(d => d.places.some(p => p.id === placeId));
  state.schedule.forEach((day, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `Day ${i+1} (${formatDate(day.date)})`;
    if (i === dayIdx) opt.selected = true;
    daySelect.appendChild(opt);
  });
  openModal('edit-place');
}

async function editPlace() {
  const id = document.getElementById('epId').value;
  const name = document.getElementById('epName').value.trim();
  if (!name) { showToast('장소 이름을 입력하세요', 'error'); return; }
  const { error } = await sb.from('trip_places').update({
    name,
    type: document.getElementById('epType').value,
    day_index: parseInt(document.getElementById('epDay').value),
    time: document.getElementById('epTime').value || null,
    note: document.getElementById('epNote').value.trim() || null,
  }).eq('id', id);
  if (error) { showToast('수정 실패', 'error'); return; }
  await loadGroupData(state.group.id);
  closeModal('edit-place');
  showToast('수정되었습니다 ✅');
  renderSchedule();
  if (mapInstance) refreshMapMarkers();
}
