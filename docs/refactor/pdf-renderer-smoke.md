# PDF Renderer Smoke Report

Generated: 2026-06-21T22:47:38.676Z

This is a Tier 1 smoke attempt for the free PDF renderer candidates. Generated PDFs stay under ignored `dist/refactor/pdf-smoke/` and are not committed.

Smoke content includes English prose, Chinese prose, math text, inline SVG, and an interaction fallback label.

## Summary

- Survivors: latex-pandoc, tectonic, typst, weasyprint, vivliostyle, playwright
- Eliminated or unavailable: none

## Results

| Candidate | Passed | Duration | Output | Notes |
| --- | --- | ---: | --- | --- |
| LaTeX via Pandoc/XeLaTeX | yes | 1844ms | pandoc-xelatex.pdf | smoke PDF generated |
| Tectonic | yes | 4673ms | smoke.pdf | smoke PDF generated |
| Typst | yes | 288ms | typst.pdf | smoke PDF generated |
| WeasyPrint | yes | 408ms | weasyprint.pdf | smoke PDF generated |
| Vivliostyle CLI | yes | 2608ms | vivliostyle.pdf | smoke PDF generated |
| Playwright/Chromium | yes | 123ms | playwright.pdf | smoke PDF generated |

## Raw Command Evidence

### LaTeX via Pandoc/XeLaTeX

Command: `pandoc smoke.md --pdf-engine=xelatex -V mainfont=Helvetica Neue -V CJKmainfont=Hiragino Sans GB -o pandoc-xelatex.pdf`
Status: 0
Error: none
Stdout: empty
Stderr: empty

### Tectonic

Command: `tectonic smoke.tex --outdir /Volumes/Encrypted/Users/dotkrnl/Workspace/dotkrnl/180-descent/dist/refactor/pdf-smoke`
Status: 0
Error: none
Stdout: 
```txt
note: Running TeX ...
note: Rerunning TeX because "smoke.aux" changed ...
note: Running xdvipdfmx ...
note: Writing `/Volumes/Encrypted/Users/dotkrnl/Workspace/dotkrnl/180-descent/dist/refactor/pdf-smoke/smoke.pdf` (19.185546875 KiB)
note: Skipped writing 1 intermediate files (use --keep-intermediates to keep them)
```
Stderr: 
```txt
warning: accessing absolute path `/System/Library/Fonts/HelveticaNeue.ttc`; build may not be reproducible in other environments
warning: accessing absolute path `/System/Library/Fonts/Hiragino Sans GB.ttc`; build may not be reproducible in other environments
```

### Typst

Command: `typst compile smoke.typ typst.pdf`
Status: 0
Error: none
Stdout: empty
Stderr: empty

### WeasyPrint

Command: `weasyprint smoke.html weasyprint.pdf`
Status: 0
Error: none
Stdout: empty
Stderr: empty

### Vivliostyle CLI

Command: `/Volumes/Encrypted/Users/dotkrnl/Workspace/dotkrnl/180-descent/node_modules/.bin/vivliostyle build smoke.html -o vivliostyle.pdf`
Status: 0
Error: none
Stdout: 
```txt
INFO Start building
INFO Launching PDF build environment
INFO Building pages
INFO Building PDF
INFO Processing PDF
SUCCESS Finished building vivliostyle.pdf
📘 Built successfully!
```
Stderr: empty

### Playwright/Chromium

Command: `playwright chromium page.pdf smoke.html`
Status: 0
Error: none
Stdout: empty
Stderr: empty

