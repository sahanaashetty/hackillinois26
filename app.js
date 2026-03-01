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

function getCourseUrl(code) {
  if (!code || typeof code !== 'string') return null;
  const trimmed = code.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^([A-Za-z]+)\s*(\d{3,})$/) || trimmed.match(/^([A-Za-z]+)(\d{3,})$/);
  if (!match) return null;
  const dept = match[1].toUpperCase();
  const num = match[2];
  return `https://courses.illinois.edu/search/?P=${encodeURIComponent(dept + ' ' + num)}`;
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// State: 8 semesters, each is array of { code, name?, hours? }
let plan = Array.from({ length: 8 }, () => []);

// Current semester (0-7) and which past semesters are unlocked for editing
const SETTINGS_KEY = STORAGE_KEY + '-settings';
let currentSemesterIndex = null; // null until user sets it
let unlockedPastSemesters = []; // indices of past semesters user has unlocked

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
    const settingsRaw = localStorage.getItem(SETTINGS_KEY);
    if (settingsRaw) {
      const s = JSON.parse(settingsRaw);
      if (typeof s.currentSemesterIndex === 'number' && s.currentSemesterIndex >= 0 && s.currentSemesterIndex <= 7) {
        currentSemesterIndex = s.currentSemesterIndex;
      }
      if (Array.isArray(s.unlockedPastSemesters)) {
        unlockedPastSemesters = s.unlockedPastSemesters.filter(i => typeof i === 'number' && i >= 0 && i < 8);
      }
    }
  } catch (_) {}
}

function savePlan() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    currentSemesterIndex,
    unlockedPastSemesters,
  }));
}

function isPastSemester(i) {
  return currentSemesterIndex !== null && i < currentSemesterIndex;
}

function isSemesterLocked(i) {
  return isPastSemester(i) && !unlockedPastSemesters.includes(i);
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
    const past = isPastSemester(i);
    const locked = isSemesterLocked(i);
    const lockLabel = locked ? 'Unlock to edit' : 'Lock semester';
    const lockIcon = locked ? '&#128274;' : '&#128275;'; // locked / unlocked

    const chips = (courses || []).map((c, j) => {
      const code = c.code;
      const hrs = c.hours ?? getHours(code);
      const tooltipText = getPrereqTooltip(code, i);
      const removeBtn = locked
        ? ''
        : `<button type="button" class="remove" aria-label="Remove">×</button>`;
      const courseUrl = getCourseUrl(code);
      const codeDisplay = courseUrl
        ? `<a href="${courseUrl}" class="course-chip-link" target="_blank" rel="noopener">${code}</a>`
        : `<span>${code}</span>`;

      return `
        <div class="course-chip" data-sem="${i}" data-idx="${j}" data-prereq-tooltip="${escapeAttr(tooltipText)}">
          <span class="course-chip-code">${codeDisplay}</span>
          <div class="right">
            <span class="hours">${hrs}h</span>
            ${removeBtn}
          </div>
        </div>
      `;
    }).join('');

    const cardClasses = ['semester-card'];
    if (past) cardClasses.push('past-semester');
    if (locked) cardClasses.push('locked');

    return `
      <div class="${cardClasses.join(' ')}" data-semester="${i}">
        <div class="semester-header">
          <div class="semester-header-left">
            ${past ? `<button type="button" class="lock-btn" data-semester="${i}" title="${lockLabel}" aria-label="${lockLabel}">${lockIcon}</button>` : ''}
            <span class="semester-title">${semesterLabel(i)}</span>
          </div>
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
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const chip = btn.closest('.course-chip');
      const sem = Number(chip.dataset.sem);
      const idx = Number(chip.dataset.idx);
      if (isSemesterLocked(sem)) return;
      plan[sem].splice(idx, 1);
      renderSemesters();
      updateProgress();
      savePlan();
    });
  });

  container.querySelectorAll('.lock-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const i = Number(btn.dataset.semester);
      if (unlockedPastSemesters.includes(i)) {
        unlockedPastSemesters = unlockedPastSemesters.filter(x => x !== i);
      } else {
        unlockedPastSemesters = [...unlockedPastSemesters, i].sort((a, b) => a - b);
      }
      saveSettings();
      renderSemesters();
    });
  });

  container.querySelectorAll('.semester-title').forEach(titleEl => {
    titleEl.addEventListener('click', async (e) => {
      e.stopPropagation();
      const card = titleEl.closest('.semester-card');
      if (!card) return;
      const i = Number(card.dataset.semester);
      const setCurrent = await showCurrentSemesterModal();
      if (setCurrent) {
        currentSemesterIndex = i;
        saveSettings();
        renderSemesters();
      }
    });
  });

  bindPrereqTooltips(container);
}

function bindPrereqTooltips(container) {
  const tooltipEl = document.getElementById('prereq-tooltip');
  if (!tooltipEl) return;
  container.querySelectorAll('.course-chip[data-prereq-tooltip]').forEach(chip => {
    const text = chip.getAttribute('data-prereq-tooltip');
    if (!text) return;
    chip.addEventListener('mouseenter', () => {
      tooltipEl.textContent = text.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      tooltipEl.classList.add('prereq-tooltip-visible');
      const rect = chip.getBoundingClientRect();
      tooltipEl.style.left = `${rect.left}px`;
      tooltipEl.style.top = `${rect.bottom + 6}px`;
    });
    chip.addEventListener('mouseleave', () => {
      tooltipEl.classList.remove('prereq-tooltip-visible');
    });
  });
}

function showCurrentSemesterModal() {
  return new Promise((resolve) => {
    const modal = document.getElementById('current-semester-modal');
    if (!modal) {
      resolve(confirm('Is this your current semester?'));
      return;
    }
    modal.classList.add('modal-open');
    modal.setAttribute('aria-hidden', 'false');

    function close(result) {
      modal.classList.remove('modal-open');
      modal.setAttribute('aria-hidden', 'true');
      modal.querySelector('.modal-backdrop').removeEventListener('click', onBackdrop);
      modal.querySelector('.modal-btn-yes').removeEventListener('click', onYes);
      modal.querySelector('.modal-btn-no').removeEventListener('click', onNo);
      resolve(result);
    }

    function onYes() { close(true); }
    function onNo() { close(false); }
    function onBackdrop() { close(false); }

    modal.querySelector('.modal-btn-yes').addEventListener('click', onYes);
    modal.querySelector('.modal-btn-no').addEventListener('click', onNo);
    modal.querySelector('.modal-backdrop').addEventListener('click', onBackdrop);
  });
}

function showAlertModal(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('alert-modal');
    const messageEl = document.getElementById('alert-modal-message');
    if (!modal || !messageEl) {
      alert(message);
      resolve();
      return;
    }
    messageEl.textContent = message;
    modal.classList.add('modal-open');
    modal.setAttribute('aria-hidden', 'false');

    function close() {
      modal.classList.remove('modal-open');
      modal.setAttribute('aria-hidden', 'true');
      modal.querySelector('.modal-backdrop').removeEventListener('click', onBackdrop);
      modal.querySelector('.modal-btn-ok').removeEventListener('click', onOk);
      resolve();
    }

    function onOk() { close(); }
    function onBackdrop() { close(); }

    modal.querySelector('.modal-btn-ok').addEventListener('click', onOk);
    modal.querySelector('.modal-backdrop').addEventListener('click', onBackdrop);
  });
}

function showConfirmModal(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal');
    const messageEl = document.getElementById('confirm-modal-message');
    if (!modal || !messageEl) {
      resolve(confirm(message));
      return;
    }
    messageEl.textContent = message;
    modal.classList.add('modal-open');
    modal.setAttribute('aria-hidden', 'false');

    function close(result) {
      modal.classList.remove('modal-open');
      modal.setAttribute('aria-hidden', 'true');
      modal.querySelector('.modal-backdrop').removeEventListener('click', onBackdrop);
      modal.querySelector('.modal-btn-yes').removeEventListener('click', onYes);
      modal.querySelector('.modal-btn-no').removeEventListener('click', onNo);
      resolve(result);
    }

    function onYes() { close(true); }
    function onNo() { close(false); }
    function onBackdrop() { close(false); }

    modal.querySelector('.modal-btn-yes').addEventListener('click', onYes);
    modal.querySelector('.modal-btn-no').addEventListener('click', onNo);
    modal.querySelector('.modal-backdrop').addEventListener('click', onBackdrop);
  });
}

function updateProgress() {
  // Only count courses in completed or in-progress semesters (up to and including current)
  const lastCountedIndex = currentSemesterIndex !== null ? currentSemesterIndex : 7;
  const coursesForProgress = plan.slice(0, lastCountedIndex + 1).flat();
  const allCourses = coursesForProgress.map(c => c.code);
  const totalHours = coursesForProgress.reduce((sum, c) => sum + (c.hours ?? getHours(c.code)), 0);
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
  if (addBtn) {
    addBtn.addEventListener('click', async () => {
      const raw = document.getElementById('course-select').value.trim();
      const code = normalizeCourseCode(raw);
      const semIdx = parseInt(document.getElementById('semester-select').value, 10);

      if (!raw) return;

      if (!COURSE_BY_CODE[code] && !code.match(/^[A-Z]+\s*\d{3,}$/)) {
        await showAlertModal('Course not found. Use the search to pick a course from the list (e.g. CS 407, MATH 221).');
        return;
      }

      if (isSemesterLocked(semIdx)) {
        showAlertModal('That semester is locked. Click the lock icon on that semester to unlock it for editing.');
        return;
      }

      // Enforce prerequisites from cs_prerequisites_uiuc.csv
      if (PREREQS_LOADED && !prereqsSatisfied(code, semIdx)) {
        const msg = prereqsMissingMessage(code, semIdx);
        if (msg) {
          showAlertModal(`Cannot add ${code}.\nMissing prerequisite(s) — add to an earlier semester first: ${msg}`);
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
    clearBtn.addEventListener('click', async () => {
      const ok = await showConfirmModal('Clear your entire plan?');
      if (ok) {
        plan = Array.from({ length: 8 }, () => []);
        renderSemesters();
        updateProgress();
        savePlan();
      }
    });
  }

  document.querySelectorAll('.use-sample-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ok = await showConfirmModal('Replace your current plan with the sample sequence?');
      if (ok) {
        loadSampleIntoPlan();
      }
    });
  });

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

function getSampleSequenceHTML() {
  const years = [1, 2, 3, 4];
  const fallHours = [16, 16, 16, 16];
  const springHours = [15, 17, 16, 16];
  return years.map((year, yi) => {
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

function renderSampleSequence() {
  const html = getSampleSequenceHTML();
  const el = document.getElementById('sample-sequence');
  const planEl = document.getElementById('plan-sample-sequence');
  if (el) el.innerHTML = html;
  if (planEl) planEl.innerHTML = html;
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


