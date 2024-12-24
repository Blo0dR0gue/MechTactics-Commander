import { Formatter } from './formatter/Formatter';

class BindingError extends Error {
  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BindingError.prototype);
  }
}

interface BindingData<Target, Destination> {
  obj: object;
  prop: string;
  twoWay: boolean;
  event?: string;
  eventListener?: () => void;
  formatter?: Formatter<Target, Destination>;
}

/**
 * TODO: if parameter not set define it in object instead of throwing an error
 */
class Binding<BindingType> {
  private value!: BindingType;

  private bindings: BindingData<BindingType, unknown>[] = [];

  private objBinding: boolean = false;

  bindingObject: object;
  bindingProp: string;

  public constructor(obj: object, prop: string) {
    this.bindingObject = this.getDeepestObject(obj, prop);
    this.bindingProp = this.getLastPathPart(prop);

    if (!Object.hasOwn(this.bindingObject, '__binding__')) this.bindingObject['__binding__'] = {};

    if (Object.hasOwn(this.bindingObject['__binding__'], this.bindingProp)) {
      return this.bindingObject['__binding__'][this.bindingProp]['model'];
    }

    this.bindingObject['__binding__'][this.bindingProp] = {};
    this.bindingObject['__binding__'][this.bindingProp]['model'] = this;

    this.value = this.bindingObject[this.bindingProp];

    if (this.value instanceof Object) {
      // if we bind an object, create a proxy object for this property
      this.value = this.defineProxy(this.bindingObject, this.bindingProp);
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

  private getDeepestObject(obj: object, prop: string): object {
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
      throw new BindingError(`Property '${this.bindingProp}' not found in object`);
    }
    return last;
  }

  private setter = (newValue: BindingType): void => {
    if ((this.objBinding && this.value['target'] === newValue) || this.value === newValue) return;
    this.value = newValue;
    if (this.objBinding) {
      this.value = this.defineProxy(this.bindingObject, this.bindingProp);
    }
    this.updateBindings();
  };

  private getter = (): BindingType | ProxyConstructor => {
    return this.value;
  };

  private defineProxy(obj: object, prop: string): BindingType {
    if (!Object.hasOwn(obj, prop)) {
      throw new BindingError(`Object ${obj} does not have the property ${prop}`);
    }

    const handler = {
      get: (target, key): unknown => {
        if (key === 'isProxy') return true;
        if (key === 'target') return target;

        const prop = target[key];

        // return if property not found
        if (typeof prop == 'undefined') return;

        // set value as proxy if object
        if (!prop.isProxy && typeof prop === 'object') target[key] = new Proxy(prop, handler);

        return target[key];
      },
      set: (target, key, value): boolean => {
        if (key === target) return false;
        target[key] = value;
        this.updateBindings();
        return true;
      }
    };

    const proxy = new Proxy(obj[prop], handler) as BindingType;

    return proxy;
  }

  private removeProxy(obj: object, prop: string): unknown {
    if (!Object.hasOwn(obj, prop)) {
      throw new BindingError(`Object ${obj} does not have the property ${prop}`);
    }
    if (!obj[prop]['isProxy']) {
      `${obj[prop]} is not a proxy element`;
    }

    for (const key of Object.keys(obj[prop])) {
      if (obj[prop][key]['isProxy']) {
        this.removeProxy(obj[prop], key);
      }
    }

    obj[prop] = obj[prop]['target'];

    return obj[prop];
  }

  private defineProperty(obj: object, prop: string): void {
    if (Object.hasOwn(obj, prop)) {
      const deepestObj = this.getDeepestObject(obj, prop);
      const lastPart = this.getLastPathPart(prop);

      Object.defineProperty(deepestObj, lastPart, {
        set: this.setter,
        get: this.getter
      });
    } else {
      throw new BindingError(`Property ${prop} not found in object ${obj}`);
    }
  }

  private resetProperty(obj: object, prop: string): void {
    const deepestObj = this.getDeepestObject(obj, prop);
    const lastPart = this.getLastPathPart(prop);
    Object.defineProperty(deepestObj, lastPart, {
      value: this.value,
      writable: true
    });
    delete deepestObj['__binding__'][prop];
  }

  private updateBindings(): void {
    for (const binding of this.bindings) {
      const { obj, prop, formatter } = binding;
      const elem = this.getDeepestObject(obj, prop);
      elem[this.getLastPathPart(prop)] = formatter ? formatter.format(this.value) : this.value;
    }
  }

  public addBinding<Type>(obj: object | HTMLElement, prop: string, twoWay: boolean, formatter?: Formatter<BindingType, Type>, event?: string): void {
    if (!this.objectHasProperty(obj, prop)) {
      throw new BindingError(`Property ${this.bindingProp} not found in object`);
    }

    const deepestObj = this.getDeepestObject(obj, prop);
    const lastPart = this.getLastPathPart(prop);
    let listener: undefined | (() => void) = undefined;

    if (twoWay) {
      if (obj instanceof HTMLElement) {
        if (!formatter) {
          throw new BindingError(`It is not allowed to use two way data binding with an html element without an formatter!!!`);
        }

        if (event === undefined) {
          throw new BindingError(`Event can't be undefined, if element is an HTML-Element and twoWay is true.`);
        }

        listener = (): void => {
          this.setter(formatter ? formatter.parse(deepestObj[lastPart]) : deepestObj[lastPart]);
        };
        obj.addEventListener(event, listener);
      } else {
        this.defineProperty(obj, prop);
      }
    }

    const binding = {
      obj: obj,
      prop: prop.trim(),
      twoWay: twoWay,
      event: event,
      eventListener: listener,
      formatter: formatter
    } as BindingData<BindingType, Type>;

    this.bindings.push(binding);

    this.updateBindings();
  }

  public removeBinding(obj: object, prop: string): void {
    const idx = this.bindings.findIndex((b): boolean => obj === b.obj && prop.trim() === b.prop);
    if (idx !== -1) {
      const binding = this.bindings.splice(idx, 1)[0];
      const { event, eventListener, twoWay } = binding;
      if (twoWay) {
        if (obj instanceof HTMLElement) {
          if (event && eventListener) obj.removeEventListener(event, eventListener);
        } else {
          this.resetProperty(obj, prop);
        }
      }
    }
  }

  public unbind(): void {
    this.resetProperty(this.bindingObject, this.bindingProp);
    if (this.objBinding) {
      const deepestObj = this.getDeepestObject(this.bindingObject, this.bindingProp);
      const lastPart = this.getLastPathPart(this.bindingProp);
      this.removeProxy(deepestObj, lastPart);
    }

    for (const binding of this.bindings) {
      this.removeBinding(binding.obj, binding.prop);
    }
  }
}

export { Binding, BindingError };
