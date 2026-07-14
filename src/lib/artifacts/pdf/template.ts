import path from "node:path";
import { brandIconFile, pdfFontsDir } from "@lib/assets/paths";
import type { HumanEditorData } from "@lib/data/book";
import type { Locale } from "@lib/schemas/day";
import { latexEscape, latexPath } from "./latex";

export interface PdfTemplateConfig {
  root: string;
  locale: Locale;
  title: string;
  subtitle: string;
  authors: string;
  humanEditor: HumanEditorData;
  description: string;
  publisher: string;
}

export function latexPreamble(config: PdfTemplateConfig): string {
  const fontPath = latexPath(pdfFontsDir(config.root) + path.sep);
  const cjkMain = config.locale === "zh" ? "LXGW WenKai" : "Songti SC";
  const keywords = pdfKeywords(config);
  return String.raw`\documentclass[10pt,openany,oneside]{book}
\let\cleardoublepage\clearpage
\usepackage[paperwidth=6in,paperheight=9in,top=0.72in,bottom=0.78in,inner=0.55in,outer=0.55in,headheight=14pt,headsep=11pt,footskip=26pt]{geometry}
\usepackage{fix-cm}
\usepackage{fontspec}
\usepackage{xeCJK}
\usepackage{newunicodechar}
\defaultfontfeatures{Ligatures=TeX}
\setmainfont[
  Path=${fontPath},
  UprightFont=newsreader-latin-400-normal.otf,
  ItalicFont=newsreader-latin-400-italic.otf,
  BoldFont=newsreader-latin-700-normal.otf,
  BoldItalicFont=newsreader-latin-700-italic.otf
]{Newsreader}
\newfontfamily\displayfont[
  Path=${fontPath},
  UprightFont=fraunces-latin-600-normal.otf,
  ItalicFont=fraunces-latin-400-italic.otf,
  BoldFont=fraunces-latin-700-normal.otf,
  BoldItalicFont=fraunces-latin-700-italic.otf
]{Fraunces}
\setmonofont[
  Path=${fontPath},
  UprightFont=ibm-plex-mono-latin-400-normal.otf,
  BoldFont=ibm-plex-mono-latin-600-normal.otf,
  Scale=0.82,
  AutoFakeSlant=0.2
]{IBM Plex Mono}
\newfontfamily\symbolfallback[
  ItalicFont=STIX Two Text,
  BoldFont=STIX Two Text,
  BoldItalicFont=STIX Two Text
]{STIX Two Text}
% The bundled Latin subsets omit these letters, but transliterating them
% corrupts names such as Erdős, Łukasiewicz, and Gaṅgeśa.
\newunicodechar{ć}{{\symbolfallback ć}}
\newunicodechar{č}{{\symbolfallback č}}
\newunicodechar{ē}{{\symbolfallback ē}}
\newunicodechar{Ł}{{\symbolfallback Ł}}
\newunicodechar{ł}{{\symbolfallback ł}}
\newunicodechar{ń}{{\symbolfallback ń}}
\newunicodechar{ō}{{\symbolfallback ō}}
\newunicodechar{ő}{{\symbolfallback ő}}
\newunicodechar{ś}{{\symbolfallback ś}}
\newunicodechar{ş}{{\symbolfallback ş}}
\newunicodechar{ṅ}{{\symbolfallback ṅ}}
\newunicodechar{Δ}{{\symbolfallback Δ}}
\newunicodechar{ε}{{\symbolfallback ε}}
\newunicodechar{η}{{\symbolfallback η}}
\newunicodechar{μ}{{\symbolfallback μ}}
\newunicodechar{λ}{{\symbolfallback λ}}
\newunicodechar{ν}{{\symbolfallback ν}}
\newunicodechar{σ}{{\symbolfallback σ}}
\newunicodechar{ħ}{{\symbolfallback ħ}}
\newunicodechar{ℏ}{{\symbolfallback ℏ}}
\newunicodechar{Ω}{{\symbolfallback Ω}}
\newunicodechar{₀}{{\symbolfallback ₀}}
\newunicodechar{₁}{{\symbolfallback ₁}}
\newunicodechar{₂}{{\symbolfallback ₂}}
\newunicodechar{₃}{{\symbolfallback ₃}}
\newunicodechar{₄}{{\symbolfallback ₄}}
\newunicodechar{₅}{{\symbolfallback ₅}}
\newunicodechar{₆}{{\symbolfallback ₆}}
\newunicodechar{₇}{{\symbolfallback ₇}}
\newunicodechar{₈}{{\symbolfallback ₈}}
\newunicodechar{₉}{{\symbolfallback ₉}}
\newunicodechar{→}{{\symbolfallback →}}
\newunicodechar{←}{{\symbolfallback ←}}
\newunicodechar{↔}{{\symbolfallback ↔}}
\setsansfont{Hiragino Sans GB}
\IfFontExistsTF{${cjkMain}}{\setCJKmainfont[AutoFakeSlant=true,SlantFactor=0.2]{${cjkMain}}}{\setCJKmainfont[AutoFakeSlant=true,SlantFactor=0.2]{Songti SC}}
\setCJKsansfont{Hiragino Sans GB}
\IfFontExistsTF{${cjkMain}}{\setCJKmonofont[AutoFakeSlant=true,SlantFactor=0.2]{${cjkMain}}}{\setCJKmonofont[AutoFakeSlant=true,SlantFactor=0.2]{Songti SC}}
\usepackage{xcolor}
\usepackage{colortbl}
\usepackage{graphicx}
\usepackage{tikz}
\usepackage{caption}
\usepackage{array}
\usepackage{longtable}
\usepackage{booktabs}
\usepackage{ragged2e}
\usepackage{enumitem}
\usepackage{fancyhdr}
\usepackage{titlesec}
\usepackage{tocloft}
\usepackage{needspace}
\usepackage{lettrine}
\usepackage[most]{tcolorbox}
\usepackage{amsmath,amssymb}
\usepackage{hyperref}
\hypersetup{
  unicode=true,
  hidelinks,
  bookmarksopen=true,
  bookmarksdepth=1,
  pdftitle={${latexEscape(config.title)}},
  pdfauthor={${latexEscape(config.authors)}},
  pdfsubject={${latexEscape(config.description || config.subtitle)}},
  pdfkeywords={${latexEscape(keywords)}}
}
\definecolor{descentTeal}{HTML}{2B6763}
\definecolor{descentInk}{HTML}{10252B}
\definecolor{descentMuted}{HTML}{58676A}
\definecolor{descentWhite}{HTML}{FFFFFF}
\definecolor{descentPaper}{HTML}{F5F1E9}
\definecolor{descentRaised}{HTML}{FCFAF5}
\definecolor{descentCream}{HTML}{ECE8DF}
\definecolor{descentLine}{HTML}{DDD6CA}
\definecolor{descentAbyss}{HTML}{061519}
\definecolor{descentBone}{HTML}{F3EAD9}
\definecolor{descentBoneMuted}{HTML}{B7C5C1}
\definecolor{descentAqua}{HTML}{65C9BD}
\definecolor{descentSignal}{HTML}{F07B60}
\definecolor{descentOk}{HTML}{2A704A}
\definecolor{descentHint}{HTML}{845A1B}
\definecolor{descentBad}{HTML}{A23C34}
\definecolor{descentOkBg}{HTML}{EEF6F1}
\definecolor{descentHintBg}{HTML}{F8F1E7}
\definecolor{descentBadBg}{HTML}{F8ECEA}
\definecolor{descentOkLine}{HTML}{B8D0C1}
\definecolor{descentHintLine}{HTML}{DAC3A3}
\definecolor{descentBadLine}{HTML}{DAB3AE}
\pagecolor{descentWhite}
\color{descentInk}
\raggedbottom
\setlength{\parindent}{0pt}
\setlength{\parskip}{0.5em}
% Ragged table cells intentionally end short; keep that harmless hbox noise
% out of the log while leaving overfull and vertical boxes fatal below.
\hbadness=10000
\tolerance=1800
\pretolerance=10000
\hyphenpenalty=10000
\emergencystretch=3em
${config.locale === "zh" ? "" : "\\RaggedRight"}
\exhyphenpenalty=10000
\setlist{itemsep=0.18em,topsep=0.32em,leftmargin=1.25em}
\setcounter{tocdepth}{0}
\setcounter{secnumdepth}{0}
\renewcommand{\contentsname}{${config.locale === "zh" ? "目录" : "Contents"}}
\renewcommand{\cfttoctitlefont}{\displayfont\Huge\bfseries\color{descentTeal}}
\renewcommand{\cftpartfont}{\ttfamily\footnotesize\color{descentMuted}}
\renewcommand{\cftpartpagefont}{\ttfamily\footnotesize\color{descentMuted}}
\renewcommand{\cftchapfont}{\normalfont}
\renewcommand{\cftchappagefont}{\ttfamily\footnotesize\color{descentMuted}}
\renewcommand{\cftchapleader}{\cftdotfill{\cftdotsep}}
\setlength{\cftbeforepartskip}{0.62em}
\setlength{\cftbeforechapskip}{0.2em}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[R]{\ttfamily\scriptsize\color{descentMuted}\thepage}
\fancyhead[L]{\ttfamily\scriptsize\color{descentMuted}${latexEscape(config.title)}}
\renewcommand{\headrulewidth}{0pt}
\titleformat{\chapter}[display]{\displayfont\bfseries\color{descentTeal}}{}{0pt}{\Huge}
\titlespacing*{\chapter}{0pt}{0pt}{0.22in}
\titleformat{\section}{\displayfont\Large\bfseries\color{descentTeal}}{\thesection}{0.55em}{}
\titleformat{\subsection}{\displayfont\large\bfseries\color{descentInk}}{\thesubsection}{0.5em}{}
\newcommand{\pdfdaytitle}[1]{{\displayfont\bfseries\fontsize{23}{25}\selectfont #1\par}\vspace{0.04in}}
\renewcommand*{\LettrineTextFont}{\normalfont}
\newcommand{\eyebrow}[1]{\Needspace{4\baselineskip}\par\smallskip{\ttfamily\footnotesize\color{descentTeal}\MakeUppercase{#1}}\par\smallskip}
\newcommand{\sectioneyebrow}[1]{\Needspace{10\baselineskip}\par\vspace{3.5ex plus 1ex minus .2ex}\begingroup\setlength{\parskip}{0pt}{\ttfamily\footnotesize\color{descentTeal}\MakeUppercase{#1}\par}\endgroup\nobreak\vspace{0.02in}}
\newcommand{\sectionwithlabel}[2]{\Needspace{10\baselineskip}\par\vspace{3.5ex plus 1ex minus .2ex}\begingroup\setlength{\parskip}{0pt}{\ttfamily\footnotesize\color{descentTeal}\MakeUppercase{#1}\par}\nobreak\vspace{-0.015in}{\displayfont\Large\bfseries\color{descentTeal}#2\par}\endgroup\nobreak\vspace{0.08in}}
\newcommand{\subsectionwithlabel}[2]{\Needspace{8\baselineskip}\par\vspace{2.2ex plus .7ex minus .2ex}\begingroup\setlength{\parskip}{0pt}{\ttfamily\footnotesize\color{descentTeal}\MakeUppercase{#1}\par}\nobreak\vspace{-0.012in}{\displayfont\large\bfseries\color{descentInk}#2\par}\endgroup\nobreak\vspace{0.06in}}
\newcommand{\blockheading}[1]{\Needspace{4\baselineskip}\par\smallskip{\displayfont\large\bfseries\color{descentInk}#1\par}\nobreak\vspace{0.02in}\noindent\ignorespaces}
\newcommand{\statuschipbase}[4]{\mbox{\tikz[baseline=(chip.base)]{\node[inner xsep=4.2pt,inner ysep=1.7pt,rounded corners=5pt,draw=#3,line width=0.32pt,fill=#2](chip){\tikz[baseline=-0.55ex]\fill[#1] (0,0) circle (1.6pt);\hspace{0.34em}{\ttfamily\fontsize{6.2}{7.2}\selectfont\color{#1}\MakeUppercase{#4}}};}}}
\newcommand{\statuschipok}[1]{\statuschipbase{descentOk}{descentOkBg}{descentOkLine}{#1}}
\newcommand{\statuschiphint}[1]{\statuschipbase{descentHint}{descentHintBg}{descentHintLine}{#1}}
\newcommand{\statuschipbad}[1]{\statuschipbase{descentBad}{descentBadBg}{descentBadLine}{#1}}
\newcommand{\claimtop}[2]{\Needspace{5\baselineskip}\par\vspace{0.10in}\noindent{\ttfamily\small\color{descentTeal}\MakeUppercase{#1}}\if\relax\detokenize{#2}\relax\else\enspace #2\fi\par\nobreak\vspace{-0.05in}}
\newcommand{\leadpara}[2]{\Needspace{7\baselineskip}\par\begingroup\large\color{descentTeal}\setlength{\parindent}{0pt}\sloppy\emergencystretch=3em\lettrine[lines=2,loversize=0.08,lhang=0.02,nindent=0pt,findent=0.08em]{#1}{#2}\par\endgroup\medskip}
\newcommand{\leadparanodrop}[1]{\Needspace{6\baselineskip}\par\begingroup\large\color{descentTeal}\setlength{\parindent}{0pt}\sloppy\emergencystretch=3em#1\par\endgroup\medskip}
\newenvironment{lessonbox}{\begin{tcolorbox}[enhanced,breakable,colback=descentRaised,colframe=descentLine,boxrule=0.4pt,arc=1mm,left=8pt,right=8pt,top=7pt,bottom=7pt]}{\end{tcolorbox}}
\newenvironment{codebox}{\Needspace{5\baselineskip}\par\vspace{0.08in}\begin{tcolorbox}[enhanced,breakable,colback=descentCream,colframe=descentLine,boxrule=0.35pt,arc=1mm,left=8pt,right=8pt,top=7pt,bottom=7pt]\ttfamily\footnotesize\color{descentInk}\RaggedRight\setlength{\parskip}{0pt}\setlength{\baselineskip}{1.22\baselineskip}}{\end{tcolorbox}\vspace{0.08in}}
\newenvironment{comparebox}{\Needspace{12\baselineskip}\par\vspace{0.08in}\begin{tcolorbox}[enhanced,breakable,colback=descentCream,colframe=descentLine,boxrule=0.35pt,arc=1mm,left=8pt,right=8pt,top=8pt,bottom=8pt]\footnotesize\color{descentInk}\setlength{\parskip}{0pt}}{\end{tcolorbox}\vspace{0.06in}}
\newcommand{\tablehead}[1]{{\ttfamily\fontsize{6.4}{7.4}\selectfont\color{descentMuted}\MakeUppercase{#1}}}
\newenvironment{sourcesbox}{\Needspace{8\baselineskip}\par\vspace{0.16in}\begingroup\footnotesize\color{descentMuted}\raggedright\hyphenpenalty=10000\exhyphenpenalty=10000\emergencystretch=2em\setlength{\parskip}{0.32em}\noindent{\color{descentLine}\rule{\linewidth}{0.35pt}}\par\vspace{0.05in}}{\par\endgroup}
\newenvironment{quotebox}{\Needspace{4\baselineskip}\par\vspace{0.12in}\begin{tcolorbox}[enhanced,breakable,blanker,borderline west={1.2pt}{0pt}{descentLine},left=10pt,right=0pt,top=2pt,bottom=2pt]\displayfont\itshape\large\color{descentInk}}{\end{tcolorbox}\vspace{0.08in}}
\newenvironment{notepara}{\par\small\color{descentMuted}\RaggedRight\emergencystretch=1em}{\par}
\newenvironment{pdfintro}{\begingroup\sloppy\emergencystretch=1.8em\exhyphenpenalty=50\relax}{\par\endgroup}
\newenvironment{appendixbody}{%
  \begingroup
  \pagecolor{descentCream}%
  \color{descentInk}%
  \colorlet{descentPaper}{descentCream}%
}{%
  \endgroup
}
\captionsetup{font=small,labelformat=empty,textfont={color=descentMuted}}
\XeTeXlinebreaklocale "zh"
\XeTeXlinebreakskip = 0pt plus 1pt`;
}

function pdfKeywords(config: PdfTemplateConfig): string {
  const common = config.locale === "zh"
    ? ["知识", "科学", "哲学", "推理", "模型", "地图", "理想化"]
    : ["knowledge", "science", "philosophy", "reasoning", "models", "maps", "idealization"];
  return [config.title, config.subtitle, config.publisher, ...common]
    .filter(Boolean)
    .join(", ");
}

export function titlePageLatex(config: PdfTemplateConfig): string {
  const logo = latexPath(brandIconFile(config.root));
  const isZh = config.locale === "zh";
  const eyebrow = config.subtitle;
  const byline = isZh ? `作者：${config.authors}` : `By ${config.authors}`;
  const editor = isZh ? `人工编辑：${config.humanEditor.name}` : `Human editor: ${config.humanEditor.name}`;
  return String.raw`\clearpage
\thispagestyle{empty}
\pagecolor{descentAbyss}
\color{descentBone}
\begingroup
\newgeometry{margin=0in}
\vspace*{2.52in}
\noindent\makebox[0pt][l]{\hspace*{0.68in}
\begin{minipage}{4.55in}
\begin{tikzpicture}
\node[circle,fill=descentBone,inner sep=0pt,minimum size=1.18in] {\includegraphics[width=0.84in]{${logo}}};
\end{tikzpicture}\par
\vspace{0.32in}
{\ttfamily\fontsize{7.8}{10}\selectfont\addfontfeatures{LetterSpace=18}\MakeUppercase{${latexEscape(eyebrow)}}\par}
\vspace{0.18in}
{\displayfont\bfseries\fontsize{29}{31}\selectfont ${latexEscape(config.title)}\par}
\vspace{0.20in}
{\displayfont\itshape\fontsize{13.8}{17}\selectfont ${latexEscape(byline)}\par}
{\displayfont\itshape\fontsize{13.8}{17}\selectfont ${latexEscape(editor)}\par}
\end{minipage}}
\endgroup
\restoregeometry
\clearpage
\pagecolor{descentWhite}
\color{descentInk}`;
}
