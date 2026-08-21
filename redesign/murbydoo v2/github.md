repo: cashmurb/murbydoo
branch: main

## Sync history
- 2026-08-20T06:24:22Z — built Home.dc.html homepage.

## Sync history
- 2026-08-20T06:39:51Z — initial homepage + inner pages restyle.

## Last sync
date: 2026-08-20T07:46:55Z

### Updated in this project
- Home.dc.html: pan-transition intro, exact brain-circuit graphic (paths lifted from home_2.svg), precise nav constellation lines, tweaks for accent/muted color + pan speed.
- NavHeader.dc.html: shared fixed nav bar (site name + Brain/Dump/WIPs/World constellation) used across all inner pages.
- Restyled inner pages to the black/white/#D96614 Kode Mono look, content kept, using NavHeader: About.dc.html, Projects.dc.html, Socials.dc.html, Takeaways.dc.html, Writing.dc.html, InProgress.dc.html.
- Takeaways.dc.html rebuilt to match Figma brain_page design: BRAIN watermark, carousel card pulling real content from repo's takeaways.html (6 courses, subtopics as subtitle, links to takeaways-*.html).
- New placeholder pages: WhatAmIDoing.dc.html, Avatar.dc.html ("coming soon").
- All homepage/nav links wired between these .dc.html files for in-tool review.

## Screen map
| Screen | Repo files |
|---|---|
| Home.dc.html | index.html |
| NavHeader.dc.html | (new — nav markup shared by about.html, projects.html, socials.html, takeaways.html, writing.html, inprogress.html) |
| About.dc.html | about.html |
| Projects.dc.html | projects.html |
| Socials.dc.html | socials.html |
| Takeaways.dc.html | takeaways.html |
| Writing.dc.html | writing.html |
| InProgress.dc.html | inprogress.html |
| WhatAmIDoing.dc.html | new page, no repo file yet |
| Avatar.dc.html | new page, no repo file yet |

## Next up
- User will copy this code into the repo themselves; when copying, rename links back to lowercase .html (e.g. About.dc.html -> about.html) to match repo conventions, and give WhatAmIDoing/Avatar real filenames.
- archive.html and the takeaways-*.html subpages not yet restyled (not directly reachable from the new home nav).

# Update log — content-file migration & Brain topic pages

## Content moved to data files
Page content (lists, articles, project cards, social links) now lives in plain `.js` files under `content/`, loaded at runtime instead of hardcoded in each page:

- `content/takeaways-entries.js` — Brain carousel entries
- `content/writing-articles.js` — Dump carousel articles
- `content/projects-data.js` — World project cards (by category: Code/Film/Photo)
- `content/inprogress-items.js` — WIPs carousel items
- `content/socials-data.js` — Socials envelope cards
- `content/topics/*.js` — one file per Brain sub-topic (neural-networks, dsa, numerical, cv, ml, rl)

Edit these files directly to change content — no page code changes needed. Pages updated to load from these files: `Takeaways.dc.html`, `Writing.dc.html`, `Projects.dc.html`, `InProgress.dc.html`, `Socials.dc.html`, and all 6 Brain topic pages.

## New Brain topic pages
Added a shared scrollable template, `BrainTopic.dc.html`, used by 6 new topic detail pages linked from the Brain (Takeaways) carousel:

- `TakeawaysNeuralNetworks.dc.html`
- `TakeawaysDSA.dc.html`
- `TakeawaysNumerical.dc.html`
- `TakeawaysCV.dc.html`
- `TakeawaysML.dc.html`
- `TakeawaysRL.dc.html`

Each shows the topic's title and a list of collapsible sections (orange triangle toggle, click to expand/collapse). Section body text is currently "Coming soon." placeholder — fill in real text via the matching `content/topics/*.js` file.

## Files to commit
`content/` (new folder, 11 files), `BrainTopic.dc.html` (new), `TakeawaysNeuralNetworks.dc.html`, `TakeawaysDSA.dc.html`, `TakeawaysNumerical.dc.html`, `TakeawaysCV.dc.html`, `TakeawaysML.dc.html`, `TakeawaysRL.dc.html` (new), `Takeaways.dc.html`, `Writing.dc.html`, `Projects.dc.html`, `InProgress.dc.html`, `Socials.dc.html` (modified).
