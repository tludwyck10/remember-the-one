import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Mail, Phone, MapPin } from 'lucide-react';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { usePeople } from '../context/PeopleContext';

export default function TeamMember() {
  const { pastorId }                       = useParams();
  const { teamMembers, userProfile }       = useAuth();
  const { people }                         = usePeople();

  const member   = teamMembers.find(m => m.id === pastorId);
  const contacts = people.filter(p => p.pastorId === pastorId);

  if (!member) {
    return (
      <div className="page-enter p-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400 mb-4">Team member not found</p>
        <Link to="/team" className="btn-secondary">← Back to Team</Link>
      </div>
    );
  }

  const isMe      = member.id === userProfile?.id;
  const fullName  = `${member.first_name} ${member.last_name}`.trim() || 'Team Member';
  const displayName = `${member.title ? member.title + ' ' : ''}${fullName}`.trim();

  return (
    <div className="page-enter min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6">
        <Link to="/team"
          className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-gray-700 mb-5 transition-colors w-fit">
          <ArrowLeft className="w-3 h-3" /> Pastoral Team
        </Link>

        <div className="flex items-center gap-5">
          <Avatar name={fullName} size="xl" />
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-light text-gray-900">{displayName}</h1>
              {member.role === 'admin' && (
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">
                  <Shield className="w-3 h-3 text-amber-500" />
                  <span className="text-[9px] text-amber-600 uppercase tracking-[0.1em] font-semibold">Admin</span>
                </div>
              )}
              {isMe && (
                <span className="text-[9px] uppercase tracking-[0.1em] bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full font-medium">
                  You
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-[0.12em] mt-1">{member.role}</p>

            <div className="flex items-center gap-4 mt-2.5 flex-wrap">
              {member.campus && (
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <MapPin className="w-3 h-3" /> {member.campus} Campus
                </span>
              )}
              {member.phone && (
                <a href={`tel:${member.phone}`} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-[#2A9D8F] transition-colors">
                  <Phone className="w-3 h-3" /> {member.phone}
                </a>
              )}
              {member.email && (
                <a href={`mailto:${member.email}`} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-[#2A9D8F] transition-colors">
                  <Mail className="w-3 h-3" /> {member.email}
                </a>
              )}
            </div>

            {member.bio && (
              <p className="text-xs text-gray-500 mt-3 max-w-lg leading-relaxed">{member.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-sm font-semibold text-gray-800 mb-4">
          Pouring into {contacts.length} {contacts.length === 1 ? 'person' : 'people'}
        </p>

        {contacts.length === 0 ? (
          <div className="card py-12 text-center">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">No contacts yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map(person => (
              <Link key={person.id} to={`/people/${person.id}`}
                className="card flex items-center gap-4 px-5 py-4 hover:shadow-md transition-all group">
                <Avatar name={person.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{person.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge label={person.circle} />
                    <span className="text-[10px] text-gray-400">
                      {person.lastContactDays === 0
                        ? 'Contacted today'
                        : `${person.lastContactDays}d since contact`}
                    </span>
                    {person.cllStage && (
                      <>
                        <span className="text-gray-200">·</span>
                        <span className="text-[10px] text-gray-400">{person.cllStage}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-[#2A9D8F] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  Open →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
