/* ─── js/kakao-auth.js ─────────────────────────────────
   getOrLoginKakao, handleKakaoCallback, kakaoLogout,
   renderKakaoProfileBanner, renderKakaoModalStrip
   ──────────────────────────────────────────────────── */

async function getOrLoginKakao(intent) {
  const cached = localStorage.getItem(TM_KAKAO_KEY);
  if (cached) return JSON.parse(cached);

  localStorage.setItem('tm_kakao_intent', JSON.stringify(intent || {}));
  // Kakao JS SDK authorize (response_type=code)
  if (window.Kakao?.isInitialized()) {
    Kakao.Auth.authorize({
      redirectUri: KAKAO_REDIRECT,
      scope: 'profile_nickname,profile_image',
    });
  } else {
    const qs = new URLSearchParams({
      client_id: KAKAO_APP_KEY,
      redirect_uri: KAKAO_REDIRECT,
      response_type: 'code',
      scope: 'profile_nickname profile_image',
    });
    location.href = `https://kauth.kakao.com/oauth/authorize?${qs}`;
  }
  return null;
}

async function handleKakaoCallback() {
  const urlParams = new URLSearchParams(location.search);
  const authCode = urlParams.get('code');
  if (!authCode) return false;

  // URL에서 code 파라미터 제거 (뒤로가기 재실행 방지)
  const cleanUrl = new URL(location.href);
  cleanUrl.searchParams.delete('code');
  cleanUrl.searchParams.delete('error');
  history.replaceState(null, '', cleanUrl.toString());

  try {
    showToast('카카오 로그인 중...', '');

    // 인가코드 → 액세스 토큰 교환
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_APP_KEY,
        redirect_uri: KAKAO_REDIRECT,
        code: authCode,
      }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      showToast('카카오 토큰 오류: ' + (tokenData.error_description || tokenData.error), 'error');
      return;
    }

    const accessToken = tokenData.access_token;
    if (window.Kakao?.isInitialized()) Kakao.Auth.setAccessToken(accessToken);

    // 사용자 프로필 조회
    const profileRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await profileRes.json();
    const user = {
      id: String(data.id),
      nickname: data.kakao_account?.profile?.nickname || '여행자',
      profileImage: data.kakao_account?.profile?.profile_image_url || null,
      accessToken,
    };
    localStorage.setItem(TM_KAKAO_KEY, JSON.stringify(user));
    showToast(`안녕하세요, ${user.nickname}님 👋`, 'success');

    // 저장된 intent 복원
    const intentStr = localStorage.getItem('tm_kakao_intent');
    localStorage.removeItem('tm_kakao_intent');
    const intent = intentStr ? JSON.parse(intentStr) : {};

    await loadMyTrips();

    if (intent.action === 'create') {
      document.getElementById('cgMyName').value = user.nickname;
      renderKakaoModalStrip('cgKakaoStrip', user);
      openModal('create-group');
    } else if (intent.action === 'join') {
      if (intent.inviteCode) document.getElementById('jgCode').value = intent.inviteCode;
      document.getElementById('jgMyName').value = user.nickname;
      renderKakaoModalStrip('jgKakaoStrip', user);
      openModal('join-group');
    }
    return true;
  } catch(e) {
    showToast('카카오 로그인 처리 중 오류가 발생했습니다', 'error');
    console.error(e);
    return false;
  }
}

function kakaoLogout() {
  if (window.Kakao?.isInitialized() && Kakao.Auth.getAccessToken()) {
    Kakao.Auth.logout();
  }
  localStorage.removeItem(TM_KAKAO_KEY);
  localStorage.removeItem(TM_GROUP_KEY);
  localStorage.removeItem(TM_MEMBER_KEY);
  localStorage.removeItem('tm_kakao_intent');
  state.group = null;
  showToast('로그아웃 됐습니다');
  showScreen('screenLogin');
}

function renderKakaoProfileBanner(user) {
  const el = document.getElementById('kakaoProfileBanner');
  if (!el) return;
  if (!user) { el.classList.add('hidden'); return; }
  const av = user.profileImage
    ? `<img class="kakao-avatar" src="${user.profileImage}" alt="">`
    : `<span class="kakao-avatar-fallback">😊</span>`;
  el.innerHTML = `
    ${av}
    <div class="kakao-profile-info">
      <div class="kakao-profile-hello">카카오 계정</div>
      <div class="kakao-profile-name">${user.nickname}</div>
    </div>
    <button class="kakao-logout-btn" onclick="kakaoLogout()">로그아웃</button>
  `;
  el.classList.remove('hidden');
}

function renderKakaoModalStrip(stripId, user) {
  const el = document.getElementById(stripId);
  if (!el || !user) return;
  const av = user.profileImage
    ? `<img class="km-avatar" src="${user.profileImage}" alt="">`
    : `<span class="km-avatar">😊</span>`;
  el.innerHTML = `
    <div class="kakao-user-row">
      ${av}
      <span class="km-name">${user.nickname}</span>
      <span class="km-badge">카카오 로그인</span>
    </div>
  `;
}
