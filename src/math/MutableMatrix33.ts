import ImmutableMatrix44 from "./ImmutableMatrix44";
import ImmutableQuaternion from "./ImmutableQuaternion";
import Matrix33 from "./Matrix33";
import ImmutableMatrix33 from "./ImmutableMatrix33";
import ImmutableVector3 from "./ImmutableVector3";

export default class MutableMatrix33 extends ImmutableMatrix33 implements Matrix33 {

  constructor(m: null);
  constructor(m: Float32Array, isColumnMajor?:boolean, notCopyFloatArray?:boolean);
  constructor(m: Array<number>, isColumnMajor?:boolean);
  constructor(m: ImmutableMatrix33, isColumnMajor?:boolean);
  constructor(m: ImmutableMatrix44, isColumnMajor?:boolean);
  constructor(m: ImmutableQuaternion, isColumnMajor?:boolean);
  constructor(
    m0: number, m1:number, m2:number,
    m3:number, m4:number, m5:number,
    m6:number, m7:number, m8:number,
    isColumnMajor?:boolean,);
  constructor(
    m0: any, m1?:any, m2?:any,
    m3?:number, m4?:number, m5?:number,
    m6?:number, m7?:number, m8?:number,
    isColumnMajor:boolean = false, notCopyFloatArray:boolean = false)
  {
    super(m0, m1, m2, m3!, m4!, m5!, m6!, m7!, m8!, isColumnMajor);


  }

  setComponents(
    m00: number, m01: number, m02: number,
    m10: number, m11: number, m12: number,
    m20: number, m21: number, m22: number
    ): MutableMatrix33 {
    this.v[0] = m00; this.v[3] = m01; this.v[6] = m02;
    this.v[1] = m10; this.v[4] = m11; this.v[7] = m12;
    this.v[2] = m20; this.v[5] = m21; this.v[8] = m22;

    return this;
  }

  identity() {
    this.setComponents(
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    );
    return this;
  }

  /**
   * Create X oriented Rotation Matrix
   */
  rotateX(radian:number) {

    var cos = Math.cos(radian);
    var sin = Math.sin(radian);
    return this.setComponents(
      1, 0, 0,
      0, cos, -sin,
      0, sin, cos
    );
  }

  /**
   * Create Y oriented Rotation Matrix
   */
  rotateY(radian:number) {

    var cos = Math.cos(radian);
    var sin = Math.sin(radian);
    this.setComponents(
      cos, 0, sin,
      0, 1, 0,
      -sin, 0, cos
    );
    return this;
  }

  /**
   * Create Z oriented Rotation Matrix
   */
  rotateZ(radian:number): MutableMatrix33 {
    var cos = Math.cos(radian);
    var sin = Math.sin(radian);
    return this.setComponents(
      cos, -sin, 0,
      sin, cos, 0,
      0, 0, 1
    );
  }

    /**
   * Create X oriented Rotation Matrix
   */
  static rotateX(radian:number) {
    var cos = Math.cos(radian);
    var sin = Math.sin(radian);
    return new MutableMatrix33(
      1, 0, 0,
      0, cos, -sin,
      0, sin, cos
    );
  }

  /**
   * Create Y oriented Rotation Matrix
   */
  static rotateY(radian:number) {
    var cos = Math.cos(radian);
    var sin = Math.sin(radian);
    return new MutableMatrix33(
      cos, 0, sin,
      0, 1, 0,
      -sin, 0, cos
    );
  }

  /**
   * Create Z oriented Rotation Matrix
   */
  static rotateZ(radian:number) {
    var cos = Math.cos(radian);
    var sin = Math.sin(radian);
    return new MutableMatrix33(
      cos, -sin, 0,
      sin, cos, 0,
      0, 0, 1
    );
  }

  scale(vec: ImmutableVector3) {
    return this.setComponents(
      vec.x, 0, 0,
      0, vec.y, 0,
      0, 0, vec.z
    );
  }

  static rotateXYZ(x:number, y:number, z:number) {
    return (MutableMatrix33.rotateZ(z).multiply(MutableMatrix33.rotateY(y).multiply(MutableMatrix33.rotateX(x))));
  }

  static rotate(vec3:ImmutableVector3) {
    return (MutableMatrix33.rotateZ(vec3.z).multiply(MutableMatrix33.rotateY(vec3.y).multiply(MutableMatrix33.rotateX(vec3.x))));
  }

  /**
   * zero matrix
   */
  zero() {
    this.setComponents(0, 0, 0, 0, 0, 0, 0, 0, 0);
    return this;
  }

  raw() {
    return this.v;
  }

  flattenAsArray() {
    return [this.v[0], this.v[1], this.v[2],
      this.v[3], this.v[4], this.v[5],
      this.v[6], this.v[7], this.v[8]];
  }

  _swap(l:Index, r:Index) {
    this.v[r] = [this.v[l], this.v[l] = this.v[r]][0]; // Swap
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


  multiplyVector(vec:ImmutableVector3) {
    var x = this.m00*vec.x + this.m01*vec.y + this.m02*vec.z;
    var y = this.m10*vec.x + this.m11*vec.y + this.m12*vec.z;
    var z = this.m20*vec.x + this.m21*vec.y + this.m22*vec.z;

    return new ImmutableVector3(x, y, z);
  }

  /**
   * multiply zero matrix and zero matrix
   */
  multiply(mat:ImmutableMatrix33) {
    var m00 = this.m00*mat.m00 + this.m01*mat.m10 + this.m02*mat.m20;
    var m01 = this.m00*mat.m01 + this.m01*mat.m11 + this.m02*mat.m21;
    var m02 = this.m00*mat.m02 + this.m01*mat.m12 + this.m02*mat.m22;

    var m10 = this.m10*mat.m00 + this.m11*mat.m10 + this.m12*mat.m20;
    var m11 = this.m10*mat.m01 + this.m11*mat.m11 + this.m12*mat.m21;
    var m12 = this.m10*mat.m02 + this.m11*mat.m12 + this.m12*mat.m22;

    var m20 = this.m20*mat.m00 + this.m21*mat.m10 + this.m22*mat.m20;
    var m21 = this.m20*mat.m01 + this.m21*mat.m11 + this.m22*mat.m21;
    var m22 = this.m20*mat.m02 + this.m21*mat.m12 + this.m22*mat.m22;


    return this.setComponents(
      m00, m01, m02,
      m10, m11, m12,
      m20, m21, m22
    );
  }


  invert() {
    var det = this.determinant();
    var m00 = (this.m11*this.m22 - this.m12*this.m21) / det;
    var m01 = (this.m02*this.m21 - this.m01*this.m22) / det;
    var m02 = (this.m01*this.m12 - this.m02*this.m11) / det;
    var m10 = (this.m12*this.m20 - this.m10*this.m22) / det;
    var m11 = (this.m00*this.m22 - this.m02*this.m20) / det;
    var m12 = (this.m02*this.m10 - this.m00*this.m12) / det;
    var m20 = (this.m10*this.m21 - this.m11*this.m20) / det;
    var m21 = (this.m01*this.m20 - this.m00*this.m21) / det;
    var m22 = (this.m00*this.m11 - this.m01*this.m10) / det;

    return this.setComponents(
      m00, m01, m02,
      m10, m11, m12,
      m20, m21, m22
    );
  }

  addScale(vec:ImmutableVector3) {
    this.m00 *= vec.x;
    this.m11 *= vec.y;
    this.m22 *= vec.z;

    return this;
  }

  public set m00(val) {
    this.v[0] = val;
  }

  public get m00() {
    return this.v[0];
  }

  public set m10(val) {
    this.v[1] = val;
  }

  public get m10() {
    return this.v[1];
  }

  public set m20(val) {
    this.v[2] = val;
  }

  public get m20() {
    return this.v[2];
  }


  public set m01(val) {
    this.v[3] = val;
  }

  public get m01() {
    return this.v[3];
  }

  public set m11(val) {
    this.v[4] = val;
  }

  public get m11() {
    return this.v[4];
  }

  public set m21(val) {
    this.v[5] = val;
  }

  public get m21() {
    return this.v[5];
  }

  public set m02(val) {
    this.v[6] = val;
  }

  public get m02() {
    return this.v[6];
  }

  public set m12(val) {
    this.v[7] = val;
  }

  public get m12() {
    return this.v[7];
  }

  public set m22(val) {
    this.v[8] = val;
  }

  public get m22() {
    return this.v[8];
  }

}