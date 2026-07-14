# Codex Task: Complete Issue #2

The previous Codex attempt was incorrect. It repeated the old preview-direction work instead of building the final message-creation flow.

Implement this task from the current `main` branch. Do not redo or expand the Explore/Develop/Speak-to-This-Week preview-direction logic unless a small integration change is required.

## 1. Fix the final wizard action

In `components/app-shell/NewMessageWizard.tsx`:

- Remove the separate `Create This Message` button inside the selected-direction review panel.
- Remove the placeholder `Next phase` modal.
- Remove the `modalOpen` state.
- Keep one right-side footer button only.
- On wizard steps before the final step, its label is `Continue`.
- On the final `Explore Directions` step, its label becomes `Create Message`.
- On the final step, it stays disabled until a sermon direction is selected.
- Do not leave a disabled `Continue` button visible beside another create button.

## 2. Build a real local-preview message workspace

Create a new App Router page at `/message-workspace` or another clear route.

When `Create Message` is clicked:

- create a local draft from the selected wizard data
- save it in browser local storage or session storage
- navigate to the message workspace
- survive a normal browser refresh

Transfer:

- starting path
- message mode
- selected direction title
- main Scripture
- big idea
- angle
- pastoral focus
- selected message length
- Bible translation
- Develop-path idea, optional passage, and desired response when applicable
- selected weekly concern when applicable

## 3. Workspace UI

The workspace must use the existing cream, teal, muted-gold, and serif visual system.

Include:

- editable message title
- editable main Scripture
- editable big idea
- summary of length, translation, message mode, and starting path
- editable introduction
- editable sermon-point cards
- editable application section
- editable closing prayer
- `Back to Directions`
- `Print Preview` using the browser print dialog
- an unobtrusive label that this is a local preview draft until AI generation and permanent saving are connected

## 4. Sermon-point cards

Each point card must include editable fields for:

- point title
- main verse
- short explanation
- application idea

Each card must provide:

- `Keep`
- `Rewrite`
- `Trash`

Also add `Add Another Point`.

`Rewrite` must use transparent local-preview behavior only. Do not pretend an AI call occurred.

Initial point count:

- 30 minutes = 3 points
- 45 minutes = 4 points
- 60 minutes = 5 points

Initial point content must relate to the selected direction, Scripture, big idea, and pastoral focus. Do not use unrelated generic filler.

## 5. Local saving

- Autosave edits to browser storage.
- Reloading the workspace restores the current draft.
- Do not claim permanent account saving.
- Do not add Supabase, Stripe, authentication, OpenAI, Bible APIs, live news APIs, or backend storage.

## 6. Usage counter and credit rule

The dashboard currently hard-codes `used = 3` in `components/app-shell/UsageCard.tsx`. Fix this.

For the current preview:

- display `0 of 8`
- display `8 remaining`
- clearly state that exploring ideas is free
- clearly state that only creating the full message workspace counts as a project once backend tracking is connected

Browsing ideas, refreshing ideas, selecting concerns, selecting directions, and moving through the wizard must never count as projects.

Do not implement the founder unlimited account in this task. That is a later backend/authentication task in issue #3.

## 7. Preserve existing fixes

Preserve:

- persistent dark-teal selected-card styling
- non-hovering Plan Preview panel
- separate Explore, Develop, and Speak-to-This-Week result logic
- backward and forward wizard state
- responsive desktop and mobile layout

Do not redesign the landing page, dashboard, or unrelated wizard steps.

## 8. Required validation

Verify all of these:

1. Earlier wizard steps show one `Continue` button.
2. The final step shows one `Create Message` button.
3. The final button is disabled until a direction is selected.
4. Selecting a direction enables it.
5. No duplicate create button remains.
6. No placeholder modal remains.
7. Clicking `Create Message` opens the workspace.
8. The selected direction and wizard settings appear correctly.
9. Point count is 3, 4, or 5 for 30, 45, or 60 minutes.
10. Editing fields persists after refresh.
11. Add, Rewrite, Keep, and Trash work.
12. Print Preview opens the browser print flow.
13. Dashboard shows zero used projects in preview.
14. No horizontal overflow on desktop or mobile.

Run:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

If `npm run build` is blocked only by external Google Fonts network access, report that separately.

Work on a Codex task branch. Open a pull request against `main`. Do not merge directly into `main`.