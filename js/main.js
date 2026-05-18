/* ─── js/main.js ───────────────────────────────────────
   init, DOMContentLoaded
   ──────────────────────────────────────────────────── */

async function init() {
  if (window.Kakao && !Kakao.isInitialized()) Kakao.init(KAKAO_APP_KEY);

  bindEvents(); // 항상 먼저 — 로그인 버튼 포함

  const callbackHandled = await handleKakaoCallback();
  if (callbackHandled) return; // handleKakaoCallback 내부에서 loadMyTrips() 완료

  const kakaoUser = JSON.parse(localStorage.getItem(TM_KAKAO_KEY) || 'null');
  if (!kakaoUser) {
    showScreen('screenLogin');
    return;
  }

  if (kakaoUser.accessToken && window.Kakao?.isInitialized()) {
    Kakao.Auth.setAccessToken(kakaoUser.accessToken);
  }

  await loadMyTrips();
}

document.addEventListener('DOMContentLoaded', init);
