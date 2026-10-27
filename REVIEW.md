# Redesign v3 — review before publication

**Status:** Local review on `redesign-v3`. The brief requires Teja’s approval of the result and the new first-person copy before any production push. The live site remains on `main` until then.

## What changed

- A shorter, aligned hero brings Teja’s role and landscape portrait into view. Current Eliza work leads into three concise EY examples.
- Original personal photos have responsive versions and metadata removed; the design preserves the surrounding landscapes and makes the hobby photos legible on small screens.
- The project and academic archive layouts were simplified, and the chess puzzle remains optional. Existing archive links and the old `/projects.html` redirect are retained.
- A fresh 1200 × 630 social preview uses a browser rendering of the new homepage.

## Work gathered

- Photo assets: `34d75c3` (merged onto `redesign-v3`).
- Homepage: `fe80110`, merged at `5ca88f8`.
- Supporting pages and tests: `1c555cc`, merged at `e8876be`.
- Initial photo, homepage and supporting-page worktrees were verified clean and contained, then removed; their local branches were deleted.
- The consistency pass was in progress when this note was written. Check the integration branch log for its final commit and validation.

## Screenshots and photo options

The before captures show the live site; the after captures below show the homepage worktree after review refinements. All are local temporary files and may not persist indefinitely.

- Before: [desktop](/private/tmp/teja-redesign-before/live-1440-viewport.png), [mobile](/private/tmp/teja-redesign-before/live-390-viewport.png).
- After: [desktop full page](/private/tmp/teja-v3-home-1440-full-loaded.png), [mobile full page](/private/tmp/teja-v3-home-390-full-loaded.png). Additional captures are in `/private/tmp/teja-v3-home-{1024,768,320}-full-loaded.png`.
- Portrait crops: [full composition](/private/tmp/teja-redesign-before/portrait-full.jpg), [wide](/private/tmp/teja-redesign-before/portrait-wide.jpg), [closer](/private/tmp/teja-redesign-before/portrait-context.jpg). The implementation uses the full responsive source with a modest CSS crop; these options are for discussion.
- [Social preview](social-card.png).

## Validation and remaining review

The homepage and integrated site passed their browser test suites, including responsive overflow, automated accessibility checks, chess, navigation and archive behavior. Homepage photos were visually checked in Chrome at 1440, 1024, 768, 390 and 320 pixels. Confirm the final consistency pass and rerun integrated checks after the final merge.

Review [COPY-REVIEW.md](COPY-REVIEW.md) for all new homepage and project prose, the source of the claims, and unverified legacy archive content. The 20 archive descriptions—including the 93% figure—were retained from the old site and are not independently verified. Teja should review the new copy, photo presentation, and any claims flagged for confirmation. A final screenshot and interaction check should use the integrated branch, not the worker worktree.
