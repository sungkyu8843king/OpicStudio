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

// ── 작업 5: 영수증 OCR (Tesseract.js) ────────────────
async function runReceiptOCR(imageFile) {
  showToast('영수증 인식 중...', '');
  try {
    const { data: { text } } = await Tesseract.recognize(imageFile, 'kor+eng');
    // 금액 파싱: 가장 큰 숫자를 total로
    const numbers = [...text.matchAll(/[\d,]+/g)]
      .map(m => parseInt(m[0].replace(/,/g, '')))
      .filter(n => n >= 100 && n <= 10000000);
    if (numbers.length) {
      const amount = Math.max(...numbers);
      document.getElementById('aeAmount').value = amount;
      showToast(`금액 인식: ₩${amount.toLocaleString()}`, 'success');
    } else {
      showToast('금액을 인식하지 못했습니다. 직접 입력해주세요', '');
    }
    // 날짜 파싱
    const dateMatch = text.match(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/);
    if (dateMatch) {
      const d = `${dateMatch[1]}-${String(dateMatch[2]).padStart(2,'0')}-${String(dateMatch[3]).padStart(2,'0')}`;
      document.getElementById('aeDate').value = d;
    }
  } catch(e) {
    showToast('인식 실패. 직접 입력해주세요', 'error');
  }
}
