import Vector2 from './Vector2';
import Vector3 from './Vector3';
import Vector4 from './Vector4';
import Quaternion from './Quaternion';
import Matrix33 from './Matrix33';
import Matrix44 from './Matrix44';
import { CompositionTypeEnum } from '../definitions/CompositionType';
export default class MathClassUtil {
    constructor();
    static arrayToVector(element: Array<number>): Vector4 | Vector2 | Vector3;
    static arrayToVectorOrMatrix(element: Array<number>): Vector4 | Vector2 | Vector3 | Matrix33 | Matrix44;
    static getImmutableValueClass(compositionType: CompositionTypeEnum): Function | undefined;
    static getMutableValueClass(compositionType: CompositionTypeEnum): Function | undefined;
    static cloneOfMathObjects(element: any): any;
    static isAcceptableArrayForQuaternion(element: Array<number>): boolean;
    static arrayToQuaternion(element: Array<number>): Quaternion;
    static makeSubArray(array: Array<any>, componentN: number): any;
    static vectorToArray(element: Vector2 | Vector3 | Vector4 | Quaternion): (number | Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array)[];
    /**
     * discriminate which Vector instance
     * @param element any Vector instance
     * @return number of Vector instance
     */
    static compomentNumberOfVector(element: Vector2 | Vector3 | Vector4 | Quaternion | Array<any>): number;
    static packNormalizedVec4ToVec2(x: number, y: number, z: number, w: number, criteria: number): number[];
    static unProject(windowPosVec3: Vector3, inversePVMat44: Matrix44, viewportVec4: Vector4): Vector3;
    static add(lhs: any, rhs: any): any;
    static subtract(lhs: any, rhs: any): any;
    static multiplyNumber(lhs: any, rhs: number): any;
    static divideNumber(lhs: any, rhs: number): any;
    static initWithScalar(objForDetectType: any, val: number): number | number[] | Vector4 | Vector2 | Vector3 | Quaternion | undefined;
    static initWithFloat32Array(objForDetectType: any, val: any, floatArray: Float32Array, compositionType: CompositionTypeEnum): any;
    static _setForce(objForDetectType: any, val: any): void;
}