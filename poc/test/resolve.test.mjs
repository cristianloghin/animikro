// Pure-logic tests for the resolver and the bind/expand pipeline.
// Runnable with: node poc/test/resolve.test.mjs   (no DOM, no framework)
//
// This is the credible "the model works" proof: the hard part — nested
// timelines, relative timing, intrinsic durations that vary with runtime
// content, and time-stretch — is all pure computation, so we assert on it
// directly.

import assert from 'node:assert/strict';
import { createAnimikro, bind } from '../core/createAnimikro.js';
import { resolve } from '../core/resolve.js';

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`  ✓ ${name}`);
}

// A fake DOM context: slots map to N identical string "elements".
function ctx(counts) {
  return {
    one: (slot) => (counts[slot] > 0 ? `${slot}#0` : null),
    all: (slot) => Array.from({ length: counts[slot] ?? 0 }, (_, i) => `${slot}#${i}`),
  };
}

const ani = createAnimikro({
  durations: { short: 200, regular: 400, long: 600 },
  atoms: {
    fadeIn: () => ({ keyframes: { opacity: [0, 1] }, duration: 'regular' }),
    rise: () => ({
      keyframes: { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0)'] },
      duration: 'regular',
    }),
    quick: () => ({ keyframes: { opacity: [0, 1] }, duration: 200 }),
  },
});
const { t } = ani;

console.log('resolver');

test('a leaf clip resolves to its atom duration', () => {
  const bound = bind(t.clip('a', 'fadeIn'), ctx({ a: 1 }));
  const r = resolve(bound);
  assert.equal(r.duration, 400);
  assert.equal(r.entries.length, 1);
  assert.equal(r.entries[0].start, 0);
  assert.equal(r.entries[0].target, 'a#0');
});

test('parallel children -> duration is the longest, all start at 0', () => {
  const scene = t.scene([t.clip('a', 'fadeIn'), t.clip('b', 'quick')]);
  const r = resolve(bind(scene, ctx({ a: 1, b: 1 })));
  assert.equal(r.duration, 400); // max(400, 200)
  assert.deepEqual(r.entries.map((e) => e.start), [0, 0]);
});

test('relative "id@0.5" starts halfway through the referenced sibling', () => {
  // title: fadeIn (400ms). links start at title@0.5 -> 200ms.
  const scene = t.scene([
    t.track('title', t.clip('title', 'fadeIn')),
    t.track('links', t.clip('links', 'quick'), { at: 'title@0.5' }),
  ]);
  const r = resolve(bind(scene, ctx({ title: 1, links: 1 })));
  const byTarget = Object.fromEntries(r.entries.map((e) => [e.target, e]));
  assert.equal(byTarget['title#0'].start, 0);
  assert.equal(byTarget['links#0'].start, 200);
  assert.equal(r.duration, 400); // links: 200 + 200 = 400, ties title
});

test('"id:end" starts when the referenced sibling finishes', () => {
  const scene = t.scene([
    t.track('a', t.clip('a', 'fadeIn')),
    t.track('b', t.clip('b', 'quick'), { at: 'a:end' }),
  ]);
  const r = resolve(bind(scene, ctx({ a: 1, b: 1 })));
  const b = r.entries.find((e) => e.target === 'b#0');
  assert.equal(b.start, 400);
  assert.equal(r.duration, 600); // 400 + 200
});

test('chained relative references resolve transitively', () => {
  // a@0, b@a:end (400), c@b:end (600)
  const scene = t.scene([
    t.track('a', t.clip('a', 'fadeIn')),
    t.track('b', t.clip('b', 'fadeIn'), { at: 'a:end' }),
    t.track('c', t.clip('c', 'quick'), { at: 'b:end' }),
  ]);
  const r = resolve(bind(scene, ctx({ a: 1, b: 1, c: 1 })));
  const s = Object.fromEntries(r.entries.map((e) => [e.target, e.start]));
  assert.deepEqual(s, { 'a#0': 0, 'b#0': 400, 'c#0': 800 });
  assert.equal(r.duration, 1000);
});

test('INTRINSIC duration grows with runtime content (10 vs 20)', () => {
  // The headline note-6 claim: same scene, different element counts ->
  // different total duration, computed automatically.
  const links = ani.scene((tt) => tt.each('link', 'quick', { stagger: 100 }));

  const ten = resolve(bind(links(), ctx({ link: 10 })));
  const twenty = resolve(bind(links(), ctx({ link: 20 })));

  // last item starts at (n-1)*100, runs 200ms.
  assert.equal(ten.duration, 9 * 100 + 200); // 1100
  assert.equal(twenty.duration, 19 * 100 + 200); // 2100
  assert.equal(ten.entries.length, 10);
  assert.equal(twenty.entries.length, 20);
});

test('time-stretch scales a scene to an explicit duration', () => {
  // Intrinsic length is 1100ms (as above); declaring 2200ms doubles
  // everything uniformly — gaps AND clip durations (note 6, the AE move).
  const links = ani.scene((tt) =>
    tt.scene({ stagger: 100, duration: 2200 }, [
      tt.clip('a', 'quick'),
      tt.clip('a', 'quick'),
      tt.clip('a', 'quick'),
    ])
  );
  // intrinsic: starts 0,100,200; last ends 200+200=400 -> scale 2200/400 = 5.5
  const r = resolve(bind(links(), { one: () => 'x', all: () => [] }));
  assert.equal(r.duration, 2200);
  const starts = r.entries.map((e) => e.start);
  assert.deepEqual(starts, [0, 550, 1100]); // 100*5.5 steps
  assert.equal(r.entries[0].duration, 1100); // 200 * 5.5
});

test('nested scenes flatten to absolute times', () => {
  // A "sidebar": title, then a child "links" scene placed at title@0.5.
  const links = ani.scene((tt) => tt.each('link', 'quick', { stagger: 100 }));
  const sidebar = ani.scene((tt) =>
    tt.scene([
      tt.track('title', tt.clip('title', 'fadeIn')),
      tt.track('links', links(), { at: 'title@0.5' }),
    ])
  );
  const r = resolve(bind(sidebar(), ctx({ title: 1, link: 3 })));
  const s = Object.fromEntries(r.entries.map((e) => [e.target, e.start]));
  // title at 0; links scene starts at 200, children staggered +100 within it
  assert.equal(s['title#0'], 0);
  assert.equal(s['link#0'], 200);
  assert.equal(s['link#1'], 300);
  assert.equal(s['link#2'], 400);
});

test('a cyclic "at" reference is caught', () => {
  const scene = t.scene([
    t.track('a', t.clip('a', 'quick'), { at: 'b:end' }),
    t.track('b', t.clip('b', 'quick'), { at: 'a:end' }),
  ]);
  assert.throws(() => resolve(bind(scene, ctx({ a: 1, b: 1 }))), /Cyclic/);
});

test('unmatched slots are dropped, not crashed', () => {
  const scene = t.scene([t.clip('here', 'fadeIn'), t.clip('missing', 'fadeIn')]);
  const r = resolve(bind(scene, ctx({ here: 1, missing: 0 })));
  assert.equal(r.entries.length, 1);
  assert.equal(r.entries[0].target, 'here#0');
});

console.log(`\n${passed} passing\n`);
