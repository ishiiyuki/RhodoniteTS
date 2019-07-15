//import GLBoost from '../../globals';

import Vector3 from './Vector3';
import { IVector4 } from './IVector';
import Matrix44 from './Matrix44';
import Vector4 from './Vector4';
import { CompositionType } from '../definitions/CompositionType';
import RowMajarMatrix44 from './RowMajarMatrix44';
import MutableQuaternion from './MutableQuaterion';
import LogQuaternion from './LogQuaternion';
import { TypedArray } from '../../types/CommonTypes';

export default class Quaternion implements IVector4 {
  v: TypedArray;

  constructor(x?:number|TypedArray|Vector3|Vector4|Quaternion|Array<number>|null, y?:number, z?:number, w?:number) {
    if (ArrayBuffer.isView(x)) {
      this.v = ((x as any) as TypedArray);
      return;
    } else if (x == null) {
      this.v = new Float32Array(0);
    } else {
      this.v = new Float32Array(4);
    }

    if (!(x != null)) {
      this.v[0] = 0;
      this.v[1] = 0;
      this.v[2] = 0;
      this.v[3] = 1;
    } else if (x instanceof LogQuaternion) {
      const theta = x.x*x.x + x.y*x.y + x.z*x.z;
      const sin = Math.sin(theta);
      this.v[0] = x.x*(sin/theta);
      this.v[1] = x.y*(sin/theta);
      this.v[2] = x.z*(sin/theta);
      this.v[3] = Math.cos(theta);
    } else if (Array.isArray(x)) {
      this.v[0] = x[0];
      this.v[1] = x[1];
      this.v[2] = x[2];
      this.v[3] = x[3];
    } else if (typeof (x as any).w !== 'undefined') {
      this.v[0] = (x as any).x;
      this.v[1] = (x as any).y;
      this.v[2] = (x as any).z;
      this.v[3] = (x as any).w;
    } else if (typeof (x as any).z !== 'undefined') {
      this.v[0] = (x as any).x;
      this.v[1] = (x as any).y;
      this.v[2] = (x as any).z;
      this.v[3] = 1;
    } else if (typeof (x as any).y !== 'undefined') {
      this.v[0] = (x as any).x;
      this.v[1] = (x as any).y;
      this.v[2] = 0;
      this.v[3] = 1;
    } else {
      this.v[0] = ((x as any) as number);
      this.v[1] = ((y as any) as number);
      this.v[2] = ((z as any) as number);
      this.v[3] = ((w as any) as number);
    }
  }


  isEqual(quat: Quaternion) {
    if (this.x === quat.x && this.y === quat.y && this.z === quat.z && this.w === quat.w) {
      return true;
    } else {
      return false;
    }
  }

  static get compositionType() {
    return CompositionType.Vec4;
  }

  static dummy() {
    return new Quaternion(null);
  }

  isDummy() {
    if (this.v.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  get className() {
    return this.constructor.name;
  }

  clone() {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }

  static invert(quat: Quaternion) {
    quat = new Quaternion(-quat.x, -quat.y, -quat.z, quat.w);
    const inorm2 = 1.0/(quat.x*quat.x + quat.y*quat.y + quat.z*quat.z + quat.w*quat.w);
    quat.v[0] *= inorm2;
    quat.v[1] *= inorm2;
    quat.v[2] *= inorm2;
    quat.v[3] *= inorm2;
    return quat;
  }

  static qlerp(lhq: Quaternion, rhq: Quaternion, ratio:number) {

    var q = new Quaternion(0, 0, 0, 1);
    var qr = lhq.w * rhq.w + lhq.x * rhq.x + lhq.y * rhq.y + lhq.z * rhq.z;
    var ss = 1.0 - qr * qr;

    if (ss === 0.0) {
      q.v[3] = lhq.w;
      q.v[0] = lhq.x;
      q.v[1] = lhq.y;
      q.v[2] = lhq.z;

      return q;
    } else {

      if (qr > 1) {
        qr = 0.999;
      } else if (qr < -1) {
        qr = -0.999;
      }

      let ph = Math.acos(qr);
      let s2;
      if(qr < 0.0 && ph > Math.PI / 2.0){
        qr = - lhq.w * rhq.w - lhq.x * rhq.x - lhq.y * rhq.y - lhq.z * rhq.z;
        ph = Math.acos(qr);
        s2 = -1 * Math.sin(ph * ratio) / Math.sin(ph);
      } else {
        s2 = Math.sin(ph * ratio) / Math.sin(ph);
      }
      let s1 = Math.sin(ph * (1.0 - ratio)) / Math.sin(ph);

      q.v[0] = lhq.x * s1 + rhq.x * s2;
      q.v[1] = lhq.y * s1 + rhq.y * s2;
      q.v[2] = lhq.z * s1 + rhq.z * s2;
      q.v[3] = lhq.w * s1 + rhq.w * s2;

      return q;
    }
  }

  static lerpTo(lhq: Quaternion, rhq: Quaternion, ratio:number, outQ: MutableQuaternion) {
    outQ.x = lhq.x * (1 - ratio) + rhq.x * ratio;
    outQ.y = lhq.y * (1 - ratio) + rhq.y * ratio;
    outQ.z = lhq.z * (1 - ratio) + rhq.z * ratio;
    outQ.w = lhq.w * (1 - ratio) + rhq.w * ratio;
  }

  static qlerpTo(lhq: Quaternion, rhq: Quaternion, ratio:number, outQ: MutableQuaternion) {

//    var q = new Quaternion(0, 0, 0, 1);
    var qr = lhq.w * rhq.w + lhq.x * rhq.x + lhq.y * rhq.y + lhq.z * rhq.z;
    var ss = 1.0 - qr * qr;

    if (ss === 0.0) {
      outQ.v[3] = lhq.w;
      outQ.v[0] = lhq.x;
      outQ.v[1] = lhq.y;
      outQ.v[2] = lhq.z;

    } else {

      if (qr > 1) {
        qr = 0.999;
      } else if (qr < -1) {
        qr = -0.999;
      }

      let ph = Math.acos(qr);
      let s2;
      if(qr < 0.0 && ph > Math.PI / 2.0){
        qr = - lhq.w * rhq.w - lhq.x * rhq.x - lhq.y * rhq.y - lhq.z * rhq.z;
        ph = Math.acos(qr);
        s2 = -1 * Math.sin(ph * ratio) / Math.sin(ph);
      } else {
        s2 = Math.sin(ph * ratio) / Math.sin(ph);
      }
      let s1 = Math.sin(ph * (1.0 - ratio)) / Math.sin(ph);

      outQ.v[0] = lhq.x * s1 + rhq.x * s2;
      outQ.v[1] = lhq.y * s1 + rhq.y * s2;
      outQ.v[2] = lhq.z * s1 + rhq.z * s2;
      outQ.v[3] = lhq.w * s1 + rhq.w * s2;

    }
  }

  static axisAngle(axisVec3: Vector3, radian: number) {
    var halfAngle = 0.5 * radian;
    var sin = Math.sin(halfAngle);

    var axis = Vector3.normalize(axisVec3);
    return new Quaternion(
      sin * axis.x,
      sin * axis.y,
      sin * axis.z,
      Math.cos(halfAngle));
  }

  static multiply(q1:Quaternion, q2:Quaternion) {
    let result = new Quaternion(0, 0, 0, 1);
    result.v[0] =   q2.w*q1.x + q2.z*q1.y - q2.y*q1.z + q2.x*q1.w;
    result.v[1] = - q2.z*q1.x + q2.w*q1.y + q2.x*q1.z + q2.y*q1.w;
    result.v[2] =   q2.y*q1.x - q2.x*q1.y + q2.w*q1.z + q2.z*q1.w;
    result.v[3] = - q2.x*q1.x - q2.y*q1.y - q2.z*q1.z + q2.w*q1.w;
    return result;
  }

  static multiplyNumber(q1:Quaternion, val: number) {
    return new Quaternion(q1.x*val, q1.y*val, q1.z*val, q1.w*val);
  }

  static fromMatrix(m:Matrix44|RowMajarMatrix44) {

    let q = new Quaternion();
    let tr = m.m00 + m.m11 + m.m22;

    if (tr > 0) {
      let S = 0.5 / Math.sqrt(tr+1.0);
      q.v[3] = 0.25 / S;
      q.v[0] = (m.m21 - m.m12) * S;
      q.v[1] = (m.m02 - m.m20) * S;
      q.v[2] = (m.m10 - m.m01) * S;
    } else if ((m.m00 > m.m11) && (m.m00 > m.m22)) {
      let S = Math.sqrt(1.0 + m.m00 - m.m11 - m.m22) * 2;
      q.v[3] = (m.m21 - m.m12) / S;
      q.v[0] = 0.25 * S;
      q.v[1] = (m.m01 + m.m10) / S;
      q.v[2] = (m.m02 + m.m20) / S;
    } else if (m.m11 > m.m22) {
      let S = Math.sqrt(1.0 + m.m11 - m.m00 - m.m22) * 2;
      q.v[3] = (m.m02 - m.m20) / S;
      q.v[0] = (m.m01 + m.m10) / S;
      q.v[1] = 0.25 * S;
      q.v[2] = (m.m12 + m.m21) / S;
    } else {
      let S = Math.sqrt(1.0 + m.m22 - m.m00 - m.m11) * 2;
      q.v[3] = (m.m10 - m.m01) / S;
      q.v[0] = (m.m02 + m.m20) / S;
      q.v[1] = (m.m12 + m.m21) / S;
      q.v[2] = 0.25 * S;
    }

    return q;
  }

  static fromPosition(vec3: Vector3) {
    let q = new Quaternion(vec3.x, vec3.y, vec3.z, 0);
    return q;
  }

  length() {
    return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w);
  }

  at(i: number) {
    switch (i%4) {
    case 0: return this.x;
    case 1: return this.y;
    case 2: return this.z;
    case 3: return this.w;
    default: return void 0;
    }
  }

  static add(lhs: Quaternion, rhs: Quaternion) {
    return new Quaternion(lhs.x+rhs.x, lhs.y+rhs.y, lhs.z+rhs.z, lhs.w+rhs.w)
  }

  static subtract(lhs: Quaternion, rhs: Quaternion) {
    return new Quaternion(lhs.x-rhs.x, lhs.y-rhs.y, lhs.z-rhs.z, lhs.w-rhs.w)
  }

  toString() {
    return '(' + this.x + ', ' + this.y + ', ' + this.z + ', ' + this.w + ')';
  }

  get x():number {
    return this.v[0];
  }

  get y():number {
    return this.v[1];
  }

  get z():number {
    return this.v[2];
  }

  get w():number {
    return this.v[3];
  }

}

