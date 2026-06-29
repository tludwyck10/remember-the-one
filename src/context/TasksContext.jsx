import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const TasksContext = createContext(null);

function dbToTask(row) {
  return {
    id:         row.id,
    personId:   row.person_id,
    personName: row.person_name,
    label:      row.label,
    type:       row.type,
    date:       row.date,
    time:       row.time,
    category:   row.category,
    notes:      row.notes,
    pastorId:   row.pastor_id || null,
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

  async function markComplete(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, category: 'Completed' } : t));
    const { error } = await supabase
      .from('tasks').update({ category: 'Completed' }).eq('id', id);
    if (error) console.error('Task update error:', error);
  }

  async function addTask(taskData) {
    const newTask = {
      id:          `t${Date.now()}`,
      person_id:   taskData.personId,
      person_name: taskData.personName,
      label:       taskData.label,
      type:        taskData.type || 'call',
      date:        taskData.date,
      time:        taskData.time || '',
      category:    taskData.category || 'This Week',
      notes:       taskData.notes || '',
      church_id:   church?.id      || null,
      pastor_id:   userProfile?.id || null,
    };

    setTasks(prev => [...prev, dbToTask(newTask)]);

    const { error } = await supabase.from('tasks').insert(newTask);
    if (error) console.error('Task insert error:', error);
  }

  return (
    <TasksContext.Provider value={{ tasks, loading, markComplete, addTask }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be inside TasksProvider');
  return ctx;
}
