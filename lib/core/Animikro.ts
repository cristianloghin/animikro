import { AnimationDefinition, AnimikroInterface } from "../types";

export class Animikro implements AnimikroInterface {
  private static instance: Animikro;
  private animationDefinitions: Map<string, AnimationDefinition> = new Map();
  private animations = new Map<string, Animation>();
  private subscribers = new Map<string, Set<() => void>>();

  private constructor() {}

  public static getInstance(): Animikro {
    if (!Animikro.instance) {
      Animikro.instance = new Animikro();
    }
    return Animikro.instance;
  }

  public setAnimation(key: string, animation: Animation): void {
    console.info("Setting animation:", key);
    this.animations.set(key, animation);
    this.notifyObservers(key);
  }

  public getAnimation(key: string): Animation | undefined {
    return this.animations.get(key);
  }

  public removeAnimation(key: string): void {
    console.info("Removing animation:", key);
    this.animations.delete(key);
  }

  public registerAnimationDefinition(definition: AnimationDefinition): string {
    const key =
      definition.name + "_" + Math.random().toString(36).substring(2, 15);

    this.animationDefinitions.set(key, definition);

    return key;
  }

  public getAnimationDefinition(key: string): AnimationDefinition | undefined {
    return this.animationDefinitions.get(key);
  }

  public hasAnimationDefinition(key: string): boolean {
    return this.animationDefinitions.has(key);
  }

  public start(key: string): void {
    const animation = this.animations.get(key);
    if (animation) {
      animation.playbackRate = 1;
      animation.play();
      this.notifyObservers(key);
    }
  }

  public pause(key: string): void {
    const animation = this.animations.get(key);
    animation?.pause();
    this.notifyObservers(key);
  }

  public reverse(key: string): void {
    const animation = this.animations.get(key);
    if (animation) {
      animation.playbackRate = -1;
      animation.play();
      this.notifyObservers(key);
    }
  }

  public notifyObservers(key: string): void {
    this.subscribers.get(key)?.forEach((cb) => cb());
  }

  subscribe = (key: string, cb: () => void): (() => void) => {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)?.add(cb);
    return () => {
      this.subscribers.get(key)?.delete(cb);
    };
  };

  getSnapshot = (key: string): AnimationPlayState => {
    return this.animations.get(key)?.playState || "idle";
  };
}

const instance = Animikro.getInstance();
export default instance;
