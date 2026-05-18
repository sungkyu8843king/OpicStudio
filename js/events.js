/* ─── js/events.js ─────────────────────────────────────
   bindEvents, bindDestInput, searchKakaoPlaces
   ──────────────────────────────────────────────────── */

let _destTimer = null;

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
          <div class="ps-icon">📍</div>
          <div class="ps-text">
            <span class="ps-name">${escapeHtml(p.place_name)}</span>
            <span class="ps-addr">${escapeHtml(p.road_address_name || p.address_name || '')}</span>
          </div>
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

function bindEvents() {
  // 로그인 화면
  document.getElementById('loginKakaoBtn')?.addEventListener('click', () => {
    getOrLoginKakao({ action: 'login' });
  });
  // 내 여행 목록 버튼들
  document.getElementById('tripsLogoutBtn')?.addEventListener('click', kakaoLogout);
  document.getElementById('tripsCreateBtn')?.addEventListener('click', async () => {
    const user = JSON.parse(localStorage.getItem(TM_KAKAO_KEY) || 'null');
    if (!user) return;
    document.getElementById('cgMyName').value = user.nickname;
    renderKakaoModalStrip('cgKakaoStrip', user);
    openModal('create-group');
  });
  document.getElementById('tripsJoinBtn')?.addEventListener('click', async () => {
    const user = JSON.parse(localStorage.getItem(TM_KAKAO_KEY) || 'null');
    if (!user) return;
    document.getElementById('jgMyName').value = user.nickname;
    renderKakaoModalStrip('jgKakaoStrip', user);
    openModal('join-group');
  });
  // 앱 내 뒤로가기
  document.getElementById('backToTripsBtn')?.addEventListener('click', () => {
    loadMyTrips();
  });

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
    let _downOnBd = false;
    bd.addEventListener('mousedown', e => { _downOnBd = e.target === bd; });
    bd.addEventListener('click', e => {
      if (e.target === bd && _downOnBd) closeModal(bd.id.replace('modal-', ''));
    });
  });

  // 그룹 탭
  document.getElementById('confirmCreateGroup').addEventListener('click', createGroup);
  document.getElementById('confirmJoinGroup').addEventListener('click', joinGroup);
  document.getElementById('editTripBtn').addEventListener('click', () => {
    if (!state.group) return;
    document.getElementById('etName').value = state.group.name;
    document.getElementById('etDest').value = state.group.dest || '';
    document.getElementById('etStart').value = state.group.startDate || '';
    document.getElementById('etEnd').value = state.group.endDate || '';
    document.getElementById('etHouseholds').value = state.group.households || 1;
    document.getElementById('etTotalPeople').value = state.group.total_people || 1;
    document.getElementById('etAdults').value = state.group.adults || 1;
    document.getElementById('etInfants').value = state.group.infants || 0;
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

  // 일정 탭
  document.getElementById('apDay').addEventListener('change', e => {
    state.currentDay = parseInt(e.target.value);
    document.getElementById('apTime').value = suggestNextTime();
  });
  document.getElementById('addPlaceBtn').addEventListener('click', openAddPlaceModal);
  document.getElementById('searchPlaceBtn').addEventListener('click', searchPlace);
  document.getElementById('apAddress').addEventListener('keydown', e => { if (e.key === 'Enter') searchPlace(); });
  document.getElementById('confirmAddPlace').addEventListener('click', addPlace);
  document.getElementById('confirmEditPlace').addEventListener('click', editPlace);

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
    if (mapInstance && state.userLat) { mapInstance.setCenter(new kakao.maps.LatLng(state.userLat, state.userLng)); mapInstance.setLevel(4); }
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

  // 작업 5: OCR 버튼
  document.getElementById('ocrReceiptBtn')?.addEventListener('click', () => {
    const fileInput = document.getElementById('aeReceipt');
    if (!fileInput.files[0]) {
      // 파일이 없으면 파일 선택 먼저
      fileInput.click();
      fileInput.addEventListener('change', function onceChange(e) {
        fileInput.removeEventListener('change', onceChange);
        const file = e.target.files[0];
        if (file) runReceiptOCR(file);
      });
    } else {
      runReceiptOCR(fileInput.files[0]);
    }
  });

  // 여행지 자동완성
  bindDestInput('cgDest', 'cgDestSuggestions');
  bindDestInput('etDest', 'etDestSuggestions');

  // URL 파라미터 처리 (초대 링크: ?invite=XXXXXX) — 중복 참여 방지
  const urlParams = new URLSearchParams(location.search);
  const inviteFromUrl = urlParams.get('invite');
  if (inviteFromUrl) {
    const code = inviteFromUrl.toUpperCase();
    (async () => {
      const user = await getOrLoginKakao({ action: 'join', inviteCode: code });
      if (!user) return;
      // handleInviteCode로 중복 여부 확인 후 처리
      await handleInviteCode(code);
    })();
  }
}
