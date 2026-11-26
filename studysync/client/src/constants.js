export const SUBJECTS = [
  'Data Structures',
  'Algorithms',
  'Database Management',
  'Operating Systems',
  'Computer Networks',
  'Machine Learning',
  'Web Development',
  'Mobile Development',
  'Cloud Computing',
  'Cyber Security',
  'Software Engineering',
  'Discrete Mathematics',
  'Digital Logic',
  'Computer Architecture',
  'Compiler Design',
];

export const COURSES = [
  'B.Tech CSE',
  'B.Tech IT',
  'B.Tech ECE',
  'B.Tech EEE',
  'B.Tech Mechanical',
  'BCA',
  'MCA',
  'M.Tech CSE',
  'BSc CS',
  'MSc CS',
];

export const INTERESTS = [
  'Machine Learning',
  'Web Development',
  'App Development',
  'Data Science',
  'Competitive Programming',
  'Open Source',
  'Cloud Computing',
  'Cyber Security',
  'Blockchain',
  'IoT',
  'Game Development',
  'DevOps',
];

export const GOALS = [
  'Placement Prep',
  'GATE Prep',
  'Research',
  'Projects',
  'Skill Building',
  'Competitive Programming',
  'Hackathons',
  'Higher Studies',
];

export const AVAILABILITY = [
  'Early Morning (6-9)',
  'Morning (9-12)',
  'Afternoon (12-3)',
  'Evening (3-6)',
  'Night (6-9)',
  'Late Night (9-12)',
];

export const GROUP_CATEGORIES = [
  { value: 'study', label: 'Study Group' },
  { value: 'project', label: 'Project Team' },
  { value: 'exam_prep', label: 'Exam Prep' },
  { value: 'discussion', label: 'Discussion' },
];

export const ACADEMIC_YEARS = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
];

export function parseJsonArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return val ? val.split(',').map((s) => s.trim()).filter(Boolean) : [];
    }
  }
  return [];
}
