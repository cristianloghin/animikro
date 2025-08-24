import { AnimationDefinition } from "../types";

export function createAnimation(
  config: AnimationDefinition
): AnimationDefinition {
  return {
    name: config.name,
    in: config.in,
    out: config.out,
    hover: config.hover,
  };
}
