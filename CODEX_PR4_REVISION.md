# PR #4 Revision Requirements

Continue on the existing PR #4 branch. Do not create a new pull request and do not merge.

The current flow works, but the message content, point count, Scripture depth, dashboard path selection, and print output need improvement before merging.

## 1. Change message length logic

Do not force a traditional three-point sermon.

Use concise message movements/sections so a 30-minute message does not require roughly ten minutes on each point.

Initial section counts:

- 30 minutes: 6 message movements
- 45 minutes: 8 message movements
- 60 minutes: 10 message movements

Keep every movement editable and removable. Keep `Add Another Point` so pastors can expand further.

The movements should build a coherent progression rather than feel like unrelated filler. A useful progression may include opening tension, biblical truth, heart issue, practical response, encouragement, and closing challenge, but the exact progression should fit the selected topic and passage.

## 2. Add a generous Scripture bank

The selected main passage remains the anchor, but do not repeat it as every point's verse.

For every generated message, include an editable `Supporting Scriptures` or `Scripture Bank` section with at least:

- 30 minutes: 6 supporting references
- 45 minutes: 8 supporting references
- 60 minutes: 10 supporting references

These are in addition to the main passage.

Each message movement should use a relevant supporting reference from the bank when appropriate. References may be reused only when genuinely useful, but the app should provide variety. The pastor decides which references to keep, remove, or move.

Do not quote copyrighted Bible text in this preview. Show references only until licensed/public-domain verse retrieval is connected.

## 3. Deepen every message movement

Each movement must include editable fields for:

- meaningful topic-specific title
- supporting Scripture reference
- 2 to 4 talking-point bullets or subpoints
- fuller explanation
- distinct practical application
- illustration, story, example, or pastoral-connection prompt
- transition thought into the next movement when applicable

The introduction must include:

- opening hook
- pastoral tension/problem
- connection to the main passage
- central big idea
- transition into the first movement

The ending must include:

- concise recap
- call to response
- closing application
- prayer direction

Remove placeholder-quality wording including `preview sample`, `Let the big idea shape point 2`, generic repeated applications, lowercase `god`, doubled punctuation, and development instructions presented as sermon notes.

Keep the local-preview disclosure honest, but never insert preview wording into the sermon content.

## 4. Simplify the dashboard starting-path flow

The dashboard currently makes users select a card, click a separate `Start` button, arrive at the wizard, select the same path again, and click Continue. Remove that duplicate work.

In `DashboardStartPaths.tsx`:

- remove the individual `Start` button from every card
- keep card selection
- add one shared `Continue` button beneath the three cards
- clicking Continue navigates to the wizard with the selected path in the URL
- also pass or recognize a step/stage parameter so the wizard opens directly at `Message Details`, skipping the duplicate `Choose a starting path` stage

Example behavior:

- select `Develop My Message` on the dashboard
- click one `Continue` button
- arrive directly at the Develop message-details screen

When `/new-message` is opened directly from app navigation without a selected dashboard path, the normal starting-path stage may still appear.

## 5. Remove the redundant Surprise Me button

Remove the `Surprise Me.` button from the Explore Message Ideas details screen.

All theme and tone fields remain optional. Clicking the normal footer `Continue` button should generate directions from the selected options or produce varied general directions when the defaults/no direction are used.

Keep `Refresh Ideas` on the results screen because it serves a different purpose after ideas have already been shown.

Update the Explore copy so it does not instruct the user to click Surprise Me.

## 6. Create real print-only pulpit notes

Do not print the editable workspace as-is.

Create a dedicated print-only pulpit-notes component or equivalent print layout. The printed output must hide:

- app header and mobile Menu
- sidebar navigation
- local-preview warning
- input labels, input borders, and textarea resize handles
- Keep, Rewrite, Trash, and Add Another Point controls
- Back to Directions and Print Preview controls
- all editing-only elements

The printed output should contain:

- sermon title
- main passage
- big idea
- Scripture bank
- introduction notes
- numbered message movements
- supporting Scriptures
- talking-point bullets
- application
- illustration prompt
- transition
- closing recap
- call to response
- closing prayer
- tasteful blank space for handwritten notes

Use a compact, readable pulpit-notes layout. Avoid awkward point splitting where practical and remove blank final pages.

Add a small note near the Print Preview button explaining that browser-generated date, URL, and page headers can be removed by disabling `Headers and footers` in browser print settings.

## 7. Preserve existing working behavior

Preserve:

- single final `Create Message` button
- removal of placeholder modal
- localStorage draft saving and refresh restoration
- editable workspace
- Keep, Rewrite, Trash, and Add Another Point actions
- corrected `0 of 8` preview usage
- free idea browsing
- separate Explore, Develop, and Speak to This Week direction logic
- selected-card styling
- non-hovering Plan Preview panel
- current cream, teal, muted-gold, and serif visual system

Do not add Supabase, authentication, Stripe, OpenAI calls, Bible APIs, live news APIs, or backend storage in this revision.

## 8. Validation

Run:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

If build is blocked only by Google Fonts network access, report it separately.

Manually verify:

1. Dashboard has no per-card Start buttons.
2. Dashboard has one Continue button.
3. Dashboard Continue skips duplicate path selection.
4. Direct `/new-message` navigation can still show path selection.
5. Surprise Me is removed.
6. Explore Continue still generates varied directions.
7. 30/45/60 creates 6/8/10 movements.
8. 30/45/60 includes at least 6/8/10 supporting references beyond the main passage.
9. Movements contain bullets, explanations, applications, illustration prompts, and transitions.
10. No placeholder wording appears in sermon content.
11. Print output is a dedicated pulpit-note layout rather than editor fields.
12. No blank final print page appears.
13. Existing local saving and message creation still work.

Update the existing PR #4 and wait for visual review. Do not merge.