# Changelog

Record of changes made while modernising the skeleton plot pages (branch `revamp`).
Newest first.

## Step 3 — Restyle (University of Arizona brand)

### Lifelike core strips (`common.js`)
- The core strip is now drawn as a sanded wood core instead of flat yellow blocks with
  brown stripes, on every page that shows one (`SkeletonPlot19.htm`, `plotting.htm`,
  `relativescale.htm`):
  - Pale, creamy earlywood that varies slightly from ring to ring.
  - Latewood that darkens gradually out of the earlywood and ends at a **sharp ring boundary**,
    as in conifers. Narrow rings are mostly latewood, so they show as thin dark lines.
  - The three latewood darknesses (light/medium/dark) are kept, now as browns.
  - Fine grain texture along the core, cylinder shading (darker top and bottom edges),
    rounded ends and a soft shadow on a neutral mount (UA Cool Gray `#E2E9EB`, replacing cyan).
  - Pencil dots follow dendrochronology convention: one dot every 10th ring, two at multiples
    of 50, three at multiples of 100. Ring numbers stay below the core.
- **False rings now look like false rings:** the inner half of a split ring ends in a
  *diffuse* band that fades out instead of a sharp boundary, the visual cue dendrochronologists
  use. Previously a false ring looked identical to a true one. (`falseBoundary` flag set in
  `SkeletonPlot.js` `populateRings`.)
- Texture and colour variation come from a fixed hash, never `Math.random`, so drawing
  doesn't change the random sequence that generates the core, and redraws don't shimmer.
- The strip keeps its 40px height and core position (y 10–30), so page layouts and the
  `plotting.htm` pointer lines are unaffected.
- `sizeCanvas` caps the backing resolution so very long cores (400 rings at 3x) stay
  within browsers' 32,000px canvas limit.

### University of Arizona look for every page
- `crossdatestyle.css` rewritten. Colours and fonts come from Arizona Bootstrap 5.1.5
  (cdn.digital.arizona.edu):
  - Arizona Red `#AB0520` for links and the top bar, Arizona Blue `#0C234B` for headings and the
    footer, Chili `#8B0015` for link hover, Azurite `#1E5288`, Warm Gray `#F4EDE5` and
    Cool Gray `#E2E9EB` for accents.
  - The same font stack as UA sites: `proxima-nova, calibri, …system fonts`, with
    `proxima-nova-condensed` for the banner and site title. Proxima Nova is a licensed font,
    so it only shows where it's installed or loaded (e.g. through the university's Adobe Fonts
    kit); everywhere else Calibri or the system sans-serif is used.
  - Arizona Bootstrap itself is *not* loaded: its resets would disturb the widgets' fixed
    layouts, and a CDN dependency would break pages opened offline.
- Every page now has the same page shell (generated once by a script, then committed as
  plain HTML):
  - A red University of Arizona bar, then "Laboratory of Tree-Ring Research" and the site title
    "Crossdating Tree Rings Using Skeleton Plotting" linking to the introduction.
  - A Warm Gray bar with a collapsible **Contents** list of all 12 pages (current page bold)
    and "Page N of 12: Title".
  - Previous / Next buttons at the bottom, replacing the 15-link text footer.
  - An Arizona Blue footer: lab name, author, comments address, copyright.
- Footer contact details: kept the author, city and comments address; **dropped the 1998
  office phone and fax numbers**. Copyright now reads 1998–2026 (pages previously said
  1998, or 1999–2014).
- Responsive basics: `viewport` meta tag, images shrink to fit narrow screens, fluid headings.
- Obsolete markup replaced throughout: `<CENTER>` → `div.centered`, `<FONT COLOR>` →
  coloured `<span>` (colours kept because the text refers to "the blue line" etc.),
  `<U>` → `<strong>`, `&#150;` → `&ndash;`, `<BR>` after headings removed, commented-out
  `<APPLET>` tags removed, `GENERATOR` meta tags removed.
- `<em>` labels ("Note:", "Good idea:") are bold Arizona Blue instead of red.
- LTRR links point at `https://ltrr.arizona.edu/` (the old `http://www.` address redirects there).
- Fixed page titles: `SkeletonPlot19.htm` was titled "Relative Scale"; `absentfalse.htm`
  had a generic title.
- Introduction: the two split headings became one "Introduction" heading (the site title is
  now in the header), and the Java wording was updated: "This presentation has
  Java-language applets … you must have a Java-capable web browser" → "This presentation has
  interactive figures … they work in any up-to-date web browser, with a mouse or on a touch
  screen"; "Java applet" → "interactive exercise".
- Demo widgets (`plotting.htm`, `relativescale.htm`, `patternmatching.htm`, `absentfalse.htm`):
  Warm Gray panel instead of pale yellow, centred, and "Try Again" buttons styled as Arizona
  Blue buttons. Removed `input:focus { outline: none }` so keyboard focus is visible.

## Step 2 — Shared code, touch input, sharp rendering

### New shared files
- `common.js` defines one `Skel` object used by every widget page. It is a classic script
  (not an ES module) so pages still work when opened straight from disk (`file://`). It provides:
  - **Canvas sizing for high-DPI screens:** `sizeCanvas`, `initCanvas`, `width`, `height`.
    Canvases get `devicePixelRatio` times as many backing pixels while all drawing stays in CSS
    pixels, so lines and text are sharp on Retina/HiDPI displays.
  - **Drawing:** graph-paper grid, ring numbers, master chronology axes and year labels, index
    line plot, skeleton marks (bar, "b", absent, false), core strip, ring width and latewood colour.
  - **Pointer input:** `dragHoriz`, `onTap` and `position`, built on Pointer Events so mouse,
    touch and pen all work. Drags capture the pointer so they continue outside the element.
    Taps only count if the pointer is released without moving, so a swipe that scrolls the
    page doesn't draw a mark. Right-clicks are ignored.
- `common.css` adds the `interactive` class. On those canvases horizontal finger movement goes
  to the widget while vertical swipes still scroll the page, and text selection and the iOS
  long-press callout are suppressed.

### Pages converted
- `SkeletonPlot.js`, `PatternMatching.js`, `RingAnomalies.js`, `Plotting.js`, `MakeMarks.js`,
  `MoveCore.js` now call `Skel` instead of their own copies of the grid, core strip, mark
  drawing and drag code. Each page keeps its own ring generation, answer checking and drag limits.
- `SkeletonPlot19.htm`, `plotting.htm`, `relativescale.htm`, `patternmatching.htm` and
  `absentfalse.htm` load `common.js`/`common.css`, and their canvases use `onpointerdown`
  instead of `onmousedown`.
- Pointer positions come from `clientX` and the element's bounding box rather than `offsetX`/`offsetY`.
- Removed dead code: `dragHorizLimited` and an always-overridden bounds check in `MoveCore.js`,
  unused min/max tracking, a leftover `console.log`, and a ~90-line commented-out copy of the
  old core-generation code in `RingAnomalies.js` that still contained the bugs fixed in step 1.

### Behaviour changes
- Marks are drawn when the pointer is released (a tap), not when it is pressed.
- At 1x pixel density every page renders pixel-identical to before, except the small practice
  grid on `plotting.htm`, where dark grid lines are no longer overdrawn by light ones at
  crossings (49 pixels).

### Not yet changed
- Control-panel buttons, checkboxes and radios still use `onmousedown`. They work on touch
  screens (browsers send a compatibility mousedown on tap) and will be rebuilt in step 3.
- Canvases are not redrawn when the pixel density changes mid-session (for example, moving the
  window to another monitor). They pick it up on their next redraw.

## Step 1 — Stabilise

### Imported the rest of the site from the live server
- Copied the 7 pages missing from the repo from https://www.ltrr.arizona.edu/skeletonplot/:
  `applications.htm`, `exampleapplication.htm`, `findingdates.htm`, `introcrossdate.htm`,
  `masterchronology.htm`, `ringanomalies.htm`, `sensitivitycomplacency.htm`.
- Copied the 24 images those pages and the existing ones reference (21 `.gif`, 3 `.jpg`).
- Line endings normalised from CRLF to LF; content otherwise unchanged.
- Deliberately **not** imported: `SkeletonPlot18.htm` and `SkeletonPlot18.class`, the old
  Java applet version that no modern browser can run.

### Links point at the canvas version
- Every "try skeleton plotting for yourself" link and footer URL now points at
  `SkeletonPlot19.htm` instead of the applet page `SkeletonPlot18.htm`, matching the live site.

### HTML5 standards mode (all 12 pages)
- Replaced the `HTML 4.0 Transitional` doctype, which forced browsers into quirks mode, with
  `<!DOCTYPE html>`.
- Replaced the `iso-8859-1` content-type meta with `<meta charset="utf-8">` (all files are ASCII).
- Added `px` to unitless CSS lengths that only worked in quirks mode:
  `absentfalse.htm`, `patternmatching.htm`, `plotting.htm`, `relativescale.htm`,
  `SkeletonPlot19.htm`, `MakeMarks.css`, `MoveCore.css`, and `coreStrip.style.left` in `Plotting.js`.
- Visual result: interactive widgets render identically. Images alone in table cells gain a
  few pixels of space below them (standard-mode inline image baseline gap).

### Bug fixes in `SkeletonPlot.js`
- **Page freeze:** with *Absents* checked, a very narrow (< 0.06) first or last ring made the
  ring-generation `while` loop spin forever (about 4% of new cores). Those rings are now clamped.
- **Narrow-ring clamp typo:** `index[year+absents < 0.15]` → `index[year+absents] < 0.15`, so
  rings between 0.06 and 0.15 are widened to 0.15 as intended (thin rings on the core strip
  are now 4px rather than 3px).
- **False-ring placement:** the condition was missing `year <` and had a precedence error in
  the `% 10` test, so false rings could fall on the last ring or a numbered ring. Fixed.
- **Undo/redo:** actions now hold a reference to the mark itself instead of a copy, and undo
  removes that mark rather than the last one in the array. Drawing or erasing clears the redo
  history; *Restart a New Core* clears both histories.
- **Magnification drift:** marks are stored in graph units instead of pixels, so changing the
  graph magnification no longer accumulates rounding error.
