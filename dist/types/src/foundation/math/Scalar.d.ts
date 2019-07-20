import { IScalar } from "./IVector";
export declare class Scalar_<T extends TypedArrayConstructor> implements IScalar {
    v: TypedArray;
    constructor(x: number | TypedArray | null, { type }: {
        type: T;
    });
    getValue(): number;
    getValueInArray(): number[];
    readonly x: number;
    readonly raw: TypedArray;
}
export default class Scalar extends Scalar_<Float32ArrayConstructor> {
    constructor(x: number | TypedArray | null);
    static zero(): Scalar;
    static one(): Scalar;
    static dummy(): Scalar;
    clone(): Scalar;
}
export declare class Scalard extends Scalar_<Float64ArrayConstructor> {
    constructor(x: number | TypedArray | null);
    static zero(): Scalard;
    static one(): Scalard;
    static dummy(): Scalard;
    clone(): Scalard;
}
export declare type Scalarf = Scalar;