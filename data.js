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
  { year: 1, semester: 'Spring', courses: ['CS 128', 'CS 173', 'MATH 231', 'Gen Ed (Non-Western Studies)', 'Gen Ed or Composition I'] },
  { year: 2, semester: 'Fall', courses: ['CS 222', 'CS 225', 'MATH 241', 'PHYS 211', 'Gen Ed (Natrual Science Studies)'] },
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
  'CS 407': 'Cryptography',
  'CS 408': 'Software Foundations II',
  'CS 409': 'The Art of Web Programming',
  'CS 410': 'Text Information Systems',
  'CS 411': 'Database Systems',
  'CS 412': 'Introduction to Data Mining',
  'CS 413': 'Intro to Combinatorics',
  'CS 414': 'Multimedia Systems',
  'CS 415': 'Game Development',
  'CS 416': 'Data Visualization',
  'CS 417': 'Virtual Reality',
  'CS 418': 'Interactive Computer Graphics',
  'CS 419': 'Production Computer Graphics',
  'CS 422': 'Programming Language Design',
  'CS 423': 'Operating Systems Design',
  'CS 424': 'Real-Time Systems',
  'CS 425': 'Distributed Systems',
  'CS 426': 'Compiler Construction',
  'CS 427': 'Software Engineering I',
  'CS 428': 'Software Engineering II',
  'CS 429': 'Software Engineering II, ACP',
  'CS 431': 'Embedded Systems',
  'CS 433': 'Computer System Organization',
  'CS 434': 'Real World Algorithms for IoT and Data Science',
  'CS 435': 'Cloud Networking',
  'CS 436': 'Computer Networking Laboratory',
  'CS 437': 'Topics in Internet of Things',
  'CS 438': 'Communication Networks',
  'CS 439': 'Wireless Networks',
  'CS 440': 'Artificial Intelligence',
  'CS 441': 'Applied Machine Learning',
  'CS 442': 'Trustworthy Machine Learning',
  'CS 443': 'Reinforcement Learning',
  'CS 444': 'Deep Learning for Computer Vision',
  'CS 445': 'Computational Photography',
  'CS 446': 'Machine Learning',
  'CS 447': 'Natural Language Processing',
  'CS 448': 'Audio Computing Laboratory',
  'CS 450': 'Numerical Analysis',
  'CS 460': 'Security Laboratory',
  'CS 461': 'Computer Security I',
  'CS 463': 'Computer Security II',
  'CS 464': 'Topics in Societal and Ethical Impacts of Computer Technology',
  'CS 465': 'User Interface Design',
  'CS 466': 'Introduction to Bioinformatics',
  'CS 467': 'Social Visualization',
  'CS 468': 'Tech and Advertising Campaigns',
  'CS 469': 'Computational Advertising Infrastructure',
  'CS 470': 'Social and Information Networks',
  'CS 473': 'Algorithms',
  'CS 474': 'Logic in Computer Science',
  'CS 475': 'Formal Models of Computation',
  'CS 476': 'Program Verification',
  'CS 477': 'Formal Software Development Methods',
  'CS 481': 'Advanced Topics in Stochastic Processes & Applications',
  'CS 482': 'Simulation',
  'CS 483': 'Applied Parallel Programming',
  'CS 484': 'Parallel Programming',
  'CS 492': 'Senior Project I',
  'CS 493': 'Senior Project II, ACP',
  'CS 494': 'Senior Project II',
  'CS 497': 'CS Team Project',
  'CS 498': 'Special Topics',
};

// --- Major selection: CS (regular) + CS+ from csplus.csv ---
function parseCourseCodeStr(str) {
  if (!str || typeof str !== 'string') return [];
  const out = [];
  const parts = str.trim().split(/\s*,\s*/);
  for (const p of parts) {
    const alt = p.split(/\s*\/\s*/);
    for (const a of alt) {
      const m = a.trim().match(/^([A-Za-z]+)\s*(\d{3,})$/);
      if (m) out.push(`${m[1].toUpperCase()} ${m[2]}`);
    }
  }
  return [...new Set(out)];
}

function courseObjectsFromCodes(codes, nameLookup = {}) {
  return codes.map(code => ({
    code,
    name: nameLookup[code] || code,
    hours: code.match(/^\w+\s+(\d{3})$/) ? 3 : 3,
  }));
}

// Catalog URLs for majors (UIUC 2025-26)
const MAJOR_CATALOG_URLS = {
  'cs': 'https://catalog.illinois.edu/undergraduate/engineering/computer-science-bs/',
  'CS+ANSC': 'https://catalog.illinois.edu/undergraduate/',
  'CS+ECON': 'https://catalog.illinois.edu/undergraduate/eng_las/computer-science-economics-bslas/',
  'CS+ANTH': 'https://catalog.illinois.edu/undergraduate/eng_las/computer-science-anthropology-bslas/',
  'CS+ASTR': 'https://catalog.illinois.edu/undergraduate/eng_las/astronomy-computer-science-bslas/',
  'CS+CHEM': 'https://catalog.illinois.edu/undergraduate/eng_las/computer-science-chemistry-bslas/',
  'CS+GIS': 'https://catalog.illinois.edu/undergraduate/eng_las/geography-geographic-information-science-computer-science-bslas/',
  'CS+LING': 'https://catalog.illinois.edu/undergraduate/eng_las/computer-science-linguistics-bslas/',
  'CS+MUSIC': 'https://catalog.illinois.edu/undergraduate/eng_faa/computer-science-music-bs/',
  'CS+CPSC': 'https://catalog.illinois.edu/undergraduate/',
  'CS+EDU-LS': 'https://catalog.illinois.edu/undergraduate/',
  'CS+EDU-SE': 'https://catalog.illinois.edu/undergraduate/',
  'CS+PHYS': 'https://catalog.illinois.edu/undergraduate/engineering/computer-science-physics-bs/',
  'CS+BIOE': 'https://catalog.illinois.edu/undergraduate/engineering/computer-science-bioengineering-bs/',
  'STAT+CS': 'https://catalog.illinois.edu/undergraduate/eng_las/statistics-computer-science-bslas/',
  'MATH+CS': 'https://catalog.illinois.edu/undergraduate/eng_las/mathematics-computer-science-bslas/',
};

const CS_PLUS_ROWS = [
  { major_code: 'CS+ANSC', major_name: 'Computer Science + Animal Sciences', college: 'ACES', total_hours: 126, cs_core_courses: 'CS100,CS124,CS128,CS173,CS222,CS225,CS233,CS341,CS357,CS361,CS374', x_required_courses: 'ANSC100,ANSC221,ANSC222,ANSC223,ANSC224,ANSC398,ANSC498', x_elective_requirements: 'Animal Sciences electives (choose from department list)', additional_math_science: 'MATH220/221,MATH231,MATH225/257,CHEM102,CHEM103,CHEM104,CHEM105', notes: 'Requires science-heavy foundation.' },
  { major_code: 'CS+ECON', major_name: 'Computer Science + Economics', college: 'LAS', total_hours: 120, cs_core_courses: 'CS124,CS128,CS173,CS222,CS225,CS233,CS341,CS357,CS374', x_required_courses: 'ECON102,ECON103,ECON202,ECON203,ECON302,ECON303', x_elective_requirements: '400-level ECON electives (as specified by department)', additional_math_science: 'MATH220/221,MATH231,MATH241', notes: 'Strong quantitative focus.' },
  { major_code: 'CS+ANTH', major_name: 'Computer Science + Anthropology', college: 'LAS', total_hours: 120, cs_core_courses: 'CS124,CS128,CS173,CS222,CS225,CS233,CS341,CS357,CS374', x_required_courses: 'ANTH100,ANTH101,ANTH102', x_elective_requirements: 'Advanced Anthropology electives (department approved)', additional_math_science: 'MATH220/221,MATH231', notes: 'Blends computational analysis with cultural and social research.' },
  { major_code: 'CS+ASTR', major_name: 'Computer Science + Astronomy', college: 'LAS', total_hours: 120, cs_core_courses: 'CS124,CS128,CS173,CS222,CS225,CS233,CS341,CS357,CS374', x_required_courses: 'ASTR100,ASTR122,ASTR310', x_elective_requirements: 'Advanced Astronomy electives', additional_math_science: 'MATH220/221,MATH231,MATH241,PHYS211,PHYS212', notes: 'Heavy physics and math integration.' },
  { major_code: 'CS+CHEM', major_name: 'Computer Science + Chemistry', college: 'LAS', total_hours: 120, cs_core_courses: 'CS124,CS128,CS173,CS222,CS225,CS233,CS341,CS357,CS374', x_required_courses: 'CHEM102,CHEM103,CHEM104,CHEM105,CHEM232,CHEM233', x_elective_requirements: 'Advanced Chemistry electives', additional_math_science: 'MATH220/221,MATH231,MATH241', notes: 'Requires full chemistry sequence including labs.' },
  { major_code: 'CS+GIS', major_name: 'Computer Science + Geography & GIS', college: 'LAS', total_hours: 120, cs_core_courses: 'CS124,CS128,CS173,CS222,CS225,CS233,CS341,CS357,CS374', x_required_courses: 'GGIS101,GGIS104,GGIS379', x_elective_requirements: 'Advanced GIS electives', additional_math_science: 'MATH220/221,MATH231', notes: 'Focus on spatial data and GIS.' },
  { major_code: 'CS+LING', major_name: 'Computer Science + Linguistics', college: 'LAS', total_hours: 120, cs_core_courses: 'CS124,CS128,CS173,CS222,CS225,CS233,CS341,CS357,CS374', x_required_courses: 'LING100,LING301,LING307,LING406', x_elective_requirements: 'Advanced: at least 3 of TRST 415, LING 490, CS 446; plus Linguistics Breadth (200+ LING, 3h). See catalog.', additional_math_science: 'MATH220/221,MATH225/257,MATH231', notes: 'Strong AI and NLP crossover potential. STAT 200/212 or CS 361 for stats.' },
  { major_code: 'CS+MUSIC', major_name: 'Computer Science + Music', college: 'FAA', total_hours: 120, cs_core_courses: 'CS124,CS128,CS173,CS222,CS225,CS233,CS341,CS357,CS374', x_required_courses: 'MUS101,MUS107,MUS201', x_elective_requirements: 'Advanced Music electives', additional_math_science: 'MATH220/221,MATH231', notes: 'Combines computing with music theory and technology.' },
  { major_code: 'CS+CPSC', major_name: 'Computer Science + Crop Sciences', college: 'ACES', total_hours: 126, cs_core_courses: 'CS100,CS124,CS128,CS173,CS222,CS225,CS233,CS341,CS357,CS361,CS374', x_required_courses: 'CPSC110,CPSC112', x_elective_requirements: 'Advanced Crop Sciences electives', additional_math_science: 'MATH220/221,MATH231,CHEM102,CHEM103', notes: 'Agricultural systems and computational modeling.' },
  { major_code: 'CS+EDU-LS', major_name: 'Computer Science + Education (Learning Sciences)', college: 'Education', total_hours: 120, cs_core_courses: 'CS124,CS128,CS173,CS222,CS225,CS233,CS341,CS357,CS374', x_required_courses: 'EPSY201,CI210', x_elective_requirements: 'Education electives per program', additional_math_science: 'MATH220/221,MATH231', notes: 'Computational tools for learning environments.' },
  { major_code: 'CS+EDU-SE', major_name: 'Computer Science + Education (Secondary Ed)', college: 'Education', total_hours: 120, cs_core_courses: 'CS124,CS128,CS173,CS222,CS225,CS233,CS341,CS357,CS374', x_required_courses: 'CI401,CI403', x_elective_requirements: 'Teaching practicum required', additional_math_science: 'MATH220/221,MATH231', notes: 'High school CS teaching licensure.' },
  { major_code: 'CS+PHYS', major_name: 'Computer Science + Physics', college: 'Engineering', total_hours: 128, cs_core_courses: 'CS124,CS128,CS173,CS222,CS225,CS233,CS341,CS357,CS374', x_required_courses: 'PHYS211,PHYS212,PHYS213,PHYS214,PHYS225,PHYS326', x_elective_requirements: 'Advanced Physics electives (300-400 level)', additional_math_science: 'MATH221,MATH231,MATH241,MATH285', notes: 'Highly math-intensive.' },
  { major_code: 'CS+BIOE', major_name: 'Computer Science + Bioengineering', college: 'Engineering', total_hours: 128, cs_core_courses: 'CS124,CS128,CS173,CS222,CS225,CS233,CS341,CS357,CS374', x_required_courses: 'BIOE120,BIOE201,BIOE202,BIOE205', x_elective_requirements: 'Advanced Bioengineering electives', additional_math_science: 'MATH221,MATH231,MATH241,MATH285,CHEM102,CHEM103,PHYS211,PHYS212', notes: 'Computational biology and medical systems.' },
  { major_code: 'STAT+CS', major_name: 'Statistics & Computer Science', college: 'LAS', total_hours: 120, cs_core_courses: 'CS124,CS128,CS173,CS222,CS225,CS233,CS341,CS357,CS374', x_required_courses: 'STAT107,STAT200,STAT400,STAT410', x_elective_requirements: 'Advanced Statistics electives (400-level STAT)', additional_math_science: 'MATH220/221,MATH231,MATH241', notes: 'Probability, statistical modeling, data science.' },
  { major_code: 'MATH+CS', major_name: 'Mathematics & Computer Science', college: 'LAS', total_hours: 120, cs_core_courses: 'CS124,CS128,CS173,CS222,CS225,CS233,CS341,CS357,CS374', x_required_courses: 'MATH347,MATH416,MATH417', x_elective_requirements: 'Advanced Mathematics electives (400-level MATH)', additional_math_science: 'MATH221,MATH231,MATH241', notes: 'Heavy theoretical focus; ideal for theory or graduate study.' },
];

const CORE_CS_NAMES = {};
CORE_CS.forEach(c => { CORE_CS_NAMES[c.code] = c.name; });

// Sample sequences from UIUC catalog (#samplesequencetext). Each major's catalog has a Sample Sequence table.
const MAJOR_SAMPLE_SEQUENCES = {
  'CS+LING': [
    { year: 1, semester: 'Fall', courses: ['Free elective (1h)', 'CS 100', 'LING 100', 'CS 124', 'Composition I or Gen Ed', 'Free elective (2h)'], hours: 14 },
    { year: 1, semester: 'Spring', courses: ['CS 128', 'CS 173', 'Linguistics Breadth (200–400 level)', 'MATH 220 or 221', 'Gen Ed or Composition I'], hours: 16 },
    { year: 2, semester: 'Fall', courses: ['CS 222', 'CS 225', 'MATH 225 or 257', 'Gen Ed', 'Language (3rd level)'], hours: 15 },
    { year: 2, semester: 'Spring', courses: ['STAT 200, STAT 212, or CS 361', 'CS 233 or CS 340', 'MATH 231', 'Gen Ed', 'Language (4th level)'], hours: 16 },
    { year: 3, semester: 'Fall', courses: ['CS 341 (or CS 400-level)', 'LING 301', 'TRST 415', 'Gen Ed', 'Gen Ed'], hours: 16 },
    { year: 3, semester: 'Spring', courses: ['CS 374', 'CS 400-level or Free elective', 'LING 307', 'Gen Ed', 'Gen Ed'], hours: 16 },
    { year: 4, semester: 'Fall', courses: ['CS 421', 'LING 406', 'Gen Ed', 'Free elective', 'Free elective'], hours: 14 },
    { year: 4, semester: 'Spring', courses: ['CS 446', 'LING 490', 'Free elective', 'Free elective', 'Free elective'], hours: 13 },
  ],
  // https://catalog.illinois.edu/undergraduate/eng_las/statistics-computer-science-bslas/#samplesequencetext
  'STAT+CS': [
    { year: 1, semester: 'Fall', courses: ['STAT 107, 200, or 212', 'CS 100', 'CS 124', 'MATH 220 or 221', 'Composition I or Gen Ed', 'Gen Ed'], hours: 17 },
    { year: 1, semester: 'Spring', courses: ['CS 128', 'CS 173', 'MATH 231', 'Gen Ed or Composition I', 'Gen Ed'], hours: 15 },
    { year: 2, semester: 'Fall', courses: ['STAT 400', 'CS 222', 'CS 225', 'MATH 241', 'Language (3rd level)'], hours: 17 },
    { year: 2, semester: 'Spring', courses: ['STAT 410', 'CS 340 or CS 233', 'MATH 257 or 415', 'Gen Ed', 'Language (4th level)'], hours: 16 },
    { year: 3, semester: 'Fall', courses: ['STAT 425', 'CS 341 (or CS 400-level)', 'CS 357', 'Gen Ed', 'Free elective'], hours: 15 },
    { year: 3, semester: 'Spring', courses: ['STAT 426', 'CS 374', 'Free elective or CS 400-level', 'Gen Ed', 'Gen Ed'], hours: 16 },
    { year: 4, semester: 'Fall', courses: ['CS 421', 'Statistical Application Elective', 'Gen Ed', 'Free elective'], hours: 12 },
    { year: 4, semester: 'Spring', courses: ['Computational Application Elective', 'Gen Ed', 'Gen Ed', 'Free elective'], hours: 12 },
  ],
  // https://catalog.illinois.edu/undergraduate/eng_las/mathematics-computer-science-bslas/#samplesequencetext
  'MATH+CS': [
    { year: 1, semester: 'Fall', courses: ['CS 100', 'MATH 220 or 221', 'Gen Ed', 'Composition I or Gen Ed', 'CS 124'], hours: 15 },
    { year: 1, semester: 'Spring', courses: ['MATH 231', 'CS 128', 'CS 173', 'Gen Ed or Composition I', 'Gen Ed'], hours: 15 },
    { year: 2, semester: 'Fall', courses: ['MATH 241', 'CS 225', 'CS 222', 'Language (3rd level)', 'Gen Ed'], hours: 16 },
    { year: 2, semester: 'Spring', courses: ['MATH 347', 'MATH 415 or 416', 'CS 233 or 340', 'Language (4th level)', 'Free elective'], hours: 15 },
    { year: 3, semester: 'Fall', courses: ['CS 361, MATH 461, or STAT 400', 'CS 341 (or CS 4XX)', 'MATH 441, 446, or 484', 'Gen Ed', 'Gen Ed'], hours: 16 },
    { year: 3, semester: 'Spring', courses: ['CS 374', 'CS 357', 'MATH 444, 447, or 424', 'Gen Ed', 'Free elective'], hours: 15 },
    { year: 4, semester: 'Fall', courses: ['CS 450', 'CS 421', 'MATH 412, 413, 417, or 427', 'Gen Ed', 'Gen Ed'], hours: 15 },
    { year: 4, semester: 'Spring', courses: ['CS 473, 475, 476, 477, or MATH 414', 'Additional 400-level MATH or CS', 'Gen Ed', 'Free elective or CS 4XX'], hours: 13 },
  ],
  // https://catalog.illinois.edu/undergraduate/eng_las/computer-science-chemistry-bslas/#samplesequencetext
  'CS+CHEM': [
    { year: 1, semester: 'Fall', courses: ['Free elective', 'CS 100', 'CS 124', 'CHEM 102 or 202', 'CHEM 103 or 203', 'MATH 220 or 221', 'Gen Ed or Composition I'], hours: 17 },
    { year: 1, semester: 'Spring', courses: ['CHEM 104 or 204', 'CHEM 105 or Free elective', 'CS 128', 'MATH 231', 'Composition I or Gen Ed'], hours: 14 },
    { year: 2, semester: 'Fall', courses: ['CHEM 232 or 236', 'CS 173', 'Gen Ed', 'Language (3rd level)'], hours: 14 },
    { year: 2, semester: 'Spring', courses: ['Advanced Chemistry', 'CS 225', 'CS 222', 'MATH 225 or 257', 'Language (4th level)'], hours: 15 },
    { year: 3, semester: 'Fall', courses: ['CS 233 or 340', 'Advanced Chemistry', 'STAT 200, 212, or CS 361', 'Gen Ed', 'Free elective'], hours: 16 },
    { year: 3, semester: 'Spring', courses: ['CS 341 (or CS 400-level)', 'Advanced Chemistry', 'Gen Ed', 'Gen Ed', 'Free elective'], hours: 15 },
    { year: 4, semester: 'Fall', courses: ['CS 374', 'CHEM 440 or 442', 'CS 400-level or Free elective', 'Gen Ed', 'Free elective'], hours: 14 },
    { year: 4, semester: 'Spring', courses: ['CS 421', 'Gen Ed', 'Gen Ed', 'Free elective'], hours: 15 },
  ],
  // https://catalog.illinois.edu/undergraduate/eng_las/computer-science-economics-bslas/#samplesequencetext
  'CS+ECON': [
    { year: 1, semester: 'Fall', courses: ['Free elective', 'CS 100', 'MATH 220 or 221', 'ECON 102 or 103', 'Composition I or Gen Ed', 'CS 124'], hours: 16 },
    { year: 1, semester: 'Spring', courses: ['MATH 231', 'CS 128', 'ECON 103 or 102', 'CS 173', 'Gen Ed or Composition I'], hours: 15 },
    { year: 2, semester: 'Fall', courses: ['CS 225', 'CS 233 or 340', 'ECON 202, STAT 200, 212, or CS 361', 'Language (3rd level)'], hours: 15 },
    { year: 2, semester: 'Spring', courses: ['CS 222', 'CS 341 (or CS 400-level)', 'ECON 203', 'Language (4th level)', 'Gen Ed'], hours: 15 },
    { year: 3, semester: 'Fall', courses: ['CS 421', 'ECON 302', 'CS 374', 'MATH 225 or 227', 'Gen Ed'], hours: 16 },
    { year: 3, semester: 'Spring', courses: ['CS 400-level or Free elective', 'Gen Ed', 'Free elective', 'Free elective', 'Free elective'], hours: 15 },
    { year: 4, semester: 'Fall', courses: ['Gen Ed', 'Gen Ed', 'ECON 400-level', 'ECON 400-level', 'Free elective'], hours: 14 },
    { year: 4, semester: 'Spring', courses: ['Gen Ed', 'Gen Ed', 'ECON 400-level', 'ECON 400-level', 'Free elective'], hours: 14 },
  ],
  // https://catalog.illinois.edu/undergraduate/eng_las/computer-science-anthropology-bslas/#samplesequencetext
  'CS+ANTH': [
    { year: 1, semester: 'Fall', courses: ['Free elective', 'CS 100', 'ANTH Foundation', 'CS 124', 'Composition I or Gen Ed', 'Gen Ed'], hours: 15 },
    { year: 1, semester: 'Spring', courses: ['CS 128', 'CS 173', 'ANTH Foundation', 'MATH 220 or 221', 'Gen Ed or Composition I'], hours: 16 },
    { year: 2, semester: 'Fall', courses: ['CS 222', 'CS 225', 'MATH 225 or 257', 'Language (3rd level)', 'Gen Ed'], hours: 15 },
    { year: 2, semester: 'Spring', courses: ['CS 233 or 340', 'STAT 200, 212, or CS 361', 'MATH 231', 'Language (4th level)', 'Gen Ed'], hours: 17 },
    { year: 3, semester: 'Fall', courses: ['CS 341 (or CS 400-level)', 'ANTH Foundation', 'ANTH Elective', 'Gen Ed', 'Gen Ed'], hours: 16 },
    { year: 3, semester: 'Spring', courses: ['CS 374', 'CS 400-level or Free elective', 'ANTH Elective', 'Gen Ed', 'Gen Ed'], hours: 16 },
    { year: 4, semester: 'Fall', courses: ['ANTH 421', 'ANTH Foundation', 'Gen Ed', 'Free elective'], hours: 13 },
    { year: 4, semester: 'Spring', courses: ['ANTH Foundation', 'Gen Ed', 'Free elective', 'Free elective'], hours: 12 },
  ],
  // https://catalog.illinois.edu/undergraduate/eng_faa/computer-science-music-bs/#samplesequencetext
  'CS+MUSIC': [
    { year: 1, semester: 'Fall', courses: ['FAA 101', 'MUS 100', 'MUS 101', 'MUS 107', 'CS 124', 'MATH 220 or 221', 'Composition I or Language (3rd)'], hours: 17 },
    { year: 1, semester: 'Spring', courses: ['MUS 102', 'MUS 108', 'MUS 105', 'CS 128', 'CS 173', 'Language (3rd) or Composition I'], hours: 16 },
    { year: 2, semester: 'Fall', courses: ['MUS 201', 'MUS 207', 'MUS 205', 'CS 222', 'CS 225', 'MATH 231', 'MATH 225 or 257'], hours: 16 },
    { year: 2, semester: 'Spring', courses: ['MUS 202', 'MUS 208', 'MUS 305', 'MUS 172', 'CS 233', 'CS 361'], hours: 16 },
    { year: 3, semester: 'Fall', courses: ['MUS 173', 'CS 341', 'ECE 402', 'Gen Ed', 'Gen Ed (Social/Behavioral + Natural Science)'], hours: 15 },
    { year: 3, semester: 'Spring', courses: ['MUS 110', 'CS 374', 'CS 448', 'MUS 209'], hours: 13 },
    { year: 4, semester: 'Fall', courses: ['MUS 299', 'MUS 313', 'MUS 407', 'CS 421', 'Gen Ed'], hours: 13 },
    { year: 4, semester: 'Spring', courses: ['MUS 299', 'MUS 314', 'Gen Ed', 'Gen Ed', 'Gen Ed', 'Free elective'], hours: 14 },
  ],
  // https://catalog.illinois.edu/undergraduate/engineering/computer-science-physics-bs/#samplesequencetext
  'CS+PHYS': [
    { year: 1, semester: 'Fall', courses: ['MATH 221 (or 220)', 'PHYS 110', 'ENG 100', 'CS 124', 'Composition I or Gen Ed', 'Gen Ed (Cultural Studies)'], hours: 15 },
    { year: 1, semester: 'Spring', courses: ['MATH 231', 'PHYS 211', 'CS 128', 'CS 173', 'Gen Ed or Composition I'], hours: 16 },
    { year: 2, semester: 'Fall', courses: ['MATH 241', 'PHYS 212', 'PHYS 225', 'CS 225', 'Gen Ed (Non-Western Studies)'], hours: 17 },
    { year: 2, semester: 'Spring', courses: ['MATH 285', 'PHYS 213', 'PHYS 214', 'PHYS 246', 'CS 233 or 340', 'CS 222', 'Gen Ed (Non-Western Studies)'], hours: 17 },
    { year: 3, semester: 'Fall', courses: ['MATH 257 (or 416)', 'PHYS 325', 'CS 361 (or STAT 400)', 'PHYS Technical Elective', 'Gen Ed (Advanced Composition)'], hours: 15 },
    { year: 3, semester: 'Spring', courses: ['CS 357 or 450', 'PHYS 435', 'CS Technical Elective', 'PHYS Technical Elective', 'Language (3rd level)'], hours: 16 },
    { year: 4, semester: 'Fall', courses: ['PHYS 485 (or 486)', 'CS 374', 'Free elective', 'Free elective', 'Free elective'], hours: 15 },
    { year: 4, semester: 'Spring', courses: ['PHYS 446', 'PHYS Technical Elective', 'PHYS Technical Elective', 'CS 341 (or CS Technical Elective)', 'Free elective'], hours: 17 },
  ],
  // https://catalog.illinois.edu/undergraduate/engineering/computer-science-bioengineering-bs/#samplesequencetext
  'CS+BIOE': [
    { year: 1, semester: 'Fall', courses: ['ENG 100', 'BIOE 100', 'MATH 221 (or 220)', 'CS 124', 'Composition I or Gen Ed', 'CHEM 102 (& 103) or MCB 150'], hours: 16 },
    { year: 1, semester: 'Spring', courses: ['MATH 231', 'BIOE 120', 'PHYS 211', 'CS 128', 'CS 173', 'Gen Ed or Composition I'], hours: 17 },
    { year: 2, semester: 'Fall', courses: ['MATH 241', 'PHYS 212', 'CS 222', 'CS 225', 'Gen Ed (Cultural Studies)'], hours: 16 },
    { year: 2, semester: 'Spring', courses: ['MATH 285', 'MATH 257 or BIOE 210', 'CS 233 or 340', 'BIOE 205', 'Gen Ed (Social Science)'], hours: 16 },
    { year: 3, semester: 'Fall', courses: ['CS 341 (or CS Technical Elective)', 'BIOE 206', 'BIOE Technical Elective', 'Free elective', 'Language (3rd level)'], hours: 16 },
    { year: 3, semester: 'Spring', courses: ['CS 374', 'BIOE 310', 'BIOE Technical Elective', 'CS Technical Elective', 'Upper Division Technical Elective'], hours: 16 },
    { year: 4, semester: 'Fall', courses: ['CS 357 or 421', 'BIOE Technical Elective', 'BIOE Technical Elective', 'Free elective', 'Gen Ed (Advanced Composition) or BIOE 404'], hours: 15 },
    { year: 4, semester: 'Spring', courses: ['BIOE 404 (or Gen Ed)', 'BIOE Technical Elective', 'Upper Division Technical Elective', 'Free elective or CS Technical Elective', 'Free elective'], hours: 16 },
  ],
};

function buildCsPlusMajor(row) {
  const coreCodes = parseCourseCodeStr(row.cs_core_courses);
  const xCodes = parseCourseCodeStr(row.x_required_courses);
  const mathScienceCodes = parseCourseCodeStr(row.additional_math_science);
  const nameLookup = { ...CORE_CS_NAMES, ...CS_ELECTIVE_NAMES };
  return {
    id: row.major_code,
    name: row.major_name,
    college: row.college,
    totalHours: parseInt(row.total_hours, 10) || 120,
    coreCourses: courseObjectsFromCodes(coreCodes, nameLookup),
    mathScience: courseObjectsFromCodes(mathScienceCodes, nameLookup),
    orientation: ORIENTATION,
    xRequiredCourses: courseObjectsFromCodes(xCodes, nameLookup),
    xElectiveText: row.x_elective_requirements || '',
    notes: row.notes || '',
    catalogUrl: MAJOR_CATALOG_URLS[row.major_code] || 'https://catalog.illinois.edu/',
    hasTechnicalElectives: false,
    hasAdvancedElectives: false,
    sampleSequence: MAJOR_SAMPLE_SEQUENCES[row.major_code] || null,
  };
}

const MAJORS = [
  {
    id: 'cs',
    name: 'Computer Science, BS',
    college: 'Engineering',
    totalHours: 128,
    coreCourses: CORE_CS,
    mathScience: MATH_SCIENCE,
    orientation: ORIENTATION,
    xRequiredCourses: [],
    xElectiveText: '',
    notes: '',
    catalogUrl: 'https://catalog.illinois.edu/undergraduate/engineering/computer-science-bs/',
    hasTechnicalElectives: true,
    hasAdvancedElectives: true,
    technicalElectives: TECHNICAL_ELECTIVES,
    teamProjectCourses: TEAM_PROJECT_COURSES,
    focusAreas: FOCUS_AREAS,
    sampleSequence: SAMPLE_SEQUENCE,
  },
  ...CS_PLUS_ROWS.map(buildCsPlusMajor),
];