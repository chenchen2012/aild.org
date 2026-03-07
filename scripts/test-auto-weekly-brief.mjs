import assert from 'node:assert/strict';

import { normalizeSection, normalizeText, renderMd } from './auto-weekly-brief.mjs';

assert.equal(normalizeText('One\\nTwo'), 'One\nTwo');

assert.deepEqual(normalizeSection({
  heading: 'What changed this week',
  bullets: ['Item one\\n- Item two\\n- Item three'],
}), {
  heading: 'What changed this week',
  bullets: ['Item one', 'Item two', 'Item three'],
});

const markdown = renderMd('en', {
  title: 'AI Leadership Weekly: Governance and Strategy Take Center Stage',
  description: 'Executive brief with escaped newline coverage.',
  sections: [
    {
      heading: 'What changed this week',
      bullets: ['Item one\\n- Item two\\n- Item three'],
    },
  ],
}, {
  date: '2026-03-04',
  sourceListMd: '- [Example](https://example.com) (Source)',
});

assert.match(markdown, /title: "AI Leadership Weekly: Governance and Strategy Take Center Stage"/);
assert.doesNotMatch(markdown, /\\n-/);
assert.match(markdown, /- Item one\n- Item two\n- Item three/);

console.log('auto-weekly-brief regression checks passed');
