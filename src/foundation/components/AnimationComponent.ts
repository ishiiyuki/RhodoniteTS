import Component from '../core/Component';
import ComponentRepository from '../core/ComponentRepository';
import EntityRepository from '../core/EntityRepository';
import {WellKnownComponentTIDs} from './WellKnownComponentTIDs';
import {
  AnimationInterpolationEnum,
  AnimationInterpolation,
} from '../definitions/AnimationInterpolation';
import {AnimationAttribute} from '../definitions/AnimationAttribute';
import TransformComponent from './TransformComponent';
import {ProcessStage} from '../definitions/ProcessStage';
import MutableVector3 from '../math/MutableVector3';
import MutableQuaternion from '../math/MutableQuaternion';
import MeshComponent from './MeshComponent';
import {
  ComponentTID,
  ComponentSID,
  EntityUID,
  Index,
} from '../../types/CommonTypes';
import {
  defaultValue,
  defaultValueWithCallback,
  greaterThan,
  lessThan,
} from '../misc/MiscUtil';
import {EventPubSub, EventHandler} from '../system/EventPubSub';
import {IVector, IVector3} from '../math/IVector';
import {IQuaternion} from '../math/IQuaternion';

export type AnimationName = string;
export type AnimationAttributeName = string;
type TimeInSec = number;

export interface AnimationInfo {
  name: AnimationName;
  maxStartInputTime: TimeInSec;
  maxEndInputTime: TimeInSec;
}

interface AnimationLine {
  name: AnimationName;
  input: number[];
  output: Array<IVector | IQuaternion>;
  outputAttributeName: AnimationAttributeName;
  interpolationMethod: AnimationInterpolationEnum;
  targetEntityUid?: EntityUID;
}

type AnimationSet = Map<AnimationAttributeName, AnimationLine>;

export interface ChangeAnimationInfoEvent {
  infoMap: Map<AnimationName, AnimationInfo>;
}

const defaultAnimationInfo = {
  name: '',
  maxStartInputTime: 0,
  maxEndInputTime: 0,
};

const ChangeAnimationInfo = Symbol(
  'AnimationComponentEventChangeAnimationInfo'
);
const PlayEnd = Symbol('AnimationComponentEventPlayEnd');
type AnimationComponentEventType = symbol;

export default class AnimationComponent extends Component {
  private __backupDefaultValues: Map<
    AnimationAttributeName,
    IVector | IQuaternion | number[]
  > = new Map();
  private __currentActiveAnimationName?: AnimationName;
  private __animationData: Map<AnimationName, AnimationSet> = new Map();
  public static globalTime = 0;
  private __isAnimating = true;
  private __transformComponent?: TransformComponent;
  private __meshComponent?: MeshComponent;
  private static __componentRepository: ComponentRepository = ComponentRepository.getInstance();

  private static __returnVector3 = MutableVector3.zero();
  private static __tmpVector3_0 = MutableVector3.zero();
  private static __tmpVector3_1 = MutableVector3.zero();
  private static __tmpVector3_2 = MutableVector3.zero();
  private static __tmpVector3_3 = MutableVector3.zero();
  private static __returnQuaternion = MutableQuaternion.identity();
  private static __tmpQuaternion_0 = MutableQuaternion.identity();
  private static __tmpQuaternion_1 = MutableQuaternion.identity();
  private static __tmpQuaternion_2 = MutableQuaternion.identity();
  private static __tmpQuaternion_3 = MutableQuaternion.identity();
  private static __animationInfo: Map<AnimationName, AnimationInfo> = new Map();
  private static __pubsub = new EventPubSub();
  static Event = {
    ChangeAnimationInfo,
    PlayEnd,
  };

  constructor(
    entityUid: EntityUID,
    componentSid: ComponentSID,
    entityRepository: EntityRepository
  ) {
    super(entityUid, componentSid, entityRepository);

    this.__currentProcessStage = ProcessStage.Create;
  }

  static get componentTID(): ComponentTID {
    return WellKnownComponentTIDs.AnimationComponentTID;
  }

  static setActiveAnimationForAll(animationName: AnimationName) {
    const components = ComponentRepository.getInstance().getComponentsWithType(
      AnimationComponent
    ) as AnimationComponent[];
    for (const component of components) {
      component.setActiveAnimation(animationName);
    }
  }

  setActiveAnimation(animationName: AnimationName) {
    if (this.__animationData.has(animationName)) {
      this.__currentActiveAnimationName = animationName;
      return true;
    } else {
      this.__currentActiveAnimationName = undefined;
      return false;
    }
  }

  setAnimation(
    animationName: string,
    attributeName: string,
    animationInputArray: number[],
    animationOutputArray: Array<IVector | IQuaternion>,
    interpolation: AnimationInterpolationEnum,
    makeThisActiveAnimation = true
  ) {
    if (makeThisActiveAnimation) {
      this.__currentActiveAnimationName = animationName;
    } else {
      this.__currentActiveAnimationName = defaultValue(
        animationName,
        this.__currentActiveAnimationName
      );
    }

    const line: AnimationLine = {
      name: animationName,
      input: animationInputArray,
      output: animationOutputArray,
      outputAttributeName: attributeName,
      interpolationMethod: interpolation,
    };

    // set AnimationSet
    const animationSet = defaultValueWithCallback(() => {
      const map = new Map();
      this.__animationData.set(animationName, map);
      return map;
    }, this.__animationData.get(animationName));

    animationSet.set(attributeName, line);

    // set AnimationInfo
    const newMaxStartInputTime = animationInputArray[0];
    const newMaxEndInputTime =
      animationInputArray[animationInputArray.length - 1];

    const existingAnimationInfo = defaultValue<AnimationInfo>(
      defaultAnimationInfo,
      AnimationComponent.__animationInfo.get(animationName)
    );
    const existingMaxStartInputTime = existingAnimationInfo.maxStartInputTime;
    const existingMaxEndInputTime = existingAnimationInfo.maxEndInputTime;

    // eslint-disable-next-line prettier/prettier
    const startResult = lessThan(existingMaxStartInputTime, newMaxStartInputTime);
    const endResult = greaterThan(newMaxEndInputTime, existingMaxEndInputTime);
    if (startResult.result || endResult.result) {
      const info = {
        name: animationName,
        maxStartInputTime: startResult.less,
        maxEndInputTime: endResult.greater,
      };
      AnimationComponent.__animationInfo.set(animationName, info);
      AnimationComponent.__pubsub.publishAsync(
        AnimationComponent.Event.ChangeAnimationInfo,
        {infoMap: new Map(AnimationComponent.__animationInfo)}
      );
    }

    this.__transformComponent = this.__entityRepository.getComponentOfEntity(
      this.__entityUid,
      TransformComponent
    ) as TransformComponent;
    this.__meshComponent = this.__entityRepository.getComponentOfEntity(
      this.__entityUid,
      MeshComponent
    ) as MeshComponent;
    this.backupDefaultValues();
  }

  static subscribe(type: AnimationComponentEventType, handler: EventHandler) {
    AnimationComponent.__pubsub.subscribe(type, handler);
  }

  static lerp(
    start: any,
    end: any,
    ratio: number,
    animationAttributeIndex: Index
  ) {
    if (animationAttributeIndex === AnimationAttribute.Quaternion.index) {
      return MutableQuaternion.qlerpTo(
        start,
        end,
        ratio,
        AnimationComponent.__returnQuaternion
      );
    } else if (animationAttributeIndex === AnimationAttribute.Weights.index) {
      const returnArray = Array(start.length);
      for (let i = 0; i < start.length; i++) {
        returnArray[i] = start[i] * (1 - ratio) + end[i] * ratio;
      }
      return returnArray;
    } else {
      const l_vec = MutableVector3.multiplyTo(
        start,
        1 - ratio,
        this.__tmpVector3_0
      );
      const r_vec = MutableVector3.multiplyTo(end, ratio, this.__tmpVector3_1);
      return this.__returnVector3.copyComponents(l_vec).add(r_vec);
    }
  }

  /**
   * Compute cubic spline interpolation.
   * @param p_0 starting point
   * @param p_1 ending point
   * @param m_0 inTangent
   * @param m_1 outTangent
   * @param t ratio
   * @param animationAttributeIndex index of attribution
   */

  static cubicSpline(
    p_0: any,
    p_1: any,
    m_0: any,
    m_1: any,
    t: number,
    animationAttributeIndex: Index
  ) {
    const ratio2 = t * t;
    const ratio3 = ratio2 * t;

    // coefficients
    const c_0 = 2 * ratio3 - 3 * ratio2 + 1;
    const c_1 = ratio3 - 2 * ratio2 + t;
    const c_2 = -2 * ratio3 + 3 * ratio2;
    const c_3 = ratio3 - ratio2;

    if (animationAttributeIndex === AnimationAttribute.Quaternion.index) {
      const cp_0 = MutableQuaternion.multiplyNumberTo(
        p_0,
        c_0,
        this.__tmpQuaternion_0
      );
      const cm_0 = MutableQuaternion.multiplyNumberTo(
        m_0,
        c_1,
        this.__tmpQuaternion_1
      );
      const cp_1 = MutableQuaternion.multiplyNumberTo(
        p_1,
        c_2,
        this.__tmpQuaternion_2
      );
      const cm_1 = MutableQuaternion.multiplyNumberTo(
        m_1,
        c_3,
        this.__tmpQuaternion_3
      );
      return this.__returnQuaternion
        .copyComponents(cp_0)
        .add(cm_0)
        .add(cp_1)
        .add(cm_1);
    } else if (animationAttributeIndex === AnimationAttribute.Weights.index) {
      return [c_0 * p_0 + c_1 * m_0 + c_2 * p_1 + c_3 * m_1];
    } else {
      const cp_0 = MutableVector3.multiplyTo(p_0, c_0, this.__tmpVector3_0);
      const cm_0 = MutableVector3.multiplyTo(m_0, c_1, this.__tmpVector3_1);
      const cp_1 = MutableVector3.multiplyTo(p_1, c_2, this.__tmpVector3_2);
      const cm_1 = MutableVector3.multiplyTo(m_1, c_3, this.__tmpVector3_3);
      return this.__returnVector3
        .copyComponents(cp_0)
        .add(cm_0)
        .add(cp_1)
        .add(cm_1);
    }
  }

  private static __isClamped(idx: number, inputArray: number[]) {
    if (idx < 0) {
      return true;
    }
    if (idx >= inputArray.length) {
      return true;
    }
    return false;
  }

  static binarySearch(inputArray: number[], currentTime: number) {
    let low = 0;
    let high = inputArray.length - 1;
    let mid = 0;
    let retVal = 0;
    while (low <= high) {
      mid = low + ((high - low) >> 1);

      if (inputArray[mid] < currentTime) {
        low = mid + 1;
        retVal = mid;
      } else if (currentTime < inputArray[mid]) {
        high = mid - 1;
        retVal = high;
      } else {
        // if (inputArray[mid] === input) {
        return mid;
      }
    }

    return retVal;
  }

  static interpolationSearch(inputArray: number[], currentTime: number) {
    let mid = 0;
    let lower = 0;
    let upper = inputArray.length - 1;
    let retVal = 0;

    while (
      lower <= upper &&
      currentTime >= inputArray[lower] &&
      currentTime <= inputArray[upper]
    ) {
      mid = Math.floor(
        lower +
          ((currentTime - inputArray[lower]) * (upper - lower)) /
            (inputArray[upper] - inputArray[lower])
      );

      if (inputArray[mid] < currentTime) {
        lower = mid + 1;
        retVal = mid;
      } else if (currentTime < inputArray[mid]) {
        upper = mid - 1;
        retVal = upper;
      } else {
        // if (inputArray[mid] === input) {
        return mid;
      }
    }

    return retVal;
  }

  static bruteForceSearch(inputArray: number[], currentTime: number) {
    for (let i = 0; i < inputArray.length; i++) {
      if (inputArray[i] <= currentTime && currentTime < inputArray[i + 1]) {
        return i;
      }
    }
    return inputArray.length - 1;
  }

  static interpolate(
    line: AnimationLine,
    currentTime: number,
    animationAttributeIndex: Index
  ) {
    const inputArray = line.input;
    const outputArray = line.output;
    const method = line.interpolationMethod ?? AnimationInterpolation.Linear;

    // out of range
    if (currentTime <= inputArray[0]) {
      return outputArray[0];
    } else if (inputArray[inputArray.length - 1] <= currentTime) {
      return outputArray[inputArray.length - 1];
    }

    if (method === AnimationInterpolation.CubicSpline) {
      // https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#appendix-c-spline-interpolation

      const k = this.interpolationSearch(inputArray, currentTime);
      const t_diff = inputArray[k + 1] - inputArray[k]; // t_(k+1) - t_k
      const t = (currentTime - inputArray[k]) / t_diff;
      const [p_0, p_1, m_0, m_1] = this.__prepareVariablesForCubicSpline(
        outputArray,
        k,
        t_diff,
        animationAttributeIndex
      );
      return this.cubicSpline(p_0, p_1, m_0, m_1, t, animationAttributeIndex);
    } else if (method === AnimationInterpolation.Linear) {
      const i = this.interpolationSearch(inputArray, currentTime);
      const ratio =
        (currentTime - inputArray[i]) / (inputArray[i + 1] - inputArray[i]);
      return this.lerp(
        outputArray[i],
        outputArray[i + 1],
        ratio,
        animationAttributeIndex
      );
    } else if (method === AnimationInterpolation.Step) {
      for (let i = 0; i < inputArray.length - 1; i++) {
        if (inputArray[i] <= currentTime && currentTime < inputArray[i + 1]) {
          return outputArray[i];
        }
      }
      return outputArray[inputArray.length - 1];
    }

    // non supported type
    return outputArray[0];
  }

  private static __prepareVariablesForCubicSpline(
    outputArray: any[],
    k: number,
    t_diff: number,
    animationAttributeIndex: number
  ) {
    let p_0, p_1, m_0, m_1;

    if (animationAttributeIndex === AnimationAttribute.Quaternion.index) {
      p_0 = outputArray[3 * k + 1]; //v_k
      p_1 = outputArray[3 * k + 4]; //v_(k+1)

      // the num of__tmpQuaternion is specified by this.cubicSpline
      const b_k = this.__tmpQuaternion_2.copyComponents(outputArray[3 * k + 2]);
      m_0 = b_k.multiplyNumber(t_diff);

      const a_k_plus_one = this.__tmpQuaternion_3.copyComponents(
        outputArray[3 * k + 3]
      ); // a_(k+1)
      m_1 = a_k_plus_one.multiplyNumber(t_diff);
    } else if (animationAttributeIndex === AnimationAttribute.Weights.index) {
      p_0 = outputArray[k][1]; //v_k
      p_1 = outputArray[k + 1][1]; //v_(k+1)

      const b_k = outputArray[k][2];
      m_0 = t_diff * b_k;

      const a_k_plus_one = outputArray[k + 1][0];
      m_1 = t_diff * a_k_plus_one;
    } else {
      p_0 = outputArray[3 * k + 1];
      p_1 = outputArray[3 * k + 4];

      const b_k = this.__tmpVector3_2.copyComponents(outputArray[3 * k + 2]);
      m_0 = b_k.multiply(t_diff);

      const a_k_plus_one = this.__tmpVector3_3.copyComponents(
        outputArray[3 * k + 3]
      );
      m_1 = a_k_plus_one.multiply(t_diff);
    }

    return [p_0, p_1, m_0, m_1];
  }

  getStartInputValueOfAnimation(animationName?: string) {
    const name = animationName ?? this.__currentActiveAnimationName;
    if (name === undefined) {
      const array = Array.from(AnimationComponent.__animationInfo.values());
      if (array.length === 0) {
        return 0;
      }
      const firstAnimationInfo = (array[0] as unknown) as AnimationInfo;
      return firstAnimationInfo.maxEndInputTime;
    }
    const maxStartInputTime = defaultValue<AnimationInfo>(
      defaultAnimationInfo,
      AnimationComponent.__animationInfo.get(name)
    ).maxStartInputTime;

    return maxStartInputTime;
  }

  getEndInputValueOfAnimation(animationName?: string) {
    const name = animationName ?? this.__currentActiveAnimationName;

    if (name === undefined) {
      const array = Array.from(AnimationComponent.__animationInfo.values());
      if (array.length === 0) {
        return 0;
      }
      const firstAnimationInfo = (array[0] as unknown) as AnimationInfo;
      return firstAnimationInfo.maxEndInputTime;
    }
    const maxEndInputTime = defaultValue<AnimationInfo>(
      defaultAnimationInfo,
      AnimationComponent.__animationInfo.get(name)
    ).maxEndInputTime;

    return maxEndInputTime;
  }

  static getAnimationInfo() {
    return new Map(this.__animationInfo);
  }

  static get startInputValue() {
    const components = ComponentRepository.getInstance().getComponentsWithType(
      AnimationComponent
    ) as AnimationComponent[];
    if (components.length === 0) {
      return 0;
    } else {
      const infoArray = Array.from(this.__animationInfo.values());
      const lastInfo = infoArray[infoArray.length - 1];
      return lastInfo.maxStartInputTime;
    }
  }

  static get endInputValue() {
    const components = ComponentRepository.getInstance().getComponentsWithType(
      AnimationComponent
    ) as AnimationComponent[];
    if (components.length === 0) {
      return 0;
    } else {
      const infoArray = Array.from(this.__animationInfo.values());
      const lastInfo = infoArray[infoArray.length - 1];
      return lastInfo.maxEndInputTime;
    }
  }

  static get isAnimating() {
    const components = ComponentRepository.getInstance().getComponentsWithType(
      AnimationComponent
    ) as AnimationComponent[];

    for (const component of components) {
      if (component.isAnimating) {
        return true;
      }
    }
    return false;
  }

  setAnimating(flg: boolean) {
    this.__isAnimating = flg;
  }

  static setAnimatingForAll(flg: boolean) {
    const animationComponents = this.__componentRepository._getComponents(
      AnimationComponent
    )! as AnimationComponent[];
    for (const animationComponent of animationComponents) {
      animationComponent.setAnimating(flg);
    }
  }

  get isAnimating() {
    return this.__isAnimating;
  }

  setAnimationToRest() {
    this.restoreDefaultValues();
  }

  private restoreDefaultValues() {
    this.__transformComponent!.quaternion = this.__backupDefaultValues.get(
      AnimationAttribute.Quaternion.str
    ) as IQuaternion;
    this.__transformComponent!.translate = this.__backupDefaultValues.get(
      AnimationAttribute.Translate.str
    ) as IVector3;
    this.__transformComponent!.scale = this.__backupDefaultValues.get(
      AnimationAttribute.Scale.str
    ) as IVector3;
    if (this.__meshComponent != null) {
      this.__meshComponent!.weights = this.__backupDefaultValues.get(
        AnimationAttribute.Weights.str
      ) as number[];
    }
  }

  private backupDefaultValues() {
    this.__backupDefaultValues.set(
      AnimationAttribute.Quaternion.str,
      this.__transformComponent!.quaternion
    );
    this.__backupDefaultValues.set(
      AnimationAttribute.Translate.str,
      this.__transformComponent!.translate
    );
    this.__backupDefaultValues.set(
      AnimationAttribute.Scale.str,
      this.__transformComponent!.scale
    );
    if (this.__meshComponent != null) {
      this.__backupDefaultValues.set(
        AnimationAttribute.Weights.str,
        this.__meshComponent?.weights
      );
    }
  }

  static getAnimationList() {
    return Array.from(this.__animationInfo.keys());
  }

  $create() {
    this.__transformComponent = this.__entityRepository.getComponentOfEntity(
      this.__entityUid,
      TransformComponent
    ) as TransformComponent;
    this.__meshComponent = this.__entityRepository.getComponentOfEntity(
      this.__entityUid,
      MeshComponent
    ) as MeshComponent;
    this.moveStageTo(ProcessStage.Logic);
  }

  $logic() {
    if (this.isAnimating && this.__currentActiveAnimationName !== undefined) {
      const animationSet = this.__animationData.get(
        this.__currentActiveAnimationName
      );
      if (animationSet !== undefined) {
        for (const [attributeName, line] of animationSet) {
          const i = AnimationAttribute.fromString(attributeName).index;
          const value = AnimationComponent.interpolate(
            line,
            AnimationComponent.globalTime,
            i
          );
          if (i === AnimationAttribute.Quaternion.index) {
            this.__transformComponent!.quaternion = value as IQuaternion;
          } else if (i === AnimationAttribute.Translate.index) {
            this.__transformComponent!.translate = value as IVector3;
          } else if (i === AnimationAttribute.Scale.index) {
            this.__transformComponent!.scale = value as IVector3;
          } else if (i === AnimationAttribute.Weights.index) {
            this.__meshComponent!.weights = value as number[];
          }
        }
      }
    }
  }
}
ComponentRepository.registerComponentClass(AnimationComponent);
