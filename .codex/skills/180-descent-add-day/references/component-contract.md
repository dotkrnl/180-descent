# Component Contract

Every interactive lesson component needs three representations.

## Web

Use the live component inside:

```html
<div class="panel web-only">
  ...
</div>
```

Controller code belongs in `src/assets/js/book.js` unless the component grows large enough to justify a separate module. Keep controls accessible with buttons, labels, roles, and keyboard behavior.

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

