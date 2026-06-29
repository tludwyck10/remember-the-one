import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const PeopleContext = createContext(null);

function dbToPerson(row) {
  const prayers = (row.prayer_requests || []).map(p => ({
    id:         p.id,
    request:    p.request,
    dateAdded:  p.date_added,
    status:     p.status,
    daysActive: p.days_active,
  }));

  return {
    id:              row.id,
    name:            row.name,
    circle:          row.circle,
    phone:           row.phone || '',
    email:           row.email || '',
    campus:          row.campus || '',
    notes:           row.notes || '',
    cllStage:        row.cll_stage || 'Belong',
    lastContact:     row.last_contact || '',
    lastContactDays: row.last_contact_days || 0,
    growthAreas:     row.growth_areas || [],
    pastorId:        row.pastor_id || null,
    churchId:        row.church_id || null,
    prayerCount:     prayers.filter(p => p.status !== 'Answered').length,
    conversations:   (row.conversations || [])
      .map(c => ({ id: c.id, date: c.date, notes: c.notes }))
      .sort((a, b) => b.date.localeCompare(a.date)),
    prayerRequests:  prayers,
    lifeEvents:      (row.life_events || [])
      .map(e => ({ id: e.id, event: e.event, date: e.date, category: e.category }))
      .sort((a, b) => (b.date || '').localeCompare(a.date || '')),
  };
}

export function PeopleProvider({ children }) {
  const { church, userProfile } = useAuth();
  const [people, setPeople]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!church?.id) {
      setPeople([]);
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('people')
        .select(`*, conversations(*), prayer_requests(*), life_events(*)`)
        .eq('church_id', church.id)
        .order('name', { ascending: true });

      if (error) { console.error('People load error:', error); setLoading(false); return; }
      setPeople((data || []).map(dbToPerson));
      setLoading(false);
    }
    load();
  }, [church?.id]);

  function patchPerson(id, updater) {
    setPeople(prev => prev.map(p => p.id === id ? updater(p) : p));
  }

  async function addPerson(formData) {
    const today = new Date().toISOString().split('T')[0];
    const id    = String(Date.now());

    const row = {
      id,
      name:              formData.name.trim(),
      circle:            formData.circle,
      phone:             formData.phone.trim(),
      email:             formData.email.trim(),
      campus:            'Frisco Campus',
      notes:             formData.notes.trim(),
      cll_stage:         'Belong',
      last_contact:      today,
      last_contact_days: 0,
      growth_areas:      [],
      church_id:         church?.id   || null,
      pastor_id:         userProfile?.id || null,
    };

    const newPerson = dbToPerson({ ...row, conversations: [], prayer_requests: [], life_events: [] });
    setPeople(prev => [newPerson, ...prev]);

    const { error } = await supabase.from('people').insert(row);
    if (error) console.error('Person insert error:', error);

    return newPerson;
  }

  async function updatePerson(id, changes) {
    patchPerson(id, p => ({ ...p, ...changes }));

    const dbChanges = {};
    if (changes.name   !== undefined) dbChanges.name   = changes.name;
    if (changes.circle !== undefined) dbChanges.circle = changes.circle;
    if (changes.phone  !== undefined) dbChanges.phone  = changes.phone;
    if (changes.email  !== undefined) dbChanges.email  = changes.email;
    if (changes.campus !== undefined) dbChanges.campus = changes.campus;
    if (changes.notes  !== undefined) dbChanges.notes  = changes.notes;

    if (Object.keys(dbChanges).length === 0) return;
    const { error } = await supabase.from('people').update(dbChanges).eq('id', id);
    if (error) console.error('Person update error:', error);
  }

  async function deletePerson(id) {
    setPeople(prev => prev.filter(p => p.id !== id));
    const { error } = await supabase.from('people').delete().eq('id', id);
    if (error) console.error('Person delete error:', error);
  }

  async function updateCllStage(personId, stage) {
    patchPerson(personId, p => ({ ...p, cllStage: stage }));
    const { error } = await supabase
      .from('people').update({ cll_stage: stage }).eq('id', personId);
    if (error) console.error('CLL stage update error:', error);
  }

  async function addConversation(personId, conv) {
    patchPerson(personId, p => ({
      ...p,
      conversations:   [conv, ...p.conversations],
      lastContact:     conv.date,
      lastContactDays: 0,
    }));

    const { error } = await supabase.from('conversations').insert({
      id: conv.id, person_id: personId, date: conv.date, notes: conv.notes,
    });
    if (error) console.error('Conversation insert error:', error);

    await supabase.from('people')
      .update({ last_contact: conv.date, last_contact_days: 0 })
      .eq('id', personId);
  }

  async function addPrayerRequest(personId, pr) {
    patchPerson(personId, p => ({
      ...p,
      prayerRequests: [...p.prayerRequests, pr],
      prayerCount:    p.prayerCount + 1,
    }));

    const person = people.find(p => p.id === personId);
    const { error } = await supabase.from('prayer_requests').insert({
      id:          pr.id,
      person_id:   personId,
      person_name: person?.name || '',
      request:     pr.request,
      date_added:  pr.dateAdded,
      status:      pr.status,
      days_active: pr.daysActive,
    });
    if (error) console.error('Prayer insert error:', error);
  }

  async function markPrayerAnswered(personId, prayerId) {
    patchPerson(personId, p => ({
      ...p,
      prayerRequests: p.prayerRequests.map(r =>
        r.id === prayerId ? { ...r, status: 'Answered' } : r
      ),
      prayerCount: Math.max(0, p.prayerCount - 1),
    }));

    const { error } = await supabase.from('prayer_requests')
      .update({ status: 'Answered' }).eq('id', prayerId);
    if (error) console.error('Prayer update error:', error);
  }

  async function addLifeEvent(personId, ev) {
    const id    = ev.id || String(Date.now());
    const newEv = { ...ev, id };

    patchPerson(personId, p => ({
      ...p,
      lifeEvents: [newEv, ...p.lifeEvents],
    }));

    const { error } = await supabase.from('life_events').insert({
      id,
      person_id: personId,
      event:     ev.event,
      date:      ev.date,
      category:  ev.category,
    });
    if (error) console.error('Life event insert error:', error);
  }

  return (
    <PeopleContext.Provider value={{
      people,
      loading,
      addPerson,
      updatePerson,
      deletePerson,
      updateCllStage,
      addConversation,
      addPrayerRequest,
      markPrayerAnswered,
      addLifeEvent,
    }}>
      {children}
    </PeopleContext.Provider>
  );
}

export function usePeople() {
  const ctx = useContext(PeopleContext);
  if (!ctx) throw new Error('usePeople must be inside PeopleProvider');
  return ctx;
}
