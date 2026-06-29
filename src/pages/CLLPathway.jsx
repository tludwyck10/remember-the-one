import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Avatar from '../components/Avatar';
import { usePeople } from '../context/PeopleContext';

const STAGES = ['Belong', 'Become', 'Build', 'Beyond'];

const STAGE_META = {
  Belong: {
    description: 'Everyone is welcome at Shoreline City. This is the entry point — the door is always open.',
    nextStage: 'Become',
    nextLabel: 'Become',
    steps: [
      'Attend JOIN',
    ],
    color: 'bg-amber-50 border-amber-100',
    accent: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
  },
  Become: {
    description: 'Taking the step of ownership at Shoreline City.',
    nextStage: 'Build',
    nextLabel: 'Build',
    steps: [
      'Get baptized',
      'Join a Connect Group',
      'Join a serve team',
    ],
    color: 'bg-teal-50 border-teal-100',
    accent: 'text-teal-700',
    badge: 'bg-teal-100 text-teal-700',
  },
  Build: {
    description: 'Going deeper — serving, giving, and stepping into leadership.',
    nextStage: 'Beyond',
    nextLabel: 'Beyond',
    steps: [
      'Host a Connect Group',
      'Take a step on the giving ladder',
      'Join a leadership position on a serve team',
    ],
    color: 'bg-blue-50 border-blue-100',
    accent: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
  },
  Beyond: {
    description: 'There is no end to what God can do in your life.',
    nextStage: null,
    nextLabel: null,
    steps: [],
    color: 'bg-purple-50 border-purple-100',
    accent: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-700',
  },
};

export default function CLLPathway() {
  const { people, updatePerson } = usePeople();

  function moveToStage(personId, stage) {
    updatePerson(personId, p => ({ ...p, cllStage: stage }));
  }

  const counts = STAGES.reduce((acc, s) => {
    acc[s] = people.filter(p => (p.cllStage ?? 'Belong') === s).length;
    return acc;
  }, {});

  return (
    <div className="page-enter min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6">
        <p className="section-label mb-1">Spiritual Formation</p>
        <h1 className="text-2xl font-light text-gray-900 tracking-tight">CLL Pathway</h1>
        <p className="text-xs text-gray-400 mt-1">Christ-Like Leader Pathway · Four stages of spiritual growth</p>
      </div>

      {/* Stage count cards */}
      <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAGES.map(stage => {
          const meta = STAGE_META[stage];
          return (
            <div key={stage} className={`card p-5 border ${meta.color}`}>
              <p className={`text-3xl font-light ${meta.accent}`}>{counts[stage]}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-gray-700 mt-1">{stage}</p>
            </div>
          );
        })}
      </div>

      {/* Stage columns */}
      <div className="px-6 pb-8 grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAGES.map(stage => {
          const meta = STAGE_META[stage];
          const stagepeople = people.filter(p => (p.cllStage ?? 'Belong') === stage);

          return (
            <div key={stage} className="card overflow-hidden flex flex-col">
              {/* Stage header */}
              <div className={`px-5 py-4 border-b ${meta.color}`}>
                <p className={`text-sm font-semibold tracking-wide ${meta.accent}`}>{stage}</p>
                <p className="text-[10px] text-gray-500 leading-relaxed mt-1">{meta.description}</p>
              </div>

              {/* Next steps */}
              {meta.steps.length > 0 && (
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <p className="section-label mb-2.5">Next Steps</p>
                  <ul className="space-y-1.5">
                    {meta.steps.map(step => (
                      <li key={step} className="flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${meta.badge.split(' ')[0]}`} />
                        <span className="text-[11px] text-gray-600 leading-snug">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* People */}
              <div className="flex-1 divide-y divide-gray-50">
                {stagepeople.length === 0 && (
                  <div className="px-5 py-10 text-center">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-gray-300">No one here yet</p>
                  </div>
                )}
                {stagepeople.map(person => (
                  <div key={person.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar name={person.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <Link to={`/people/${person.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-[#2A9D8F] transition-colors leading-snug block">
                          {person.name}
                        </Link>
                        <p className="text-[10px] text-gray-400">{person.circle}</p>
                      </div>
                    </div>
                    {/* Stage actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {meta.nextStage && (
                        <button
                          onClick={() => moveToStage(person.id, meta.nextStage)}
                          className="flex items-center gap-1 text-[10px] font-medium text-[#2A9D8F] hover:bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg transition-colors">
                          {meta.nextLabel} <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                      {stage !== 'Belong' && (
                        <button
                          onClick={() => moveToStage(person.id, STAGES[STAGES.indexOf(stage) - 1])}
                          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-700 transition-colors">
                          <ArrowLeft className="w-2.5 h-2.5" /> Back
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
