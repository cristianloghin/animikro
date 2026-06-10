# animikro — vanilla core PoC

A proof-of-concept for the engine described in [`../DESIGN.md`](../DESIGN.md):
a declarative, nested, coordinated animation timeline over the Web Animations
API, with **no framework**, bound to the DOM with `data-*` attributes.

It exists to prove (or break) the hard part of the model before a line of React
is written — exactly the "suggested first artifact" from the design doc.

## Run it

```bash
npm run poc:test     # the resolver test suite (pure logic, no DOM)
npm run poc:serve    # then open http://localhost:5050/demo/
```

`poc:test` runs in Node with no dependencies. `poc:serve` is a ~30-line
dependency-free static server (ES modules can't load over `file://`).

## What it demonstrates

1. **One primitive, nesting.** A scene is the only building block; a "sidebar"
   scene contains a child "links" scene (note 5/7).
2. **Coordination with relative timing.** Links start `at: "title@0.5"` —
   halfway through the title's enter — not a hand-tuned delay (note 4).
3. **Intrinsic duration from the live DOM.** Change the link count in the demo
   and the total recomputes itself; 3 vs 10 links → different duration (note 6).
   Plus optional time-stretch to an explicit duration.
4. **Imperative control over WAAPI.** Play, pause, **reverse-from-current**, and
   **scrub** — the column CSS can't touch.
5. **The `data-*` projector.** `data-ani="slot"` binds nodes to slots (the
   vanilla twin of a React ref factory); tier-1 `data-ani-enter` plays from
   markup alone; `data-ani-state` is at once a CSS selector and a motion trigger.

## Layout

```
poc/
  core/                 framework-free, DOM-free — Node-testable
    resolve.js          the pure resolver (timeline math)
    createAnimikro.js   instance/vocabulary + scene builder + bind
    index.js
  dom/
    driver.js           WAAPI driver -> controller (browser only)
  vanilla/
    project.js          data-* projector: mount / auto / watchStates
  test/
    resolve.test.mjs    pure-logic tests (10, runnable in Node)
  demo/
    index.html          the visual demo
  serve.mjs             tiny static server
```

## The boundary that matters

`core/` and `dom/driver.js` know nothing about `data-*` or any framework. The
vanilla projector is the only file that touches `data-*`. A React adapter would
replace just that file (swap `querySelector` for a ref factory); the core,
resolver, and driver stay byte-for-byte identical. That separation is the whole
thesis — "the framework is a projector, not an owner" — and building vanilla
first is what guarantees it.

## Status

PoC. The resolver is tested and solid. Known open questions (carried from the
design doc): full static-state *diffing* for the Change atom (the demo animates
fixed keyframes rather than reading computed styles), presence/exit cascade
rules, and the React ref-factory surface.
