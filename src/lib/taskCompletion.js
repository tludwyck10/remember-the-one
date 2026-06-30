// Shared "mark task complete" logic used by both the global Tasks page and the
// per-contact Tasks tab. Completing a task can optionally log how the contact
// happened — if logged, that becomes a real Conversation entry on the person.
export async function completeTaskWithLog(task, { method, notes }, { toggleComplete, markContacted, addConversation }) {
  const trimmedNotes = (notes || '').trim();
  const hasLog = !!method || !!trimmedNotes;

  if (hasLog && task.personId) {
    const today = new Date().toISOString().split('T')[0];
    const methodTag = method ? `[${method}] ` : '';
    await addConversation(task.personId, {
      id: `c${Date.now()}`,
      date: today,
      notes: `${methodTag}${trimmedNotes || 'Connected.'}`,
    });
  } else if (task.sourceType === 'reminder' && task.reminderKind === 'cadence') {
    // No log entered — still advance the cadence so the reminder doesn't
    // immediately recreate itself with the same overdue date.
    await markContacted(task.personId);
  }

  await toggleComplete(task.id);
}
