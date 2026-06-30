import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const TasksContext = createContext(null);

// Keeps the legacy date/category text fields (still used by the Calendar page)
// in sync with the new due_at timestamp whenever it's set or changes.
function deriveLegacyFields(dueAtIso) {
  if (!dueAtIso) return { date: '', category: 'This Week' };
  const due = new Date(dueAtIso);
  const date = due.toISOString().split('T')[0];
  const dueDay = new Date(due); dueDay.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((dueDay - today) / 86400000);
  const category = diffDays < 0 ? 'Overdue' : diffDays === 0 ? 'Due Today' : 'This Week';
  return { date, category };
}

function dbToTask(row) {
  return {
    id:           row.id,
    personId:     row.person_id,
    personName:   row.person_name,
    label:        row.label,
    type:         row.type,
    date:         row.date,
    time:         row.time,
    category:     row.category,
    notes:        row.notes,
    pastorId:     row.pastor_id || null,
    sourceType:   row.source_type || 'manual',
    sourceId:     row.source_id || null,
    reminderKind: row.reminder_kind || null,
    completed:    !!row.completed,
    completedAt:  row.completed_at || null,
    dueAt:        row.due_at || null,
    snoozedUntil: row.snoozed_until || null,
  };
}

export function TasksProvider({ children }) {
  const { church, userProfile } = useAuth();
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!church?.id) {
      setTasks([]);
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('church_id', church.id)
        .order('date', { ascending: true });

      if (error) { console.error('Tasks load error:', error); setLoading(false); return; }
      setTasks((data || []).map(dbToTask));
      setLoading(false);
    }
    load();
  }, [church?.id]);

  function patchTask(id, updater) {
    setTasks(prev => prev.map(t => t.id === id ? updater(t) : t));
  }

  async function markComplete(id) {
    const nowIso = new Date().toISOString();
    patchTask(id, t => ({ ...t, category: 'Completed', completed: true, completedAt: nowIso }));
    const { error } = await supabase
      .from('tasks').update({ category: 'Completed', completed: true, completed_at: nowIso }).eq('id', id);
    if (error) console.error('Task update error:', error);
  }

  async function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    if (task.completed) {
      patchTask(id, t => ({ ...t, completed: false, completedAt: null, category: 'This Week' }));
      const { error } = await supabase
        .from('tasks').update({ completed: false, completed_at: null }).eq('id', id);
      if (error) console.error('Task update error:', error);
    } else {
      await markComplete(id);
    }
  }

  async function addTask(taskData) {
    const dueAtIso = taskData.dueAt ? new Date(taskData.dueAt).toISOString() : null;
    const legacy = deriveLegacyFields(dueAtIso);

    const newTask = {
      id:            `t${Date.now()}`,
      person_id:     taskData.personId || null,
      person_name:   taskData.personName || '',
      label:         taskData.label,
      type:          taskData.type || 'call',
      date:          taskData.date || legacy.date,
      time:          taskData.time || '',
      category:      taskData.category || legacy.category,
      notes:         taskData.notes || '',
      church_id:     church?.id      || null,
      pastor_id:     userProfile?.id || null,
      source_type:   taskData.sourceType || 'manual',
      source_id:     taskData.sourceId   || null,
      reminder_kind: taskData.reminderKind || null,
      due_at:        dueAtIso,
      completed:     false,
    };

    setTasks(prev => [...prev, dbToTask(newTask)]);

    const { error } = await supabase.from('tasks').insert(newTask);
    if (error) console.error('Task insert error:', error);
    return dbToTask(newTask);
  }

  async function updateTask(id, changes) {
    const dbChanges = {};
    let legacyPatch = {};
    if (changes.dueAt        !== undefined) {
      const dueAtIso = changes.dueAt ? new Date(changes.dueAt).toISOString() : null;
      dbChanges.due_at = dueAtIso;
      const legacy = deriveLegacyFields(dueAtIso);
      Object.assign(dbChanges, legacy);
      legacyPatch = { date: legacy.date, category: legacy.category };
    }
    patchTask(id, t => ({ ...t, ...changes, ...legacyPatch }));

    if (changes.snoozedUntil !== undefined) dbChanges.snoozed_until = changes.snoozedUntil ? new Date(changes.snoozedUntil).toISOString() : null;
    if (changes.label        !== undefined) dbChanges.label         = changes.label;
    if (changes.notes        !== undefined) dbChanges.notes         = changes.notes;
    if (changes.completed    !== undefined) dbChanges.completed     = changes.completed;

    if (Object.keys(dbChanges).length === 0) return;
    const { error } = await supabase.from('tasks').update(dbChanges).eq('id', id);
    if (error) console.error('Task update error:', error);
  }

  async function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) console.error('Task delete error:', error);
  }

  async function snoozeTask(id, days) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const base = task.dueAt ? new Date(task.dueAt) : new Date();
    const floor = new Date();
    const snoozedUntil = new Date(Math.max(base.getTime(), floor.getTime()) + days * 24 * 60 * 60 * 1000);
    await updateTask(id, { dueAt: snoozedUntil, snoozedUntil });
  }

  return (
    <TasksContext.Provider value={{
      tasks, loading,
      markComplete, toggleComplete,
      addTask, updateTask, deleteTask, snoozeTask,
    }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be inside TasksProvider');
  return ctx;
}
