// TODO: remove unknown type

class BindingError extends Error {
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BindingError.prototype);
  }
}

interface BindingData {
  obj: unknown;
  prop: string;
  event?: string;
  eventListener?: () => void;
}

/**
 * TODO: if parameter not set define it in object instead of throwing an error
 */
class Binding {
  private bindingObject: object;
  private bindingProp: string;
  private twoWay: boolean;
  private value: unknown;

  private bindings: BindingData[] = [];

  public constructor(bindingObject: object, prop: string, twoWay = true) {
    this.bindingObject = bindingObject;
    this.bindingProp = prop;
    this.twoWay = twoWay;
    this.value = this.getValue(this.bindingObject, this.bindingProp);
    this.defineProperty(this.bindingObject, this.bindingProp);
  }

  private objectHasProperty(obj: unknown, prop: string): boolean {
    const path = prop.split('.');
    let current = obj;

    for (const part of path) {
      if (current[part] !== undefined) {
        current = current[part];
      } else {
        // Property not found at some level
        return false;
      }
    }

    // Property found at all levels
    return true;
  }

  private getDeepestObject(obj: unknown, prop: string) {
    const path = prop.split('.');
    path.pop(); // Remove the last element
    let current = obj;

    for (const part of path) {
      if (current[part] === undefined) {
        throw new BindingError(`Object does not have prop: ${prop}`);
      }
      current = current[part];
    }

    return current;
  }

  private getLastPathPart(prop: string): string {
    const path = prop.split('.');
    const last = path.pop();
    if (last === undefined) {
      throw new BindingError(
        `Property '${this.bindingProp}' not found in object`
      );
    }
    return last;
  }

  private getValue(obj: unknown, prop: string): unknown {
    const deepestObj = this.getDeepestObject(obj, prop);
    return deepestObj[this.getLastPathPart(prop)];
  }

  private setter = (newValue: unknown): void => {
    if (newValue === this.value) return;
    this.value = newValue;
    for (const binding of this.bindings) {
      const { obj, prop } = binding;
      const elem = this.getDeepestObject(obj, prop);
      elem[this.getLastPathPart(prop)] = this.value;
    }
  };

  private getter = (): unknown => {
    return this.value;
  };

  private defineProperty(obj: unknown, prop: string): void {
    if (this.objectHasProperty(obj, prop)) {
      const deepestObj = this.getDeepestObject(obj, prop);
      const lastPart = this.getLastPathPart(prop);

      Object.defineProperty(deepestObj, lastPart, {
        set: this.setter,
        get: this.getter,
      });
    } else {
      throw new BindingError(
        `Property ${this.bindingProp} not found in object`
      );
    }
  }

  private resetProperty(obj: unknown, prop: string): void {
    const deepestObj = this.getDeepestObject(obj, prop);
    const lastPart = this.getLastPathPart(prop);
    Object.defineProperty(deepestObj, lastPart, {
      value: this.value,
      writable: true,
    });
  }

  public addBinding(
    obj: object | HTMLElement,
    prop: string,
    event?: string
  ): void {
    if (!this.objectHasProperty(obj, prop)) {
      throw new BindingError(
        `Property ${this.bindingProp} not found in object`
      );
    }

    const deepestObj = this.getDeepestObject(obj, prop);
    const lastPart = this.getLastPathPart(prop);
    let listener = undefined;

    if (this.twoWay) {
      if (obj instanceof HTMLElement) {
        if (event === undefined) {
          throw new BindingError(
            `Event can't be undefined, if element is an HTML-Element and twoWay is true. Set it to 'none' if no event handler should be used.`
          );
        }
        listener = () => {
          this.setter(deepestObj[lastPart]);
        };
        obj.addEventListener(event, listener);
      } else {
        this.defineProperty(obj, prop);
      }
    }

    const binding = {
      obj: obj,
      prop: prop.trim(),
      event: event,
      eventListener: listener,
    };

    this.bindings.push(binding);

    deepestObj[this.getLastPathPart(prop)] = this.value;
  }

  public removeBinding(element: unknown, prop: string): void {
    const idx = this.bindings.findIndex(
      (b): boolean => element === b.obj && prop.trim() === b.prop
    );
    if (idx !== -1) {
      const binding = this.bindings.splice(idx, 1)[0];
      if (this.twoWay) {
        if (element instanceof HTMLElement) {
          const event = binding.event;
          const listener = binding.eventListener;
          if (event && listener) element.removeEventListener(event, listener);
        } else {
          this.resetProperty(element, prop);
        }
      }
    }
  }

  public unbind(): void {
    this.resetProperty(this.bindingObject, this.bindingProp);
    for (const binding of this.bindings) {
      this.removeBinding(binding.obj, binding.prop);
    }
  }
}

// data-binding='data>username' -> data> bedeutet es gibt ein data array welches aus einer menge von objekten besteht. und aus dem entsprechenden objekt für diese listenid wollen wir den username

export { Binding };
