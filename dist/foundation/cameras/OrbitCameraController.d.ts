import Vector3 from "../math/Vector3";
import MutableVector3 from "../math/MutableVector3";
import CameraComponent from "../components/CameraComponent";
import Entity from "../core/Entity";
import { Size } from "../../types/CommonTypes";
import ICameraController from "./ICameraController";
export default class OrbitCameraController implements ICameraController {
    private __isKeyUp;
    private __originalY;
    private __originalX;
    private __buttonNumber;
    private __mouse_translate_y;
    private __mouse_translate_x;
    private __efficiency;
    private __lengthOfCenterToEye;
    private __foyvBias;
    private __scaleOfTranslation;
    private __mouseTranslateVec;
    private __newEyeToCenterVec;
    private __newUpVec;
    private __newTangentVec;
    private __verticalAngleThreshold;
    private __verticalAngleOfVectors;
    private __isForceGrab;
    private __isSymmetryMode;
    eventTargetDom?: HTMLElement;
    private __doResetWhenCameraSettingChanged;
    private __rot_bgn_x;
    private __rot_bgn_y;
    private __rot_x;
    private __rot_y;
    private __dolly;
    private __dollyScale;
    private __eyeVec;
    private __centerVec;
    private __upVec;
    private __shiftCameraTo;
    private __lengthCenterToCorner;
    private __targetEntity?;
    private __lengthCameraToObject;
    private __scaleOfLengthCameraToCenter;
    private __zFarAdjustingFactorBasedOnAABB;
    private __scaleOfZNearAndZFar;
    private __doPreventDefault;
    moveSpeed: number;
    private __pinchInOutControl;
    private __pinchInOutOriginalDistance?;
    private static returnVector3Eye;
    private static returnVector3Center;
    private static returnVector3Up;
    private __maximum_y?;
    private __minimum_y?;
    private __resetDollyTouchTime;
    private __controllerTranslate;
    private __mouseDownFunc;
    private __mouseUpFunc;
    private __mouseMoveFunc;
    private __touchDownFunc;
    private __touchUpFunc;
    private __touchMoveFunc;
    private __pinchInOutFunc;
    private __pinchInOutEndFunc;
    private __mouseWheelFunc;
    private __mouseDblClickFunc;
    private __contextMenuFunc;
    private _eventTargetDom?;
    private __resetDollyAndPositionFunc;
    constructor();
    set zFarAdjustingFactorBasedOnAABB(value: number);
    get zFarAdjustingFactorBasedOnAABB(): number;
    setTarget(targetEntity: Entity): void;
    getTarget(): Entity | undefined;
    set doPreventDefault(flag: boolean);
    get doPreventDefault(): boolean;
    __mouseDown(e: MouseEvent): void;
    __mouseMove(e: MouseEvent): void;
    __mouseUp(e: MouseEvent): void;
    __touchDown(e: TouchEvent): void;
    __touchMove(e: TouchEvent): void;
    __touchUp(e: TouchEvent): void;
    set maximumY(maximum_y: number);
    set minimumY(minimum_y: number);
    __rotateControl(originalX: Size, originalY: Size, currentX: Size, currentY: Size): void;
    __zoomControl(originalValue: Size, currentValue: Size): void;
    __parallelTranslateControl(originalX: Size, originalY: Size, currentX: Size, currentY: Size): void;
    __getTouchesDistance(e: TouchEvent): number;
    __pinchInOut(e: TouchEvent): void;
    __pinchInOutEnd(e: TouchEvent): void;
    private __tryToPreventDefault;
    __mouseWheel(evt: WheelEvent): void;
    __contextMenu(evt: Event): void;
    set dolly(value: number);
    get dolly(): number;
    __mouseDblClick(evt: MouseEvent): void;
    __resetDollyAndPosition(e: TouchEvent): void;
    registerEventListeners(eventTargetDom?: any): void;
    unregisterEventListeners(): void;
    __getFovyFromCamera(camera: CameraComponent): number;
    logic(cameraComponent: CameraComponent): void;
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
    set scaleOfZNearAndZFar(value: number);
    get scaleOfZNearAndZFar(): number;
}
