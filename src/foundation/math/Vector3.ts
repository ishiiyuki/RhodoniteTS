//import GLBoost from './../../globals';
import Vector2 from './Vector2';
import Vector4 from './Vector4';
import is from '../misc/IsUtil';
import { IVector3 } from './IVector';
import { CompositionType } from '../definitions/CompositionType';
import { TypedArray, TypedArrayConstructor } from '../../types/CommonTypes';
import { MutableVector3_ } from './MutableVector3';


export class Vector3_<T extends TypedArrayConstructor> implements IVector3 {
  v: TypedArray;
  constructor(x: number | TypedArray | Vector2 | IVector3 | Vector4 | Array<number> | null, y: number, z: number, { type }: { type: T }) {

    if (ArrayBuffer.isView(x)) {
      this.v = ((x as any) as TypedArray);
      return;
    } else if (x == null) {
      this.v = new type(0);
      return;
    } else {
      this.v = new type(3);
    }

    if (is.not.exist(x)) {
      this.v[0] = 0;
      this.v[1] = 0;
      this.v[2] = 0;
    } else if (Array.isArray(x)) {
      this.v[0] = x[0];
      this.v[1] = x[1];
      this.v[2] = x[2];
    } else if (typeof (x as any).w !== 'undefined') {
      this.v[0] = (x as any).v[0];
      this.v[1] = (x as any).v[1];
      this.v[2] = (x as any).v[2];
    } else if (typeof (x as any).z !== 'undefined') {
      this.v[0] = (x as any).v[0];
      this.v[1] = (x as any).v[1];
      this.v[2] = (x as any).v[2];
    } else if (typeof (x as any).y !== 'undefined') {
      this.v[0] = (x as any).v[0];
      this.v[1] = (x as any).v[1];
      this.v[2] = 0;
    } else {
      this.v[0] = ((x as any) as number);
      this.v[1] = ((y as any) as number);
      this.v[2] = ((z as any) as number);
    }
  }

  get className() {
    return this.constructor.name;
  }

  static get compositionType() {
    return CompositionType.Vec3;
  }

  isStrictEqual(vec: Vector3_<T>) {
    if (this.v[0] === vec.v[0] && this.v[1] === vec.v[1] && this.v[2] === vec.v[2]) {
      return true;
    } else {
      return false;
    }
  }

  isEqual(vec: Vector3_<T>, delta: number = Number.EPSILON) {
    if (Math.abs(vec.v[0] - this.v[0]) < delta &&
      Math.abs(vec.v[1] - this.v[1]) < delta &&
      Math.abs(vec.v[2] - this.v[2]) < delta) {
      return true;
    } else {
      return false;
    }
  }

  isDummy() {
    if (this.v.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  length() {
    return Math.sqrt(this.v[0] * this.v[0] + this.v[1] * this.v[1] + this.v[2] * this.v[2]);
  }

  copyComponents(vec: Vector3_<T>) {
    this.v[0] = vec.v[0];
    this.v[1] = vec.v[1];
    this.v[2] = vec.v[2];
  }
  /**
   * to square length(static version)
   */
  static lengthSquared<T extends TypedArrayConstructor>(vec3: Vector3_<T>) {
    return vec3.v[0] * vec3.v[0] + vec3.v[1] * vec3.v[1] + vec3.v[2] * vec3.v[2];
  }

  lengthTo(vec3: Vector3_<T>) {
    var deltaX = vec3.v[0] - this.v[0];
    var deltaY = vec3.v[1] - this.v[1];
    var deltaZ = vec3.v[2] - this.v[2];
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
  }

  static lengthBtw<T extends TypedArrayConstructor>(lhv: Vector3_<T>, rhv: Vector3_<T>) {
    var deltaX = rhv.v[0] - lhv.v[0];
    var deltaY = rhv.v[1] - lhv.v[1];
    var deltaZ = rhv.v[2] - lhv.v[2];
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
  }

  /**
   * dot product
   */
  dotProduct(vec3: Vector3_<T>) {
    return this.v[0] * vec3.v[0] + this.v[1] * vec3.v[1] + this.v[2] * vec3.v[2];
  }

  /**
   * dot product(static version)
   */
  static dotProduct<T extends TypedArrayConstructor>(lv: Vector3_<T>, rv: Vector3_<T>) {
    return lv.v[0] * rv.v[0] + lv.v[1] * rv.v[1] + lv.v[2] * rv.v[2];
  }

  /**
  * cross product(static version)
  */
  static cross<T extends TypedArrayConstructor>(lv: Vector3_<T>, rv: Vector3_<T>) {
    var x = lv.v[1] * rv.v[2] - lv.v[2] * rv.v[1];
    var y = lv.v[2] * rv.v[0] - lv.v[0] * rv.v[2];
    var z = lv.v[0] * rv.v[1] - lv.v[1] * rv.v[0];

    return new (lv.constructor as any)(x, y, z);
  }

  /**
  * cross product(static version)
  */
  static crossTo<T extends TypedArrayConstructor>(lv: Vector3_<T>, rv: Vector3_<T>, out: MutableVector3_<T>) {
    out.x = lv.v[1] * rv.v[2] - lv.v[2] * rv.v[1];
    out.y = lv.v[2] * rv.v[0] - lv.v[0] * rv.v[2];
    out.z = lv.v[0] * rv.v[1] - lv.v[1] * rv.v[0];

    return out;
  }

  /**
   * normalize(static version)
   */
  static normalize<T extends TypedArrayConstructor>(vec3: Vector3_<T>) {
    var length = vec3.length();
    var newVec = new (vec3.constructor as any)(vec3.v[0], vec3.v[1], vec3.v[2]);
    newVec = Vector3_.divide(newVec, length);

    return newVec;
  }


  /**
   * add value（static version）
   */
  static add<T extends TypedArrayConstructor>(lv: Vector3_<T>, rv: Vector3_<T>) {
    return new (lv.constructor as any)(lv.v[0] + rv.v[0], lv.v[1] + rv.v[1], lv.v[2] + rv.v[2]);
  }

  /**
   * add value（static version）
   */
  static addTo<T extends TypedArrayConstructor>(lv: Vector3_<T>, rv: Vector3_<T>, out: MutableVector3_<T>) {
    out.v[0] = lv.v[0] + rv.v[0];
    out.v[1] = lv.v[1] + rv.v[1];
    out.v[2] = lv.v[2] + rv.v[2];

    return out;
  }


  /**
   * subtract(subtract)
   */
  static subtract<T extends TypedArrayConstructor>(lv: Vector3_<T>, rv: Vector3_<T>) {
    return new (lv.constructor as any)(lv.v[0] - rv.v[0], lv.v[1] - rv.v[1], lv.v[2] - rv.v[2]);
  }

  /**
   * subtract(subtract)
   */
  static subtractTo<T extends TypedArrayConstructor>(lv: Vector3_<T>, rv: Vector3_<T>, out: MutableVector3_<T>) {
    out.v[0] = lv.v[0] - rv.v[0];
    out.v[1] = lv.v[1] - rv.v[1];
    out.v[2] = lv.v[2] - rv.v[2];
    return out;
  }

  /**
   * divide(static version)
   */
  static divide<T extends TypedArrayConstructor>(vec3: Vector3_<T>, val: number) {
    if (val !== 0) {
      return new (vec3.constructor as any)(vec3.v[0] / val, vec3.v[1] / val, vec3.v[2] / val);
    } else {
      console.error("0 division occurred!");
      return new (vec3.constructor as any)(Infinity, Infinity, Infinity);
    }
  }

  /**
   * multiply(static version)
   */
  static multiply<T extends TypedArrayConstructor>(vec3: Vector3_<T>, val: number) {
    return new (vec3.constructor as any)(vec3.v[0] * val, vec3.v[1] * val, vec3.v[2] * val);
  }

  /**
   * multiplyTo(static version)
   */
  static multiplyTo<T extends TypedArrayConstructor>(vec3: Vector3_<T>, val: number, out3: MutableVector3_<T>) {
    out3.x = vec3.v[0] * val;
    out3.y = vec3.v[1] * val;
    out3.z = vec3.v[2] * val;

    return out3;
  }

  /**
   * multiply vector(static version)
   */
  static multiplyVector<T extends TypedArrayConstructor>(vec3: Vector3_<T>, vec: Vector3_<T>) {
    return new (vec3.constructor as any)(vec3.v[0] * vec.v[0], vec3.v[1] * vec.v[1], vec3.v[2] * vec.v[2]);
  }

  static angleOfVectors<T extends TypedArrayConstructor>(lhv: Vector3_<T>, rhv: Vector3_<T>) {
    let cos_sita = Vector3_.dotProduct(lhv, rhv) / (lhv.length() * rhv.length());

    let sita = Math.acos(cos_sita);

    return sita;
  }

  /**
   * divide vector(static version)
   */
  static divideVector<T extends TypedArrayConstructor>(lvec3: Vector3_<T>, rvec3: Vector3_<T>) {
    return new (lvec3.constructor as any)(lvec3.v[0] / rvec3.v[0], lvec3.v[1] / rvec3.v[1], lvec3.v[2] / rvec3.v[2]);
  }

  /**
   * change to string
   */
  toString() {
    return '(' + this.v[0] + ', ' + this.v[1] + ', ' + this.v[2] + ')';
  }

  get x() {
    return this.v[0];
  }

  get y() {
    return this.v[1];
  }

  get z() {
    return this.v[2];
  }

  get w() {
    return 1;
  }


  get raw() {
    return this.v;
  }
}

export default class Vector3 extends Vector3_<Float32ArrayConstructor> {
  constructor(x: number | TypedArray | Vector2 | IVector3 | Vector4 | Array<number> | null, y?: number, z?: number) {
    super(x, y!, z!, { type: Float32Array })
  }

  static zero() {
    return new Vector3(0, 0, 0);
  }

  static one() {
    return new Vector3(1, 1, 1);
  }

  static dummy() {
    return new Vector3(null, 0, 0);
  }

  clone() {
    return new Vector3(this.v[0], this.v[1], this.v[2]);
  }
}

export class Vector3d extends Vector3_<Float64ArrayConstructor> {
  constructor(x: number | TypedArray | Vector2 | IVector3 | Vector4 | Array<number> | null, y?: number, z?: number) {
    super(x, y!, z!, { type: Float64Array })
  }
  static zero() {
    return new Vector3d(0, 0, 0);
  }

  static one() {
    return new Vector3d(1, 1, 1);
  }

  static dummy() {
    return new Vector3d(null, 0, 0);
  }

  clone() {
    return new Vector3d(this.v[0], this.v[1], this.v[2]);
  }
}

export type Vector3f = Vector3;
