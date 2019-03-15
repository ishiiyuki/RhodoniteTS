import RnObject from "../core/RnObject";
import BufferView from "./BufferView";

export default class Buffer extends RnObject {
  private __byteLength: Size = 0;
  private __raw: ArrayBuffer;
  private __name: string = '';
  private __takenBytesIndex: Byte = 0;
  private __bufferViews: Array<BufferView> = [];

  constructor({byteLength, arrayBuffer, name} : {byteLength: Size, arrayBuffer: ArrayBuffer, name: string}) {
    super(true);
    this.__name = name;
    this.__byteLength = byteLength;
    this.__raw = arrayBuffer;
  }

  set name(str) {
    this.__name = str;
  }

  get name() {
    return this.__name;
  }

  getArrayBuffer() {
    return this.__raw;
  }

  takeBufferView({byteLengthToNeed, byteStride, isAoS} : {byteLengthToNeed: Byte, byteStride: Byte, isAoS: boolean}) {
    if (byteLengthToNeed % 4 !== 0) {
      console.info('Padding bytes added because byteLengthToNeed must be a multiple of 4.');
      byteLengthToNeed += 4 - (byteLengthToNeed % 4);
    }
    // if (byteStride % 4 !== 0) {
    //   console.info('Padding bytes added, byteStride must be a multiple of 4.');
    //   byteStride += 4 - (byteStride % 4);
    // }

    const array = new Uint8Array(this.__raw, this.__takenBytesIndex, byteLengthToNeed);

    const bufferView = new BufferView({buffer: this, byteOffset: this.__takenBytesIndex, byteLength: byteLengthToNeed, raw: array, isAoS: isAoS});
    bufferView.byteStride = byteStride;
    this.__takenBytesIndex += Uint8Array.BYTES_PER_ELEMENT * byteLengthToNeed;

    this.__bufferViews.push(bufferView);

    return bufferView;
  }

  takeBufferViewWithByteOffset({byteLengthToNeed, byteStride, byteOffset, isAoS} :
    {byteLengthToNeed: Byte, byteStride: Byte, byteOffset: Byte, isAoS: boolean}) {
    if (byteLengthToNeed % 4 !== 0) {
      console.info('Padding bytes added because byteLengthToNeed must be a multiple of 4.');
      byteLengthToNeed += 4 - (byteLengthToNeed % 4);
    }
    // if (byteStride % 4 !== 0) {
    //   console.info('Padding bytes added, byteStride must be a multiple of 4.');
    //   byteStride += 4 - (byteStride % 4);
    // }

    const array = new Uint8Array(this.__raw, byteOffset, byteLengthToNeed);

    const bufferView = new BufferView({buffer: this, byteOffset: byteOffset, byteLength: byteLengthToNeed, raw: array, isAoS: isAoS});

    const takenBytesIndex = Uint8Array.BYTES_PER_ELEMENT * byteLengthToNeed + byteOffset;
    if (this.__takenBytesIndex < takenBytesIndex) {
      this.__takenBytesIndex = takenBytesIndex;
    }

    bufferView.byteStride = byteStride;

    this.__bufferViews.push(bufferView);

    return bufferView;
  }

  _addTakenByteIndex(value: Byte) {
    this.__takenBytesIndex = value;
  }

  get byteSizeInUse() {
    return this.__byteLength;
  }

}
