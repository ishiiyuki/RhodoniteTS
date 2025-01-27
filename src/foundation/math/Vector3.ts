import {
  IVector2,
  IVector3,
  IVector4,
  IVector,
  IMutableVector3,
} from './IVector';
import {TypedArray, TypedArrayConstructor} from '../../types/CommonTypes';
import {MathUtil} from './MathUtil';
import {CompositionType} from '../definitions/CompositionType';
import {IQuaternion} from './IQuaternion';
import AbstractVector from './AbstractVector';

export class Vector3_<T extends TypedArrayConstructor>
  extends AbstractVector
  implements IVector, IVector3 {
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
    z: number,
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
      this._v = new type(3);
    }

    if (Array.isArray(x)) {
      this._v[0] = x[0];
      this._v[1] = x[1];
      this._v[2] = x[2];
    } else if (typeof x === 'number') {
      this._v[0] = x;
      this._v[1] = y;
      this._v[2] = z;
    } else {
      if (typeof x._v[2] === 'undefined') {
        // IVector2
        this._v[0] = x._v[0];
        this._v[1] = x._v[1];
        this._v[2] = 0;
      } else {
        // IVector3 or IVector4
        this._v[0] = x._v[0];
        this._v[1] = x._v[1];
        this._v[2] = x._v[2];
      }
    }
  }

  get x() {
    return this._v[0];
  }

  get y() {
    return this._v[1];
  }

  get z() {
    return this._v[2];
  }

  get w() {
    return 1;
  }

  get glslStrAsFloat() {
    return `vec3(${MathUtil.convertToStringAsGLSLFloat(
      this._v[0]
    )}, ${MathUtil.convertToStringAsGLSLFloat(
      this._v[1]
    )}, ${MathUtil.convertToStringAsGLSLFloat(this._v[2])})`;
  }

  get glslStrAsInt() {
    return `ivec3(${Math.floor(this._v[0])}, ${Math.floor(
      this._v[1]
    )}, ${Math.floor(this._v[2])})`;
  }

  static get compositionType() {
    return CompositionType.Vec3;
  }

  /**
   * to square length(static version)
   */
  static lengthSquared(vec: IVector3) {
    return vec.lengthSquared();
  }

  static lengthBtw(l_vec: IVector3, r_vec: IVector3) {
    return l_vec.lengthTo(r_vec);
  }

  static angleOfVectors(l_vec: IVector3, r_vec: IVector3) {
    const multipliedLength = l_vec.length() * r_vec.length();
    if (multipliedLength === 0) {
      console.error('length of a vector is 0!');
    }
    const cos_sita = l_vec.dot(r_vec) / multipliedLength;
    const sita = Math.acos(cos_sita);
    return sita;
  }

  static _zero(type: TypedArrayConstructor) {
    return new this(0, 0, 0, {type});
  }

  static _one(type: TypedArrayConstructor) {
    return new this(1, 1, 1, {type});
  }

  static _dummy(type: TypedArrayConstructor) {
    return new this(null, 0, 0, {type});
  }

  /**
   * normalize(static version)
   */
  static _normalize(vec: IVector3, type: TypedArrayConstructor) {
    const length = vec.length();
    return this._divide(vec, length, type);
  }

  /**
   * add value（static version）
   */
  static _add(l_vec: IVector3, r_vec: IVector3, type: TypedArrayConstructor) {
    const x = l_vec._v[0] + r_vec._v[0];
    const y = l_vec._v[1] + r_vec._v[1];
    const z = l_vec._v[2] + r_vec._v[2];
    return new this(x, y, z, {type});
  }

  /**
   * add value（static version）
   */
  static addTo(l_vec: IVector3, r_vec: IVector3, out: IMutableVector3) {
    out._v[0] = l_vec._v[0] + r_vec._v[0];
    out._v[1] = l_vec._v[1] + r_vec._v[1];
    out._v[2] = l_vec._v[2] + r_vec._v[2];
    return out;
  }

  /**
   * subtract(subtract)
   */
  static _subtract(
    l_vec: IVector3,
    r_vec: IVector3,
    type: TypedArrayConstructor
  ) {
    const x = l_vec._v[0] - r_vec._v[0];
    const y = l_vec._v[1] - r_vec._v[1];
    const z = l_vec._v[2] - r_vec._v[2];
    return new this(x, y, z, {type});
  }

  /**
   * subtract(subtract)
   */
  static subtractTo(l_vec: IVector3, r_vec: IVector3, out: IMutableVector3) {
    out._v[0] = l_vec._v[0] - r_vec._v[0];
    out._v[1] = l_vec._v[1] - r_vec._v[1];
    out._v[2] = l_vec._v[2] - r_vec._v[2];
    return out;
  }

  /**
   * multiply(static version)
   */
  static _multiply(vec: IVector3, value: number, type: TypedArrayConstructor) {
    const x = vec._v[0] * value;
    const y = vec._v[1] * value;
    const z = vec._v[2] * value;
    return new this(x, y, z, {type});
  }

  /**
   * multiplyTo(static version)
   */
  static multiplyTo(vec: IVector3, value: number, out: IMutableVector3) {
    out._v[0] = vec._v[0] * value;
    out._v[1] = vec._v[1] * value;
    out._v[2] = vec._v[2] * value;
    return out;
  }

  /**
   * multiply vector(static version)
   */
  static _multiplyVector(
    l_vec: IVector3,
    r_vec: IVector3,
    type: TypedArrayConstructor
  ) {
    const x = l_vec._v[0] * r_vec._v[0];
    const y = l_vec._v[1] * r_vec._v[1];
    const z = l_vec._v[2] * r_vec._v[2];
    return new this(x, y, z, {type});
  }

  /**
   * multiply vector(static version)
   */
  static multiplyVectorTo(
    l_vec: IVector3,
    r_vec: IVector3,
    out: IMutableVector3
  ) {
    out._v[0] = l_vec._v[0] * r_vec._v[0];
    out._v[1] = l_vec._v[1] * r_vec._v[1];
    out._v[2] = l_vec._v[2] * r_vec._v[2];
    return out;
  }

  /**
   * divide(static version)
   */
  static _divide(vec: IVector3, value: number, type: TypedArrayConstructor) {
    let x;
    let y;
    let z;
    if (value !== 0) {
      x = vec._v[0] / value;
      y = vec._v[1] / value;
      z = vec._v[2] / value;
    } else {
      console.error('0 division occurred!');
      x = Infinity;
      y = Infinity;
      z = Infinity;
    }
    return new this(x, y, z, {type});
  }

  /**
   * divide by value(static version)
   */
  static divideTo(vec: IVector3, value: number, out: IMutableVector3) {
    if (value !== 0) {
      out._v[0] = vec._v[0] / value;
      out._v[1] = vec._v[1] / value;
      out._v[2] = vec._v[2] / value;
    } else {
      console.error('0 division occurred!');
      out._v[0] = Infinity;
      out._v[1] = Infinity;
      out._v[2] = Infinity;
    }
    return out;
  }

  /**
   * divide vector(static version)
   */
  static _divideVector(
    l_vec: IVector3,
    r_vec: IVector3,
    type: TypedArrayConstructor
  ) {
    let x;
    let y;
    let z;
    if (r_vec._v[0] !== 0 && r_vec._v[1] !== 0 && r_vec._v[2] !== 0) {
      x = l_vec._v[0] / r_vec._v[0];
      y = l_vec._v[1] / r_vec._v[1];
      z = l_vec._v[2] / r_vec._v[2];
    } else {
      console.error('0 division occurred!');
      x = r_vec._v[0] === 0 ? Infinity : l_vec._v[0] / r_vec._v[0];
      y = r_vec._v[1] === 0 ? Infinity : l_vec._v[1] / r_vec._v[1];
      z = r_vec._v[2] === 0 ? Infinity : l_vec._v[2] / r_vec._v[2];
    }
    return new this(x, y, z, {type});
  }

  /**
   * divide by vector(static version)
   */
  static divideVectorTo(
    l_vec: IVector3,
    r_vec: IVector3,
    out: IMutableVector3
  ) {
    if (r_vec._v[0] !== 0 && r_vec._v[1] !== 0 && r_vec._v[2] !== 0) {
      out._v[0] = l_vec._v[0] / r_vec._v[0];
      out._v[1] = l_vec._v[1] / r_vec._v[1];
      out._v[2] = l_vec._v[2] / r_vec._v[2];
    } else {
      console.error('0 division occurred!');
      out._v[0] = r_vec._v[0] === 0 ? Infinity : l_vec._v[0] / r_vec._v[0];
      out._v[1] = r_vec._v[1] === 0 ? Infinity : l_vec._v[1] / r_vec._v[1];
      out._v[2] = r_vec._v[2] === 0 ? Infinity : l_vec._v[2] / r_vec._v[2];
    }
    return out;
  }

  /**
   * dot product(static version)
   */
  static dot(l_vec: IVector3, r_vec: IVector3) {
    return l_vec.dot(r_vec);
  }

  /**
   * cross product(static version)
   */
  static _cross(l_vec: IVector3, r_vec: IVector3, type: TypedArrayConstructor) {
    const x = l_vec._v[1] * r_vec._v[2] - l_vec._v[2] * r_vec._v[1];
    const y = l_vec._v[2] * r_vec._v[0] - l_vec._v[0] * r_vec._v[2];
    const z = l_vec._v[0] * r_vec._v[1] - l_vec._v[1] * r_vec._v[0];
    return new this(x, y, z, {type});
  }

  /**
   * cross product(static version)
   */
  static crossTo(l_vec: IVector3, r_vec: IVector3, out: IMutableVector3) {
    const x = l_vec._v[1] * r_vec._v[2] - l_vec._v[2] * r_vec._v[1];
    const y = l_vec._v[2] * r_vec._v[0] - l_vec._v[0] * r_vec._v[2];
    const z = l_vec._v[0] * r_vec._v[1] - l_vec._v[1] * r_vec._v[0];
    return out.setComponents(x, y, z);
  }

  /**
   * quaternion * vector3
   */
  static _multiplyQuaternion(
    quat: IQuaternion,
    vec: IVector3,
    type: TypedArrayConstructor
  ) {
    const num = quat._v[0] * 2;
    const num2 = quat._v[1] * 2;
    const num3 = quat._v[2] * 2;
    const num4 = quat._v[0] * num;
    const num5 = quat._v[1] * num2;
    const num6 = quat._v[2] * num3;
    const num7 = quat._v[0] * num2;
    const num8 = quat._v[0] * num3;
    const num9 = quat._v[1] * num3;
    const num10 = quat._v[3] * num;
    const num11 = quat._v[3] * num2;
    const num12 = quat._v[3] * num3;

    const x =
      (1 - (num5 + num6)) * vec._v[0] +
      (num7 - num12) * vec._v[1] +
      (num8 + num11) * vec._v[2];
    const y =
      (num7 + num12) * vec._v[0] +
      (1 - (num4 + num6)) * vec._v[1] +
      (num9 - num10) * vec._v[2];
    const z =
      (num8 - num11) * vec._v[0] +
      (num9 + num10) * vec._v[1] +
      (1 - (num4 + num5)) * vec._v[2];

    return new this(x, y, z, {type});
  }

  /**
   * quaternion * vector3
   */
  static multiplyQuaternionTo(
    quat: IQuaternion,
    vec: IVector3,
    out: IMutableVector3
  ) {
    const num = quat._v[0] * 2;
    const num2 = quat._v[1] * 2;
    const num3 = quat._v[2] * 2;
    const num4 = quat._v[0] * num;
    const num5 = quat._v[1] * num2;
    const num6 = quat._v[2] * num3;
    const num7 = quat._v[0] * num2;
    const num8 = quat._v[0] * num3;
    const num9 = quat._v[1] * num3;
    const num10 = quat._v[3] * num;
    const num11 = quat._v[3] * num2;
    const num12 = quat._v[3] * num3;

    const x =
      (1 - (num5 + num6)) * vec._v[0] +
      (num7 - num12) * vec._v[1] +
      (num8 + num11) * vec._v[2];
    const y =
      (num7 + num12) * vec._v[0] +
      (1 - (num4 + num6)) * vec._v[1] +
      (num9 - num10) * vec._v[2];
    const z =
      (num8 - num11) * vec._v[0] +
      (num9 + num10) * vec._v[1] +
      (1 - (num4 + num5)) * vec._v[2];

    return out.setComponents(x, y, z);
  }

  /**
   * change to string
   */
  toString() {
    return '(' + this._v[0] + ', ' + this._v[1] + ', ' + this._v[2] + ')';
  }

  toStringApproximately() {
    return (
      MathUtil.financial(this._v[0]) +
      ' ' +
      MathUtil.financial(this._v[1]) +
      ' ' +
      MathUtil.financial(this._v[2]) +
      '\n'
    );
  }

  flattenAsArray() {
    return [this._v[0], this._v[1], this._v[2]];
  }

  isDummy() {
    if (this._v.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  isEqual(vec: IVector3, delta: number = Number.EPSILON) {
    if (
      Math.abs(vec._v[0] - this._v[0]) < delta &&
      Math.abs(vec._v[1] - this._v[1]) < delta &&
      Math.abs(vec._v[2] - this._v[2]) < delta
    ) {
      return true;
    } else {
      return false;
    }
  }

  isStrictEqual(vec: IVector3) {
    if (
      this._v[0] === vec._v[0] &&
      this._v[1] === vec._v[1] &&
      this._v[2] === vec._v[2]
    ) {
      return true;
    } else {
      return false;
    }
  }

  at(i: number) {
    return this._v[i];
  }

  length() {
    return Math.hypot(this._v[0], this._v[1], this._v[2]);
  }

  lengthSquared(): number {
    return this._v[0] ** 2 + this._v[1] ** 2 + this._v[2] ** 2;
  }

  lengthTo(vec: IVector3) {
    const deltaX = this._v[0] - vec._v[0];
    const deltaY = this._v[1] - vec._v[1];
    const deltaZ = this._v[2] - vec._v[2];
    return Math.hypot(deltaX, deltaY, deltaZ);
  }

  /**
   * dot product
   */
  dot(vec: IVector3) {
    return (
      this._v[0] * vec._v[0] + this._v[1] * vec._v[1] + this._v[2] * vec._v[2]
    );
  }

  get className() {
    return 'Vector3';
  }

  clone() {
    return new (this.constructor as any)(this._v[0], this._v[1], this._v[2]);
  }

  static lerp(lhs: IVector3, rhs: IVector3, ratio: number) {
    return new Vector3(
      (lhs._v[0] * ratio) + rhs._v[0] * (1 - ratio),
      (lhs._v[1] * ratio) + rhs._v[1] * (1 - ratio),
      (lhs._v[2] * ratio) + rhs._v[2] * (1 - ratio)
    );
  }
}

export default class Vector3 extends Vector3_<Float32ArrayConstructor> {
  constructor(
    x:
      | number
      | TypedArray
      | IVector2
      | IVector3
      | IVector4
      | Array<number>
      | null,
    y?: number,
    z?: number
  ) {
    super(x, y!, z!, {type: Float32Array});
  }

  static zero() {
    return super._zero(Float32Array) as Vector3;
  }

  static one() {
    return super._one(Float32Array) as Vector3;
  }

  static dummy() {
    return super._dummy(Float32Array) as Vector3;
  }

  static normalize(vec: IVector3) {
    return super._normalize(vec, Float32Array) as Vector3;
  }

  static add(l_vec: IVector3, r_vec: IVector3) {
    return super._add(l_vec, r_vec, Float32Array) as Vector3;
  }

  static subtract(l_vec: IVector3, r_vec: IVector3) {
    return super._subtract(l_vec, r_vec, Float32Array) as Vector3;
  }

  static multiply(vec: IVector3, value: number) {
    return super._multiply(vec, value, Float32Array) as Vector3;
  }

  static multiplyVector(l_vec: IVector3, r_vec: IVector3) {
    return super._multiplyVector(l_vec, r_vec, Float32Array) as Vector3;
  }

  static divide(vec: IVector3, value: number) {
    return super._divide(vec, value, Float32Array) as Vector3;
  }

  static divideVector(l_vec: IVector3, r_vec: IVector3) {
    return super._divideVector(l_vec, r_vec, Float32Array) as Vector3;
  }

  static cross(l_vec: IVector3, r_vec: IVector3) {
    return super._cross(l_vec, r_vec, Float32Array) as Vector3;
  }

  static multiplyQuaternion(quat: IQuaternion, vec: IVector3) {
    return super._multiplyQuaternion(quat, vec, Float32Array) as Vector3;
  }

  clone() {
    return super.clone() as Vector3;
  }
}

export class Vector3d extends Vector3_<Float64ArrayConstructor> {
  constructor(
    x:
      | number
      | TypedArray
      | IVector2
      | IVector3
      | IVector4
      | Array<number>
      | null,
    y?: number,
    z?: number
  ) {
    super(x, y!, z!, {type: Float64Array});
  }

  static zero() {
    return super._zero(Float64Array) as Vector3d;
  }

  static one() {
    return super._one(Float64Array) as Vector3d;
  }

  static dummy() {
    return super._dummy(Float64Array) as Vector3d;
  }

  static normalize(vec: IVector3) {
    return super._normalize(vec, Float64Array) as Vector3d;
  }

  static add(l_vec: IVector3, r_vec: IVector3) {
    return super._add(l_vec, r_vec, Float64Array) as Vector3d;
  }

  static subtract(l_vec: IVector3, r_vec: IVector3) {
    return super._subtract(l_vec, r_vec, Float64Array) as Vector3d;
  }

  static multiply(vec: IVector3, value: number) {
    return super._multiply(vec, value, Float64Array) as Vector3d;
  }

  static multiplyVector(l_vec: IVector3, r_vec: IVector3) {
    return super._multiplyVector(l_vec, r_vec, Float64Array) as Vector3d;
  }

  static divide(vec: IVector3, value: number) {
    return super._divide(vec, value, Float64Array) as Vector3d;
  }

  static divideVector(l_vec: IVector3, r_vec: IVector3) {
    return super._divideVector(l_vec, r_vec, Float64Array) as Vector3d;
  }

  static cross(l_vec: IVector3, r_vec: IVector3) {
    return super._cross(l_vec, r_vec, Float64Array) as Vector3d;
  }

  static multiplyQuaternion(quat: IQuaternion, vec: IVector3) {
    return super._multiplyQuaternion(quat, vec, Float64Array) as Vector3d;
  }

  clone() {
    return super.clone() as Vector3d;
  }
}

export type Vector3f = Vector3;
