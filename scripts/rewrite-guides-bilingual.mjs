import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATE = new Date().toISOString().slice(0, 10);
const API_KEY = process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
const MODEL = process.env.AI_MODEL || 'deepseek-chat';
const API_URL = process.env.AI_API_URL || 'https://api.deepseek.com/chat/completions';

if (!API_KEY) {
  console.error('Missing AI API key. Set AI_API_KEY or DEEPSEEK_API_KEY.');
  process.exit(1);
}

const slugs = process.argv.slice(2);
if (slugs.length === 0) {
  console.error('Usage: node scripts/rewrite-guides-bilingual.mjs <slug> [slug...]');
  process.exit(1);
}

function splitFrontmatter(source) {
  const m = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return null;
  return { frontmatter: m[0], body: source.slice(m[0].length).trim() };
}

function updateDate(frontmatter, date) {
  if (/^updatedDate:\s*['"].*?['"]\s*$/m.test(frontmatter)) {
    return frontmatter.replace(/^updatedDate:\s*['"].*?['"]\s*$/m, `updatedDate: '${date}'`);
  }
  return frontmatter.replace(/^pubDate:\s*['"].*?['"]\s*$/m, (line) => `${line}\nupdatedDate: '${date}'`);
}

function extractJsonPayload(text = '') {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) return text.slice(first, last + 1).trim();
  return null;
}

function buildPrompt(slug, enBody, zhBody) {
  return `You are editing AILD.org bilingual executive knowledge pages.

Task:
- Rewrite BOTH English and Chinese article bodies for slug "${slug}".
- Keep core topic and intent, but make writing feel like a serious executive briefing.
- Remove fluffy, generic, or AI-sounding phrasing.
- Make each version concrete, practical, and commercially useful.

Hard requirements for BOTH languages:
1) Use Markdown with clear sections and concise paragraphs.
2) Include these sections (exact headings in each language):
   English:
   - "## Why this matters now"
   - "## What leaders should do in the next 90 days"
   - "## Failure modes to avoid"
   Chinese:
   - "## 为什么这是现在的问题"
   - "## 未来90天管理层该做什么"
   - "## 需避免的失败模式"
3) Include specific leadership actions and governance boundaries.
4) No hype, no future-fantasy tone, no filler.
5) Keep it scannable for busy executives.
6) Keep internal links if naturally relevant.

Return strict JSON only:
{
  "enBody": "full rewritten markdown body only",
  "zhBody": "full rewritten markdown body only"
}

Current English body:
${enBody}

Current Chinese body:
${zhBody}
`;
}

async function rewriteOne(slug) {
  const enFile = path.join(ROOT, 'src/content/docs', `${slug}.md`);
  const zhFile = path.join(ROOT, 'src/content/zhdocs', `${slug}.md`);
  if (!fs.existsSync(enFile) || !fs.existsSync(zhFile)) {
    throw new Error(`Missing pair for slug: ${slug}`);
  }

  const enRaw = fs.readFileSync(enFile, 'utf8');
  const zhRaw = fs.readFileSync(zhFile, 'utf8');
  const enParsed = splitFrontmatter(enRaw);
  const zhParsed = splitFrontmatter(zhRaw);
  if (!enParsed || !zhParsed) {
    throw new Error(`Invalid frontmatter in slug: ${slug}`);
  }

  const prompt = buildPrompt(slug, enParsed.body, zhParsed.body);
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 3200,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Return strict JSON only.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`API request failed for ${slug}: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  const payload = extractJsonPayload(raw);
  if (!payload) throw new Error(`No JSON payload for ${slug}`);

  let parsed;
  try {
    parsed = JSON.parse(payload);
  } catch (e) {
    throw new Error(`Invalid JSON for ${slug}: ${e.message}`);
  }

  const enBody = String(parsed.enBody || '').trim();
  const zhBody = String(parsed.zhBody || '').trim();
  if (!enBody.includes('## Why this matters now') || !zhBody.includes('## 为什么这是现在的问题')) {
    throw new Error(`Required sections missing for ${slug}`);
  }

  const enFrontmatter = updateDate(enParsed.frontmatter, DATE).trimEnd();
  const zhFrontmatter = updateDate(zhParsed.frontmatter, DATE).trimEnd();
  fs.writeFileSync(enFile, `${enFrontmatter}\n\n${enBody}\n`);
  fs.writeFileSync(zhFile, `${zhFrontmatter}\n\n${zhBody}\n`);
  console.log(`rewritten: ${slug}`);
}

for (const slug of slugs) {
  await rewriteOne(slug);
}

console.log(`Done. Rewritten ${slugs.length} bilingual guide pairs.`);
