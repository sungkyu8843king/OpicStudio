/* ─── js/vote.js ─────────────────────────────────────
   loadVotes, renderVotes, openCreateVoteModal,
   saveVote, castVote, closeVote, deleteVote
   ──────────────────────────────────────────────────── */

let _votes = [];

// ── 투표 로드 ──────────────────────────────────────────
async function loadVotes() {
  if (!state.group) { _votes = []; return; }
  try {
    const { data, error } = await sb
      .from('trip_votes')
      .select('*')
      .eq('group_id', state.group.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    _votes = data || [];
  } catch (e) {
    console.error('[vote] loadVotes', e);
    _votes = [];
  }
}

// ── 투표 렌더링 ────────────────────────────────────────
function renderVotes() {
  const voteCard    = document.getElementById('voteCard');
  const voteSection = document.getElementById('voteSection');
  const voteBadge   = document.getElementById('voteBadge');
  if (!voteCard || !voteSection) return;

  if (!state.group) {
    voteCard.style.display = 'none';
    return;
  }

  voteCard.style.display = '';
  if (voteBadge) voteBadge.textContent = _votes.length;

  if (!_votes.length) {
    voteSection.innerHTML = `<p class="vote-empty">아직 투표가 없습니다.<br>첫 번째 투표를 만들어보세요!</p>`;
    return;
  }

  const myName = state.group.myMemberName || '';

  voteSection.innerHTML = _votes.map(v => {
    const options  = v.options || [];
    const votes    = v.votes  || {};
    const myVote   = Object.entries(votes).find(([memberId]) => memberId === (localStorage.getItem(TM_MEMBER_KEY) || ''))?.[1];
    const hasVoted = myVote !== undefined && myVote !== null;

    // 득표 수 계산
    const counts = options.map((_, i) => Object.values(votes).filter(v => v === i).length);
    const total  = counts.reduce((a, b) => a + b, 0);
    const maxCount = Math.max(...counts, 0);

    const isMine = v.created_by === myName;

    const optionsHtml = options.map((opt, i) => {
      const count   = counts[i];
      const pct     = total > 0 ? Math.round(count / total * 100) : 0;
      const isMax   = !v.is_closed ? false : count === maxCount && count > 0;
      const isMyOpt = hasVoted && myVote === i;
      return `
        <div class="vote-option ${v.is_closed ? 'vote-closed-opt' : ''} ${isMyOpt ? 'vote-opted' : ''} ${isMax ? 'vote-winner' : ''}"
             ${v.is_closed ? '' : `onclick="castVote('${v.id}', ${i})"`}>
          <div class="vote-option-top">
            <span class="vote-option-text">${escapeHtml(opt)}</span>
            <span class="vote-option-count">${count}표 (${pct}%)</span>
          </div>
          <div class="vote-bar-wrap">
            <div class="vote-bar" style="width:${pct}%"></div>
          </div>
        </div>`;
    }).join('');

    const closedAt = v.is_closed ? '<span class="vote-closed-badge">종료됨</span>' : '';
    const actions  = isMine
      ? `<div class="vote-actions">
          ${!v.is_closed ? `<button class="btn btn-sm btn-outline" onclick="closeVote('${v.id}')">종료</button>` : ''}
          <button class="btn btn-sm btn-outline btn-danger-outline" onclick="deleteVote('${v.id}')">삭제</button>
        </div>`
      : '';

    return `
      <div class="vote-item ${v.is_closed ? 'vote-closed' : ''}">
        <div class="vote-question-row">
          <span class="vote-question">${escapeHtml(v.question)}</span>
          ${closedAt}
        </div>
        <div class="vote-options">${optionsHtml}</div>
        <div class="vote-meta">
          <span class="vote-total-count">총 ${total}표 · ${v.created_by ? escapeHtml(v.created_by) : '멤버'} 작성</span>
          ${actions}
        </div>
      </div>`;
  }).join('');
}

// ── 투표 만들기 모달 ───────────────────────────────────
function openCreateVoteModal() {
  if (!state.group) { showToast('먼저 그룹을 만드세요', 'error'); return; }
  document.getElementById('cvQuestion').value = '';
  document.getElementById('cvOptions').value  = '';
  openModal('create-vote');
}

// ── 투표 저장 (insert) ────────────────────────────────
async function saveVote() {
  const question = document.getElementById('cvQuestion').value.trim();
  const optRaw   = document.getElementById('cvOptions').value.trim();

  if (!question) { showToast('질문을 입력하세요', 'error'); return; }
  if (!optRaw)   { showToast('선택지를 입력하세요', 'error'); return; }

  const options = optRaw.split('\n').map(s => s.trim()).filter(Boolean);
  if (options.length < 2) { showToast('선택지를 2개 이상 입력하세요', 'error'); return; }

  try {
    const { error } = await sb.from('trip_votes').insert({
      group_id:   state.group.id,
      question,
      options,
      votes:      {},
      is_closed:  false,
      created_by: state.group.myMemberName || '',
    });
    if (error) throw error;
    closeModal('create-vote');
    await loadVotes();
    renderVotes();
    showToast('투표가 만들어졌습니다!', 'success');
  } catch (e) {
    showToast('저장 실패: ' + e.message, 'error');
  }
}

// ── 투표하기 ──────────────────────────────────────────
async function castVote(voteId, optionIdx) {
  const myId = localStorage.getItem(TM_MEMBER_KEY);
  if (!myId) { showToast('멤버 정보를 찾을 수 없습니다', 'error'); return; }

  const vote = _votes.find(v => v.id === voteId);
  if (!vote || vote.is_closed) return;

  // 현재 votes jsonb 업데이트 (내 투표 추가/변경)
  const newVotes = { ...(vote.votes || {}), [myId]: optionIdx };

  try {
    const { error } = await sb
      .from('trip_votes')
      .update({ votes: newVotes })
      .eq('id', voteId);
    if (error) throw error;

    vote.votes = newVotes;
    renderVotes();
    showToast('투표했습니다!', 'success');
  } catch (e) {
    showToast('투표 실패: ' + e.message, 'error');
  }
}

// ── 투표 종료 ─────────────────────────────────────────
async function closeVote(voteId) {
  try {
    const { error } = await sb
      .from('trip_votes')
      .update({ is_closed: true })
      .eq('id', voteId);
    if (error) throw error;

    const v = _votes.find(x => x.id === voteId);
    if (v) v.is_closed = true;
    renderVotes();
    showToast('투표가 종료되었습니다');
  } catch (e) {
    showToast('종료 실패: ' + e.message, 'error');
  }
}

// ── 투표 삭제 ─────────────────────────────────────────
async function deleteVote(voteId) {
  if (!confirm('이 투표를 삭제하시겠습니까?')) return;
  try {
    const { error } = await sb
      .from('trip_votes')
      .delete()
      .eq('id', voteId);
    if (error) throw error;

    _votes = _votes.filter(v => v.id !== voteId);
    renderVotes();
    showToast('투표가 삭제되었습니다');
  } catch (e) {
    showToast('삭제 실패: ' + e.message, 'error');
  }
}
