// createAnimikro — the instance / vocabulary registry (design note 9).
//
// "Design tokens, but for motion." You declare your atoms (named WAAPI
// keyframes + timing) and global defaults once; everything downstream selects
// from that vocabulary instead of inventing. The instance owns the registry,
// so it can resolve preset keys and warn on unknown atom names.
//
// This module is pure and framework-free (no DOM). It produces *unbound* scene
// trees (targets are slot-name strings); binding to real nodes happens in the
// projector (vanilla/ or a future React adapter).

import { resolve } from './resolve.js';

const DEFAULT_DURATIONS = { short: 240, regular: 360, long: 520 };

const DEFAULT_EASINGS = {
  linear: 'linear',
  'ease-in': 'cubic-bezier(0.5, 0.1, 0.5, 0.8)',
  'ease-out': 'cubic-bezier(0.5, 0.2, 0.5, 1.0)',
  'ease-in-out': 'cubic-bezier(0.6, 0.1, 0.2, 0.9)',
};

export function createAnimikro(config = {}) {
  const durations = { ...DEFAULT_DURATIONS, ...config.durations };
  const easings = { ...DEFAULT_EASINGS, ...config.easings };
  const atoms = { ...config.atoms };

  // Resolve an atom key + args into a concrete { keyframes, easing, duration }.
  // Preset strings ("regular", "ease-in") collapse to numbers/cubic-beziers.
  function makeAtom(key, args = []) {
    const factory = atoms[key];
    if (!factory) {
      // Runtime safety to compensate for the stringly-typed vocabulary
      // (design doc, vanilla cautions). Don't throw — degrade to a no-op.
      console.warn(
        `[animikro] unknown atom "${key}". Known: ${Object.keys(atoms).join(', ') || '(none)'}`
      );
      return { keyframes: {}, easing: 'linear', duration: 0 };
    }
    const spec = factory(...args);
    const duration =
      typeof spec.duration === 'number'
        ? spec.duration
        : durations[spec.duration] ?? durations.regular;
    const easing = easings[spec.easing] ?? spec.easing ?? 'linear';
    return { keyframes: spec.keyframes, easing, duration };
  }

  // The authoring toolkit handed to scene builders.
  const t = {
    // A leaf: bind atom `key` to the element(s) at slot `slot` (first match).
    clip(slot, key, ...args) {
      return { type: 'clip', target: slot, atom: makeAtom(key, args) };
    },

    // One atom applied to *every* element matching `slot`, optionally
    // staggered. Expansion happens at bind time, so the count — and therefore
    // the intrinsic duration — depends on the live DOM (design note 6:
    // "10 buttons vs 20 buttons lead to a different duration").
    each(slot, key, opts = {}, ...args) {
      return {
        type: 'each',
        slot,
        stagger: opts.stagger,
        atom: makeAtom(key, args),
      };
    },

    // A scene: compose children on a shared timeline.
    scene(opts, children) {
      if (Array.isArray(opts)) {
        children = opts;
        opts = {};
      }
      return {
        type: 'scene',
        stagger: opts.stagger,
        duration: opts.duration, // optional explicit length -> time-stretch
        children,
      };
    },

    // Place a node on its parent's timeline: give it an id (so siblings can
    // reference it) and/or an `at` offset.
    track(id, node, opts = {}) {
      return { ...node, id, at: opts.at ?? node.at };
    },
  };

  // A scene factory: (props) => unbound node. Reusable; nest by calling it.
  function scene(build) {
    const factory = (props) => build(t, props);
    factory.isAnimikroScene = true;
    return factory;
  }

  return { t, scene, makeAtom, resolve, _durations: durations, _easings: easings };
}

// Bind an unbound tree to real targets, expanding `each` groups.
//
// `ctx` abstracts target lookup so this is DOM-agnostic (the Node test passes a
// fake ctx; the vanilla projector passes one backed by querySelector):
//   ctx.one(slot) -> a single target (or null)
//   ctx.all(slot) -> an array of targets
export function bind(node, ctx) {
  if (typeof node === 'function' && node.isAnimikroScene) {
    node = node();
  }

  if (node.type === 'clip') {
    const target = ctx.one(node.target);
    if (!target) return null; // unmatched slot -> drop the clip
    return { type: 'clip', id: node.id, at: node.at, target, atom: node.atom };
  }

  if (node.type === 'each') {
    const targets = ctx.all(node.slot);
    return {
      type: 'scene',
      id: node.id,
      at: node.at,
      stagger: node.stagger,
      children: targets.map((target) => ({ type: 'clip', target, atom: node.atom })),
    };
  }

  if (node.type === 'scene') {
    return {
      type: 'scene',
      id: node.id,
      at: node.at,
      stagger: node.stagger,
      duration: node.duration,
      children: node.children.map((c) => bind(c, ctx)).filter(Boolean),
    };
  }

  throw new Error(`Cannot bind unknown node type: ${node.type}`);
}
