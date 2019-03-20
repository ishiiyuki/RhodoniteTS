import RnObject from "../core/RnObject";
import { ShaderSemanticsInfo } from "../definitions/ShaderSemantics";
import { ShaderNodeEnum } from "../definitions/ShaderNode";

export default abstract class AbstractMaterialNode extends RnObject {
  private __semantics: ShaderSemanticsInfo[] = [];
  private __shaderNode: ShaderNodeEnum[] = [];

  constructor(semantics: ShaderSemanticsInfo[]) {
    super();
    this.__semantics = semantics;
  }

  get _semanticsInfoArray() {
    return this.__semantics;
  }
}