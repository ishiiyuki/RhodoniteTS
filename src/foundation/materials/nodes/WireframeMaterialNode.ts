import { ShaderSemanticsInfo, ShaderSemantics, ShaderSemanticsEnum } from "../../definitions/ShaderSemantics";
import AbstractMaterialNode from "../core/AbstractMaterialNode";
import { CompositionType } from "../../definitions/CompositionType";
import { ComponentType } from "../../definitions/ComponentType";
import WireframeShader from "../../../webgl/shaders/WireframeShader";
import Vector3 from "../../math/Vector3";
import { ShaderType } from "../../definitions/ShaderType";

export default class WireframeMaterialNode extends AbstractMaterialNode {

  constructor() {
    super(WireframeShader.getInstance(), 'wireframe');

    const shaderSemanticsInfoArray: ShaderSemanticsInfo[] = [
      {semantic: ShaderSemantics.Wireframe, compositionType: CompositionType.Vec3, componentType: ComponentType.Float,
        stage: ShaderType.PixelShader, min:0, max:10, isSystem: false, initialValue: new Vector3(0, 0, 1)},
    ];
    this.setShaderSemanticsInfoArray(shaderSemanticsInfoArray);

    // Input
    this.__vertexInputs.push(
    {
      compositionType: CompositionType.Vec4,
      componentType: ComponentType.Float,
      name: 'existingFragColor',
    });

    this.__vertexInputs.push(
    {
      compositionType: CompositionType.Vec4,
      componentType: ComponentType.Float,
      name: 'wireframeColor',
    });

    // Output
    this.__vertexOutputs.push({
      compositionType: CompositionType.Vec4,
      componentType: ComponentType.Float,
      name: 'outColor',
    });
  }
}
