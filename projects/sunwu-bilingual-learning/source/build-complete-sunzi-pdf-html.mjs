import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { completeSunziLearning } from "../src/data/complete-sunzi-learning.js";

const projectRoot = resolve(import.meta.dirname, "..", "..");
const outputDir = resolve(projectRoot, "output", "pdf");
const htmlPath = resolve(outputDir, "gensunwu-complete-learning.html");

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function vocab(items) {
  return items
    .map(
      ([word, meaning]) => `
        <div class="word">
          <strong>${esc(word)}</strong>
          <span>${esc(meaning)}</span>
        </div>
      `
    )
    .join("");
}

function chapterPages(chapter) {
  const firstPage = chapter.number * 2 + 1;
  const secondPage = chapter.number * 2 + 2;

  return `
    <section class="page">
      <header class="chapter-head">
        <p class="eyebrow">Chapter ${chapter.number} · ${esc(chapter.englishTitle)}</p>
        <div>
          <span>${String(chapter.number).padStart(2, "0")}</span>
          <div>
            <h1>${esc(chapter.title)}</h1>
            <p>${esc(chapter.theme)}</p>
          </div>
        </div>
      </header>

      <section class="ink-diagram">
        <div class="sun"></div>
        <div class="mountain one"></div>
        <div class="mountain two"></div>
        <div class="table"></div>
        <div class="master"></div>
        <div class="student a"></div>
        <div class="student b"></div>
        <div class="label">${esc(chapter.title)}</div>
      </section>

      <section class="block original">
        <h2>关键原文</h2>
        <p>${esc(chapter.original)}</p>
      </section>

      <section class="two">
        <div class="block">
          <h2>中文导读</h2>
          <p>${esc(chapter.chinese)}</p>
        </div>
        <div class="block english">
          <h2>English Learning Text</h2>
          <p>${esc(chapter.english)}</p>
        </div>
      </section>

      <footer>${esc(completeSunziLearning.bookTitle)} · ${firstPage}</footer>
    </section>

    <section class="page">
      <header class="chapter-head compact">
        <p class="eyebrow">Story · Vocabulary · Discussion</p>
        <div>
          <span>${String(chapter.number).padStart(2, "0")}</span>
          <div>
            <h1>${esc(chapter.title)}</h1>
            <p>${esc(chapter.englishTitle)}</p>
          </div>
        </div>
      </header>

      <section class="two">
        <div class="block">
          <h2>孙武爷爷讲故事</h2>
          <p>${esc(chapter.story)}</p>
        </div>
        <div class="block">
          <h2>今日策略启发</h2>
          <p>${esc(chapter.modernLesson)}</p>
        </div>
      </section>

      <section class="block">
        <h2>英语词汇</h2>
        <div class="vocab">${vocab(chapter.vocabulary)}</div>
      </section>

      <section class="question">
        <h2>亲子讨论 / Learning Task</h2>
        <p>${esc(chapter.question)}</p>
      </section>

      <section class="notes">
        <h2>我的笔记</h2>
        <div></div>
        <div></div>
        <div></div>
      </section>

      <footer>${esc(completeSunziLearning.bookTitle)} · ${secondPage}</footer>
    </section>
  `;
}

const tocRows = completeSunziLearning.chapters
  .map(
    (chapter) => `
      <tr>
        <td>${String(chapter.number).padStart(2, "0")}</td>
        <td>${esc(chapter.title)}<br /><span>${esc(chapter.englishTitle)}</span></td>
        <td>${chapter.number * 2 + 1}</td>
      </tr>
    `
  )
  .join("");

const reviewRows = completeSunziLearning.chapters
  .map(
    (chapter) => `
      <tr>
        <td>${String(chapter.number).padStart(2, "0")}</td>
        <td>${esc(chapter.title)}</td>
        <td>${esc(chapter.theme)}</td>
        <td></td>
      </tr>
    `
  )
  .join("");

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>${esc(completeSunziLearning.subtitle)}</title>
    <style>
      @page { size: A4; margin: 14mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: #18201f;
        background: white;
        font-family: "Songti SC", "STSong", "Noto Serif SC", Georgia, serif;
      }
      .page {
        position: relative;
        min-height: 269mm;
        page-break-after: always;
        overflow: hidden;
      }
      .eyebrow, h2, footer, .toc td:first-child, .toc td:last-child {
        font-family: Inter, Arial, sans-serif;
        letter-spacing: 0;
      }
      .eyebrow {
        margin: 0 0 6mm;
        color: #a74732;
        font-size: 9pt;
        font-weight: 900;
        text-transform: uppercase;
      }
      .cover {
        display: grid;
        align-content: center;
        gap: 12mm;
        padding: 0 5mm;
      }
      .cover h1 {
        margin: 0;
        font-size: 56pt;
        line-height: 1.06;
      }
      .subtitle {
        margin: 6mm 0 0;
        color: #24384d;
        font: 900 18pt Inter, Arial, sans-serif;
      }
      .summary {
        width: 82%;
        margin: 8mm 0 0;
        color: #5f6a62;
        font-size: 11.5pt;
        line-height: 1.9;
      }
      .cover-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 3mm;
      }
      .cover-card {
        min-height: 16mm;
        padding: 2.5mm 3mm;
        border: 1px solid rgba(24, 32, 31, .14);
        border-radius: 3mm;
        background: #f7f4ec;
      }
      .cover-card span {
        color: #a74732;
        font: 900 8pt Inter, Arial, sans-serif;
      }
      .cover-card strong {
        display: block;
        margin-top: 1mm;
        color: #24384d;
      }
      .toc h1, .review h1 {
        margin: 0 0 8mm;
        font-size: 32pt;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      .toc td {
        padding: 2.4mm 0;
        border-top: 1px solid rgba(24, 32, 31, .16);
        vertical-align: top;
        font-size: 10.8pt;
      }
      .toc td:first-child {
        width: 18mm;
        color: #a74732;
        font-weight: 900;
      }
      .toc td:last-child {
        width: 16mm;
        color: #5f6a62;
        text-align: right;
      }
      .toc span {
        color: #5f6a62;
        font-size: 9pt;
      }
      .chapter-head > div {
        display: grid;
        grid-template-columns: 16mm 1fr;
        gap: 5mm;
        align-items: start;
      }
      .chapter-head span {
        display: grid;
        width: 13mm;
        height: 13mm;
        place-items: center;
        border-radius: 50%;
        background: #24384d;
        color: white;
        font: 900 10pt Inter, Arial, sans-serif;
      }
      .chapter-head h1 {
        margin: 0;
        font-size: 28pt;
        line-height: 1.14;
      }
      .chapter-head p {
        margin: 1mm 0 0;
        color: #5f6a62;
        font-size: 11pt;
      }
      .compact { margin-bottom: 10mm; }
      .ink-diagram {
        position: relative;
        height: 62mm;
        margin: 8mm 0 5mm;
        border: 1px solid rgba(24, 32, 31, .14);
        border-radius: 4mm;
        background:
          radial-gradient(circle at 78% 24%, rgba(167, 71, 50, .18), transparent 25mm),
          radial-gradient(circle at 22% 24%, rgba(61, 105, 95, .16), transparent 30mm),
          #f8f6ee;
        overflow: hidden;
      }
      .sun {
        position: absolute;
        top: 8mm;
        right: 18mm;
        width: 24mm;
        height: 24mm;
        border-radius: 50%;
        background: rgba(167, 71, 50, .16);
      }
      .mountain {
        position: absolute;
        bottom: 12mm;
        width: 82mm;
        height: 28mm;
        background: rgba(36, 56, 77, .16);
        clip-path: polygon(0 100%, 22% 52%, 34% 70%, 52% 20%, 74% 68%, 100% 100%);
      }
      .mountain.one { left: 0; }
      .mountain.two { right: -8mm; bottom: 8mm; background: rgba(61, 105, 95, .16); }
      .table {
        position: absolute;
        right: 24mm;
        bottom: 13mm;
        left: 24mm;
        height: 2.5mm;
        border-radius: 99px;
        background: rgba(24, 32, 31, .7);
      }
      .master, .student {
        position: absolute;
        bottom: 16mm;
        border-radius: 12mm 12mm 2mm 2mm;
        background: #18201f;
      }
      .master::before, .student::before {
        position: absolute;
        top: -7mm;
        left: 50%;
        width: 7mm;
        height: 7mm;
        border: 1px solid rgba(24, 32, 31, .75);
        border-radius: 50%;
        background: #f8f1df;
        content: "";
        transform: translateX(-50%);
      }
      .master { left: 34mm; width: 13mm; height: 25mm; }
      .student { width: 9mm; height: 17mm; }
      .student.a { left: 86mm; background: #3d695f; }
      .student.b { left: 103mm; background: #a74732; }
      .label {
        position: absolute;
        right: 28mm;
        bottom: 18mm;
        display: grid;
        width: 28mm;
        height: 16mm;
        place-items: center;
        border: 1.5px solid rgba(184, 137, 63, .8);
        border-radius: 3mm;
        background: rgba(255, 255, 255, .62);
        color: #24384d;
        font-weight: 900;
      }
      .block, .question, .notes {
        margin-top: 4mm;
        padding-top: 3mm;
        border-top: 1px solid rgba(24, 32, 31, .15);
      }
      h2 {
        margin: 0 0 2mm;
        color: #a74732;
        font-size: 8.5pt;
        font-weight: 900;
        text-transform: uppercase;
      }
      .block p, .question p, li {
        margin: 0;
        font-size: 10.7pt;
        line-height: 1.72;
      }
      .original p {
        font-size: 11.5pt;
        font-weight: 900;
      }
      .two {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6mm;
      }
      .english p {
        color: #24384d;
        font-family: Georgia, "Times New Roman", "Songti SC", serif;
      }
      .vocab {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 3mm;
      }
      .word {
        min-height: 16mm;
        padding: 3mm;
        border: 1px solid rgba(61, 105, 95, .18);
        border-radius: 3mm;
        background: rgba(61, 105, 95, .06);
      }
      .word strong {
        display: block;
        color: #3d695f;
        font: 900 9.5pt Inter, Arial, sans-serif;
      }
      .word span {
        display: block;
        margin-top: 1mm;
        color: #5f6a62;
      }
      .question {
        padding: 4mm;
        border: 1px solid rgba(167, 71, 50, .22);
        border-radius: 3mm;
        background: rgba(167, 71, 50, .055);
      }
      .notes div {
        height: 18mm;
        border-bottom: 1px solid rgba(24, 32, 31, .2);
      }
      .review td, .review th {
        border: 1px solid rgba(24, 32, 31, .18);
        padding: 2.2mm;
        font-size: 9.4pt;
      }
      .review th {
        background: #f7f4ec;
        color: #24384d;
        font: 900 8.5pt Inter, Arial, sans-serif;
      }
      footer {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        color: #747d78;
        font-size: 8pt;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <section class="page cover">
      <div>
        <p class="eyebrow">${esc(completeSunziLearning.audience)}</p>
        <h1>${esc(completeSunziLearning.bookTitle)}</h1>
        <p class="subtitle">${esc(completeSunziLearning.subtitle)}</p>
        <p class="summary">${esc(completeSunziLearning.note)}</p>
      </div>
      <div class="cover-grid">
        ${completeSunziLearning.chapters
          .map((chapter) => `<div class="cover-card"><span>${String(chapter.number).padStart(2, "0")}</span><strong>${esc(chapter.title)}</strong></div>`)
          .join("")}
      </div>
      <footer>${esc(completeSunziLearning.bookTitle)} · 1</footer>
    </section>

    <section class="page toc">
      <p class="eyebrow">Contents · 双语目录</p>
      <h1>全十三篇</h1>
      <table>${tocRows}</table>
      <footer>${esc(completeSunziLearning.bookTitle)} · 2</footer>
    </section>

    ${completeSunziLearning.chapters.map(chapterPages).join("")}

    <section class="page review">
      <p class="eyebrow">Review · 全书复习清单</p>
      <h1>十三篇策略地图</h1>
      <table>
        <thead>
          <tr><th>序号</th><th>篇名</th><th>核心主题</th><th>我的掌握程度</th></tr>
        </thead>
        <tbody>${reviewRows}</tbody>
      </table>
      <footer>${esc(completeSunziLearning.bookTitle)} · Review</footer>
    </section>
  </body>
</html>`;

await mkdir(outputDir, { recursive: true });
await writeFile(htmlPath, html, "utf8");
console.log(htmlPath);
