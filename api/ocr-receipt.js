/**
 * POST /api/ocr-receipt
 * body: { image: base64String, type: 'image/jpeg'|'image/png'|'image/webp' }
 * returns: { ok, name, amount, date, category }
 *          또는 { error, fallback: true }  ← 클라이언트가 Tesseract로 폴백
 */
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'API key not set', fallback: true });
  }

  const { image, type = 'image/jpeg' } = req.body || {};
  if (!image) return res.status(400).json({ error: 'No image', fallback: true });

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
        max_tokens: 700,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: type, data: image },
            },
            {
              type: 'text',
              text: `이 영수증/주문내역 이미지에서 정보를 추출해 JSON 형식으로만 응답하세요.
다른 텍스트는 절대 포함하지 마세요.

{
  "name": "상호명 또는 대표 상품명 (25자 이내)",
  "amount": 최종결제금액숫자,
  "date": "YYYY-MM-DD",
  "category": "food 또는 transport 또는 accommodation 또는 activity 또는 shopping 또는 other",
  "items": [{"name": "상품명 (30자 이내)", "price": 금액숫자}]
}

추출 규칙:
- name: 가맹점명/상호명/판매자명 우선, 없으면 첫 번째 상품명
- amount: 합계·총결제금액·최종금액 (할인 적용 후 실제 결제액), 숫자만
- date: 거래일시/주문일자, 없으면 null
- category: 영수증 내용으로 추정 (식당→food, 교통→transport, 숙박→accommodation 등)
- items: 개별 구매 항목 목록. 상품이 1개뿐이면 빈 배열 [], 상품이 여러 개면 각각 name과 price 포함. 항목명은 간결하게
- 값을 알 수 없으면 null`,
            },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error?.message || `Anthropic HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // JSON 블록 추출
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) throw new Error('No JSON in Claude response');

    const result = JSON.parse(jsonMatch[0]);

    // normalize items: filter out nulls, ensure name/price fields
    const rawItems = Array.isArray(result.items) ? result.items : [];
    const items = rawItems
      .filter(it => it && it.name)
      .map(it => ({
        name:  String(it.name).slice(0, 30),
        price: it.price ? Number(String(it.price).replace(/[^0-9]/g, '')) : null,
      }))
      .filter(it => it.name.length >= 1);

    return res.json({
      ok: true,
      name:     result.name     || null,
      amount:   result.amount   ? Number(String(result.amount).replace(/[^0-9]/g, '')) : null,
      date:     result.date     || null,
      category: result.category || null,
      items:    items.length > 1 ? items : [],   // only include if multiple items
    });
  } catch (e) {
    console.error('[ocr-receipt]', e.message);
    return res.status(500).json({ error: e.message, fallback: true });
  }
}
