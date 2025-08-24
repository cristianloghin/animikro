import { AnimationDefinition } from "../types";
import manager from "../core/Animikro";

interface AnimikroAgent {
  play(animationOrKey: AnimationDefinition | string): void;
  pause(animationOrKey: AnimationDefinition | string): void;
  reverse(animationOrKey: AnimationDefinition | string): void;
  restart(animationOrKey: AnimationDefinition | string): void;
  stop(animationOrKey: AnimationDefinition | string): void;
  getState(
    animationOrKey: AnimationDefinition | string
  ): AnimationPlayState | null;
  isAnimationRegistered(animationOrKey: AnimationDefinition | string): boolean;
  playSequence(
    animations: (AnimationDefinition | string)[],
    delay?: number
  ): Promise<void>;
}

class Agent implements AnimikroAgent {
  private getKey(animationOrKey: AnimationDefinition | string): string {
    return typeof animationOrKey === "string"
      ? animationOrKey
      : animationOrKey.key;
  }

  public play(animationOrKey: AnimationDefinition | string): void {
    const key = this.getKey(animationOrKey);
    const animation = manager.getAnimation(key);
    if (animation) {
      manager.start(key);
    } else {
      console.warn(`Animation with key "${key}" not found`);
    }
  }

  public pause(animationOrKey: AnimationDefinition | string): void {
    const key = this.getKey(animationOrKey);
    const animation = manager.getAnimation(key);
    if (animation) {
      manager.pause(key);
    } else {
      console.warn(`Animation with key "${key}" not found`);
    }
  }

  public reverse(animationOrKey: AnimationDefinition | string): void {
    const key = this.getKey(animationOrKey);
    const animation = manager.getAnimation(key);
    if (animation) {
      manager.reverse(key);
    } else {
      console.warn(`Animation with key "${key}" not found`);
    }
  }

  public restart(animationOrKey: AnimationDefinition | string): void {
    const key = this.getKey(animationOrKey);
    const animation = manager.getAnimation(key);
    if (animation) {
      animation.currentTime = 0;
      manager.start(key);
    } else {
      console.warn(`Animation with key "${key}" not found`);
    }
  }

  public stop(animationOrKey: AnimationDefinition | string): void {
    const key = this.getKey(animationOrKey);
    const animation = manager.getAnimation(key);
    if (animation) {
      animation.cancel();
      manager.notifyObservers(key);
    } else {
      console.warn(`Animation with key "${key}" not found`);
    }
  }

  public getState(
    animationOrKey: AnimationDefinition | string
  ): AnimationPlayState | null {
    const key = this.getKey(animationOrKey);
    const animation = manager.getAnimation(key);
    return animation ? animation.playState : null;
  }

  public async playSequence(
    animations: (AnimationDefinition | string)[],
    delay: number = 0
  ): Promise<void> {
    for (const animationOrKey of animations) {
      const key = this.getKey(animationOrKey);
      const animation = manager.getAnimation(key);
      if (animation) {
        manager.start(key);

        // Wait for animation to finish if delay is 0, or wait for the specified delay
        if (delay === 0) {
          await new Promise<void>((resolve) => {
            const checkFinished = () => {
              if (animation.playState === "finished") {
                resolve();
              } else {
                requestAnimationFrame(checkFinished);
              }
            };
            checkFinished();
          });
        } else {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } else {
        console.warn(`Animation with key "${key}" not found in sequence`);
      }
    }
  }

  public isAnimationRegistered(
    animationOrKey: AnimationDefinition | string
  ): boolean {
    const key = this.getKey(animationOrKey);
    return manager.getAnimation(key) !== undefined;
  }
}

function useAnimikroAgent(): AnimikroAgent {
  return new Agent();
}

export { useAnimikroAgent };
