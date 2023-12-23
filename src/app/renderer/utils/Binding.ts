class BindingError extends Error {
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BindingError.prototype);
  }
}

interface BindingData {
  obj: object;
  prop: string;
  event?: string;
  eventListener?: () => void;
  formatter?: (value: unknown) => unknown;
}

/**
 * TODO: if parameter not set define it in object instead of throwing an error
 */
class Binding {
  private value: unknown;

  private bindings: BindingData[] = [];

  private objBinding: boolean = false;
  private oldObj: object;

  public constructor(
    private readonly bindingObject: object,
    private readonly bindingProp: string,
    private readonly twoWay = true
  ) {
    this.value = this.getValue(this.bindingObject, this.bindingProp);
    if (this.value instanceof Object) {
      // if we bind an object, create a proxy object for this property
      this.oldObj = this.value;
      this.value = this.defineProxy();
      this.objBinding = true;
    }
    this.defineProperty(this.bindingObject, this.bindingProp);
  }

  private objectHasProperty(obj: object, prop: string): boolean {
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

  private getDeepestObject(obj: object, prop: string) {
    const path = prop.split('.');
    if (path.length < 1) {
      throw new BindingError(`Invalid property path: ${prop}`);
    }
    path.pop(); // Remove the last element
    let current = obj;

    for (const part of path) {
      if (current[part] === undefined) {
        throw new BindingError(`Object does not have property: ${part}`);
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

  private getValue(obj: object, prop: string): unknown {
    const deepestObj = this.getDeepestObject(obj, prop);
    return deepestObj[this.getLastPathPart(prop)];
  }

  private setter = (newValue: unknown): void => {
    if (newValue === this.value) return;
    this.value = newValue;
    this.updateBindings();
  };

  private getter = (): unknown => {
    return this.value;
  };

  private defineProxy(): typeof Proxy {
    const handler = {
      get: (target, key) => {
        if (key == 'isProxy') return true;

        const prop = target[key];

        // return if property not found
        if (typeof prop == 'undefined') return;

        // set value as proxy if object
        if (!prop.isProxy && typeof prop === 'object')
          target[key] = new Proxy(prop, handler);

        return target[key];
      },
      set: (target, key, value) => {
        target[key] = value;
        this.updateBindings();
        return true;
      },
    };

    const deepestObj = this.getDeepestObject(
      this.bindingObject,
      this.bindingProp
    );
    const lastPart = this.getLastPathPart(this.bindingProp);

    deepestObj[lastPart] = new Proxy(deepestObj[lastPart], handler);
    return deepestObj[lastPart];
  }

  private defineProperty(obj: object, prop: string): void {
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

  private resetProperty(obj: object, prop: string): void {
    const deepestObj = this.getDeepestObject(obj, prop);
    const lastPart = this.getLastPathPart(prop);
    Object.defineProperty(deepestObj, lastPart, {
      value: this.value,
      writable: true,
    });
  }

  private updateBindings(): void {
    for (const binding of this.bindings) {
      const { obj, prop, formatter } = binding;
      const elem = this.getDeepestObject(obj, prop);
      elem[this.getLastPathPart(prop)] = formatter
        ? formatter(this.value)
        : this.value;
    }
  }

  public addBinding(
    obj: object | HTMLElement,
    prop: string,
    event?: string,
    formatter?: (value: unknown) => unknown
  ): void {
    if (!this.objectHasProperty(obj, prop)) {
      throw new BindingError(
        `Property ${this.bindingProp} not found in object`
      );
    }

    const deepestObj = this.getDeepestObject(obj, prop);
    const lastPart = this.getLastPathPart(prop);
    const isObject = deepestObj[lastPart] instanceof Object;
    let listener = undefined;

    if (this.twoWay) {
      if (obj instanceof HTMLElement) {
        if (isObject) {
          throw new BindingError(
            `It is not allowed to use two way data binding on an object type via an html element`
          );
        }

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
      formatter: formatter,
    } as BindingData;

    this.bindings.push(binding);

    this.updateBindings();
  }

  public removeBinding(obj: object, prop: string): void {
    const idx = this.bindings.findIndex(
      (b): boolean => obj === b.obj && prop.trim() === b.prop
    );
    if (idx !== -1) {
      const binding = this.bindings.splice(idx, 1)[0];
      if (this.twoWay) {
        if (obj instanceof HTMLElement) {
          const { event, eventListener } = binding;
          if (event && eventListener)
            obj.removeEventListener(event, eventListener);
        } else {
          this.resetProperty(obj, prop);
        }
      }
    }
  }

  public unbind(): void {
    if (this.objBinding) {
      const deepestObj = this.getDeepestObject(
        this.bindingObject,
        this.bindingProp
      );
      const lastPart = this.getLastPathPart(this.bindingProp);
      deepestObj[lastPart] = this.oldObj;
    } else {
      this.resetProperty(this.bindingObject, this.bindingProp);
    }

    for (const binding of this.bindings) {
      this.removeBinding(binding.obj, binding.prop);
    }
  }
}

export { Binding, BindingError };
