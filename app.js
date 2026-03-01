const STORAGE_KEY = 'uiuc-cs-planner';
const MAJOR_STORAGE_KEY = STORAGE_KEY + '-major';

let currentMajorId = 'cs';
let currentMajor = null;

function getPlanStorageKey() {
  return STORAGE_KEY + '-plan-' + (currentMajorId || 'cs');
}

// Prerequisite data from cs_prerequisites_uiuc.csv
// Keys: course code with space (e.g. "CS 225"). Values: array of groups; each group is OR, groups are AND.
const PREREQ_MAP = {};
let PREREQS_LOADED = false;

function normalizeCourseCode(raw) {
  const m = (raw || '').trim().match(/^([A-Z]+)\s*(\d+)$/i) || (raw || '').trim().match(/^([A-Z]+)(\d+)$/i);
  return m ? `${m[1].toUpperCase()} ${m[2]}` : (raw || '').trim();
}

// Never use a prereq-group string (e.g. "[[ CS 124,CS 125 ]]") as a course code. Use first actual course code only.
function ensureCourseCode(value) {
  if (!value || typeof value !== 'string') return value;
  const s = value.trim();
  if (!s.includes('[') && /^[A-Za-z]+\s+\d+$/.test(s)) return normalizeCourseCode(s);
  const first = s.match(/[A-Za-z]+\s+\d{3}/);
  return first ? normalizeCourseCode(first[0]) : s;
}

// Parse prereq_groups from CSV: [] = none; [[ "A","B" ], [ "C" ]] = (A or B) and (C). One course per bracket group required.
function parsePrereqGroups(prereqStr) {
  let s = (prereqStr || '').trim();
  if (!s || s === '[]' || s === '[[]]' || /^\[\s*\]\s*$/.test(s)) return [];
  s = s.replace(/""/g, '"');
  let inner = s.replace(/^\s*\[\s*\[\s*/, '').replace(/\s*\]\s*\]\s*$/, '');
  if (!inner) return [];
  const groups = [];
  const parts = inner.split(/\]\s*,\s*\[/);
  for (const part of parts) {
    const raw = part.trim().replace(/^\s*\[?|\]?\s*$/g, '');
    const codes = raw.split(',').map(c => normalizeCourseCode(c.trim().replace(/^["']|["']$/g, ''))).filter(Boolean);
    const valid = codes.filter(c => /^[A-Za-z]+\s+\d+$/.test(c));
    if (valid.length > 0) groups.push(valid);
  }
  return groups;
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
      if (i === 0 && (cols[0] || '').toLowerCase().startsWith('course')) continue;
      const courseRaw = (cols[0] || '').trim();
      if (!courseRaw) continue;

      const course = normalizeCourseCode(courseRaw);
      const prereqStr = (cols[1] || '').trim();
      if (/^varies$/i.test(prereqStr)) continue;

      const groups = parsePrereqGroups(prereqStr);
      if (groups.length > 0) PREREQ_MAP[course] = groups;
    }

    PREREQS_LOADED = true;
  } catch (err) {
    console.error('Failed to load prerequisites', err);
  }
}

async function loadCourseCatalog() {
  try {
    const res = await fetch('course-catalog.csv');
    if (!res.ok) return;
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    for (let i = 0; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (i === 0 && (cols[3] || '').toLowerCase() === 'subject') continue;
      const subject = (cols[3] || '').trim();
      const number = (cols[4] || '').trim();
      const name = (cols[5] || '').trim().replace(/&amp;/g, '&');
      if (!subject || !number || !name) continue;
      const code = `${subject.toUpperCase()} ${number}`;
      if (!COURSE_CATALOG_NAMES[code]) COURSE_CATALOG_NAMES[code] = name;
    }
  } catch (err) {
    console.error('Failed to load course catalog', err);
  }
}

// Tech electives by category (from tech_electives.csv): category -> [course codes]
let TECH_ELECTIVES_BY_CATEGORY = {};
let TECH_ELECTIVE_CATEGORIES = [];

async function loadTechElectives() {
  try {
    const res = await fetch('tech_electives.csv');
    if (!res.ok) return;
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const byCategory = {};
    const categoriesSet = new Set();
    for (let i = 0; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      const course = (cols[0] || '').trim();
      const category = (cols[1] || '').trim();
      if (i === 0 && (course.toLowerCase() === 'course' || category.toLowerCase() === 'category')) continue;
      if (!course || !category) continue;
      const code = normalizeCourseCode(course);
      if (!byCategory[category]) byCategory[category] = [];
      byCategory[category].push(code);
      categoriesSet.add(category);
    }
    TECH_ELECTIVES_BY_CATEGORY = byCategory;
    TECH_ELECTIVE_CATEGORIES = Array.from(categoriesSet).sort();
  } catch (err) {
    console.error('Failed to load tech electives', err);
  }
}

function initTechElectivesUI() {
  const sel = document.getElementById('tech-category-select');
  const listEl = document.getElementById('tech-electives-list');
  if (!sel || !listEl) return;
  const categories = Array.isArray(TECH_ELECTIVE_CATEGORIES) ? TECH_ELECTIVE_CATEGORIES : [];
  sel.innerHTML = categories.map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('');
  sel.addEventListener('change', renderTechElectivesList);
  renderTechElectivesList();

  const addTechnicalsBtn = document.getElementById('add-technicals-btn');
  if (addTechnicalsBtn) {
    addTechnicalsBtn.addEventListener('click', fillTechnicalElectivesFromCategories);
  }
  const addAdvancedBtn = document.getElementById('add-advanced-btn');
  if (addAdvancedBtn) {
    addAdvancedBtn.addEventListener('click', fillAdvancedElectivesFromCategories);
  }
}

function fillTechnicalElectivesFromCategories() {
  const sel = document.getElementById('tech-category-select');
  if (!sel) return;
  const selectedCategories = Array.from(sel.selectedOptions || []).map(opt => opt.value);
  if (selectedCategories.length === 0) {
    showAlertModal('Select at least one category above, then click Add technicals.');
    return;
  }

  const byCategory = TECH_ELECTIVES_BY_CATEGORY || {};
  const pool = [];
  const seen = new Set();
  selectedCategories.forEach(cat => {
    (byCategory[cat] || []).forEach(code => {
      if (!seen.has(code)) {
        seen.add(code);
        pool.push(code);
      }
    });
  });
  if (pool.length === 0) {
    showAlertModal('No courses in selected categories.');
    return;
  }

  const usedInPlan = new Set();
  for (let s = 0; s < plan.length; s++) {
    (plan[s] || []).forEach(c => {
      if (c.code !== 'CS Technical elective') usedInPlan.add(c.code);
    });
  }

  for (let semIdx = 0; semIdx < plan.length; semIdx++) {
    const sem = plan[semIdx];
    if (!Array.isArray(sem)) continue;
    let semHours = sem.reduce((sum, c) => sum + (c.hours ?? getHours(c.code)), 0);

    for (let j = 0; j < sem.length; j++) {
      if (sem[j].code !== 'CS Technical elective') continue;

      const taken = getCoursesBeforeSemester(semIdx);
      const candidates = pool.filter(code => {
        if (usedInPlan.has(code)) return false;
        if (!prereqsSatisfied(code, semIdx)) return false;
        const newHours = semHours - 3 + getHours(code);
        if (newHours > MAX_HOURS_PER_SEMESTER) return false;
        return true;
      });

      if (candidates.length === 0) continue;
      const chosen = candidates[0];
      const hours = getHours(chosen);
      plan[semIdx][j] = { code: chosen, hours };
      usedInPlan.add(chosen);
      semHours = semHours - 3 + hours;
    }
  }

  renderSemesters();
  updateProgress();
  savePlan();
}

function fillAdvancedElectivesFromCategories() {
  const sel = document.getElementById('tech-category-select');
  if (!sel) return;
  const selectedCategories = Array.from(sel.selectedOptions || []).map(opt => opt.value);
  if (selectedCategories.length === 0) {
    showAlertModal('Select at least one category above, then click Add advanced.');
    return;
  }

  const byCategory = TECH_ELECTIVES_BY_CATEGORY || {};
  const pool = [];
  const seen = new Set();
  selectedCategories.forEach(cat => {
    (byCategory[cat] || []).forEach(code => {
      if (!seen.has(code)) {
        seen.add(code);
        pool.push(code);
      }
    });
  });
  if (pool.length === 0) {
    showAlertModal('No courses in selected categories.');
    return;
  }

  const usedInPlan = new Set();
  for (let s = 0; s < plan.length; s++) {
    (plan[s] || []).forEach(c => {
      if (c.code !== 'CS Advanced elective') usedInPlan.add(c.code);
    });
  }

  for (let semIdx = 0; semIdx < plan.length; semIdx++) {
    const sem = plan[semIdx];
    if (!Array.isArray(sem)) continue;
    let semHours = sem.reduce((sum, c) => sum + (c.hours ?? getHours(c.code)), 0);

    for (let j = 0; j < sem.length; j++) {
      if (sem[j].code !== 'CS Advanced elective') continue;

      const candidates = pool.filter(code => {
        if (usedInPlan.has(code)) return false;
        if (!prereqsSatisfied(code, semIdx)) return false;
        const newHours = semHours - 3 + getHours(code);
        if (newHours > MAX_HOURS_PER_SEMESTER) return false;
        return true;
      });

      if (candidates.length === 0) continue;
      const chosen = candidates[0];
      const hours = getHours(chosen);
      plan[semIdx][j] = { code: chosen, hours };
      usedInPlan.add(chosen);
      semHours = semHours - 3 + hours;
    }
  }

  renderSemesters();
  updateProgress();
  savePlan();
}

function renderTechElectivesList() {
  const sel = document.getElementById('tech-category-select');
  const listEl = document.getElementById('tech-electives-list');
  if (!sel || !listEl) return;
  const selected = Array.from(sel.selectedOptions || []).map(opt => opt.value);
  if (selected.length === 0) {
    listEl.innerHTML = '<p class="tech-electives-empty">Select one or more categories above (Ctrl+Click for multiple).</p>';
    return;
  }
  const nameLookup = typeof CS_ELECTIVE_NAMES !== 'undefined' ? CS_ELECTIVE_NAMES : {};
  const byCategory = TECH_ELECTIVES_BY_CATEGORY || {};
  let html = '';
  selected.forEach(category => {
    const courses = byCategory[category] || [];
    if (courses.length === 0) return;
    html += `<div class="tech-electives-category-block"><h4 class="tech-electives-category-title">${escapeHtml(category)}</h4><ul class="tech-electives-course-list">`;
    courses.forEach(code => {
      const name = nameLookup[code] || (typeof COURSE_CATALOG_NAMES !== 'undefined' && COURSE_CATALOG_NAMES[code]) || code;
      html += `<li><strong>${escapeHtml(code)}</strong> ${escapeHtml(name)}</li>`;
    });
    html += '</ul></div>';
  });
  listEl.innerHTML = html || '<p class="tech-electives-empty">No courses in selected categories.</p>';
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

let CORE_CODES = new Set();
let MATH_SCIENCE_CODES = new Set();
let ORIENT_CODES = new Set(['ENG 100', 'CS 210', 'CS 211']);
let ALL_COURSES = [];
let COURSE_BY_CODE = {};
// Course name lookup from course-catalog.csv (Subject + Number -> Name)
let COURSE_CATALOG_NAMES = {};

function rebuildCourseData() {
  if (!currentMajor) return;
  CORE_CODES = new Set(currentMajor.coreCourses.map(c => c.code));
  MATH_SCIENCE_CODES = new Set((currentMajor.mathScience || []).map(c => c.code === 'Science elective' ? 'Science elective' : c.code));
  const mathScienceList = (currentMajor.mathScience || []).filter(c => c.code !== 'Science elective');
  ALL_COURSES = [
    ...currentMajor.coreCourses,
    ...mathScienceList,
    { code: 'Science elective', name: 'Science elective (NST list)', hours: 3 },
    ...(currentMajor.orientation || []),
    ...(currentMajor.xRequiredCourses || []),
  ];
  if (currentMajor.hasTechnicalElectives && currentMajor.technicalElectives) {
    ALL_COURSES.push(...currentMajor.technicalElectives.map(code => ({ code, name: (typeof CS_ELECTIVE_NAMES !== 'undefined' && CS_ELECTIVE_NAMES[code]) || code, hours: 3 })));
  }
  ALL_COURSES.push(
    { code: 'Free elective', name: 'Free elective', hours: 3 },
    { code: 'Gen Ed', name: 'General Education', hours: 3 },
    { code: 'Composition I', name: 'Composition I', hours: 4 },
    { code: 'Language', name: 'Language (3rd level)', hours: 4 },
    { code: 'CS Technical elective', name: 'CS Technical Elective (choose from list)', hours: 3 },
    { code: 'CS Advanced elective', name: 'CS Advanced Elective (choose from list)', hours: 3 }
  );
  COURSE_BY_CODE = {};
  ALL_COURSES.forEach(c => { COURSE_BY_CODE[c.code] = c; });
}

// Hours for CS tech electives (default 3)
function getHours(courseCode) {
  const c = COURSE_BY_CODE[courseCode];
  if (c) return c.hours;
  if (typeof courseCode === 'string' && courseCode.startsWith('Gen Ed')) return 3;
  if (courseCode === 'CS Technical elective' || courseCode === 'CS Advanced elective') return 3;
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
  const list = currentMajor && currentMajor.teamProjectCourses ? currentMajor.teamProjectCourses : [];
  return list.includes(code);
}

function getCourseUrl(code) {
  if (!code || typeof code !== 'string') return null;
  const trimmed = ensureCourseCode(code);
  if (!trimmed) return null;
  const match = trimmed.match(/^([A-Za-z]+)\s*(\d+)$/);
  if (!match) return null;
  const subjectLower = match[1].toLowerCase();
  const num = match[2];
  return `https://catalog.illinois.edu/courses-of-instruction/${subjectLower}/#${subjectLower}${num}`;
}

function getCourseDisplayName(code) {
  const c = ensureCourseCode(code);
  const raw = COURSE_CATALOG_NAMES[c] || (COURSE_BY_CODE[c] && COURSE_BY_CODE[c].name) || '';
  if (!raw) return '';
  // Strip parenthetical substitution notes for display (e.g. " (MATH 220 may substitute)")
  return raw.replace(/\s*\([^)]*may substitute[^)]*\)\s*$/i, '').trim();
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

// When user deletes a course, store here so replan can put it in the next semester after where it was deleted
let lastDeleted = null;

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

// Postrequisites: for each course A, list of courses B that have A as a prerequisite
function buildPostreqMap() {
  const postreq = {};
  for (const course of Object.keys(PREREQ_MAP)) {
    const groups = PREREQ_MAP[course];
    for (const grp of groups) {
      for (const p of grp) {
        if (!postreq[p]) postreq[p] = [];
        if (!postreq[p].includes(course)) postreq[p].push(course);
      }
    }
  }
  return postreq;
}

const MAX_HOURS_PER_SEMESTER = 18;
const MIN_HOURS_PER_SEMESTER = 12;
const MIN_SEMESTERS = 8;

const FILLER_COURSE = { code: 'Free elective', hours: 3 };

/** Ensure each semester has at least MIN_HOURS_PER_SEMESTER and total plan hours >= major total. */
function ensurePlanMeetsMinAndTotalHours(planArray) {
  if (!currentMajor || !Array.isArray(planArray)) return;
  const targetTotal = typeof currentMajor.totalHours === 'number' ? currentMajor.totalHours : 128;
  const numSems = Math.max(planArray.length, MIN_SEMESTERS);
  while (planArray.length < numSems) planArray.push([]);

  function semHours(semIndex) {
    return (planArray[semIndex] || []).reduce((sum, c) => sum + (c.hours ?? getHours(c.code)), 0);
  }
  function totalHours() {
    let t = 0;
    for (let i = 0; i < planArray.length; i++) t += semHours(i);
    return t;
  }

  for (let s = 0; s < numSems; s++) {
    while (semHours(s) < MIN_HOURS_PER_SEMESTER) {
      planArray[s].push({ ...FILLER_COURSE });
    }
  }
  while (totalHours() < targetTotal) {
    let added = false;
    for (let s = 0; s < numSems && totalHours() < targetTotal; s++) {
      if (semHours(s) < MAX_HOURS_PER_SEMESTER) {
        planArray[s].push({ ...FILLER_COURSE });
        added = true;
        break;
      }
    }
    if (!added) break;
  }
}

/**
 * Replan schedule: only move (1) inserted missing prereqs and (2) their postrequisites.
 * Put inserted prereqs in the next semester (e.g. Spring Y1); place postrequisites after them.
 * All other courses stay exactly where they are.
 */
function replanSchedule() {
  const postreqMap = buildPostreqMap();

  // Flatten plan: list of { code, hours, currentSem }
  const all = [];
  for (let s = 0; s < plan.length; s++) {
    (plan[s] || []).forEach(c => {
      const code = ensureCourseCode(c.code);
      all.push({ code, hours: c.hours ?? getHours(code), currentSem: s });
    });
  }

  const codesInPlan = new Set(all.map(x => x.code));

  // 1) Find missing prerequisites (insert these in "next semester")
  const missing = new Set();
  for (const { code } of all) {
    const groups = PREREQ_MAP[code];
    if (!groups) continue;
    for (const grp of groups) {
      if (grp.some(p => codesInPlan.has(p))) continue;
      if (grp.length > 0) missing.add(ensureCourseCode(grp[0]));
    }
  }
  let changed;
  do {
    changed = false;
    for (const code of missing) {
      const groups = PREREQ_MAP[code];
      if (!groups) continue;
      for (const grp of groups) {
        const hasFromGroup = grp.some(p => codesInPlan.has(p) || missing.has(p));
        if (!hasFromGroup && grp.length > 0) {
          const toAdd = ensureCourseCode(grp[0]);
          if (!missing.has(toAdd)) {
            missing.add(toAdd);
            changed = true;
          }
        }
      }
    }
  } while (changed);

  // 2) Inserted = missing prereqs not already in plan. Affected = inserted + transitive postrequisites (in plan)
  const inserted = new Set();
  for (const code of missing) {
    const safe = ensureCourseCode(code);
    if (all.some(x => x.code === safe)) continue;
    inserted.add(safe);
  }
  const affected = new Set(inserted);
  do {
    changed = false;
    for (const code of [...affected]) {
      for (const d of postreqMap[code] || []) {
        if (!codesInPlan.has(d) || affected.has(d)) continue;
        affected.add(d);
        changed = true;
      }
    }
  } while (changed);
  for (const code of inserted) {
    all.push({ code, hours: getHours(code), currentSem: -1 });
  }

  const fixed = all.filter(x => !affected.has(x.code));
  const affectedList = all.filter(x => affected.has(x.code));

  if (affectedList.length === 0) {
    ensurePlanMeetsMinAndTotalHours(plan);
    return;
  }

  const codeToSem = {};
  fixed.forEach(({ code, currentSem }) => { codeToSem[code] = currentSem; });

  const fixedHours = {};
  fixed.forEach(({ code, hours, currentSem }) => {
    const h = hours ?? getHours(code);
    fixedHours[currentSem] = (fixedHours[currentSem] || 0) + h;
  });

  const numSems = Math.max(plan.length, MIN_SEMESTERS);
  for (let i = 0; i < numSems; i++) if (fixedHours[i] === undefined) fixedHours[i] = 0;

  function semForPrereq(p) {
    return codeToSem[p];
  }

  const nextSemAfterDeleted = (lastDeleted && lastDeleted.code) ? lastDeleted.fromSem + 1 : 1;

  function earliestSem(code, assignmentSoFar) {
    if (inserted.has(code)) return (lastDeleted && lastDeleted.code === code) ? nextSemAfterDeleted : 1;
    const groups = PREREQ_MAP[code];
    if (!groups || groups.length === 0) return 0;
    let e = 0;
    for (const grp of groups) {
      const sems = grp
        .filter(p => codeToSem.hasOwnProperty(p) || assignmentSoFar.hasOwnProperty(p))
        .map(p => assignmentSoFar.hasOwnProperty(p) ? assignmentSoFar[p] : semForPrereq(p));
      if (sems.length === 0) continue;
      e = Math.max(e, Math.min(...sems) + 1);
    }
    return e;
  }

  const order = [];
  const visited = new Set();
  function visit(code) {
    if (visited.has(code)) return;
    visited.add(code);
    const groups = PREREQ_MAP[code];
    if (groups) {
      for (const grp of groups) {
        for (const p of grp) {
          if (affected.has(p)) visit(p);
        }
      }
    }
    order.push(code);
  }
  affectedList.forEach(({ code }) => visit(code));

  const hoursPerCode = {};
  affectedList.forEach(({ code, hours }) => {
    const h = hours ?? getHours(code);
    hoursPerCode[code] = (hoursPerCode[code] || 0) + h;
  });

  const assignment = {};
  const affectedHoursInSem = {};

  for (const code of order) {
    const totalHours = hoursPerCode[code] || getHours(code);
    const earliest = earliestSem(code, assignment);
    let s = earliest;
    while ((fixedHours[s] || 0) + (affectedHoursInSem[s] || 0) + totalHours > MAX_HOURS_PER_SEMESTER) s++;
    assignment[code] = s;
    affectedHoursInSem[s] = (affectedHoursInSem[s] || 0) + totalHours;
  }

  const newPlan = [];
  for (let i = 0; i < numSems; i++) {
    newPlan[i] = fixed.filter(x => x.currentSem === i).map(({ code, hours }) => {
      const safe = ensureCourseCode(code);
      return { code: safe, hours: hours ?? getHours(safe) };
    });
  }
  const maxAssigned = Math.max(0, ...Object.values(assignment));
  while (newPlan.length <= maxAssigned) newPlan.push([]);
  affectedList.forEach(({ code, hours }) => {
    const s = assignment[code];
    if (typeof s === 'number') newPlan[s].push({ code, hours: hours ?? getHours(code) });
  });

  plan.length = 0;
  for (let i = 0; i < newPlan.length; i++) plan.push(newPlan[i]);
  ensurePlanMeetsMinAndTotalHours(plan);
  lastDeleted = null;
}

function loadPlan() {
  try {
    const key = getPlanStorageKey();
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 8) {
        plan = parsed.map(sem => Array.isArray(sem) ? sem.map(c => {
          const code = ensureCourseCode(typeof c === 'string' ? c : (c && c.code));
          return { code, hours: (c && c.hours) ?? getHours(code) };
        }) : []);
      }
    }
    const settingsRaw = localStorage.getItem(SETTINGS_KEY);
    const maxSem = (Array.isArray(plan) && plan.length) ? plan.length - 1 : 7;
    if (settingsRaw) {
      const s = JSON.parse(settingsRaw);
      if (typeof s.currentSemesterIndex === 'number' && s.currentSemesterIndex >= 0 && s.currentSemesterIndex <= maxSem) {
        currentSemesterIndex = s.currentSemesterIndex;
      }
      if (Array.isArray(s.unlockedPastSemesters)) {
        unlockedPastSemesters = s.unlockedPastSemesters.filter(i => typeof i === 'number' && i >= 0 && i <= maxSem);
      }
    }
  } catch (_) {}
}

function setCurrentMajor(majorId) {
  const found = typeof MAJORS !== 'undefined' && MAJORS.find(m => m.id === majorId);
  if (!found) return;
  currentMajorId = majorId;
  currentMajor = found;
  try {
    localStorage.setItem(MAJOR_STORAGE_KEY, currentMajorId);
  } catch (_) {}
  rebuildCourseData();
  updateMajorUI();
}

function savePlan() {
  localStorage.setItem(getPlanStorageKey(), JSON.stringify(plan));
}

function updateMajorUI() {
  const sub = document.getElementById('subtitle-hours');
  const catalogLink = document.getElementById('catalog-link');
  const reqLink = document.getElementById('degree-req-link');
  const sampleLink = document.getElementById('sample-seq-link');
  if (sub && currentMajor) sub.textContent = currentMajor.totalHours;
  const base = (currentMajor && currentMajor.catalogUrl) ? currentMajor.catalogUrl.replace(/\/$/, '') : '';
  if (catalogLink) { catalogLink.href = base || 'https://catalog.illinois.edu/'; catalogLink.textContent = 'Catalog'; }
  if (reqLink) { reqLink.href = base ? base + '/#degreerequirementstext' : '#'; }
  if (sampleLink) { sampleLink.href = base ? base + '/#samplesequencetext' : '#'; }
  const totalLabel = document.getElementById('total-hours-label');
  const coreLabel = document.getElementById('core-done-label');
  const xStat = document.getElementById('stat-x');
  const xDoneLabel = document.getElementById('x-done-label');
  if (totalLabel && currentMajor) totalLabel.textContent = '/ ' + currentMajor.totalHours + ' hrs';
  if (coreLabel && currentMajor) coreLabel.textContent = '/ ' + currentMajor.coreCourses.length + ' core';
  const hasX = currentMajor && currentMajor.xRequiredCourses && currentMajor.xRequiredCourses.length > 0;
  if (xStat) xStat.style.display = hasX ? '' : 'none';
  if (xDoneLabel && currentMajor && hasX) xDoneLabel.textContent = '/ ' + currentMajor.xRequiredCourses.length + ' X required';
  const techStat = document.getElementById('stat-tech');
  const techHrsStat = document.getElementById('stat-tech-hrs');
  const advStat = document.getElementById('stat-adv');
  const showTech = currentMajor && currentMajor.hasTechnicalElectives;
  if (techStat) techStat.style.display = showTech ? '' : 'none';
  if (techHrsStat) techHrsStat.style.display = showTech ? '' : 'none';
  if (advStat) advStat.style.display = (currentMajor && currentMajor.hasAdvancedElectives) ? '' : 'none';
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
      const noNameCodes = ['Free elective', 'Science elective', 'Composition I', 'Language'];
      const skipName = noNameCodes.includes(code) || (typeof code === 'string' && code.startsWith('Gen Ed'));
      const name = skipName ? '' : getCourseDisplayName(code);
      const label = name ? `${code} - ${name}` : code;
      const hrs = c.hours ?? getHours(code);
      const tooltipText = getPrereqTooltip(code, i);
      const removeBtn = locked
        ? ''
        : `<button type="button" class="remove" aria-label="Remove">×</button>`;
      const courseUrl = getCourseUrl(code);
      const codeDisplay = courseUrl
        ? `<a href="${courseUrl}" class="course-chip-link" target="_blank" rel="noopener">${escapeAttr(label)}</a>`
        : `<span>${escapeAttr(label)}</span>`;
      const draggableAttr = locked ? '' : ' draggable="true"';

      return `
        <div class="course-chip" data-sem="${i}" data-idx="${j}" data-prereq-tooltip="${escapeAttr(tooltipText)}"${draggableAttr}>
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
        <div class="semester-courses" data-semester="${i}">
          ${chips || '<span class="text-muted">No courses</span>'}
        </div>
      </div>
    `;
  }

  const numYears = Math.ceil(Math.max(plan.length, 8) / 2);
  let html = '';
  for (let year = 0; year < numYears; year++) {
    const fallIdx = year * 2;
    const springIdx = fallIdx + 1;
    const fallCourses = fallIdx < plan.length ? (plan[fallIdx] || []) : [];
    const springCourses = springIdx < plan.length ? (plan[springIdx] || []) : [];

    html += `
      <div class="year-row">
        ${semesterHTML(fallCourses, fallIdx)}
        ${semesterHTML(springCourses, springIdx)}
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
      const removed = (plan[sem] || [])[idx];
      if (removed) lastDeleted = { code: removed.code, fromSem: sem };
      plan[sem].splice(idx, 1);
      renderSemesters();
      updateProgress();
      savePlan();
    });
  });

  // Drag and drop: move course from one semester to another
  container.querySelectorAll('.course-chip[draggable="true"]').forEach(chip => {
    chip.addEventListener('dragstart', (e) => {
      const sem = Number(chip.dataset.sem);
      const idx = Number(chip.dataset.idx);
      if (isSemesterLocked(sem)) return;
      e.dataTransfer.setData('application/json', JSON.stringify({ sem, idx }));
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', chip.textContent.trim());
      chip.classList.add('dragging');
    });
    chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
  });

  container.querySelectorAll('.semester-courses').forEach(zone => {
    const targetSem = Number(zone.dataset.semester);
    zone.addEventListener('dragenter', (e) => {
      e.preventDefault();
      if (e.dataTransfer.types.includes('application/json')) zone.classList.add('drag-over');
    });
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    zone.addEventListener('dragleave', (e) => {
      if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
    });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      let payload;
      try {
        payload = JSON.parse(raw);
      } catch (_) {
        return;
      }
      const srcSem = payload.sem;
      const srcIdx = payload.idx;
      if (typeof srcSem !== 'number' || typeof srcIdx !== 'number' || isSemesterLocked(srcSem) || isSemesterLocked(targetSem)) return;
      if (srcSem === targetSem) return;
      const course = (plan[srcSem] || [])[srcIdx];
      if (!course) return;
      while (plan.length <= targetSem) plan.push([]);
      if (!Array.isArray(plan[targetSem])) plan[targetSem] = [];
      plan[srcSem].splice(srcIdx, 1);
      plan[targetSem].push(course);
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
      updateProgress();
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
        updateProgress();
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
  // Hour count = semesters 0 through current (completed + current). Uses currentSemesterIndex when set.
  const maxPlanIdx = Math.max((plan && plan.length) ? plan.length - 1 : 7, 0);
  const lastIdx = typeof currentSemesterIndex === 'number' && currentSemesterIndex >= 0
    ? Math.min(currentSemesterIndex, maxPlanIdx)
    : maxPlanIdx;
  const coursesForProgress = [];
  for (let i = 0; i <= lastIdx && i < (plan && plan.length); i++) {
    const sem = plan[i];
    if (Array.isArray(sem)) coursesForProgress.push(...sem);
  }
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
  const xCodes = (currentMajor && currentMajor.xRequiredCourses) ? currentMajor.xRequiredCourses.map(c => c.code) : [];
  const xDone = xCodes.length ? allCourses.filter(c => xCodes.includes(c)).length : 0;

  document.getElementById('total-hours').textContent = totalHours;
  document.getElementById('core-done').textContent = coreDone;
  const requiredHrs = (currentMajor && typeof currentMajor.totalHours === 'number') ? currentMajor.totalHours : 128;
  const pct = requiredHrs > 0 ? Math.min(100, Math.round((totalHours / requiredHrs) * 100)) : 0;
  const pieEl = document.getElementById('progress-pie');
  const pctEl = document.getElementById('progress-pie-pct');
  if (pieEl) pieEl.style.setProperty('--pct', pct + '%');
  if (pctEl) pctEl.textContent = pct + '%';
  const tcEl = document.getElementById('tech-elective-count');
  const thEl = document.getElementById('tech-elective-hrs');
  const advEl = document.getElementById('adv-elective-count');
  const xEl = document.getElementById('x-done');
  if (tcEl) tcEl.textContent = techCount;
  if (thEl) thEl.textContent = techHours;
  if (advEl) advEl.textContent = advCount;
  if (xEl) xEl.textContent = xDone;
}

function escapeHtml(str) {
  if (str == null || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function populateDropdowns() {
  const dataList = document.getElementById('course-options');
  if (!dataList) return;
  dataList.innerHTML = (ALL_COURSES || []).map(c =>
    `<option value="${escapeHtml(c.code)}">${escapeHtml(c.code)} — ${escapeHtml(c.name)}</option>`
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

  const replanBtn = document.getElementById('replan-schedule-btn');
  if (replanBtn) {
    replanBtn.addEventListener('click', () => {
      replanSchedule();
      populateDropdowns();
      renderSemesters();
      updateProgress();
      savePlan();
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
  if (!currentMajor) return;
  const coreEl = document.getElementById('req-core');
  const mathEl = document.getElementById('req-math');
  const orientEl = document.getElementById('req-orient');
  const teamEl = document.getElementById('req-team');
  const xReqEl = document.getElementById('req-x');
  const xElectiveEl = document.getElementById('req-x-elective');
  if (coreEl) coreEl.innerHTML = currentMajor.coreCourses.map(c => `<li><strong>${c.code}</strong> ${c.name} (${c.hours}h)</li>`).join('');
  if (mathEl) mathEl.innerHTML = (currentMajor.mathScience || []).map(c => `<li><strong>${c.code}</strong> ${c.name} (${c.hours}h)</li>`).join('');
  if (orientEl) orientEl.innerHTML = (currentMajor.orientation || []).map(c => `<li><strong>${c.code}</strong> ${c.name} (${c.hours}h)</li>`).join('');
  if (teamEl) {
    const list = currentMajor.teamProjectCourses || [];
    teamEl.innerHTML = list.map(code => {
      const name = (typeof CS_ELECTIVE_NAMES !== 'undefined' && CS_ELECTIVE_NAMES[code]) || code;
      return `<li><strong>${code}</strong> ${name}</li>`;
    }).join('');
    teamEl.closest('.req-section').style.display = list.length ? '' : 'none';
  }
  const xSection = document.getElementById('req-section-x');
  const xElectiveSection = document.getElementById('req-section-x-elective');
  const xElectiveTextEl = document.getElementById('req-x-elective-text');
  if (xReqEl && currentMajor.xRequiredCourses && currentMajor.xRequiredCourses.length > 0) {
    xReqEl.innerHTML = currentMajor.xRequiredCourses.map(c => `<li><strong>${c.code}</strong> ${c.name} (${c.hours}h)</li>`).join('');
    if (xSection) xSection.style.display = '';
  } else if (xSection) xSection.style.display = 'none';
  if (currentMajor.xElectiveText && xElectiveTextEl) {
    xElectiveTextEl.textContent = currentMajor.xElectiveText;
    if (xElectiveSection) xElectiveSection.style.display = '';
  } else if (xElectiveSection) xElectiveSection.style.display = 'none';
  const techSection = document.getElementById('req-section-tech');
  if (techSection) techSection.style.display = (currentMajor.hasTechnicalElectives) ? '' : 'none';
  const advSection = document.getElementById('req-section-adv');
  if (advSection) advSection.style.display = (currentMajor.hasAdvancedElectives) ? '' : 'none';
  const reqTotalHrs = document.getElementById('req-total-hrs');
  if (reqTotalHrs && currentMajor) reqTotalHrs.textContent = currentMajor.totalHours;
  const introCatalog = document.getElementById('req-intro-catalog');
  if (introCatalog && currentMajor && currentMajor.catalogUrl) introCatalog.href = currentMajor.catalogUrl.replace(/\/$/, '') + '/#degreerequirementstext';
}

function getSampleSequenceHTML() {
  const seq = (currentMajor && currentMajor.sampleSequence) || [];
  if (seq.length === 0) {
    const url = (currentMajor && currentMajor.catalogUrl) ? currentMajor.catalogUrl + '#samplesequencetext' : 'https://catalog.illinois.edu/';
    return `<p class="sample-no-sequence">No sample sequence in planner for this major. See the <a href="${url}" target="_blank" rel="noopener">catalog</a> for a suggested sequence.</p>`;
  }
  const years = [1, 2, 3, 4];
  const defaultFallHours = [16, 16, 16, 16];
  const defaultSpringHours = [15, 17, 16, 16];
  return years.map((year, yi) => {
    const fall = seq.find(s => s.year === year && s.semester === 'Fall');
    const spring = seq.find(s => s.year === year && s.semester === 'Spring');
    const fallCourses = (fall && fall.courses) ? fall.courses.map(c => `<div class="sample-course">${c}</div>`).join('') : '';
    const springCourses = (spring && spring.courses) ? spring.courses.map(c => `<div class="sample-course">${c}</div>`).join('') : '';
    const fallHrs = (fall && typeof fall.hours === 'number') ? fall.hours : (defaultFallHours[yi] || 0);
    const springHrs = (spring && typeof spring.hours === 'number') ? spring.hours : (defaultSpringHours[yi] || 0);
    return `
      <div class="sample-year">
        <h4 class="sample-year-title">Year ${year}</h4>
        <div class="sample-columns">
          <div class="sample-col sample-fall">
            <div class="sample-col-label">First Semester (Fall)</div>
            <div class="sample-courses-vertical">${fallCourses}</div>
            <div class="sample-hours">${fallHrs} hrs</div>
          </div>
          <div class="sample-col sample-spring">
            <div class="sample-col-label">Second Semester (Spring)</div>
            <div class="sample-courses-vertical">${springCourses}</div>
            <div class="sample-hours">${springHrs} hrs</div>
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

function populateMajorSelect() {
  const sel = document.getElementById('major-select');
  if (!sel || typeof MAJORS === 'undefined') return;
  sel.innerHTML = MAJORS.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  sel.value = currentMajorId;
  sel.addEventListener('change', () => {
    const id = sel.value;
    if (id === currentMajorId) return;
    setCurrentMajor(id);
    loadPlan();
    populateDropdowns();
    renderSemesters();
    updateProgress();
    renderRequirements();
    renderSampleSequence();
  });
}

async function init() {
  try {
    const savedMajor = localStorage.getItem(MAJOR_STORAGE_KEY);
    if (savedMajor && typeof MAJORS !== 'undefined' && MAJORS.some(m => m.id === savedMajor)) {
      currentMajorId = savedMajor;
    }
  } catch (_) {}
  if (typeof MAJORS !== 'undefined' && MAJORS.length > 0) {
    currentMajor = MAJORS.find(m => m.id === currentMajorId) || MAJORS[0];
    currentMajorId = currentMajor.id;
    rebuildCourseData();
  }
  await loadPrerequisites();
  await loadCourseCatalog();
  await loadTechElectives();
  populateMajorSelect();
  updateMajorUI();
  loadPlan();
  populateDropdowns();
  renderSemesters();
  updateProgress();
  renderRequirements();
  renderSampleSequence();
  initTechElectivesUI();
  bindButtons();
}

function loadSampleIntoPlan() {
  const seq = (currentMajor && currentMajor.sampleSequence) || [];
  if (seq.length === 0) {
    showAlertModal('No sample sequence available for this major. See the catalog for a suggested plan.');
    return;
  }
  plan = Array.from({ length: 8 }, () => []);

  seq.forEach(s => {
    const semIdx = (s.year - 1) * 2 + (s.semester === 'Fall' ? 0 : 1);

    s.courses.forEach(label => {
      const labelNorm = label.trim();
      const isTechPlaceholder = /CS Technical [Ee]lective/i.test(labelNorm);
      const isAdvPlaceholder = /CS Advanced [Ee]lective/i.test(labelNorm);
      const match = label.match(/[A-Z]+ \d{3}|Science elective|Free elective|Gen Ed|Composition I|Language|CS Technical [Ee]lective|CS Advanced [Ee]lective/i);
      if (!match && !isTechPlaceholder && !isAdvPlaceholder) return;

      let code;
      if (isTechPlaceholder) {
        code = 'CS Technical elective';
      } else if (isAdvPlaceholder) {
        code = 'CS Advanced elective';
      } else if (match[0] === 'Gen Ed' || (match && /Gen Ed/i.test(match[0]))) {
        code = label;
      } else {
        code = ensureCourseCode(match ? match[0] : label);
      }
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


