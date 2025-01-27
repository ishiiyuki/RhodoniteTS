import AbstractTexture from '../../textures/AbstractTexture';
import CameraComponent from '../../components/CameraComponent';
import ComponentRepository from '../../core/ComponentRepository';
import {ComponentType} from '../../definitions/ComponentType';
import {CompositionType} from '../../definitions/CompositionType';
import Scalar from '../../math/Scalar';
import SkeletalComponent from '../../components/SkeletalComponent';
import {
  ShaderSemanticsInfo,
  ShaderSemanticsClass,
  ShaderSemantics,
} from '../../definitions/ShaderSemantics';
import {ShaderType} from '../../definitions/ShaderType';
import {ShaderVariableUpdateInterval} from '../../definitions/ShaderVariableUpdateInterval';
import Texture from '../../textures/Texture';
import {TextureParameter} from '../../definitions/TextureParameter';
import Vector3 from '../../math/Vector3';
import AbstractMaterialNode from '../core/AbstractMaterialNode';
import Material from '../core/Material';
import MatCapShaderVertex from '../../../webgl/shaderity_shaders/MatCapShader/MatCapShader.vert';
import MatCapShaderFragment from '../../../webgl/shaderity_shaders/MatCapShader/MatCapShader.frag';

export default class MatCapSingleMaterialNode extends AbstractMaterialNode {
  static MatCapTexture = new ShaderSemanticsClass({str: 'matCapTexture'});

  constructor(isSkinning: boolean, uri?: string, texture?: AbstractTexture) {
    super(
      null,
      'MatCapShading' + (isSkinning ? '+skinning' : ''),
      {isSkinning: isSkinning},
      MatCapShaderVertex,
      MatCapShaderFragment
    );

    let matCapTexture;
    if (typeof uri === 'string') {
      matCapTexture = new Texture();
      (async function (uri: string) {
        await matCapTexture.generateTextureFromUri(uri, {
          minFilter: TextureParameter.Nearest,
          magFilter: TextureParameter.Nearest,
          wrapS: TextureParameter.ClampToEdge,
          wrapT: TextureParameter.ClampToEdge,
          type: ComponentType.UnsignedByte,
          anisotropy: false,
        });
      })(uri);
    } else if (texture instanceof AbstractTexture) {
      matCapTexture = texture;
    } else {
      console.warn('no matcap texture');
      matCapTexture = AbstractMaterialNode.__dummyBlackTexture;
    }

    const shaderSemanticsInfoArray: ShaderSemanticsInfo[] = [];

    shaderSemanticsInfoArray.push({
      semantic: ShaderSemantics.Wireframe,
      componentType: ComponentType.Float,
      compositionType: CompositionType.Vec3,
      stage: ShaderType.PixelShader,
      isSystem: false,
      updateInterval: ShaderVariableUpdateInterval.EveryTime,
      soloDatum: false,
      initialValue: new Vector3(0, 0, 1),
      min: 0,
      max: 10,
    });

    // point cloud
    shaderSemanticsInfoArray.push(
      {
        semantic: ShaderSemantics.PointSize,
        componentType: ComponentType.Float,
        compositionType: CompositionType.Scalar,
        stage: ShaderType.VertexShader,
        isSystem: false,
        updateInterval: ShaderVariableUpdateInterval.FirstTimeOnly,
        soloDatum: true,
        initialValue: new Scalar(30.0),
        min: 0,
        max: 100,
      },
      {
        semantic: ShaderSemantics.PointDistanceAttenuation,
        componentType: ComponentType.Float,
        compositionType: CompositionType.Vec3,
        stage: ShaderType.VertexShader,
        isSystem: false,
        updateInterval: ShaderVariableUpdateInterval.FirstTimeOnly,
        soloDatum: true,
        initialValue: new Vector3(0.0, 0.1, 0.01),
        min: 0,
        max: 1,
      }
    );

    if (isSkinning) {
      this.__definitions += '#define RN_IS_SKINNING\n';
    }

    shaderSemanticsInfoArray.push({
      semantic: MatCapSingleMaterialNode.MatCapTexture,
      componentType: ComponentType.Int,
      compositionType: CompositionType.Texture2D,
      stage: ShaderType.PixelShader,
      isSystem: false,
      updateInterval: ShaderVariableUpdateInterval.EveryTime,
      initialValue: [0, matCapTexture],
      min: 0,
      max: Number.MAX_SAFE_INTEGER,
    });

    this.setShaderSemanticsInfoArray(shaderSemanticsInfoArray);
  }

  setParametersForGPU({
    material,
    shaderProgram,
    firstTime,
    args,
  }: {
    material: Material;
    shaderProgram: WebGLProgram;
    firstTime: boolean;
    args?: any;
  }) {
    if (args.setUniform) {
      this.setWorldMatrix(shaderProgram, args.worldMatrix);
      this.setNormalMatrix(shaderProgram, args.normalMatrix);
    }

    /// Matrices
    let cameraComponent = args.renderPass.cameraComponent;
    if (cameraComponent == null) {
      cameraComponent = ComponentRepository.getInstance().getComponent(
        CameraComponent,
        CameraComponent.main
      ) as CameraComponent;
    }
    this.setViewInfo(
      shaderProgram,
      cameraComponent,
      args.isVr,
      args.displayIdx
    );
    this.setProjection(
      shaderProgram,
      cameraComponent,
      args.isVr,
      args.displayIdx
    );

    /// Skinning
    const skeletalComponent = args.entity.getComponent(
      SkeletalComponent
    ) as SkeletalComponent;
    this.setSkinning(shaderProgram, skeletalComponent, args.setUniform);
  }
}
