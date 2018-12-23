import { EnumClass, EnumIO, _from } from "../misc/EnumIO";

export interface TextureParameterEnum extends EnumIO {
}

class TextureParameterClass extends EnumClass implements TextureParameterEnum {

  constructor({index, str} : {index: number, str: string}) {
    super({index, str});

  }

}

const Nearest: TextureParameterEnum = new TextureParameterClass({index:0x2600, str:'NEAREST'});
const Linear: TextureParameterEnum = new TextureParameterClass({index:0x2601, str:'LINEAR'});
const TextureMagFilter: TextureParameterEnum = new TextureParameterClass({index:0x2800, str:'TEXTURE_MAG_FILTER'});
const TextureMinFilter: TextureParameterEnum = new TextureParameterClass({index:0x2801, str:'TEXTURE_MIN_FILTER'});
const TextureWrapS: TextureParameterEnum = new TextureParameterClass({index:0x2802, str:'TEXTURE_WRAP_S'});
const TextureWrapT: TextureParameterEnum = new TextureParameterClass({index:0x2803, str:'TEXTURE_WRAP_T'});
const Texture2D: TextureParameterEnum = new TextureParameterClass({index:0x0DE1, str:'TEXTURE_2D'});
const Texture: TextureParameterEnum = new TextureParameterClass({index:0x1702, str:'TEXTURE'});
const Texture0: TextureParameterEnum = new TextureParameterClass({index:0x84C0, str:'TEXTURE0'});
const Texture1: TextureParameterEnum = new TextureParameterClass({index:0x84C1, str:'TEXTURE1'});
const ActiveTexture: TextureParameterEnum = new TextureParameterClass({index:0x84E0, str:'ACTIVE_TEXTURE'});
const Repeat: TextureParameterEnum = new TextureParameterClass({index:0x2901, str:'REPEAT'});
const ClampToEdge: TextureParameterEnum = new TextureParameterClass({index:0x812F, str:'CLAMP_TO_EDGE'});

const typeList = [ Nearest, Linear, TextureMagFilter, TextureMinFilter, TextureWrapS, TextureWrapT, Texture2D, Texture, Texture0, Texture1, ActiveTexture, Repeat, ClampToEdge ];

function from({ index }: { index: number }): TextureParameterEnum {
  return _from({typeList, index}) as TextureParameterEnum;
}

export const TextureParameter = Object.freeze({ Nearest, Linear, TextureMagFilter, TextureMinFilter, TextureWrapS, TextureWrapT, Texture2D, Texture, Texture0, Texture1, ActiveTexture, Repeat, ClampToEdge });
