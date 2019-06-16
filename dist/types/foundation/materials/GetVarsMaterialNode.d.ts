import { ShaderSemanticsEnum } from "../definitions/ShaderSemantics";
import AbstractMaterialNode, { ShaderSocket } from "./AbstractMaterialNode";
export default class GetVarsMaterialNode extends AbstractMaterialNode {
    constructor();
    addVertexInputAndOutput(inShaderSocket: ShaderSocket, outShaderSocket: ShaderSocket): void;
    addPixelInputAndOutput(inShaderSocket: ShaderSocket, outShaderSocket: ShaderSocket): void;
    convertValue(shaderSemantic: ShaderSemanticsEnum, value: any): void;
}