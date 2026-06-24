import path from "node:path";

export function bookScssFile(root: string): string {
  return path.resolve(root, "src/assets/scss/book.scss");
}

export function brandIconFile(root: string): string {
  return path.resolve(root, "src/assets/images/brand/180-descent-icon.png");
}

export function socialImagesDir(root: string): string {
  return path.resolve(root, "src/assets/images/social");
}

export function fontsDir(root: string): string {
  return path.resolve(root, "src/assets/fonts");
}

export function cjkFontsDir(root: string): string {
  return path.resolve(fontsDir(root), "cjk");
}

export function katexFontsDir(root: string): string {
  return path.resolve(fontsDir(root), "katex");
}

export function pdfFontsDir(root: string): string {
  return path.resolve(fontsDir(root), "pdf");
}

export function generatedScssFile(root: string, fileName: string): string {
  return path.resolve(root, "src/assets/scss/generated", fileName);
}
