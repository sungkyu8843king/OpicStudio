/* ─── js/expense.js ────────────────────────────────────
   renderExpenses, openAddExpenseModal, addExpense,
   deleteExpense, runReceiptOCR (Tesseract)
   ──────────────────────────────────────────────────── */

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
    const item = document.createElement('div');
    item.className = 'expense-item';
    item.innerHTML = `
      <div class="expense-cat-icon">${CAT_EMOJI[exp.category] || '📝'}</div>
      <div class="expense-details">
        <div class="expense-name">${exp.name}</div>
        <div class="expense-meta">${CAT_LABEL[exp.category] || '기타'} · ${exp.payer || '미지정'} · ${exp.date || ''}</div>
      </div>
      ${exp.receipt ? `<img class="expense-receipt-thumb" src="${exp.receipt}" alt="영수증">` : ''}
      <div class="expense-right">
        <div class="expense-amount">${formatKRW(exp.amount)}</div>
        <div class="expense-per">${isHousehold ? '가구당' : '1인당'} ${formatKRW(perPerson)}</div>
      </div>
      <button class="expense-del-btn" onclick="deleteExpense('${exp.id}')">🗑</button>
    `;
    list.appendChild(item);
  });
}

function openAddExpenseModal() {
  if (!state.group) { showToast('먼저 그룹을 만드세요', 'error'); return; }

  document.getElementById('aeName').value = '';
  document.getElementById('aeAmount').value = '';
  document.getElementById('aeNote').value = '';
  document.getElementById('receiptFileName').textContent = '';
  document.getElementById('receiptThumb').innerHTML = '';
  document.getElementById('receiptThumb').classList.add('hidden');
  document.getElementById('aeDate').value = new Date().toISOString().slice(0,10);

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

async function addExpense() {
  const name = document.getElementById('aeName').value.trim();
  const amount = parseFloat(document.getElementById('aeAmount').value);

  if (!name) { showToast('항목명을 입력하세요', 'error'); return; }
  if (!amount || amount <= 0) { showToast('금액을 입력하세요', 'error'); return; }

  const insertData = {
    group_id: state.group.id,
    name, amount,
    category: document.getElementById('aeCat').value,
    payer: document.getElementById('aePayer').value || null,
    date: document.getElementById('aeDate').value || null,
    note: document.getElementById('aeNote').value.trim() || null,
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

async function deleteExpense(id) {
  const { error } = await sb.from('trip_expenses').delete().eq('id', id);
  if (error) { showToast('삭제 실패', 'error'); return; }

  await loadGroupData(state.group.id);
  renderExpenses();
  showToast('삭제되었습니다');
}

// ── 영수증 OCR (Tesseract.js) ────────────────────────
async function runReceiptOCR(imageFile) {
  const btn = document.getElementById('ocrReceiptBtn');
  if (btn) { btn.textContent = '인식 중... 🔍'; btn.disabled = true; }
  showToast('영수증 분석 중...', '');

  try {
    // 이미지 전처리: 업스케일 + 그레이스케일 + 대비 강화 → 인식률 향상
    const enhanced = await enhanceReceiptImage(imageFile);

    const { data } = await Tesseract.recognize(enhanced, 'kor+eng', {
      tessedit_pageseg_mode: '6',   // 단일 균일 블록 (영수증에 최적)
      preserve_interword_spaces: '1',
    });
    const text = data.text;

    // ① 금액 추출 (합계 키워드 우선 → 폴백: 최대값)
    const amount = extractReceiptAmount(text);
    // ② 날짜 추출
    const date = extractReceiptDate(text);
    // ③ 항목명 추출 (상호명)
    const name = extractReceiptName(text);

    if (amount) {
      document.getElementById('aeAmount').value = amount;
    }
    if (date) {
      document.getElementById('aeDate').value = date;
    }
    if (name) {
      const nameEl = document.getElementById('aeName');
      if (!nameEl.value) nameEl.value = name;
    }

    const parts = [];
    if (name)   parts.push(name);
    if (amount) parts.push(`₩${Number(amount).toLocaleString()}`);
    if (date)   parts.push(date);

    if (parts.length) {
      showToast('인식 완료: ' + parts.join(' · '), 'success');
    } else {
      showToast('인식 결과가 없습니다. 직접 입력해주세요', '');
    }
  } catch (e) {
    showToast('인식 실패. 직접 입력해주세요', 'error');
    console.error('OCR error', e);
  } finally {
    if (btn) { btn.textContent = '📷 영수증 인식'; btn.disabled = false; }
  }
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
  const patterns = [
    /합\s*계\s*[:\s]*([\d,]+)/,
    /총\s*합\s*계\s*[:\s]*([\d,]+)/,
    /결\s*제\s*금\s*액\s*[:\s]*([\d,]+)/,
    /받\s*을\s*금\s*액\s*[:\s]*([\d,]+)/,
    /청\s*구\s*금\s*액\s*[:\s]*([\d,]+)/,
    /총\s*액\s*[:\s]*([\d,]+)/,
    /소\s*계\s*[:\s]*([\d,]+)/,
    /TOTAL\s*[:\s]*([\d,]+)/i,
    /금\s*액\s*[:\s]*([\d,]+)/,
    /([\d,]+)\s*원/,            // "12,000원" 형식
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const n = parseInt(m[1].replace(/,/g, ''));
      if (n >= 100 && n <= 10000000) return n;
    }
  }
  // 폴백: 4자리 이상 숫자 중 최댓값
  const nums = [...text.matchAll(/[\d,]{4,}/g)]
    .map(m => parseInt(m[0].replace(/,/g, '')))
    .filter(n => n >= 1000 && n <= 10000000);
  return nums.length ? Math.max(...nums) : null;
}

// 날짜 추출 (YYYY-MM-DD / YY-MM-DD / YYYY.MM.DD 등)
function extractReceiptDate(text) {
  const m4 = text.match(/(\d{4})[.\-\/년](\d{1,2})[.\-\/월](\d{1,2})/);
  if (m4) return `${m4[1]}-${String(m4[2]).padStart(2,'0')}-${String(m4[3]).padStart(2,'0')}`;
  const m2 = text.match(/(\d{2})[.\-\/](\d{2})[.\-\/](\d{2})/);
  if (m2) {
    const y = parseInt(m2[1]) <= 30 ? '20' + m2[1] : '19' + m2[1];
    return `${y}-${m2[2]}-${m2[3]}`;
  }
  return null;
}

// 상호명 추출 (첫 의미 있는 줄)
function extractReceiptName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const skip = /^[\d\s₩,\-\.\/\(\)\*]+$|영수증|RECEIPT|T[Ee][Ll]|F[Aa][Xx]|사업자|등록번호|주\s*소|대표자|e.?mail|www\.|http|^\s*$/i;
  for (const line of lines.slice(0, 8)) {
    const cleaned = line.replace(/[^가-힣a-zA-Z0-9\s]/g, '').trim();
    if (cleaned.length >= 2 && cleaned.length <= 20 && !skip.test(line) && /[가-힣a-zA-Z]/.test(cleaned)) {
      return cleaned;
    }
  }
  return null;
}
