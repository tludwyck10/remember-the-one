// ── Closeness-tier reminder engine ──────────────────────────────────────────
// Pure functions only — no Supabase calls here. useReminderSync (in
// src/hooks/useReminderSync.js) diffs this output against live tasks and
// performs the actual create/update/delete calls.

const DAY = 24 * 60 * 60 * 1000;

export const CADENCE_TIERS = ['Inner Circle', 'Discipling', 'Active Relationships'];

export const TIER_INTERVAL_DAYS = {
  'Inner Circle':         3,
  'Discipling':            7,
  'Active Relationships': 30,
};

export const NEW_CONNECTION_STEP1_DAYS = 3;
export const NEW_CONNECTION_STEP2_DAYS = 14;
export const BIRTHDAY_ADVANCE_DAYS = 7;

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY);
}

function reminderLabel(kind, personName) {
  switch (kind) {
    case 'cadence':             return `Connect with ${personName}`;
    case 'new_connection_1':    return `First follow-up with ${personName}`;
    case 'new_connection_2':    return `Second follow-up with ${personName}`;
    case 'promote_or_archive':  return `Promote ${personName} or archive?`;
    case 'birthday':            return `Wish ${personName} a happy birthday!`;
    case 'birthday_advance':    return `${personName}'s birthday is in a week`;
    default:                    return `Follow up with ${personName}`;
  }
}

// Next occurrence (today or future) of a recurring 'YYYY-MM-DD' birthday, ignoring year.
function nextBirthdayOccurrence(birthday, now) {
  const [, m, d] = birthday.split('-').map(Number);
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  let candidate = new Date(today.getFullYear(), m - 1, d);
  if (candidate < today) candidate = new Date(today.getFullYear() + 1, m - 1, d);
  return candidate;
}

// True if any COMPLETED reminder of this kind already covers `year` — i.e. this
// annual occurrence has already been handled and shouldn't be recreated yet.
// `advanceDays` accounts for advance reminders, whose due date sits that many
// days BEFORE the occurrence they're attached to (e.g. 7 for a week-early nudge).
function hasCompletedForYear(tasks, personId, kind, year, advanceDays = 0) {
  return tasks.some(t => {
    if (t.personId !== personId || t.sourceType !== 'reminder' || t.reminderKind !== kind || !t.completed || !t.dueAt) {
      return false;
    }
    const occurrence = advanceDays ? addDays(new Date(t.dueAt), advanceDays) : new Date(t.dueAt);
    return occurrence.getFullYear() === year;
  });
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

    // Birthdays apply regardless of tier, and run before the tier-specific
    // branches below (which `continue` past this point in the loop).
    if (person.birthday) {
      let nextBirthday = nextBirthdayOccurrence(person.birthday, now);
      const bdayTask = findOpenReminder(tasks, person.id, 'birthday');
      if (!bdayTask) {
        // If this occurrence's reminder was already completed (e.g. they
        // checked it off on the day itself), don't instantly recreate it —
        // roll forward to next year's instead.
        if (hasCompletedForYear(tasks, person.id, 'birthday', nextBirthday.getFullYear())) {
          nextBirthday = new Date(nextBirthday);
          nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
        }
        toCreate.push({ personId: person.id, personName: person.name, reminderKind: 'birthday', dueAt: nextBirthday });
      } else {
        const currentDue = bdayTask.dueAt ? new Date(bdayTask.dueAt) : null;
        if (!currentDue || Math.abs(currentDue.getTime() - nextBirthday.getTime()) > 60_000) {
          toUpdate.push({ id: bdayTask.id, dueAt: nextBirthday });
        }
      }

      if (person.circle === 'Inner Circle') {
        let advanceDue = addDays(nextBirthday, -BIRTHDAY_ADVANCE_DAYS);
        const advanceTask = findOpenReminder(tasks, person.id, 'birthday_advance');
        if (!advanceTask) {
          // Same guard: if the advance heads-up for this occurrence was
          // already completed, wait for next year's rather than re-firing.
          if (hasCompletedForYear(tasks, person.id, 'birthday_advance', nextBirthday.getFullYear(), BIRTHDAY_ADVANCE_DAYS)) {
            const rolled = new Date(nextBirthday);
            rolled.setFullYear(rolled.getFullYear() + 1);
            advanceDue = addDays(rolled, -BIRTHDAY_ADVANCE_DAYS);
          }
          toCreate.push({ personId: person.id, personName: person.name, reminderKind: 'birthday_advance', dueAt: advanceDue });
        } else {
          const currentDue = advanceTask.dueAt ? new Date(advanceTask.dueAt) : null;
          if (!currentDue || Math.abs(currentDue.getTime() - advanceDue.getTime()) > 60_000) {
            toUpdate.push({ id: advanceTask.id, dueAt: advanceDue });
          }
        }
      } else {
        // No longer Inner Circle — drop the early reminder if one's pending.
        const staleAdvance = findOpenReminder(tasks, person.id, 'birthday_advance');
        if (staleAdvance) toDelete.push(staleAdvance.id);
      }
    } else {
      // Birthday was cleared — drop any open birthday reminders.
      const staleBday = findOpenReminder(tasks, person.id, 'birthday');
      if (staleBday) toDelete.push(staleBday.id);
      const staleAdvance = findOpenReminder(tasks, person.id, 'birthday_advance');
      if (staleAdvance) toDelete.push(staleAdvance.id);
    }

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
        if (!['cadence', 'birthday', 'birthday_advance'].includes(t.reminderKind)) toDelete.push(t.id);
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
