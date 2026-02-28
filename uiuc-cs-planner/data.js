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
