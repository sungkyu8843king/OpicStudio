/* ─── js/group.js ──────────────────────────────────────
   createGroup, joinGroup, editTrip, leaveGroup,
   removeMember, renderGroupTab, shareGroup, kakaoShare
   ──────────────────────────────────────────────────── */

// ── 그룹 탭 렌더링 ─────────────────────────────────────
function renderGroupTab() {
  const groupState = document.getElementById('groupState');
  const leaveBtn = document.getElementById('leaveGroupBtn');

  if (!state.group) {
    if (groupState) groupState.classList.add('hidden');
    leaveBtn.style.display = 'none';
    document.getElementById('appBarTitle').textContent = '트립메이트';
    return;
  }

  if (groupState) groupState.classList.remove('hidden');
  leaveBtn.style.display = '';

  const g = state.group;
  document.getElementById('appBarTitle').textContent = g.name;
  document.getElementById('groupEmojiWrap').textContent = destEmoji(g.dest);
  document.getElementById('groupNameText').textContent = g.name;
  document.getElementById('groupDestText').textContent = g.dest || '목적지 미설정';
  document.getElementById('inviteCodeDisplay').textContent = g.code;

  if (g.startDate && g.endDate) {
    const n = daysBetween(g.startDate, g.endDate);
    document.getElementById('groupDatesText').textContent =
      `${formatDate(g.startDate)} ~ ${formatDate(g.endDate)} (${n}일)`;
  } else {
    document.getElementById('groupDatesText').textContent = '날짜 미설정';
  }

  const ml = document.getElementById('memberList');
  ml.innerHTML = '';
  document.getElementById('memberBadge').textContent = g.members.length;
  g.members.forEach(m => {
    const li = document.createElement('li');
    li.className = 'member-item';
    const bg = avatarColor(m.name);
    li.innerHTML = `
      <div class="member-avatar" style="background:${bg}">${m.name.slice(0, 1)}</div>
      <span class="member-name">${m.name}</span>
      ${m.isMe ? '<span class="member-me">나</span>' : ''}
      <span class="member-loc">${m.lastSeen || ''}</span>
      <button class="member-remove-btn" data-id="${m.id}" data-name="${escapeHtml(m.name)}" title="${m.isMe ? '나가기' : '제외'}">${m.isMe ? '나가기' : '제외'}</button>
    `;
    li.querySelector('.member-remove-btn').addEventListener('click', () => {
      if (m.isMe) leaveGroup();
      else removeMember(m.id, m.name);
    });
    ml.appendChild(li);
  });

  // 날씨 + 투표 로드
  loadWeather();
  loadVotes().then(() => renderVotes());

  // 리포트 버튼
  const reportBtn = document.getElementById('reportBtn');
  if (reportBtn) {
    reportBtn.onclick = null;
    reportBtn.addEventListener('click', openTripReport);
  }

  const infoBlock = document.getElementById('tripInfoBlock');
  const nights = g.startDate && g.endDate ? daysBetween(g.startDate, g.endDate) - 1 : 0;
  const adultsStr = g.adults != null ? `성인 ${g.adults}명` : '';
  const infantsStr = g.infants > 0 ? ` · 유아 ${g.infants}명` : '';
  const totalPeopleStr = g.total_people ? ` (총 ${g.total_people}명)` : '';
  infoBlock.innerHTML = `
    <div class="info-row"><span class="info-icon">📍</span><div><span class="info-label">여행지</span><div class="info-value">${g.dest || '미설정'}</div></div></div>
    <div class="info-row"><span class="info-icon">📅</span><div><span class="info-label">일정</span><div class="info-value">${g.startDate ? `${formatDateFull(g.startDate)} ~ ${formatDateFull(g.endDate)} (${nights}박 ${nights+1}일)` : '미설정'}</div></div></div>
    <div class="info-row"><span class="info-icon">👥</span><div><span class="info-label">멤버</span><div class="info-value">${g.members.length}명${g.households > 1 ? ` / ${g.households}가구` : ''}${adultsStr ? ` · ${adultsStr}${infantsStr}${totalPeopleStr}` : ''}</div></div></div>
    <div class="info-row"><span class="info-icon">💰</span><div><span class="info-label">총 경비</span><div class="info-value">${formatKRW(state.expenses.reduce((s,e) => s + Number(e.amount), 0))}</div></div></div>
  `;
}

async function createGroup() {
  const name = document.getElementById('cgName').value.trim();
  const dest = document.getElementById('cgDest').value.trim();
  const startDate = document.getElementById('cgStart').value;
  const endDate = document.getElementById('cgEnd').value;
  const myName = document.getElementById('cgMyName').value.trim();
  const households = parseInt(document.getElementById('cgHouseholds').value) || 1;
  const totalPeople = parseInt(document.getElementById('cgTotalPeople').value) || 1;
  const adults = parseInt(document.getElementById('cgAdults').value) || 1;
  const infants = parseInt(document.getElementById('cgInfants').value) || 0;

  if (!name) { showToast('그룹 이름을 입력하세요', 'error'); return; }
  if (!myName) { showToast('내 이름을 입력하세요', 'error'); return; }
  if (startDate && endDate && endDate < startDate) {
    showToast('귀환일이 출발일보다 빠릅니다', 'error'); return;
  }

  showToast('그룹 만드는 중...', '');

  const { data: grp, error: grpErr } = await sb.from('trip_groups').insert({
    name, dest: dest || null,
    start_date: startDate || null, end_date: endDate || null,
    code: genCode(),
    households: Math.max(1, households),
    total_people: Math.max(1, totalPeople),
    adults: Math.max(0, adults),
    infants: Math.max(0, infants),
  }).select().single();

  if (grpErr) { showToast('오류: ' + grpErr.message, 'error'); return; }

  const kakaoUser = JSON.parse(localStorage.getItem(TM_KAKAO_KEY) || 'null');
  const { data: member, error: mErr } = await sb.from('trip_members').insert({
    group_id: grp.id, name: myName, is_online: true,
    kakao_id: kakaoUser?.id || null,
  }).select().single();

  if (mErr) { showToast('오류: ' + mErr.message, 'error'); return; }

  closeModal('create-group');
  showToast('그룹이 만들어졌습니다! 🎉', 'success');
  await enterTrip(grp.id, member.id);
}

async function joinGroup() {
  const code = document.getElementById('jgCode').value.trim().toUpperCase();
  const myName = document.getElementById('jgMyName').value.trim();

  if (code.length !== 6) { showToast('6자리 코드를 입력하세요', 'error'); return; }
  if (!myName) { showToast('내 이름을 입력하세요', 'error'); return; }

  showToast('그룹 찾는 중...', '');

  const { data: grp, error } = await sb.from('trip_groups').select('*').eq('code', code).single();
  if (error || !grp) { showToast('코드를 찾을 수 없습니다', 'error'); return; }

  const kakaoUser = JSON.parse(localStorage.getItem(TM_KAKAO_KEY) || 'null');

  // 중복 참여 방지: 이미 멤버인지 확인
  if (kakaoUser) {
    const { data: existingMember } = await sb
      .from('trip_members')
      .select('*')
      .eq('group_id', grp.id)
      .eq('kakao_id', kakaoUser.id)
      .maybeSingle();

    if (existingMember) {
      closeModal('join-group');
      showToast('이미 참여 중인 그룹입니다', '');
      await enterTrip(grp.id, existingMember.id);
      return;
    }
  }

  const { data: member, error: mErr } = await sb.from('trip_members').insert({
    group_id: grp.id, name: myName, is_online: true,
    kakao_id: kakaoUser?.id || null,
  }).select().single();

  if (mErr) { showToast('오류: ' + mErr.message, 'error'); return; }

  closeModal('join-group');
  showToast(`${myName}님, 그룹에 합류했습니다! 🎉`, 'success');
  await enterTrip(grp.id, member.id);
}

async function editTrip() {
  if (!state.group) return;
  const name = document.getElementById('etName').value.trim();
  const dest = document.getElementById('etDest').value.trim();
  const startDate = document.getElementById('etStart').value;
  const endDate = document.getElementById('etEnd').value;
  const households = parseInt(document.getElementById('etHouseholds').value) || 1;
  const totalPeople = parseInt(document.getElementById('etTotalPeople').value) || 1;
  const adults = parseInt(document.getElementById('etAdults').value) || 1;
  const infants = parseInt(document.getElementById('etInfants').value) || 0;

  if (!name) { showToast('그룹 이름을 입력하세요', 'error'); return; }

  const { error } = await sb.from('trip_groups').update({
    name, dest: dest || null,
    start_date: startDate || null, end_date: endDate || null,
    households: Math.max(1, households),
    total_people: Math.max(1, totalPeople),
    adults: Math.max(0, adults),
    infants: Math.max(0, infants),
  }).eq('id', state.group.id);

  if (error) { showToast('저장 실패', 'error'); return; }

  await loadGroupData(state.group.id);
  closeModal('edit-trip');
  showToast('저장되었습니다', 'success');
  renderGroupTab();
  renderSchedule();
}

async function leaveGroup() {
  if (!confirm('그룹에서 나가시겠습니까?')) return;

  const myId = localStorage.getItem(TM_MEMBER_KEY);
  if (myId) await sb.from('trip_members').delete().eq('id', myId);

  if (realtimeSub) { realtimeSub.unsubscribe(); realtimeSub = null; }
  clearSession();
  showToast('그룹을 떠났습니다');
  await loadMyTrips();
}

async function removeMember(memberId, memberName) {
  if (!confirm(`${memberName}님을 그룹에서 제외하시겠습니까?`)) return;
  const { error } = await sb.from('trip_members').delete().eq('id', memberId);
  if (error) { showToast('제외 실패', 'error'); return; }
  await loadGroupData(state.group.id);
  renderGroupTab();
  showToast(`${memberName}님을 제외했습니다`);
}

function shareGroup() {
  if (!state.group) { showToast('먼저 그룹을 만드세요'); return; }
  const url = `${location.origin}${location.pathname}?invite=${state.group.code}`;
  if (navigator.share) {
    navigator.share({ title: state.group.name, text: `트립메이트 초대 코드: ${state.group.code}`, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => showToast('링크가 복사되었습니다 📋', 'success')).catch(() => showToast('코드: ' + state.group.code));
  }
}

function kakaoShare() {
  if (!state.group) return;
  const code = state.group.code;
  const url = `${location.origin}${location.pathname}?invite=${code}`;

  if (window.Kakao && Kakao.isInitialized()) {
    const dateStr = state.group.startDate
      ? `${formatDate(state.group.startDate)} ~ ${formatDate(state.group.endDate)}`
      : '일정 미정';
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `${state.group.name} 여행에 초대합니다! ✈️`,
        description: `초대 코드: ${code}  ·  ${state.group.dest || ''}  ${dateStr}`,
        imageUrl: 'https://tripmate-seven-wine.vercel.app/assets/tripmate-icon-512.png',
        link: { mobileWebUrl: url, webUrl: url }
      },
      buttons: [{ title: '여행 참여하기', link: { mobileWebUrl: url, webUrl: url } }]
    });
  } else {
    navigator.clipboard.writeText(url).then(() => {
      showToast('초대 링크가 복사됐습니다 📋', 'success');
    }).catch(() => {
      showToast(`초대 코드: ${code}`, 'success');
    });
  }
}
