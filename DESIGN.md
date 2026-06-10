# animikro — Design Notes

> A synthesis of the project's direction. This is a north star, not a spec —
> it captures *what we're building and why*, so a later session (or a later
> version of me) can pick it up without re-deriving the reasoning.

## Status & history

This repo started as an exploration: a small utility wrapping the Web
Animations API (WAAPI) for tiny React UI animations "without the boilerplate
of more featured libraries." It was parked early — what's on disk (`lib/`) is
~25–30% of a thin wrapper, with several competing directions left side by
side (two `mikro` builders, a global `Manager` singleton, placeholder APIs
like `configurePants`, a stubbed `useAnimikroAgent`, the default Vite README).

The conclusion of the review: **don't finish the prototype — finish the
*engine* described below.** Most of `lib/` gets deleted. The ideas worth
keeping are the WAAPI bet, the `mikro` keyframe builder, and the duration/
easing preset maps — all repurposed into the new model.

## Why this is worth building

When the project was parked, plain CSS caught up to a big chunk of the
original niche:

- **`@starting-style`** enables *enter* animations (animate from a defined
  starting state on first render).
- **`transition-behavior: allow-discrete`** enables *exit* animations
  (transition `display`/discrete properties, so an element stays painted
  while it animates out).
- **View Transitions API** animates between two DOM states (snapshot A,
  snapshot B, animate the diff).

So CSS now owns fire-and-forget enter/exit/state-change for a *single*
element. What CSS still **cannot** do — and what justifies a JS library on
top of WAAPI:

- **Imperative control**: pause / reverse-from-current / seek / scrub /
  playback rate.
- **Sequencing & orchestration**: relative timing between elements,
  staggers, `await`-on-completion (`.finished`).
- **Runtime-computed motion**: values known only at runtime.
- **Coordination across elements on a shared clock** — the big one. CSS has
  no concept of "element B's transition is temporally related to element A's."

The library's job is **the column CSS can't touch**: declarative, coordinated,
controllable, *nested* timelines. WAAPI is the right engine underneath.

## Mental model

Animations are the **glue between static views**. You author the app as a
series of **static states** — pure "what's on screen" CSS, written as if
animation never existed. The static states are the source of truth. Animation
is a **separate, orthogonal layer** over the top. Delete the animation layer
and every state still renders correctly — it just snaps instead of moving.

That layer does exactly three things (the **atoms**):

1. **Enter** — `∅ → A` (how something appears)
2. **Exit** — `A → ∅` (how something disappears)
3. **Change** — `A → B` (a persistent element transitions between two static
   states: position, size, color, layout…)

The discipline that matters: the static CSS must not know animation exists.
Most libraries violate this by making you express the resting state *through*
the animation API. We keep the two concerns separable.

## Design notes (the nine pillars)

1. **Static states are the source of truth.** Author as if animation never
   existed; each state renders correctly and instantly on its own.
2. **Animation is an orthogonal layer.** Remove it and the app still works —
   it just snaps instead of moves.
3. **Three transition atoms:** Enter, Exit, Change.
4. **Coordination on a shared timeline.** Timing between elements is
   *relative* (offsets, overlap — "B starts halfway through A's enter"), never
   hand-tuned magic delays. The unit of reasoning is the **scene**, not the
   element. (Think After Effects: independent layers, one timeline.)
5. **Composability — scenes nest, self-similarly.** The keystone abstraction:

   > **A scene is self-similar. From the outside it is a *clip* — one thing
   > with a duration and an in-point you place on a parent's timeline. From
   > the inside it is a *timeline* — a clock coordinating its own children.**

   Get that one dual interface right and infinite nesting falls out for free,
   because "child scene" and "child element" become the same kind of thing to
   a parent: both are clips with a duration and a start offset. (This is
   exactly an After Effects **pre-comp**.) Time is **local and nested** like a
   coordinate system — each scene's clock starts at its own 0; the hierarchy
   composes globally.
6. **Declarative, and lives *outside* the framework lifecycle.** A scene is a
   value/definition you author once, reuse, serialize, and test with zero
   framework code. Duration resolution is the key fork, and it maps exactly to
   **intrinsic vs. extrinsic sizing, rotated onto the time axis**:
   - **Intrinsic** (`width: max-content`, bottom-up): the scene computes its
     length from its content. *Pacing is fixed, total duration flexes* —
     "each button 500ms, 250ms apart, however long N takes."
   - **Extrinsic** (`width: 100%`, top-down): the scene declares its length;
     children express time as fractions of the parent. *Total is fixed,
     pacing flexes* — "this intro is exactly 1s, distribute the buttons."

   These are **two different authoring intents**, not two implementations of
   one thing, which is why both are needed. **Recommended synthesis
   (the AE move): intrinsic by default + an optional time-stretch operator.**
   A scene is content-sized and can always compute its own length in isolation
   (preserving "authored once, reused anywhere"); a parent may *optionally*
   impose a duration that **scales** the child's resolved timeline to fit.
   One foundation, one optional operator, both intents covered.
7. **A scene is the only primitive.** Everything that animates is a
   scene/comp. A *leaf* is a scene whose timeline holds transition atoms
   (real WAAPI animations) instead of child scenes — that's the base case so
   "everything is a scene" has a floor. A single fading button and a whole
   dashboard are the same kind of thing at different **depths**. Scale is just
   nesting depth. This is the property that keeps the whole system small
   enough to hold in your head — and it's the differentiator (see below).
8. **Scenes are parametrized.** A scene is a pure function
   `(props) => timeline` — the same mental model as a React component
   (`(props) => UI`), different output type. A scene declares the props it
   exposes; TypeScript infers the rest:

   ```ts
   const something = useScene(buttons, { d: 2000 });
   ```

   The def/instance split: `buttons` is the definition (pure, shared); the
   call is a live *instance* bound to this component's DOM. **Props dissolve
   the note-6 fork** — whether a scene is intrinsic or extrinsic is just which
   knobs it exposes (`count`/`stagger` → computed duration; `d` → override/
   stretch; both → consumer chooses). And instantiating-with-props happens at
   **two boundaries with the same operation**: a parent scene including a
   child, and a component including a scene via `useScene`. `useScene` is just
   the framework adapter's name for the universal instantiation operator.
9. **An animikro *instance* is a registry of the consumer's motion
   vocabulary** — *design tokens / theming, but for motion.* You curate the
   vocabulary once; everything downstream *selects* from it instead of
   *inventing*. This is the "stop deciding every time" layer.

   ```ts
   const ani = createAnimikro({ /* template: named atoms + defaults */ });
   const buttons = ani.createScene((tmpl) => ({ /* scene */ }));
   ```

   Atoms are referenced two ways, which unify as **token vs. parametrized
   token**: a bare key `"fadeIn"` (a resolved token, like `bg-blue-500`) is
   the zero-arg case of the function form `fadeIn("slow")` (a token family
   with a constrained, typed variant set, like `bg-blue-{shade}`). Because the
   instance owns the registry, TypeScript infers the available keys *and* each
   atom's parameter types, so the `tmpl` argument inside `createScene` is fully
   typed and self-documenting at the call site. The old, stranded
   `durationMapping` / `easingMapping` from `mikro.ts` belong here — in the
   per-instance template, configurable instead of hardcoded.

## The architecture (one primitive, four layers)

| Layer | What it is | Notes |
|---|---|---|
| **Instance / template** | the motion vocabulary — named atoms + global defaults (durations, easings) | 9 |
| **Atoms** | Enter / Exit / Change, *drawn from* the vocabulary, not hand-written | 3 |
| **Scenes** | compose atoms + child scenes on timelines; parametrized & nested | 4–8 |
| **Projection** | bind scenes to DOM, drive playback (the thin adapter) | — |

A scene graph is **data**: a pure function over `(props + runtime inputs)`.
The resolver (which computes durations, resolves nesting, applies stretch) is
a pure computation over that data — unit-testable in plain JS, independent of
any framework's render timing.

## Framework integration: a projector, not an owner

The core is **framework-agnostic**; a framework adapter is a thin *projector*
that binds the abstract scene graph to real DOM nodes and drives playback.
Hard constraint: **no providers, no HoCs, no wrapper components.** React's
only two jobs:

- **Which DOM node fills which slot** → a **ref factory.** The scene declares
  named targets; the factory mints a ref per target; you spread them onto JSX.
- **When to play** → a **controller.** A plain object over the live WAAPI
  animations (`play` / `pause` / `reverse` / `seek` / `.finished`). Not
  React-state-driven. If a component wants to *render* off `playState`, expose
  it via `useSyncExternalStore` — **not** a provider.

This also fixes the prototype's original sin: the old `Manager` was a global,
implicit, string-keyed singleton that re-rendered every subscriber on every
play-state change via an observer→`setState` loop. `createAnimikro()` is the
*scoped, explicit, parametrized* version of that registry (many instances, no
collisions, no god-object), and `useSyncExternalStore` is the provider-free
way to expose its state.

## Build approach: vanilla first

Build the core to run in a **plain HTML page (HTML + CSS + JS) first**, with
no framework. This is load-bearing, not merely convenient:

- It is the **forcing function** that guarantees the core stays
  framework-free. "Works in an HTML page" *is the proof* the projector
  boundary is clean. (Building React-first is exactly how the prototype's
  timeline state, observer, and hook got fused — you can't lift the core out.)
- The core becomes testable with **zero renderer**.
- The React adapter then collapses to a ~50-line shim that swaps
  selector-binding for ref-binding. Same core, two projectors.
- **Design gift:** vanilla has no mount/unmount, so Enter/Exit can't piggyback
  on a framework lifecycle. You're forced to make **presence an explicit
  operation on the scene** (`scene.enter()` / `.exit()`, or add/remove the
  element) — strictly cleaner than overloading `useEffect`. The framework's
  mount/unmount then just *calls* those operations. (The prototype's ugliest
  code — a `mount` flag threaded through a ref callback to fake exits — is
  exactly the bug you avoid by never letting the framework own presence.)

**Suggested first artifact:** the vanilla core in a single HTML file — the
timeline resolver + one nested scene + a play/pause button. That proves or
breaks the whole model before a line of React exists.

## Positioning (why this isn't "another animation library")

No single library does this today; the *parts* are proven, the *synthesis*
is open:

- **GSAP (Timeline)** — nested timelines, relative positioning; but imperative
  tweening, not a declarative data graph, no vocabulary instance.
- **Theatre.js** — closest comp/sequencer model; but built around a visual
  studio and keyframed sequences, heavy.
- **Framer Motion** — `variants` (named static states) + tree orchestration;
  but React-coupled via `<motion.div>` — the wrapper model we reject.
- **Anime.js v4 / Motion One** — lightweight vanilla timelines / WAAPI-native;
  but thin orchestration, no first-class nesting or vocabulary layer.

The empty space is **the continuum**: the trivial end is owned (AutoAnimate),
the complex end is owned (GSAP/Theatre), but nobody spans both on **one tiny
declarative API**. Because a scene is the only primitive and it nests, scale
is just depth — the same API animates a single button or a dashboard.

> **The property to protect with your life: the leaf case must stay as cheap
> as the dashboard case is powerful.** A one-button fade cannot require
> ceremony, or the library becomes "GSAP, but mine." Tax-free triviality at
> the bottom + power through depth at the top is the whole differentiation.

## Open questions (parked, to resolve when building)

- **Duration resolution pass.** A parent that places a child relative to
  another child's length needs to *know* lengths, which derive bottom-up.
  That implies a resolve/settle pass before playback (like AE computing a
  comp's length). Eager (resolve whole tree, then play) vs. lazy/streaming —
  and how that interacts with async rendering. Leaning eager + intrinsic +
  optional stretch (note 6).
- **Target binding.** Exactly how a scene names its targets/slots and how the
  projector fills them (ref factory in React; selector/element in vanilla).
- **Atom base case.** Confirm the leaf contract: a scene whose timeline holds
  WAAPI animations rather than child scenes.
- **Props × vocabulary seam.** When do scene props (note 8) flow into atom
  selection (note 9)? e.g. a scene prop `speed` choosing `fadeIn(speed)`.
  Likely yes — that's where notes 8 and 9 compose.
- **Presence semantics.** Cascade rules: when a parent scene exits, how/when
  do its children exit?

## What to keep from `lib/`

- The WAAPI bet (`node.animate(...)`).
- The `mikro` keyframe builder concept (one version, standardized — drop the
  margin-based `move`, use `transform` for everything compositor-friendly).
- The `durationMapping` / `easingMapping` presets → into the instance template.

## What to delete

- The global `Manager` singleton (replaced by scoped `createAnimikro`
  instances).
- `configurePants`, `useAnimikroAgent` (stub), `AnimatedComponent` (the
  competing non-hook approach), `old_mikro.ts` and the duplicate `mikro2`.
- The default Vite README.
