# Changelog

Record of changes made while modernising the skeleton plot pages (branch `revamp`).
Newest first.

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
