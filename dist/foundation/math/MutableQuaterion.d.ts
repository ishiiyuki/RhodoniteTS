import Vector3 from "./Vector3";
import Vector4 from "./Vector4";
import Quaternion from "./Quaternion";
import { IVector4 } from "./IVector";
import Matrix44 from "./Matrix44";
import { TypedArray } from "../../types/CommonTypes";
export default class MutableQuaternion extends Quaternion implements IVector4 {
    constructor(x?: number | TypedArray | Vector3 | Vector4 | Quaternion | Array<number> | null, y?: number, z?: number, w?: number);
    static dummy(): MutableQuaternion;
    clone(): MutableQuaternion;
    axisAngle(axisVec3: Vector3, radian: number): this;
    add(q: Quaternion): this;
    multiply(q: Quaternion): this;
    fromMatrix(m: Matrix44): this;
    static get compositionType(): import("../definitions/CompositionType").CompositionTypeEnum;
    setAt(i: number, val: number): void;
    normalize(): this;
    identity(): void;
    static fromMatrix(m: Matrix44): MutableQuaternion;
    get x(): number;
    set x(x: number);
    get y(): number;
    set y(y: number);
    get z(): number;
    set z(z: number);
    get w(): number;
    set w(w: number);
    get raw(): TypedArray;
}
