// TODO: Add global events???
class EventHandler<Type> {
  private listeners: ((data: Type) => void)[];

  public constructor() {
    this.listeners = [];
  }

  public subscribe(listener: (data: Type) => void): void {
    this.listeners.push(listener);
  }

  public unsubscribe(listener: (data: Type) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  public invoke(data: Type): void {
    this.listeners.forEach((listener) => {
      listener(data);
    });
  }
}

export { EventHandler };
