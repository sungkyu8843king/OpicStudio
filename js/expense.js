/* ─── js/expense.js ────────────────────────────────────
   renderExpenses, openAddExpenseModal, addExpense,
   updateExpense, deleteExpense, openEditExpenseModal,
   openReceiptModal, runReceiptOCR (Tesseract)
   ──────────────────────────────────────────────────── */

let _editingExpenseId = null;   // null = 추가 모드, id = 수정 모드

function renderExpenses() {
  const total = state.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const memberCount = state.group?.members.length || 1;
  const houseCount = state.group?.households || 1;

  document.getElementById('expenseTotalDisplay').textContent = formatKRW(total);

  const isHousehold = state.splitMode === 'household';
  const divisor = isHousehold ? houseCount : memberCount;
  const perAmount = divisor > 0 ? Math.ceil(total / divisor) : 0;

  document.getElementById('splitLabel').textContent = isHousehold ? '가구당' : '1인당';
  document.getElementById('expensePerDisplay').textContent = formatKRW(perAmount);
  document.getElementById('splitDesc').textContent = isHousehold
    ? `${houseCount}가구 기준`
    : `${memberCount}명 기준`;

  const list = document.getElementById('expenseList');
  const filtered = state.expenseCat === 'all'
    ? state.expenses
    : state.expenses.filter(e => e.category === state.expenseCat);

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-expense"><span>💰</span><p>경비를 추가해보세요</p></div>';
    return;
  }

  list.innerHTML = '';
  [...filtered].reverse().forEach(exp => {
    const perPerson = divisor > 0 ? Math.ceil(Number(exp.amount) / divisor) : 0;

    // items table (note 필드가 JSON 배열이면 상품 목록)
    let itemsHtml = '';
    if (exp.note) {
      try {
        const parsed = JSON.parse(exp.note);
        if (Array.isArray(parsed) && parsed.length > 0) {
          itemsHtml = `<div class="expense-items-table">` +
            parsed.map(it => `
              <div class="expense-sub-item">
                <span class="expense-sub-name">${escapeHtml(it.name || '')}</span>
                <span class="expense-sub-price">${it.price ? formatKRW(it.price) : ''}</span>
              </div>`).join('') +
            `</div>`;
        }
      } catch {}
    }

    // 영수증 footer
    const safeId   = exp.id.replace(/'/g, "\\'");
    const safeName = (exp.name || '').replace(/'/g, "\\'");
    const footerHtml = (exp.receipt || itemsHtml)
      ? `<div class="expense-footer">
          ${exp.receipt
            ? `<button class="expense-receipt-btn" onclick="openReceiptModal('${safeId}')" title="영수증 크게 보기">
                <img src="${exp.receipt}" alt="영수증">
               </button>`
            : '<div></div>'}
          <div class="expense-actions">
            <button class="expense-edit-btn" onclick="openEditExpenseModal('${safeId}')">✏️ 수정</button>
            <button class="expense-del-btn" onclick="deleteExpense('${safeId}','${safeName}')">🗑 삭제</button>
          </div>
        </div>`
      : `<div class="expense-footer expense-footer-simple">
          <div></div>
          <div class="expense-actions">
            <button class="expense-edit-btn" onclick="openEditExpenseModal('${safeId}')">✏️ 수정</button>
            <button class="expense-del-btn" onclick="deleteExpense('${safeId}','${safeName}')">🗑 삭제</button>
          </div>
        </div>`;

    const item = document.createElement('div');
    item.className = 'expense-item';
    item.innerHTML = `
      <div class="expense-top">
        <div class="expense-cat-icon">${CAT_EMOJI[exp.category] || '📝'}</div>
        <div class="expense-details">
          <div class="expense-name">${escapeHtml(exp.name)}</div>
          <div class="expense-meta">${CAT_LABEL[exp.category] || '기타'} · ${escapeHtml(exp.payer || '미지정')} · ${exp.date || ''}</div>
        </div>
        <div class="expense-right">
          <div class="expense-amount">${formatKRW(exp.amount)}</div>
          <div class="expense-per">${isHousehold ? '가구당' : '1인당'} ${formatKRW(perPerson)}</div>
        </div>
      </div>
      ${itemsHtml}
      ${footerHtml}
    `;
    list.appendChild(item);
  });
}

// ── 영수증 크게 보기 모달 ──────────────────────────────
function openReceiptModal(expId) {
  const exp = state.expenses.find(e => e.id === expId);
  if (!exp || !exp.receipt) return;
  document.getElementById('receiptViewImg').src = exp.receipt;
  openModal('receipt-view');
}

// ── 경비 추가 모달 열기 ───────────────────────────────
function openAddExpenseModal() {
  if (!state.group) { showToast('먼저 그룹을 만드세요', 'error'); return; }

  _editingExpenseId = null;
  document.getElementById('ae-title').textContent = '경비 추가';
  document.getElementById('confirmAddExpense').textContent = '추가';

  document.getElementById('aeName').value = '';
  document.getElementById('aeAmount').value = '';
  document.getElementById('aeNote').value = '';
  document.getElementById('receiptFileName').textContent = '';
  document.getElementById('receiptThumb').innerHTML = '';
  document.getElementById('receiptThumb').classList.add('hidden');
  document.getElementById('aeDate').value = new Date().toISOString().slice(0,10);
  document.getElementById('aeCat').value = 'food';
  document.getElementById('aeReceipt').value = '';

  const payerSelect = document.getElementById('aePayer');
  payerSelect.innerHTML = '<option value="">선택 안 함</option>';
  state.group.members.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.name;
    opt.textContent = m.name + (m.isMe ? ' (나)' : '');
    if (m.isMe) opt.selected = true;
    payerSelect.appendChild(opt);
  });

  openModal('add-expense');
}

// ── 경비 수정 모달 열기 ───────────────────────────────
function openEditExpenseModal(expId) {
  const exp = state.expenses.find(e => e.id === expId);
  if (!exp) return;

  _editingExpenseId = expId;
  document.getElementById('ae-title').textContent = '경비 수정';
  document.getElementById('confirmAddExpense').textContent = '수정';

  document.getElementById('aeName').value = exp.name || '';
  document.getElementById('aeAmount').value = exp.amount || '';
  document.getElementById('aeDate').value = exp.date || '';
  document.getElementById('aeCat').value = exp.category || 'other';
  document.getElementById('aeReceipt').value = '';

  // note: JSON 상품목록이면 메모란 비우기 (카드에서 테이블로 표시됨)
  let noteVal = exp.note || '';
  try { if (noteVal.startsWith('[')) { JSON.parse(noteVal); noteVal = ''; } } catch {}
  document.getElementById('aeNote').value = noteVal;

  // 결제자 select
  const payerSelect = document.getElementById('aePayer');
  payerSelect.innerHTML = '<option value="">선택 안 함</option>';
  state.group.members.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.name;
    opt.textContent = m.name + (m.isMe ? ' (나)' : '');
    if (m.name === exp.payer) opt.selected = true;
    payerSelect.appendChild(opt);
  });

  // 영수증 미리보기
  const thumb = document.getElementById('receiptThumb');
  document.getElementById('receiptFileName').textContent = '';
  if (exp.receipt) {
    thumb.innerHTML = `<img src="${exp.receipt}" alt="영수증 미리보기" style="max-width:100%;border-radius:6px;">`;
    thumb.classList.remove('hidden');
  } else {
    thumb.innerHTML = '';
    thumb.classList.add('hidden');
  }

  openModal('add-expense');
}

// ── 추가 / 수정 공통 진입점 ───────────────────────────
async function addExpense() {
  if (_editingExpenseId) { await _doUpdateExpense(); return; }

  const name   = document.getElementById('aeName').value.trim();
  const amount = parseFloat(document.getElementById('aeAmount').value);
  if (!name)            { showToast('항목명을 입력하세요', 'error'); return; }
  if (!amount || amount <= 0) { showToast('금액을 입력하세요', 'error'); return; }

  const insertData = {
    group_id: state.group.id,
    name, amount,
    category:    document.getElementById('aeCat').value,
    payer:       document.getElementById('aePayer').value || null,
    date:        document.getElementById('aeDate').value || null,
    note:        document.getElementById('aeNote').value.trim() || null,
    receipt_url: null,
  };

  const fileInput = document.getElementById('aeReceipt');
  if (fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      insertData.receipt_url = e.target.result;
      const { error } = await sb.from('trip_expenses').insert(insertData);
      if (error) { showToast('추가 실패', 'error'); return; }
      await loadGroupData(state.group.id);
      closeModal('add-expense');
      showToast(`${name} 추가됨 ✅`, 'success');
      renderExpenses();
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    const { error } = await sb.from('trip_expenses').insert(insertData);
    if (error) { showToast('추가 실패', 'error'); return; }
    await loadGroupData(state.group.id);
    closeModal('add-expense');
    showToast(`${name} 추가됨 ✅`, 'success');
    renderExpenses();
  }
}

// ── 실제 수정 처리 ────────────────────────────────────
async function _doUpdateExpense() {
  const name   = document.getElementById('aeName').value.trim();
  const amount = parseFloat(document.getElementById('aeAmount').value);
  if (!name)            { showToast('항목명을 입력하세요', 'error'); return; }
  if (!amount || amount <= 0) { showToast('금액을 입력하세요', 'error'); return; }

  // 기존 note 보존 여부: 수정 전 exp에 JSON items가 있고 메모란이 비어있으면 기존 note 유지
  const origExp = state.expenses.find(e => e.id === _editingExpenseId);
  const memoInput = document.getElementById('aeNote').value.trim();
  let noteVal = memoInput || null;
  if (!memoInput && origExp?.note) {
    try { if (origExp.note.startsWith('[')) { JSON.parse(origExp.note); noteVal = origExp.note; } } catch {}
  }

  const updateData = {
    name, amount,
    category: document.getElementById('aeCat').value,
    payer:    document.getElementById('aePayer').value || null,
    date:     document.getElementById('aeDate').value || null,
    note:     noteVal,
  };

  const fileInput = document.getElementById('aeReceipt');
  const expId = _editingExpenseId;

  if (fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      updateData.receipt_url = e.target.result;
      await _commitUpdate(expId, updateData, name);
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    await _commitUpdate(expId, updateData, name);
  }
}

async function _commitUpdate(expId, updateData, name) {
  const { error } = await sb.from('trip_expenses').update(updateData).eq('id', expId);
  if (error) { showToast('수정 실패', 'error'); return; }
  _editingExpenseId = null;
  await loadGroupData(state.group.id);
  closeModal('add-expense');
  showToast(`${name} 수정됨 ✅`, 'success');
  renderExpenses();
}

// ── 삭제 (확인 알럿) ──────────────────────────────────
async function deleteExpense(id, name) {
  if (!confirm(`"${name || '이 항목'}"을 삭제하시겠습니까?`)) return;
  const { error } = await sb.from('trip_expenses').delete().eq('id', id);
  if (error) { showToast('삭제 실패', 'error'); return; }
  await loadGroupData(state.group.id);
  renderExpenses();
  showToast('삭제되었습니다');
}

// ── 영수증 OCR: Claude AI 우선 → Tesseract 폴백 ──────
async function runReceiptOCR(imageFile) {
  const btn = document.getElementById('ocrReceiptBtn');
  if (btn) { btn.textContent = 'AI 분석 중... 🤖'; btn.disabled = true; }
  showToast('영수증 AI 분석 중...', '');

  try {
    // ① Claude API 시도 (Vercel 서버리스 함수)
    const aiResult = await tryClaudeOCR(imageFile);

    if (aiResult) {
      applyOCRResult(aiResult);
      const parts = [];
      if (aiResult.name)   parts.push(aiResult.name);
      if (aiResult.amount) parts.push(`₩${Number(aiResult.amount).toLocaleString()}`);
      if (aiResult.date)   parts.push(aiResult.date);
      showToast('🤖 AI 인식 완료: ' + (parts.join(' · ') || '입력 완료'), 'success');
      return;
    }

    // ② Claude 실패 → Tesseract 폴백
    if (btn) btn.textContent = 'OCR 인식 중... 🔍';
    showToast('AI 불가 → 텍스트 인식으로 시도 중...', '');
    await runTesseractOCR(imageFile);

  } catch (e) {
    showToast('인식 실패. 직접 입력해주세요', 'error');
    console.error('OCR error', e);
  } finally {
    if (btn) { btn.textContent = '📷 영수증 인식'; btn.disabled = false; }
  }
}

// Claude Vision API 호출 (서버리스 함수 경유)
async function tryClaudeOCR(imageFile) {
  try {
    // 이미지를 1200px 이하로 축소 후 base64 변환 (API 효율)
    const { base64, type } = await imageToBase64(imageFile, 1200);

    const res = await fetch('/api/ocr-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, type }),
    });

    const data = await res.json();
    if (data.fallback || !data.ok) return null;   // 서버에 API 키 없음 → 폴백
    return data;
  } catch {
    return null;
  }
}

// Tesseract OCR (폴백)
async function runTesseractOCR(imageFile) {
  const enhanced = await enhanceReceiptImage(imageFile);
  const { data } = await Tesseract.recognize(enhanced, 'kor+eng', {
    tessedit_pageseg_mode: '6',
    preserve_interword_spaces: '1',
  });
  const text = data.text;

  const result = {
    name:   extractReceiptName(text),
    amount: extractReceiptAmount(text),
    date:   extractReceiptDate(text),
    category: null,
  };
  applyOCRResult(result);

  const parts = [];
  if (result.name)   parts.push(result.name);
  if (result.amount) parts.push(`₩${Number(result.amount).toLocaleString()}`);
  if (result.date)   parts.push(result.date);

  if (parts.length) showToast('인식 완료: ' + parts.join(' · '), 'success');
  else showToast('인식 결과가 없습니다. 직접 입력해주세요', '');
}

// 인식 결과를 폼에 채우기
function applyOCRResult({ name, amount, date, category, items }) {
  if (amount) document.getElementById('aeAmount').value = amount;
  if (date)   document.getElementById('aeDate').value   = date;
  if (name) {
    const el = document.getElementById('aeName');
    if (!el.value) el.value = name;
  }
  if (category) {
    const catEl = document.getElementById('aeCat');
    const validCats = ['food','transport','accommodation','activity','shopping','other'];
    if (catEl && validCats.includes(category)) catEl.value = category;
  }
  // 상품 목록이 여러 개면 note 필드에 JSON으로 저장 (카드에서 표로 표시됨)
  if (Array.isArray(items) && items.length > 1) {
    document.getElementById('aeNote').value = JSON.stringify(items);
  }
}

// 이미지 → base64 (maxPx로 축소)
function imageToBase64(file, maxPx = 1200) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const mimeType = file.type || 'image/jpeg';
      canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = e => {
          const base64 = e.target.result.split(',')[1];
          resolve({ base64, type: mimeType });
        };
        reader.readAsDataURL(blob);
      }, mimeType, 0.9);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

// 이미지 전처리: 업스케일 + 고대비 그레이스케일
async function enhanceReceiptImage(file) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      // 최대 1800px 기준 업스케일 (소문자도 선명하게)
      const maxPx = 1800;
      const scale = Math.min(3, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      // 그레이스케일 + 대비 강화
      const id = ctx.getImageData(0, 0, w, h);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        const gray = d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114;
        // 대비 1.8배 + 중심 이동
        const v = Math.min(255, Math.max(0, (gray - 128) * 1.8 + 128));
        d[i] = d[i+1] = d[i+2] = v;
      }
      ctx.putImageData(id, 0, 0);

      URL.revokeObjectURL(url);
      canvas.toBlob(blob => resolve(blob), 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

// 합계 키워드 기반 금액 추출
function extractReceiptAmount(text) {
  const lines = text.split('\n').map(l => l.trim());

  // ── 1순위: 라인별로 합계 키워드 찾기 ──
  // 우선순위 높은 것부터: 쿠팡 주문상세의 "총 결제금액" 포함
  const totalKeys = [
    /총\s*결\s*제\s*금\s*액/,  // 쿠팡 주문상세 "총 결제금액"
    /합\s*계\s*금\s*액/,        // 카드영수증 "합계금액"
    /총\s*합\s*계/,
    /결\s*제\s*금\s*액/,
    /받\s*을\s*금\s*액/,
    /청\s*구\s*금\s*액/,
    /합\s*계(?!\s*금)/,         // "합계" (합계금액 제외)
    /총\s*액/,
    /TOTAL/i,
    /소\s*계/,
  ];

  for (const kw of totalKeys) {
    for (let i = 0; i < lines.length; i++) {
      if (!kw.test(lines[i])) continue;
      // 같은 줄: 모든 숫자 중 가장 큰 값 (마이너스 제외)
      const sameNums = [...lines[i].matchAll(/([\d,]+)\s*원?/g)]
        .map(m => parseInt(m[1].replace(/,/g, '')))
        .filter(n => n >= 1000 && n <= 10000000);
      if (sameNums.length) return Math.max(...sameNums);
      // 다음 1~3줄에서 숫자 탐색
      for (let j = i + 1; j <= Math.min(i + 3, lines.length - 1); j++) {
        // 마이너스(할인금액) 줄은 건너뜀
        if (/^-/.test(lines[j])) continue;
        const m = lines[j].match(/([\d,]+)\s*원?/);
        if (m) {
          const n = parseInt(m[1].replace(/,/g, ''));
          if (n >= 1000) return n;
        }
      }
    }
  }

  // ── 2순위: "NNNN원" 중 최댓값 (할인금액 등 음수 제외) ──
  const wonNums = [...text.matchAll(/(?<![-−])([\d,]+)\s*원/g)]
    .map(m => parseInt(m[1].replace(/,/g, '')))
    .filter(n => n >= 1000 && n <= 10000000);
  if (wonNums.length) return Math.max(...wonNums);

  // ── 폴백: 4자리 이상 숫자 최댓값 ──
  const nums = [...text.matchAll(/[\d,]{4,}/g)]
    .map(m => parseInt(m[0].replace(/,/g, '')))
    .filter(n => n >= 1000 && n <= 10000000);
  return nums.length ? Math.max(...nums) : null;
}

// 날짜 추출 — YYYY-MM-DD / YYYY.MM.DD / YYYY. M. D (쿠팡 형식) 등
function extractReceiptDate(text) {
  // "2026. 5. 16" 처럼 점+공백 혼합 형식 (쿠팡 주문상세)
  const mSpace = text.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/);
  if (mSpace) return `${mSpace[1]}-${String(mSpace[2]).padStart(2,'0')}-${String(mSpace[3]).padStart(2,'0')}`;
  // YYYY-MM-DD / YYYY/MM/DD / YYYY년MM월DD일
  const m4 = text.match(/(\d{4})[-\/년](\d{1,2})[-\/월](\d{1,2})/);
  if (m4) return `${m4[1]}-${String(m4[2]).padStart(2,'0')}-${String(m4[3]).padStart(2,'0')}`;
  // YY-MM-DD
  const m2 = text.match(/(\d{2})[.\-\/](\d{2})[.\-\/](\d{2})/);
  if (m2) {
    const y = parseInt(m2[1]) <= 35 ? '20' + m2[1] : '19' + m2[1];
    return `${y}-${m2[2]}-${m2[3]}`;
  }
  return null;
}

// 항목명 추출 (우선순위: 주문상품명 > 상품명 키워드 > 판매자상호 > 가맹점명 > 첫 의미 줄)
function extractReceiptName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 1) 쿠팡 주문상세: "NNN 원 · N개" 바로 위 줄이 상품명
  //    ex) "프레쉬팜 골드 파인애플 스틱, 1kg, 1개"
  //         "10,670 원 · 1개"
  for (let i = 1; i < lines.length; i++) {
    if (/[\d,]+\s*원\s*[·・]\s*\d+개/.test(lines[i])) {
      const prev = lines[i - 1].trim();
      // 상품명 줄: 한글 포함, 숫자만 아닌 것, 너무 짧지 않게
      if (/[가-힣]/.test(prev) && prev.length >= 4 && !/배송완료|배송중|주문완료|도착/.test(prev)) {
        return prev.slice(0, 35);
      }
    }
  }

  // 2) "상품명" 키워드 바로 다음 텍스트 (카드영수증/온라인)
  const prodMatch = text.match(/상\s*품\s*명\s*[\n\s]+([^\n]{2,50})/);
  if (prodMatch) {
    const name = prodMatch[1].trim().replace(/\s+/g, ' ');
    if (/[가-힣a-zA-Z]/.test(name)) return name.slice(0, 35);
  }

  // 3) 판매자상호 (카드영수증)
  const vendorMatch = text.match(/판\s*매\s*자\s*상\s*호\s*[\n\s]+([^\n]{2,25})/);
  if (vendorMatch) {
    const name = vendorMatch[1].trim();
    if (/[가-힣a-zA-Z]/.test(name)) return name;
  }

  // 4) 가맹점명 / 상호명
  const shopMatch = text.match(/(?:가\s*맹\s*점\s*명?|상\s*호\s*명?)\s*[\n\s:]+([가-힣a-zA-Z][^\n]{1,20})/);
  if (shopMatch) return shopMatch[1].trim();

  // 5) 첫 의미 있는 줄 (종이 영수증)
  const skipRe = /^[\d\s₩,\-\.\/\(\)\*]+$|카드영수증|영수증|주문상세|RECEIPT|T[Ee][Ll]|F[Aa][Xx]|사업자|등록번호|주\s*소|대표자|e.?mail|www\.|http|결제정보|구매정보|이용상점|거래일시|카드종류|승인번호|할부|배송완료|배송중|주문번호|MY\s/i;
  for (const line of lines.slice(0, 12)) {
    const cleaned = line.replace(/[^가-힣a-zA-Z0-9\s\(\),]/g, '').trim();
    if (cleaned.length >= 4 && cleaned.length <= 35 && !skipRe.test(line) && /[가-힣]/.test(cleaned)) {
      return cleaned;
    }
  }
  return null;
}
