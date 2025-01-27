import {
  IVector2,
  IVector3,
  IVector4,
  IVector,
  IMutableVector2,
} from './IVector';
import {TypedArray, TypedArrayConstructor} from '../../types/CommonTypes';
import {MathUtil} from './MathUtil';
import {CompositionType} from '../definitions/CompositionType';
import AbstractVector from './AbstractVector';

export class Vector2_<T extends TypedArrayConstructor> extends AbstractVector {
  constructor(
    x:
      | number
      | TypedArray
      | IVector2
      | IVector3
      | IVector4
      | Array<number>
      | null,
    y: number,
    {type}: {type: T}
  ) {
    super();
    if (ArrayBuffer.isView(x)) {
      this._v = x as TypedArray;
      return;
    } else if (x == null) {
      this._v = new type(0);
      return;
    } else {
      this._v = new type(2);
    }

    if (Array.isArray(x)) {
      this._v[0] = x[0];
      this._v[1] = x[1];
    } else if (typeof x === 'number') {
      this._v[0] = x;
      this._v[1] = y;
    } else {
      this._v[0] = x._v[0];
      this._v[1] = x._v[1];
    }
  }

  get x() {
    return this._v[0];
  }

  get y() {
    return this._v[1];
  }

  get glslStrAsFloat() {
    return `vec2(${MathUtil.convertToStringAsGLSLFloat(
      this._v[0]
    )}, ${MathUtil.convertToStringAsGLSLFloat(this._v[1])})`;
  }

  get glslStrAsInt() {
    return `ivec2(${Math.floor(this._v[0])}, ${Math.floor(this._v[1])})`;
  }

  static get compositionType() {
    return CompositionType.Vec2;
  }

  /**
   * to square length(static version)
   */
  static lengthSquared(vec: IVector2) {
    return vec.lengthSquared();
  }

  static lengthBtw(l_vec: IVector2, r_vec: IVector2) {
    return l_vec.lengthTo(r_vec);
  }

  static angleOfVectors(l_vec: IVector2, r_vec: IVector2) {
    const multipliedLength = l_vec.length() * r_vec.length();
    if (multipliedLength === 0) {
      console.error('length of a vector is 0!');
    }
    const cos_sita = l_vec.dot(r_vec) / multipliedLength;
    const sita = Math.acos(cos_sita);
    return sita;
  }

  static _zero(type: TypedArrayConstructor) {
    return new this(0, 0, {type});
  }

  static _one(type: TypedArrayConstructor) {
    return new this(1, 1, {type});
  }

  static _dummy(type: TypedArrayConstructor) {
    return new this(null, 0, {type});
  }

  /**
   * normalize(static version)
   */
  static _normalize(vec: IVector2, type: TypedArrayConstructor) {
    const length = vec.length();
    return this._divide(vec, length, type);
  }

  /**
   * add value（static version）
   */
  static _add(l_vec: IVector2, r_vec: IVector2, type: TypedArrayConstructor) {
    const x = l_vec._v[0] + r_vec._v[0];
    const y = l_vec._v[1] + r_vec._v[1];
    return new this(x, y, {type});
  }

  /**
   * add value（static version）
   */
  static addTo(l_vec: IVector2, r_vec: IVector2, out: IMutableVector2) {
    out._v[0] = l_vec._v[0] + r_vec._v[0];
    out._v[1] = l_vec._v[1] + r_vec._v[1];
    return out;
  }

  /**
   * subtract value(static version)
   */
  static _subtract(
    l_vec: IVector2,
    r_vec: IVector2,
    type: TypedArrayConstructor
  ) {
    const x = l_vec._v[0] - r_vec._v[0];
    const y = l_vec._v[1] - r_vec._v[1];
    return new this(x, y, {type});
  }

  /**
   * subtract value(static version)
   */
  static subtractTo(l_vec: IVector2, r_vec: IVector2, out: IMutableVector2) {
    out._v[0] = l_vec._v[0] - r_vec._v[0];
    out._v[1] = l_vec._v[1] - r_vec._v[1];
    return out;
  }

  /**
   * multiply value(static version)
   */
  static _multiply(vec: IVector2, value: number, type: TypedArrayConstructor) {
    const x = vec._v[0] * value;
    const y = vec._v[1] * value;
    return new this(x, y, {type});
  }

  /**
   * multiply value(static version)
   */
  static multiplyTo(vec: IVector2, value: number, out: IMutableVector2) {
    out._v[0] = vec._v[0] * value;
    out._v[1] = vec._v[1] * value;
    return out;
  }

  /**
   * multiply vector(static version)
   */
  static _multiplyVector(
    l_vec: IVector2,
    r_vec: IVector2,
    type: TypedArrayConstructor
  ) {
    const x = l_vec._v[0] * r_vec._v[0];
    const y = l_vec._v[1] * r_vec._v[1];
    return new this(x, y, {type});
  }

  /**
   * multiply vector(static version)
   */
  static multiplyVectorTo(
    l_vec: IVector2,
    r_vec: IVector2,
    out: IMutableVector2
  ) {
    out._v[0] = l_vec._v[0] * r_vec._v[0];
    out._v[1] = l_vec._v[1] * r_vec._v[1];
    return out;
  }

  /**
   * divide by value(static version)
   */
  static _divide(vec: IVector2, value: number, type: TypedArrayConstructor) {
    let x;
    let y;
    if (value !== 0) {
      x = vec._v[0] / value;
      y = vec._v[1] / value;
    } else {
      console.error('0 division occurred!');
      x = Infinity;
      y = Infinity;
    }
    return new this(x, y, {type});
  }

  /**
   * divide by value(static version)
   */
  static divideTo(vec: IVector2, value: number, out: IMutableVector2) {
    if (value !== 0) {
      out._v[0] = vec._v[0] / value;
      out._v[1] = vec._v[1] / value;
    } else {
      console.error('0 division occurred!');
      out._v[0] = Infinity;
      out._v[1] = Infinity;
    }
    return out;
  }

  /**
   * divide by vector(static version)
   */
  static _divideVector(
    l_vec: IVector2,
    r_vec: IVector2,
    type: TypedArrayConstructor
  ) {
    let x;
    let y;
    if (r_vec._v[0] !== 0 && r_vec._v[1] !== 0) {
      x = l_vec._v[0] / r_vec._v[0];
      y = l_vec._v[1] / r_vec._v[1];
    } else {
      console.error('0 division occurred!');
      x = r_vec._v[0] === 0 ? Infinity : l_vec._v[0] / r_vec._v[0];
      y = r_vec._v[1] === 0 ? Infinity : l_vec._v[1] / r_vec._v[1];
    }
    return new this(x, y, {type});
  }

  /**
   * divide by vector(static version)
   */
  static divideVectorTo(
    l_vec: IVector2,
    r_vec: IVector2,
    out: IMutableVector2
  ) {
    if (r_vec._v[0] !== 0 && r_vec._v[1] !== 0) {
      out._v[0] = l_vec._v[0] / r_vec._v[0];
      out._v[1] = l_vec._v[1] / r_vec._v[1];
    } else {
      console.error('0 division occurred!');
      out._v[0] = r_vec._v[0] === 0 ? Infinity : l_vec._v[0] / r_vec._v[0];
      out._v[1] = r_vec._v[1] === 0 ? Infinity : l_vec._v[1] / r_vec._v[1];
    }
    return out;
  }

  /**
   * dot product(static version)
   */
  static dot(l_vec: IVector2, r_vec: IVector2) {
    return l_vec.dot(r_vec);
  }

  /**
   * change to string
   */
  toString() {
    return '(' + this._v[0] + ', ' + this._v[1] + ')';
  }

  toStringApproximately() {
    return (
      MathUtil.financial(this._v[0]) +
      ' ' +
      MathUtil.financial(this._v[1]) +
      '\n'
    );
  }

  flattenAsArray() {
    return [this._v[0], this._v[1]];
  }

  isDummy() {
    if (this._v.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  isEqual(vec: IVector2, delta: number = Number.EPSILON) {
    if (
      Math.abs(vec._v[0] - this._v[0]) < delta &&
      Math.abs(vec._v[1] - this._v[1]) < delta
    ) {
      return true;
    } else {
      return false;
    }
  }

  isStrictEqual(vec: IVector2) {
    if (this._v[0] === vec._v[0] && this._v[1] === vec._v[1]) {
      return true;
    } else {
      return false;
    }
  }

  at(i: number) {
    return this._v[i];
  }

  length() {
    return Math.hypot(this._v[0], this._v[1]);
  }

  lengthSquared(): number {
    return this._v[0] ** 2 + this._v[1] ** 2;
  }

  lengthTo(vec: IVector2) {
    const deltaX = this._v[0] - vec._v[0];
    const deltaY = this._v[1] - vec._v[1];
    return Math.hypot(deltaX, deltaY);
  }

  /**
   * dot product
   */
  dot(vec: IVector2) {
    return this._v[0] * vec._v[0] + this._v[1] * vec._v[1];
  }

  clone() {
    return new (this.constructor as any)(this._v[0], this._v[1]);
  }
}

export default class Vector2
  extends Vector2_<Float32ArrayConstructor>
  implements IVector, IVector2 {
  constructor(
    x:
      | number
      | TypedArray
      | IVector2
      | IVector3
      | IVector4
      | Array<number>
      | null,
    y?: number
  ) {
    super(x, y!, {type: Float32Array});
  }

  static zero() {
    return super._zero(Float32Array) as Vector2;
  }

  static one() {
    return super._one(Float32Array) as Vector2;
  }

  static dummy() {
    return super._dummy(Float32Array) as Vector2;
  }

  static normalize(vec: IVector2) {
    return super._normalize(vec, Float32Array) as Vector2;
  }

  static add(l_vec: IVector2, r_vec: IVector2) {
    return super._add(l_vec, r_vec, Float32Array) as Vector2;
  }

  static subtract(l_vec: IVector2, r_vec: IVector2) {
    return super._subtract(l_vec, r_vec, Float32Array) as Vector2;
  }

  static multiply(vec: IVector2, value: number) {
    return super._multiply(vec, value, Float32Array) as Vector2;
  }

  static multiplyVector(l_vec: IVector2, r_vec: IVector2) {
    return super._multiplyVector(l_vec, r_vec, Float32Array) as Vector2;
  }

  static divide(vec: IVector2, value: number) {
    return super._divide(vec, value, Float32Array) as Vector2;
  }

  static divideVector(l_vec: IVector2, r_vec: IVector2) {
    return super._divideVector(l_vec, r_vec, Float32Array) as Vector2;
  }

  get className() {
    return 'Vector2';
  }

  clone() {
    return super.clone() as Vector2;
  }
}

export class Vector2d extends Vector2_<Float64ArrayConstructor> {
  constructor(
    x:
      | number
      | TypedArray
      | IVector2
      | IVector3
      | IVector4
      | Array<number>
      | null,
    y?: number
  ) {
    super(x, y!, {type: Float64Array});
  }

  static zero() {
    return super._zero(Float64Array) as Vector2d;
  }

  static one() {
    return super._one(Float64Array) as Vector2d;
  }

  static dummy() {
    return super._dummy(Float64Array) as Vector2d;
  }

  static normalize(vec: IVector2) {
    return super._normalize(vec, Float64Array) as Vector2d;
  }

  static add(l_vec: IVector2, r_vec: IVector2) {
    return super._add(l_vec, r_vec, Float64Array) as Vector2d;
  }

  static subtract(l_vec: IVector2, r_vec: IVector2) {
    return super._subtract(l_vec, r_vec, Float64Array) as Vector2d;
  }

  static multiply(vec: IVector2, value: number) {
    return super._multiply(vec, value, Float64Array) as Vector2d;
  }

  static multiplyVector(l_vec: IVector2, r_vec: IVector2) {
    return super._multiplyVector(l_vec, r_vec, Float64Array) as Vector2d;
  }

  static divide(vec: IVector2, value: number) {
    return super._divide(vec, value, Float64Array) as Vector2d;
  }

  static divideVector(l_vec: IVector2, r_vec: IVector2) {
    return super._divideVector(l_vec, r_vec, Float64Array) as Vector2d;
  }

  clone() {
    return super.clone() as Vector2d;
  }
}

export type Vector2f = Vector2;
