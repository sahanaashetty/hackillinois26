/**
 * UIUC CS BS degree data from 2025-2026 catalog
 * https://catalog.illinois.edu/undergraduate/engineering/computer-science-bs/
 */

const REQUIREMENTS = {
  totalHours: 128,
  technicalGPA: 2.0,
};

const CORE_CS = [
  { code: 'CS 124', name: 'Introduction to Computer Science I', hours: 3 },
  { code: 'CS 128', name: 'Introduction to Computer Science II', hours: 3 },
  { code: 'CS 173', name: 'Discrete Structures', hours: 3 },
  { code: 'CS 222', name: 'Software Design Lab', hours: 1 },
  { code: 'CS 225', name: 'Data Structures', hours: 4 },
  { code: 'CS 233', name: 'Computer Architecture', hours: 4 },
  { code: 'CS 341', name: 'System Programming', hours: 4 },
  { code: 'CS 357', name: 'Numerical Methods I', hours: 3 },
  { code: 'CS 361', name: 'Probability & Statistics for Computer Science', hours: 3 },
  { code: 'CS 374', name: 'Introduction to Algorithms & Models of Computation', hours: 4 },
  { code: 'CS 421', name: 'Programming Languages & Compilers', hours: 3 },
];

const MATH_SCIENCE = [
  { code: 'MATH 221', name: 'Calculus I (MATH 220 may substitute)', hours: 4 },
  { code: 'MATH 231', name: 'Calculus II', hours: 3 },
  { code: 'MATH 241', name: 'Calculus III', hours: 4 },
  { code: 'MATH 257', name: 'Linear Algebra with Computational Applications', hours: 3 },
  { code: 'PHYS 211', name: 'University Physics: Mechanics', hours: 4 },
  { code: 'PHYS 212', name: 'University Physics: Elec & Mag', hours: 4 },
  { code: 'Science elective', name: 'One from NST list (see catalog)', hours: 3 },
];

const ORIENTATION = [
  { code: 'ENG 100', name: 'Grainger Engineering Orientation Seminar', hours: 1 },
  { code: 'CS 210', name: 'Ethical & Professional Issues', hours: 2 },
  { code: 'CS 211', name: 'Ethical and Professional Conduct (alt for CS 210)', hours: 3 },
];

const TEAM_PROJECT_COURSES = [
  'CS 411', 'CS 415', 'CS 417', 'CS 425', 'CS 427', 'CS 428', 'CS 429',
  'CS 437', 'CS 465', 'CS 467', 'CS 493', 'CS 494', 'CS 497',
];

const FOCUS_AREAS = {
  'Software Foundations': ['CS 407', 'CS 409', 'CS 422', 'CS 426', 'CS 427', 'CS 428', 'CS 429', 'CS 474', 'CS 476', 'CS 477', 'CS 492', 'CS 493', 'CS 494'],
  'Algorithms and Models': ['CS 407', 'CS 413', 'CS 473', 'CS 474', 'CS 475', 'CS 476', 'CS 477', 'CS 481', 'CS 482'],
  'Intelligence and Big Data': ['CS 410', 'CS 411', 'CS 412', 'CS 414', 'CS 416', 'CS 434', 'CS 440', 'CS 441', 'CS 442', 'CS 443', 'CS 444', 'CS 445', 'CS 446', 'CS 447', 'CS 448', 'CS 464', 'CS 466', 'CS 467', 'CS 469', 'CS 470'],
  'Human and Social Impact': ['CS 409', 'CS 415', 'CS 416', 'CS 417', 'CS 441', 'CS 442', 'CS 460', 'CS 461', 'CS 463', 'CS 464', 'CS 465', 'CS 467', 'CS 468', 'CS 469', 'CS 470'],
  'Media': ['CS 409', 'CS 414', 'CS 415', 'CS 416', 'CS 417', 'CS 418', 'CS 419', 'CS 445', 'CS 448', 'CS 465', 'CS 467', 'CS 468', 'CS 469'],
  'Scientific & HPC': ['CS 419', 'CS 435', 'CS 450', 'CS 466', 'CS 482', 'CS 483', 'CS 484'],
  'Distributed Systems & Security': ['CS 407', 'CS 423', 'CS 424', 'CS 425', 'CS 431', 'CS 435', 'CS 436', 'CS 437', 'CS 438', 'CS 439', 'CS 460', 'CS 461', 'CS 463', 'CS 483', 'CS 484'],
  'Machines': ['CS 423', 'CS 424', 'CS 426', 'CS 431', 'CS 433', 'CS 434', 'CS 437', 'CS 484'],
};

// Sample sequence from catalog (reference only)
const SAMPLE_SEQUENCE = [
  { year: 1, semester: 'Fall', courses: ['CS 100 (optional)', 'CS 124', 'MATH 221', 'ENG 100', 'Science elective', 'Composition I or Gen Ed'] },
  { year: 1, semester: 'Spring', courses: ['CS 128', 'CS 173', 'MATH 231', 'Gen Ed (Cultural Studies)', 'Gen Ed or Composition I'] },
  { year: 2, semester: 'Fall', courses: ['CS 222', 'CS 225', 'MATH 241', 'PHYS 211', 'Gen Ed (Cultural Studies)'] },
  { year: 2, semester: 'Spring', courses: ['CS 233', 'CS 361', 'MATH 257', 'PHYS 212', 'Free elective'] },
  { year: 3, semester: 'Fall', courses: ['CS 210', 'CS 341', 'CS 357', 'CS Technical elective', 'Language (3rd level)'] },
  { year: 3, semester: 'Spring', courses: ['CS 374', 'CS Technical elective', 'CS Technical elective', 'Gen Ed (Cultural Studies)', 'Free elective'] },
  { year: 4, semester: 'Fall', courses: ['CS 421', 'CS Advanced elective', 'CS Advanced elective', 'Free elective', 'Free elective'] },
  { year: 4, semester: 'Spring', courses: ['CS Technical elective', 'CS Technical elective', 'CS Technical elective', 'Free elective', 'Free elective'] },
];

// All technical elective options (simplified list for dropdown)
const TECHNICAL_ELECTIVES = [
  'CS 407', 'CS 409', 'CS 410', 'CS 411', 'CS 412', 'CS 413', 'CS 414', 'CS 415', 'CS 416', 'CS 417', 'CS 418', 'CS 419',
  'CS 422', 'CS 423', 'CS 424', 'CS 425', 'CS 426', 'CS 427', 'CS 428', 'CS 429', 'CS 431', 'CS 433', 'CS 434', 'CS 435', 'CS 436', 'CS 437', 'CS 438', 'CS 439',
  'CS 440', 'CS 441', 'CS 442', 'CS 443', 'CS 444', 'CS 445', 'CS 446', 'CS 447', 'CS 448', 'CS 450', 'CS 460', 'CS 461', 'CS 463', 'CS 464', 'CS 465', 'CS 466', 'CS 467', 'CS 468', 'CS 469', 'CS 470',
  'CS 473', 'CS 474', 'CS 475', 'CS 476', 'CS 477', 'CS 481', 'CS 482', 'CS 483', 'CS 484', 'CS 493', 'CS 494', 'CS 497', 'CS 498',
];
// Add after TECHNICAL_ELECTIVES definition
const CS_ELECTIVE_NAMES = {
  'CS 400': 'Computer Science Leadership Seminar',
  'CS 401': 'Advanced Data Structures',
  'CS 402': 'Machine Learning',
  'CS 403': 'Cybersecurity',
  'CS 404': 'Advanced Algorithms',
  'CS 407': 'Software Foundations I',
  'CS 408': 'Software Foundations II',
  'CS 409': 'Human–Computer Interaction',
  'CS 410': 'Text Information Systems',
  'CS 411': 'Database Systems',
  'CS 412': 'Introduction to Machine Learning',
  'CS 413': 'Formal Methods',
  'CS 414': 'Distributed Systems',
  'CS 415': 'Parallel Programming',
  'CS 416': 'Visualization',
  'CS 417': 'Scientific Visualization',
  'CS 418': 'Interactive Computer Graphics',
  'CS 419': 'Advanced Web Development',
  'CS 422': 'Cybersecurity I',
  'CS 423': 'Computer Security',
  'CS 424': 'Real-Time Systems',
  'CS 425': 'High Performance Computing',
  'CS 426': 'Compiler Design',
  'CS 427': 'Software Engineering I',
  'CS 428': 'Software Engineering II',
  'CS 429': 'Software Engineering III: Large Systems Design',
  'CS 431': 'Applied Cryptography',
  'CS 433': 'Computer Vision',
  'CS 434': 'Deep Learning',
  'CS 434': 'Deep Learning',
  'CS 435': 'Numerical Software',
  'CS 436': 'Cybersecurity II',
  'CS 437': 'Cloud Computing Architecture & Infrastructure',
  'CS 438': 'Communication Networks',
  'CS 439': 'Wireless Networks',
  'CS 440': 'Artificial Intelligence',
  'CS 441': 'Data Mining',
  'CS 442': 'Machine Learning: Intelligent User Interfaces',
  'CS 443': 'Data Visualization',
  'CS 444': 'Deep Learning for Big Data',
  'CS 445': 'Computational Photography',
  'CS 446': 'Machine Learning',
  'CS 447': 'Natural Language Processing',
  'CS 448': '3D User Interaction',
  'CS 450': 'Numerical Analysis',
  'CS 460': 'Computer Security',
  'CS 461': 'Computer Security II',
  'CS 463': 'Blockchain Foundations',
  'CS 464': 'Human-Centered Machine Learning',
  'CS 465': 'User Interface Design',
  'CS 466': 'Interactive Visualization',
  'CS 467': 'Social Visualization',
  'CS 468': 'Information Visualization',
  'CS 469': 'Visualization Design Studio',
  'CS 470': 'Advanced Artificial Intelligence',
  'CS 473': 'Algorithms for Competitive Programming',
  'CS 474': 'Formal Language & Automata Theory',
  'CS 475': 'Advanced Algorithms',
  'CS 476': 'Programming Languages',
  'CS 477': 'Logic & Automated Reasoning',
  'CS 481': 'Parallel Algorithms',
  'CS 482': 'Advanced Numerical Methods',
  'CS 483': 'Advanced Numerical Analysis: Approximation Theory',
  'CS 484': 'Advanced Numerical Analysis: ODE & PDE',
  'CS 493': 'Special Topics',
  'CS 494': 'Special Topics',
  'CS 497': 'Independent Study',
  'CS 498': 'Capstone Design Project',
};