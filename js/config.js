/* ─── js/config.js ─────────────────────────────────────
   상수, Supabase 클라이언트, Kakao 키, EMOJIS_BY_DEST,
   TYPE_EMOJI/LABEL, CAT_EMOJI/LABEL, PLACE_DB
   ──────────────────────────────────────────────────── */

// ── Supabase ─────────────────────────────────────────
const SUPABASE_URL = 'https://nmvfffzpkqyzztiobwtt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_22PPW0eCY3Tvy3vZVZYKFw_yCb8cI2f';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const TM_GROUP_KEY  = 'tm_group_id';
const TM_MEMBER_KEY = 'tm_member_id';
const TM_KAKAO_KEY  = 'tm_kakao_user';

// ── 카카오 키 ─────────────────────────────────────────
const KAKAO_APP_KEY  = '1ed552a04cbafec60a1206e37ee1bdeb';
const KAKAO_REST_KEY = '7ace39f51d1cf293ddcd0e88da29ea5c';
const KAKAO_REDIRECT = location.origin + location.pathname.replace(/\/$/, '');

// ── 상수 ─────────────────────────────────────────────
const EMOJIS_BY_DEST = {
  제주: '🏝️', 부산: '🌊', 서울: '🏙️', 경주: '🏛️',
  강릉: '🌊', 속초: '🏔️', 여수: '🦀', 전주: '🍱',
  대전: '🌳', 수원: '🏯', 인천: '✈️', 광주: '🌸',
};
const TYPE_EMOJI = {
  attraction: '🏛️', activity: '🎯', accommodation: '🏨', restaurant: '🍽️',
  cafe: '☕', transport: '🚌', shopping: '🛍️', other: '📍',
};
const TYPE_LABEL = {
  attraction: '관광지', activity: '놀거리', accommodation: '숙소', restaurant: '식당',
  cafe: '카페', transport: '교통', shopping: '쇼핑', other: '기타',
};
const CAT_EMOJI = {
  food: '🍽️', transport: '🚌', accommodation: '🏨',
  activity: '🎭', shopping: '🛍️', other: '📝',
};
const CAT_LABEL = {
  food: '식비', transport: '교통', accommodation: '숙소',
  activity: '액티비티', shopping: '쇼핑', other: '기타',
};

// Day별 경로 색상 팔레트 (범례용)
const ROUTE_COLORS = ['#FF6B35','#3A86FF','#27AE60','#9B59B6','#E74C3C','#F39C12','#1ABC9C','#E91E63'];

// 세그먼트별 구간 색상 (①→②, ②→③ 각각 다른 색)
const SEG_COLORS = ['#FF6B35','#3A86FF','#22C55E','#F59E0B','#A855F7','#EC4899','#14B8A6','#EF4444','#6366F1','#84CC16'];

// ── 한국 주요 장소 검색 DB ─────────────────────────────
const PLACE_DB = [
  { name: '성산일출봉', addr: '제주 서귀포시 성산읍', lat: 33.4582, lng: 126.9414 },
  { name: '한라산 국립공원', addr: '제주 제주시 한라산로 806', lat: 33.3617, lng: 126.5292 },
  { name: '제주 동문시장', addr: '제주 제주시 관덕로14길', lat: 33.5107, lng: 126.5219 },
  { name: '협재해수욕장', addr: '제주 제주시 한림읍 협재리', lat: 33.3944, lng: 126.2395 },
  { name: '만장굴', addr: '제주 제주시 구좌읍 만장굴길', lat: 33.5283, lng: 126.7712 },
  { name: '우도', addr: '제주 제주시 우도면', lat: 33.5056, lng: 126.9538 },
  { name: '해운대해수욕장', addr: '부산 해운대구 해운대해변로 264', lat: 35.1587, lng: 129.1603 },
  { name: '광안리해수욕장', addr: '부산 수영구 광안해변로 219', lat: 35.1531, lng: 129.1183 },
  { name: '감천문화마을', addr: '부산 사하구 감내2로 203', lat: 35.0975, lng: 129.0106 },
  { name: '자갈치시장', addr: '부산 중구 자갈치해안로 52', lat: 35.0965, lng: 129.0303 },
  { name: '경복궁', addr: '서울 종로구 사직로 161', lat: 37.5796, lng: 126.9770 },
  { name: '남산서울타워', addr: '서울 용산구 남산공원길 105', lat: 37.5512, lng: 126.9882 },
  { name: '명동', addr: '서울 중구 명동길', lat: 37.5636, lng: 126.9869 },
  { name: '홍대입구', addr: '서울 마포구 와우산로', lat: 37.5573, lng: 126.9245 },
  { name: '인사동', addr: '서울 종로구 인사동길', lat: 37.5744, lng: 126.9854 },
  { name: '불국사', addr: '경북 경주시 불국로 385', lat: 35.7900, lng: 129.3317 },
  { name: '첨성대', addr: '경북 경주시 인왕동 839-1', lat: 35.8349, lng: 129.2191 },
  { name: '경주 동궁과 월지', addr: '경북 경주시 원화로 102', lat: 35.8336, lng: 129.2254 },
  { name: '안목해변 카페거리', addr: '강원 강릉시 창해로', lat: 37.7885, lng: 128.9432 },
  { name: '설악산 국립공원', addr: '강원 속초시 설악산로 833', lat: 38.1197, lng: 128.4657 },
  { name: '여수 돌산공원', addr: '전남 여수시 돌산읍 돌산로 3600', lat: 34.7405, lng: 127.7356 },
  { name: '전주 한옥마을', addr: '전북 전주시 완산구 기린대로 99', lat: 35.8153, lng: 127.1534 },
  { name: '수원화성', addr: '경기 수원시 팔달구 행궁로 11', lat: 37.2849, lng: 127.0148 },
];
