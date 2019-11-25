import ICameraController from "./ICameraController";
import MutableVector3 from "../math/MutableVector3";
import CameraComponent from "../components/CameraComponent";
import Entity from "../core/Entity";
export default class WalkThroughCameraController implements ICameraController {
    private _horizontalSpeed;
    private _verticalSpeed;
    private _turnSpeed;
    private _mouseWheelSpeedScale;
    private _inverseVerticalRotating;
    private _inverseHorizontalRotating;
    private _onKeydown;
    private _isKeyDown;
    private _isMouseDrag;
    private _lastKeyCode;
    private _onKeyup;
    private _currentDir;
    private _currentPos;
    private _currentCenter;
    private _newDir;
    private _isMouseDown;
    private _clickedMouseXOnCanvas;
    private _clickedMouseYOnCanvas;
    private _draggedMouseXOnCanvas;
    private _draggedMouseYOnCanvas;
    private _deltaMouseXOnCanvas;
    private _deltaMouseYOnCanvas;
    private _mouseXAdjustScale;
    private _mouseYAdjustScale;
    private _deltaY;
    private _deltaX;
    private _mouseUpBind;
    private _mouseDownBind;
    private _mouseMoveBind;
    private _mouseWheelBind;
    private _eventTargetDom?;
    constructor(options?: {
        eventTargetDom: Document;
        verticalSpeed: number;
        horizontalSpeed: number;
        turnSpeed: number;
        mouseWheelSpeedScale: number;
        inverseVerticalRotating: boolean;
        inverseHorizontalRotating: boolean;
    });
    registerEventListeners(eventTargetDom?: any): void;
    unregisterEventListeners(): void;
    _mouseWheel(e: MouseWheelEvent): void;
    _mouseDown(evt: MouseEvent): boolean;
    _mouseMove(evt: MouseEvent): void;
    _mouseUp(evt: MouseEvent): void;
    tryReset(): void;
    reset(): void;
    logic(cameraComponent: CameraComponent): void;
    private __convert;
    getDirection(): MutableVector3 | null;
    set horizontalSpeed(value: number);
    get horizontalSpeed(): number;
    set verticalSpeed(value: number);
    get verticalSpeed(): number;
    setTarget(targetEntity: Entity): void;
    get allInfo(): any;
    set allInfo(arg: any);
}