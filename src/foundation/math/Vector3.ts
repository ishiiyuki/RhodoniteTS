//import GLBoost from './../../globals';
import Vector2 from './Vector2';
import Vector4 from './Vector4';
import is from '../misc/IsUtil';
import {IVector3} from './IVector';
import { CompositionType } from '../definitions/CompositionType';


export class Vector3_<T extends TypedArrayConstructor> implements IVector3 {
  v: TypedArray;
  constructor(x:number|TypedArray|Vector2|IVector3|Vector4|Array<number>|null, y:number, z:number, {type}: {type: T}) {

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
      this.v[0] = (x as any).x;
      this.v[1] = (x as any).y;
      this.v[2] = (x as any).z;
    } else if (typeof (x as any).z !== 'undefined') {
      this.v[0] = (x as any).x;
      this.v[1] = (x as any).y;
      this.v[2] = (x as any).z;
    } else if (typeof (x as any).y !== 'undefined') {
      this.v[0] = (x as any).x;
      this.v[1] = (x as any).y;
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

  isStrictEqual(vec:Vector3_<T>) {
    if (this.x === vec.x && this.y === vec.y && this.z === vec.z) {
      return true;
    } else {
      return false;
    }
  }

  isEqual(vec: Vector3_<T>, delta: number = Number.EPSILON) {
    if (Math.abs(vec.x - this.x) < delta &&
      Math.abs(vec.y - this.y) < delta &&
      Math.abs(vec.z - this.z) < delta) {
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
    return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
  }

  copyComponents(vec: Vector3_<T>) {
    this.v[0] = vec.v[0];
    this.v[1] = vec.v[1];
    this.v[2] = vec.v[2];
  }
  /**
   * to square length(static verison)
   */
  static lengthSquared<T extends TypedArrayConstructor>(vec3:Vector3_<T>) {
    return vec3.x*vec3.x + vec3.y*vec3.y + vec3.z*vec3.z;
  }

  lengthTo(vec3:Vector3_<T>) {
    var deltaX = vec3.x - this.x;
    var deltaY = vec3.y - this.y;
    var deltaZ = vec3.z - this.z;
    return Math.sqrt(deltaX*deltaX + deltaY*deltaY + deltaZ*deltaZ);
  }

  static lengthBtw<T extends TypedArrayConstructor>(lhv:Vector3_<T>, rhv:Vector3_<T>) {
    var deltaX = rhv.x - lhv.x;
    var deltaY = rhv.y - lhv.y;
    var deltaZ = rhv.z - lhv.z;
    return Math.sqrt(deltaX*deltaX + deltaY*deltaY + deltaZ*deltaZ);
  }

  /**
   * dot product
   */
  dotProduct(vec3:Vector3_<T>) {
      return this.x * vec3.x + this.y * vec3.y + this.z * vec3.z;
  }

  /**
   * dot product(static version)
   */
  static dotProduct<T extends TypedArrayConstructor>(lv:Vector3_<T>, rv:Vector3_<T>) {
    return lv.x * rv.x + lv.y * rv.y + lv.z * rv.z;
  }

  /**
  * cross product(static version)
  */
  static cross<T extends TypedArrayConstructor>(lv:Vector3_<T>, rv:Vector3_<T>) {
    var x = lv.y*rv.z - lv.z*rv.y;
    var y = lv.z*rv.x - lv.x*rv.z;
    var z = lv.x*rv.y - lv.y*rv.x;

    return new (lv.constructor as any)(x, y, z);
  }


  /**
   * normalize(static version)
   */
  static normalize<T extends TypedArrayConstructor>(vec3:Vector3_<T>) {
    var length = vec3.length();
    var newVec = new (vec3.constructor as any)(vec3.x, vec3.y, vec3.z);
    newVec = Vector3_.divide(newVec, length);

    return newVec;
  }


  /**
   * add value（static version）
   */
  static add<T extends TypedArrayConstructor>(lv:Vector3_<T>, rv:Vector3_<T>) {
    return new (lv.constructor as any)(lv.x + rv.x, lv.y + rv.y, lv.z + rv.z);
  }


  /**
   * subtract(subtract)
   */
  static subtract<T extends TypedArrayConstructor>(lv:Vector3_<T>, rv:Vector3_<T>) {
    return new (lv.constructor as any)(lv.x - rv.x, lv.y - rv.y, lv.z - rv.z);
  }



  /**
   * divide(static version)
   */
  static divide<T extends TypedArrayConstructor>(vec3:Vector3_<T>, val:number) {
    if (val !== 0) {
      return new (vec3.constructor as any)(vec3.x / val, vec3.y / val, vec3.z / val);
    } else {
      console.error("0 division occured!");
      return new (vec3.constructor as any)(Infinity, Infinity, Infinity);
    }
  }

  /**
   * multiply(static version)
   */
  static multiply<T extends TypedArrayConstructor>(vec3:Vector3_<T>, val:number) {
    return new (vec3.constructor as any)(vec3.x * val, vec3.y * val, vec3.z * val);
  }

  /**
   * multiply vector(static version)
   */
  static multiplyVector<T extends TypedArrayConstructor>(vec3:Vector3_<T>, vec:Vector3_<T>) {
    return new (vec3.constructor as any)(vec3.x * vec.x, vec3.y * vec.y, vec3.z * vec.z);
  }

  static angleOfVectors<T extends TypedArrayConstructor>(lhv:Vector3_<T>, rhv:Vector3_<T>) {
    let cos_sita = Vector3_.dotProduct(lhv, rhv) / ( lhv.length() * rhv.length() );

    let sita = Math.acos(cos_sita);

    return sita;
  }

  /**
   * divide vector(static version)
   */
  static divideVector<T extends TypedArrayConstructor>(lvec3:Vector3_<T>, rvec3:Vector3_<T>) {
    return new (lvec3.constructor as any)(lvec3.x / rvec3.x, lvec3.y / rvec3.y, lvec3.z / rvec3.z);
  }

  /**
   * change to string
   */
  toString() {
    return '(' + this.x + ', ' + this.y + ', ' + this.z +')';
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
  constructor(x:number|TypedArray|Vector2|IVector3|Vector4|Array<number>|null, y?:number, z?:number) {
    super(x, y!, z!, {type: Float32Array})
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
    return new Vector3(this.x, this.y, this.z);
  }
}

export class Vector3d extends Vector3_<Float64ArrayConstructor> {
  constructor(x:number|TypedArray|Vector2|IVector3|Vector4|Array<number>|null, y?:number, z?:number) {
    super(x, y!, z!, {type: Float64Array})
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
    return new Vector3d(this.x, this.y, this.z);
  }
}

export type Vector3f = Vector3;
