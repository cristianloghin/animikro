// The resolver: a PURE function over a *bound* scene tree.
//
// Design doc, "framework integration": the resolver is a pure computation over
// data, testable in plain JS with no DOM and no framework. This file has zero
// dependencies on the browser — that's the whole point, and it's what the Node
// test exercises.
//
// A *bound* node is one whose `target`s are already real things (DOM elements
// in the browser, or plain strings in tests) and whose `each` groups have been
// expanded to concrete children. Two node shapes:
//
//   clip:  { type:'clip',  id?, at?, target, atom:{ keyframes, easing, duration } }
//   scene: { type:'scene', id?, at?, stagger?, duration?, children:[node...] }
//
// resolve(node) -> { duration, entries:[{ target, keyframes, easing, start, duration }] }
// where `start` is absolute within the resolved node, in milliseconds.

/**
 * Parse an `at` placement spec into an absolute local start time (ms).
 *
 * Supported forms:
 *   number        -> absolute ms within this scene's local clock
 *   "id"          -> the moment sibling `id` starts
 *   "id@0.5"      -> 0.5 through sibling `id` (start + fraction * duration)
 *   "id:end"      -> the moment sibling `id` finishes
 *
 * `startOf(index)` resolves a sibling's start lazily so chains of relative
 * references (B relative to A, A relative to C…) compute correctly.
 */
function resolveAt(at, byId, startOf) {
  if (typeof at === 'number') return at;
  if (typeof at !== 'string') {
    throw new Error(`Invalid "at" spec: ${JSON.stringify(at)}`);
  }

  // "id:end"
  let m = at.match(/^([\w-]+):end$/);
  if (m) {
    const ref = lookup(byId, m[1], at);
    return startOf(ref.index) + ref.res.duration;
  }

  // "id@frac"
  m = at.match(/^([\w-]+)@([0-9.]+)$/);
  if (m) {
    const ref = lookup(byId, m[1], at);
    return startOf(ref.index) + Number(m[2]) * ref.res.duration;
  }

  // "id"
  if (/^[\w-]+$/.test(at)) {
    const ref = lookup(byId, at, at);
    return startOf(ref.index);
  }

  throw new Error(`Unrecognized "at" spec: "${at}"`);
}

function lookup(byId, id, spec) {
  const ref = byId.get(id);
  if (!ref) {
    throw new Error(`"at" spec "${spec}" references unknown sibling id "${id}"`);
  }
  return ref;
}

export function resolve(node) {
  if (node.type === 'clip') {
    return {
      duration: node.atom.duration,
      entries: [
        {
          target: node.target,
          keyframes: node.atom.keyframes,
          easing: node.atom.easing,
          start: 0,
          duration: node.atom.duration,
        },
      ],
    };
  }

  if (node.type !== 'scene') {
    throw new Error(`Unknown node type: ${node.type}`);
  }

  // 1. Resolve every child intrinsically (bottom-up) so we know durations.
  const kids = node.children.map((child) => ({ child, res: resolve(child) }));

  const byId = new Map();
  kids.forEach((k, index) => {
    if (k.child.id) byId.set(k.child.id, { ...k, index });
  });

  // 2. Resolve each child's local start. Relative `at` specs may depend on
  //    other children, so memoize with a cycle guard.
  const starts = new Array(kids.length).fill(undefined);
  const visiting = new Set();

  const startOf = (i) => {
    if (starts[i] !== undefined) return starts[i];
    if (visiting.has(i)) {
      throw new Error(`Cyclic "at" reference involving child index ${i}`);
    }
    visiting.add(i);

    const { child } = kids[i];
    let s;
    if (child.at != null) {
      s = resolveAt(child.at, byId, startOf);
    } else if (node.stagger != null) {
      s = i * node.stagger; // no explicit placement -> stagger by position
    } else {
      s = 0; // default: parallel from the scene's start
    }

    visiting.delete(i);
    starts[i] = s;
    return s;
  };

  kids.forEach((_, i) => startOf(i));

  // 3. Intrinsic duration = the extent of the content (note 6: bottom-up).
  const intrinsic = kids.reduce(
    (max, k, i) => Math.max(max, starts[i] + k.res.duration),
    0
  );

  // 4. Optional time-stretch (note 6): if the scene declares a duration,
  //    scale the whole subtree uniformly to fit — both gaps AND clip
  //    durations, exactly like time-stretching an After Effects pre-comp.
  const scale = node.duration != null && intrinsic > 0
    ? node.duration / intrinsic
    : 1;

  // 5. Flatten: offset each descendant entry by its child's start, scaled.
  const entries = [];
  kids.forEach((k, i) => {
    const base = starts[i] * scale;
    k.res.entries.forEach((e) => {
      entries.push({
        ...e,
        start: base + e.start * scale,
        duration: e.duration * scale,
      });
    });
  });

  return { duration: intrinsic * scale, entries };
}
