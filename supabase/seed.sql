-- ============================================================
-- Remember The One — Seed Data
-- Run AFTER schema.sql. Safe to re-run (uses ON CONFLICT DO NOTHING).
-- ============================================================

-- ── Profile ──────────────────────────────────────────────────
insert into profiles (first_name, last_name, title, role, campus)
values ('Alex', 'Johnson', 'Pastor', 'Lead Pastor', 'Frisco')
on conflict do nothing;

-- ── People ───────────────────────────────────────────────────
insert into people (id, name, circle, phone, email, campus, notes, cll_stage, last_contact, last_contact_days, growth_areas) values
('1','John Carter','Inner Circle','(972) 555-0142','john.carter@email.com','Frisco Campus',
 'John is a key leader in the men''s ministry. He has been walking through a difficult season with his wife''s health. Follow up consistently and be a steady presence.',
 'Beyond','2026-06-18',7,ARRAY['Prayer life','Scripture memorization','Servant leadership']),

('2','Micah Thompson','Growth Circle','(972) 555-0187','micah.thompson@email.com','Frisco Campus',
 'Micah is a young professional hungry to grow. He is sharp but needs accountability in his walk. He resonates with practical theology.',
 'Become','2026-06-12',13,ARRAY['Consistency in devotionals','Community involvement','Financial stewardship']),

('3','Ethan Brooks','Community Circle','(214) 555-0231','ethan.brooks@email.com','Frisco Campus',
 'Ethan recently started attending. He is skeptical but curious. Needs low-pressure, authentic relationship. Do not push too fast.',
 'Belong','2026-05-25',31,ARRAY['Finding community','Processing grief','Exploring faith']),

('4','Aiden Reynolds','Growth Circle','(972) 555-0098','aiden.reynolds@email.com','Frisco Campus',
 'Aiden is a natural leader. He leads a small group of young men. Help him develop his teaching and pastoral gifts.',
 'Build','2026-06-20',5,ARRAY['Teaching & preaching','Emotional maturity','Conflict resolution']),

('5','Ben Foster','Inner Circle','(214) 555-0376','ben.foster@email.com','Frisco Campus',
 'Ben is one of the most faithful men in the church. He mentors three younger guys. Invest deeply here — he multiplies.',
 'Beyond','2026-06-23',2,ARRAY['Vision casting','Rest & sabbath','Marriage enrichment']),

('6','Mark Johnson','Growth Circle','(972) 555-0412','mark.johnson@email.com','Frisco Campus',
 'Mark has been in the church for two years. He is consistent but plays it safe. He needs someone to call out the potential in him.',
 'Become','2026-06-20',5,ARRAY['Trusting God in hard seasons','Finding margin','Sharing faith naturally']),

('7','Aaron Davis','Inner Circle','(214) 555-0519','aaron.davis@email.com','Frisco Campus',
 'Aaron is a fire-starter. His passion can run ahead of wisdom. Help him develop patience and discernment to match his zeal.',
 'Build','2026-06-21',4,ARRAY['Patience & self-control','Listening deeply','Integrating faith at work']),

('8','Liam Parker','Community Circle','(469) 555-0654','liam.parker@email.com','Frisco Campus',
 'Liam is new to the faith — baptized last Easter. He needs foundational discipleship. Walk slowly and celebrate every step.',
 'Belong','2026-06-15',10,ARRAY['Bible reading habits','Understanding prayer','Finding his place in community'])
on conflict (id) do nothing;

-- ── Conversations ─────────────────────────────────────────────
insert into conversations (id, person_id, date, notes) values
('c1','1','2026-06-18','Talked about his wife''s upcoming surgery. He is anxious but trusting. Read Psalm 23 together. Encouraged him to lean on the community.'),
('c2','1','2026-06-05','Met for coffee. Discussed his growth in leadership and next steps in the men''s ministry. Prayed over his family.'),
('c3','1','2026-05-20','Quick check-in after Sunday service. He seemed energized after the sermon. Wants to start a small group in his neighborhood.'),
('c4','2','2026-06-12','Discussed his relationship with God during high-pressure work seasons. He admitted he''s been neglecting quiet time. Agreed to a 21-day reading plan.'),
('c5','2','2026-05-30','Grabbed lunch. He shared a breakthrough in how he''s handling conflict at work. Prayed for peace and wisdom.'),
('c6','3','2026-05-25','First real conversation after service. He opened up about losing his dad last year and how it has shaken his faith. Listened more than talked. Invited him to the men''s breakfast.'),
('c7','4','2026-06-20','Talked through how his small group is going. Two guys are really clicking; one is drifting. Coached him on how to re-engage the drifter without pressure.'),
('c8','5','2026-06-23','Prayed together over the phone. He shared a vision he feels God is giving him for a neighborhood outreach. Encouraged him to write it down and pray over it for 30 days.'),
('c9','5','2026-06-10','Long conversation about the cost of discipleship. He is wrestling with how much to give of himself. Read Luke 9:23 together.'),
('c10','6','2026-06-20','Talked about his parents'' declining health. He is the primary caregiver for his mother and is feeling burned out. Pointed him to respite care resources and prayed over him.'),
('c11','7','2026-06-21','He came in fired up about a conflict in his small group. Helped him slow down and see the other person''s perspective. Key coaching moment around leading from love, not frustration.'),
('c12','8','2026-06-15','He had questions about prayer — does God really hear him? Spent an hour walking through Scripture and sharing personal stories. He left encouraged.')
on conflict (id) do nothing;

-- ── Prayer Requests ───────────────────────────────────────────
insert into prayer_requests (id, person_id, person_name, request, date_added, status, days_active) values
('pr1','1','John Carter','Wife''s surgery – June 12','2026-06-10','Active',15),
('pr2','1','John Carter','Wisdom for leadership decisions at work','2026-05-28','Ongoing',28),
('pr3','1','John Carter','Son''s college applications','2026-05-01','Answered',55),
('pr4','2','Micah Thompson','Job interview – praying for favor','2026-06-22','Active',3),
('pr5','2','Micah Thompson','Direction in his relationship','2026-06-10','Active',15),
('pr6','3','Ethan Brooks','Grief after losing his father','2026-05-25','Ongoing',31),
('pr7','4','Aiden Reynolds','Wisdom leading his small group','2026-06-18','Active',7),
('pr8','4','Aiden Reynolds','His mother''s health','2026-06-01','Active',24),
('pr9','5','Ben Foster','Vision for neighborhood outreach','2026-06-23','Active',2),
('pr10','6','Mark Johnson','Parent health concerns','2026-06-20','Ongoing',5),
('pr11','6','Mark Johnson','Strength and endurance as a caregiver','2026-06-20','Active',5),
('pr12','8','Liam Parker','Growing in confidence in his faith','2026-06-15','Active',10)
on conflict (id) do nothing;

-- ── Life Events ───────────────────────────────────────────────
insert into life_events (id, person_id, event, date, category) values
('le1','1','Wife scheduled for surgery','2026-06-12','Health'),
('le2','1','Promoted to senior director','2026-04-15','Career'),
('le3','1','Son graduating high school','2026-05-30','Family'),
('le4','2','Major job interview scheduled','2026-06-25','Career'),
('le5','3','Father passed away','2025-11-14','Loss'),
('le6','3','Started attending Shoreline City','2026-05-04','Church'),
('le7','4','Became small group leader','2026-04-01','Ministry'),
('le8','5','Started mentoring three young men','2026-03-15','Ministry'),
('le9','6','Became primary caregiver for mother','2026-05-01','Family'),
('le10','7','Engaged to be married','2026-02-14','Family'),
('le11','8','Baptized','2026-04-20','Faith')
on conflict (id) do nothing;

-- ── Tasks ─────────────────────────────────────────────────────
insert into tasks (id, person_id, person_name, label, type, date, time, category, notes) values
('t1','5','Ben Foster','Coffee with Ben','coffee','2026-06-26','9:00 AM','Due Today','Meet at Common Grounds on Preston. He wants to talk about the outreach vision.'),
('t2','2','Micah Thompson','Call Micah','call','2026-06-27','3:00 PM','This Week','Follow up on job interview. Pray over the phone.'),
('t3','4','Aiden Reynolds','Lunch with Aiden','lunch','2026-06-29','12:30 PM','This Week','Review his small group plan. Help him think through the drifting member.'),
('t4','7','Aaron Davis','Lunch with Aaron','lunch','2026-06-29','12:30 PM','This Week','Check in after the conflict situation. See how he applied the coaching.'),
('t5','3','Ethan Brooks','Text Ethan','text','2026-06-19','','Overdue','Send an encouraging text. Nothing heavy — just let him know you''re thinking of him.'),
('t6','6','Mark Johnson','Visit Mark at home','visit','2026-06-18','6:00 PM','Overdue','His mom is really struggling. Bring a meal if possible.'),
('t7','8','Liam Parker','Call Liam','call','2026-06-16','7:00 PM','Overdue','Follow up on his questions about prayer from last week''s conversation.'),
('t8','1','John Carter','Coffee with John','coffee','2026-06-05','9:00 AM','Completed','Great conversation about men''s ministry. He is stepping up.'),
('t9','5','Ben Foster','Check-in call with Ben','call','2026-06-14','12:00 PM','Completed','Prayed together. He is doing really well.')
on conflict (id) do nothing;
