import { CompositionType } from '../definitions/CompositionType';
import {IMatrix, IMatrix33} from './IMatrix';
import {IVector, IMutableVector} from './IVector';
import Matrix33 from './Matrix33';
import MutableVector3 from './MutableVector3';
import Vector3 from './Vector3';

export default class IdentityMatrix33 implements IMatrix, IMatrix33 {
  toString(): string {
    return `1 0 0
0 1 0
0 0 1
`;
  }
  toStringApproximately(): string {
    return this.toString()
  }
  flattenAsArray(): number[] {
    return [1, 0, 0,
    0, 1, 0,
    0, 0, 1]
  }
  isDummy(): boolean {
    return false;
  }

  isEqual(mat: IMatrix33, delta: number = Number.EPSILON): boolean {
    const v = (mat as Matrix33).v;
    if (Math.abs(v[0] - 1) < delta &&
      Math.abs(v[1]) < delta &&
      Math.abs(v[2]) < delta &&
      Math.abs(v[3]) < delta &&
      Math.abs(v[4] - 1) < delta &&
      Math.abs(v[5]) < delta &&
      Math.abs(v[6]) < delta &&
      Math.abs(v[7]) < delta &&
      Math.abs(v[8] - 1) < delta) {
      return true;
    } else {
      return false;
    }
  }
  
  isStrictEqual(mat: IMatrix33): boolean {
    const v = (mat as Matrix33).v;
    if (
      v[0] === 1 && v[1] === 0 && v[2] === 0 && v[3] === 0 &&
      v[4] === 0 && v[5] === 0 && v[6] === 0 && v[7] === 0 &&
      v[8] === 0 && v[9] === 0 && v[10] === 0 && v[11] === 0 &&
      v[12] === 0 && v[13] === 0 && v[14] === 0 && v[15] === 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  at(row_i: number, column_i: number): number {
    return (row_i === column_i) ? 1 : 0;
  }

  determinant(): number {
    return 1;
  }

  multiplyVector(vec: IVector): IVector {
    return vec;
  }

  multiplyVectorTo(vec: IVector, outVec: IMutableVector): IMutableVector {
    const v = (vec as Vector3).v;
    outVec.v[0] = v[0];
    outVec.v[1] = v[1];
    outVec.v[2] = v[2];
    outVec.v[3] = v[3];

    return outVec;
  }

  getScale(): IVector {
    return new Vector3(1, 1, 1);
  }
  
  getScaleTo(outVec: IMutableVector): IMutableVector {
    const v = (outVec as MutableVector3).v;
    
    v[0] = 1;
    v[1] = 1;
    v[2] = 1;

    return outVec;
  }

  clone(): IMatrix33 {
    return new IdentityMatrix33();
  }
  
  getRotate(): IMatrix33 {
    return new IdentityMatrix33();
  }

  public get m00() {
    return 1;
  }

  public get m10() {
    return 0;
  }

  public get m20() {
    return 0;
  }

  public get m30() {
    return 0;
  }

  public get m01() {
    return 0;
  }

  public get m11() {
    return 1;
  }

  public get m21() {
    return 0;
  }

  public get m31() {
    return 0;
  }

  public get m02() {
    return 0;
  }

  public get m12() {
    return 0;
  }

  public get m22() {
    return 1;
  }

  public get m32() {
    return 0;
  }

  public get m03() {
    return 0;
  }

  public get m13() {
    return 0;
  }

  public get m23() {
    return 0;
  }

  public get m33() {
    return 1;
  }

  get className() {
    return this.constructor.name;
  }

  static get compositionType() {
    return CompositionType.Mat3;
  }
}
