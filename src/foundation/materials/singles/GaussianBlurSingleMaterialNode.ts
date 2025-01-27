import CameraComponent from '../../components/CameraComponent';
import {CompositionType} from '../../definitions/CompositionType';
import ComponentRepository from '../../core/ComponentRepository';
import {ComponentType} from '../../definitions/ComponentType';
import Scalar from '../../math/Scalar';
import {
  ShaderSemanticsInfo,
  ShaderSemantics,
  ShaderSemanticsClass,
} from '../../definitions/ShaderSemantics';
import {ShaderType} from '../../definitions/ShaderType';
import {ShaderVariableUpdateInterval} from '../../definitions/ShaderVariableUpdateInterval';
import AbstractMaterialNode from '../core/AbstractMaterialNode';
import Material from '../core/Material';
import VectorN from '../../math/VectorN';
import GaussianBlurSingleShaderVertex from '../../../webgl/shaderity_shaders/GaussianBlurShader/GaussianBlurShader.vert';
import GaussianBlurSingleShaderFragment from '../../../webgl/shaderity_shaders/GaussianBlurShader/GaussianBlurShader.frag';
import Texture from '../../textures/Texture';

export default class GaussianBlurNode extends AbstractMaterialNode {
  static GaussianKernelSize = new ShaderSemanticsClass({
    str: 'gaussianKernelSize',
  });
  static GaussianRatio = new ShaderSemanticsClass({str: 'gaussianRatio'});
  static IsHorizontal = new ShaderSemanticsClass({str: 'isHorizontal'});

  private frameBufferWidth = 0;

  /**
   * GaussianBlurNode applies a Gaussian blur to a input texture. The blur is
   * applied only in the vertical or horizontal direction. The direction can
   * be changed by setting IsHorizontal in material.setParameter.
   * To use this node, you need to set GaussianKernelSize and GaussianRatio
   * to the appropriate values using the material.setParameter method and to
   * set BaseColorTexture to the target texture using the
   * material.setTextureParameter method. The GaussianKernelSize must be
   * between 1 and 30. The GaussianRatio can be computed using the
   * MathUtil.computeGaussianDistributionRatioWhoseSumIsOne method.
   */
  constructor() {
    super(
      null,
      'GaussianBlurShading',
      {},
      GaussianBlurSingleShaderVertex,
      GaussianBlurSingleShaderFragment
    );

    const gaussianRatio = new Float32Array(30);
    gaussianRatio[0] = 1.0;

    const shaderSemanticsInfoArray: ShaderSemanticsInfo[] = [
      {
        semantic: GaussianBlurNode.IsHorizontal,
        componentType: ComponentType.Bool,
        compositionType: CompositionType.Scalar,
        stage: ShaderType.PixelShader,
        isSystem: false,
        updateInterval: ShaderVariableUpdateInterval.FirstTimeOnly,
        soloDatum: false,
        initialValue: new Scalar(1), //true
        min: 0,
        max: 1,
      },
      {
        semantic: GaussianBlurNode.GaussianRatio,
        componentType: ComponentType.Float,
        compositionType: CompositionType.ScalarArray,
        maxIndex: 30,
        stage: ShaderType.PixelShader,
        isSystem: false,
        updateInterval: ShaderVariableUpdateInterval.FirstTimeOnly,
        soloDatum: false,
        initialValue: new VectorN(gaussianRatio),
        min: 0,
        max: 1,
        needUniformInFastest: true,
      },
      {
        semantic: GaussianBlurNode.GaussianKernelSize,
        componentType: ComponentType.Int,
        compositionType: CompositionType.Scalar,
        stage: ShaderType.PixelShader,
        isSystem: false,
        updateInterval: ShaderVariableUpdateInterval.FirstTimeOnly,
        soloDatum: false,
        initialValue: new Scalar(1),
        min: 1,
        max: 30,
      },
      {
        semantic: ShaderSemantics.FramebufferWidth,
        componentType: ComponentType.Float,
        compositionType: CompositionType.Scalar,
        stage: ShaderType.PixelShader,
        isSystem: false,
        updateInterval: ShaderVariableUpdateInterval.FirstTimeOnly,
        soloDatum: false,
        initialValue: new Scalar(1),
        min: 0,
        max: Number.MAX_SAFE_INTEGER,
      },
      {
        semantic: ShaderSemantics.BaseColorTexture,
        componentType: ComponentType.Int,
        compositionType: CompositionType.Texture2D,
        stage: ShaderType.PixelShader,
        isSystem: false,
        updateInterval: ShaderVariableUpdateInterval.EveryTime,
        initialValue: [0, AbstractMaterialNode.__dummyBlackTexture],
        min: 0,
        max: Number.MAX_SAFE_INTEGER,
      },
    ];

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
    const baseColorTexture = material.getParameter(
      ShaderSemantics.BaseColorTexture
    )[1] as Texture;
    if (baseColorTexture.width !== this.frameBufferWidth) {
      material.setParameter(
        ShaderSemantics.FramebufferWidth,
        baseColorTexture.width
      );
      this.frameBufferWidth = baseColorTexture.width;
    }

    if (args.setUniform) {
      this.setWorldMatrix(shaderProgram, args.worldMatrix);
    } else {
      (shaderProgram as any)._gl.uniform1fv(
        (shaderProgram as any).gaussianRatio,
        material.getParameter(GaussianBlurNode.GaussianRatio)._v
      );
    }

    /// Matrices
    let cameraComponent = args.renderPass.cameraComponent;
    if (cameraComponent == null) {
      cameraComponent = ComponentRepository.getInstance().getComponent(
        CameraComponent,
        CameraComponent.main
      ) as CameraComponent;
    }
    if (cameraComponent) {
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
    }
  }
}
