import Vector3 from "../math/Vector3";
import SceneGraphComponent from "../components/SceneGraphComponent";
import Quaternion from "../math/Quaternion";
import VRMSpringBoneGroup from "./VRMSpringBoneGroup";
import VRMColliderGroup from "./VRMColliderGroup";
import { Index } from "../../types/CommonTypes";
import PhysicsStrategy from "./PhysicsStrategy";
export default class VRMSpringBonePhysicsStrategy implements PhysicsStrategy {
    private static __tmp_vec3;
    private static __tmp_vec3_2;
    private static __boneGroups;
    private static __colliderGroups;
    private __transform?;
    private __boneAxis;
    private __length;
    private __currentTail;
    private __prevTail;
    private __localDir;
    private __localRotation;
    private __initalized;
    private __localChildPosition;
    constructor();
    initialize(transform: SceneGraphComponent, localChildPosition: Vector3, center?: SceneGraphComponent): void;
    readonly isInitialized: boolean;
    readonly head: SceneGraphComponent;
    readonly tail: Vector3;
    readonly parentRotation: Quaternion;
    static update(): void;
    static updateInner(sceneGraphs: SceneGraphComponent[], boneGroup: VRMSpringBoneGroup): void;
    static initialize(sceneGraph: SceneGraphComponent): void;
    calcParentDeltaRecursivle(sceneGraph: SceneGraphComponent): void;
    update(stiffnessForce: number, dragForce: number, external: Vector3, collisionGroups: VRMColliderGroup[], boneHitRadius: number, center?: SceneGraphComponent): void;
    applyRotation(nextTail: Vector3): Quaternion;
    collision(collisionGroups: VRMColliderGroup[], nextTail: Vector3, boneHitRadius: number): Vector3;
    static setBoneGroups(sgs: VRMSpringBoneGroup[]): void;
    static addColliderGroup(index: Index, group: VRMColliderGroup): void;
    static getColliderGroups(indices: Index[]): VRMColliderGroup[];
}
