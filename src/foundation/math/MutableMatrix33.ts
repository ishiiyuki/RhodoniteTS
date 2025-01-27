import Matrix44 from './Matrix44';
import Quaternion from './Quaternion';
import {IMutableMatrix33, IMutableMatrix} from './IMatrix';
import Matrix33 from './Matrix33';
import Vector3 from './Vector3';
import {Index} from '../../types/CommonTypes';

/* eslint-disable prettier/prettier */
export default class MutableMatrix33 extends Matrix33 implements IMutableMatrix, IMutableMatrix33 {

  constructor(m: null);
  constructor(m: Float32Array, isColumnMajor?: boolean, notCopyFloatArray?: boolean);
  constructor(m: Array<number>, isColumnMajor?: boolean);
  constructor(m: Matrix33, isColumnMajor?: boolean);
  constructor(m: Matrix44, isColumnMajor?: boolean);
  constructor(m: Quaternion, isColumnMajor?: boolean);
  constructor(
    m0: number, m1: number, m2: number,
    m3: number, m4: number, m5: number,
    m6: number, m7: number, m8: number,
    isColumnMajor?: boolean,);
  constructor(
    m0: any, m1?: any, m2?: any,
    m3?: number, m4?: number, m5?: number,
    m6?: number, m7?: number, m8?: number,
    isColumnMajor = false, notCopyFloatArray = false) {
    super(m0, m1, m2, m3!, m4!, m5!, m6!, m7!, m8!, isColumnMajor);
  }

  public set m00(val) {
    this._v[0] = val;
  }

  public get m00() {
    return this._v[0];
  }

  public set m10(val) {
    this._v[1] = val;
  }

  public get m10() {
    return this._v[1];
  }

  public set m20(val) {
    this._v[2] = val;
  }

  public get m20() {
    return this._v[2];
  }

  public set m01(val) {
    this._v[3] = val;
  }

  public get m01() {
    return this._v[3];
  }

  public set m11(val) {
    this._v[4] = val;
  }

  public get m11() {
    return this._v[4];
  }

  public set m21(val) {
    this._v[5] = val;
  }

  public get m21() {
    return this._v[5];
  }

  public set m02(val) {
    this._v[6] = val;
  }

  public get m02() {
    return this._v[6];
  }

  public set m12(val) {
    this._v[7] = val;
  }

  public get m12() {
    return this._v[7];
  }

  public set m22(val) {
    this._v[8] = val;
  }

  public get m22() {
    return this._v[8];
  }

  get className() {
    return 'MutableMatrix33';
  }

  /**
   * zero matrix(static version)
   */
  static zero() {
    return super.zero() as MutableMatrix33;
  }

  /**
   * Create identity matrix
   */
  static identity() {
    return new MutableMatrix33(1, 0, 0, 0, 1, 0, 0, 0, 1);
  }

  static dummy() {
    return super.dummy() as MutableMatrix33;
  }

  /**
   * Create transpose matrix
   */
  static transpose(mat: Matrix33) {
    return super.transpose(mat) as MutableMatrix33;
  }

  /**
   * Create invert matrix
   */
  static invert(mat: Matrix33) {
    return super.invert(mat) as MutableMatrix33;
  }

  /**
 * Create X oriented Rotation Matrix
 */
  static rotateX(radian: number) {
    return super.rotateX(radian) as MutableMatrix33;
  }

  /**
   * Create Y oriented Rotation Matrix
   */
  static rotateY(radian: number) {
    return super.rotateY(radian) as MutableMatrix33;
  }

  /**
   * Create Z oriented Rotation Matrix
   */
  static rotateZ(radian: number) {
    return super.rotateZ(radian) as MutableMatrix33;
  }

  static rotateXYZ(x: number, y: number, z: number) {
    return super.rotateXYZ(x, y, z) as MutableMatrix33;
  }

  static rotate(vec: Vector3) {
    return super.rotateXYZ(vec._v[0], vec._v[1], vec._v[2]) as MutableMatrix33;
  }

  /**
   * Create Scale Matrix
   */
  static scale(vec: Vector3) {
    return super.scale(vec) as MutableMatrix33;
  }

  /**
   * multiply matrixes
   */
  static multiply(l_mat: Matrix33, r_mat: Matrix33) {
    return super.multiply(l_mat, r_mat) as MutableMatrix33;
  }

  clone() {
    const result = super.clone() as MutableMatrix33;
    return result;
  }

  raw() {
    return this._v;
  }

  setAt(row_i: number, column_i: number, value: number) {
    this._v[row_i + column_i * 3] = value;
    return this;
  }

  setComponents(
    m00: number, m01: number, m02: number,
    m10: number, m11: number, m12: number,
    m20: number, m21: number, m22: number
  ): MutableMatrix33 {
    this._v[0] = m00; this._v[3] = m01; this._v[6] = m02;
    this._v[1] = m10; this._v[4] = m11; this._v[7] = m12;
    this._v[2] = m20; this._v[5] = m21; this._v[8] = m22;

    return this;
  }

  copyComponents(mat: Matrix33 | Matrix44) {
    this._v[0] = mat.m00; this._v[3] = mat.m01; this._v[6] = mat.m02; // mat.m01 is mat._v[3 or 4]
    this._v[1] = mat.m10; this._v[4] = mat.m11; this._v[7] = mat.m12;
    this._v[2] = mat.m20; this._v[5] = mat.m21; this._v[8] = mat.m22;

    return this;
  }

  /**
   * zero matrix
   */
  zero() {
    return this.setComponents(0, 0, 0, 0, 0, 0, 0, 0, 0);
  }

  identity() {
    return this.setComponents(
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    );
  }

  _swap(l: Index, r: Index) {
    this._v[r] = [this._v[l], this._v[l] = this._v[r]][0];
  }

  /**
   * transpose
   */
  transpose() {
    this._swap(1, 3);
    this._swap(2, 6);
    this._swap(5, 8);

    return this;
  }

  invert() {
    const det = this.determinant();
    if (det === 0) {
      console.error('the determinant is 0!');
    }

    const m00 = (this._v[4] * this._v[8] - this._v[7] * this._v[5]) / det;
    const m01 = (this._v[6] * this._v[5] - this._v[3] * this._v[8]) / det;
    const m02 = (this._v[3] * this._v[7] - this._v[6] * this._v[4]) / det;
    const m10 = (this._v[7] * this._v[2] - this._v[1] * this._v[8]) / det;
    const m11 = (this._v[0] * this._v[8] - this._v[6] * this._v[2]) / det;
    const m12 = (this._v[6] * this._v[1] - this._v[0] * this._v[7]) / det;
    const m20 = (this._v[1] * this._v[5] - this._v[4] * this._v[2]) / det;
    const m21 = (this._v[3] * this._v[2] - this._v[0] * this._v[5]) / det;
    const m22 = (this._v[0] * this._v[4] - this._v[3] * this._v[1]) / det;

    return this.setComponents(
      m00, m01, m02,
      m10, m11, m12,
      m20, m21, m22
    );
  }

  /**
   * Create X oriented Rotation Matrix
   */
  rotateX(radian: number) {
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    return this.setComponents(
      1, 0, 0,
      0, cos, -sin,
      0, sin, cos
    );
  }

  /**
   * Create Y oriented Rotation Matrix
   */
  rotateY(radian: number) {
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    return this.setComponents(
      cos, 0, sin,
      0, 1, 0,
      -sin, 0, cos
    );
  }

  /**
   * Create Z oriented Rotation Matrix
   */
  rotateZ(radian: number): MutableMatrix33 {
    const cos = Math.cos(radian);
    const sin = Math.sin(radian);
    return this.setComponents(
      cos, -sin, 0,
      sin, cos, 0,
      0, 0, 1
    );
  }

  rotateXYZ(x: number, y: number, z: number) {
    const cosX = Math.cos(x);
    const sinX = Math.sin(x);
    const cosY = Math.cos(y);
    const sinY = Math.sin(y);
    const cosZ = Math.cos(z);
    const sinZ = Math.sin(z);

    // const x00 = 1;
    // const x01 = 0;
    // const x02 = 0;
    // const x10 = 0;
    const x11 = cosX;
    const x12 = -sinX;
    // const x20 = 0;
    const x21 = sinX;
    const x22 = cosX;

    const y00 = cosY;
    // const y01 = 0;
    const y02 = sinY;
    // const y10 = 0;
    // const y11 = 1;
    // const y12 = 0;
    const y20 = -sinY;
    // const y21 = 0;
    const y22 = cosY;

    const z00 = cosZ;
    const z01 = -sinZ;
    // const z02 = 0;
    const z10 = sinZ;
    const z11 = cosZ;
    // const z12 = 0;
    // const z20 = 0;
    // const z21 = 0;
    // const z22 = 1;

    // calculate this.multiply(this.rotateY(y), this.rotateX(x))
    const yx00 = y00;
    const yx01 = y02 * x21;
    const yx02 = y02 * x22;
    //const yx10 = 0;
    const yx11 = x11;
    const yx12 = x12;
    const yx20 = y20;
    const yx21 = y22 * x21;
    const yx22 = y22 * x22;

    // calculate this.multiply(this.rotateZ(z), this.multiply(this.rotateY(y), this.rotateX(x)))
    const m00 = z00 * yx00;
    const m01 = z00 * yx01 + z01 * yx11;
    const m02 = z00 * yx02 + z01 * yx12;
    const m10 = z10 * yx00;
    const m11 = z10 * yx01 + z11 * yx11;
    const m12 = z10 * yx02 + z11 * yx12;
    const m20 = yx20;
    const m21 = yx21;
    const m22 = yx22;

    return this.setComponents(
      m00, m01, m02,
      m10, m11, m12,
      m20, m21, m22
    );
  }

  rotate(vec: Vector3) {
    return this.rotateXYZ(vec._v[0], vec._v[1], vec._v[2]);
  }

  scale(vec: Vector3) {
    return this.setComponents(
      vec._v[0], 0, 0,
      0, vec._v[1], 0,
      0, 0, vec._v[2]
    );
  }

  multiplyScale(vec: Vector3) {
    this._v[0] *= vec._v[0];
    this._v[3] *= vec._v[0];
    this._v[6] *= vec._v[0];

    this._v[1] *= vec._v[1];
    this._v[4] *= vec._v[1];
    this._v[7] *= vec._v[1];

    this._v[2] *= vec._v[2];
    this._v[5] *= vec._v[2];
    this._v[8] *= vec._v[2];

    return this;
  }

  /**
   * multiply the input matrix from right side
   */
  multiply(mat: Matrix33) {
    if (mat.isIdentityMatrixClass) {
      return this;
    }

    const m00 = this._v[0] * mat._v[0] + this._v[3] * mat._v[1] + this._v[6] * mat._v[2];
    const m01 = this._v[0] * mat._v[3] + this._v[3] * mat._v[4] + this._v[6] * mat._v[5];
    const m02 = this._v[0] * mat._v[6] + this._v[3] * mat._v[7] + this._v[6] * mat._v[8];

    const m10 = this._v[1] * mat._v[0] + this._v[4] * mat._v[1] + this._v[7] * mat._v[2];
    const m11 = this._v[1] * mat._v[3] + this._v[4] * mat._v[4] + this._v[7] * mat._v[5];
    const m12 = this._v[1] * mat._v[6] + this._v[4] * mat._v[7] + this._v[7] * mat._v[8];

    const m20 = this._v[2] * mat._v[0] + this._v[5] * mat._v[1] + this._v[8] * mat._v[2];
    const m21 = this._v[2] * mat._v[3] + this._v[5] * mat._v[4] + this._v[8] * mat._v[5];
    const m22 = this._v[2] * mat._v[6] + this._v[5] * mat._v[7] + this._v[8] * mat._v[8];

    return this.setComponents(
      m00, m01, m02,
      m10, m11, m12,
      m20, m21, m22
    );
  }

  multiplyByLeft(mat: Matrix33) {
    if (mat.isIdentityMatrixClass) {
      return this;
    }

    const m00 = mat._v[0] * this._v[0] + mat._v[3] * this._v[1] + mat._v[6] * this._v[2];
    const m01 = mat._v[0] * this._v[3] + mat._v[3] * this._v[4] + mat._v[6] * this._v[5];
    const m02 = mat._v[0] * this._v[6] + mat._v[3] * this._v[7] + mat._v[6] * this._v[8];

    const m10 = mat._v[1] * this._v[0] + mat._v[4] * this._v[1] + mat._v[7] * this._v[2];
    const m11 = mat._v[1] * this._v[3] + mat._v[4] * this._v[4] + mat._v[7] * this._v[5];
    const m12 = mat._v[1] * this._v[6] + mat._v[4] * this._v[7] + mat._v[7] * this._v[8];

    const m20 = mat._v[2] * this._v[0] + mat._v[5] * this._v[1] + mat._v[8] * this._v[2];
    const m21 = mat._v[2] * this._v[3] + mat._v[5] * this._v[4] + mat._v[8] * this._v[5];
    const m22 = mat._v[2] * this._v[6] + mat._v[5] * this._v[7] + mat._v[8] * this._v[8];

    return this.setComponents(
      m00, m01, m02,
      m10, m11, m12,
      m20, m21, m22
    );
  }
}
