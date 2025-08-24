import { mikro, createAnimation } from "../../lib/main";

export const basicAnimation = createAnimation({
  name: "basicAnimation",
  in: mikro(
    {
      fade: [0, 1],
      slide: [
        ["-100%", 0],
        [0, 0],
      ],
    },
    "long",
    "ease-in"
  ),
  out: mikro(
    {
      fade: [1, 0],
      slide: [
        [0, 0],
        ["-100%", 0],
      ],
    },
    "long",
    "ease-out"
  ),
});

const pullInAnimation = mikro(
  {
    fade: [0, 1],
    slide: [
      [200, 0],
      [0, 0],
    ],
  },
  "long",
  "ease-in"
);

const pullOutAnimation = mikro(
  {
    fade: [1, 0],
    slide: [
      ["0px", "0px"],
      ["200px", "0px"],
    ],
  },
  "short",
  "ease-out"
);

export const pullTest = createAnimation({
  name: "pullTest",
  in: pullInAnimation,
  out: pullOutAnimation,
});

export const putTest = createAnimation({
  name: "putTest",
  in: mikro(
    {
      fade: [0, 1],
      slide: [
        [200, 0],
        [0, 0],
      ],
    },
    "long",
    "ease-in"
  ),
  out: mikro(
    {
      fade: [1, 0],
      slide: [
        [0, 0],
        [200, 0],
      ],
    },
    "long",
    "ease-out"
  ),
});

export const sidebarAnimation = createAnimation({
  name: "sidebarAnimation",
  in: mikro(
    {
      move: [
        [-200, 0],
        [0, 0],
      ],
    },
    "regular",
    "ease-in"
  ),
  out: mikro(
    {
      move: [
        [0, 0],
        [-200, 0],
      ],
    },
    "short",
    "ease-out"
  ),
});

export const buttonAnimation = createAnimation({
  name: "buttonAnimation",
  in: mikro({ background: ["#483D8B", "#7766e5ff"] }, "short"),
});

export const containerAnimation = createAnimation({
  name: "containerAnimation",
  in: mikro({ background: ["#FFFFFF", "#F0F0F0"] }, "short"),
  out: mikro({ background: ["#F0F0F0", "#FFFFFF"] }, "short"),
});

export const boxAnimation = createAnimation({
  name: "boxAnimation",
  in: mikro(
    {
      fade: [0, 1],
      slide: [
        [0, -100],
        [0, 0],
      ],
    },
    "regular",
    "ease-in"
  ),
});

export const contentAnimation = createAnimation({
  name: "contentAnimation",
  in: mikro(
    {
      fade: [0, 1],
      slide: [
        [-100, 0],
        [0, 0],
      ],
    },
    "short",
    "ease-in"
  ),
});
