const STORAGE_KEY = 'uiuc-cs-planner';

// Prerequisite data from cs_prerequisites_uiuc.csv
// Keys: course code with space (e.g. "CS 225"). Values: array of groups; each group is OR, groups are AND.
const PREREQ_MAP = {};
let PREREQS_LOADED = false;

function normalizeCourseCode(raw) {
  const m = (raw || '').trim().match(/^([A-Z]+)\s*(\d+)$/i) || (raw || '').trim().match(/^([A-Z]+)(\d+)$/i);
  return m ? `${m[1].toUpperCase()} ${m[2]}` : (raw || '').trim();
}

async function loadPrerequisites() {
  try {
    const res = await fetch('cs_prerequisites_uiuc.csv');
    if (!res.ok) return;

    const text = await res.text();
    const lines = text.split(/\r?\n/).filter(Boolean);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const cols = parseCSVLine(line);
      if (i === 0 && (cols[0] || '').toLowerCase() === 'course') continue;
      const courseRaw = (cols[0] || '').trim();
      if (!courseRaw) continue;

      const course = normalizeCourseCode(courseRaw);
      const prereqStr = (cols[1] || '').trim();
      if (!prereqStr || /^varies$/i.test(prereqStr)) continue;

      // Groups separated by " || " (AND); within group "|" (OR)
      const groups = prereqStr.split(/\s*\|\|\s*/).map(g => 
        g.split('|').map(s => normalizeCourseCode(s.trim())).filter(Boolean)
      ).filter(g => g.length > 0);

      if (groups.length > 0) PREREQ_MAP[course] = groups;
    }

    PREREQS_LOADED = true;
  } catch (err) {
    console.error('Failed to load prerequisites', err);
  }
}

function parseCSVLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if ((ch === ',' && !inQuotes) || ch === '\n') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

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

function getCoursesBeforeSemester(semIdx) {
  const taken = new Set();
  for (let i = 0; i < semIdx; i++) {
    (plan[i] || []).forEach(c => taken.add(c.code));
  }
  return taken;
}

function formatPrereqGroups(groups) {
  return groups.map(g => g.length === 1 ? g[0] : `(${g.join(' or ')})`).join(' and ');
}

function getPrereqTooltip(code, semIdx) {
  const groups = PREREQ_MAP[code];
  if (!groups || groups.length === 0) {
    return 'No prerequisites for this course.';
  }

  const text = formatPrereqGroups(groups);
  if (typeof semIdx !== 'number') return `Prerequisites: ${text}`;

  const taken = getCoursesBeforeSemester(semIdx);
  const satisfied = groups.every(grp => grp.some(c => taken.has(c)));
  if (satisfied) return `Prerequisites: ${text} (completed)`;

  const missingGroups = groups.filter(grp => !grp.some(c => taken.has(c)));
  const missing = missingGroups.map(grp => grp.length === 1 ? grp[0] : `one of: ${grp.join(', ')}`).join('; ');
  return `Prerequisites: ${text} (missing: ${missing})`;
}

function prereqsSatisfied(code, semIdx) {
  const groups = PREREQ_MAP[code];
  if (!groups || groups.length === 0) return true;
  const taken = getCoursesBeforeSemester(semIdx);
  return groups.every(grp => grp.some(c => taken.has(c)));
}

function prereqsMissingMessage(code, semIdx) {
  const groups = PREREQ_MAP[code];
  if (!groups || groups.length === 0) return null;
  const taken = getCoursesBeforeSemester(semIdx);
  const missingGroups = groups.filter(grp => !grp.some(c => taken.has(c)));
  if (missingGroups.length === 0) return null;
  return missingGroups.map(grp => grp.length === 1 ? grp[0] : `one of: ${grp.join(', ')}`).join('; ');
}

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
  if (!container) return;

  function semesterHTML(courses, i) {
    const hours = (courses || []).reduce((sum, c) => sum + (c.hours ?? getHours(c.code)), 0);

    const chips = (courses || []).map((c, j) => {
      const code = c.code;
      const hrs = c.hours ?? getHours(code);
       const tooltip = getPrereqTooltip(code, i).replace(/"/g, '&quot;');

      return `
        <div class="course-chip" data-sem="${i}" data-idx="${j}" title="${tooltip}">
          <span>${code}</span>
          <div class="right">
            <span class="hours">${hrs}h</span>
            <button type="button" class="remove">×</button>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="semester-card">
        <div class="semester-header">
          <span>${semesterLabel(i)}</span>
          <span class="semester-hours">${hours} hrs</span>
        </div>
        <div class="semester-courses">
          ${chips || '<span class="text-muted">No courses</span>'}
        </div>
      </div>
    `;
  }

  let html = '';
  for (let year = 0; year < 4; year++) {
    const fallIdx = year * 2;
    const springIdx = fallIdx + 1;

    html += `
      <div class="year-row">
        ${semesterHTML(plan[fallIdx] || [], fallIdx)}
        ${semesterHTML(plan[springIdx] || [], springIdx)}
      </div>
    `;
  }

  container.innerHTML = html;

  container.querySelectorAll('.remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const chip = btn.closest('.course-chip');
      const sem = Number(chip.dataset.sem);
      const idx = Number(chip.dataset.idx);

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
  const dataList = document.getElementById('course-options');
  dataList.innerHTML = ALL_COURSES.map(c =>
    `<option value="${c.code}">${c.code} — ${c.name}</option>`
  ).join('');

  const semSelect = document.getElementById('semester-select');
  semSelect.innerHTML = plan.map((_, i) =>
    `<option value="${i}">${semesterLabel(i)}</option>`
  ).join('');
}

function bindButtons() {
  const addBtn = document.getElementById('add-course-btn');
  const clearBtn = document.getElementById('clear-btn');
  const sampleBtn = document.getElementById('use-sample-btn');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const code = document.getElementById('course-select').value.trim();
      const semIdx = parseInt(document.getElementById('semester-select').value, 10);

      if (!code) return;

      // Enforce prerequisites from cs_prerequisites_uiuc.csv
      if (PREREQS_LOADED && !prereqsSatisfied(code, semIdx)) {
        const msg = prereqsMissingMessage(code, semIdx);
        if (msg) {
          alert(`Cannot add ${code}.\nMissing prerequisite(s) — add to an earlier semester first: ${msg}`);
          return;
        }
      }

      plan[semIdx].push({ code, hours: getHours(code) });

      document.getElementById('course-select').value = '';

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

  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      if (confirm('Replace your current plan with the sample sequence?')) {
        loadSampleIntoPlan();
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
  const coreEl = document.getElementById('req-core');
  const mathEl = document.getElementById('req-math');
  const orientEl = document.getElementById('req-orient');
  const teamEl = document.getElementById('req-team');
  if (coreEl) coreEl.innerHTML = CORE_CS.map(c => `<li><strong>${c.code}</strong> ${c.name} (${c.hours}h)</li>`).join('');
  if (mathEl) mathEl.innerHTML = MATH_SCIENCE.map(c => `<li><strong>${c.code}</strong> ${c.name} (${c.hours}h)</li>`).join('');
  if (orientEl) orientEl.innerHTML = ORIENTATION.map(c => `<li><strong>${c.code}</strong> ${c.name} (${c.hours}h)</li>`).join('');
  if (teamEl) teamEl.innerHTML = TEAM_PROJECT_COURSES.map(code => {
    const name = (typeof CS_ELECTIVE_NAMES !== 'undefined' && CS_ELECTIVE_NAMES[code]) || code;
    return `<li><strong>${code}</strong> ${name}</li>`;
  }).join('');
}

function renderSampleSequence() {
  const el = document.getElementById('sample-sequence');
  if (!el) return;
  // Catalog layout: Fall left, Spring right; courses vertical. Group by year.
  const years = [1, 2, 3, 4];
  const fallHours = [16, 16, 16, 16];
  const springHours = [15, 17, 16, 16];
  el.innerHTML = years.map((year, yi) => {
    const fall = SAMPLE_SEQUENCE.find(s => s.year === year && s.semester === 'Fall');
    const spring = SAMPLE_SEQUENCE.find(s => s.year === year && s.semester === 'Spring');
    const fallCourses = (fall && fall.courses) ? fall.courses.map(c => `<div class="sample-course">${c}</div>`).join('') : '';
    const springCourses = (spring && spring.courses) ? spring.courses.map(c => `<div class="sample-course">${c}</div>`).join('') : '';
    return `
      <div class="sample-year">
        <h4 class="sample-year-title">Year ${year}</h4>
        <div class="sample-columns">
          <div class="sample-col sample-fall">
            <div class="sample-col-label">First Semester (Fall)</div>
            <div class="sample-courses-vertical">${fallCourses}</div>
            <div class="sample-hours">${fallHours[yi] || 0} hrs</div>
          </div>
          <div class="sample-col sample-spring">
            <div class="sample-col-label">Second Semester (Spring)</div>
            <div class="sample-courses-vertical">${springCourses}</div>
            <div class="sample-hours">${springHours[yi] || 0} hrs</div>
          </div>
        </div>
      </div>`;
  }).join('');
}

async function init() {
  loadPlan();
  await loadPrerequisites();
  populateDropdowns();
  renderSemesters();
  updateProgress();
  renderRequirements();
  renderSampleSequence();
  bindButtons();
}

function loadSampleIntoPlan() {
  plan = Array.from({ length: 8 }, () => []);

  SAMPLE_SEQUENCE.forEach(s => {
    const semIdx = (s.year - 1) * 2 + (s.semester === 'Fall' ? 0 : 1);

    s.courses.forEach(label => {
      const match = label.match(/[A-Z]+ \d{3}|Science elective|Free elective|Gen Ed|Composition I|Language/);
      if (!match) return;

      const code = match[0];
      plan[semIdx].push({ code, hours: getHours(code) });
    });
  });

  renderSemesters();
  updateProgress();
  savePlan();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


