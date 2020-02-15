import Component from "../core/Component";
import EntityRepository from "../core/EntityRepository";
import { AnimationInterpolationEnum } from "../definitions/AnimationInterpolation";
import { CompositionTypeEnum } from "../definitions/CompositionType";
import Quaternion from "../math/Quaternion";
import MutableVector3 from "../math/MutableVector3";
import MutableQuaternion from "../math/MutableQuaternion";
import { ComponentTID, ComponentSID, EntityUID, Index } from "../../types/CommonTypes";
declare type AnimationLine = {
    input: number[];
    output: any[];
    inTangent: number[];
    outTangent: number[];
    outputAttributeName: string;
    outputCompositionType: CompositionTypeEnum;
    interpolationMethod: AnimationInterpolationEnum;
    targetEntityUid?: EntityUID;
};
export default class AnimationComponent extends Component {
    private __animationLine;
    private __backupDefaultValues;
    static globalTime: number;
    private static __isAnimating;
    private __isAnimating;
    private __transformComponent?;
    private __meshComponent?;
    private static __startInputValueOfAllComponent;
    private static __endInputValueOfAllComponent;
    private static returnVector3;
    private static returnQuaternion;
    private static __startInputValueDirty;
    private static __endInputValueDirty;
    private static __componentRepository;
    constructor(entityUid: EntityUID, componentSid: ComponentSID, entityRepository: EntityRepository);
    static get componentTID(): ComponentTID;
    setAnimation(attributeName: string, animationInputArray: number[], animationOutputArray: any[], interpolation: AnimationInterpolationEnum): void;
    static lerp(start: any, end: any, ratio: number, compositionType: CompositionTypeEnum, animationAttributeIndex: Index): number | MutableVector3 | Quaternion;
    static cubicSpline(start: any, end: any, inTangent: any, outTangent: any, ratio: number, animationAttributeIndex: Index): number | MutableVector3 | MutableQuaternion;
    private static __isClamped;
    static binarySearch(inputArray: number[], input: number): number;
    static interpolationSearch(inputArray: number[], input: number): number;
    static bruteForceSearch(inputArray: number[], input: number): number;
    static interpolate(line: AnimationLine, input: number, animationAttributeIndex: Index): any;
    getStartInputValueOfAnimation(): number;
    getEndInputValueOfAnimation(): number;
    static get startInputValue(): number;
    static get endInputValue(): number;
    $create(): void;
    $logic(): void;
    static get isAnimating(): boolean;
    static set isAnimating(flg: boolean);
    get isAnimating(): boolean;
    set isAnimating(flg: boolean);
    private restoreDefaultValues;
    private backupDefaultValues;
}
export {};