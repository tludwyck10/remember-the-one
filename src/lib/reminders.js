// ── Closeness-tier reminder engine ──────────────────────────────────────────
// Pure functions only — no Supabase calls here. useReminderSync (in
// src/hooks/useReminderSync.js) diffs this output against live tasks and
// performs the actual create/update/delete calls.

const DAY = 24 * 60 * 60 * 1000;

export const CADENCE_TIERS = ['Inner Circle', 'Disciples', 'Active Relationships'];

export const TIER_INTERVAL_DAYS = {
  'Inner Circle':         3,
  'Disciples':            7,
  'Active Relationships': 30,
};

export const NEW_CONNECTION_STEP1_DAYS = 3;
export const NEW_CONNECTION_STEP2_DAYS = 14;

// Completing a recurring cadence reminder means "I connected with them" — it
// must advance the contact's last_contacted_at, or the reminder engine just
// recreates the same overdue task on the next sync pass.
export async function resolveTaskToggle(task, { toggleComplete, markContacted }) {
  if (!task.completed && task.sourceType === 'reminder' && task.reminderKind === 'cadence') {
    await markContacted(task.personId);
  }
  await toggleComplete(task.id);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY);
}

function reminderLabel(kind, personName) {
  switch (kind) {
    case 'cadence':             return `Connect with ${personName}`;
    case 'new_connection_1':    return `First follow-up with ${personName}`;
    case 'new_connection_2':    return `Second follow-up with ${personName}`;
    case 'promote_or_archive':  return `Promote ${personName} or archive?`;
    default:                    return `Follow up with ${personName}`;
  }
}

// Returns the single open (uncompleted) reminder task for a person, of a given kind if specified.
function findOpenReminder(tasks, personId, kind) {
  return tasks.find(t =>
    t.personId === personId &&
    t.sourceType === 'reminder' &&
    !t.completed &&
    (kind ? t.reminderKind === kind : true)
  );
}

function findReminder(tasks, personId, kind) {
  return tasks.find(t => t.personId === personId && t.sourceType === 'reminder' && t.reminderKind === kind);
}

/**
 * Computes the set of reminder-task mutations needed to bring `tasks` in sync
 * with the current state of `people`. Returns { toCreate, toUpdate, toDelete }.
 *
 * toCreate: [{ personId, personName, reminderKind, dueAt }]
 * toUpdate: [{ id, dueAt }]
 * toDelete: [id, ...]
 */
export function computeReminderActions(people, tasks, userId) {
  const toCreate = [];
  const toUpdate = [];
  const toDelete = [];
  const now = new Date();

  const myPeople = people.filter(p => p.pastorId === userId && !p.archived);

  for (const person of myPeople) {
    const openReminders = tasks.filter(t =>
      t.personId === person.id && t.sourceType === 'reminder' && !t.completed
    );

    if (person.circle === 'New Connections') {
      // Any leftover cadence reminder from a previous tier should go away.
      const staleCadence = openReminders.find(t => t.reminderKind === 'cadence');
      if (staleCadence) toDelete.push(staleCadence.id);

      const step1 = findReminder(tasks, person.id, 'new_connection_1');
      const step2 = findReminder(tasks, person.id, 'new_connection_2');
      const promote = findReminder(tasks, person.id, 'promote_or_archive');

      if (!step1) {
        const createdAt = person.createdAt ? new Date(person.createdAt) : now;
        toCreate.push({
          personId: person.id, personName: person.name,
          reminderKind: 'new_connection_1',
          dueAt: addDays(createdAt, NEW_CONNECTION_STEP1_DAYS),
        });
      } else if (step1.completed && !step2 && !promote) {
        const anchor = step1.completedAt ? new Date(step1.completedAt) : now;
        toCreate.push({
          personId: person.id, personName: person.name,
          reminderKind: 'new_connection_2',
          dueAt: addDays(anchor, NEW_CONNECTION_STEP2_DAYS),
        });
      } else if (step2?.completed && !promote) {
        toCreate.push({
          personId: person.id, personName: person.name,
          reminderKind: 'promote_or_archive',
          dueAt: now,
        });
      }
      continue;
    }

    if (CADENCE_TIERS.includes(person.circle)) {
      // Any leftover new-connection sequence tasks from a previous tier should go away.
      for (const t of openReminders) {
        if (t.reminderKind !== 'cadence') toDelete.push(t.id);
      }

      const interval = TIER_INTERVAL_DAYS[person.circle];
      const basis = person.lastContactedAt ? new Date(person.lastContactedAt)
                  : person.createdAt ? new Date(person.createdAt) : now;
      const naturalDueAt = addDays(basis, interval);

      const cadenceTask = findOpenReminder(tasks, person.id, 'cadence');

      if (!cadenceTask) {
        toCreate.push({
          personId: person.id, personName: person.name,
          reminderKind: 'cadence', dueAt: naturalDueAt,
        });
      } else {
        const snoozedUntil = cadenceTask.snoozedUntil ? new Date(cadenceTask.snoozedUntil) : null;
        const effectiveDue = snoozedUntil && snoozedUntil > naturalDueAt ? snoozedUntil : naturalDueAt;
        const currentDue = cadenceTask.dueAt ? new Date(cadenceTask.dueAt) : null;
        if (!currentDue || Math.abs(currentDue.getTime() - effectiveDue.getTime()) > 60_000) {
          toUpdate.push({ id: cadenceTask.id, dueAt: effectiveDue });
        }
      }
      continue;
    }
  }

  return { toCreate: toCreate.map(c => ({ ...c, label: reminderLabel(c.reminderKind, c.personName) })), toUpdate, toDelete };
}
