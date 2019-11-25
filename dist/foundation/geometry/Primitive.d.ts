import { PrimitiveModeEnum } from '../definitions/PrimitiveMode';
import { VertexAttributeEnum } from '../definitions/VertexAttribute';
import Accessor from '../memory/Accessor';
import RnObject from '../core/RnObject';
import { ComponentTypeEnum } from '../definitions/ComponentType';
import { CompositionTypeEnum } from '../definitions/CompositionType';
import AABB from '../math/AABB';
import Material from '../materials/Material';
import { VertexHandles } from '../../webgl/WebGLResourceRepository';
import { PrimitiveUID, TypedArray, Index } from '../../types/CommonTypes';
import Vector3 from '../math/Vector3';
export declare type Attributes = Map<VertexAttributeEnum, Accessor>;
export default class Primitive extends RnObject {
    private __mode;
    material: Material;
    private __attributes;
    private __indices?;
    private static __primitiveCount;
    private __primitiveUid;
    private static __headerAccessor?;
    private __aabb;
    private __targets;
    private __vertexHandles?;
    private __inverseArenbergMatrix;
    private __arenberg3rdPosition;
    constructor();
    setData(attributes: Attributes, mode: PrimitiveModeEnum, material?: Material, indicesAccessor?: Accessor): void;
    static get maxPrimitiveCount(): number;
    static get headerAccessor(): Accessor | undefined;
    static createPrimitive({ indices, attributeCompositionTypes, attributeSemantics, attributes, material, primitiveMode }: {
        indices?: TypedArray;
        attributeCompositionTypes: Array<CompositionTypeEnum>;
        attributeSemantics: Array<VertexAttributeEnum>;
        attributes: Array<TypedArray>;
        primitiveMode: PrimitiveModeEnum;
        material?: Material;
    }): Primitive;
    get indicesAccessor(): Accessor | undefined;
    getVertexCountAsIndicesBased(): number;
    getVertexCountAsVerticesBased(): number;
    getTriangleCountAsIndicesBased(): number;
    getTriangleCountAsVerticesBased(): number;
    hasIndices(): boolean;
    get attributeAccessors(): Array<Accessor>;
    getAttribute(semantic: VertexAttributeEnum): Accessor | undefined;
    get attributeSemantics(): Array<VertexAttributeEnum>;
    get attributeEntries(): IterableIterator<[VertexAttributeEnum, Accessor]>;
    get attributeCompositionTypes(): Array<CompositionTypeEnum>;
    get attributeComponentTypes(): Array<ComponentTypeEnum>;
    get primitiveMode(): PrimitiveModeEnum;
    get primitiveUid(): PrimitiveUID;
    get AABB(): AABB;
    setVertexAttribute(accessor: Accessor, vertexSemantics: VertexAttributeEnum): void;
    removeIndices(): void;
    setIndices(accessor: Accessor): void;
    setTargets(targets: Array<Attributes>): void;
    get targets(): Array<Attributes>;
    isBlend(): boolean;
    isOpaque(): boolean;
    create3DAPIVertexData(): boolean;
    delete3DAPIVertexData(): boolean;
    get vertexHandles(): VertexHandles | undefined;
    castRay(origVec3: Vector3, dirVec3: Vector3, isFrontFacePickable: boolean, isBackFacePickable: boolean, dotThreshold: number): {
        currentShortestIntersectedPosVec3: any;
        currentShortestT: number;
    };
    private __castRayInner;
    _calcArenbergInverseMatrices(): void;
    _calcArenbergMatrixFor3Vertices(i: Index, pos0IndexBase: Index, pos1IndexBase: Index, pos2IndexBase: Index, incrementNum: number): void;
}