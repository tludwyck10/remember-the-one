import { useEffect, useRef } from 'react';
import { computeReminderActions } from '../lib/reminders';

// Reactively keeps each contact's auto-generated reminder task(s) in sync with
// their current tier and last-contacted date. Runs whenever people or tasks change.
//
// IMPORTANT: people and tasks load via two independent Supabase fetches that
// can resolve at different times. If this ran while one is still loading, it
// would see an incomplete picture (e.g. people loaded but tasks still []) and
// wrongly conclude a contact has no reminder history at all — recreating
// already-completed one-off reminders (like birthdays) with a fresh, wrong
// due date before the real data ever arrives. Both must be fully loaded first.
export default function useReminderSync(people, tasks, { addTask, updateTask, deleteTask }, userId, loading) {
  const runningRef = useRef(false);

  useEffect(() => {
    if (!userId || loading || people.length === 0 || runningRef.current) return;

    const { toCreate, toUpdate, toDelete } = computeReminderActions(people, tasks, userId);
    if (toCreate.length === 0 && toUpdate.length === 0 && toDelete.length === 0) return;

    runningRef.current = true;
    (async () => {
      for (const id of toDelete) await deleteTask(id);
      for (const u of toUpdate) await updateTask(u.id, { dueAt: u.dueAt });
      for (const c of toCreate) {
        await addTask({
          personId:     c.personId,
          personName:   c.personName,
          label:        c.label,
          sourceType:   'reminder',
          reminderKind: c.reminderKind,
          dueAt:        c.dueAt,
          category:     'This Week',
        });
      }
      runningRef.current = false;
    })();
  }, [people, tasks, userId, loading]);
}
