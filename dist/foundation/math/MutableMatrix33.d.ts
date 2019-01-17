import Matrix44 from "./Matrix44";
import Quaternion from "./Quaternion";
import { IMutableMatrix33 } from "./IMatrix";
import Matrix33 from "./Matrix33";
import Vector3 from "./Vector3";
export default class MutableMatrix33 extends Matrix33 implements IMutableMatrix33 {
    constructor(m: null);
    constructor(m: Float32Array, isColumnMajor?: boolean, notCopyFloatArray?: boolean);
    constructor(m: Array<number>, isColumnMajor?: boolean);
    constructor(m: Matrix33, isColumnMajor?: boolean);
    constructor(m: Matrix44, isColumnMajor?: boolean);
    constructor(m: Quaternion, isColumnMajor?: boolean);
    constructor(m0: number, m1: number, m2: number, m3: number, m4: number, m5: number, m6: number, m7: number, m8: number, isColumnMajor?: boolean);
    setComponents(m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number): MutableMatrix33;
    static readonly compositionType: import("../definitions/CompositionType").CompositionTypeEnum;
    identity(): this;
    /**
     * Create X oriented Rotation Matrix
     */
    rotateX(radian: number): MutableMatrix33;
    /**
     * Create Y oriented Rotation Matrix
     */
    rotateY(radian: number): this;
    /**
     * Create Z oriented Rotation Matrix
     */
    rotateZ(radian: number): MutableMatrix33;
    /**
   * Create X oriented Rotation Matrix
   */
    static rotateX(radian: number): MutableMatrix33;
    /**
     * Create Y oriented Rotation Matrix
     */
    static rotateY(radian: number): MutableMatrix33;
    /**
     * Create Z oriented Rotation Matrix
     */
    static rotateZ(radian: number): MutableMatrix33;
    scale(vec: Vector3): MutableMatrix33;
    static rotateXYZ(x: number, y: number, z: number): MutableMatrix33;
    static rotate(vec3: Vector3): MutableMatrix33;
    /**
     * zero matrix
     */
    zero(): this;
    raw(): TypedArray;
    flattenAsArray(): number[];
    _swap(l: Index, r: Index): void;
    /**
     * transpose
     */
    transpose(): this;
    multiplyVector(vec: Vector3): Vector3;
    /**
     * multiply zero matrix and zero matrix
     */
    multiply(mat: Matrix33): MutableMatrix33;
    invert(): MutableMatrix33;
    addScale(vec: Vector3): this;
    m00: any;
    m10: any;
    m20: any;
    m01: any;
    m11: any;
    m21: any;
    m02: any;
    m12: any;
    m22: any;
}
