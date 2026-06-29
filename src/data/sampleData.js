export const people = [
  {
    id: '1',
    name: 'John Carter',
    circle: 'Inner Circle',
    phone: '(972) 555-0142',
    email: 'john.carter@email.com',
    campus: 'Frisco Campus',
    lastContact: '2026-06-18',
    lastContactDays: 7,
    prayerCount: 3,
    notes: 'John is a key leader in the men\'s ministry. He has been walking through a difficult season with his wife\'s health. Follow up consistently and be a steady presence.',
    upcomingTasks: [
      { id: 't1', type: 'coffee', label: 'Coffee with John', date: '2026-06-26', time: '9:00 AM' },
    ],
    conversations: [
      { id: 'c1', date: '2026-06-18', notes: 'Talked about his wife\'s upcoming surgery. He is anxious but trusting. Read Psalm 23 together. Encouraged him to lean on the community.' },
      { id: 'c2', date: '2026-06-05', notes: 'Met for coffee. Discussed his growth in leadership and next steps in the men\'s ministry. Prayed over his family.' },
      { id: 'c3', date: '2026-05-20', notes: 'Quick check-in after Sunday service. He seemed energized after the sermon. Wants to start a small group in his neighborhood.' },
    ],
    prayerRequests: [
      { id: 'pr1', request: "Wife's surgery – June 12", dateAdded: '2026-06-10', status: 'Active', daysActive: 15 },
      { id: 'pr2', request: 'Wisdom for leadership decisions at work', dateAdded: '2026-05-28', status: 'Ongoing', daysActive: 28 },
      { id: 'pr3', request: 'Son\'s college applications', dateAdded: '2026-05-01', status: 'Answered', daysActive: 55 },
    ],
    lifeEvents: [
      { id: 'le1', event: 'Wife scheduled for surgery', date: '2026-06-12', category: 'Health' },
      { id: 'le2', event: 'Promoted to senior director', date: '2026-04-15', category: 'Career' },
      { id: 'le3', event: 'Son graduating high school', date: '2026-05-30', category: 'Family' },
    ],
    growthAreas: ['Prayer life', 'Scripture memorization', 'Servant leadership'],
  },
  {
    id: '2',
    name: 'Micah Thompson',
    circle: 'Growth Circle',
    phone: '(972) 555-0187',
    email: 'micah.thompson@email.com',
    campus: 'Frisco Campus',
    lastContact: '2026-06-12',
    lastContactDays: 13,
    prayerCount: 2,
    notes: 'Micah is a young professional hungry to grow. He is sharp but needs accountability in his walk. He resonates with practical theology.',
    upcomingTasks: [
      { id: 't2', type: 'call', label: 'Call Micah', date: '2026-06-27', time: '3:00 PM' },
    ],
    conversations: [
      { id: 'c4', date: '2026-06-12', notes: 'Discussed his relationship with God during high-pressure work seasons. He admitted he\'s been neglecting quiet time. Agreed to a 21-day reading plan.' },
      { id: 'c5', date: '2026-05-30', notes: 'Grabbed lunch. He shared a breakthrough in how he\'s handling conflict at work. Prayed for peace and wisdom.' },
    ],
    prayerRequests: [
      { id: 'pr4', request: 'Job interview – praying for favor', dateAdded: '2026-06-22', status: 'Active', daysActive: 3 },
      { id: 'pr5', request: 'Direction in his relationship', dateAdded: '2026-06-10', status: 'Active', daysActive: 15 },
    ],
    lifeEvents: [
      { id: 'le4', event: 'Major job interview scheduled', date: '2026-06-25', category: 'Career' },
    ],
    growthAreas: ['Consistency in devotionals', 'Community involvement', 'Financial stewardship'],
  },
  {
    id: '3',
    name: 'Ethan Brooks',
    circle: 'Community Circle',
    phone: '(214) 555-0231',
    email: 'ethan.brooks@email.com',
    campus: 'Frisco Campus',
    lastContact: '2026-05-25',
    lastContactDays: 31,
    prayerCount: 1,
    notes: 'Ethan recently started attending. He is skeptical but curious. Needs low-pressure, authentic relationship. Do not push too fast.',
    upcomingTasks: [],
    conversations: [
      { id: 'c6', date: '2026-05-25', notes: 'First real conversation after service. He opened up about losing his dad last year and how it has shaken his faith. Listened more than talked. Invited him to the men\'s breakfast.' },
    ],
    prayerRequests: [
      { id: 'pr6', request: 'Grief after losing his father', dateAdded: '2026-05-25', status: 'Ongoing', daysActive: 31 },
    ],
    lifeEvents: [
      { id: 'le5', event: 'Father passed away', date: '2025-11-14', category: 'Loss' },
      { id: 'le6', event: 'Started attending Shoreline City', date: '2026-05-04', category: 'Church' },
    ],
    growthAreas: ['Finding community', 'Processing grief', 'Exploring faith'],
  },
  {
    id: '4',
    name: 'Aiden Reynolds',
    circle: 'Growth Circle',
    phone: '(972) 555-0098',
    email: 'aiden.reynolds@email.com',
    campus: 'Frisco Campus',
    lastContact: '2026-06-20',
    lastContactDays: 5,
    prayerCount: 2,
    notes: 'Aiden is a natural leader. He leads a small group of young men. Help him develop his teaching and pastoral gifts.',
    upcomingTasks: [
      { id: 't3', type: 'lunch', label: 'Lunch with Aiden', date: '2026-06-29', time: '12:30 PM' },
    ],
    conversations: [
      { id: 'c7', date: '2026-06-20', notes: 'Talked through how his small group is going. Two guys are really clicking; one is drifting. Coached him on how to re-engage the drifter without pressure.' },
    ],
    prayerRequests: [
      { id: 'pr7', request: 'Wisdom leading his small group', dateAdded: '2026-06-18', status: 'Active', daysActive: 7 },
      { id: 'pr8', request: 'His mother\'s health', dateAdded: '2026-06-01', status: 'Active', daysActive: 24 },
    ],
    lifeEvents: [
      { id: 'le7', event: 'Became small group leader', date: '2026-04-01', category: 'Ministry' },
    ],
    growthAreas: ['Teaching & preaching', 'Emotional maturity', 'Conflict resolution'],
  },
  {
    id: '5',
    name: 'Ben Foster',
    circle: 'Inner Circle',
    phone: '(214) 555-0376',
    email: 'ben.foster@email.com',
    campus: 'Frisco Campus',
    lastContact: '2026-06-23',
    lastContactDays: 2,
    prayerCount: 1,
    notes: 'Ben is one of the most faithful men in the church. He mentors three younger guys. Invest deeply here — he multiplies.',
    upcomingTasks: [
      { id: 't4', type: 'coffee', label: 'Coffee with Ben', date: '2026-06-26', time: '9:00 AM' },
    ],
    conversations: [
      { id: 'c8', date: '2026-06-23', notes: 'Prayed together over the phone. He shared a vision he feels God is giving him for a neighborhood outreach. Encouraged him to write it down and pray over it for 30 days.' },
      { id: 'c9', date: '2026-06-10', notes: 'Long conversation about the cost of discipleship. He is wrestling with how much to give of himself. Read Luke 9:23 together.' },
    ],
    prayerRequests: [
      { id: 'pr9', request: 'Vision for neighborhood outreach', dateAdded: '2026-06-23', status: 'Active', daysActive: 2 },
    ],
    lifeEvents: [
      { id: 'le8', event: 'Started mentoring three young men', date: '2026-03-15', category: 'Ministry' },
    ],
    growthAreas: ['Vision casting', 'Rest & sabbath', 'Marriage enrichment'],
  },
  {
    id: '6',
    name: 'Mark Johnson',
    circle: 'Growth Circle',
    phone: '(972) 555-0412',
    email: 'mark.johnson@email.com',
    campus: 'Frisco Campus',
    lastContact: '2026-06-20',
    lastContactDays: 5,
    prayerCount: 2,
    notes: 'Mark has been in the church for two years. He is consistent but plays it safe. He needs someone to call out the potential in him.',
    upcomingTasks: [],
    conversations: [
      { id: 'c10', date: '2026-06-20', notes: 'Talked about his parents\' declining health. He is the primary caregiver for his mother and is feeling burned out. Pointed him to respite care resources and prayed over him.' },
    ],
    prayerRequests: [
      { id: 'pr10', request: 'Parent health concerns', dateAdded: '2026-06-20', status: 'Ongoing', daysActive: 5 },
      { id: 'pr11', request: 'Strength and endurance as a caregiver', dateAdded: '2026-06-20', status: 'Active', daysActive: 5 },
    ],
    lifeEvents: [
      { id: 'le9', event: 'Became primary caregiver for mother', date: '2026-05-01', category: 'Family' },
    ],
    growthAreas: ['Trusting God in hard seasons', 'Finding margin', 'Sharing faith naturally'],
  },
  {
    id: '7',
    name: 'Aaron Davis',
    circle: 'Inner Circle',
    phone: '(214) 555-0519',
    email: 'aaron.davis@email.com',
    campus: 'Frisco Campus',
    lastContact: '2026-06-21',
    lastContactDays: 4,
    prayerCount: 0,
    notes: 'Aaron is a fire-starter. His passion can run ahead of wisdom. Help him develop patience and discernment to match his zeal.',
    upcomingTasks: [
      { id: 't5', type: 'lunch', label: 'Lunch with Aaron', date: '2026-06-29', time: '12:30 PM' },
    ],
    conversations: [
      { id: 'c11', date: '2026-06-21', notes: 'He came in fired up about a conflict in his small group. Helped him slow down and see the other person\'s perspective. Key coaching moment around leading from love, not frustration.' },
    ],
    prayerRequests: [],
    lifeEvents: [
      { id: 'le10', event: 'Engaged to be married', date: '2026-02-14', category: 'Family' },
    ],
    growthAreas: ['Patience & self-control', 'Listening deeply', 'Integrating faith at work'],
  },
  {
    id: '8',
    name: 'Liam Parker',
    circle: 'Community Circle',
    phone: '(469) 555-0654',
    email: 'liam.parker@email.com',
    campus: 'Frisco Campus',
    lastContact: '2026-06-15',
    lastContactDays: 10,
    prayerCount: 1,
    notes: 'Liam is new to the faith — baptized last Easter. He needs foundational discipleship. Walk slowly and celebrate every step.',
    upcomingTasks: [],
    conversations: [
      { id: 'c12', date: '2026-06-15', notes: 'He had questions about prayer — does God really hear him? Spent an hour walking through Scripture and sharing personal stories. He left encouraged.' },
    ],
    prayerRequests: [
      { id: 'pr12', request: 'Growing in confidence in his faith', dateAdded: '2026-06-15', status: 'Active', daysActive: 10 },
    ],
    lifeEvents: [
      { id: 'le11', event: 'Baptized', date: '2026-04-20', category: 'Faith' },
    ],
    growthAreas: ['Bible reading habits', 'Understanding prayer', 'Finding his place in community'],
  },
];

export const allPrayerRequests = [
  { id: 'pr1', personId: '1', personName: 'John Carter', request: "Wife's surgery – June 12", dateAdded: '2026-06-10', status: 'Active', daysActive: 15 },
  { id: 'pr4', personId: '2', personName: 'Micah Thompson', request: 'Job interview – praying for favor', dateAdded: '2026-06-22', status: 'Active', daysActive: 3 },
  { id: 'pr6', personId: '3', personName: 'Ethan Brooks', request: 'Grief after losing his father', dateAdded: '2026-05-25', status: 'Ongoing', daysActive: 31 },
  { id: 'pr7', personId: '4', personName: 'Aiden Reynolds', request: 'Wisdom leading his small group', dateAdded: '2026-06-18', status: 'Active', daysActive: 7 },
  { id: 'pr8', personId: '4', personName: 'Aiden Reynolds', request: "His mother's health", dateAdded: '2026-06-01', status: 'Active', daysActive: 24 },
  { id: 'pr9', personId: '5', personName: 'Ben Foster', request: 'Vision for neighborhood outreach', dateAdded: '2026-06-23', status: 'Active', daysActive: 2 },
  { id: 'pr10', personId: '6', personName: 'Mark Johnson', request: 'Parent health concerns', dateAdded: '2026-06-20', status: 'Ongoing', daysActive: 5 },
  { id: 'pr11', personId: '6', personName: 'Mark Johnson', request: 'Strength and endurance as a caregiver', dateAdded: '2026-06-20', status: 'Active', daysActive: 5 },
  { id: 'pr12', personId: '8', personName: 'Liam Parker', request: 'Growing in confidence in his faith', dateAdded: '2026-06-15', status: 'Active', daysActive: 10 },
  { id: 'pr5', personId: '2', personName: 'Micah Thompson', request: 'Direction in his relationship', dateAdded: '2026-06-10', status: 'Active', daysActive: 15 },
  { id: 'pr2', personId: '1', personName: 'John Carter', request: 'Wisdom for leadership decisions at work', dateAdded: '2026-05-28', status: 'Ongoing', daysActive: 28 },
  { id: 'pr3', personId: '1', personName: 'John Carter', request: "Son's college applications", dateAdded: '2026-05-01', status: 'Answered', daysActive: 55 },
];

export const allTasks = [
  { id: 't1', personId: '5', personName: 'Ben Foster', type: 'coffee', label: 'Coffee with Ben', date: '2026-06-26', time: '9:00 AM', category: 'Due Today', notes: 'Meet at Common Grounds on Preston. He wants to talk about the outreach vision.' },
  { id: 't2', personId: '2', personName: 'Micah Thompson', type: 'call', label: 'Call Micah', date: '2026-06-27', time: '3:00 PM', category: 'This Week', notes: 'Follow up on job interview. Pray over the phone.' },
  { id: 't3', personId: '4', personName: 'Aiden Reynolds', type: 'lunch', label: 'Lunch with Aiden', date: '2026-06-29', time: '12:30 PM', category: 'This Week', notes: 'Review his small group plan. Help him think through the drifting member.' },
  { id: 't4', personId: '7', personName: 'Aaron Davis', type: 'lunch', label: 'Lunch with Aaron', date: '2026-06-29', time: '12:30 PM', category: 'This Week', notes: 'Check in after the conflict situation. See how he applied the coaching.' },
  { id: 't5', personId: '3', personName: 'Ethan Brooks', type: 'text', label: 'Text Ethan', date: '2026-06-19', time: '', category: 'Overdue', notes: 'Send an encouraging text. Nothing heavy — just let him know you\'re thinking of him.' },
  { id: 't6', personId: '6', personName: 'Mark Johnson', type: 'visit', label: 'Visit Mark at home', date: '2026-06-18', time: '6:00 PM', category: 'Overdue', notes: 'His mom is really struggling. Bring a meal if possible.' },
  { id: 't7', personId: '8', personName: 'Liam Parker', type: 'call', label: 'Call Liam', date: '2026-06-16', time: '7:00 PM', category: 'Overdue', notes: 'Follow up on his questions about prayer from last week\'s conversation.' },
  { id: 't8', personId: '1', personName: 'John Carter', type: 'coffee', label: 'Coffee with John', date: '2026-06-05', time: '9:00 AM', category: 'Completed', notes: 'Great conversation about men\'s ministry. He is stepping up.' },
  { id: 't9', personId: '5', personName: 'Ben Foster', type: 'call', label: 'Check-in call with Ben', date: '2026-06-14', time: '12:00 PM', category: 'Completed', notes: 'Prayed together. He is doing really well.' },
];

// CLL stage per person id — merged in at context init so sampleData stays clean
export const cllStageDefaults = {
  '1': 'Beyond',   // John Carter — Inner Circle, multiplying
  '2': 'Become',   // Micah Thompson — recently joined
  '3': 'Belong',   // Ethan Brooks — still exploring
  '4': 'Build',    // Aiden Reynolds — serving, leading a small group
  '5': 'Beyond',   // Ben Foster — mentoring others
  '6': 'Become',   // Mark Johnson — owner, not yet serving
  '7': 'Build',    // Aaron Davis — leading but still developing
  '8': 'Belong',   // Liam Parker — brand new believer
};

export const statCards = [
  { id: 1, value: 12, label: 'Due Today', sub: 'People to reach out to', icon: 'users', color: 'teal' },
  { id: 2, value: 4,  label: 'Overdue',   sub: 'Need your attention',    icon: 'alert', color: 'orange' },
  { id: 3, value: 8,  label: 'Upcoming',  sub: 'Next 7 days',            icon: 'calendar', color: 'navy' },
  { id: 4, value: 27, label: 'Active Prayers', sub: 'People being lifted up', icon: 'heart', color: 'coral' },
];
