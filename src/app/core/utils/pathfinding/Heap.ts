class Heap<Type extends HeapElement> {
  private items: Type[];
  private itemCount = 0;

  public add(item: Type) {
    item.heapIndex = this.itemCount;
    this.items[this.itemCount] = item;
    this.sortUp(item);
    this.itemCount += 1;
  }

  public pop(): Type {
    const first = this.items[0];
    this.itemCount -= 1;
    this.items[0] = this.items[this.itemCount];
    this.items[0].heapIndex = 0;
    this.sortDown(this.items[0]);
    return first;
  }

  public updateItem(item: Type) {
    this.sortUp(item);
  }

  public contains(item: Type): boolean {
    return this.items[item.heapIndex] === item;
  }

  private sortUp(item: Type) {
    let parentIndex = Math.floor((item.heapIndex - 1) / 2);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const parentItem = this.items[parentIndex];
      if (item.compare(parentItem) > 0) {
        this.swap(item, parentItem);
      } else {
        break;
      }
      parentIndex = (item.heapIndex - 1) / 2;
    }
  }

  private sortDown(item: Type) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const childIndexLeft = Math.floor(item.heapIndex * 2 + 1);
      const childIndexRight = Math.floor(item.heapIndex * 2 + 2);
      let swapIndex = 0;
      if (childIndexLeft < this.itemCount) {
        swapIndex = childIndexLeft;

        if (childIndexRight < this.itemCount) {
          if (
            this.items[childIndexLeft].compare(this.items[childIndexRight]) < 0
          ) {
            swapIndex = childIndexRight;
          }
        }

        if (item.compare(this.items[swapIndex]) < 0) {
          this.swap(item, this.items[swapIndex]);
        } else {
          return;
        }
      } else {
        return;
      }
    }
  }

  private swap(item1: Type, item2: Type) {
    this.items[item1.heapIndex] = item2;
    this.items[item2.heapIndex] = item1;
    const item1Index = item1.heapIndex;
    item1.heapIndex = item2.heapIndex;
    item2.heapIndex = item1Index;
  }
}

interface HeapElement {
  heapIndex: number;
  compare(element2: HeapElement): number;
}

export { Heap, HeapElement };
