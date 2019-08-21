import Matrix44 from "./Matrix44";
import { IMutableMatrix22 } from "./IMatrix";
import Matrix22 from "./Matrix22";
import { Index } from "../../types/CommonTypes";
import Matrix33 from "./Matrix33";
import Vector2 from "./Vector2";
export default class MutableMatrix22 extends Matrix22 implements IMutableMatrix22 {
    constructor(m: null);
    constructor(m: Float32Array, isColumnMajor?: boolean, notCopyFloatArray?: boolean);
    constructor(m: Array<number>, isColumnMajor?: boolean);
    constructor(m: Matrix22, isColumnMajor?: boolean);
    constructor(m: Matrix33, isColumnMajor?: boolean);
    constructor(m: Matrix44, isColumnMajor?: boolean);
    constructor(m0: number, m1: number, m2: number, m3: number, isColumnMajor?: boolean);
    setComponents(m00: number, m01: number, m10: number, m11: number): MutableMatrix22;
    copyComponents(mat: Matrix22 | Matrix33 | Matrix44): void;
    static readonly compositionType: import("../definitions/CompositionType").CompositionTypeEnum;
    static dummy(): MutableMatrix22;
    identity(): this;
    /**
     * Create Rotation Matrix
     */
    rotate(radian: number): MutableMatrix22;
    /**
   * Create Rotation Matrix
   */
    static rotate(radian: number): MutableMatrix22;
    scale(vec: Vector2): MutableMatrix22;
    /**
     * zero matrix
     */
    zero(): this;
    raw(): import("../../types/CommonTypes").TypedArray;
    flattenAsArray(): number[];
    _swap(l: Index, r: Index): void;
    /**
     * transpose
     */
    transpose(): this;
    /**
     * multiply zero matrix and zero matrix
     */
    multiply(mat: Matrix22): MutableMatrix22;
    invert(): MutableMatrix22;
    addScale(vec: Vector2): this;
    m00: any;
    m10: any;
    m01: any;
    m11: any;
}
