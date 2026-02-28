# UIUC CS Class Planner

Plan your **Computer Science BS** coursework at the University of Illinois Urbana-Champaign. Based on the [2025–2026 catalog](https://catalog.illinois.edu/undergraduate/engineering/computer-science-bs/#samplesequencetext).

## Features

- **My Plan** — Add courses to each semester (Year 1–4, Fall/Spring). Your plan is saved in the browser.
- **Progress** — Track total hours, core CS courses completed, technical electives (count and hours), and advanced electives.
- **Requirements** — View required core, math/science, and orientation courses.
- **Sample Sequence** — Reference the catalog’s sample 4-year sequence.

## Requirements (from catalog)

- **128 hours** total
- **Core CS** — 11 courses (35 hrs)
- **Technical electives** — At least 6 courses, 18+ hrs; one must be a team project course; three from one focus area
- **Advanced electives** — At least 2 courses, 6+ hrs (distinct from tech electives)
- **Math/Science** — Calculus I–III, linear algebra, PHYS 211/212, one science elective

Always confirm with your advisor and the [official catalog](https://catalog.illinois.edu/undergraduate/engineering/computer-science-bs/).

## Run locally

Open `index.html` in a browser (no server needed), or use a local server:

```bash
cd uiuc-cs-planner
python3 -m http.server 8000
# Open http://localhost:8000
```

Or with Node: `npx serve .`
