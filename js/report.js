/* ─── js/report.js ───────────────────────────────────
   openTripReport, buildReportHtml, shareReport
   ──────────────────────────────────────────────────── */

function openTripReport() {
  if (!state.group) { showToast('먼저 그룹을 만드세요', 'error'); return; }
  const body = document.getElementById('reportBody');
  if (body) body.innerHTML = buildReportHtml();
  openModal('trip-report');
}

function buildReportHtml() {
  const g       = state.group;
  const schedule = state.schedule || [];
  const expenses = state.expenses || [];

  if (!g) return '';

  const nights    = g.startDate && g.endDate ? Math.max(0, daysBetween(g.startDate, g.endDate) - 1) : 0;
  const totalDays = nights + 1;
  const totalExp  = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const memberCount = g.members?.length || 1;
  const perPerson = memberCount > 0 ? Math.round(totalExp / memberCount) : 0;

  const expCatMeta = {
    food:          { label: '식비',      emoji: '🍽️' },
    transport:     { label: '교통',      emoji: '🚌' },
    accommodation: { label: '숙소',      emoji: '🏨' },
    activity:      { label: '액티비티',  emoji: '🎭' },
    shopping:      { label: '쇼핑',      emoji: '🛍️' },
    other:         { label: '기타',      emoji: '📝' },
  };

  // 카테고리별 합계
  const catTotals = {};
  expenses.forEach(e => {
    const cat = e.category || 'other';
    catTotals[cat] = (catTotals[cat] || 0) + Number(e.amount);
  });
  const catRows = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => {
      const meta = expCatMeta[cat] || { label: cat, emoji: '📝' };
      const pct  = totalExp > 0 ? Math.round(amt / totalExp * 100) : 0;
      return `
        <div class="report-cat-row">
          <div class="report-cat-label">
            <span>${meta.emoji} ${meta.label}</span>
            <span>${formatKRW(amt)} (${pct}%)</span>
          </div>
          <div class="report-cat-bar-wrap">
            <div class="report-cat-bar" style="width:${pct}%"></div>
          </div>
        </div>`;
    }).join('');

  // 일정
  const totalPlaces = schedule.reduce((s, d) => s + (d.places?.length || 0), 0);
  const scheduleRows = schedule.map((d, i) => {
    const places = d.places || [];
    if (!places.length) return `<div class="report-day-row"><span class="report-day-label">Day ${i+1} (${formatDate(d.date)})</span><span class="report-day-empty">장소 없음</span></div>`;
    return `
      <div class="report-day-block">
        <div class="report-day-label">Day ${i+1} <span class="report-day-date">${formatDate(d.date)}</span></div>
        <ul class="report-place-list">
          ${places.map(p => `<li><span class="report-place-time">${p.time || '--:--'}</span> ${escapeHtml(p.name)}</li>`).join('')}
        </ul>
      </div>`;
  }).join('');

  // 요약 헤더
  const destStr  = g.dest || '미설정';
  const dateStr  = g.startDate && g.endDate
    ? `${formatDate(g.startDate)} ~ ${formatDate(g.endDate)} (${nights}박 ${totalDays}일)`
    : '날짜 미설정';

  return `
    <!-- 여행 요약 -->
    <div class="report-section">
      <div class="report-section-title">✈️ 여행 요약</div>
      <div class="report-summary-grid">
        <div class="report-summary-item"><span class="rs-label">여행명</span><span class="rs-value">${escapeHtml(g.name)}</span></div>
        <div class="report-summary-item"><span class="rs-label">목적지</span><span class="rs-value">${escapeHtml(destStr)}</span></div>
        <div class="report-summary-item"><span class="rs-label">일정</span><span class="rs-value">${dateStr}</span></div>
        <div class="report-summary-item"><span class="rs-label">멤버</span><span class="rs-value">${memberCount}명</span></div>
      </div>
    </div>

    <!-- 일정 -->
    ${schedule.length ? `
    <div class="report-section">
      <div class="report-section-title">📅 여행 일정</div>
      ${scheduleRows}
    </div>` : ''}

    <!-- 경비 -->
    <div class="report-section">
      <div class="report-section-title">💰 경비</div>
      <div class="report-expense-summary">
        <div class="report-exp-row"><span>총 경비</span><strong>${formatKRW(totalExp)}</strong></div>
        <div class="report-exp-row"><span>1인당</span><strong>${formatKRW(perPerson)}</strong></div>
      </div>
      ${catRows ? `<div class="report-cat-list">${catRows}</div>` : '<p class="report-empty">경비 없음</p>'}
    </div>

    <!-- 통계 -->
    <div class="report-section">
      <div class="report-section-title">📊 통계</div>
      <div class="report-stat-grid">
        <div class="report-stat-item"><span class="stat-num">${totalDays}</span><span class="stat-label">총 일수</span></div>
        <div class="report-stat-item"><span class="stat-num">${totalPlaces}</span><span class="stat-label">총 장소</span></div>
        <div class="report-stat-item"><span class="stat-num">${memberCount}</span><span class="stat-label">멤버 수</span></div>
        <div class="report-stat-item"><span class="stat-num">${expenses.length}</span><span class="stat-label">경비 항목</span></div>
      </div>
    </div>`;
}

// ── 공유 ─────────────────────────────────────────────
function shareReport() {
  const g        = state.group;
  if (!g) return;

  const schedule = state.schedule || [];
  const expenses = state.expenses || [];
  const nights   = g.startDate && g.endDate ? Math.max(0, daysBetween(g.startDate, g.endDate) - 1) : 0;
  const totalDays = nights + 1;
  const totalExp = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const perPerson = g.members?.length > 0 ? Math.round(totalExp / g.members.length) : 0;

  let lines = [
    `✈️ ${g.name} 여행 리포트`,
    `📍 목적지: ${g.dest || '미설정'}`,
    `📅 ${g.startDate ? `${formatDate(g.startDate)} ~ ${formatDate(g.endDate)} (${nights}박 ${totalDays}일)` : '날짜 미설정'}`,
    `👥 멤버: ${g.members?.length || 0}명`,
    '',
  ];

  if (schedule.some(d => d.places?.length)) {
    lines.push('── 일정 ──');
    schedule.forEach((d, i) => {
      if (d.places?.length) {
        lines.push(`Day${i+1} (${formatDate(d.date)})`);
        d.places.forEach(p => lines.push(`  ${p.time || ''} ${p.name}`));
      }
    });
    lines.push('');
  }

  if (expenses.length) {
    lines.push('── 경비 ──');
    lines.push(`총 경비: ${formatKRW(totalExp)}`);
    lines.push(`1인당:   ${formatKRW(perPerson)}`);
    lines.push('');
  }

  lines.push('— TripMate로 만든 여행 리포트');
  const text = lines.join('\n');

  if (navigator.share) {
    navigator.share({ title: `${g.name} 여행 리포트`, text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text)
      .then(() => showToast('리포트가 클립보드에 복사되었습니다 📋', 'success'))
      .catch(() => showToast('공유 기능을 사용할 수 없습니다', 'error'));
  }
}
