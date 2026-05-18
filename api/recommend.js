/**
 * POST /api/recommend
 * body: { expenses, trip }
 * returns: { ok, suggestions: [{ item, reason, emoji }] }
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'API key not set' });

  const { expenses = [], trip = {} } = req.body || {};

  // 경비 항목 텍스트 정리
  const expenseLines = expenses
    .map(e => `- ${e.name}${e.amount ? ` (${Number(e.amount).toLocaleString()}원)` : ''}${e.category ? ` [${e.category}]` : ''}`)
    .join('\n') || '(아직 경비 없음)';

  const tripInfo = [
    trip.dest    ? `목적지: ${trip.dest}` : null,
    trip.nights  ? `기간: ${trip.nights}박 ${trip.nights + 1}일` : null,
    trip.adults  ? `성인 ${trip.adults}명` : null,
    trip.infants ? `유아 ${trip.infants}명` : null,
  ].filter(Boolean).join(', ') || '정보 없음';

  const prompt = `당신은 여행 준비를 도와주는 친근한 도우미입니다.

여행 정보: ${tripInfo}

지금까지 등록된 경비/구매 항목:
${expenseLines}

위 목록을 보고, 구매한 것들과 연관되어 **빠졌을 가능성이 있는 준비물**을 3~7개 제안해주세요.

규칙:
- 이미 구매한 항목과 중복되지 않게
- 집에 있을 수도 있어서 "혹시 챙겼나요?" 스타일로 부드럽게
- 실용적이고 구체적인 것 위주 (소금, 후추 처럼)
- 여행지/인원/구매내역 맥락을 반영

JSON 배열로만 응답하세요 (다른 텍스트 없이):
[
  { "item": "소금", "reason": "고기 구이에 필요할 수 있어요", "emoji": "🧂" },
  { "item": "후추", "reason": "고기 양념용으로 챙겨가시면 좋아요", "emoji": "🌶️" }
]`;

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
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array in response');

    const suggestions = JSON.parse(jsonMatch[0]);
    return res.json({ ok: true, suggestions });
  } catch (e) {
    console.error('[recommend]', e.message);
    return res.status(500).json({ error: e.message });
  }
}
