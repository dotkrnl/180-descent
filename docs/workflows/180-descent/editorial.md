# Editorial Review

## Claim And Evidence Calibration

Apply this gate to new lessons and existing-day edits in both locales.

- Prefer primary sources for factual, historical, scientific, and benchmark
  claims. Record enough version, release, access, and event-date context to
  identify what the source actually supports; do not confuse a publication date
  with the date of the event or result.
- State a theorem's assumptions and scope near the conclusion drawn from it.
  Keep formal consequences inside the formal model, and do not turn a proof,
  idealization, or modeling objective into an empirical, metaphysical, or
  truth-tracking guarantee it does not establish.
- Compare systems or results only when the benchmark version, model release,
  evaluation protocol, tools, sampling budget, and other material conditions are
  compatible. When they are not, describe the results separately instead of
  implying a ranking or trend.
- Distinguish an institution's or vendor's characterization from independent
  evidence. Put uncertainty, limitations, and evidence status in reader-facing
  claim or source prose—not in editorial notes claiming that sources were
  checked.
- Keep English and Chinese aligned on factual scope, numbers, dates, rankings,
  evidence status, and uncertainty. A correction to any of those requires a
  paired-locale review. Do not mechanically rewrite already-natural Chinese for
  an English-only rhetorical tightening when both versions still make the same
  calibrated claim.

## Existing-Day Editorial Pass

Use this pass when reviewing a run of already-published days. It is an editorial
review, not a translation reset or a reason to flatten the established voice.

1. Inventory each paired main body and every declared appendix; compare headings,
   imports, interactive/static alternates, sources, recap blocks, thread labels,
   and next-day handoffs section by section.
2. Preserve the narrative engine of each day: a concrete opening hook, a clear
   conceptual model, an example or experiment, the live evidence boundary, and a
   forward-looking handoff. Prefer vivid examples and varied sentence rhythm;
   remove repetition, translationese, and UI-label drift without sanding away
   the intellectual tension.
3. Normalize shared course furniture across the sweep. Main days should use the
   same frontier numbering, open-question eyebrow, three-part recap shape, and
   thread treatment in both locales; appendix labels may remain local when they
   describe appendix-specific material.
4. Preserve claims, citations, caveats, and evidence strength. Run the Claim And
   Evidence Calibration gate above. Any wording change that alters a number,
   timeframe, status label, or uncertainty claim requires a paired-source check
   and an update to the relevant glossary or source note.
5. Remove model-shaped editorial residue where it is actually present: repeated
   abstract triads, automatic `not X but Y` contrasts, generic claims of rigor,
   manufactured superlatives, fake suspense, clusters of rhetorical questions,
   stock `rewrite the landscape` metaphors, self-conscious source-vetting
   narration, inflated certainty, and authoring instructions in reader copy.
   Replace each with the concrete claim, evidence, or transition the passage
   needs; do not flatten deliberate voice or rhythm.
6. Run the Chinese Edition rules in `localization.md` as a separate review of the
   Chinese files, then run content, type, math, import, appendix-style, and
   artifact checks after the entire sweep.

## Human Refinement Gate

Use this gate after implementation, translation, checks, and artifact inspection
are otherwise complete, and before commit/push/deploy unless the user explicitly
asks to publish immediately.

1. Start the local dev server if it is not already running:

```sh
npm run dev -- --port 8080
```

If port 8080 is unavailable, use another local port and tell the user the URL.

2. Ask the user to review relevant English/Chinese pages in the local browser
   and provide concrete corrections or selected passages.
3. Apply accepted refinements to tracked source files, then refresh and verify
   the rendered result. Do not leave changes as browser-only DOM edits.
4. After the user says the refinement pass is done, check `git status -sb` and
   inspect the source diff. Confirm refinements are in tracked source files under
   `src/` or workflow files, never only `_site/`.
5. Rebuild and rerun checks after accepted refinements.
