import WebGLResourceRepository, { VertexHandles } from "./WebGLResourceRepository";
import { WebGLExtension } from "./WebGLExtension";
import MemoryManager from "../foundation/core/MemoryManager";
import Buffer from "../foundation/memory/Buffer";
import { MathUtil } from "../foundation/math/MathUtil";
import { PixelFormat } from "../foundation/definitions/PixelFormat";
import { ComponentType } from "../foundation/definitions/ComponentType";
import { TextureParameter } from "../foundation/definitions/TextureParameter";
import GLSLShader from "./shaders/GLSLShader";
import { BufferUse } from "../foundation/definitions/BufferUse";
import WebGLStrategy from "./WebGLStrategy";
import MeshComponent from "../foundation/components/MeshComponent"
import Primitive from "../foundation/geometry/Primitive";
import WebGLContextWrapper from "./WebGLContextWrapper";
import CGAPIResourceRepository from "../foundation/renderer/CGAPIResourceRepository";
import Matrix44 from "../foundation/math/Matrix44";
import { ShaderSemantics, ShaderSemanticsInfo, ShaderSemanticsClass } from "../foundation/definitions/ShaderSemantics";
import ClassicShader from "./shaders/ClassicShader";
import Material from "../foundation/materials/Material";
import { CompositionType } from "../foundation/definitions/CompositionType";
import Component from "../foundation/core/Component";
import SceneGraphComponent from "../foundation/components/SceneGraphComponent";
import Mesh from "../foundation/geometry/Mesh";
import MeshRendererComponent from "../foundation/components/MeshRendererComponent";
import ComponentRepository from "../foundation/core/ComponentRepository";
import { ShaderType } from "../foundation/definitions/ShaderType";
import LightComponent from "../foundation/components/LightComponent";
import Config from "../foundation/core/Config";
import Vector4 from "../foundation/math/Vector4";
import RenderPass from "../foundation/renderer/RenderPass";
import CameraComponent from "../foundation/components/CameraComponent";
import { WebGLResourceHandle, Index, CGAPIResourceHandle } from "../types/CommonTypes";
import CubeTexture from "../foundation/textures/CubeTexture";

export default class WebGLStrategyFastestWebGL1 implements WebGLStrategy {
  private static __instance: WebGLStrategyFastestWebGL1;
  private __webglResourceRepository: WebGLResourceRepository = WebGLResourceRepository.getInstance();
  private __dataTextureUid: CGAPIResourceHandle = CGAPIResourceRepository.InvalidCGAPIResourceUid;
  private __lastShader: CGAPIResourceHandle = CGAPIResourceRepository.InvalidCGAPIResourceUid;
  private static __shaderProgram: WebGLProgram;
  private __materialSIDLocation?: WebGLUniformLocation;
  private __lightComponents?: LightComponent[];


  private constructor(){}

  get vertexShaderMethodDefinitions_dataTexture() {
    const _texture = ClassicShader.getInstance().glsl_texture;

    return `
  uniform mat4 u_viewMatrix;
  uniform mat4 u_projectionMatrix;
  uniform mat3 u_normalMatrix;


  mat4 get_worldMatrix(float instanceId)
  {
    highp float index = ${Component.getLocationOffsetOfMemberOfComponent(SceneGraphComponent, 'worldMatrix')}.0 + 4.0 * instanceId;
    highp float powWidthVal = ${MemoryManager.bufferWidthLength}.0;
    highp float powHeightVal = ${MemoryManager.bufferHeightLength}.0;
    vec2 arg = vec2(1.0/powWidthVal, 1.0/powHeightVal);
    // highp vec2 arg = vec2(1.0/powWidthVal, 1.0/powWidthVal/powHeightVal);

    vec4 col0 = fetchElement(u_dataTexture, index + 0.0, arg);
    vec4 col1 = fetchElement(u_dataTexture, index + 1.0, arg);
    vec4 col2 = fetchElement(u_dataTexture, index + 2.0, arg);
    vec4 col3 = fetchElement(u_dataTexture, index + 3.0, arg);

    mat4 matrix = mat4(
      col0.x, col0.y, col0.z, 0.0,
      col1.x, col1.y, col1.z, 0.0,
      col2.x, col2.y, col2.z, 0.0,
      col3.x, col3.y, col3.z, 1.0
      );

    return matrix;
  }

  mat4 get_viewMatrix(float instanceId) {
    return u_viewMatrix;
  }

  mat4 get_projectionMatrix(float instanceId) {
    return u_projectionMatrix;
  }

  mat3 get_normalMatrix(float instanceId) {
    float index = ${Component.getLocationOffsetOfMemberOfComponent(SceneGraphComponent, 'normalMatrix')}.0 + 3.0 * instanceId;
    float powWidthVal = ${MemoryManager.bufferWidthLength}.0;
    float powHeightVal = ${MemoryManager.bufferHeightLength}.0;
    vec2 arg = vec2(1.0/powWidthVal, 1.0/powHeightVal);
  //  vec2 arg = vec2(1.0/powWidthVal, 1.0/powWidthVal/powHeightVal);

    vec4 col0 = fetchElement(u_dataTexture, index + 0.0, arg);
    vec4 col1 = fetchElement(u_dataTexture, index + 1.0, arg);
    vec4 col2 = fetchElement(u_dataTexture, index + 2.0, arg);

    mat3 matrix = mat3(
      col0.x, col0.y, col0.z,
      col0.w, col1.x, col1.y,
      col1.z, col1.w, col2.x
      );
      // mat3 matrix = mat3(
      //   col0.x, col0.y, col0.z,
      //   col1.x, col1.y, col1.z,
      //   col2.x, col2.y, col2.z
      //   );
  
      // mat3 matrix = mat3(
    //   col0.x, col0.w, col1.z,
    //   col0.y, col1.x, col1.w,
    //   col0.z, col1.y, col2.x
    //   );


    return matrix;
  }

#ifdef RN_IS_MORPHING
  vec3 get_position(float vertexId, vec3 basePosition) {
    vec3 position = basePosition;
    for (int i=0; i<${Config.maxVertexMorphNumberInShader}; i++) {
      float index = u_dataTextureMorphOffsetPosition[i] + 1.0 * vertexId;
      float powWidthVal = ${MemoryManager.bufferWidthLength}.0;
      float powHeightVal = ${MemoryManager.bufferHeightLength}.0;
      vec2 arg = vec2(1.0/powWidthVal, 1.0/powHeightVal);
    //  vec2 arg = vec2(1.0/powWidthVal, 1.0/powWidthVal/powHeightVal);
      vec3 addPos = fetchElement(u_dataTexture, index + 0.0, arg).xyz;
      position += addPos * u_morphWeights[i];
      if (i == u_morphTargetNumber-1) {
        break;
      }
    }

    return position;
  }
#endif
  `;
    }

  setupShaderProgram(meshComponent: MeshComponent): void {
    if (meshComponent.mesh == null) {
      MeshComponent.alertNoMeshSet(meshComponent);
      return;
    }

    const getOffset = (info: ShaderSemanticsInfo) => {
      let offset = 1;
      switch(info.compositionType) {
        case CompositionType.Mat4:
          offset = 4;
          break;
        case CompositionType.Mat3:
          offset = 3;
          break;
        default:
          // console.error('unknown composition type', info.compositionType.str, memberName);
          // return '';
      }
      return offset;
    }

    const getShaderProperty = (materialTypeName: string, info: ShaderSemanticsInfo, propertyIndex: Index) => {
      const returnType = info.compositionType.getGlslStr(info.componentType);

      const indexArray = [];
      let maxIndex = 1;
      let index = -1;
      let indexStr;

      const isTexture = info.compositionType === CompositionType.Texture2D || info.compositionType === CompositionType.TextureCube;

      const methodName = info.semantic.str.replace('.', '_');

      // definition of uniform variable
      let varDef = '';
//      if (isTexture) {
        const varType = info.compositionType.getGlslStr(info.componentType);
        let varIndexStr = '';
        if (info.maxIndex) {
          varIndexStr = `[${info.maxIndex}]`;
        }
        varDef = `  uniform ${varType} u_${methodName}${varIndexStr};\n`;
  //    }
      // inner contents of 'get_' shader function
      if (propertyIndex < 0) {
        if (Math.abs(propertyIndex) % ShaderSemanticsClass._scale !== 0) {
          return '';
        }
        const offset = getOffset(info);

        for (let i=0; i<info.maxIndex!; i++) {
          const index = Material.getLocationOffsetOfMemberOfMaterial(materialTypeName, propertyIndex)!;
          indexArray.push(index)
        }
        maxIndex = info.maxIndex!;

        let arrayStr = `highp float indices[${maxIndex}];`
        indexArray.forEach((idx, i)=> {
          arrayStr += `\nindices[${i}] = ${idx}.0;`
        });

        indexStr = `
          ${arrayStr}
          highp float idx = 0.0;
          for (int i=0; i<${maxIndex}; i++) {
            idx = indices[i] + ${offset}.0 * instanceId;
            if (i == index) {
              break;
            }
          }`;
      } else {
        const offset = getOffset(info);
        index = Material.getLocationOffsetOfMemberOfMaterial(materialTypeName, propertyIndex)!;
        let idx;
        let secondOffset = 0;
        if (CompositionType.isArray(info.compositionType)) {
          idx = 'float(index)';
          if (info.maxIndex != null) {
            secondOffset = offset * info.maxIndex;
          }
        } else {
          idx = 'instanceId';
        }
        indexStr = `highp float idx = ${index}.0 + ${secondOffset}.0 * instanceId + ${offset}.0 * ${idx};`;
      }


      let intStr = '';
      if (info.componentType === ComponentType.Int && info.compositionType !== CompositionType.Scalar) {
        intStr = 'i';
      }

      let firstPartOfInnerFunc = '';
      if (!isTexture) {
        firstPartOfInnerFunc += `
  ${returnType} get_${methodName}(highp float instanceId, const int index) {
    ${indexStr}
    highp float powWidthVal = ${MemoryManager.bufferWidthLength}.0;
    highp float powHeightVal = ${MemoryManager.bufferHeightLength}.0;
    highp vec2 arg = vec2(1.0/powWidthVal, 1.0/powHeightVal);
    highp vec4 col0 = fetchElement(u_dataTexture, idx + 0.0, arg);
`
      }

      let str = `${varDef}${firstPartOfInnerFunc}`;

      switch(info.compositionType) {
        case CompositionType.Vec4:
        case CompositionType.Vec4Array:
          str += `        highp ${intStr}vec4 val = ${intStr}vec4(col0);`; break;
        case CompositionType.Vec3:
        case CompositionType.Vec3Array:
          str += `        highp ${intStr}vec3 val = ${intStr}vec3(col0.xyz);`; break;
        case CompositionType.Vec2:
        case CompositionType.Vec2Array:
          str += `        highp ${intStr}vec2 val = ${intStr}vec2(col0.xy);`; break;
        case CompositionType.Scalar:
        case CompositionType.ScalarArray:
          if (info.componentType === ComponentType.Int) {
            str += `        int val = int(col0.x);`;
          } else if (info.componentType === ComponentType.Bool) {
            str += `        bool val = bool(col0.x);`;
          } else {
            str += `       float val = col0.x;`;
          }
          break;
        case CompositionType.Mat4:
          str += `
          vec4 col1 = fetchElement(u_dataTexture, index + 1.0, arg);
          vec4 col2 = fetchElement(u_dataTexture, index + 2.0, arg);
          mat4 val = mat4(
            col0.x, col1.x, col2.x, 0.0,
            col0.y, col1.y, col2.y, 0.0,
            col0.z, col1.z, col2.z, 0.0,
            col0.w, col1.w, col2.w, 1.0
            );
          `; break;
        case CompositionType.Mat3:
          str += `
          vec4 col1 = fetchElement(u_dataTexture, index + 1.0, arg);
          vec4 col2 = fetchElement(u_dataTexture, index + 2.0, arg);
          mat3 val = mat3(
            col0.x, col0.w, col1.z,
            col0.y, col1.x, col1.w,
            col0.z, col1.y, col2.x,
            );
          `; break;
        default:
          // console.error('unknown composition type', info.compositionType.str, memberName);
          str += '';
      }

      if (!isTexture) {
        str += `
        return val;
      }
    `
      }

      return str;
    };

    const primitiveNum = meshComponent.mesh.getPrimitiveNumber();
    for(let i=0; i<primitiveNum; i++) {
      const primitive = meshComponent.mesh.getPrimitiveAt(i);
      const material = primitive.material;
      if (material) {
        if (material._shaderProgramUid !== CGAPIResourceRepository.InvalidCGAPIResourceUid) {
          return;
        }

        material.createProgram(this.vertexShaderMethodDefinitions_dataTexture, getShaderProperty);
        this.__webglResourceRepository.setupUniformLocations(material._shaderProgramUid,
          [
            {semantic: ShaderSemantics.ViewMatrix, compositionType: CompositionType.Mat4, componentType: ComponentType.Float,
              stage: ShaderType.VertexShader, min: -Number.MAX_VALUE, max: Number.MAX_VALUE, isSystem: true},
            {semantic: ShaderSemantics.ProjectionMatrix, compositionType: CompositionType.Mat4, componentType: ComponentType.Float,
              stage: ShaderType.VertexShader, min: -Number.MAX_VALUE, max: Number.MAX_VALUE, isSystem: true}
          ]);

        material.setUniformLocations(material._shaderProgramUid);
      }
    }
  }



  private __isLoaded(meshComponent: MeshComponent) {
    if (meshComponent.mesh == null) {
      return false;
    }

    if (meshComponent.mesh.variationVBOUid !== CGAPIResourceRepository.InvalidCGAPIResourceUid) {
      const primitiveNum = meshComponent.mesh.getPrimitiveNumber();
      let count = 0;
      for(let i=0; i<primitiveNum; i++) {
        const primitive = meshComponent.mesh.getPrimitiveAt(i);
        if (primitive.vertexHandles != null) {
          count++;
        }
      }

      if (primitiveNum === count) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }

  }

  $load(meshComponent: MeshComponent) {
    if (this.__isLoaded(meshComponent)) {
      return;
    }

    if (meshComponent.mesh == null) {
      MeshComponent.alertNoMeshSet(meshComponent);
      return;
    }

    this.setupShaderProgram(meshComponent);

    const primitiveNum = meshComponent.mesh.getPrimitiveNumber();
    for(let i=0; i<primitiveNum; i++) {
      const primitive = meshComponent.mesh.getPrimitiveAt(i);
      primitive.create3DAPIVertexData();
    }
    meshComponent.mesh.updateVariationVBO();
  }

  $prerender(meshComponent: MeshComponent, meshRendererComponent: MeshRendererComponent, instanceIDBufferUid: WebGLResourceHandle) {
    if (meshRendererComponent._readyForRendering) {
      return;
    }

    if (meshComponent.mesh == null) {
      MeshComponent.alertNoMeshSet(meshComponent);
      return;
    }

    if (meshComponent.mesh.isInstanceMesh()) {
      meshRendererComponent._readyForRendering = true;
      return;
    }

    const primitiveNum = meshComponent.mesh.getPrimitiveNumber();
    for(let i=0; i<primitiveNum; i++) {
      const primitive = meshComponent.mesh.getPrimitiveAt(i);
      this.__webglResourceRepository.setVertexDataToPipeline(
        { vaoHandle: meshComponent.mesh.getVaoUids(i), iboHandle: primitive.vertexHandles!.iboHandle, vboHandles: primitive.vertexHandles!.vboHandles},
        primitive, meshComponent.mesh.variationVBOUid);
    }
    meshRendererComponent._readyForRendering = true;
  }

  common_$prerender(): void {

    // Setup Data Texture
    let isHalfFloatMode = false;
    // if (this.__webglResourceRepository.currentWebGLContextWrapper!.isWebGL2 ||
    //   this.__webglResourceRepository.currentWebGLContextWrapper!.isSupportWebGL1Extension(WebGLExtension.TextureHalfFloat)) {
    //   isHalfFloatMode = true;
    // }
    const memoryManager: MemoryManager = MemoryManager.getInstance();
    const buffer: Buffer = memoryManager.getBuffer(BufferUse.GPUInstanceData);
    const floatDataTextureBuffer = new Float32Array(buffer.getArrayBuffer());
    let halfFloatDataTextureBuffer: Uint16Array;
    if (isHalfFloatMode) {
      halfFloatDataTextureBuffer = new Uint16Array(floatDataTextureBuffer.length);
      let convertLength = buffer.takenSizeInByte / 4; //components
      for (let i=0; i<convertLength; i++) {
        halfFloatDataTextureBuffer[i] = MathUtil.toHalfFloat(floatDataTextureBuffer[i]);
      }
    }

    if (this.__dataTextureUid !== CGAPIResourceRepository.InvalidCGAPIResourceUid) {
      if (isHalfFloatMode) {
        if (this.__webglResourceRepository.currentWebGLContextWrapper!.isWebGL2) {
          this.__webglResourceRepository.updateTexture(this.__dataTextureUid, floatDataTextureBuffer, {
            level: 0, width: MemoryManager.bufferWidthLength, height: buffer.takenSizeInByte/MemoryManager.bufferWidthLength/4,
              format: PixelFormat.RGBA, type: ComponentType.Float
            });
        } else {
          this.__webglResourceRepository.updateTexture(this.__dataTextureUid, halfFloatDataTextureBuffer!, {
            level: 0, width: MemoryManager.bufferWidthLength, height: buffer.takenSizeInByte/MemoryManager.bufferWidthLength/4,
              format: PixelFormat.RGBA, type: ComponentType.HalfFloat
            });
        }
      } else {
        if (this.__webglResourceRepository.currentWebGLContextWrapper!.isWebGL2) {
          this.__webglResourceRepository.updateTexture(this.__dataTextureUid, floatDataTextureBuffer, {
            level:0, width: MemoryManager.bufferWidthLength, height: buffer.takenSizeInByte/MemoryManager.bufferWidthLength/4,
              format: PixelFormat.RGBA, type: ComponentType.Float
            });
        } else {
          this.__webglResourceRepository.updateTexture(this.__dataTextureUid, floatDataTextureBuffer, {
            level: 0, width: MemoryManager.bufferWidthLength, height:buffer.takenSizeInByte/MemoryManager.bufferWidthLength/4,
              format: PixelFormat.RGBA, type: ComponentType.Float
            });
        }
      }
      return;
    }

    if (isHalfFloatMode) {

      if (this.__webglResourceRepository.currentWebGLContextWrapper!.isWebGL2) {
        this.__dataTextureUid = this.__webglResourceRepository.createTexture(floatDataTextureBuffer, {
          level: 0, internalFormat: TextureParameter.RGBA16F, width: MemoryManager.bufferWidthLength, height: MemoryManager.bufferHeightLength,
            border: 0, format: PixelFormat.RGBA, type: ComponentType.Float, magFilter: TextureParameter.Nearest, minFilter: TextureParameter.Nearest,
            wrapS: TextureParameter.Repeat, wrapT: TextureParameter.Repeat, generateMipmap: false, anisotropy: false
          });
      } else {
        this.__dataTextureUid = this.__webglResourceRepository.createTexture(halfFloatDataTextureBuffer!, {
          level: 0, internalFormat: PixelFormat.RGBA, width: MemoryManager.bufferWidthLength, height: MemoryManager.bufferHeightLength,
            border: 0, format: PixelFormat.RGBA, type: ComponentType.HalfFloat, magFilter: TextureParameter.Nearest, minFilter: TextureParameter.Nearest,
            wrapS: TextureParameter.Repeat, wrapT: TextureParameter.Repeat, generateMipmap: false, anisotropy: false
          });
      }

    } else {
      if (this.__webglResourceRepository.currentWebGLContextWrapper!.isWebGL2) {
        this.__dataTextureUid = this.__webglResourceRepository.createTexture(floatDataTextureBuffer, {
          level: 0, internalFormat: TextureParameter.RGBA32F, width: MemoryManager.bufferWidthLength, height: MemoryManager.bufferHeightLength,
            border: 0, format: PixelFormat.RGBA, type: ComponentType.Float, magFilter: TextureParameter.Nearest, minFilter: TextureParameter.Nearest,
            wrapS: TextureParameter.Repeat, wrapT: TextureParameter.Repeat, generateMipmap: false, anisotropy: false
          });
      } else {
        this.__dataTextureUid = this.__webglResourceRepository.createTexture(floatDataTextureBuffer, {
          level: 0, internalFormat: PixelFormat.RGBA, width: MemoryManager.bufferWidthLength, height: MemoryManager.bufferHeightLength,
            border: 0, format: PixelFormat.RGBA, type: ComponentType.Float, magFilter: TextureParameter.Nearest, minFilter: TextureParameter.Nearest,
            wrapS: TextureParameter.Repeat, wrapT: TextureParameter.Repeat, generateMipmap: false, anisotropy: false
          });
      }
    }

    const componentRepository = ComponentRepository.getInstance();
    this.__lightComponents = componentRepository.getComponentsWithType(LightComponent) as LightComponent[];

  }

  attachGPUData(primitive: Primitive): void {
    const material = primitive.material!;
    const glw = this.__webglResourceRepository.currentWebGLContextWrapper!;
    const gl = glw.getRawContext();
    const dataTexture = this.__webglResourceRepository.getWebGLResource(this.__dataTextureUid)! as WebGLTexture;
    glw.bindTexture2D(0, dataTexture);
    const shaderProgram = this.__webglResourceRepository.getWebGLResource(material._shaderProgramUid);
    var uniform_dataTexture = gl.getUniformLocation(shaderProgram, 'u_dataTexture');
    gl.uniform1i(uniform_dataTexture, 0);
  }

  attachGPUDataInner(gl: WebGLRenderingContext, shaderProgram: WebGLProgram) {
    this.__webglResourceRepository.bindTexture2D(0, this.__dataTextureUid);
    var uniform_dataTexture = gl.getUniformLocation(shaderProgram, 'u_dataTexture');
    gl.uniform1i(uniform_dataTexture, 0);
  }

  attatchShaderProgram(material: Material): void {
    const shaderProgramUid = material._shaderProgramUid;

    if (shaderProgramUid !== this.__lastShader) {
      const glw = this.__webglResourceRepository.currentWebGLContextWrapper!;
      const gl = glw.getRawContext();
      const shaderProgram = this.__webglResourceRepository.getWebGLResource(shaderProgramUid)! as WebGLProgram;
      gl.useProgram(shaderProgram);
      this.__lastShader = shaderProgramUid;
    }
  }

  attachVertexData(i: number, primitive: Primitive, glw: WebGLContextWrapper, instanceIDBufferUid: WebGLResourceHandle) {
  }

  attachVertexDataInner(mesh: Mesh, primitive: Primitive, primitiveIndex: Index, glw: WebGLContextWrapper, instanceIDBufferUid: WebGLResourceHandle) {
    const vertexHandles = primitive.vertexHandles!;
    const vao = this.__webglResourceRepository.getWebGLResource(mesh.getVaoUids(primitiveIndex)) as WebGLVertexArrayObjectOES;
    const gl = glw.getRawContext();

    if (vao != null) {
      glw.bindVertexArray(vao);
    }
    else {
      this.__webglResourceRepository.setVertexDataToPipeline(vertexHandles, primitive, mesh.variationVBOUid);
      const ibo = this.__webglResourceRepository.getWebGLResource(vertexHandles.iboHandle!);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    }
  }

  static getInstance() {
    if (!this.__instance) {
     this.__instance = new (WebGLStrategyFastestWebGL1)();
    }

    return this.__instance;
  }

  private __setupMaterial(material: Material, renderPass: RenderPass) {
    material.setParameter(ShaderSemantics.LightNumber, this.__lightComponents!.length);

    for (let i = 0; i < this.__lightComponents!.length; i++) {
      if (i >= Config.maxLightNumberInShader) {
        break;
      }
      const lightComponent = this.__lightComponents![i];
      const sceneGraphComponent = lightComponent.entity.getSceneGraph();
      const worldLightPosition = sceneGraphComponent.worldPosition;
      const worldLightDirection = lightComponent.direction;
      const worldLightIntensity = lightComponent.intensity;
      material.setParameter(ShaderSemantics.LightPosition, new Vector4(worldLightPosition.x, worldLightPosition.y, worldLightPosition.z, lightComponent.type.index), i);
      material.setParameter(ShaderSemantics.LightDirection, new Vector4(worldLightDirection.x, worldLightDirection.y, worldLightDirection.z, 0), i);
      material.setParameter(ShaderSemantics.LightIntensity, new Vector4(worldLightIntensity.x, worldLightIntensity.y, worldLightIntensity.z, 0), i);
    }
  }

  private __setupMaterialEveryFrame(material: Material, renderPass: RenderPass) {
    let cameraComponent = renderPass.cameraComponent;
    if (cameraComponent == null) {
      cameraComponent = ComponentRepository.getInstance().getComponent(CameraComponent, CameraComponent.main) as CameraComponent;
    }
    if (cameraComponent) {
      const cameraPosition = cameraComponent.worldPosition;
      material.setParameter(ShaderSemantics.ViewPosition, cameraPosition);
    }
  }

  common_$render(meshComponentSids: Int32Array, meshComponents: MeshComponent[], viewMatrix: Matrix44, projectionMatrix: Matrix44, renderPass: RenderPass) {
    const glw = this.__webglResourceRepository.currentWebGLContextWrapper!;
    const gl = glw.getRawContext();

    // const meshes: Mesh[] = Mesh.originalMeshes;

    for (let idx=0; idx<meshComponentSids.length; idx++) {
      const sid = meshComponentSids[idx];
      const meshComponent = meshComponents[sid];
      if (meshComponent == null) {
        break;
      }
      const mesh = meshComponent.mesh!;
      if (!(mesh && mesh.isOriginalMesh())) {
        continue;
      }

      const primitiveNum = mesh.getPrimitiveNumber();
      for(let i=0; i<primitiveNum; i++) {
        const primitive = mesh.getPrimitiveAt(i);

        const shaderProgramUid = primitive.material!._shaderProgramUid;
        if (shaderProgramUid === -1) {
          continue;
        }

        this.attachVertexDataInner(mesh, primitive, i, glw, mesh.variationVBOUid);
        if (shaderProgramUid !== this.__lastShader) {
          const shaderProgram = this.__webglResourceRepository.getWebGLResource(shaderProgramUid)! as WebGLProgram;
          gl.useProgram(shaderProgram);

          var uniform_dataTexture = gl.getUniformLocation(shaderProgram, 'u_dataTexture');
          gl.uniform1i(uniform_dataTexture, 7);
          this.__materialSIDLocation = gl.getUniformLocation(shaderProgram, 'u_materialSID');

          this.__setupMaterial(primitive.material!, renderPass);

          WebGLStrategyFastestWebGL1.__shaderProgram = shaderProgram;
          this.__webglResourceRepository.setUniformValue(shaderProgram!, ShaderSemantics.ViewMatrix.str, true, viewMatrix);
          this.__webglResourceRepository.setUniformValue(shaderProgram!, ShaderSemantics.ProjectionMatrix.str, true, projectionMatrix);
        }
        gl.uniform1f(this.__materialSIDLocation, primitive.material!.materialSID);
        this.__webglResourceRepository.bindTexture2D(7, this.__dataTextureUid);

        this.__setupMaterialEveryFrame(primitive.material!, renderPass);

        const entity = meshComponent.entity;
        const meshRendererComponent = entity.getComponent(MeshRendererComponent) as MeshRendererComponent;

        // primitive.material!.setUniformValuesForOnlyTexturesAndWithUpdateFunc(true, {
        primitive.material!.setParemetersForGPU({
          material: primitive.material!, shaderProgram: WebGLStrategyFastestWebGL1.__shaderProgram, firstTime:true,
          args:{
            glw: glw,
            entity: entity,
            worldMatrix: entity.getSceneGraph().worldMatrixInner,
            normalMatrix: entity.getSceneGraph().normalMatrixInner,
            lightComponents: this.__lightComponents,
            renderPass: renderPass,
            primitive: primitive,
            diffuseCube: meshRendererComponent.diffuseCubeMap,
            specularCube: meshRendererComponent.specularCubeMap
        }});

        if (primitive.indicesAccessor) {
          glw.drawElementsInstanced(primitive.primitiveMode.index, primitive.indicesAccessor.elementCount, primitive.indicesAccessor.componentType.index, 0, mesh.instanceCountIncludeOriginal);
        } else {
          glw.drawArraysInstanced(primitive.primitiveMode.index, 0, primitive.getVertexCountAsVerticesBased(), mesh.instanceCountIncludeOriginal);
        }

        this.__lastShader = shaderProgramUid;
      }
    }
    const shaderProgram = WebGLStrategyFastestWebGL1.__shaderProgram;
    this.__webglResourceRepository.setUniformValue(shaderProgram!, ShaderSemantics.ViewMatrix.str, true, viewMatrix);
    this.__webglResourceRepository.setUniformValue(shaderProgram!, ShaderSemantics.ProjectionMatrix.str, true, projectionMatrix);

    return false;
  }

}

