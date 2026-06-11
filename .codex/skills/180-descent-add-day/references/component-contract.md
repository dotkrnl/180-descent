# Component Contract

Every interactive lesson component needs three representations.

## Web

Use the live component inside:

```html
<div class="panel web-only">
  ...
</div>
```

Controller code belongs in a focused module under `src/assets/js/interactions/`, then the route shell lists it in front matter:

```yaml
scripts:
  - /assets/js/interactions/example-component.js
```

Keep `src/assets/js/book.js` for site-wide behavior only. Interaction modules should no-op when their hooks are absent, because they may be shared by multiple days. Keep controls accessible with buttons, labels, roles, and keyboard behavior.

## EPUB

EPUB readers often disable JavaScript. Use no-JS fallbacks:

```html
<div class="format-alt epub-only print-only">
  ...
</div>
```

Good EPUB patterns:

- tables
- `details` / `summary`
- worked examples
- answer reveals that do not require scripts
- static SVGs

## PDF

PDF must not contain interactive controls. Replace live controls with:

- static SVG diagrams
- tables of states
- worked examples
- short explanatory notes

The PDF is generated from `/print/` with print CSS. Anything marked `.web-only` is hidden in print.

## Placement

Put all component markup and fallbacks in the lesson body include, for example `src/_includes/days/003-logic-and-valid-inference/en.njk`. Keep the route markdown shell free of article markup.

For appendix components, prefer class-scoped selectors such as `.cm-machine` and descendant queries. Appendix IDs are namespaced with `appendix-d###-`, but repeated component behavior should not depend on a single global ID.
