import Primitive from "./Primitive";
import Vector3 from "../math/Vector3";
import Accessor from "../memory/Accessor";
import Vector2 from "../math/Vector2";
import AABB from "../math/AABB";
import { Index, CGAPIResourceHandle } from "../../commontypes/CommonTypes";
/**
 * The Mesh class.
 * This mesh object has primitives (geometries) or a reference of 'original mesh'.
 * If the latter, this mesh object is an 'instanced mesh', which has no primitives.
 * Instanced meshes refer original mesh's primitives when drawing.
 */
export default class Mesh {
    private readonly __meshUID;
    static readonly invalidateMeshUID = -1;
    static __mesh_uid_count: number;
    private __instanceIdx;
    private __primitives;
    private __opaquePrimitives;
    private __transparentPrimitives;
    private __instanceOf?;
    weights: number[];
    private __morphPrimitives;
    private __localAABB;
    private __vaoUids;
    private __variationVBOUid;
    private __instances;
    _attachedEntityUID: number;
    private __instancesDirty;
    private static __originalMeshes;
    tangentCalculationMode: Index;
    isPreComputeForRayCastPickingEnable: boolean;
    constructor();
    /**
     * Gets original (Non instanced) meshes.
     */
    static get originalMeshes(): Mesh[];
    get variationVBOUid(): CGAPIResourceHandle;
    getVaoUids(index: Index): CGAPIResourceHandle;
    /**
     * @private
     * Adds the other mesh to this mesh as instanced meshes.
     * @param mesh The other mesh.
     */
    _addMeshToInstanceArray(mesh: Mesh): void;
    /**
     * Adds primitive.
     * @param primitive The primitive object.
     */
    addPrimitive(primitive: Primitive): void;
    /**
     * Sets mesh.
     * @param mesh The mesh.
     */
    setOriginalMesh(mesh: Mesh): boolean;
    /**
     * Gets true if these primitives are all 'Blend' type
     */
    isAllBlend(): boolean;
    /**
     * Gets true if some primitives are 'Blend' type
     */
    isBlendPartially(): boolean;
    /**
     * Gets true if these primitives are all 'Opaque' type
     */
    isOpaque(): boolean;
    isFirstOpaquePrimitiveAt(index: Index): boolean;
    isFirstTransparentPrimitiveAt(index: Index): boolean;
    __calcFaceNormalFor3Vertices(i: Index, pos0: Vector3, pos1: Vector3, pos2: Vector3, normalAccessor: Accessor, indicesAccessor?: Accessor): void;
    __calcTangents(): void;
    __calcTangentFor3Vertices(i: Index, pos0: Vector3, pos1: Vector3, pos2: Vector3, uv0: Vector2, uv1: Vector2, uv2: Vector2, norm0: Vector3, norm1: Vector3, norm2: Vector3, tangentAccessor: Accessor, indicesAccessor?: Accessor): void;
    __calcTangentPerVertex(pos0Vec3: Vector3, pos1Vec3: Vector3, pos2Vec3: Vector3, uv0Vec2: Vector2, uv1Vec2: Vector2, uv2Vec2: Vector2, norm0Vec3: Vector3, norm1Vec3: Vector3, norm2Vec3: Vector3): Vector3;
    private __calcArenbergInverseMatrices;
    getPrimitiveAt(i: number): Primitive;
    getPrimitiveNumber(): number;
    __calcFaceNormalsIfNonNormal(): void;
    makeVerticesSeparated(): void;
    __calcBaryCentricCoord(): void;
    __initMorphPrimitives(): void;
    __calcMorphPrimitives(): void;
    /**
     * Gets AABB in local space.
     */
    get AABB(): AABB;
    get instanceIndex(): number;
    isInstanceMesh(): boolean;
    isOriginalMesh(): boolean;
    get meshUID(): number;
    updateVariationVBO(): boolean;
    deleteVariationVBO(): boolean;
    get instanceCountIncludeOriginal(): number;
    castRay(srcPointInLocal: Vector3, directionInLocal: Vector3, dotThreshold?: number): {
        t: number;
        intersectedPosition: Vector3 | undefined;
    };
    _calcArenbergInverseMatrices(): void;
}
