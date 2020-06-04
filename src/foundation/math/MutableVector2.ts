import { Vector2_ } from "./Vector2";
import { IVector2, IVector3, IVector4, IMutableVector } from "./IVector";
import { TypedArray, TypedArrayConstructor } from "../../commontypes/CommonTypes";

export class MutableVector2_<T extends TypedArrayConstructor> extends Vector2_<T> implements IMutableVector, IVector2 {
  constructor(x: number | TypedArray | IVector2 | IVector3 | IVector4 | Array<number> | null, y: number, { type }: { type: T }) {
    super(x as any, y, { type });
  }

  set x(x: number) {
    this.v[0] = x;
  }

  get x() {
    return this.v[0];
  }

  set y(y: number) {
    this.v[1] = y;
  }

  get y() {
    return this.v[1];
  }

  raw() {
    return this.v;
  }

  setAt(i: number, val: number) {
    this.v[i] = val;
    return this;
  }

  setComponents(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  copyComponents(vec: IVector2) {
    return this.setComponents(vec.x, vec.y);
  }

  zero() {
    return this.setComponents(0, 0);
  }

  one() {
    return this.setComponents(1, 1);
  }

  normalize() {
    const length = this.length();
    this.divide(length);
    return this;
  }

  /**
   * add value
   */
  add(vec: IVector2) {
    this.x += vec.x;
    this.y += vec.y;
    return this;
  }

  /**
    * subtract
    */
  subtract(vec: IVector2) {
    this.x -= vec.x;
    this.y -= vec.y;
    return this;
  }

  /**
   * multiply
   */
  multiply(val: number) {
    this.x *= val;
    this.y *= val;
    return this;
  }

  /**
   * multiply vector
   */
  multiplyVector(vec: IVector2) {
    this.x *= vec.x;
    this.y *= vec.y;
    return this;
  }

  /**
   * divide
   */
  divide(val: number) {
    if (val !== 0) {
      this.x /= val;
      this.y /= val;
    } else {
      console.error("0 division occurred!");
      this.x = Infinity;
      this.y = Infinity;
    }

    return this;
  }

  /**
    * divide vector
    */
  divideVector(vec: IVector2) {
    if (vec.x !== 0 && vec.y !== 0) {
      this.x /= vec.x;
      this.y /= vec.y;
    } else {
      console.error("0 division occurred!");
      this.x = vec.x === 0 ? Infinity : this.x / vec.x;
      this.y = vec.y === 0 ? Infinity : this.y / vec.y;
    }
    return this;
  }
}

export default class MutableVector2 extends MutableVector2_<Float32ArrayConstructor> {
  constructor(x: number | TypedArray | IVector2 | IVector3 | IVector4 | Array<number> | null, y?: number) {
    super(x, y!, { type: Float32Array })
  }

  static zero() {
    return new MutableVector2(0, 0);
  }

  static one() {
    return new MutableVector2(1, 1);
  }

  static dummy() {
    return new MutableVector2(null, 0);
  }

  clone() {
    return new MutableVector2(this.x, this.y);
  }
}

export class MutableVector2d extends MutableVector2_<Float64ArrayConstructor> {
  constructor(x: number | TypedArray | IVector2 | IVector3 | IVector4 | Array<number> | null, y?: number) {
    super(x, y!, { type: Float64Array })
  }

  static zero() {
    return new MutableVector2d(0, 0);
  }

  static one() {
    return new MutableVector2d(1, 1);
  }

  static dummy() {
    return new MutableVector2d(null, 0);
  }

  clone() {
    return new MutableVector2d(this.x, this.y);
  }
}

export type MutableVector2f = MutableVector2;
