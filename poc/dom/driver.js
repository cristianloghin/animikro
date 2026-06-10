// The WAAPI driver: turns a resolved schedule into live animations and hands
// back a controller. Browser-only (this is the one part the Node test can't
// reach). Everything imperative lives here, over the platform's Animation
// objects — no framework, no global registry.

/**
 * @param {{ target:Element, keyframes:object, easing:string, start:number, duration:number }[]} entries
 * @param {number} total  total timeline length in ms
 */
export function createController(entries, total) {
  // Each entry becomes one WAAPI animation whose `delay` encodes its absolute
  // start on the shared timeline. With fill:'both', every animation holds its
  // first frame before its delay and its last frame after — so the whole set
  // behaves as one coordinated, seekable timeline.
  const anims = entries.map((e) => {
    const a = e.target.animate(e.keyframes, {
      duration: e.duration || 0.0001,
      delay: e.start,
      easing: e.easing,
      fill: 'both',
    });
    a.pause(); // we drive playback explicitly
    a.currentTime = 0;
    return a;
  });

  const setRate = (r) => anims.forEach((a) => (a.playbackRate = r));

  const controller = {
    total,

    play() {
      setRate(1);
      anims.forEach((a) => a.play());
      return controller;
    },

    pause() {
      anims.forEach((a) => a.pause());
      return controller;
    },

    // Reverse from the current position — the thing CSS can't do.
    reverse() {
      setRate(-1);
      anims.forEach((a) => a.play());
      return controller;
    },

    // Scrub: place the entire timeline at absolute time `ms`. Because each
    // animation shares the same clock (delay + fill), one assignment per
    // animation positions the whole composition.
    seek(ms) {
      const clamped = Math.max(0, Math.min(ms, total));
      anims.forEach((a) => (a.currentTime = clamped));
      return controller;
    },

    // Current absolute time on the shared timeline (any animation reports it,
    // since they share the clock).
    get time() {
      return anims.length ? anims[0].currentTime ?? 0 : 0;
    },

    get state() {
      if (!anims.length) return 'idle';
      return anims[0].playState; // running | paused | finished | idle
    },

    // Resolves when every animation in the composition has finished.
    get finished() {
      return Promise.all(anims.map((a) => a.finished)).then(() => controller);
    },

    cancel() {
      anims.forEach((a) => a.cancel());
      return controller;
    },
  };

  return controller;
}
