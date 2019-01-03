import MemoryManager from '../core/MemoryManager';
import EntityRepository from './EntityRepository';
import BufferView from '../memory/BufferView';
import Accessor from '../memory/Accessor';
import { BufferUseEnum, BufferUse } from '../definitions/BufferUse';
import { CompositionTypeEnum, ComponentTypeEnum } from '../main';

type MemberInfo = {memberName: string, bufferUse: BufferUseEnum, compositionType: CompositionTypeEnum, componentType: ComponentTypeEnum};

export default class Component {
  private _component_sid: number;
  private static __bufferViews:{[s: string]: BufferView} = {};
  private static __accessors: Map<Function, Map<string, Accessor>> = new Map();
  private static __byteLengthSumOfMembers: Map<Function, { [s: string]: Byte }> = new Map();

  private static __memberInfo: Map<Function, MemberInfo[]> = new Map();

  private __isAlive: Boolean;
  protected __entityUid: EntityUID;
  protected __memoryManager: MemoryManager;
  protected __entityRepository: EntityRepository;

  constructor(entityUid: EntityUID, componentSid: ComponentSID) {
    this.__entityUid = entityUid
    this._component_sid = componentSid;
    this.__isAlive = true;

    this.__memoryManager = MemoryManager.getInstance();
    this.__entityRepository = EntityRepository.getInstance();
  }

  static get componentTID() {
    return 0;
  }

  get componentSID() {
    return this._component_sid;
  }

  get entityUID() {
    return this.__entityUid;
  }

  static getByteLengthSumOfMembers(bufferUse: BufferUseEnum, componentClass: Function) {
    const byteLengthSumOfMembers = this.__byteLengthSumOfMembers.get(componentClass)!
    return byteLengthSumOfMembers[bufferUse.toString()];
  }

  static setupBufferView() {
  }

  registerDependency(component: Component, isMust: boolean) {

  }

  static takeBufferViewer(bufferUse: BufferUseEnum, byteLengthSumOfMembers: Byte) {
    const buffer = MemoryManager.getInstance().getBuffer(bufferUse);
    const count = EntityRepository.getMaxEntityNumber();
    this.__bufferViews[bufferUse.toString()] =
    buffer.takeBufferView({byteLengthToNeed: byteLengthSumOfMembers * count, byteStride: 0, isAoS: false});
  }

  static takeOne(memberName: string, componentClass:Function): any {
    return this.__accessors.get(componentClass)!.get(memberName)!.takeOne();
  }

  static getAccessor(memberName: string, componentClass:Function): Accessor {
    return this.__accessors.get(componentClass)!.get(memberName)!;
  }

  static takeAccessor(bufferUse: BufferUseEnum, memberName: string, componentClass:Function, compositionType: CompositionTypeEnum, componentType: ComponentTypeEnum) {
    const count = EntityRepository.getMaxEntityNumber();
    if (!this.__accessors.has(componentClass)) {
      this.__accessors.set(componentClass, new Map());
    }

    const accessors = this.__accessors.get(componentClass)!;

    if (!accessors.has(memberName)) {
      accessors.set(memberName,
        this.__bufferViews[bufferUse.toString()].takeAccessor(
          {compositionType: compositionType, componentType, count: count})
      );
    }
  }

  static getByteOffsetOfThisComponentTypeInBuffer(bufferUse: BufferUseEnum): Byte {
    return this.__bufferViews[bufferUse.toString()]!.byteOffset;
  }

  static getByteOffsetOfFirstOfThisMemberInBuffer(memberName: string, componentClass:Function): Byte {
    return this.__accessors.get(componentClass)!.get(memberName)!.byteOffsetInBuffer;
  }

  static getByteOffsetOfFirstOfThisMemberInBufferView(memberName: string, componentClass:Function): Byte {
    return this.__accessors.get(componentClass)!.get(memberName)!.byteOffsetInBufferView;
  }

  static getCompositionTypeOfMember(memberName: string, componentClass:Function): CompositionTypeEnum | null {
    const memberInfoArray = this.__memberInfo.get(componentClass)!;
    const info = memberInfoArray.find(info=>{
      return info.memberName === memberName;
    });
    if (info != null) {
      return info.compositionType;
    } else {
      return null;
    }
  }

  static getComponentTypeOfMember(memberName: string, componentClass:Function): ComponentTypeEnum | null {
    const memberInfoArray = this.__memberInfo.get(componentClass)!;
    const info = memberInfoArray.find(info=>{
      return info.memberName === memberName;
    });
    if (info != null) {
      return info.componentType;
    } else {
      return null;
    }
  }

  static registerMember(bufferUse: BufferUseEnum, memberName: string, componentClass:Function, compositionType: CompositionTypeEnum, componentType: ComponentTypeEnum) {
    if (!this.__memberInfo.has(componentClass)) {
      this.__memberInfo.set(componentClass, []);
    }
    const memberInfoArray = this.__memberInfo.get(componentClass);
    memberInfoArray!.push({bufferUse, memberName, compositionType, componentType})
  }

  static submitToAllocation(componentClass:Function) {
    const members:Map<BufferUseEnum, Array<MemberInfo>> = new Map();

    const memberInfoArray = this.__memberInfo.get(componentClass)!;

    memberInfoArray.forEach(info=>{
      members.set(info.bufferUse, []);
    });

    memberInfoArray.forEach(info=>{
      members.get(info.bufferUse)!.push(info);
    });

    for (let bufferUse of members.keys()) {
      const infoArray = members.get(bufferUse)!;
      const bufferUseName = bufferUse.toString();
      this.__byteLengthSumOfMembers.set(componentClass, {bufferUseName: 0});
      let byteLengthSumOfMembers = this.__byteLengthSumOfMembers.get(componentClass)!;
      infoArray.forEach(info=>{
        byteLengthSumOfMembers[bufferUseName] += info.compositionType.getNumberOfComponents() * info.componentType.getSizeInBytes();
      });
      if (infoArray.length > 0) {
        this.takeBufferViewer(BufferUse.from({str: bufferUseName}), byteLengthSumOfMembers[bufferUseName]);
      }
    }

    for (let bufferUse of members.keys()) {
      const infoArray = members.get(bufferUse)!;
      infoArray.forEach(info=>{
        this.takeAccessor(info.bufferUse, info.memberName, componentClass, info.compositionType, info.componentType);
      });
    }

  }

  // $create() {
  //   // Define process dependencies with other components.
  //   // If circular depenencies are detected, the error will be repoated.

  //   // this.registerDependency(TransformComponent);
  // }

  // $load() {}

  // $mount() {}

  // $logic() {}

  // $prerender(instanceIDBufferUid: CGAPIResourceHandle) {}

  // $render() {}

  // $unmount() {}

  // $discard() {}
}

export interface ComponentConstructor {
  new(entityUid: EntityUID, componentSid: ComponentSID): Component;
  setupBufferView(): void;
}
