import { PrimitiveMode, PrimitiveModeEnum} from '../definitions/PrimitiveMode';
import { VertexAttributeEnum } from '../definitions/VertexAttribute';
import Accessor from '../memory/Accessor';
import RnObject from '../core/Object';
import BufferView from '../memory/BufferView';
import { ComponentTypeEnum } from '../definitions/ComponentType';
import MemoryManager from '../core/MemoryManager';
import { CompositionType, CompositionTypeEnum } from '../definitions/CompositionType';

export default class Primitive extends RnObject {
  private __mode: PrimitiveModeEnum;
  private __attributes: Array<Accessor>;
  private __material: ObjectUID;
  private __indices: Accessor;
  private __indicesBufferView: BufferView;
  private __attributesBufferView: BufferView;
  private __indicesComponentType: ComponentTypeEnum,
  private __attributeCompositionTypes: Array<CompositionTypeEnum>,
  private __attributeComponentTypes: Array<ComponentTypeEnum>,

  private constructor(
    indicesComponentType: ComponentTypeEnum,
    indicesAccessor: Accessor,
    attributeCompositionTypes: Array<CompositionTypeEnum>,
    attributeComponentTypes: Array<ComponentTypeEnum>,
    attributeAccessors: Array<Accessor>,
    mode: PrimitiveModeEnum,
    material: ObjectUID,
    indicesBufferView: BufferView,
    attributesBufferView: BufferView)
  {
    super();

    this.__indices = indicesAccessor;
    this.__attributes = attributeAccessors;
    this.__material = material;
    this.__mode = mode;
    this.__indicesBufferView = indicesBufferView;
    this.__attributesBufferView = attributesBufferView;
    this.__indicesComponentType = indicesComponentType;
    this.__attributeCompositionTypes = attributeCompositionTypes;
    this.__attributeComponentTypes = attributeComponentTypes;
  }

  static createPrimitive(
    {indicesComponentType, indices, attributeCompositionTypes, attributeComponentTypes, attributes, material, primitiveMode} :
    {
      indicesComponentType: ComponentTypeEnum,
      indices: ArrayBuffer,
      attributeCompositionTypes: Array<CompositionTypeEnum>,
      attributeComponentTypes: Array<ComponentTypeEnum>,
      attributes: Array<ArrayBuffer>,
      primitiveMode: PrimitiveModeEnum,
      material: ObjectUID
    })
  {
    const buffer = MemoryManager.getInstance().getBufferForCPU();
    const indicesBufferView = buffer.takeBufferView({byteLengthToNeed: indices.byteLength, byteStride: 0});
    const indicesAccessor = indicesBufferView.takeAccessor({
      compositionType: CompositionType.Scalar,
      componentType: indicesComponentType,
      count: indices.byteLength / indicesComponentType.getSizeInBytes()
    });

    let sumOfAttributesByteSize = 0;
    attributes.forEach(attribute=>{
      sumOfAttributesByteSize += attribute.byteLength;
    });
    const attributesBufferView = buffer.takeBufferView({byteLengthToNeed: sumOfAttributesByteSize, byteStride: 0});

    const attributeAccessors: Array<Accessor> = [];
    attributes.forEach((attribute, i)=>{
      attributeAccessors.push(
        attributesBufferView.takeAccessor({
          compositionType: attributeCompositionTypes[i],
          componentType: attributeComponentTypes[i],
          count: indices.byteLength / attributeCompositionTypes[i].getNumberOfComponents() / attributeComponentTypes[i].getSizeInBytes()
        })
      );
    });

    return new Primitive(
      indicesComponentType,
      indicesAccessor,
      attributeCompositionTypes,
      attributeComponentTypes,
      attributeAccessors,
      primitiveMode,
      material,
      indicesBufferView,
      attributesBufferView
    );
  }
}
