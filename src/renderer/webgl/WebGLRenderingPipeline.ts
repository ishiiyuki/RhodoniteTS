import RenderingPipeline from "../RenderingPipeline";
import WebGLResourceRepository from "./WebGLResourceRepository";
import Primitive from "../../geometry/Primitive";
import { WebGLExtension } from "../../definitions/WebGLExtension";

export const WebGLRenderingPipeline = new class implements RenderingPipeline {
  private __webglResourceRepository: WebGLResourceRepository = WebGLResourceRepository.getInstance();

  render(vaoHandle: CGAPIResourceHandle, shaderProgramHandle: CGAPIResourceHandle, primitive: Primitive) {
    const gl = this.__webglResourceRepository.currentWebGLContext;

    if (gl == null) {
      throw new Error('No WebGLRenderingContext!');
    }

    const extVAO = this.__webglResourceRepository.getExtension(WebGLExtension.VertexArrayObject);
    extVAO.bindVertexArray(vaoHandle);
    gl.useProgram(shaderProgramHandle);
    gl.drawElements(primitive.primitiveMode.index, primitive.indicesAccessor!.elementCount, primitive.indicesAccessor!.componentType.index, 0);
  }

}
