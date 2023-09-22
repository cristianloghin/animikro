export interface AgentObserver {
  update(subject: Agent): void;
}

interface Agent {
  addObserver(AgentObserver: AgentObserver): void;
  removeObserver(AgentObserver: AgentObserver): void;
  notifyObservers(): void;
}

export interface AgentState {
  animations: Map<string, Animation>;
  color?: string;
}

export class AnimationAgent implements Agent {
  private static instance: AnimationAgent;
  private observers: AgentObserver[] = [];
  private state: AgentState = {
    animations: new Map(),
  };

  private constructor() {}

  public static getInstance(): AnimationAgent {
    if (!AnimationAgent.instance) {
      AnimationAgent.instance = new AnimationAgent();
    }
    return AnimationAgent.instance;
  }

  public initializeState(initialState: Partial<AgentState>): void {
    this.state = { ...this.state, ...initialState };
  }

  public setAnimation(key: string, animation: Animation): void {
    this.state.animations.set(key, animation);
  }

  public getAnimation(key: string): Animation | undefined {
    return this.state.animations.get(key);
  }

  public removeAnimation(key: string): void {
    this.state.animations.delete(key);
  }

  public start(key: string): void {
    this.state.animations.get(key)?.play();
    this.notifyObservers();
  }

  public pause(key: string): void {
    this.state.animations.get(key)?.pause();
    this.notifyObservers();
  }

  public getColor(): string | undefined {
    return this.state.color;
  }

  public addObserver(AgentObserver: AgentObserver): void {
    this.observers.push(AgentObserver);
  }

  public removeObserver(AgentObserver: AgentObserver): void {
    const index = this.observers.indexOf(AgentObserver);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  public notifyObservers(): void {
    for (const AgentObserver of this.observers) {
      AgentObserver.update(this);
    }
  }
}

const instance = AnimationAgent.getInstance();
export default instance;
