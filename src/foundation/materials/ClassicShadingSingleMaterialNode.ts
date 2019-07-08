import RnObject from "../core/RnObject";
import {
  ShaderSemanticsInfo,
  ShaderSemantics,
  ShaderSemanticsEnum
} from "../definitions/ShaderSemantics";
import { ShaderNodeEnum } from "../definitions/ShaderNode";
import AbstractMaterialNode from "./AbstractMaterialNode";
import { CompositionType } from "../definitions/CompositionType";
import MutableColorRgb from "../math/MutableColorRgb";
import Vector2 from "../math/Vector2";
import { ComponentType } from "../definitions/ComponentType";
import WebGLResourceRepository from "../../webgl/WebGLResourceRepository";
import CGAPIResourceRepository from "../renderer/CGAPIResourceRepository";
import ModuleManager from "../system/ModuleManager";
import { PixelFormat } from "../definitions/PixelFormat";
import { TextureParameter } from "../definitions/TextureParameter";
import Vector4 from "../math/Vector4";
import Vector3 from "../math/Vector3";
import ClassicShader from "../../webgl/shaders/ClassicShader";
import { ShadingModel } from "../definitions/ShadingModel";
import AbstractTexture from "../textures/AbstractTexture";
import { ShaderType } from "../definitions/ShaderType";

export default class ClassicShadingSingleMaterialNode extends AbstractMaterialNode {
  private static __dummyWhiteTextureUid: CGAPIResourceHandle =
    CGAPIResourceRepository.InvalidCGAPIResourceUid;
  private static __dummyBlueTextureUid: CGAPIResourceHandle =
    CGAPIResourceRepository.InvalidCGAPIResourceUid;
  private static __dummyBlackTextureUid: CGAPIResourceHandle =
    CGAPIResourceRepository.InvalidCGAPIResourceUid;
  private static __dummyBlackCubeTextureUid: CGAPIResourceHandle =
    CGAPIResourceRepository.InvalidCGAPIResourceUid;

  constructor() {
    super(ClassicShader.getInstance(), "classicShading");
    ClassicShadingSingleMaterialNode.initDefaultTextures();

    const shaderSemanticsInfoArray: ShaderSemanticsInfo[] = [
      {
        semantic: ShaderSemantics.DiffuseColorFactor,
        compositionType: CompositionType.Vec4,
        componentType: ComponentType.Float,
        stage: ShaderType.PixelShader,
        min: 0,
        max: 2,
        isPlural: false,
        prefix: "material.",
        isSystem: false,
        initialValue: new Vector4(1, 1, 1, 1)
      },
      {
        semantic: ShaderSemantics.DiffuseColorTexture,
        compositionType: CompositionType.Texture2D,
        componentType: ComponentType.Int,
        stage: ShaderType.PixelShader,
        min: 0,
        max: Number.MAX_SAFE_INTEGER,
        isPlural: false,
        isSystem: false,
        initialValue: [
          0,
          ClassicShadingSingleMaterialNode.__dummyWhiteTextureUid
        ]
      },
      {
        semantic: ShaderSemantics.NormalTexture,
        compositionType: CompositionType.Texture2D,
        componentType: ComponentType.Int,
        stage: ShaderType.PixelShader,
        min: 0,
        max: Number.MAX_SAFE_INTEGER,
        isPlural: false,
        isSystem: false,
        initialValue: [
          2,
          ClassicShadingSingleMaterialNode.__dummyBlueTextureUid
        ]
      },
      {
        semantic: ShaderSemantics.Shininess,
        compositionType: CompositionType.Scalar,
        componentType: ComponentType.Float,
        stage: ShaderType.PixelShader,
        min: 0,
        max: Number.MAX_VALUE,
        isPlural: false,
        isSystem: false,
        initialValue: 5
      },
      {
        semantic: ShaderSemantics.Wireframe,
        compositionType: CompositionType.Vec3,
        componentType: ComponentType.Float,
        stage: ShaderType.PixelShader,
        min: 0,
        max: 10,
        isPlural: false,
        isSystem: false,
        initialValue: new Vector3(0, 0, 1)
      },
      {
        semantic: ShaderSemantics.ShadingModel,
        compositionType: CompositionType.Scalar,
        componentType: ComponentType.Int,
        stage: ShaderType.PixelShader,
        min: 0,
        max: 3,
        isPlural: false,
        isSystem: false,
        initialValue: ShadingModel.Constant.index
      }
    ];
    this.setShaderSemanticsInfoArray(shaderSemanticsInfoArray);
  }

  static async initDefaultTextures() {
    if (
      ClassicShadingSingleMaterialNode.__dummyWhiteTextureUid !==
      CGAPIResourceRepository.InvalidCGAPIResourceUid
    ) {
      return;
    }

    const webglResourceRepository = CGAPIResourceRepository.getWebGLResourceRepository();
    ClassicShadingSingleMaterialNode.__dummyWhiteTextureUid = webglResourceRepository.createDummyTexture();
    ClassicShadingSingleMaterialNode.__dummyBlueTextureUid = webglResourceRepository.createDummyTexture("rgba(127.5, 127.5, 255, 1)");
    ClassicShadingSingleMaterialNode.__dummyBlackTextureUid = webglResourceRepository.createDummyTexture(
      "rgba(0, 0, 0, 1)"
    );
    ClassicShadingSingleMaterialNode.__dummyBlackCubeTextureUid = webglResourceRepository.createDummyCubeTexture();
  }
}
