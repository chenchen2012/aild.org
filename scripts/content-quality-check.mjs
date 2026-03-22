import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const targets = [
  { dir: path.join(ROOT, 'src/content/docs'), lang: 'en' },
  { dir: path.join(ROOT, 'src/content/zhdocs'), lang: 'zh' },
];

function splitFrontmatter(source) {
  const m = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return null;
  return source.slice(m[0].length).trim();
}

function score(body, lang) {
  const headings = (body.match(/^##\s+/gm) || []).length;
  const bullets = (body.match(/^\s*-\s+/gm) || []).length;
  const ordered = (body.match(/^\s*\d+\.\s+/gm) || []).length;
  if (lang === 'zh') {
    const cjk = (body.match(/[\u4e00-\u9fff]/g) || []).length;
    return { length: cjk, headings, bullets, ordered };
  }
  const words = (body.match(/[A-Za-z0-9_]+/g) || []).length;
  return { length: words, headings, bullets, ordered };
}

let hasError = false;

for (const { dir, lang } of targets) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  for (const file of files) {
    if (file.startsWith('weekly-ai-leadership-brief-')) continue;
    const full = path.join(dir, file);
    const raw = fs.readFileSync(full, 'utf8');
    const body = splitFrontmatter(raw);
    if (!body) {
      console.error(`Missing frontmatter: ${path.relative(ROOT, full)}`);
      hasError = true;
      continue;
    }

    const { length, headings, bullets, ordered } = score(body, lang);
    const minLength = lang === 'zh' ? 160 : 90;
    const minHeadings = 2;
    const minListItems = 3;
    const listItems = bullets + ordered;

    const failures = [];
    if (length < minLength) failures.push(`length ${length} < ${minLength}`);
    if (headings < minHeadings) failures.push(`headings ${headings} < ${minHeadings}`);
    if (listItems < minListItems) failures.push(`list_items ${listItems} < ${minListItems}`);

    if (failures.length > 0) {
      console.error(`QUALITY_FAIL ${path.relative(ROOT, full)} :: ${failures.join(', ')}`);
      hasError = true;
    }
  }
}

if (hasError) {
  console.error('\nContent quality check failed.');
  process.exit(1);
}

console.log('Content quality check passed.');
