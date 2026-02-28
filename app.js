const STORAGE_KEY = 'uiuc-cs-planner';

const CORE_CODES = new Set(CORE_CS.map(c => c.code));
const MATH_SCIENCE_CODES = new Set(MATH_SCIENCE.map(c => c.code === 'Science elective' ? 'Science elective' : c.code));
const ORIENT_CODES = new Set(['ENG 100', 'CS 210', 'CS 211']);

// Build flat course list for dropdown (core + math + orientation + tech electives + generic)
const ALL_COURSES = [
  ...CORE_CS,
  ...MATH_SCIENCE.filter(c => c.code !== 'Science elective'),
  { code: 'Science elective', name: 'Science elective (NST list)', hours: 3 },
  ...ORIENTATION,
  ...TECHNICAL_ELECTIVES.map(code => ({ code, name: CS_ELECTIVE_NAMES[code] || code, hours: 3 })),  { code: 'Free elective', name: 'Free elective', hours: 3 },
  { code: 'Gen Ed', name: 'General Education', hours: 3 },
  { code: 'Composition I', name: 'Composition I', hours: 4 },
  { code: 'Language', name: 'Language (3rd level)', hours: 4 },
];

const COURSE_BY_CODE = {};
ALL_COURSES.forEach(c => { COURSE_BY_CODE[c.code] = c; });

// Hours for CS tech electives (default 3)
function getHours(courseCode) {
  const c = COURSE_BY_CODE[courseCode];
  if (c) return c.hours;
  if (courseCode.startsWith('CS 4') || courseCode.startsWith('CS 5')) return 3;
  return 3;
}

function isCoreCS(code) {
  return CORE_CODES.has(code);
}

function isTechElective(code) {
  return (code.startsWith('CS 4') || code.startsWith('CS 5')) && !['CS 400', 'CS 401', 'CS 402', 'CS 403', 'CS 491'].includes(code);
}

function isAdvancedElective(code) {
  return code.startsWith('CS 4') || code.startsWith('CS 5') || /^[A-Z]+ \d{3}$/.test(code);
}

function isTeamProject(code) {
  return TEAM_PROJECT_COURSES.includes(code);
}

// State: 8 semesters, each is array of { code, name?, hours? }
let plan = Array.from({ length: 8 }, () => []);

function loadPlan() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 8) {
        plan = parsed.map(sem => Array.isArray(sem) ? sem.map(c => typeof c === 'string' ? { code: c, hours: getHours(c) } : { ...c, hours: c.hours ?? getHours(c.code) }) : []);
      }
    }
  } catch (_) {}
}

function savePlan() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

function semesterLabel(i) {
  const year = Math.floor(i / 2) + 1;
  const term = i % 2 === 0 ? 'Fall' : 'Spring';
  return `Year ${year} ${term}`;
}

function renderSemesters() {
  const container = document.getElementById('semesters');
  container.innerHTML = plan.map((courses, i) => {
    const hours = courses.reduce((sum, c) => sum + (c.hours || getHours(c.code)), 0);
    const chips = courses.map((c, j) => {
      const code = c.code;
      const hrs = c.hours ?? getHours(code);
      return `<span class="course-chip" data-sem="${i}" data-idx="${j}">
        ${code} <span class="hours">${hrs}h</span>
        <button type="button" class="remove" aria-label="Remove">×</button>
      </span>`;
    }).join('');
    return `
      <div class="semester-card" data-semester="${i}">
        <div class="semester-header">
          <span>${semesterLabel(i)}</span>
          <span class="semester-hours">${hours} hrs</span>
        </div>
        <div class="semester-courses">${chips || '<span class="text-muted">No courses</span>'}</div>
      </div>`;
  }).join('');

  container.querySelectorAll('.course-chip .remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const chip = btn.closest('.course-chip');
      const sem = +chip.dataset.sem;
      const idx = +chip.dataset.idx;
      plan[sem].splice(idx, 1);
      renderSemesters();
      updateProgress();
      savePlan();
    });
  });
}

function updateProgress() {
  const allCourses = plan.flat().map(c => c.code);
  const totalHours = plan.flat().reduce((sum, c) => sum + (c.hours ?? getHours(c.code)), 0);
  const coreDone = allCourses.filter(isCoreCS).length;
  const techCodes = allCourses.filter(isTechElective);
  const techCount = techCodes.length;
  const techHours = techCodes.reduce((sum, code) => sum + getHours(code), 0);
  const advancedCodes = allCourses.filter(c => {
    if (isTechElective(c)) return false;
    return isAdvancedElective(c) || /^[A-Z]+ \d{3}$/.test(c) && !CORE_CODES.has(c) && !MATH_SCIENCE_CODES.has(c) && !ORIENT_CODES.has(c);
  });
  const advCount = advancedCodes.length;

  document.getElementById('total-hours').textContent = totalHours;
  document.getElementById('core-done').textContent = coreDone;
  document.getElementById('tech-elective-count').textContent = techCount;
  document.getElementById('tech-elective-hrs').textContent = techHours;
  document.getElementById('adv-elective-count').textContent = advCount;
}

function populateDropdowns() {
  const courseSelect = document.getElementById('course-select');
  courseSelect.innerHTML = ALL_COURSES.map(c => `<option value="${c.code}">${c.code} — ${c.name}</option>`).join('');

  const semSelect = document.getElementById('semester-select');
  semSelect.innerHTML = plan.map((_, i) => `<option value="${i}">${semesterLabel(i)}</option>`).join('');
}

function bindButtons() {
  const addBtn = document.getElementById('add-course-btn');
  const clearBtn = document.getElementById('clear-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const code = document.getElementById('course-select').value;
      const semIdx = parseInt(document.getElementById('semester-select').value, 10);
      const hours = getHours(code);
      plan[semIdx].push({ code, hours });
      renderSemesters();
      updateProgress();
      savePlan();
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear your entire plan?')) {
        plan = Array.from({ length: 8 }, () => []);
        renderSemesters();
        updateProgress();
        savePlan();
      }
    });
  }

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
}

function renderRequirements() {
  document.getElementById('req-core').innerHTML = CORE_CS.map(c => `<li><strong>${c.code}</strong> ${c.name} (${c.hours}h)</li>`).join('');
  document.getElementById('req-math').innerHTML = MATH_SCIENCE.map(c => `<li><strong>${c.code}</strong> ${c.name} (${c.hours}h)</li>`).join('');
  document.getElementById('req-orient').innerHTML = ORIENTATION.map(c => `<li><strong>${c.code}</strong> ${c.name} (${c.hours}h)</li>`).join('');
}

function renderSampleSequence() {
  document.getElementById('sample-sequence').innerHTML = SAMPLE_SEQUENCE.map(s =>
    `<div class="sample-semester">
      <div class="title">Year ${s.year} ${s.semester}</div>
      <div class="courses">${s.courses.map(c => `<span>${c}</span>`).join('')}</div>
    </div>`
  ).join('');
}

function init() {
  loadPlan();
  populateDropdowns();
  renderSemesters();
  updateProgress();
  renderRequirements();
  renderSampleSequence();
  bindButtons();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
