# Refactor Migration Status

Status: freeze active
Started: 2026-06-21
Spec: workspace-level `180-refactoring-spec.md`

New day publishing is paused while the clean-break Astro/MDX refactor is in progress. During the freeze, do not add new lessons, appendices, route shells, Nunjucks lesson bodies, or importer-driven content to the current Eleventy structure.

Urgent editorial corrections should be made to the active migration source of truth and verified through the normal build/check gates. Do not maintain parallel old/new content for compatibility.

Milestone 0 baseline evidence lives in `docs/refactor/inventory/`. The inventory is a content-coverage tool only; it does not preserve URLs, download filenames, route shells, or any other legacy convention as a compatibility requirement.

## Retired Tooling

The blind HTML importers have been removed:

- `scripts/import-day-from-html.mjs`
- `scripts/import-appendix-from-html.mjs`

Future content migration is manual paired-MDX conversion through the typed registry, schema checks, component contracts, and artifact variants. Helper tools may inspect, lint, scaffold, and diff content, but must not blindly copy arbitrary source HTML into project content.
