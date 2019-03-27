import WebGLResourceRepository, { VertexHandles } from "./WebGLResourceRepository";
import MemoryManager from "../foundation/core/MemoryManager";
import Buffer from "../foundation/memory/Buffer";
import { MathUtil } from "../foundation/math/MathUtil";
import SceneGraphComponent from "../foundation/components/SceneGraphComponent";
import GLSLShader from "./shaders/GLSLShader";
import { BufferUse } from "../foundation/definitions/BufferUse";
import WebGLStrategy from "./WebGLStrategy";
import MeshComponent from "../foundation/components/MeshComponent";
import WebGLContextWrapper from "./WebGLContextWrapper";
import Primitive from "../foundation/geometry/Primitive";
import CGAPIResourceRepository from "../foundation/renderer/CGAPIResourceRepository";
import Matrix44 from "../foundation/math/Matrix44";
import { ShaderSemantics } from "../foundation/definitions/ShaderSemantics";
import ClassicShader from "./shaders/ClassicShader";
import Material from "../foundation/materials/Material";

export default class WebGLStrategyUBO implements WebGLStrategy {
  private static __instance: WebGLStrategyUBO;
  private __webglResourceRepository: WebGLResourceRepository = WebGLResourceRepository.getInstance();
  private __uboUid: CGAPIResourceHandle = CGAPIResourceRepository.InvalidCGAPIResourceUid;
  //private __shaderProgramUid: CGAPIResourceHandle = CGAPIResourceRepository.InvalidCGAPIResourceUid;
  private __vertexHandles: Array<VertexHandles> = [];
  private static __vertexHandleOfPrimitiveObjectUids: Map<ObjectUID, VertexHandles> = new Map();
  private __isVAOSet = false;

  private vertexShaderMethodDefinitions_UBO:string =
  `layout (std140) uniform matrix {
    mat4 world[1024];
  } u_matrix;

  uniform mat4 u_viewMatrix;
  uniform mat4 u_projectionMatrix;
  uniform mat3 u_normalMatrix;

  mat4 getMatrix(float instanceId) {
    float index = instanceId;
    return transpose(u_matrix.world[int(index)]);
  }

  mat4 getViewMatrix(float instanceId) {
    return u_viewMatrix;
  }

  mat4 getProjectionMatrix(float instanceId) {
    return u_projectionMatrix;
  }

  mat3 getNormalMatrix(float instanceId) {
    return u_normalMatrix;
  }

  `;

  private constructor(){}

  setupShaderProgram(meshComponent: MeshComponent): void {
    const primitiveNum = meshComponent!.getPrimitiveNumber();
    for(let i=0; i<primitiveNum; i++) {
      const primitive = meshComponent!.getPrimitiveAt(i);
      const material = primitive.material;
      if (material) {
        if (material._shaderProgramUid !== CGAPIResourceRepository.InvalidCGAPIResourceUid) {
          return;
        }

        // Shader Setup
        material.createProgram(this.vertexShaderMethodDefinitions_UBO);

        // const glslShader = ClassicShader.getInstance();
        // let vertexShader = glslShader.glslBegin +
        //   this.vertexShaderMethodDefinitions_UBO +
        //   glslShader.vertexShaderVariableDefinitions +
        //   glslShader.glslMainBegin +
        //   glslShader.vertexShaderBody +
        //   glslShader.glslMainEnd;
        // let fragmentShader = glslShader.fragmentShader;
        // this.__shaderProgramUid = this.__webglResourceRepository.createShaderProgram(
        //   {
        //     vertexShaderStr: vertexShader,
        //     fragmentShaderStr: fragmentShader,
        //     attributeNames: ClassicShader.attributeNames,
        //     attributeSemantics: ClassicShader.attributeSemantics
        //   }
        // );

        this.__webglResourceRepository.setupUniformLocations(material._shaderProgramUid,
          [
            {semantic: ShaderSemantics.ViewMatrix, isPlural: false, isSystem: true},
            {semantic: ShaderSemantics.ProjectionMatrix, isPlural: false, isSystem: true}
          ]);
      }
    }
  }

  private __isLoaded(index: Index) {
    if (this.__vertexHandles[index] != null) {
      return true;
    } else {
      return false
    }
  }

  $load(meshComponent: MeshComponent) {
    if (this.__isLoaded(0)) {
      return;
    }

    this.setupShaderProgram(meshComponent);

    const primitiveNum = meshComponent!.getPrimitiveNumber();
    for(let i=0; i<primitiveNum; i++) {
      const primitive = meshComponent!.getPrimitiveAt(i);
      const vertexHandles = this.__webglResourceRepository.createVertexDataResources(primitive);
      this.__vertexHandles[i] = vertexHandles;
      WebGLStrategyUBO.__vertexHandleOfPrimitiveObjectUids.set(primitive.objectUid, vertexHandles);

    }
  }

  $prerender(meshComponent: MeshComponent, instanceIDBufferUid: WebGLResourceHandle) {
    if (this.__isVAOSet) {
      return;
    }
    const primitiveNum = meshComponent!.getPrimitiveNumber();
    for(let i=0; i<primitiveNum; i++) {
      const primitive = meshComponent!.getPrimitiveAt(i);
     // if (this.__isLoaded(i) && this.__isVAOSet) {
      this.__vertexHandles[i] = WebGLStrategyUBO.__vertexHandleOfPrimitiveObjectUids.get(primitive.objectUid)!;
        //this.__vertexShaderProgramHandles[i] = MeshRendererComponent.__shaderProgramHandleOfPrimitiveObjectUids.get(primitive.objectUid)!;
      //  continue;
     // }
      this.__webglResourceRepository.setVertexDataToPipeline(this.__vertexHandles[i], primitive, instanceIDBufferUid);
    }
    this.__isVAOSet = true;
  }

  common_$prerender(): void {
    const isHalfFloatMode = false;
    const memoryManager: MemoryManager = MemoryManager.getInstance();
    const buffer: Buffer = memoryManager.getBuffer(BufferUse.GPUInstanceData);
    const floatDataTextureBuffer = new Float32Array(buffer.getArrayBuffer());
    let halfFloatDataTextureBuffer: Uint16Array;
    if (isHalfFloatMode) {
      if (this.__webglResourceRepository.currentWebGLContextWrapper!.isWebGL2) {
        halfFloatDataTextureBuffer = new Uint16Array(floatDataTextureBuffer.length);
        let convertLength = buffer.takenSizeInByte / 4; //components
        convertLength /= 2; // bytes
        for (let i=0; i<convertLength; i++) {
          halfFloatDataTextureBuffer[i] = MathUtil.toHalfFloat(floatDataTextureBuffer[i]);
        }
      }
      if (this.__uboUid !== CGAPIResourceRepository.InvalidCGAPIResourceUid) {
        this.__webglResourceRepository.updateUniformBuffer(this.__uboUid, halfFloatDataTextureBuffer!);
        return;
      }

      this.__uboUid = this.__webglResourceRepository.createUniformBuffer(halfFloatDataTextureBuffer!);

    } else {
      if (this.__uboUid !== CGAPIResourceRepository.InvalidCGAPIResourceUid) {
        this.__webglResourceRepository.updateUniformBuffer(this.__uboUid, SceneGraphComponent.getAccessor('worldMatrix', SceneGraphComponent).dataViewOfBufferView);
        return;
      }

      this.__uboUid = this.__webglResourceRepository.createUniformBuffer(SceneGraphComponent.getAccessor('worldMatrix', SceneGraphComponent).dataViewOfBufferView);

    }
    this.__webglResourceRepository.bindUniformBufferBase(0, this.__uboUid);

  };

  attachGPUData(primitive: Primitive): void {
    this.__webglResourceRepository.bindUniformBlock(primitive.material!._shaderProgramUid, 'matrix', 0);
  };

  attatchShaderProgram(material: Material): void {
    const shaderProgramUid = material._shaderProgramUid;
    const glw = this.__webglResourceRepository.currentWebGLContextWrapper!;
    const gl = glw.getRawContext();
    const shaderProgram = this.__webglResourceRepository.getWebGLResource(shaderProgramUid)! as WebGLProgram;
    gl.useProgram(shaderProgram);
  }

  attachVertexData(i: number, primitive: Primitive, glw: WebGLContextWrapper, instanceIDBufferUid: WebGLResourceHandle) {
    const vaoHandles = this.__vertexHandles[i];
    const vao = this.__webglResourceRepository.getWebGLResource(vaoHandles.vaoHandle) as WebGLVertexArrayObjectOES;
    const gl = glw.getRawContext();

    if (vao != null) {
      glw.bindVertexArray(vao);
    }
    else {
      this.__webglResourceRepository.setVertexDataToPipeline(vaoHandles, primitive, instanceIDBufferUid);
      const ibo = this.__webglResourceRepository.getWebGLResource(vaoHandles.iboHandle!);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    }
  }

  static getInstance() {
    if (!this.__instance) {
     this.__instance = new WebGLStrategyUBO();
    }

    return this.__instance;
  }

  common_$render(primitive: Primitive, viewMatrix: Matrix44, projectionMatrix: Matrix44) {
    const glw = this.__webglResourceRepository.currentWebGLContextWrapper!;
    const material = primitive.material!;
    this.attatchShaderProgram(material);
    const gl = glw.getRawContext();

    this.__webglResourceRepository.setUniformValue(material._shaderProgramUid, ShaderSemantics.ViewMatrix, true, 4, 'f', true, {x:viewMatrix.v}, {});
    this.__webglResourceRepository.setUniformValue(material._shaderProgramUid, ShaderSemantics.ProjectionMatrix, true, 4, 'f', true, {x:projectionMatrix.v}, {});

    return true;
  }
}

