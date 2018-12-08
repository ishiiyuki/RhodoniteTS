import { EnumClass, EnumIO, _from } from "../misc/EnumIO";

export interface ComponentTypeEnum extends EnumIO {
}

class ComponentTypeClass extends EnumClass implements ComponentTypeEnum {
  readonly sizeInBytes: number;
  constructor({index, str, sizeInBytes} : {index: number, str: string, sizeInBytes: number}) {
    super({index, str});
    this.sizeInBytes = sizeInBytes
  }
}

const Unknown: ComponentTypeEnum = new ComponentTypeClass({index:5119, str:'UNKNOWN', sizeInBytes: 0});
const Byte: ComponentTypeEnum = new ComponentTypeClass({index:5120, str:'BYTE', sizeInBytes: 1});
const UnsignedByte: ComponentTypeEnum = new ComponentTypeClass({index:5121, str:'UNSIGNED_BYTE', sizeInBytes: 1});
const Short: ComponentTypeEnum = new ComponentTypeClass({index:5122, str:'SHORT', sizeInBytes: 2});
const UnsignedShort: ComponentTypeEnum = new ComponentTypeClass({index:5123, str:'UNSIGNED_SHORT', sizeInBytes: 2});
const Int: ComponentTypeEnum = new ComponentTypeClass({index:5124, str:'INT', sizeInBytes: 4});
const UnsingedInt: ComponentTypeEnum = new ComponentTypeClass({index:5125, str:'UNSIGNED_INT', sizeInBytes: 4});
const Float: ComponentTypeEnum = new ComponentTypeClass({index:5126, str:'FLOAT', sizeInBytes: 4});
const Double: ComponentTypeEnum = new ComponentTypeClass({index:5127, str:'DOUBLE', sizeInBytes: 8});

const typeList = [Unknown, Byte, UnsignedByte, Short, UnsignedShort, Int, UnsingedInt, Float, Double];

function from({ index }: { index: number }): ComponentTypeEnum {
  return _from({typeList, index});
}

export const ComponentType = Object.freeze({ Unknown, Byte, UnsignedByte, Short, UnsignedShort, Int, UnsingedInt, Float, Double, from });
