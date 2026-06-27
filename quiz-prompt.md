# Build Prompt: COS203 Java Quiz App

Copy everything below into your coding agent (Claude Code, Cursor, etc).

---

## Project Brief

Build a single-page quiz web app for a university Java course (COS203) using **React + Vite + Tailwind CSS**, managed with **pnpm**. The app loads questions from a local JSON file and lets a student configure, take, and review a quiz.

### Tech stack
- **Package manager:** pnpm (use `pnpm create vite@latest` to scaffold, then `pnpm add` for deps — never npm/yarn commands)
- **Framework:** React 18+ with Vite
- **Styling:** Tailwind CSS
- **State:** React state/context only — no external state library needed
- **No backend.** Everything runs client-side; quiz data is a static JSON file bundled with the app
- **Routing:** Not required — this is a single page with view states (setup → quiz → review), managed in React state, not React Router

### Data
There is a file `java.json` at the project root (I will provide it — place it in `src/data/java.json`). It's an array of 400 objects shaped like:

```json
{
  "question_id": 1,
  "question": "string, may contain inline `code` in backticks",
  "option_A": "string",
  "option_B": "string",
  "option_C": "string",
  "option_D": "string",
  "correct_answer": "option_A | option_B | option_C | option_D",
  "explanation": "string, may contain inline `code` in backticks"
}
```

Note: `question` and `explanation` fields sometimes contain inline code wrapped in backticks (e.g. `` `int x = 5;` ``). Render these as styled inline `<code>` elements, not raw text with backticks.

---

## App Flow

### 1. Setup Screen
A clean configuration screen with:
- **Name input** (optional, placeholder like "Enter your name (optional)") — used only for display in the review/results header, not stored anywhere persistent
- **Number of questions** — a control to pick how many questions to attempt (e.g. preset buttons for 10 / 20 / 30 / 50, plus a custom number input capped at 400, the total available)
- **Time limit** — a control to pick a time constraint (e.g. preset buttons for 10 / 20 / 30 / 45 / 60 minutes, or "No time limit")
- A prominent **"Start Quiz"** button, disabled until question count is valid
- Show total question bank size ("400 questions available") somewhere for context

### 2. Quiz Screen
- Display **one question at a time** with its 4 options as selectable cards/buttons (no native radio inputs — style as clickable cards)
- **Shuffle on quiz start:**
  - Randomly select the requested number of questions from the full pool (no repeats within one attempt)
  - Randomly shuffle the order of the 4 options within each question (track which shuffled position maps to the correct answer)
- **Progress indicator:** "Question X of Y" plus a progress bar
- **Countdown timer** (if a time limit was set): visible at all times, changes color/urgency styling (e.g. turns amber under 5 min, red under 1 min) as it runs low
  - **When the timer hits zero: auto-submit the quiz immediately** with whatever answers have been selected so far (unanswered questions count as unanswered/incorrect). No confirmation dialog — submit instantly and route to the review screen.
- **Question grid / jump navigator:** a panel showing a numbered button for every question in the attempt (1 through Y), always visible during the quiz (e.g. a sidebar on desktop, a collapsible drawer or section below the question on mobile). Clicking any number jumps straight to that question — students should be able to freely skip around, not just go sequentially. Color/style each number to show its current status at a glance:
  - **Answered** (e.g. filled blue/cyan)
  - **Unanswered** (e.g. outlined/neutral)
  - **Current question** (e.g. distinct ring or border so it's clear where they are)
  This is the same component pattern as the review screen's navigator (consider building one reusable `QuestionNavigator` component that's used in both places, just with different status logic — answered/unanswered/current during the quiz; correct/incorrect/unanswered during review)
- Navigation: "Next" / "Previous" buttons for sequential movement, **plus** the jump grid above for direct access to any question. Allow free navigation (student can revisit and change answers) — don't lock answers once selected
- A visible "Submit Quiz" button (accessible throughout, not just on the last question — e.g. always present near the jump grid), with a confirmation step if the student has unanswered questions ("You have N unanswered questions — submit anyway?")
- Selecting an option highlights it clearly; if the student already answered a question and navigates back to it (via Next/Previous or the jump grid), their selection should still be shown
- **Responsiveness is critical for this screen specifically:** on mobile, the question grid should not crowd out the question itself — consider a collapsible/expandable grid, a horizontal scroll strip, or a toggle ("View all questions") rather than always-expanded. Tap targets in the grid must stay large enough to hit reliably on a phone. Test that the timer, progress bar, question text, options, and grid all remain usable without horizontal scrolling on a small screen (~375px wide)

### 3. Review Screen
Shown after submission (whether via manual submit or timer auto-submit). Include:
- **Score summary header:** student's name (if given), score as "X / Y correct" and percentage, time taken (or "Time's up — auto-submitted" if the timer ran out)
- **A question navigator:** a strip/grid of numbered buttons (one per question attempted) that lets the student jump directly to any question's detailed review. Color-code each number by status (correct / incorrect / unanswered) so the student can see their performance pattern at a glance
- **Per-question detail view** (shown for whichever question is selected in the navigator):
  - The question text
  - All 4 options shown in their shuffled order, with clear visual indicators: the student's selected answer, the correct answer (if different), and neutral styling for the other two
  - The explanation text, always visible in this detail view
- A **"Retake Quiz"** button that returns to the Setup screen (fresh shuffle, fresh config)

---

## Visual Design — "Blue Techy" Theme

Go for a modern, technical, slightly futuristic feel — think developer tools / IDE aesthetics, not a generic pastel quiz app.

- **Palette:** deep navy/slate backgrounds (e.g. `slate-900`, `slate-950`) with vivid blue/cyan accents (e.g. `blue-500`, `cyan-400`) for interactive elements, highlights, and progress indicators. Use `blue-600`/`cyan-500` gradients sparingly for primary buttons and headers
- **Typography:** a clean sans-serif for UI text; use a monospace font (e.g. `font-mono`) specifically for any inline code snippets in questions/explanations and possibly for the timer display, to reinforce the "techy" feel
- **Surfaces:** cards with subtle borders (`border-slate-700`/`border-blue-500/20`), soft shadows, and slight glow effects on hover/selection (e.g. `ring` or `shadow-blue-500/30`) rather than flat material-design cards
- **Correct/incorrect feedback colors:** emerald/green for correct, rose/red for incorrect — keep these distinct from the blue accent so they read clearly against the dark theme
- **Motion:** subtle transitions (option hover states, progress bar fill, screen transitions) — nothing distracting, keep it snappy
- **Responsive:** must work well on mobile (students may take this on phones) — stack the navigator grid, shrink padding, keep tap targets large enough

---

## Code Quality Expectations
- Organize into clear components: `SetupScreen`, `QuizScreen`, `QuestionCard`, `Timer`, `ReviewScreen`, `QuestionNavigator`, etc. — don't put everything in one file
- Keep quiz logic (shuffling, scoring, timer countdown) in small testable utility functions or a custom hook (e.g. `useQuiz`), separate from presentation components
- Use TypeScript if the agent defaults to it comfortably; otherwise clean, well-commented JS is fine — pick one and be consistent
- No console errors/warnings on build

## Deployment Readiness
This needs to be deployable to Vercel or Netlify with minimal extra config:
- Use a standard Vite build (`pnpm build` → `dist/`)
- Add a `vercel.json` or `netlify.toml` only if needed for SPA fallback routing (likely not needed since there's no router, but double check)
- Include a short `README.md` with: setup instructions (`pnpm install`, `pnpm dev`, `pnpm build`), and a one-line note on where to swap in a different question JSON file in the future
- Don't hardcode any absolute local file paths

---

## Deliverable
A working Vite + React + Tailwind app, pnpm-managed, that runs locally with `pnpm install && pnpm dev`, implements the full setup → quiz → review flow above, and is ready to deploy to Vercel/Netlify as a static build.
