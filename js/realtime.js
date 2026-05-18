/* ─── js/realtime.js ───────────────────────────────────
   subscribeRealtime, realtimeSub
   ──────────────────────────────────────────────────── */

let realtimeSub = null;

function subscribeRealtime(groupId) {
  if (realtimeSub) realtimeSub.unsubscribe();

  realtimeSub = sb.channel('tm-' + groupId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_members', filter: `group_id=eq.${groupId}` }, async () => {
      await loadGroupData(groupId);
      renderGroupTab();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_places', filter: `group_id=eq.${groupId}` }, async () => {
      await loadGroupData(groupId);
      renderSchedule();
      if (mapInstance) refreshMapMarkers();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_expenses', filter: `group_id=eq.${groupId}` }, async () => {
      await loadGroupData(groupId);
      renderExpenses();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_groups', filter: `id=eq.${groupId}` }, async () => {
      await loadGroupData(groupId);
      renderGroupTab();
      renderSchedule();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_votes', filter: `group_id=eq.${groupId}` }, async () => {
      await loadVotes();
      renderVotes();
    })
    .subscribe();
}
