import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import { usePeople } from '../context/PeopleContext';
import { useAuth } from '../context/AuthContext';
import { STAGES, STAGE_META } from './CLLPathway';

export default function CLLStage() {
  const { stage: stageParam } = useParams();
  const { people, updatePerson } = usePeople();
  const { userProfile } = useAuth();
  const [query, setQuery] = useState('');

  const stage = STAGES.find(s => s.toLowerCase() === stageParam?.toLowerCase());
  const meta  = stage ? STAGE_META[stage] : null;

  const myPeople = people.filter(p => p.pastorId === userProfile?.id);
  const stagepeople = myPeople.filter(p => (p.cllStage ?? 'Belong') === stage);
  const filtered = stagepeople.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  function moveToStage(personId, targetStage) {
    updatePerson(personId, { cllStage: targetStage });
  }

  if (!stage || !meta) {
    return (
      <div className="page-enter p-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400 mb-4">Stage not found</p>
        <Link to="/cll" className="btn-secondary">← Back to CLL Pathway</Link>
      </div>
    );
  }

  const stageIndex = STAGES.indexOf(stage);

  return (
    <div className="page-enter min-h-full">
      {/* Header */}
      <div className={`border-b border-gray-100 px-8 py-6 ${meta.color}`}>
        <Link to="/cll"
          className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-gray-700 mb-5 transition-colors w-fit">
          <ArrowLeft className="w-3 h-3" /> CLL Pathway
        </Link>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label mb-1">CLL Pathway</p>
            <h1 className={`text-2xl font-light tracking-tight ${meta.accent}`}>{stage}</h1>
            <p className="text-xs text-gray-500 mt-1">{meta.description}</p>
          </div>
          <div className={`text-right`}>
            <p className={`text-4xl font-light ${meta.accent}`}>{stagepeople.length}</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500 mt-0.5">
              {stagepeople.length === 1 ? 'person' : 'people'}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border-b border-gray-100 px-8 py-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${stage}...`}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-[#2A9D8F] transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="p-6 max-w-3xl mx-auto space-y-2">
        {filtered.length === 0 && (
          <div className="card py-16 text-center">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">
              {stagepeople.length === 0 ? 'No one in this stage yet' : 'No results match your search'}
            </p>
          </div>
        )}

        {filtered.map(person => (
          <div key={person.id} className="card px-5 py-4 flex items-center gap-4">
            <Link to={`/people/${person.id}`} className="flex-shrink-0">
              <Avatar name={person.name} avatarUrl={person.avatarUrl} size="md" />
            </Link>

            <div className="flex-1 min-w-0">
              <Link to={`/people/${person.id}`}
                className="text-sm font-medium text-gray-900 hover:text-[#2A9D8F] transition-colors block truncate">
                {person.name}
              </Link>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <Badge label={person.circle} />
                {person.campus && (
                  <span className="text-[10px] text-gray-400">{person.campus}</span>
                )}
              </div>
            </div>

            {/* Stage move buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {stageIndex > 0 && (
                <button
                  onClick={() => moveToStage(person.id, STAGES[stageIndex - 1])}
                  className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-700 border border-gray-200 px-2.5 py-1 rounded-lg transition-colors">
                  <ArrowLeft className="w-2.5 h-2.5" /> {STAGES[stageIndex - 1]}
                </button>
              )}
              {meta.nextStage && (
                <button
                  onClick={() => moveToStage(person.id, meta.nextStage)}
                  className="flex items-center gap-1 text-[10px] font-medium text-[#2A9D8F] hover:bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg transition-colors">
                  {meta.nextStage} <ArrowRight className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
