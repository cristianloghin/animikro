interface AnimikroAgent {
  play(name: string): void;
}

class Agent implements AnimikroAgent {
  public play(name: string): void {
    console.log('play', name);
  }
}

function useAnimikroAgent() {
  return new Agent();
}

export { useAnimikroAgent };
