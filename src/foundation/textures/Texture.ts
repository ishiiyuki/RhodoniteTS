import RnObject from "../core/Object";
import WebGLResourceRepository from "../../webgl/WebGLResourceRepository";
import { PixelFormat } from "../definitions/PixelFormat";
import { ComponentType } from "../definitions/ComponentType";
import { TextureParameter } from "../definitions/TextureParameter";

export default class Texture extends RnObject {
  private __width: Size = 0;
  private __height: Size = 0;

  private static readonly InvalidTextureUid: TextureUID = -1;
  private static __textureUidCount: TextureUID = Texture.InvalidTextureUid;
  private __textureUid: TextureUID;
  private __img?: HTMLImageElement;
  private __isTextureReady = true;
  public texture3DAPIResourseUid: CGAPIResourceHandle = -1;

  constructor() {
    super(true);
    this.__textureUid = ++Texture.__textureUidCount;
  }

  get textureUID() {
    return this.__textureUid;
  }

  get width() {
    return this.__width;
  }

  get height() {
    return this.__height;
  }

  /**
   * get a value nearest power of two.
   *
   * @param x texture size.
   * @returns a value nearest power of two.
   */
  _getNearestPowerOfTwo(x: number): number {
    return Math.pow( 2, Math.round( Math.log( x ) / Math.LN2 ) );
  }

  _getResizedCanvas(image: HTMLImageElement) {
    var canvas = document.createElement("canvas");
    canvas.width = this._getNearestPowerOfTwo(image.width);
    canvas.height = this._getNearestPowerOfTwo(image.height);

    var ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas;
  }

  generateTExtureFromImage(image: HTMLImageElement) {
    let imgCanvas = this._getResizedCanvas(image);
    this.__width = imgCanvas.width;
    this.__height = imgCanvas.height;

    let texture = WebGLResourceRepository.getInstance().createTexture(
      imgCanvas, {
        level: 0, internalFormat: PixelFormat.RGBA, width: this.__width, height: this.__height,
        border: 0, format: PixelFormat.RGBA, type: ComponentType.HalfFloat, magFilter: TextureParameter.Linear, minFilter: TextureParameter.Linear,
        wrapS: TextureParameter.Repeat, wrapT: TextureParameter.Repeat, generateMipmap: true, anisotropy: true
      });

    this.texture3DAPIResourseUid = texture;
    this.__isTextureReady = true;
  }

  generateTextureFromUri(imageUri: string) {
    return new Promise((resolve, reject)=> {
      this.__img = new Image();
      if (!imageUri.match(/^data:/)) {
        this.__img.crossOrigin = 'Anonymous';
      }
      this.__img.onload = () => {
        let imgCanvas = this._getResizedCanvas(this.__img!);
        this.__width = imgCanvas.width;
        this.__height = imgCanvas.height;

        let texture = WebGLResourceRepository.getInstance().createTexture(
          imgCanvas, {
            level: 0, internalFormat: PixelFormat.RGBA, width: this.__width, height: this.__height,
            border: 0, format: PixelFormat.RGBA, type: ComponentType.HalfFloat, magFilter: TextureParameter.Linear, minFilter: TextureParameter.Linear,
            wrapS: TextureParameter.Repeat, wrapT: TextureParameter.Repeat, generateMipmap: true, anisotropy: true
          });

        this.texture3DAPIResourseUid = texture;
        this.__isTextureReady = true;

        resolve();
      };

      this.__img.src = imageUri;
    });
  }
}
