---
name: qa-test
description: Manually QA the current vp-eng-nuxt branch in a real browser (Playwright MCP) against the local dev server. Builds a test plan from the PR / branch diff / what the user describes, gets it approved, handles login, runs the ui-qa-engineer subagent, relays the report, and with --post publishes a reviewer-facing summary to the branch's GitHub PR. With --app it QAs the whole application instead: inventories every route, splits it into areas and runs smoke + user-journey cases area by area. Usage /qa-test [PR# | "what to test"] [--retest IDs] [--post] | /qa-test --app [area]
---

# QA Test — vp-eng-nuxt (local branch)

Orchestrates browser QA of the current branch (branch mode, steps 1–8), or of the whole application (`--app`, see **Whole-app mode** at the end). You (the parent agent) author the plan and talk to the user; the `ui-qa-engineer` subagent executes it in the browser and returns the report.

Adapted from the ybcolink.com `qa-test` skill. Stack: Nuxt 3 site (static in production).

## Configuration

### App
- **URL:** `http://localhost:3004/` (Nuxt 3, Pinia, PWA). Tailnet URL for the user: `http://cachyos-x8664.tail7cb86b.ts.net:3004/`
- **Dev stack:** devstack unit `vp-eng-nuxt-dev`, not autostarted: `~/Sites/_devstack/devstack up vp-eng-nuxt`. (CLAUDE.md says :3000; devstack runs it on :3004 because chickpeas owns :3000.)
- **Logs:** `journalctl --user -u vp-eng-nuxt-dev`
- **Base branch:** `master`
- Production is **static** (`nuxt generate` → nginx): `server/api/**` routes exist only in dev. A change that depends on them working in prod is a Plan gap to raise.

### Page mapping
- `pages/**` → routes (`/`, `/about`, `/services/*`, `/projects/*`, `/careers/*`, `/contact`, `/search`, `/offline`, legal pages).
- `server/api/projects|services|team|testimonials|search-index` → WordPress REST with a 30-min cache and static fallbacks; used by the matching pages and `/search`.
- `components/**`, `composables/**`, `stores/**`, `middleware/**` → grep usages.
- `@vite-pwa/nuxt` / service worker → offline behaviour; service workers don't run reliably on the dev server, so mark SW cases Not browser-testable or suggest `npm run generate` + a static preview.

### Gates / roles
- None. Every case runs as guest.

### Side effects
- `/contact` (`utils/contactForm.ts`) posts to `runtimeConfig.public.contactEndpoint` = `NUXT_PUBLIC_CONTACT_ENDPOINT` or `/api/contact`. Preflight: if that env var is set (in `.env` or the devstack unit) and points at a real host (e.g. the live whiteboard), submissions email real recipients, so never submit. By default it's `/api/contact`, which in production nginx forwards to vp-whiteboard's Laravel app (saves + emails the enquiry). There is no such route on the Nuxt dev server, so submission is Not browser-testable here; test client-side validation and the honeypot field only, unless the plan points it at a local vp-whiteboard.
- WordPress API is live (read-only GETs, safe).

These facts can go stale. When a line here contradicts the code, `.env` or devstack, trust the code, say so in the plan, and offer to update this section.

## Fixed settings

- **Browser:** the Playwright MCP server (`mcp__plugin_playwright_playwright__*`). It runs on this machine; the user is on SSH and **cannot see the browser window**. So the subagent tests against `localhost` URLs, and screenshots are the user's view of what happened.
- **GitHub:** `gh` CLI, repo from `gh repo view --json nameWithOwner -q .nameWithOwner`.
- **No ticket tracker.** This project doesn't use Jira or GitHub issues. Scope comes from the PR, the commits, and the user.
- **Evidence dir:** `<your scratchpad dir>/qa/<repo>/<branch>/` (absolute path).

## Arguments

- `PR#` — an open PR number in this repo. If missing, look for an open PR for the current branch (`gh pr list --head <branch> --state open`).
- `"what to test"` — free text from the user describing the change or the ACs. Takes priority over anything derived.
- `--post` — after this run, publish the reviewer summary to the PR (step 7). Use it on the final run. Without it nothing is posted.
- `--retest <IDs>` — rerun only the listed cases from the last plan (reuse it from this conversation or the evidence dir's `plan.md`; in app mode, the run dir's `plan-<area>.md`).
- `--app [area]` — whole-app mode: test the application as it is on the current checkout instead of a change. Optional `area` (a name from the inventory, e.g. `menu`) limits the run to that area. Ignores `PR#`/`--post`.

---

## Instructions

### 1. Gather scope

1. **Acceptance criteria**, in this order of priority:
   - What the user wrote in the arguments or the conversation.
   - The PR title and body (`gh pr view <n> --json title,body,baseRefName,headRefOid`). Checklists, "Test plan" or "What changed" sections become ACs.
   - Commit messages on the branch (`git log --format='%s%n%b' <base>..HEAD`) and any plan/backlog doc the commits touched.
   Label everything not stated by the user or the PR as `AC-n (derived)`. If you can't derive a single meaningful AC, ask the user what the change is supposed to do.
2. `git diff <base>...HEAD --stat` and read the meaningful hunks. Also note uncommitted and untracked changes (`git status`): they are part of what's being tested. `<base>` is the base branch in Configuration, or the PR's `baseRefName` when there is a PR.
3. Map changed files to pages using **Page mapping** in Configuration. General rules that apply everywhere:
   - Shared code (layouts, composables, utilities, stores, shared components, middleware, models, services) → grep its usages; these become regression targets.
   - JSON/API endpoints → find which page/component calls them.
   - Backend-only changes with no UI (console commands, jobs, migrations, scheduled tasks, CI/deploy config) → say so in the plan. Browser QA covers only their visible effect; suggest a unit/feature test or a manual artisan step instead of inventing UI cases.
   - Config-only changes (`nuxt.config.*`, `astro.config.*`, route rules, CSP/security headers) → cases that load the affected pages and check the console/network for blocked resources.
4. Identify the gates and roles that matter: the gates and roles listed in Configuration, plus any role or permission branches in the diff. Re-check the code if Configuration looks out of date.

### 2. Write the test plan

Write it to `<evidence dir>/plan.md` and show it to the user:

```
# Test plan — <project> · <branch> [· PR #n]
Base URL: http://localhost:3004/

## Acceptance criteria
- AC-1: …            (source: user | PR | derived)

## Scope
- Pages / endpoints: …
- Gates: feature flag(s), roles
- Not browser-testable: … (or "None")

## Cases
### TC-1 (AC-1) — <title>
- Role: guest | user | admin | …
- Preconditions / data: …
- Steps: 1. … 2. …
- Expected: …
- Tags: [safe] if it performs an otherwise-irreversible action that is OK on local data
```

Coverage rules:
- Every AC has at least one positive case; add negative/edge cases (empty, invalid, boundary, permission denied) where the AC implies validation or access control.
- Every role or permission the changed code branches on gets its own case. If the change sits behind a feature flag, auth or role check, add one case proving a user without access is kept out.
- Money, prices, quantities and scores: include a case that checks precision (decimals, rounding, totals).
- Add `REG-n` regression cases for shared code touched by the diff (one representative usage each).
- **Functionality only.** Do not add cases for accessibility, viewport/responsive layout, dark mode, or general styling/visual polish unless the PR/user explicitly calls for it, or the change itself is a layout, a11y or design change (then cover exactly what it changed and cite the source).
- No case may delete pre-existing data, send email to a real address, submit a third-party form (Formspree etc.), charge a real payment, or spend paid API quota unless tagged `[safe]` with a reason, and **Side effects** in Configuration say it's safe locally.
- **Emails:** when an AC expects an email and the project logs mail locally, the Expected is "entry in `storage/logs/laravel.log`" with recipient and subject. If mail goes to the `array` driver, it can't be observed from the browser: mark the email part Not browser-testable.

**Wait for the user to approve or edit the plan before continuing.**

### 3. Preflight

- **Dev stack up:** `curl -s -o /dev/null -w '%{http_code}' <each URL in Configuration>`, must not be 000/5xx. If a devstack project is down, run `~/Sites/_devstack/devstack status` and tell the user; start it with `~/Sites/_devstack/devstack up <project>` (say you're doing it). For projects without a devstack entry, follow the start instructions in Configuration and ask before starting long-running processes.
- **Fresh code:** dev servers with HMR (Nuxt, Astro, Vite) pick up source changes on their own, but **not** `.env`, `nuxt.config.*`, `astro.config.*` or new dependencies. If the diff or `git status` touches those since the server started (`systemctl --user show <unit> -p ActiveEnterTimestamp`), restart the unit (`systemctl --user restart <unit>`) and say so. For Laravel + Vite, check the build note in Configuration.
- **Dependencies:** if `package.json`/lockfile or `composer.json`/`composer.lock` changed on the branch, check `node_modules`/`vendor` are current (`npm ls --depth=0` errors, `composer install --dry-run`). Tell the user rather than installing.
- **Pending migrations (Laravel):** `php artisan migrate:status | grep -i pending`. If the branch adds migrations that haven't run, tell the user (don't run them yourself).
- **Feature flags:** for each gate in scope, check it's enabled locally. Report what's missing instead of editing `.env`/config.
- **Side-effect safety:** check every item in **Side effects** in Configuration list (read `.env` keys, never print secret values) and report them in one line. If any says a real mailer, live payment keys, paid-quota keys, or a production bucket/API is configured, the affected cases stay Blocked unless the user says otherwise.
- Stop and report if preflight fails.

### 4. Login (only if the plan needs an authenticated role)

The user can't see or click in the Playwright browser, so they can't log in by hand. Use AskUserQuestion:
- **"Use the local test accounts in Configuration" (Recommended when Configuration lists them)**: seeded local accounts. Check the account exists first (e.g. `php artisan tinker --execute 'echo App\Models\User::where("email","…")->exists() ? "yes" : "no";'`).
- **"I'll provide credentials"**: collect email/password for each role. Local dev accounts only; never production credentials.
- **"Create throwaway local accounts"**: create one local user per missing role with `php artisan tinker` (local DB only), using a `qa+<role>@example.test` address and a random password kept out of the transcript summary. List them under Test data so they can be deleted later.

Playwright MCP keeps a persistent browser profile, so sessions may survive between runs. Without credentials for a role, its cases are Blocked.

### 5. Run the subagent

Spawn `ui-qa-engineer` (Agent tool, `subagent_type: "ui-qa-engineer"`, **`model: "sonnet"`**, which the global subagent hook requires) with a prompt containing:
- The approved plan **verbatim** (full text of `plan.md`)
- Project, repo root (absolute), branch, short SHA (`git rev-parse --short HEAD`, plus "+ uncommitted changes" if any), today's date
- Base URL(s), log locations from Configuration, auth per role, evidence dir (absolute)
- The preflight side-effect line
- Mode: `full`, or `retest` with case IDs

If `ui-qa-engineer` isn't offered as an agent type (project agents load only when the session starts inside this repo), spawn a `general-purpose` agent with `model: "sonnet"` instead, and start its prompt with: read `.claude/agents/ui-qa-engineer.md` (absolute path) and follow it exactly.

Do not run browser steps yourself while it works.

If it returns `BLOCKED: login required`, return to step 4, then rerun.

### 6. Relay the report

Show the user the report as returned (Coverage, Results, Issues, Blocked, Plan gaps, Out-of-scope, Test data, Evidence). Do not soften or re-grade results.

Save it to `<evidence dir>/report.md`. The full report (fix suggestions, tradeoffs, evidence paths) is for the author and stays local.

On a `--retest`, merge the rerun cases into the previous results so the report always reflects the latest result for every case.

### 7. Publish the reviewer summary (only with `--post`)

The PR gets a short summary for the **reviewer**: what was verified, what's still known-broken, what wasn't tested. Not the author's fix list.

1. **Find the PR:** `gh pr list --head <branch> --state open --json number,url,headRefOid,baseRefName`. If none, tell the user and offer to open one; stop here.
2. **Check staleness:** compare `headRefOid` with the tested SHA. If they differ, count the commits between them (`git rev-list --count <tested>..<pr head>`) and tell the user before posting; offer to rerun first. If the run included uncommitted changes, say so too. If they post anyway, the summary carries the staleness line below.
3. **Build the summary** (markdown):

   ```
   ## QA summary (qa-test)
   Tested `<short sha>` on <date> · local dev env · Playwright (Chromium)
   [⚠️ <N> commits pushed since this run — results may be outdated]

   **Coverage:** ACs X/Y · Cases X/Y — ✅ N · ❌ N · ⛔ N blocked

   | TC | AC | Role | Result |
   |----|----|------|--------|

   **Known open issues**
   - <Severity> — TC-n: <one line>   (or "None")

   Open issues above are known to the author.   ← only when any case failed

   **Not tested**
   - <blocked cases + reason; plan gaps; backend-only changes; roles/envs not covered>
   ```

   Exclude: suggested fixes, tradeoffs, repro detail, file paths, screenshots, credentials, and personal data from test records. No AI attribution lines.
4. **One comment per PR (update, don't append):** `gh api repos/<owner/repo>/issues/<number>/comments --paginate --jq '.[] | select(.body | startswith("## QA summary (qa-test)")) | .id'`.
   - Found → `gh api -X PATCH repos/<owner/repo>/issues/comments/<id> -F body=@<file>`.
   - Not found → `gh pr comment <number> --body-file <file>`.
   Write the body to `<evidence dir>/pr-summary.md` first and pass the file, so markdown survives quoting.
5. Give the user the PR link.

### 8. Next steps

Offer to fix the reported issues (do not start until the user says "go"). Follow the project's test-first rule if it has one (CLAUDE.md/AGENTS.md). After fixes, suggest `/qa-test --retest <failed IDs>`, and `--post` on the final run once the author is satisfied.

---

## Whole-app mode (`--app [area]`)

Tests the application as it is on the current checkout, not a change: every route, every role that can reach it, and the main user journeys. Use it for a periodic exploratory pass (before a release, after a big refactor, after a dependency upgrade). It complements the Playwright e2e suite, which stays the repeatable regression check; this pass reports what the suite doesn't catch.

- **Run dir:** `<your scratchpad dir>/qa/<repo>/app/<YYYY-MM-DD>-<short sha>/` (absolute path).
- **Case IDs** are prefixed with the area code so they stay unique across areas: `MENU-S1` (smoke), `ORDER-J2` (journey), `ADMIN-A1` (access control).
- Steps 3 (preflight), 4 (login) and the safety rules of step 2 apply unchanged.

### A1. Inventory

Build the inventory from the code on the current checkout (it differs between branches, so don't reuse one from another commit).

**Testing a different branch than the one checked out** (e.g. `main` = production while the working copy is on a feature branch): don't switch the user's checkout or touch the devstack server. Instead `git worktree add <scratchpad>/wt/<repo>-<branch> origin/<branch>`. If `package.json`/`package-lock.json` are identical between the two (`git diff --stat <branch> HEAD -- package.json package-lock.json`), symlink the working copy's `node_modules` into it, otherwise ask before running `npm ci`. Start the project's dev command from it on a free port, in the background, logging to the scratchpad (Nuxt `npx nuxi dev --host 127.0.0.1 --port 3010`, Astro `npx astro dev --host 127.0.0.1 --port 4330`, Laravel `php artisan serve --port=8100` with `composer install` checked the same way as `node_modules`). Use that as the Base URL and its log file as the server log; stop it and remove the worktree at the end. A Laravel copy shares the working copy's `.env` and local database: copy `.env` into the worktree, and if the two branches' migrations differ, ask before running anything, since the schema may not match. Reuse `<run dir>/inventory.md` only if it exists for this same SHA and `git status` shows no changes under pages, routes or admin code.

Sources, using **Page mapping** in Configuration:
- Every page route (file-based pages, server routes that render HTML, `sitemap.xml`).
- JSON endpoints, only through the page that calls them.
- Admin screens (Filament resources/pages, admin route groups), each with the roles allowed in.
- Gates/flags in Configuration: which routes they hide.
- **Journeys:** multi-page flows a real user takes, e.g. home → menu → add to cart → checkout → order status; admin login → change a setting → see it on the storefront.

Group routes into **areas** (up to 6; a small app may need only one or two), each small enough for one subagent run (about 15 cases or fewer). Write `<run dir>/inventory.md`:

```
# App inventory — <project> @ <short sha> (<branch>)

## Area: <code> — <name>
- Routes: /path (roles) …
- Gates: … | none
- Journeys: J1 <name>: step → step → step
- Risky actions: <action> — never run | [safe] locally | Blocked (<why>)
- Not browser-testable: … | none
```

Show the user the area list (one line per area: code, routes, journeys, anything gated off or blocked). If `area` was given, keep only that area.

### A2. Plan per area

For each selected area, write `<run dir>/plan-<code>.md` in the step 2 format, with these differences:
- No acceptance criteria. The `## Acceptance criteria` section becomes `## Coverage`, listing the area's routes and journeys; every route and journey needs at least one case.
- **Smoke cases (`S`)**, one per route per allowed role: the page loads (2xx/3xx, no Nuxt/Laravel error page), main content is present, no console errors, no failed requests, primary nav and in-page links/controls respond.
- **Journey cases (`J`)**: each journey end to end. Add one negative or edge step wherever the flow validates input (empty, invalid, boundary), and a precision check wherever money or quantities are shown.
- **Access cases (`A`)**: for each gated or role-restricted route, one case proving a guest or lower role is kept out.
- The same side-effect rules as step 2: anything that emails a real address, submits a third-party form, charges a payment, spends paid quota or deletes pre-existing data is never run unless `[safe]` per **Side effects** in Configuration.

Show all area plans in one message (compact: one line per case under each area heading; the full text is in the files). **Wait for approval.** The user may drop areas or cases.

### A3. Preflight and login

Run step 3 and step 4 once for the whole run, covering every gate and role across the selected areas. For an area whose gate is off locally, offer two options: test it as gate-off (a case proving it is properly hidden or 404s), or skip it. Don't flip flags yourself.

### A4. Run area by area

Spawn one `ui-qa-engineer` run per area, **one at a time** (there is a single Playwright browser, so no parallel runs). Use the step 5 prompt with: that area's plan verbatim, branch + short SHA instead of a ticket, and `Mode: app`. After each area, give the user a one-line progress note (area, ✅/❌/⛔ counts, worst issue). If an area returns `BLOCKED: login required` or `BLOCKED: browser unavailable`, stop and resolve it before the next area.

### A5. Merge the reports

Save each area report as `<run dir>/report-<code>.md`, then combine them into `<run dir>/report.md` and show it:

```
## App QA — <project> @ <short sha> (<branch>) · <date>

### Summary by area
| Area | Cases | ✅ | ❌ | ⛔ | Worst issue |
|------|-------|----|----|----|-------------|

### Issues (all areas, Blocker first)
| # | Severity | Case | Issue | Repro | Suggested fix | Tradeoffs |

### Blocked / not covered
### Out-of-scope observations
### Test data created
### Evidence
```

Don't re-grade results. Nothing is posted anywhere; there is no PR in this mode. If the user wants Blocker/Major findings tracked, offer to open GitHub issues, and ask before creating any.

### A6. Next steps

Offer to fix the reported issues (do not start until the user says "go"), one branch per fix, test-first if the project requires it. Afterwards suggest `/qa-test --app <area> --retest <IDs>` for the failed cases, or a full `--app <area>` rerun.
