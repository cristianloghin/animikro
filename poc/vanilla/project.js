// The vanilla projector: binds an abstract scene to real DOM via `data-*`
// attributes and drives playback. This is the framework-agnostic edge of the
// library — a React adapter would swap this file's `data-*` lookups for a ref
// factory, but the core (createAnimikro/resolve) and driver stay identical.
//
// Design doc: a `data-*` attribute is the DOM-native twin of React's ref
// factory — it answers "which node fills which slot."

import { bind } from '../core/createAnimikro.js';
import { resolve } from '../core/resolve.js';
import { createController } from '../dom/driver.js';

// DOM-backed target lookup, scoped to a root element.
//   data-ani="slot"  marks an element as filling a named slot.
function domCtx(root) {
  return {
    one: (slot) => root.querySelector(`[data-ani="${slot}"]`),
    all: (slot) => Array.from(root.querySelectorAll(`[data-ani="${slot}"]`)),
  };
}

/**
 * Tier 2 — mount a JS-authored scene against DOM bound by `data-*`.
 * Returns a controller (play/pause/reverse/seek/finished).
 *
 * @param {Element} root        the scene's root element
 * @param {Function|object} sceneFactoryOrNode  an `ani.scene(...)` factory or a node
 * @param {object} [props]
 */
export function mount(root, sceneFactoryOrNode, props) {
  const node =
    typeof sceneFactoryOrNode === 'function'
      ? sceneFactoryOrNode(props)
      : sceneFactoryOrNode;

  const bound = bind(node, domCtx(root));
  const { entries, duration } = resolve(bound);
  return createController(entries, duration);
}

/**
 * Tier 1 — fully declarative enter, zero JS scene. Scans `root` for
 * `[data-ani-enter]` and plays each on mount. A `[data-ani-scene]` ancestor
 * with `data-ani-stagger` groups and staggers its enters.
 *
 * The leaf case (note 7) authored entirely in markup:
 *   <button data-ani-enter="fadeIn">Save</button>
 */
export function auto(root, ani) {
  const groups = new Map(); // sceneEl (or root) -> [els]
  root.querySelectorAll('[data-ani-enter]').forEach((el) => {
    const sceneEl = el.closest('[data-ani-scene]') || root;
    if (!groups.has(sceneEl)) groups.set(sceneEl, []);
    groups.get(sceneEl).push(el);
  });

  const controllers = [];
  for (const [sceneEl, els] of groups) {
    const stagger = Number(sceneEl.dataset?.aniStagger) || 0;
    const children = els.map((el) => ({
      type: 'clip',
      target: el,
      atom: ani.makeAtom(el.dataset.aniEnter),
    }));
    const { entries, duration } = resolve({ type: 'scene', stagger, children });
    controllers.push(createController(entries, duration).play());
  }
  return controllers;
}

/**
 * Tier 1 — the "killer property": a `data-*` attribute is at once a CSS
 * selector and a motion trigger. Watches `[data-ani-state]` elements; when the
 * attribute flips, plays the element's `data-ani-change` atom. CSS owns the
 * resting states off the same attribute (delete this and it still works, it
 * just snaps).
 *
 * Returns a cleanup function that disconnects the observer (design doc:
 * MutationObserver is the vanilla reactivity engine; React skips it).
 */
export function watchStates(root, ani) {
  const els = Array.from(root.querySelectorAll('[data-ani-state][data-ani-change]'));

  const observer = new MutationObserver((records) => {
    for (const rec of records) {
      if (rec.attributeName !== 'data-ani-state') continue;
      const el = rec.target;
      const atom = ani.makeAtom(el.dataset.aniChange);
      const { entries, duration } = resolve({ type: 'clip', target: el, atom });
      createController(entries, duration).play();
    }
  });

  els.forEach((el) =>
    observer.observe(el, { attributes: true, attributeFilter: ['data-ani-state'] })
  );

  return () => observer.disconnect();
}
