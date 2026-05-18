/**
 * POST /api/recommend-full
 * body: { trip, schedule, expenses }
 * returns: { ok, packing, places, tips, missing }
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'API key not set' });

  const { trip = {}, schedule = [], expenses = [] } = req.body || {};

  // 여행 정보 텍스트
  const month = trip.startDate ? new Date(trip.startDate).getMonth() + 1 : new Date().getMonth() + 1;
  const season = month >= 6 && month <= 8 ? '여름' : month >= 12 || month <= 2 ? '겨울' : month >= 3 && month <= 5 ? '봄' : '가을';

  const tripInfo = [
    trip.dest     ? `목적지: ${trip.dest}` : null,
    trip.nights   ? `기간: ${trip.nights}박 ${trip.nights + 1}일` : '당일치기',
    trip.startDate ? `출발: ${trip.startDate} (${season})` : `계절: ${season}`,
    trip.adults   ? `성인 ${trip.adults}명` : null,
    trip.infants  ? `유아 ${trip.infants}명` : null,
  ].filter(Boolean).join(', ');

  // 이미 계획된 일정
  const scheduledPlaces = schedule
    .flatMap(d => (d.places || []).map(p => p.name))
    .filter(Boolean);
  const scheduleText = scheduledPlaces.length
    ? scheduledPlaces.join(', ')
    : '(없음)';

  // 구매/경비 목록
  const expenseText = expenses.length
    ? expenses
        .map(e => `${e.name}${e.amount ? `(${Number(e.amount).toLocaleString()}원)` : ''}`)
        .join(', ')
    : '(없음)';

  const prompt = `당신은 여행 전문 AI 어시스턴트입니다. 아래 여행 정보를 바탕으로 맞춤 추천을 제공하세요.

여행 정보: ${tripInfo}
계획된 일정: ${scheduleText}
구매/경비 목록: ${expenseText}

아래 JSON 형식으로만 응답하세요 (마크다운·설명·코드블록 없이 순수 JSON):
{
  "packing": [
    {"item": "준비물명 (10자 이내)", "reason": "이유 (15자 이내)", "emoji": "이모지"}
  ],
  "places": [
    {"name": "장소명 (실제 존재하는 곳)", "desc": "한 줄 설명 (25자 이내)", "category": "restaurant|attraction|activity|cafe|shopping", "emoji": "이모지", "tip": "짧은 팁 (20자 이내)"}
  ],
  "tips": [
    {"tip": "실용적인 여행 팁 (45자 이내)", "emoji": "이모지"}
  ],
  "missing": [
    {"item": "항목명", "reason": "이유 (20자 이내)", "emoji": "이모지"}
  ]
}

규칙:
- packing: 여행지·계절·인원 맞춤 준비물 8~12개. 유아 있으면 유아용품 포함. 여름이면 자외선 대비, 겨울이면 방한 대비
- places: 여행지의 실제 유명 장소/맛집/카페 6~8개. 이미 계획된 일정(${scheduleText})과 겹치지 않게. 식당·관광지·카페·체험 다양하게
- tips: 이 여행지 실용 꿀팁 4~5개 (교통·날씨·예약·현지 특성·주의사항 등)
- missing: 구매 목록 기반으로 빠졌을 물건 3~5개. 구매 목록이 "(없음)"이면 빈 배열 []
- 여행지(dest) 정보가 없으면 모든 배열을 빈 배열 []로`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1600,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const result = JSON.parse(jsonMatch[0]);
    return res.json({
      ok:      true,
      packing: Array.isArray(result.packing) ? result.packing : [],
      places:  Array.isArray(result.places)  ? result.places  : [],
      tips:    Array.isArray(result.tips)    ? result.tips    : [],
      missing: Array.isArray(result.missing) ? result.missing : [],
    });

  } catch (e) {
    console.error('[recommend-full]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
