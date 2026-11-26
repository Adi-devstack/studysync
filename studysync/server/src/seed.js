require('dotenv').config();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const db = require('./config/database');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function getFutureDate(daysAhead) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
}

function seed() {
  console.log('Seeding StudySync database...');

  const hashedPassword = bcrypt.hashSync('password123', 10);

  const runSeed = db.transaction(() => {
    // Clear existing data in reverse foreign-key order
    db.prepare('DELETE FROM notifications').run();
    db.prepare('DELETE FROM session_participants').run();
    db.prepare('DELETE FROM study_sessions').run();
    db.prepare('DELETE FROM resources').run();
    db.prepare('DELETE FROM group_members').run();
    db.prepare('DELETE FROM groups').run();
    db.prepare('DELETE FROM users').run();

    // Reset autoincrement counters if sqlite_sequence exists
    const seqTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'").get();
    if (seqTable) {
      db.prepare('DELETE FROM sqlite_sequence').run();
    }

    // 1. Create 6 demo student accounts
    const students = [
      {
        email: 'priya@university.edu',
        full_name: 'Priya Sharma',
        bio: 'Pre-final year CSE student passionate about algorithms, system design, and machine learning.',
        college: 'IIT Delhi',
        course: 'B.Tech CSE',
        academic_year: 3,
        subjects: ['Data Structures', 'Algorithms', 'Database Management', 'Operating Systems', 'Machine Learning'],
        interests: ['Machine Learning', 'Competitive Programming', 'Data Science', 'Open Source'],
        goals: ['Placement Prep', 'Projects', 'Hackathons'],
        availability: ['Morning (9-12)', 'Evening (3-6)', 'Night (6-9)']
      },
      {
        email: 'rahul@university.edu',
        full_name: 'Rahul Patel',
        bio: 'Building full-stack web apps and grinding DSA for upcoming placement season.',
        college: 'IIT Delhi',
        course: 'B.Tech CSE',
        academic_year: 3,
        subjects: ['Data Structures', 'Algorithms', 'Database Management', 'Computer Networks', 'Web Development'],
        interests: ['Web Development', 'Competitive Programming', 'Cloud Computing', 'DevOps'],
        goals: ['Placement Prep', 'Projects', 'Skill Building'],
        availability: ['Morning (9-12)', 'Evening (3-6)', 'Late Night (9-12)']
      },
      {
        email: 'seed@university.edu',
        full_name: 'Seed Singh',
        bio: 'Sophomore in IT exploring mobile dev, cloud architecture, and open source contributions.',
        college: 'IIT Delhi',
        course: 'B.Tech IT',
        academic_year: 2,
        subjects: ['Data Structures', 'Object Oriented Programming', 'Web Development', 'Mobile Development', 'Database Management'],
        interests: ['App Development', 'Web Development', 'Open Source', 'Cloud Computing'],
        goals: ['Projects', 'Hackathons', 'Skill Building'],
        availability: ['Afternoon (12-3)', 'Evening (3-6)', 'Night (6-9)']
      },
      {
        email: 'arjun@university.edu',
        full_name: 'Arjun Kumar',
        bio: 'Final year ECE student preparing for GATE and researching embedded AI systems.',
        college: 'IIT Delhi',
        course: 'B.Tech ECE',
        academic_year: 4,
        subjects: ['Digital Logic', 'Computer Architecture', 'Operating Systems', 'Computer Networks', 'Machine Learning'],
        interests: ['IoT', 'Machine Learning', 'Cyber Security', 'Blockchain'],
        goals: ['GATE Prep', 'Research', 'Higher Studies'],
        availability: ['Early Morning (6-9)', 'Morning (9-12)', 'Night (6-9)']
      },
      {
        email: 'sneha@university.edu',
        full_name: 'Sneha Reddy',
        bio: 'MCA first-year student focused on backend engineering, databases, and software design.',
        college: 'IIT Delhi',
        course: 'MCA',
        academic_year: 1,
        subjects: ['Database Management', 'Software Engineering', 'Operating Systems', 'Data Structures', 'Web Development'],
        interests: ['Web Development', 'Data Science', 'Cloud Computing', 'DevOps'],
        goals: ['Placement Prep', 'Skill Building', 'Projects'],
        availability: ['Afternoon (12-3)', 'Night (6-9)', 'Late Night (9-12)']
      },
      {
        email: 'vikram@university.edu',
        full_name: 'Vikram Gupta',
        bio: 'Second-year CSE undergrad interested in competitive programming, compilers, and security.',
        college: 'IIT Delhi',
        course: 'B.Tech CSE',
        academic_year: 2,
        subjects: ['Data Structures', 'Algorithms', 'Discrete Mathematics', 'Computer Architecture', 'Cyber Security'],
        interests: ['Competitive Programming', 'Cyber Security', 'Open Source', 'Game Development'],
        goals: ['Competitive Programming', 'Hackathons', 'Skill Building'],
        availability: ['Evening (3-6)', 'Night (6-9)', 'Late Night (9-12)']
      }
    ];

    const insertUser = db.prepare(`
      INSERT INTO users (email, password, full_name, bio, college, course, academic_year, subjects, interests, goals, availability, profile_completed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const userIds = students.map((s) => {
      const info = insertUser.run(
        s.email,
        hashedPassword,
        s.full_name,
        s.bio,
        s.college,
        s.course,
        s.academic_year,
        JSON.stringify(s.subjects),
        JSON.stringify(s.interests),
        JSON.stringify(s.goals),
        JSON.stringify(s.availability)
      );
      return info.lastInsertRowid;
    });

    const [priyaId, rahulId, seedId, arjunId, snehaId, vikramId] = userIds;

    // 2. Create 4 study groups
    const insertGroup = db.prepare(`
      INSERT INTO groups (name, description, subject, category, is_private, max_members, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const group1Id = insertGroup.run(
      'FAANG DSA & System Design Prep',
      'Daily problem-solving on trees, graphs, DP, and mock technical interviews for placements.',
      'Data Structures',
      'exam_prep',
      0,
      25,
      priyaId
    ).lastInsertRowid;

    const group2Id = insertGroup.run(
      'Full-Stack Builders Club',
      'Collaborative project group building React, Node.js, and cloud-deployed applications.',
      'Web Development',
      'project',
      0,
      15,
      rahulId
    ).lastInsertRowid;

    const group3Id = insertGroup.run(
      'GATE CS & Core Systems',
      'Deep-dive discussions on OS, DBMS, Computer Networks, and Digital Logic for GATE aspirants.',
      'Operating Systems',
      'study',
      1,
      20,
      arjunId
    ).lastInsertRowid;

    const group4Id = insertGroup.run(
      'ML & Data Science Circle',
      'Weekly paper reading, Kaggle competitions, and hands-on PyTorch implementation sessions.',
      'Machine Learning',
      'discussion',
      0,
      30,
      seedId
    ).lastInsertRowid;

    // Add group members
    const insertMember = db.prepare(`
      INSERT INTO group_members (group_id, user_id, role, status)
      VALUES (?, ?, ?, ?)
    `);

    // Group 1 members
    insertMember.run(group1Id, priyaId, 'admin', 'approved');
    insertMember.run(group1Id, rahulId, 'member', 'approved');
    insertMember.run(group1Id, snehaId, 'member', 'approved');
    insertMember.run(group1Id, vikramId, 'member', 'approved');

    // Group 2 members
    insertMember.run(group2Id, rahulId, 'admin', 'approved');
    insertMember.run(group2Id, priyaId, 'member', 'approved');
    insertMember.run(group2Id, seedId, 'member', 'approved');
    insertMember.run(group2Id, snehaId, 'member', 'approved');

    // Group 3 members (private group with 1 pending request)
    insertMember.run(group3Id, arjunId, 'admin', 'approved');
    insertMember.run(group3Id, priyaId, 'member', 'approved');
    insertMember.run(group3Id, vikramId, 'member', 'pending');

    // Group 4 members
    insertMember.run(group4Id, seedId, 'admin', 'approved');
    insertMember.run(group4Id, priyaId, 'member', 'approved');
    insertMember.run(group4Id, arjunId, 'member', 'approved');

    // 3. Create 5 resources with placeholder files in uploads/
    const resourceSeedData = [
      {
        title: 'Dynamic Programming Patterns Cheat Sheet',
        description: 'Comprehensive guide covering 1D/2D DP, knapsack, LCS, and tree DP patterns with complexity analysis.',
        file_name: 'dp-patterns-cheatsheet.txt',
        disk_name: 'seed-dp-patterns.txt',
        file_type: 'doc',
        subject: 'Algorithms',
        uploaded_by: priyaId,
        group_id: group1Id,
        download_count: 14,
        content: 'Dynamic Programming Patterns\n1. 0/1 Knapsack\n2. Unbounded Knapsack\n3. Longest Common Subsequence\n4. Longest Increasing Subsequence\n5. Matrix Chain Multiplication\n'
      },
      {
        title: 'DBMS Normalization & Indexing Notes',
        description: 'Clear summary of 1NF through BCNF, B+ Trees, and SQL query optimization tips.',
        file_name: 'dbms-normalization-notes.txt',
        disk_name: 'seed-dbms-notes.txt',
        file_type: 'doc',
        subject: 'Database Management',
        uploaded_by: snehaId,
        group_id: null,
        download_count: 22,
        content: 'DBMS Normalization Notes\n- 1NF: Atomic values\n- 2NF: No partial dependency\n- 3NF: No transitive dependency\n- BCNF: Every determinant is a candidate key\n'
      },
      {
        title: 'Operating Systems Deadlocks & Scheduling',
        description: 'Lecture summary covering CPU scheduling algorithms, semaphores, and Banker\'s algorithm.',
        file_name: 'os-scheduling-deadlocks.txt',
        disk_name: 'seed-os-notes.txt',
        file_type: 'doc',
        subject: 'Operating Systems',
        uploaded_by: arjunId,
        group_id: group3Id,
        download_count: 9,
        content: 'Operating Systems Summary\n- FCFS, SJF, Round Robin, Priority Scheduling\n- Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait\n'
      },
      {
        title: 'REST API Best Practices with Express',
        description: 'Reference guide for structuring Node.js + Express backends, JWT auth, and error handling.',
        file_name: 'express-rest-best-practices.md',
        disk_name: 'seed-express-guide.md',
        file_type: 'doc',
        subject: 'Web Development',
        uploaded_by: rahulId,
        group_id: group2Id,
        download_count: 18,
        content: '# Express REST API Guide\n- Use proper HTTP status codes\n- Validate all request payloads\n- Centralize error middleware\n'
      },
      {
        title: 'Graph Algorithms Quick Reference',
        description: 'BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, and Kruskal\'s MST templates.',
        file_name: 'graph-algorithms-reference.txt',
        disk_name: 'seed-graph-algo.txt',
        file_type: 'doc',
        subject: 'Data Structures',
        uploaded_by: vikramId,
        group_id: null,
        download_count: 11,
        content: 'Graph Algorithms Quick Reference\n- BFS: O(V + E)\n- Dijkstra: O((V + E) log V)\n- Kruskal MST: O(E log E)\n'
      }
    ];

    const insertResource = db.prepare(`
      INSERT INTO resources (title, description, file_name, file_path, file_type, file_size, subject, uploaded_by, group_id, download_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let firstResourceId = null;
    for (const r of resourceSeedData) {
      const fullPath = path.join(uploadsDir, r.disk_name);
      fs.writeFileSync(fullPath, r.content, 'utf8');
      const fileSize = Buffer.byteLength(r.content, 'utf8');
      const info = insertResource.run(
        r.title,
        r.description,
        r.file_name,
        r.disk_name,
        r.file_type,
        fileSize,
        r.subject,
        r.uploaded_by,
        r.group_id,
        r.download_count
      );
      if (!firstResourceId) firstResourceId = info.lastInsertRowid;
    }

    // 4. Create 3 upcoming study sessions
    const insertSession = db.prepare(`
      INSERT INTO study_sessions (title, description, subject, session_date, start_time, end_time, location, max_participants, created_by, group_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const session1Id = insertSession.run(
      'Graphs & Shortest Paths Problem Sprint',
      'Timed 90-minute session solving 4 medium-hard LeetCode graph problems together.',
      'Data Structures',
      getFutureDate(1),
      '18:00',
      '19:30',
      'Online',
      12,
      priyaId,
      group1Id
    ).lastInsertRowid;

    const session2Id = insertSession.run(
      'Full-Stack Code Review & Deployment Workshop',
      'Reviewing React + Express architecture and deploying sample apps.',
      'Web Development',
      getFutureDate(3),
      '16:00',
      '17:30',
      'Library Room 204',
      10,
      rahulId,
      group2Id
    ).lastInsertRowid;

    const session3Id = insertSession.run(
      'OS Virtual Memory & Paging Deep Dive',
      'Working through GATE previous year questions on page replacement and TLB.',
      'Operating Systems',
      getFutureDate(5),
      '10:00',
      '11:30',
      'Online',
      15,
      arjunId,
      group3Id
    ).lastInsertRowid;

    // Add session participants
    const insertParticipant = db.prepare(`
      INSERT INTO session_participants (session_id, user_id, status)
      VALUES (?, ?, 'joined')
    `);

    insertParticipant.run(session1Id, priyaId);
    insertParticipant.run(session1Id, rahulId);
    insertParticipant.run(session1Id, vikramId);

    insertParticipant.run(session2Id, rahulId);
    insertParticipant.run(session2Id, priyaId);
    insertParticipant.run(session2Id, seedId);
    insertParticipant.run(session2Id, snehaId);

    insertParticipant.run(session3Id, arjunId);
    insertParticipant.run(session3Id, priyaId);

    // 5. Create notifications
    const insertNotification = db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type, is_read)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertNotification.run(
      priyaId,
      'partner_match',
      'High Compatibility Study Match!',
      'Rahul Patel is a strong study match for your Data Structures and Placement Prep goals.',
      rahulId,
      'user',
      0
    );

    insertNotification.run(
      priyaId,
      'session_reminder',
      'Upcoming Study Session Tomorrow',
      'Reminder: "Graphs & Shortest Paths Problem Sprint" starts tomorrow at 18:00.',
      session1Id,
      'session',
      0
    );

    insertNotification.run(
      priyaId,
      'resource_shared',
      'New Resource Shared',
      'Rahul Patel shared "REST API Best Practices with Express" in Full-Stack Builders Club.',
      firstResourceId,
      'resource',
      1
    );

    insertNotification.run(
      arjunId,
      'group_join_request',
      'New Group Join Request',
      'Vikram Gupta requested to join GATE CS & Core Systems.',
      group3Id,
      'group',
      0
    );

    insertNotification.run(
      rahulId,
      'session_reminder',
      'New Session Participant',
      'Seed Singh joined your study session "Full-Stack Code Review & Deployment Workshop".',
      session2Id,
      'session',
      0
    );
  });

  runSeed();
  console.log('StudySync database seeded successfully!');
}

if (require.main === module) {
  seed();
}

module.exports = seed;
