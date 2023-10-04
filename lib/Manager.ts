export interface Observer {
  update(subject: Subject): void;
}

interface Subject {
  addObserver(key: string, observer: Observer): void;
  removeObserver(key: string): void;
  notifyObservers(key?: string): void;
}

export interface ManagerState {
  animations: Map<string, Animation>;
  color?: string;
}

export class Manager implements Subject {
  private static instance: Manager;
  private observers: Map<string, Observer> = new Map();
  private state: ManagerState = {
    animations: new Map(),
  };

  private constructor() {}

  public static getInstance(): Manager {
    if (!Manager.instance) {
      Manager.instance = new Manager();
    }
    return Manager.instance;
  }

  public initializeState(initialState: Partial<ManagerState>): void {
    this.state = { ...this.state, ...initialState };
  }

  public setAnimation(key: string, animation: Animation): void {
    this.state.animations.set(key, animation);
    this.notifyObservers(key);
  }

  public getAnimation(key: string): Animation | undefined {
    return this.state.animations.get(key);
  }

  public removeAnimation(key: string): void {
    this.state.animations.delete(key);
  }

  public start(key: string): void {
    const animation = this.state.animations.get(key);
    if (animation) {
      animation.playbackRate = 1;
      animation.play();
      this.notifyObservers(key);
    }
  }

  public pause(key: string): void {
    this.state.animations.get(key)?.pause();
    this.notifyObservers(key);
  }

  public reverse(key: string): void {
    const animation = this.state.animations.get(key);
    if (animation) {
      animation.playbackRate = -1;
      animation.play();
      this.notifyObservers(key);
    }
  }

  public getColor(): string | undefined {
    return this.state.color;
  }

  public addObserver(key: string, observer: Observer): void {
    this.observers.set(key, observer);
  }

  public removeObserver(key: string): void {
    this.observers.delete(key);
  }

  public notifyObservers(key?: string): void {
    if (key) {
      this.observers.get(key)?.update(this);
    } else {
      this.observers.forEach((observer) => {
        observer.update(this);
      });
    }
  }
}

const instance = Manager.getInstance();
export default instance;
