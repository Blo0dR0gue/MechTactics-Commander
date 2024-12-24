// TODO: COMMENT, TEST

/**
 * Min-Heap implantation
 */
class Heap<Type> {
  private items: HeapElement<Type>[];
  private itemCount: number;

  public constructor() {
    this.items = [];
    this.itemCount = 0;
  }

  public add(element: Type, priority: number): void {
    const item = {} as HeapElement<Type>;
    item.heapIndex = this.itemCount;
    item.element = element;
    item.priority = priority;
    this.items[this.itemCount] = item;
    this.sortUp(item);
    this.itemCount += 1;
  }

  public pop(): { element: Type; priority: number } {
    const first = this.items[0];
    this.itemCount -= 1;
    this.items[0] = this.items[this.itemCount];
    this.items[0].heapIndex = 0;
    this.sortDown(this.items[0]);
    return { element: first.element, priority: first.priority };
  }

  public size(): number {
    return this.items.length;
  }

  public updateItem(item: Type, newPriority: number): void {
    const index = this.items.findIndex((el) => el.element === item);
    if (index !== -1) {
      this.items[index].priority = newPriority;
      this.sortUp(this.items[index]);
    }
  }

  public contains(item: Type): boolean {
    const index = this.items.findIndex((el) => el.element === item);
    return index !== -1;
  }

  private sortUp(item: HeapElement<Type>): void {
    let parentIndex = Math.floor((item.heapIndex - 1) / 2);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (parentIndex === -1) break;
      const parentItem = this.items[parentIndex];
      if (item.priority < parentItem.priority) {
        this.swap(item, parentItem);
      } else {
        break;
      }
      parentIndex = Math.floor((item.heapIndex - 1) / 2);
    }
  }

  private sortDown(item: HeapElement<Type>): void {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const childIndexLeft = Math.floor(item.heapIndex * 2 + 1);
      const childIndexRight = Math.floor(item.heapIndex * 2 + 2);
      let swapIndex = 0;
      if (childIndexLeft < this.itemCount) {
        swapIndex = childIndexLeft;

        if (childIndexRight < this.itemCount) {
          if (this.items[childIndexLeft].priority > this.items[childIndexRight].priority) {
            swapIndex = childIndexRight;
          }
        }

        if (item.priority > this.items[swapIndex].priority) {
          this.swap(item, this.items[swapIndex]);
        } else {
          return;
        }
      } else {
        return;
      }
    }
  }

  private swap(item1: HeapElement<Type>, item2: HeapElement<Type>): void {
    this.items[item1.heapIndex] = item2;
    this.items[item2.heapIndex] = item1;
    const item1Index = item1.heapIndex;
    item1.heapIndex = item2.heapIndex;
    item2.heapIndex = item1Index;
  }

  public displayHeapTree(): void {
    this.displayHeapTreeRecursive(0, '');
  }

  private displayHeapTreeRecursive(index: number, indent: string): void {
    if (index < this.itemCount) {
      const item = this.items[index];
      console.log(indent + `Priority: ${item.priority}, Element: ${item.element}`);
      const childIndent = indent + '  ';
      this.displayHeapTreeRecursive(2 * index + 1, childIndent); // Left child
      this.displayHeapTreeRecursive(2 * index + 2, childIndent); // Right child
    }
  }
}

type HeapElement<Type> = {
  heapIndex: number;
  priority: number;
  element: Type;
};

export { Heap };
