import Component from "../core/Component";
import EntityRepository from "../core/EntityRepository";
import Vector3 from "../math/Vector3";
import MutableVector3 from "../math/MutableVector3";
import CameraComponent from "./CameraComponent";
import Entity from "../core/Entity";
export default class CameraControllerComponent extends Component {
    private __isKeyUp;
    private __movedMouseYOnCanvas;
    private __movedMouseXOnCanvas;
    private __clickedMouseYOnCanvas;
    private __clickedMouseXOnCanvas;
    private __mouse_translate_y;
    private __mouse_translate_x;
    private __efficiency;
    private __lengthOfCenterToEye;
    private __foyvBias;
    private __scaleOfTraslation;
    private __mouseTranslateVec;
    private __newEyeToCenterVec;
    private __newUpVec;
    private __newTangentVec;
    private __verticalAngleThrethold;
    private __verticalAngleOfVectors;
    private __isForceGrab;
    private __isSymmetryMode;
    eventTargetDom?: HTMLElement;
    private __doResetWhenCameraSettingChanged;
    private __rot_bgn_x;
    private __rot_bgn_y;
    private __rot_x;
    private __rot_y;
    private __wheel_y;
    private __eyeVec;
    private __centerVec;
    private __upVec;
    private __shiftCameraTo;
    private __lengthCenterToCorner;
    private __cameraComponent?;
    private __targetEntity?;
    private __lengthCameraToObject;
    private __scaleOfLengthCameraToCenter;
    private __zFarAdjustingFactorBasedOnAABB;
    private __scaleOfZNearAndZFar;
    private __doPreventDefault;
    private __pinchInOutInitDistance?;
    private static returnVector3Eye;
    private static returnVector3Center;
    private static returnVector3Up;
    private __maximum_y?;
    private __minimum_y?;
    private __mouseDownFunc;
    private __mouseUpFunc;
    private __mouseMoveFunc;
    private __pinchInOutStartFunc;
    private __pinchInOutFunc;
    private __mouseWheelFunc;
    private __mouseDblClickFunc;
    private __contextMenuFunc;
    constructor(entityUid: EntityUID, componentSid: ComponentSID, entityRepository: EntityRepository);
    zFarAdjustingFactorBasedOnAABB: number;
    setTarget(targetEntity: Entity): void;
    getTarget(): Entity | undefined;
    doPreventDefault: boolean;
    $create(): void;
    __mouseUp(evt: any): void;
    __mouseDown(evt: any): boolean;
    __mouseMove(evt: any): void;
    maximumY: number;
    minimumY: number;
    private __tryToPreventDefault;
    __mouseWheel(evt: WheelEvent): void;
    __contextMenu(evt: Event): void;
    __mouseDblClick(evt: MouseEvent): void;
    resetDolly(): void;
    dolly: any;
    __getTouchesDistance(event: TouchEvent): number;
    __pinchInOutStart(event: TouchEvent): void;
    __pinchInOut(event: TouchEvent): void;
    registerEventListeners(eventTargetDom?: Document): void;
    unregisterEventListeners(eventTargetDom?: Document): void;
    __getFovyFromCamera(camera: CameraComponent): number;
    $logic(): void;
    __convert(camera: CameraComponent, eye: Vector3, center: Vector3, up: Vector3): {
        newEyeVec: any;
        newCenterVec: MutableVector3;
        newUpVec: any;
        newZNear: number;
        newZFar: number;
        newLeft: number;
        newRight: number;
        newTop: number;
        newBottom: number;
        fovy: number;
    };
    __getTargetAABB(): import("../math/AABB").default;
    __updateTargeting(camera: CameraComponent): {
        newEyeVec: any;
        newCenterVec: Vector3;
        newUpVec: any;
    };
    scaleOfZNearAndZFar: number;
    static readonly componentTID: ComponentTID;
}
