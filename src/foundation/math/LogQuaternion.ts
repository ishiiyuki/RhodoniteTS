//import GLBoost from './../../globals';
import Vector2 from './Vector2';
import Vector4 from './Vector4';
import {IColorRgb} from './IColor';
import { IVector3, IVector4 } from './IVector';
import Quaternion from './Quaternion';
import { TypedArray } from '../../commontypes/CommonTypes';
import { ILogQuaternion, IQuaternion } from './IQuaternion';

export default class LogQuaternion implements ILogQuaternion {
  v: TypedArray;

  constructor(x: number | TypedArray | IVector3 | IVector4 | IQuaternion | Array<number> | null, y?: number, z?: number) {
    if (ArrayBuffer.isView(x)) {
      this.v = ((x as any) as TypedArray);
      return;
    } else if (x == null) {
      this.v = new Float32Array(0);
      return;
    } else {
      this.v = new Float32Array(3);
    }

    if (x == null) {
      this.v[0] = 0;
      this.v[1] = 0;
      this.v[2] = 0;
    } else if (x instanceof Quaternion) {
      const theta = Math.acos(x.w);
      const sin = Math.sin(theta)
      this.v[0] = x.x * (theta/sin);
      this.v[1] = x.y * (theta/sin);
      this.v[2] = x.z * (theta/sin);
    } else if (Array.isArray(x)) {
      this.v[0] = x[0];
      this.v[1] = x[1];
      this.v[2] = x[2];
    } else if (typeof (x as any).z !== 'undefined') {
      this.v[0] = (x as any).x;
      this.v[1] = (x as any).y;
      this.v[2] = (x as any).z;
    } else {
      this.v[0] = ((x as any) as number);
      this.v[1] = ((x as any) as number);
      this.v[2] = ((x as any) as number);
    }

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

  get className() {
    return this.constructor.name;
  }
}
