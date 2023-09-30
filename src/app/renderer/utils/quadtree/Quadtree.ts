// Lightweight fork of https://github.com/timohausmann/quadtree-ts/ to support negative numbers

import { Vector } from '../../models/map/Vector';
import { Circle } from './Circle';

export interface NodeGeometry {
  /**
   * Coordinate of the node
   */
  coord: Vector;

  /**
   * Width of the node
   */
  width: number;

  /**
   * Height of the node
   */
  height: number;
}

/**
 * Quadtree Constructor Properties
 */
export interface QuadtreeProps {
  /**
   * Width of the node.
   */
  width: number;

  /**
   * Height of the node.
   */
  height: number;

  /**
   * Center of the node.
   * @defaultValue `0`
   */
  x?: number;

  /**
   * Center of the node.
   * @defaultValue `0`
   */
  y?: number;

  /**
   * Max objects this node can hold before it splits.
   * @defaultValue `10`
   */
  maxObjects?: number;

  /**
   * Total max nesting levels of the root Quadtree node.
   * @defaultValue `4`
   */
  maxLevels?: number;
}

export class Quadtree<ObjectsType extends Circle> {
  /**
   * The numeric boundaries of this node.
   * @readonly
   */
  bounds: NodeGeometry;

  /**
   * Max objects this node can hold before it splits.
   * @defaultValue `10`
   * @readonly
   */
  maxObjects: number;

  /**
   * Total max nesting levels of the root Quadtree node.
   * @defaultValue `4`
   * @readonly
   */
  maxLevels: number;

  /**
   * The level of this node.
   * @defaultValue `0`
   * @readonly
   */
  level: number;

  /**
   * Array of objects in this node.
   * @defaultValue `[]`
   * @readonly
   */
  objects: ObjectsType[];

  /**
   * Subnodes of this node
   * @defaultValue `[]`
   * @readonly
   */
  nodes: Quadtree<ObjectsType>[];

  constructor(props: QuadtreeProps, level = 0) {
    this.bounds = {
      coord: new Vector(props.x || 0, props.y || 0),
      width: props.width,
      height: props.height,
    };
    this.maxObjects =
      typeof props.maxObjects === 'number' ? props.maxObjects : 10;
    this.maxLevels = typeof props.maxLevels === 'number' ? props.maxLevels : 4;
    this.level = level;

    this.objects = [];
    this.nodes = [];
  }

  getIndex(obj: Circle): number[] {
    const indexes = [];

    if (obj.coord.getX() + obj.r > this.bounds.coord.getX()) {
      // right
      if (obj.coord.getY() + obj.r > this.bounds.coord.getY()) {
        // top right
        indexes.push(0);
      }
      if (obj.coord.getY() - obj.r < this.bounds.coord.getY()) {
        // bottom right
        indexes.push(3);
      }
    }
    if (obj.coord.getX() - obj.r < this.bounds.coord.getX()) {
      // left
      if (obj.coord.getY() + obj.r > this.bounds.coord.getY()) {
        // top left
        indexes.push(1);
      }
      if (obj.coord.getY() - obj.r < this.bounds.coord.getY()) {
        // bottom left
        indexes.push(2);
      }
    }

    return indexes;
  }

  split(): void {
    const level = this.level + 1;
    const width = this.bounds.width / 2;
    const height = this.bounds.height / 2;

    const coords = [
      {
        x: this.bounds.coord.getX() + width / 2,
        y: this.bounds.coord.getY() + height / 2,
      }, // top right
      {
        x: this.bounds.coord.getX() - width / 2,
        y: this.bounds.coord.getY() + height / 2,
      }, // top left
      {
        x: this.bounds.coord.getX() - width / 2,
        y: this.bounds.coord.getY() - height / 2,
      }, // bottom left
      {
        x: this.bounds.coord.getX() + width / 2,
        y: this.bounds.coord.getY() - height / 2,
      }, // bottom right
    ];

    for (let i = 0; i < 4; i++) {
      this.nodes[i] = new Quadtree(
        {
          x: coords[i].x,
          y: coords[i].y,
          width,
          height,
          maxObjects: this.maxObjects,
          maxLevels: this.maxLevels,
        },
        level
      );
    }
  }

  insert(obj: ObjectsType): void {
    //if we have subnodes, call insert on matching subnodes
    if (this.nodes.length) {
      const indexes = this.getIndex(obj);

      for (let i = 0; i < indexes.length; i++) {
        this.nodes[indexes[i]].insert(obj);
      }
      return;
    }

    //otherwise, store object here
    this.objects.push(obj);

    //maxObjects reached
    if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
      //split if we don't already have subnodes
      if (!this.nodes.length) {
        this.split();
      }

      //add all objects to their corresponding subnode
      for (let i = 0; i < this.objects.length; i++) {
        const indexes = this.getIndex(this.objects[i]);
        for (let k = 0; k < indexes.length; k++) {
          this.nodes[indexes[k]].insert(this.objects[i]);
        }
      }

      //clean up this node
      this.objects = [];
    }
  }

  retrieve(obj: Circle): ObjectsType[] {
    const indexes = this.getIndex(obj);
    const returnObjects = new Set<ObjectsType>();

    // Retrieve objects from this node
    for (let i = 0; i < this.objects.length; i++) {
      const c1 = this.objects[i];
      if (obj.intersect(c1)) {
        returnObjects.add(c1);
      }
    }

    // Retrieve objects from subnodes
    if (this.nodes.length) {
      for (let i = 0; i < indexes.length; i++) {
        const subnodeObjects = this.nodes[indexes[i]].retrieve(obj);
        for (const subnodeObj of subnodeObjects) {
          returnObjects.add(subnodeObj);
        }
      }
    }

    return [...returnObjects]; // Convert the Set back to an array
  }

  clear(): void {
    this.objects = [];

    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes.length) {
        this.nodes[i].clear();
      }
    }

    this.nodes = [];
  }
}
